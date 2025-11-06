/**
 * Burnout Detector
 * Identifies early warning signs of academic burnout
 */

export interface BurnoutAssessment {
  userId: string
  assessmentDate: string
  totalScore: number // 0-100
  severity: 'none' | 'mild' | 'moderate' | 'high' | 'critical'
  indicators: BurnoutIndicator[]
  recommendations: string[]
  needsIntervention: boolean
}

export interface BurnoutIndicator {
  name: string
  category: 'focus' | 'performance' | 'avoidance' | 'emotional' | 'extreme_behavior'
  score: number // 0-25/30/20/15/10 based on weight
  maxScore: number
  severity: 'low' | 'medium' | 'high'
  description: string
  detected: boolean
}

/**
 * Assess burnout risk for a user
 */
export async function assessBurnoutRisk(userId: string): Promise<BurnoutAssessment> {
  const [
    focusDecline,
    performanceEffortMismatch,
    avoidanceBehavior,
    emotionalIndicators,
    extremeBehaviors
  ] = await Promise.all([
    assessFocusDecline(userId),
    assessPerformanceEffortMismatch(userId),
    assessAvoidanceBehavior(userId),
    assessEmotionalIndicators(userId),
    assessExtremeBehaviors(userId)
  ])
  
  const indicators = [
    focusDecline,
    performanceEffortMismatch,
    avoidanceBehavior,
    emotionalIndicators,
    extremeBehaviors
  ]
  
  const totalScore = indicators.reduce((sum, indicator) => sum + indicator.score, 0)
  const severity = classifyBurnoutSeverity(totalScore)
  const needsIntervention = totalScore >= 60
  const recommendations = generateBurnoutRecommendations(indicators, severity)
  
  // Store assessment in database
  await storeBurnoutAssessment(userId, totalScore, severity, indicators, recommendations)
  
  return {
    userId,
    assessmentDate: new Date().toISOString(),
    totalScore,
    severity,
    indicators,
    recommendations,
    needsIntervention
  }
}

/**
 * Assess focus rating decline (Weight: 25%)
 */
async function assessFocusDecline(userId: string): Promise<BurnoutIndicator> {
  try {
    // Using Supabase PostgreSQL
    // Path not needed for Supabase
    // Database path not needed
    const { db } = await import("@/lib/db-supabase")
    
    // Get baseline (first month average)
    const baseline = await db.prepare(`
      SELECT AVG(average_focus_score) as avg_focus
      FROM study_sessions
      WHERE user_id = ?
        AND started_at >= date('now', '-60 days')
        AND started_at < date('now', '-30 days')
        AND average_focus_score IS NOT NULL
    `).get(userId) as { avg_focus: number } | undefined
    
    // Get recent (last 2 weeks)
    const recent = await db.prepare(`
      SELECT AVG(average_focus_score) as avg_focus
      FROM study_sessions
      WHERE user_id = ?
        AND started_at >= date('now', '-14 days')
        AND average_focus_score IS NOT NULL
    `).get(userId) as { avg_focus: number } | undefined
    
    // No need to close Supabase connection
    
    if (!baseline?.avg_focus || !recent?.avg_focus) {
      return {
        name: 'Focus Rating Decline',
        category: 'focus',
        score: 0,
        maxScore: 25,
        severity: 'low',
        description: 'Insufficient data to assess focus trends',
        detected: false
      }
    }
    
    // Protect against division by zero
    if (!baseline.avg_focus || baseline.avg_focus === 0) {
      return {
        name: 'Focus Rating Decline',
        category: 'focus',
        score: 0,
        maxScore: 25,
        severity: 'low',
        description: 'Baseline focus data insufficient',
        detected: false
      }
    }
    
    const decline = ((baseline.avg_focus - recent.avg_focus) / baseline.avg_focus) * 100
    const score = Math.min(25, Math.max(0, decline * 1.2)) // Scale to 0-25
    
    const detected = decline > 15
    const severity = decline > 25 ? 'high' : decline > 15 ? 'medium' : 'low'
    
    return {
      name: 'Focus Rating Decline',
      category: 'focus',
      score: Math.round(score),
      maxScore: 25,
      severity,
      description: detected 
        ? `Focus ratings declined ${decline.toFixed(1)}% from baseline ${baseline.avg_focus.toFixed(1)} to ${recent.avg_focus.toFixed(1)}`
        : `Focus ratings stable at ${recent.avg_focus.toFixed(1)}/10`,
      detected
    }
  } catch (error) {
    return {
      name: 'Focus Rating Decline',
      category: 'focus',
      score: 0,
      maxScore: 25,
      severity: 'low',
      description: 'Error assessing focus trends',
      detected: false
    }
  }
}

/**
 * Assess performance-effort mismatch (Weight: 30%)
 */
async function assessPerformanceEffortMismatch(userId: string): Promise<BurnoutIndicator> {
  try {
    // Using Supabase PostgreSQL
    // Path not needed for Supabase
    // Database path not needed
    const { db } = await import("@/lib/db-supabase")
    
    // Get study hours trend
    const hoursData = await db.prepare(`
      SELECT 
        CASE 
          WHEN started_at >= date('now', '-14 days') THEN 'recent'
          ELSE 'previous'
        END as period,
        SUM(duration_minutes) / 60.0 as total_hours
      FROM study_sessions
      WHERE user_id = ?
        AND started_at >= date('now', '-28 days')
      GROUP BY period
    `).all(userId) as Array<{ period: string; total_hours: number }>
    
    // Get performance trend
    const perfData = await db.prepare(`
      SELECT 
        CASE 
          WHEN assessment_date >= date('now', '-14 days') THEN 'recent'
          ELSE 'previous'
        END as period,
        AVG(percentage) as avg_score
      FROM performance_entries
      WHERE user_id = ?
        AND assessment_date >= date('now', '-28 days')
      GROUP BY period
    `).all(userId) as Array<{ period: string; avg_score: number }>
    
    // No need to close Supabase connection
    
    const recentHours = hoursData.find(d => d.period === 'recent')?.total_hours || 0
    const previousHours = hoursData.find(d => d.period === 'previous')?.total_hours || 0
    const recentPerf = perfData.find(d => d.period === 'recent')?.avg_score || 0
    const previousPerf = perfData.find(d => d.period === 'previous')?.avg_score || 0
    
    if (previousHours === 0 || previousPerf === 0) {
      return {
        name: 'Performance-Effort Mismatch',
        category: 'performance',
        score: 0,
        maxScore: 30,
        severity: 'low',
        description: 'Insufficient data to assess effort-performance relationship',
        detected: false
      }
    }
    
    const hoursChange = ((recentHours - previousHours) / previousHours) * 100
    const perfChange = ((recentPerf - previousPerf) / previousPerf) * 100
    
    // Mismatch: hours increasing but performance declining
    const mismatch = hoursChange > 20 && perfChange < -5
    const mismatchSeverity = Math.abs(perfChange) + (hoursChange / 2)
    
    const score = mismatch ? Math.min(30, mismatchSeverity) : 0
    const severity = score > 20 ? 'high' : score > 10 ? 'medium' : 'low'
    
    return {
      name: 'Performance-Effort Mismatch',
      category: 'performance',
      score: Math.round(score),
      maxScore: 30,
      severity,
      description: mismatch
        ? `Study hours increased ${hoursChange.toFixed(0)}% but performance declined ${Math.abs(perfChange).toFixed(1)}%`
        : `Effort and performance are aligned`,
      detected: mismatch
    }
  } catch (error) {
    return {
      name: 'Performance-Effort Mismatch',
      category: 'performance',
      score: 0,
      maxScore: 30,
      severity: 'low',
      description: 'Error assessing performance-effort relationship',
      detected: false
    }
  }
}

/**
 * Assess avoidance behavior (Weight: 20%)
 */
async function assessAvoidanceBehavior(userId: string): Promise<BurnoutIndicator> {
  try {
    // Using Supabase PostgreSQL
    // Path not needed for Supabase
    // Database path not needed
    const { db } = await import("@/lib/db-supabase")
    
    // Count sessions in recent vs previous period
    const sessionCounts = await db.prepare(`
      SELECT 
        CASE 
          WHEN started_at >= date('now', '-7 days') THEN 'recent'
          WHEN started_at >= date('now', '-14 days') THEN 'previous'
          ELSE 'baseline'
        END as period,
        COUNT(*) as session_count
      FROM study_sessions
      WHERE user_id = ?
        AND started_at >= date('now', '-30 days')
      GROUP BY period
    `).all(userId) as Array<{ period: string; session_count: number }>
    
    // No need to close Supabase connection
    
    const recentCount = sessionCounts.find(d => d.period === 'recent')?.session_count || 0
    const previousCount = sessionCounts.find(d => d.period === 'previous')?.session_count || 0
    const baselineCount = sessionCounts.find(d => d.period === 'baseline')?.session_count || 0
    
    if (previousCount === 0) {
      return {
        name: 'Avoidance Behavior',
        category: 'avoidance',
        score: 0,
        maxScore: 20,
        severity: 'low',
        description: 'Insufficient session history',
        detected: false
      }
    }
    
    const dropPercent = ((previousCount - recentCount) / previousCount) * 100
    const detected = dropPercent > 40
    
    const score = Math.min(20, Math.max(0, dropPercent / 2))
    const severity = dropPercent > 60 ? 'high' : dropPercent > 40 ? 'medium' : 'low'
    
    return {
      name: 'Avoidance Behavior',
      category: 'avoidance',
      score: Math.round(score),
      maxScore: 20,
      severity,
      description: detected
        ? `Session frequency dropped ${dropPercent.toFixed(0)}% (${previousCount} → ${recentCount} sessions/week)`
        : `Session frequency stable at ${recentCount} sessions/week`,
      detected
    }
  } catch (error) {
    return {
      name: 'Avoidance Behavior',
      category: 'avoidance',
      score: 0,
      maxScore: 20,
      severity: 'low',
      description: 'Error assessing session frequency',
      detected: false
    }
  }
}

/**
 * Assess emotional indicators (Weight: 15%)
 */
async function assessEmotionalIndicators(userId: string): Promise<BurnoutIndicator> {
  try {
    // Using Supabase PostgreSQL
    // Path not needed for Supabase
    // Database path not needed
    const { db } = await import("@/lib/db-supabase")
    
    // Check for negative language in recent session notes
    const recentSessions = await db.prepare(`
      SELECT session_notes, overall_notes
      FROM study_sessions
      WHERE user_id = ?
        AND started_at >= date('now', '-14 days')
        AND (session_notes IS NOT NULL OR overall_notes IS NOT NULL)
      LIMIT 20
    `).all(userId) as Array<{ session_notes?: string; overall_notes?: string }>
    
    // No need to close Supabase connection
    
    const negativeKeywords = [
      'exhausted', 'tired', 'can\'t focus', 'giving up', 'frustrated',
      'overwhelmed', 'stressed', 'anxious', 'burnout', 'quit', 'pointless'
    ]
    
    let negativeCount = 0
    recentSessions.forEach(session => {
      const text = ((session.session_notes || '') + ' ' + (session.overall_notes || '')).toLowerCase()
      if (negativeKeywords.some(keyword => text.includes(keyword))) {
        negativeCount++
      }
    })
    
    const negativePercent = recentSessions.length > 0 
      ? (negativeCount / recentSessions.length) * 100 
      : 0
    
    const detected = negativePercent > 30
    const score = Math.min(15, negativePercent / 2)
    const severity = negativePercent > 50 ? 'high' : negativePercent > 30 ? 'medium' : 'low'
    
    return {
      name: 'Emotional Indicators',
      category: 'emotional',
      score: Math.round(score),
      maxScore: 15,
      severity,
      description: detected
        ? `${negativePercent.toFixed(0)}% of recent sessions contain negative emotional indicators`
        : `No significant emotional distress detected`,
      detected
    }
  } catch (error) {
    return {
      name: 'Emotional Indicators',
      category: 'emotional',
      score: 0,
      maxScore: 15,
      severity: 'low',
      description: 'Error assessing emotional state',
      detected: false
    }
  }
}

/**
 * Assess extreme behaviors (Weight: 10%)
 */
async function assessExtremeBehaviors(userId: string): Promise<BurnoutIndicator> {
  try {
    // Using Supabase PostgreSQL
    // Path not needed for Supabase
    // Database path not needed
    const { db } = await import("@/lib/db-supabase")
    
    const behaviors = await db.prepare(`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN duration_minutes > 180 THEN 1 ELSE 0 END) as marathon_sessions,
        SUM(CASE WHEN CAST(strftime('%H', started_at) AS INTEGER) >= 23 
          OR CAST(strftime('%H', started_at) AS INTEGER) <= 4 THEN 1 ELSE 0 END) as late_night_sessions,
        SUM(duration_minutes) / 60.0 / 7.0 as avg_weekly_hours
      FROM study_sessions
      WHERE user_id = ?
        AND started_at >= date('now', '-7 days')
    `).get(userId) as {
      total_sessions: number
      marathon_sessions: number
      late_night_sessions: number
      avg_weekly_hours: number
    } | undefined
    
    // No need to close Supabase connection
    
    if (!behaviors || behaviors.total_sessions === 0) {
      return {
        name: 'Extreme Behaviors',
        category: 'extreme_behavior',
        score: 0,
        maxScore: 10,
        severity: 'low',
        description: 'No recent sessions to analyze',
        detected: false
      }
    }
    
    const issues: string[] = []
    let score = 0
    
    if (behaviors.marathon_sessions > 0) {
      issues.push(`${behaviors.marathon_sessions} sessions over 3 hours`)
      score += 3
    }
    
    if (behaviors.late_night_sessions > 2) {
      issues.push(`${behaviors.late_night_sessions} late-night sessions (11PM-4AM)`)
      score += 4
    }
    
    if (behaviors.avg_weekly_hours > 50) {
      issues.push(`unsustainable pace (${behaviors.avg_weekly_hours.toFixed(0)} hours/week)`)
      score += 3
    }
    
    const detected = score > 0
    const severity = score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low'
    
    return {
      name: 'Extreme Behaviors',
      category: 'extreme_behavior',
      score,
      maxScore: 10,
      severity,
      description: detected ? issues.join('; ') : 'No extreme study patterns detected',
      detected
    }
  } catch (error) {
    return {
      name: 'Extreme Behaviors',
      category: 'extreme_behavior',
      score: 0,
      maxScore: 10,
      severity: 'low',
      description: 'Error assessing study patterns',
      detected: false
    }
  }
}

/**
 * Classify burnout severity from total score
 */
function classifyBurnoutSeverity(totalScore: number): 'none' | 'mild' | 'moderate' | 'high' | 'critical' {
  if (totalScore >= 86) return 'critical'
  if (totalScore >= 76) return 'high'
  if (totalScore >= 61) return 'moderate'
  if (totalScore >= 41) return 'mild'
  return 'none'
}

/**
 * Generate burnout recommendations
 */
function generateBurnoutRecommendations(
  indicators: BurnoutIndicator[],
  severity: string
): string[] {
  const recommendations: string[] = []
  
  if (severity === 'critical' || severity === 'high') {
    recommendations.push('⚠️ URGENT: Take 2-3 complete rest days immediately')
    recommendations.push('Consider reducing your course load or seeking academic counseling')
  }
  
  if (severity === 'moderate' || severity === 'high') {
    recommendations.push('Reduce daily study hours by 40% for the next week')
    recommendations.push('Schedule at least one full rest day this week')
  }
  
  indicators.forEach(indicator => {
    if (!indicator.detected) return
    
    switch (indicator.category) {
      case 'focus':
        recommendations.push('Shorten session duration to 30-40 minutes with mandatory breaks')
        recommendations.push('Try changing study environment or time of day')
        break
      case 'performance':
        recommendations.push('Quality over quantity: Focus on shorter, more effective sessions')
        recommendations.push('Review your study methods - current approach isn\'t working')
        break
      case 'avoidance':
        recommendations.push('Start with just 15-minute sessions to rebuild study habit')
        recommendations.push('Focus on your favorite/easiest subject first')
        break
      case 'emotional':
        recommendations.push('Practice self-compassion - academic struggles are normal')
        recommendations.push('Consider talking to a counselor or trusted friend')
        break
      case 'extreme_behavior':
        recommendations.push('Stop studying after 9 PM - sleep is critical for retention')
        recommendations.push('Limit individual sessions to maximum 90 minutes')
        break
    }
  })
  
  // General wellness recommendations
  if (recommendations.length > 0) {
    recommendations.push('Prioritize 7-8 hours of sleep')
    recommendations.push('Include physical activity or walks between study sessions')
    recommendations.push('Connect with friends - social support prevents burnout')
  }
  
  return Array.from(new Set(recommendations)) // Remove duplicates
}

/**
 * Store burnout assessment in database
 */
async function storeBurnoutAssessment(
  userId: string,
  totalScore: number,
  severity: string,
  indicators: BurnoutIndicator[],
  recommendations: string[]
): Promise<void> {
  try {
    // Using Supabase PostgreSQL
    // Path not needed for Supabase
    // Database path not needed
    
    const { db } = await import("@/lib/db-supabase")
    
    const stmt = await db.prepare(`
      INSERT INTO burnout_assessments (
        id, user_id, assessment_date,
        focus_decline_score, performance_effort_mismatch_score,
        avoidance_behavior_score, emotional_indicator_score,
        extreme_behavior_score, total_burnout_score, severity_level,
        indicators_detected, recommendations
      ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    
    await stmt.run(
      id,
      userId,
      indicators.find(i => i.category === 'focus')?.score || 0,
      indicators.find(i => i.category === 'performance')?.score || 0,
      indicators.find(i => i.category === 'avoidance')?.score || 0,
      indicators.find(i => i.category === 'emotional')?.score || 0,
      indicators.find(i => i.category === 'extreme_behavior')?.score || 0,
      totalScore,
      severity,
      JSON.stringify(indicators),
      JSON.stringify(recommendations)
    )
    
    // No need to close Supabase connection
  } catch (error) {
    console.error('Error storing burnout assessment:', error)
  }
}

/**
 * Get burnout history for user
 */
export async function getBurnoutHistory(userId: string, days: number = 30): Promise<BurnoutAssessment[]> {
  try {
    // Using Supabase PostgreSQL
    // Path not needed for Supabase
    // Database path not needed
    const { db } = await import("@/lib/db-supabase")
    
    const rows = await db.prepare(`
      SELECT 
        user_id, assessment_date, total_burnout_score,
        severity_level, indicators_detected, recommendations
      FROM burnout_assessments
      WHERE user_id = ?
        AND assessment_date >= date('now', '-${days} days')
      ORDER BY assessment_date DESC
    `).all(userId) as Array<{
      user_id: string
      assessment_date: string
      total_burnout_score: number
      severity_level: string
      indicators_detected: string
      recommendations: string
    }>
    
    // No need to close Supabase connection
    
    return rows.map(row => ({
      userId: row.user_id,
      assessmentDate: row.assessment_date,
      totalScore: row.total_burnout_score,
      severity: row.severity_level as any,
      indicators: JSON.parse(row.indicators_detected),
      recommendations: JSON.parse(row.recommendations),
      needsIntervention: row.total_burnout_score >= 60
    }))
  } catch (error) {
    console.error('Error getting burnout history:', error)
    return []
  }
}

