/**
 * Learning Style Classifier
 * Uses K-Means clustering and behavioral analysis to identify learning preferences
 */

export interface LearningProfile {
  id: string
  userId: string
  dominantStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | 'multimodal'
  styleScores: {
    visual: number
    auditory: number
    kinesthetic: number
    reading_writing: number
  }
  preferredStudyMethods: string[]
  optimalSessionDuration: number
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  concentrationPattern: 'sprint' | 'marathon' | 'steady'
  confidence: number
  lastUpdated: string
  recommendations: string[]
}

export interface BehaviorCluster {
  centroid: number[]
  members: any[]
  label: string
  characteristics: string[]
}

/**
 * Calculate Euclidean distance between two points
 */
function euclideanDistance(point1: number[], point2: number[]): number {
  return Math.sqrt(
    point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
  )
}

/**
 * K-Means clustering algorithm
 */
function kMeansClustering(
  data: number[][],
  k: number = 3,
  maxIterations: number = 100
): BehaviorCluster[] {
  if (data.length < k) {
    return []
  }
  
  const dimensions = data[0].length
  
  // Initialize centroids randomly from data points
  let centroids = data
    .sort(() => Math.random() - 0.5)
    .slice(0, k)
    .map(point => [...point])
  
  let assignments: number[] = new Array(data.length).fill(0)
  let iterations = 0
  let changed = true
  
  while (changed && iterations < maxIterations) {
    changed = false
    iterations++
    
    // Assign each point to nearest centroid
    data.forEach((point, idx) => {
      const distances = centroids.map(centroid => euclideanDistance(point, centroid))
      const newAssignment = distances.indexOf(Math.min(...distances))
      
      if (newAssignment !== assignments[idx]) {
        assignments[idx] = newAssignment
        changed = true
      }
    })
    
    // Update centroids
    for (let i = 0; i < k; i++) {
      const clusterPoints = data.filter((_, idx) => assignments[idx] === i)
      
      if (clusterPoints.length > 0) {
        centroids[i] = Array(dimensions)
          .fill(0)
          .map((_, dim) => 
            clusterPoints.reduce((sum, point) => sum + point[dim], 0) / clusterPoints.length
          )
      }
    }
  }
  
  // Create clusters
  const clusters: BehaviorCluster[] = []
  
  for (let i = 0; i < k; i++) {
    const members = data
      .map((point, idx) => ({ point, originalIndex: idx }))
      .filter((_, idx) => assignments[idx] === i)
    
    clusters.push({
      centroid: centroids[i],
      members,
      label: `Cluster ${i + 1}`,
      characteristics: []
    })
  }
  
  return clusters
}

/**
 * Analyze study method preferences
 */
async function analyzeMethodPreferences(userId: string): Promise<{
  visual: number
  auditory: number
  kinesthetic: number
  reading_writing: number
}> {
  // Using Supabase PostgreSQL
  // Path not needed for Supabase
  // Database path not needed
  const { db } = await import("@/lib/db-supabase")
  
  // Get study sessions with methods
  const sessions = await db.prepare(`
    SELECT 
      study_method,
      focus_rating,
      duration_minutes,
      COUNT(*) as session_count
    FROM study_sessions
    WHERE user_id = ? AND focus_rating IS NOT NULL
    GROUP BY study_method
  `).all(userId) as Array<{
    study_method: string
    focus_rating: number
    duration_minutes: number
    session_count: number
  }>
  
  // Get performance linked to methods
  const methodPerformance = await db.prepare(`
    SELECT 
      ss.study_method,
      AVG(pe.percentage) as avg_performance,
      COUNT(*) as count
    FROM study_sessions ss
    JOIN performance_entries pe ON pe.subject_id = ss.subject_id
      AND date(pe.assessment_date) BETWEEN date(ss.started_at) AND date(ss.started_at, '+7 days')
    WHERE ss.user_id = ?
    GROUP BY ss.study_method
  `).all(userId) as Array<{
    study_method: string
    avg_performance: number
    count: number
  }>
  
  // No need to close Supabase connection
  
  const scores = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
    reading_writing: 0
  }
  
  // Method categorization
  const methodCategories: Record<string, keyof typeof scores> = {
    'watching_videos': 'visual',
    'diagrams': 'visual',
    'flashcards': 'visual',
    'mind_maps': 'visual',
    'lectures': 'auditory',
    'discussions': 'auditory',
    'podcasts': 'auditory',
    'reading_aloud': 'auditory',
    'practice_problems': 'kinesthetic',
    'lab_work': 'kinesthetic',
    'experiments': 'kinesthetic',
    'hands_on': 'kinesthetic',
    'reading': 'reading_writing',
    'note_taking': 'reading_writing',
    'essays': 'reading_writing',
    'summaries': 'reading_writing'
  }
  
  // Score based on usage frequency and effectiveness
  sessions.forEach(session => {
    const category = methodCategories[session.study_method]
    if (category) {
      // Weight: frequency (40%) + focus (30%) + duration (30%)
      const frequencyScore = (session.session_count / sessions.length) * 40
      const focusScore = (session.focus_rating / 10) * 30
      const durationScore = Math.min((session.duration_minutes / 60) * 30, 30)
      
      scores[category] += frequencyScore + focusScore + durationScore
    }
  })
  
  // Add performance boost
  methodPerformance.forEach(mp => {
    const category = methodCategories[mp.study_method]
    if (category && mp.avg_performance) {
      scores[category] += (mp.avg_performance / 100) * 20
    }
  })
  
  // Normalize to 100
  const total = Object.values(scores).reduce((sum, val) => sum + val, 0)
  if (total > 0) {
    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = (scores[key as keyof typeof scores] / total) * 100
    })
  }
  
  return scores
}

/**
 * Analyze optimal study duration pattern
 */
async function analyzeConcentrationPattern(userId: string): Promise<{
  pattern: 'sprint' | 'marathon' | 'steady'
  optimalDuration: number
}> {
  // Using Supabase PostgreSQL
  // Path not needed for Supabase
  // Database path not needed
  const { db } = await import("@/lib/db-supabase")
  
  const sessions = await db.prepare(`
    SELECT 
      duration_minutes,
      focus_rating,
      breaks_taken
    FROM study_sessions
    WHERE user_id = ? AND focus_rating IS NOT NULL
    ORDER BY started_at DESC
    LIMIT 50
  `).all(userId) as Array<{
    duration_minutes: number
    focus_rating: number
    breaks_taken: number
  }>
  
  // No need to close Supabase connection
  
  if (sessions.length < 5) {
    return { pattern: 'steady', optimalDuration: 45 }
  }
  
  // Categorize sessions
  const shortSessions = sessions.filter(s => s.duration_minutes <= 30)
  const mediumSessions = sessions.filter(s => s.duration_minutes > 30 && s.duration_minutes <= 60)
  const longSessions = sessions.filter(s => s.duration_minutes > 60)
  
  const avgFocusShort = shortSessions.reduce((sum, s) => sum + s.focus_rating, 0) / (shortSessions.length || 1)
  const avgFocusMedium = mediumSessions.reduce((sum, s) => sum + s.focus_rating, 0) / (mediumSessions.length || 1)
  const avgFocusLong = longSessions.reduce((sum, s) => sum + s.focus_rating, 0) / (longSessions.length || 1)
  
  // Determine pattern
  let pattern: 'sprint' | 'marathon' | 'steady'
  let optimalDuration: number
  
  if (avgFocusShort > avgFocusMedium && avgFocusShort > avgFocusLong) {
    pattern = 'sprint'
    optimalDuration = 25
  } else if (avgFocusLong > avgFocusMedium && longSessions.length >= 5) {
    pattern = 'marathon'
    optimalDuration = 90
  } else {
    pattern = 'steady'
    optimalDuration = 45
  }
  
  return { pattern, optimalDuration }
}

/**
 * Analyze best time of day for studying
 */
async function analyzeBestTimeOfDay(userId: string): Promise<'morning' | 'afternoon' | 'evening' | 'night'> {
  // Using Supabase PostgreSQL
  // Path not needed for Supabase
  // Database path not needed
  const { db } = await import("@/lib/db-supabase")
  
  const sessions = await db.prepare(`
    SELECT 
      strftime('%H', started_at) as hour,
      focus_rating,
      COUNT(*) as count
    FROM study_sessions
    WHERE user_id = ? AND focus_rating IS NOT NULL
    GROUP BY hour
  `).all(userId) as Array<{
    hour: string
    focus_rating: number
    count: number
  }>
  
  // No need to close Supabase connection
  
  if (sessions.length === 0) {
    return 'morning'
  }
  
  // Group by time of day
  const timeGroups = {
    morning: { totalFocus: 0, count: 0 }, // 6-12
    afternoon: { totalFocus: 0, count: 0 }, // 12-17
    evening: { totalFocus: 0, count: 0 }, // 17-22
    night: { totalFocus: 0, count: 0 } // 22-6
  }
  
  sessions.forEach(s => {
    const hour = parseInt(s.hour)
    let group: keyof typeof timeGroups
    
    if (hour >= 6 && hour < 12) group = 'morning'
    else if (hour >= 12 && hour < 17) group = 'afternoon'
    else if (hour >= 17 && hour < 22) group = 'evening'
    else group = 'night'
    
    timeGroups[group].totalFocus += s.focus_rating * s.count
    timeGroups[group].count += s.count
  })
  
  // Find best time
  let bestTime: keyof typeof timeGroups = 'morning'
  let bestAverage = 0
  
  Object.entries(timeGroups).forEach(([time, data]) => {
    if (data.count > 0) {
      const avg = data.totalFocus / data.count
      if (avg > bestAverage) {
        bestAverage = avg
        bestTime = time as keyof typeof timeGroups
      }
    }
  })
  
  return bestTime
}

/**
 * Generate learning profile
 */
export async function generateLearningProfile(userId: string): Promise<LearningProfile> {
  const [methodScores, concentrationData, bestTime] = await Promise.all([
    analyzeMethodPreferences(userId),
    analyzeConcentrationPattern(userId),
    analyzeBestTimeOfDay(userId)
  ])
  
  // Determine dominant style
  const entries = Object.entries(methodScores) as Array<[keyof typeof methodScores, number]>
  const [dominantStyle, dominantScore] = entries.reduce((max, entry) => 
    entry[1] > max[1] ? entry : max
  )
  
  // Check if multimodal (no clear dominant style)
  const isMultimodal = entries.filter(([_, score]) => score > 20).length >= 3
  
  // Preferred methods
  const preferredMethods: string[] = []
  if (methodScores.visual > 25) preferredMethods.push('visual aids', 'diagrams', 'videos')
  if (methodScores.auditory > 25) preferredMethods.push('lectures', 'discussions', 'audio materials')
  if (methodScores.kinesthetic > 25) preferredMethods.push('practice problems', 'hands-on activities')
  if (methodScores.reading_writing > 25) preferredMethods.push('reading', 'note-taking', 'writing summaries')
  
  // Generate recommendations
  const recommendations: string[] = []
  
  if (isMultimodal) {
    recommendations.push('You learn effectively through multiple modalities - continue using varied approaches')
  } else {
    recommendations.push(`Focus on ${dominantStyle.replace('_', ' ')} learning methods for optimal retention`)
  }
  
  if (concentrationData.pattern === 'sprint') {
    recommendations.push('Short, focused sessions (20-30 min) work best for you - use Pomodoro technique')
  } else if (concentrationData.pattern === 'marathon') {
    recommendations.push('You thrive in longer sessions (60-90 min) - ensure proper breaks to sustain focus')
  } else {
    recommendations.push('Moderate sessions (45-60 min) align with your concentration pattern')
  }
  
  recommendations.push(`Schedule important study sessions in the ${bestTime} when your focus peaks`)
  
  // Calculate confidence based on data volume
  // Using Supabase PostgreSQL
  // Path not needed for Supabase
  // Database path not needed
  const { db } = await import("@/lib/db-supabase")
  
  const sessionCount = await db.prepare(`
    SELECT COUNT(*) as count
    FROM study_sessions
    WHERE user_id = ? AND focus_rating IS NOT NULL
  `).get(userId) as { count: number }
  
  // No need to close Supabase connection
  
  const confidence = Math.min(100, (sessionCount.count / 20) * 100)
  
  const profile: LearningProfile = {
    id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
    userId,
    dominantStyle: isMultimodal ? 'multimodal' : dominantStyle,
    styleScores: methodScores,
    preferredStudyMethods: preferredMethods,
    optimalSessionDuration: concentrationData.optimalDuration,
    bestTimeOfDay: bestTime,
    concentrationPattern: concentrationData.pattern,
    confidence,
    lastUpdated: new Date().toISOString(),
    recommendations
  }
  
  // Store profile
  await storeLearningProfile(profile)
  
  return profile
}

/**
 * Store learning profile in database
 */
async function storeLearningProfile(profile: LearningProfile): Promise<void> {
  // Using Supabase PostgreSQL
  // Path not needed for Supabase
  // Database path not needed
  const { db } = await import("@/lib/db-supabase")
  
  const stmt = await db.prepare(`
    INSERT OR REPLACE INTO learning_profiles (
      id, user_id, dominant_style, style_scores,
      preferred_methods, optimal_duration, best_time_of_day,
      concentration_pattern, confidence_score,
      recommendations, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `)
  
  stmt.run(
    profile.id,
    profile.userId,
    profile.dominantStyle,
    JSON.stringify(profile.styleScores),
    JSON.stringify(profile.preferredStudyMethods),
    profile.optimalSessionDuration,
    profile.bestTimeOfDay,
    profile.concentrationPattern,
    profile.confidence,
    JSON.stringify(profile.recommendations)
  )
  
  // No need to close Supabase connection
}

/**
 * Get existing learning profile
 */
export async function getLearningProfile(userId: string): Promise<LearningProfile | null> {
  // Using Supabase PostgreSQL
  // Path not needed for Supabase
  // Database path not needed
  const { db } = await import("@/lib/db-supabase")
  
  const row = await db.prepare(`
    SELECT * FROM learning_profiles
    WHERE user_id = ?
    ORDER BY updated_at DESC
    LIMIT 1
  `).get(userId) as any
  
  // No need to close Supabase connection
  
  if (!row) return null
  
  return {
    id: row.id,
    userId: row.user_id,
    dominantStyle: row.dominant_style,
    styleScores: JSON.parse(row.style_scores),
    preferredStudyMethods: JSON.parse(row.preferred_methods),
    optimalSessionDuration: row.optimal_duration,
    bestTimeOfDay: row.best_time_of_day,
    concentrationPattern: row.concentration_pattern,
    confidence: row.confidence_score,
    lastUpdated: row.updated_at,
    recommendations: JSON.parse(row.recommendations)
  }
}

/**
 * Get method-specific recommendations
 */
export function getMethodRecommendations(profile: LearningProfile): Array<{
  category: string
  suggestions: string[]
}> {
  const recommendations: Array<{ category: string; suggestions: string[] }> = []
  
  const { styleScores } = profile
  
  if (styleScores.visual > 20) {
    recommendations.push({
      category: 'Visual Learning',
      suggestions: [
        'Use color-coded notes and highlighting',
        'Create mind maps and concept diagrams',
        'Watch educational videos and animations',
        'Use flashcards with images',
        'Draw diagrams to explain concepts'
      ]
    })
  }
  
  if (styleScores.auditory > 20) {
    recommendations.push({
      category: 'Auditory Learning',
      suggestions: [
        'Listen to lectures and podcasts',
        'Discuss topics with study groups',
        'Read notes aloud',
        'Use mnemonic devices and rhymes',
        'Record and replay your explanations'
      ]
    })
  }
  
  if (styleScores.kinesthetic > 20) {
    recommendations.push({
      category: 'Kinesthetic Learning',
      suggestions: [
        'Solve practice problems actively',
        'Create physical models or demonstrations',
        'Take breaks for movement',
        'Use hands-on experiments',
        'Study while walking or standing'
      ]
    })
  }
  
  if (styleScores.reading_writing > 20) {
    recommendations.push({
      category: 'Reading/Writing Learning',
      suggestions: [
        'Take detailed written notes',
        'Rewrite notes in your own words',
        'Create written summaries',
        'Make lists and outlines',
        'Write practice essays'
      ]
    })
  }
  
  return recommendations
}

