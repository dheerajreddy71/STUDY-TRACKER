/**
 * Subject Attention Allocator
 * Determines optimal time distribution across subjects
 */

export interface SubjectAllocation {
  subjectId: string
  subjectName: string
  attentionNeedScore: number // 0-100
  recommendedWeeklyHours: number
  currentWeeklyHours: number
  gap: number // hours behind/ahead
  priority: 'critical' | 'high' | 'medium' | 'low'
  reasons: string[]
  nextDeadline?: string
  urgencyFactor: number
}

export interface AllocationPlan {
  totalAvailableHours: number
  allocations: SubjectAllocation[]
  weeklySchedule: Map<string, Array<{
    subjectId: string
    duration: number
    timeWindow: string
    reason: string
  }>>
}

/**
 * Calculate attention need score for a subject
 */
async function calculateAttentionNeed(
  userId: string,
  subjectId: string,
  subjectData: any
): Promise<{ score: number; reasons: string[] }> {
  // Using Supabase PostgreSQL
  // Path not needed for Supabase
  // Database path not needed
  const { db } = await import("@/lib/db-supabase")
  
  let score = 0
  const reasons: string[] = []
  
  // Factor 1: Days since last studied (max 20 points)
  const lastSession = await db.prepare(`
    SELECT MAX(started_at) as last_studied
    FROM study_sessions
    WHERE user_id = ? AND subject_id = ?
  `).get(userId, subjectId) as { last_studied: string } | undefined
  
  if (lastSession?.last_studied) {
    const daysSince = Math.floor(
      (Date.now() - new Date(lastSession.last_studied).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSince >= 7) {
      score += 20
      reasons.push(`Not studied in ${daysSince} days (urgency high)`)
    } else if (daysSince >= 4) {
      score += 12
      reasons.push(`Last studied ${daysSince} days ago`)
    } else if (daysSince >= 2) {
      score += 6
      reasons.push(`Last studied ${daysSince} days ago`)
    }
  } else {
    score += 15
    reasons.push('Never studied before')
  }
  
  // Factor 2: Performance gap (max 30 points)
  const currentPerf = subjectData.current_performance || 0
  const targetPerf = subjectData.target_performance || 85
  const perfGap = targetPerf - currentPerf
  
  if (perfGap > 20) {
    score += 30
    reasons.push(`${perfGap.toFixed(0)}% below target performance`)
  } else if (perfGap > 10) {
    score += 20
    reasons.push(`${perfGap.toFixed(0)}% below target`)
  } else if (perfGap > 5) {
    score += 10
    reasons.push(`${perfGap.toFixed(0)}% below target`)
  } else if (perfGap < -5) {
    score -= 10
    reasons.push('Exceeding target (maintenance mode)')
  }
  
  // Factor 3: Difficulty level (max 15 points)
  const difficulty = subjectData.difficulty_level
  if (difficulty === 'very_hard') {
    score += 15
    reasons.push('Very difficult subject needs more time')
  } else if (difficulty === 'hard') {
    score += 10
    reasons.push('Difficult subject')
  } else if (difficulty === 'easy') {
    score -= 5
  }
  
  // Factor 4: Upcoming deadline (max 25 points)
  const nextExam = subjectData.next_exam_date
  if (nextExam) {
    const daysUntilExam = Math.floor(
      (new Date(nextExam).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysUntilExam <= 7 && daysUntilExam >= 0) {
      score += 25
      reasons.push(`Exam in ${daysUntilExam} days - critical preparation`)
    } else if (daysUntilExam <= 14) {
      score += 18
      reasons.push(`Exam in ${daysUntilExam} days`)
    } else if (daysUntilExam <= 30) {
      score += 10
      reasons.push(`Exam in ${daysUntilExam} days`)
    }
  }
  
  // Factor 5: Forgetting risk from spaced repetition (max 10 points)
  const topicsAtRisk = await db.prepare(`
    SELECT COUNT(*) as count
    FROM spaced_repetition_items
    WHERE user_id = ? AND subject_id = ? AND status = 'active'
      AND date(next_review_date) <= date('now', '+3 days')
  `).get(userId, subjectId) as { count: number } | undefined
  
  if (topicsAtRisk && topicsAtRisk.count > 5) {
    score += 10
    reasons.push(`${topicsAtRisk.count} topics need review`)
  } else if (topicsAtRisk && topicsAtRisk.count > 0) {
    score += 5
    reasons.push(`${topicsAtRisk.count} topics need review`)
  }
  
  // No need to close Supabase connection
  
  return {
    score: Math.min(100, Math.max(0, score)),
    reasons
  }
}

/**
 * Generate subject allocation plan
 */
export async function generateAllocationPlan(
  userId: string,
  availableHoursPerWeek: number = 20
): Promise<AllocationPlan> {
  // Using Supabase PostgreSQL
  // Path not needed for Supabase
  // Database path not needed
  const { db } = await import("@/lib/db-supabase")
  
  // Get all active subjects
  const subjects = await db.prepare(`
    SELECT * FROM subjects
    WHERE user_id = ? AND is_active = 1
    ORDER BY priority_level DESC
  `).all(userId) as any[]
  
  // Get current week's study hours per subject
  const currentHours = await db.prepare(`
    SELECT 
      subject_id,
      SUM(duration_minutes) / 60.0 as hours
    FROM study_sessions
    WHERE user_id = ?
      AND started_at >= date('now', '-7 days')
    GROUP BY subject_id
  `).all(userId) as Array<{ subject_id: string; hours: number }>
  
  // No need to close Supabase connection
  
  const currentHoursMap = new Map(currentHours.map(h => [h.subject_id, h.hours]))
  
  // Calculate attention need for each subject
  const allocations: SubjectAllocation[] = []
  
  for (const subject of subjects) {
    const { score, reasons } = await calculateAttentionNeed(userId, subject.id, subject)
    
    // Determine priority level
    let priority: 'critical' | 'high' | 'medium' | 'low'
    if (score >= 75) priority = 'critical'
    else if (score >= 55) priority = 'high'
    else if (score >= 35) priority = 'medium'
    else priority = 'low'
    
    // Calculate urgency factor (deadline proximity)
    let urgencyFactor = 1.0
    if (subject.next_exam_date) {
      const daysUntilExam = Math.floor(
        (new Date(subject.next_exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      if (daysUntilExam <= 7) urgencyFactor = 2.0
      else if (daysUntilExam <= 14) urgencyFactor = 1.5
      else if (daysUntilExam <= 30) urgencyFactor = 1.2
    }
    
    allocations.push({
      subjectId: subject.id,
      subjectName: subject.name,
      attentionNeedScore: score,
      recommendedWeeklyHours: 0, // Will calculate below
      currentWeeklyHours: currentHoursMap.get(subject.id) || 0,
      gap: 0,
      priority,
      reasons,
      nextDeadline: subject.next_exam_date,
      urgencyFactor
    })
  }
  
  // Allocate hours based on need score and urgency
  const totalNeedScore = allocations.reduce((sum, a) => sum + (a.attentionNeedScore * a.urgencyFactor), 0)
  
  allocations.forEach(allocation => {
    if (totalNeedScore > 0) {
      const weightedNeed = allocation.attentionNeedScore * allocation.urgencyFactor
      allocation.recommendedWeeklyHours = (weightedNeed / totalNeedScore) * availableHoursPerWeek
      allocation.gap = allocation.recommendedWeeklyHours - allocation.currentWeeklyHours
    }
  })
  
  // Sort by priority
  allocations.sort((a, b) => b.attentionNeedScore - a.attentionNeedScore)
  
  // Generate weekly schedule
  const weeklySchedule = generateWeeklySchedule(allocations, availableHoursPerWeek)
  
  return {
    totalAvailableHours: availableHoursPerWeek,
    allocations,
    weeklySchedule
  }
}

/**
 * Generate weekly study schedule
 */
function generateWeeklySchedule(
  allocations: SubjectAllocation[],
  totalHours: number
): Map<string, Array<{
  subjectId: string
  duration: number
  timeWindow: string
  reason: string
}>> {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const schedule = new Map<string, Array<any>>()
  
  days.forEach(day => schedule.set(day, []))
  
  const hoursPerDay = totalHours / 7
  let currentDay = 0
  
  // Distribute subjects across week
  allocations.forEach(allocation => {
    let remainingHours = allocation.recommendedWeeklyHours
    
    while (remainingHours > 0) {
      const day = days[currentDay % 7]
      const sessionDuration = Math.min(1.5, remainingHours) // Max 1.5 hours per session
      
      schedule.get(day)!.push({
        subjectId: allocation.subjectId,
        duration: sessionDuration,
        timeWindow: allocation.priority === 'critical' ? 'morning' : 'flexible',
        reason: allocation.reasons[0] || 'Regular study'
      })
      
      remainingHours -= sessionDuration
      currentDay++
    }
  })
  
  return schedule
}

/**
 * Get subject priority recommendations
 */
export async function getSubjectPriorities(
  userId: string
): Promise<Array<{
  subjectName: string
  priority: string
  message: string
  action: string
}>> {
  const plan = await generateAllocationPlan(userId)
  
  return plan.allocations
    .filter(a => a.priority === 'critical' || a.priority === 'high')
    .map(allocation => ({
      subjectName: allocation.subjectName,
      priority: allocation.priority,
      message: allocation.reasons.join('; '),
      action: allocation.gap > 0
        ? `Increase study time by ${allocation.gap.toFixed(1)} hours this week`
        : `Maintain ${allocation.recommendedWeeklyHours.toFixed(1)} hours/week`
    }))
}

/**
 * Get neglected subjects (not studied recently)
 */
export async function getNeglectedSubjects(
  userId: string,
  daysThreshold: number = 5
): Promise<Array<{
  subjectId: string
  subjectName: string
  daysSinceLastStudy: number
  recommendation: string
}>> {
  // Using Supabase PostgreSQL
  // Path not needed for Supabase
  // Database path not needed
  const { db } = await import("@/lib/db-supabase")
  
  const query = `
    SELECT 
      s.id,
      s.name,
      MAX(ss.started_at) as last_studied
    FROM subjects s
    LEFT JOIN study_sessions ss ON ss.subject_id = s.id
    WHERE s.user_id = ? AND s.is_active = 1
    GROUP BY s.id, s.name
    HAVING last_studied IS NULL 
      OR julianday('now') - julianday(last_studied) >= ?
    ORDER BY last_studied ASC NULLS FIRST
  `
  
  const rows = await db.prepare(query).all(userId, daysThreshold) as Array<{
    id: string
    name: string
    last_studied: string | null
  }>
  
  // No need to close Supabase connection
  
  return rows.map(row => {
    const daysSince = row.last_studied
      ? Math.floor((Date.now() - new Date(row.last_studied).getTime()) / (1000 * 60 * 60 * 24))
      : 999
    
    return {
      subjectId: row.id,
      subjectName: row.name,
      daysSinceLastStudy: daysSince,
      recommendation: daysSince >= 14
        ? 'Critical: Schedule a review session immediately'
        : daysSince >= 7
        ? 'High Priority: Study within next 2 days'
        : 'Moderate: Include in this week\'s schedule'
    }
  })
}

/**
 * Balance cognitive load across study schedule
 */
export function balanceCognitiveLoad(
  schedule: Array<{ subjectName: string; difficulty: string; duration: number }>
): Array<{ subjectName: string; difficulty: string; duration: number; warning?: string }> {
  const balanced: Array<{ subjectName: string; difficulty: string; duration: number; warning?: string }> = 
    schedule.map(item => ({ ...item }))
  
  // Check for too many difficult subjects in sequence
  for (let i = 0; i < balanced.length - 1; i++) {
    const current = balanced[i]
    const next = balanced[i + 1]
    
    if (
      (current.difficulty === 'hard' || current.difficulty === 'very_hard') &&
      (next.difficulty === 'hard' || next.difficulty === 'very_hard')
    ) {
      balanced[i].warning = 'Consider alternating with an easier subject to prevent mental fatigue'
    }
    
    // Check for very long sessions
    if (current.duration > 2) {
      balanced[i].warning = 'Session too long - consider breaking into 2 shorter sessions with break'
    }
  }
  
  return balanced
}

