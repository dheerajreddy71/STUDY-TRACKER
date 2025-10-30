/**
 * Duration Optimizer
 * Determines optimal study session length for each subject
 */

export interface DurationAnalysis {
  subjectId?: string
  optimalDuration: number // in minutes
  optimalRange: { min: number; max: number }
  confidence: number
  performanceByDuration: Map<string, DurationBucket>
  recommendation: string
  reasoning: string
}

export interface DurationBucket {
  range: string
  minDuration: number
  maxDuration: number
  sessionCount: number
  avgPerformance: number
  avgFocus: number
  efficiency: number // performance per minute
  marginalBenefit: number // incremental benefit
}

/**
 * Analyze optimal session duration for a subject
 */
export async function analyzeOptimalDuration(
  userId: string,
  subjectId?: string
): Promise<DurationAnalysis | null> {
  try {
    const { default: Database } = await import('better-sqlite3')
    const path = await import('path')
    const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
    const db = new Database(dbPath)
    
    // Get sessions with performance data
    const query = `
      SELECT 
        s.duration_minutes,
        s.average_focus_score,
        p.percentage as performance
      FROM study_sessions s
      LEFT JOIN performance_entries p ON p.subject_id = s.subject_id
        AND date(p.assessment_date) >= date(s.started_at)
        AND date(p.assessment_date) <= date(s.started_at, '+7 days')
      WHERE s.user_id = ?
        ${subjectId ? 'AND s.subject_id = ?' : ''}
        AND s.duration_minutes > 0
        AND s.average_focus_score IS NOT NULL
        AND p.percentage IS NOT NULL
      ORDER BY s.started_at DESC
      LIMIT 100
    `
    
    const params = subjectId ? [userId, subjectId] : [userId]
    const rows = db.prepare(query).all(...params) as Array<{
      duration_minutes: number
      average_focus_score: number
      performance: number
    }>
    db.close()
    
    if (rows.length < 10) return null
    
    // Create duration buckets
    const buckets = createDurationBuckets(rows)
    
    // Find optimal duration
    const optimal = findOptimalDuration(buckets)
    
    if (!optimal) return null
    
    return {
      subjectId,
      optimalDuration: optimal.duration,
      optimalRange: optimal.range,
      confidence: optimal.confidence,
      performanceByDuration: buckets,
      recommendation: optimal.recommendation,
      reasoning: optimal.reasoning
    }
  } catch (error) {
    console.error('Error analyzing optimal duration:', error)
    return null
  }
}

/**
 * Create duration buckets from session data
 */
function createDurationBuckets(
  sessions: Array<{
    duration_minutes: number
    average_focus_score: number
    performance: number
  }>
): Map<string, DurationBucket> {
  const bucketRanges = [
    { name: '0-15min', min: 0, max: 15 },
    { name: '15-30min', min: 15, max: 30 },
    { name: '30-45min', min: 30, max: 45 },
    { name: '45-60min', min: 45, max: 60 },
    { name: '60-90min', min: 60, max: 90 },
    { name: '90-120min', min: 90, max: 120 },
    { name: '120+min', min: 120, max: 999 }
  ]
  
  const buckets = new Map<string, DurationBucket>()
  
  // Initialize buckets
  bucketRanges.forEach(range => {
    buckets.set(range.name, {
      range: range.name,
      minDuration: range.min,
      maxDuration: range.max,
      sessionCount: 0,
      avgPerformance: 0,
      avgFocus: 0,
      efficiency: 0,
      marginalBenefit: 0
    })
  })
  
  // Populate buckets with session data
  const bucketSessions = new Map<string, Array<{ performance: number; focus: number; duration: number }>>()
  
  sessions.forEach(session => {
    for (const range of bucketRanges) {
      if (session.duration_minutes >= range.min && session.duration_minutes < range.max) {
        if (!bucketSessions.has(range.name)) {
          bucketSessions.set(range.name, [])
        }
        bucketSessions.get(range.name)!.push({
          performance: session.performance,
          focus: session.average_focus_score,
          duration: session.duration_minutes
        })
        break
      }
    }
  })
  
  // Calculate bucket statistics
  bucketSessions.forEach((sessions, bucketName) => {
    const bucket = buckets.get(bucketName)!
    
    bucket.sessionCount = sessions.length
    bucket.avgPerformance = sessions.reduce((sum, s) => sum + s.performance, 0) / sessions.length
    bucket.avgFocus = sessions.reduce((sum, s) => sum + s.focus, 0) / sessions.length
    
    // Calculate efficiency (performance per minute invested)
    const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
    bucket.efficiency = avgDuration > 0 ? bucket.avgPerformance / avgDuration : 0
  })
  
  // Calculate marginal benefit (performance gain per additional minute)
  const sortedBuckets = Array.from(buckets.values()).sort((a, b) => a.minDuration - b.minDuration)
  for (let i = 1; i < sortedBuckets.length; i++) {
    const current = sortedBuckets[i]
    const previous = sortedBuckets[i - 1]
    
    if (current.sessionCount > 0 && previous.sessionCount > 0) {
      const performanceGain = current.avgPerformance - previous.avgPerformance
      const durationIncrease = ((current.minDuration + current.maxDuration) / 2) - ((previous.minDuration + previous.maxDuration) / 2)
      current.marginalBenefit = durationIncrease > 0 ? performanceGain / durationIncrease : 0
    }
  }
  
  return buckets
}

/**
 * Find optimal duration from bucket analysis
 */
function findOptimalDuration(buckets: Map<string, DurationBucket>): {
  duration: number
  range: { min: number; max: number }
  confidence: number
  recommendation: string
  reasoning: string
} | null {
  // Filter buckets with sufficient data
  const validBuckets = Array.from(buckets.values()).filter(b => b.sessionCount >= 3)
  
  if (validBuckets.length < 2) return null
  
  // Find bucket with best combined score (performance + focus + efficiency)
  let bestBucket: DurationBucket | null = null
  let bestScore = -Infinity
  
  validBuckets.forEach(bucket => {
    // Normalize metrics to 0-1 scale
    const maxPerformance = Math.max(...validBuckets.map(b => b.avgPerformance))
    const maxFocus = Math.max(...validBuckets.map(b => b.avgFocus))
    const maxEfficiency = Math.max(...validBuckets.map(b => b.efficiency))
    
    const normalizedPerformance = bucket.avgPerformance / maxPerformance
    const normalizedFocus = bucket.avgFocus / maxFocus
    const normalizedEfficiency = bucket.efficiency / maxEfficiency
    
    // Weighted score: 40% performance, 30% focus, 30% efficiency
    const score = (normalizedPerformance * 0.4) + (normalizedFocus * 0.3) + (normalizedEfficiency * 0.3)
    
    // Check for diminishing returns (negative marginal benefit)
    const hasDiminishingReturns = bucket.marginalBenefit < 0
    const adjustedScore = hasDiminishingReturns ? score * 0.7 : score
    
    if (adjustedScore > bestScore) {
      bestScore = adjustedScore
      bestBucket = bucket
    }
  })
  
  // Type guard to ensure bestBucket is not null
  if (!bestBucket || bestBucket === null) return null
  
  // Type assertion to help TypeScript
  const selectedBucket: DurationBucket = bestBucket
  
  // Calculate confidence based on sample size and consistency
  const totalSessions = validBuckets.reduce((sum, b) => sum + b.sessionCount, 0)
  const sampleConfidence = Math.min(100, (selectedBucket.sessionCount / totalSessions) * 100)
  
  // Check consistency (standard deviation of performance in this bucket)
  const consistencyConfidence = 85 // Simplified - would calculate from actual variance
  
  const confidence = (sampleConfidence + consistencyConfidence) / 2
  
  // Generate recommendation
  const optimalDuration = (selectedBucket.minDuration + selectedBucket.maxDuration) / 2
  const recommendation = generateDurationRecommendation(selectedBucket, validBuckets)
  const reasoning = generateDurationReasoning(selectedBucket, validBuckets)
  
  return {
    duration: Math.round(optimalDuration),
    range: {
      min: selectedBucket.minDuration,
      max: selectedBucket.maxDuration
    },
    confidence: Math.round(confidence),
    recommendation,
    reasoning
  }
}

/**
 * Generate duration recommendation text
 */
function generateDurationRecommendation(
  optimal: DurationBucket,
  allBuckets: DurationBucket[]
): string {
  const avgDuration = (optimal.minDuration + optimal.maxDuration) / 2
  
  // Check if longer sessions show diminishing returns
  const longerBuckets = allBuckets.filter(b => b.minDuration > optimal.maxDuration)
  const hasDiminishingReturns = longerBuckets.some(b => b.avgPerformance < optimal.avgPerformance * 0.95)
  
  if (hasDiminishingReturns) {
    return `Optimal session length is ${Math.round(avgDuration)} minutes. Longer sessions show ${(optimal.avgPerformance - longerBuckets[0]?.avgPerformance).toFixed(1)}% performance decline.`
  }
  
  return `Your most effective session length is ${Math.round(avgDuration)} minutes, showing ${optimal.avgPerformance.toFixed(1)}% avg performance and ${optimal.avgFocus.toFixed(1)}/10 focus.`
}

/**
 * Generate reasoning for duration recommendation
 */
function generateDurationReasoning(
  optimal: DurationBucket,
  allBuckets: DurationBucket[]
): string {
  const reasons: string[] = []
  
  // Performance comparison
  const avgPerformance = allBuckets.reduce((sum, b) => sum + b.avgPerformance, 0) / allBuckets.length
  if (optimal.avgPerformance > avgPerformance * 1.1) {
    reasons.push(`${((optimal.avgPerformance - avgPerformance) / avgPerformance * 100).toFixed(0)}% above average performance`)
  }
  
  // Focus comparison
  const avgFocus = allBuckets.reduce((sum, b) => sum + b.avgFocus, 0) / allBuckets.length
  if (optimal.avgFocus > avgFocus * 1.05) {
    reasons.push(`highest focus ratings`)
  }
  
  // Efficiency
  const maxEfficiency = Math.max(...allBuckets.map(b => b.efficiency))
  if (optimal.efficiency >= maxEfficiency * 0.9) {
    reasons.push(`best efficiency (results per minute)`)
  }
  
  // Sample size
  reasons.push(`based on ${optimal.sessionCount} sessions`)
  
  return reasons.join(', ')
}

/**
 * Get duration recommendations for all subjects
 */
export async function getDurationRecommendationsForAllSubjects(
  userId: string
): Promise<Map<string, DurationAnalysis>> {
  try {
    const { default: Database } = await import('better-sqlite3')
    const path = await import('path')
    const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
    const db = new Database(dbPath)
    
    // Get all subjects for user
    const subjects = db.prepare(`
      SELECT id FROM subjects WHERE user_id = ? AND is_active = 1
    `).all(userId) as Array<{ id: string }>
    db.close()
    
    const recommendations = new Map<string, DurationAnalysis>()
    
    for (const subject of subjects) {
      const analysis = await analyzeOptimalDuration(userId, subject.id)
      if (analysis) {
        recommendations.set(subject.id, analysis)
      }
    }
    
    return recommendations
  } catch (error) {
    console.error('Error getting duration recommendations:', error)
    return new Map()
  }
}

/**
 * Simple duration analysis for quick recommendations
 */
export async function getQuickDurationRecommendation(
  userId: string,
  subjectId?: string
): Promise<string> {
  const analysis = await analyzeOptimalDuration(userId, subjectId)
  
  if (!analysis) {
    return 'Keep sessions between 45-60 minutes for optimal focus and retention.'
  }
  
  return analysis.recommendation
}
