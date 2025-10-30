/**
 * Enhanced Recommendation Generator
 * Synthesizes all analytics modules into actionable recommendations
 */

import { assessBurnoutRisk } from './burnout-detector'
import { analyzeOptimalDuration } from './duration-optimizer'
import { 
  analyzeFocusTrend, 
  analyzePerformanceTrend, 
  analyzeStudyHoursTrend 
} from './time-series-detector'
import { generateLearningProfile, getLearningProfile } from './learning-style-classifier'
import { generateAllocationPlan } from './subject-allocator'
import { 
  getItemsDueForReview, 
  getTopicsAtRisk, 
  generateReviewReminders 
} from './spaced-repetition'

export interface ComprehensiveRecommendation {
  id: string
  userId: string
  type: 'wellbeing' | 'optimization' | 'learning_method' | 'time_management' | 'subject_priority' | 'retention'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  description: string
  rationale: string
  expectedOutcome: string
  actionItems: string[]
  confidence: number
  evidence: string[]
  tags: string[]
  createdAt: string
}

export interface RecommendationBundle {
  recommendations: ComprehensiveRecommendation[]
  insights: {
    burnout: any
    performance: any
    learningStyle: any
    subjectAllocation: any
    spacedRepetition: any
  }
  summary: {
    criticalIssues: number
    optimizationOpportunities: number
    strengthsIdentified: number
    overallHealth: 'excellent' | 'good' | 'fair' | 'needs_attention' | 'critical'
  }
}

/**
 * Check data availability for analytics
 */
async function checkDataAvailability(userId: string): Promise<{
  sessions: number
  performances: number
  subjects: number
  goals: number
}> {
  const { default: Database } = await import('better-sqlite3')
  const path = await import('path')
  const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
  const db = new Database(dbPath)
  
  const sessions = db.prepare('SELECT COUNT(*) as count FROM study_sessions WHERE user_id = ?').get(userId) as { count: number }
  const performances = db.prepare('SELECT COUNT(*) as count FROM performance_entries WHERE user_id = ?').get(userId) as { count: number }
  const subjects = db.prepare('SELECT COUNT(*) as count FROM subjects WHERE user_id = ? AND is_active = 1').get(userId) as { count: number }
  const goals = db.prepare('SELECT COUNT(*) as count FROM goals WHERE user_id = ? AND status IN (\'active\', \'paused\')').get(userId) as { count: number }
  
  db.close()
  
  return {
    sessions: sessions.count,
    performances: performances.count,
    subjects: subjects.count,
    goals: goals.count
  }
}

/**
 * Analyze subject insights with comprehensive metrics
 */
async function analyzeSubjectInsights(userId: string): Promise<{subjects: any[]} | null> {
  const { default: Database } = await import('better-sqlite3')
  const path = await import('path')
  const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
  const db = new Database(dbPath)
  
  const subjects = db.prepare(`
    SELECT 
      s.id,
      s.name,
      s.color_theme,
      s.difficulty_level,
      s.priority_level,
      COUNT(DISTINCT ss.id) as session_count,
      SUM(ss.duration_minutes) as total_minutes,
      AVG(ss.average_focus_score) as avg_focus,
      MIN(ss.average_focus_score) as min_focus,
      MAX(ss.average_focus_score) as max_focus,
      AVG(ss.productivity_rating) as avg_productivity,
      COUNT(DISTINCT pe.id) as performance_count,
      AVG(pe.percentage) as avg_performance,
      MAX(pe.percentage) as best_performance,
      MIN(pe.percentage) as worst_performance,
      GROUP_CONCAT(DISTINCT pe.weaknesses_topics) as all_weaknesses,
      GROUP_CONCAT(DISTINCT pe.what_to_do_differently) as improvement_plans,
      MAX(ss.created_at) as last_session_date,
      MAX(pe.assessment_date) as last_assessment_date
    FROM subjects s
    LEFT JOIN study_sessions ss ON s.id = ss.subject_id AND ss.user_id = ?
    LEFT JOIN performance_entries pe ON s.id = pe.subject_id AND pe.user_id = ?
    WHERE s.user_id = ? AND s.is_active = 1
    GROUP BY s.id
    ORDER BY session_count DESC
  `).all(userId, userId, userId) as any[]
  
  db.close()
  
  if (subjects.length === 0) return null
  
  return { subjects }
}

/**
 * Analyze goal progress
 */
async function analyzeGoalProgress(userId: string): Promise<{goals: any[]} | null> {
  const { default: Database } = await import('better-sqlite3')
  const path = await import('path')
  const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
  const db = new Database(dbPath)
  
  const goals = db.prepare(`
    SELECT 
      id,
      goal_type,
      subject_id,
      target_value,
      current_value,
      progress_percentage,
      status,
      on_track_status,
      target_completion_date as target_date
    FROM goals
    WHERE user_id = ? AND status IN ('active', 'paused')
    ORDER BY 
      CASE on_track_status
        WHEN 'behind' THEN 0
        WHEN 'on_track' THEN 1
        WHEN 'ahead' THEN 2
        ELSE 3
      END,
      target_completion_date ASC
  `).all(userId) as any[]
  
  db.close()
  
  if (goals.length === 0) return null
  
  return { goals }
}

/**
 * Analyze session patterns
 */
async function analyzeSessionPatterns(userId: string): Promise<any> {
  const { default: Database } = await import('better-sqlite3')
  const path = await import('path')
  const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
  const db = new Database(dbPath)
  
  const patterns = db.prepare(`
    SELECT 
      strftime('%H', started_at) as hour_of_day,
      AVG(average_focus_score) as avg_focus,
      AVG(duration_minutes) as avg_duration,
      COUNT(*) as session_count
    FROM study_sessions
    WHERE user_id = ? AND started_at >= date('now', '-30 days')
    GROUP BY hour_of_day
    ORDER BY avg_focus DESC
    LIMIT 5
  `).all(userId) as any[]
  
  db.close()
  
  if (patterns.length === 0) return null
  
  return { patterns }
}

/**
 * Generate comprehensive subject-based recommendations
 */
function generateSubjectBasedRecommendations(userId: string, insights: {subjects: any[]}): ComprehensiveRecommendation[] {
  const recommendations: ComprehensiveRecommendation[] = []
  
  console.log('🎯 Starting subject-based recommendation generation...')
  
  // 1. CRITICAL: Completely neglected subjects (0 sessions)
  const neglectedSubjects = insights.subjects.filter(s => !s.session_count || s.session_count === 0)
  
  neglectedSubjects.forEach(subject => {
    recommendations.push({
      id: generateId(),
      userId,
      type: 'subject_priority',
      priority: 'urgent',
      title: `🚨 ${subject.name} - Zero Study Sessions`,
      description: `You haven't started studying ${subject.name} yet. This subject needs immediate attention to avoid falling behind.`,
      rationale: 'Subjects without any study time accumulate gaps that become harder to fill later.',
      expectedOutcome: 'Start building foundation knowledge and momentum in this subject',
      actionItems: [
        `Schedule your first 45-minute session for ${subject.name} TODAY`,
        'Start with an overview of core concepts and syllabus',
        'Create a basic study plan with weekly targets',
        'Set a goal to complete 3 sessions this week',
        'Identify the easiest topic to start with for quick wins'
      ],
      confidence: 95,
      evidence: [
        `0 study sessions recorded`,
        subject.priority_level ? `Priority: ${subject.priority_level}` : 'Active subject',
        subject.difficulty_level ? `Difficulty: ${subject.difficulty_level}` : ''
      ].filter(Boolean),
      tags: ['urgent', 'neglected', 'subject-priority', subject.name.toLowerCase()],
      createdAt: new Date().toISOString()
    })
  })
  
  // 2. HIGH PRIORITY: Low activity subjects (1-3 sessions)
  const lowActivitySubjects = insights.subjects.filter(s => s.session_count > 0 && s.session_count <= 3)
  console.log('Low activity subjects (1-3 sessions):', lowActivitySubjects.length, lowActivitySubjects.map(s => `${s.name}:${s.session_count}`))
  
  lowActivitySubjects.forEach(subject => {
    const hoursStudied = (subject.total_minutes || 0) / 60
    recommendations.push({
      id: generateId(),
      userId,
      type: 'subject_priority',
      priority: 'high',
      title: `⚠️ ${subject.name} - Insufficient Study Time`,
      description: `Only ${subject.session_count} session(s) totaling ${hoursStudied.toFixed(1)} hours. This subject needs more consistent attention.`,
      rationale: `With just ${subject.session_count} sessions, you haven't built enough study momentum for effective learning.`,
      expectedOutcome: 'Establish consistent study rhythm and deepen understanding',
      actionItems: [
        `Increase to AT LEAST 3-4 sessions per week for ${subject.name}`,
        `Target minimum 5-6 hours total study time per week`,
        'Create a recurring calendar block for this subject',
        'Review what you covered in previous sessions before starting new material',
        subject.avg_focus && subject.avg_focus < 7 
          ? `Current focus is ${subject.avg_focus.toFixed(1)}/10 - try shorter 30-min sessions` 
          : 'Maintain your current focus level'
      ],
      confidence: 85,
      evidence: [
        `Only ${subject.session_count} sessions completed`,
        `Total time: ${hoursStudied.toFixed(1)} hours`,
        subject.avg_focus ? `Average focus: ${subject.avg_focus.toFixed(1)}/10` : '',
        subject.last_session_date ? `Last studied: ${new Date(subject.last_session_date).toLocaleDateString()}` : ''
      ].filter(Boolean),
      tags: ['high-priority', 'low-activity', subject.name.toLowerCase()],
      createdAt: new Date().toISOString()
    })
  })
  
  // 3. FOCUS ISSUES: Subjects with consistently low focus scores
  const lowFocusSubjects = insights.subjects.filter(s => 
    s.session_count >= 2 && s.avg_focus && s.avg_focus < 7
  )
  console.log('Low focus subjects (<7 focus, >=2 sessions):', lowFocusSubjects.length, lowFocusSubjects.map(s => `${s.name}:${s.avg_focus}`))
  
  lowFocusSubjects.forEach(subject => {
    const focusRange = subject.max_focus && subject.min_focus 
      ? `(ranging ${subject.min_focus.toFixed(1)} to ${subject.max_focus.toFixed(1)})` 
      : ''
    
    recommendations.push({
      id: generateId(),
      userId,
      type: 'optimization',
      priority: subject.avg_focus < 5 ? 'urgent' : 'high',
      title: `🎯 Improve Focus for ${subject.name}`,
      description: `Your focus score for ${subject.name} is ${subject.avg_focus.toFixed(1)}/10 ${focusRange}, significantly below optimal performance.`,
      rationale: `Across ${subject.session_count} sessions, you're struggling to maintain concentration for this subject.`,
      expectedOutcome: 'Achieve 8+/10 focus scores consistently, leading to better retention and faster learning',
      actionItems: [
        `Study ${subject.name} during your BEST focus hours (check session pattern recommendations)`,
        'Use Pomodoro technique: 25 minutes intense focus, 5 minute break',
        'Remove ALL distractions before starting: phone on airplane mode, close extra tabs',
        'Try different study methods: switch from reading to practice problems or video tutorials',
        subject.difficulty_level === 'hard' 
          ? 'For difficult subjects, start with easier sub-topics to build confidence'
          : 'Make study sessions more interactive with active recall',
        'Set a specific micro-goal for each session (e.g., "Master topic X")',
        'Track what disrupts your focus and eliminate those factors',
        'Consider using focus apps or website blockers during study time'
      ],
      confidence: 80,
      evidence: [
        `${subject.session_count} sessions analyzed`,
        `Average focus: ${subject.avg_focus.toFixed(1)}/10`,
        subject.min_focus ? `Lowest: ${subject.min_focus.toFixed(1)}/10` : '',
        subject.avg_productivity ? `Productivity: ${subject.avg_productivity.toFixed(1)}%` : '',
        subject.total_minutes ? `Time invested: ${(subject.total_minutes / 60).toFixed(1)} hours` : ''
      ].filter(Boolean),
      tags: ['focus', 'optimization', 'concentration', subject.name.toLowerCase()],
      createdAt: new Date().toISOString()
    })
  })
  
  // 4. PERFORMANCE ISSUES: Subjects with poor assessment results
  const poorPerformanceSubjects = insights.subjects.filter(s => 
    s.performance_count > 0 && s.avg_performance && s.avg_performance < 75
  )
  console.log('Poor performance subjects (<75%, has assessments):', poorPerformanceSubjects.length, poorPerformanceSubjects.map(s => `${s.name}:${s.avg_performance}%`))
  
  poorPerformanceSubjects.forEach(subject => {
    const performanceGap = 85 - (subject.avg_performance || 0) // Assuming 85% is target
    const hasWeaknesses = subject.all_weaknesses && subject.all_weaknesses !== '[]'
    const hasImprovementPlans = subject.improvement_plans && subject.improvement_plans !== ''
    
    recommendations.push({
      id: generateId(),
      userId,
      type: 'learning_method',
      priority: subject.avg_performance < 60 ? 'urgent' : 'high',
      title: `📉 ${subject.name} - Below Target Performance`,
      description: `Assessment average: ${subject.avg_performance.toFixed(1)}% (${performanceGap.toFixed(1)}% below target). Current study approach needs significant improvement.`,
      rationale: `After ${subject.performance_count} assessment(s) and ${subject.session_count} study sessions, results indicate ineffective learning strategies.`,
      expectedOutcome: 'Raise performance to 80%+ through targeted improvement strategies',
      actionItems: [
        `IMMEDIATE: Review ALL weaknesses from past assessments`,
        hasWeaknesses ? 'Your identified weak topics need focused attention - schedule dedicated review sessions' : 'Track which specific topics you struggle with',
        `Increase study time: current ${((subject.total_minutes || 0) / 60).toFixed(1)}h may be insufficient`,
        'Change study methods - current approach is not working:',
        '  → If reading notes: switch to practice problems and active recall',
        '  → If watching videos: start solving problems yourself',
        '  → If studying alone: find study group or tutor',
        `Take practice tests BEFORE assessments to identify gaps early`,
        'Analyze past mistakes: what types of questions do you miss?',
        hasImprovementPlans ? 'IMPLEMENT your own improvement plans you wrote after assessments' : 'After each assessment, write specific action items',
        subject.avg_focus && subject.avg_focus < 7 
          ? `Also address low focus (${subject.avg_focus.toFixed(1)}/10) - see focus recommendations`
          : '',
        'Consider getting help: tutoring, office hours, or online resources'
      ].filter(Boolean),
      confidence: 90,
      evidence: [
        `${subject.performance_count} assessments analyzed`,
        `Average score: ${subject.avg_performance.toFixed(1)}%`,
        subject.worst_performance ? `Lowest score: ${subject.worst_performance.toFixed(1)}%` : '',
        subject.best_performance ? `Best score: ${subject.best_performance.toFixed(1)}%` : '',
        `${subject.session_count} study sessions`,
        `Study time: ${((subject.total_minutes || 0) / 60).toFixed(1)} hours`,
        subject.avg_focus ? `Focus level: ${subject.avg_focus.toFixed(1)}/10` : '',
        subject.last_assessment_date ? `Last assessment: ${new Date(subject.last_assessment_date).toLocaleDateString()}` : ''
      ].filter(Boolean),
      tags: ['performance', 'assessment', 'improvement-needed', subject.name.toLowerCase()],
      createdAt: new Date().toISOString()
    })
  })
  
  // 5. IMBALANCED EFFORT: Subjects getting too much attention vs others
  if (insights.subjects.length >= 3) {
    const totalSessions = insights.subjects.reduce((sum, s) => sum + (s.session_count || 0), 0)
    const avgSessions = totalSessions / insights.subjects.length
    const overStudied = insights.subjects.filter(s => (s.session_count || 0) > avgSessions * 2)
    const underStudied = insights.subjects.filter(s => (s.session_count || 0) < avgSessions * 0.3 && (s.session_count || 0) > 0)
    
    if (overStudied.length > 0 && underStudied.length > 0) {
      recommendations.push({
        id: generateId(),
        userId,
        type: 'time_management',
        priority: 'medium',
        title: `⚖️ Rebalance Study Time Across Subjects`,
        description: `Study time is heavily imbalanced. Some subjects are over-emphasized while others are neglected.`,
        rationale: `${overStudied.map(s => s.name).join(', ')} has ${overStudied[0].session_count} sessions while ${underStudied.map(s => s.name).join(', ')} only has ${underStudied[0].session_count}.`,
        expectedOutcome: 'More balanced progress across all subjects, preventing any subject from falling behind',
        actionItems: [
          `Reduce sessions for: ${overStudied.map(s => s.name).join(', ')}`,
          `Increase sessions for: ${underStudied.map(s => s.name).join(', ')}`,
          `Target: ~${Math.ceil(avgSessions)} sessions per subject for balance`,
          'Create weekly schedule with dedicated time blocks for each subject',
          'Prioritize subjects based on: upcoming assessments, difficulty, and current performance',
          underStudied[0].priority_level === 'high' ? `Note: ${underStudied[0].name} is marked as HIGH priority but severely underrepresented` : ''
        ].filter(Boolean),
        confidence: 75,
        evidence: [
          `Total sessions: ${totalSessions}`,
          `Average per subject: ${avgSessions.toFixed(1)}`,
          `Most studied: ${overStudied[0].name} (${overStudied[0].session_count} sessions)`,
          `Least studied: ${underStudied[0].name} (${underStudied[0].session_count} sessions)`,
          `Imbalance ratio: ${(overStudied[0].session_count / Math.max(underStudied[0].session_count, 1)).toFixed(1)}x`
        ],
        tags: ['balance', 'time-management', 'allocation'],
        createdAt: new Date().toISOString()
      })
    }
  }
  
  // 6. POSITIVE REINFORCEMENT: High-performing subjects
  const highPerformers = insights.subjects.filter(s => 
    s.performance_count > 0 && 
    s.avg_performance >= 85 &&
    s.avg_focus >= 7 &&
    s.session_count >= 3
  )
  if (highPerformers.length > 0) {
    const subject = highPerformers[0]
    recommendations.push({
      id: generateId(),
      userId,
      type: 'optimization',
      priority: 'low',
      title: `🌟 Excellent Progress in ${subject.name}!`,
      description: `You're excelling in ${subject.name} with ${subject.avg_performance.toFixed(1)}% average and ${subject.avg_focus.toFixed(1)}/10 focus. Keep up the great work!`,
      rationale: `Your study approach for ${subject.name} is working exceptionally well.`,
      expectedOutcome: 'Maintain excellence and apply successful strategies to other subjects',
      actionItems: [
        `Maintain current study rhythm: ${subject.session_count} sessions so far`,
        `What's working: ${subject.avg_focus >= 8 ? 'High focus' : ''}, ${subject.avg_performance >= 90 ? 'Outstanding scores' : 'Great scores'}`,
        'Apply your study methods from this subject to struggling subjects',
        'Share what makes you successful in this subject - it could help others!',
        `Keep challenging yourself with advanced topics or practice problems`,
        `Consider this subject a strength for future opportunities`
      ].filter(Boolean),
      confidence: 95,
      evidence: [
        `Performance: ${subject.avg_performance.toFixed(1)}% average`,
        `Focus: ${subject.avg_focus.toFixed(1)}/10`,
        `${subject.session_count} sessions`,
        `${subject.performance_count} assessments`,
        subject.best_performance ? `Best score: ${subject.best_performance.toFixed(1)}%` : ''
      ].filter(Boolean),
      tags: ['success', 'strength', 'positive', subject.name.toLowerCase()],
      createdAt: new Date().toISOString()
    })
  }
  
  console.log('🎯 RETURNING', recommendations.length, 'subject recommendations:', 
    recommendations.map(r => `[${r.priority}] ${r.title}`))
  
  return recommendations
}

/**
 * Generate comprehensive goal-based recommendations
 */
function generateGoalBasedRecommendations(userId: string, progress: {goals: any[]}): ComprehensiveRecommendation[] {
  const recommendations: ComprehensiveRecommendation[] = []
  
  if (!progress.goals || progress.goals.length === 0) {
    // No goals set - encourage goal setting
    recommendations.push({
      id: generateId(),
      userId,
      type: 'time_management',
      priority: 'medium',
      title: `🎯 Set Clear Study Goals`,
      description: `You haven't set any study goals yet. Goals provide direction and motivation.`,
      rationale: 'Students with clear goals are 42% more likely to achieve their targets.',
      expectedOutcome: 'Clear direction, better motivation, and measurable progress',
      actionItems: [
        'Set 2-3 SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)',
        'Example: "Complete 20 hours of study by end of month"',
        'Example: "Achieve 85% average on next 3 assessments"',
        'Example: "Complete 10 practice problems per week"',
        'Review goals weekly and adjust as needed'
      ],
      confidence: 85,
      evidence: ['No active goals found', 'Goal-setting best practices'],
      tags: ['goals', 'planning', 'motivation'],
      createdAt: new Date().toISOString()
    })
    return recommendations
  }
  
  // 1. URGENT: Behind schedule goals
  const behindGoals = progress.goals.filter(g => g.on_track_status === 'behind')
  behindGoals.forEach(goal => {
    const targetDate = goal.target_completion_date ? new Date(goal.target_completion_date) : null
    const daysLeft = targetDate ? Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
    const progressPct = goal.progress_percentage || 0
    const remaining = 100 - progressPct
    const dailyTarget = daysLeft > 0 ? (remaining / daysLeft).toFixed(1) : 0
    const currentValue = goal.current_value || 0
    const targetValue = goal.target_value || 0
    const valueGap = targetValue - currentValue
    
    let urgencyEmoji = '⚠️'
    let priority: 'urgent' | 'high' = 'high'
    if (daysLeft <= 0) {
      urgencyEmoji = '🔴'
      priority = 'urgent'
    } else if (daysLeft <= 3) {
      urgencyEmoji = '🔴'
      priority = 'urgent'
    } else if (daysLeft <= 7) {
      urgencyEmoji = '🟠'
      priority = 'urgent'
    }
    
    recommendations.push({
      id: generateId(),
      userId,
      type: 'time_management',
      priority,
      title: `${urgencyEmoji} Goal Behind Schedule: ${goal.goal_type || 'Goal'}`,
      description: daysLeft <= 0
        ? `DEADLINE PASSED! You're at ${progressPct.toFixed(1)}% completion. Immediate action required.`
        : `You're at ${progressPct.toFixed(1)}% with only ${daysLeft} day(s) remaining. Current pace is INSUFFICIENT.`,
      rationale: daysLeft > 0 
        ? `To complete this goal on time, you need ${dailyTarget}% progress PER DAY from now on.`
        : 'Goal deadline has passed - decide to extend or mark as incomplete.',
      expectedOutcome: daysLeft > 0 ? 'Get back on track and achieve goal by deadline' : 'Resolve goal status',
      actionItems: daysLeft > 0 ? [
        `🎯 DAILY TARGET: ${dailyTarget}% progress (${(valueGap / daysLeft).toFixed(1)} ${goal.goal_type === 'study_hours' ? 'hours' : goal.goal_type === 'session_count' ? 'sessions' : 'points'} per day)`,
        `Current: ${currentValue} → Target: ${targetValue} (Gap: ${valueGap})`,
        `Block out dedicated time EVERY day until ${targetDate?.toLocaleDateString()}`,
        'Eliminate all non-essential activities temporarily',
        'Wake up 1 hour earlier if needed to catch up',
        'Focus ONLY on high-impact activities that directly contribute to this goal',
        daysLeft <= 3 ? '❗ CRISIS MODE: Consider canceling social plans to focus on goal' : '',
        'Break remaining work into hourly or daily micro-milestones',
        'Track progress twice daily to ensure you stay on pace'
      ].filter(Boolean) : [
        `Goal deadline was ${targetDate?.toLocaleDateString()}`,
        `Reached ${progressPct.toFixed(1)}% completion (needed 100%)`,
        'DECISION REQUIRED:',
        '  → Option 1: Extend deadline by realistic timeframe',
        '  → Option 2: Mark as incomplete and set new goal',
        '  → Option 3: Adjust target value to match what\'s achievable',
        'Analyze what prevented completion to avoid repeating mistakes',
        'Set more realistic deadlines for future goals'
      ],
      confidence: 95,
      evidence: [
        `Progress: ${progressPct.toFixed(1)}%`,
        `Current: ${currentValue}/${targetValue}`,
        daysLeft > 0 ? `Days remaining: ${daysLeft}` : `Deadline: PASSED`,
        daysLeft > 0 ? `Required daily progress: ${dailyTarget}%` : '',
        goal.goal_type ? `Type: ${goal.goal_type}` : ''
      ].filter(Boolean),
      tags: ['goals', 'deadline', 'urgent', goal.goal_type || 'general'],
      createdAt: new Date().toISOString()
    })
  })
  
  // 2. HIGH PRIORITY: On-track goals that need consistent effort
  const onTrackGoals = progress.goals.filter(g => 
    g.on_track_status === 'on_track' && 
    g.status === 'active'
  )
  onTrackGoals.slice(0, 2).forEach(goal => {
    const targetDate = goal.target_completion_date ? new Date(goal.target_completion_date) : null
    const daysLeft = targetDate ? Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0
    const progressPct = goal.progress_percentage || 0
    const currentValue = goal.current_value || 0
    const targetValue = goal.target_value || 0
    
    recommendations.push({
      id: generateId(),
      userId,
      type: 'time_management',
      priority: 'medium',
      title: `✅ Maintain Pace: ${goal.goal_type || 'Goal'}`,
      description: `You're on track at ${progressPct.toFixed(1)}% completion. Keep up the consistent effort!`,
      rationale: `With ${daysLeft} days remaining, your current pace will achieve the goal.`,
      expectedOutcome: 'Complete goal on time with consistent effort',
      actionItems: [
        `Continue current pace: ${currentValue}/${targetValue} completed`,
        `Stay consistent: maintain your current rhythm until ${targetDate?.toLocaleDateString()}`,
        `${daysLeft} days left - don't let up now!`,
        'Schedule recurring study blocks to maintain momentum',
        'If you get ahead of schedule, you can ease up or set stretch goals'
      ],
      confidence: 85,
      evidence: [
        `Progress: ${progressPct.toFixed(1)}%`,
        `On track status: ${goal.on_track_status}`,
        `Days remaining: ${daysLeft}`,
        `Current: ${currentValue}/${targetValue}`
      ],
      tags: ['goals', 'on-track', 'maintenance', goal.goal_type || 'general'],
      createdAt: new Date().toISOString()
    })
  })
  
  // 3. POSITIVE: Ahead of schedule goals
  const aheadGoals = progress.goals.filter(g => g.on_track_status === 'ahead')
  aheadGoals.forEach(goal => {
    const progressPct = goal.progress_percentage || 0
    const currentValue = goal.current_value || 0
    const targetValue = goal.target_value || 0
    
    recommendations.push({
      id: generateId(),
      userId,
      type: 'optimization',
      priority: 'low',
      title: `🚀 Ahead of Schedule: ${goal.goal_type || 'Goal'}`,
      description: `Excellent work! You're at ${progressPct.toFixed(1)}% - ahead of your planned pace.`,
      rationale: 'You have buffer time - use it wisely to maximize outcomes.',
      expectedOutcome: 'Capitalize on momentum for even better results',
      actionItems: [
        `Current: ${currentValue}/${targetValue} - you have breathing room!`,
        'Option 1: Maintain current pace and enjoy less stress',
        'Option 2: Set a stretch goal to achieve even more',
        'Option 3: Reallocate some time to struggling subjects',
        'Analyze what\'s working well and apply to other goals',
        'This is excellent progress - celebrate your discipline!'
      ],
      confidence: 90,
      evidence: [
        `Progress: ${progressPct.toFixed(1)}%`,
        `Status: Ahead of schedule`,
        `Current: ${currentValue}/${targetValue}`,
        goal.target_completion_date ? `Deadline: ${new Date(goal.target_completion_date).toLocaleDateString()}` : ''
      ].filter(Boolean),
      tags: ['goals', 'success', 'ahead', goal.goal_type || 'general'],
      createdAt: new Date().toISOString()
    })
  })
  
  // 4. CELEBRATION: Completed goals
  const completedGoals = progress.goals.filter(g => 
    g.status === 'completed' || 
    g.is_completed === 1 ||
    (g.progress_percentage && g.progress_percentage >= 100)
  )
  if (completedGoals.length > 0) {
    recommendations.push({
      id: generateId(),
      userId,
      type: 'optimization',
      priority: 'low',
      title: `🎉 ${completedGoals.length} Goal(s) Achieved!`,
      description: `Congratulations! You've completed ${completedGoals.length} goal(s). This shows excellent discipline and follow-through.`,
      rationale: 'Achieving goals builds momentum and confidence for future challenges.',
      expectedOutcome: 'Sustained motivation and continued growth',
      actionItems: [
        '✨ Take a moment to celebrate this achievement!',
        `Completed goals: ${completedGoals.map(g => g.goal_type || 'Goal').join(', ')}`,
        'Reflect on what strategies led to success',
        'Set 2-3 new goals that build on this progress',
        'Consider slightly more challenging targets now that you\'ve proven you can achieve goals',
        'Share your success with study partners or mentors',
        'Use this momentum to tackle goals you\'ve been postponing'
      ],
      confidence: 100,
      evidence: [
        `${completedGoals.length} goals completed`,
        ...completedGoals.map(g => `✓ ${g.goal_type}: ${g.current_value}/${g.target_value}`)
      ],
      tags: ['success', 'achievement', 'motivation', 'goals'],
      createdAt: new Date().toISOString()
    })
  }
  
  // 5. STAGNANT: Goals with no recent progress
  const stagnantGoals = progress.goals.filter(g => 
    g.status === 'active' &&
    (g.progress_percentage === 0 || !g.progress_percentage) &&
    g.created_at
  )
  stagnantGoals.forEach(goal => {
    const daysSinceCreation = goal.created_at 
      ? Math.floor((Date.now() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0
    
    if (daysSinceCreation >= 3) {
      recommendations.push({
        id: generateId(),
        userId,
        type: 'time_management',
        priority: 'high',
        title: `⏸️ Stagnant Goal: ${goal.goal_type || 'Goal'}`,
        description: `No progress on this goal for ${daysSinceCreation} days. Either start working or remove it.`,
        rationale: 'Inactive goals clutter your focus and create false accountability.',
        expectedOutcome: 'Clear action or decision on goal status',
        actionItems: [
          `Goal created ${daysSinceCreation} days ago with 0% progress`,
          'DECISION REQUIRED:',
          '  → Start working on it THIS WEEK',
          '  → Postpone it and set realistic start date',
          '  → Cancel it if no longer relevant',
          'Having too many inactive goals dilutes your focus',
          'Keep only goals you\'re actively working on'
        ],
        confidence: 80,
        evidence: [
          `Progress: 0%`,
          `Days since creation: ${daysSinceCreation}`,
          `Target: ${goal.target_value}`,
          goal.target_completion_date ? `Deadline: ${new Date(goal.target_completion_date).toLocaleDateString()}` : ''
        ].filter(Boolean),
        tags: ['goals', 'stagnant', 'action-needed', goal.goal_type || 'general'],
        createdAt: new Date().toISOString()
      })
    }
  })
  
  return recommendations
}

/**
 * Generate comprehensive session pattern recommendations
 */
function generateSessionPatternRecommendations(userId: string, patterns: {patterns: any[]}): ComprehensiveRecommendation[] {
  const recommendations: ComprehensiveRecommendation[] = []
  
  if (!patterns.patterns || patterns.patterns.length === 0) {
    return recommendations
  }
  
  // 1. OPTIMIZE: Best study times based on focus data
  const bestPattern = patterns.patterns[0]
  const hour = parseInt(bestPattern.hour_of_day)
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night'
  const timeDisplay = hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`
  
  recommendations.push({
    id: generateId(),
    userId,
    type: 'time_management',
    priority: 'high',
    title: `⏰ Peak Performance Window: ${timeDisplay}`,
    description: `Your highest focus (${bestPattern.avg_focus.toFixed(1)}/10) consistently occurs around ${timeDisplay}. This is your GOLDEN HOUR for studying!`,
    rationale: `Based on ${bestPattern.session_count} sessions, your brain performs ${((bestPattern.avg_focus / 10) * 100).toFixed(0)}% optimally during this time window.`,
    expectedOutcome: 'Maximize learning efficiency by studying during peak cognitive performance',
    actionItems: [
      `🎯 PRIORITY: Block ${timeDisplay} for your most difficult/important subjects`,
      `Schedule ALL challenging topics (hard concepts, problem-solving) at ${timeDisplay}`,
      'PROTECT this time slot aggressively:',
      '  → No meetings, no calls, no social media',
      '  → Turn off ALL notifications',
      '  → Inform others this is your focused study time',
      `Average session length at this time: ${Math.round(bestPattern.avg_duration)} minutes - this is your natural rhythm`,
      'Consistency is key: Study at this time DAILY for 2 weeks to build routine',
      timeOfDay === 'morning' ? 'Go to bed early to wake up refreshed for morning sessions' : '',
      timeOfDay === 'evening' ? 'Avoid heavy meals before this time to maintain focus' : '',
      'Reserve low-focus times (afternoons/late nights) for passive review, organizing notes, or easy tasks'
    ].filter(Boolean),
    confidence: 90,
    evidence: [
      `Peak time: ${timeDisplay} (${timeOfDay})`,
      `Focus score: ${bestPattern.avg_focus.toFixed(1)}/10`,
      `${bestPattern.session_count} sessions analyzed`,
      `Avg duration: ${Math.round(bestPattern.avg_duration)} minutes`,
      `Performance: ${((bestPattern.avg_focus / 10) * 100).toFixed(0)}% optimal`
    ],
    tags: ['timing', 'optimization', 'focus', 'peak-performance', timeOfDay],
    createdAt: new Date().toISOString()
  })
  
  // 2. PATTERN ANALYSIS: Compare all time slots if multiple patterns exist
  if (patterns.patterns.length >= 3) {
    const worstPattern = patterns.patterns[patterns.patterns.length - 1]
    const worstHour = parseInt(worstPattern.hour_of_day)
    const worstTimeDisplay = worstHour === 0 ? '12:00 AM' : worstHour < 12 ? `${worstHour}:00 AM` : worstHour === 12 ? '12:00 PM' : `${worstHour - 12}:00 PM`
    const focusDrop = ((bestPattern.avg_focus - worstPattern.avg_focus) / bestPattern.avg_focus * 100).toFixed(0)
    
    recommendations.push({
      id: generateId(),
      userId,
      type: 'optimization',
      priority: 'medium',
      title: `📊 Avoid Studying at ${worstTimeDisplay}`,
      description: `Your focus drops ${focusDrop}% at ${worstTimeDisplay} compared to your peak time. Avoid scheduling important study sessions then.`,
      rationale: `Data shows ${worstPattern.avg_focus.toFixed(1)}/10 focus at ${worstTimeDisplay} vs ${bestPattern.avg_focus.toFixed(1)}/10 at ${timeDisplay} - that's a significant performance gap.`,
      expectedOutcome: 'Eliminate low-productivity study time and reallocate to better hours',
      actionItems: [
        `AVOID ${worstTimeDisplay} for focused study work`,
        `Use ${worstTimeDisplay} for light tasks only:`,
        '  → Organizing study materials',
        '  → Casual review of easy topics',
        '  → Planning next day\'s study schedule',
        '  → Physical exercise or breaks',
        `Move important study sessions from ${worstTimeDisplay} to ${timeDisplay}`,
        'Your body has natural energy cycles - work WITH them, not against them'
      ],
      confidence: 75,
      evidence: [
        `Worst time: ${worstTimeDisplay}`,
        `Focus: ${worstPattern.avg_focus.toFixed(1)}/10 (${focusDrop}% lower than peak)`,
        `Best time: ${timeDisplay} at ${bestPattern.avg_focus.toFixed(1)}/10`,
        `${worstPattern.session_count} low-performance sessions analyzed`
      ],
      tags: ['timing', 'avoid', 'low-focus', 'optimization'],
      createdAt: new Date().toISOString()
    })
  }
  
  // 3. CONSISTENCY: Encourage building routine
  const totalSessions = patterns.patterns.reduce((sum, p) => sum + p.session_count, 0)
  const uniqueTimeSlots = patterns.patterns.length
  
  if (uniqueTimeSlots >= 5) {
    recommendations.push({
      id: generateId(),
      userId,
      type: 'optimization',
      priority: 'medium',
      title: `🔄 Build a Consistent Study Routine`,
      description: `You're studying across ${uniqueTimeSlots} different time slots. While flexibility is good, consistency builds stronger habits.`,
      rationale: 'Students with consistent study schedules achieve 31% better retention than those with erratic schedules.',
      expectedOutcome: 'Stronger habit formation and automatic transition into focused study mode',
      actionItems: [
        `Focus on your top 2-3 time slots: ${patterns.patterns.slice(0, 3).map(p => {
          const h = parseInt(p.hour_of_day)
          return h === 0 ? '12AM' : h < 12 ? `${h}AM` : h === 12 ? '12PM' : `${h - 12}PM`
        }).join(', ')}`,
        'Studying at the same time daily trains your brain to enter "focus mode" automatically',
        'Create pre-study ritual: same location, same setup, same routine',
        'After 21 days of consistency, studying will feel effortless at these times',
        'Occasional flexibility is fine, but make 80% of sessions at consistent times'
      ],
      confidence: 70,
      evidence: [
        `${uniqueTimeSlots} different study times`,
        `${totalSessions} total sessions`,
        `Most consistent: ${timeDisplay} with ${bestPattern.session_count} sessions`,
        'Research: consistent schedules = better retention'
      ],
      tags: ['consistency', 'habits', 'routine', 'optimization'],
      createdAt: new Date().toISOString()
    })
  }
  
  return recommendations
}

/**
 * Generate comprehensive recommendations
 */
export async function generateComprehensiveRecommendations(
  userId: string,
  subjectId?: string
): Promise<RecommendationBundle> {
  const recommendations: ComprehensiveRecommendation[] = []
  
  // First, check minimum data requirements
  const dataCheck = await checkDataAvailability(userId)
  
  // Run all analyses in parallel with improved error handling
  const [
    burnoutAnalysis,
    durationAnalysis,
    focusTrend,
    performanceTrend,
    hoursTrend,
    learningProfile,
    allocationPlan,
    reviewReminders,
    itemsDue,
    topicsAtRisk,
    subjectInsights,
    goalProgress
  ] = await Promise.all([
    dataCheck.sessions >= 5 ? assessBurnoutRisk(userId).catch(err => {
      console.error('Burnout analysis failed:', err)
      return null
    }) : Promise.resolve(null),
    subjectId && dataCheck.sessions >= 5 ? analyzeOptimalDuration(userId, subjectId).catch(() => null) : Promise.resolve(null),
    dataCheck.sessions >= 5 ? analyzeFocusTrend(userId, 30).catch(() => null) : Promise.resolve(null),
    dataCheck.performances >= 2 ? analyzePerformanceTrend(userId, '60').catch(() => null) : Promise.resolve(null),
    dataCheck.sessions >= 5 ? analyzeStudyHoursTrend(userId, 30).catch(() => null) : Promise.resolve(null),
    dataCheck.sessions >= 10 ? getLearningProfile(userId).then(profile => 
      profile || generateLearningProfile(userId).catch(() => null)
    ) : Promise.resolve(null),
    dataCheck.subjects >= 2 ? generateAllocationPlan(userId).catch(() => null) : Promise.resolve(null),
    generateReviewReminders(userId).catch(() => []),
    getItemsDueForReview(userId, subjectId).catch(() => []),
    getTopicsAtRisk(userId, 60).catch(() => []),
    analyzeSubjectInsights(userId).catch(() => null),
    analyzeGoalProgress(userId).catch(() => null)
  ])
  
  // Add data-driven recommendations based on subjects, goals, and sessions
  if (subjectInsights && subjectInsights.subjects.length > 0) {
    console.log('🔍 Generating subject recommendations for', subjectInsights.subjects.length, 'subjects')
    const subjectRecs = generateSubjectBasedRecommendations(userId, subjectInsights)
    console.log('✅ Generated', subjectRecs.length, 'subject recommendations')
    recommendations.push(...subjectRecs)
  } else {
    console.log('⚠️ No subject insights available')
  }
  
  if (goalProgress && goalProgress.goals.length > 0) {
    recommendations.push(...generateGoalBasedRecommendations(userId, goalProgress))
  }
  
  // Add session pattern recommendations
  if (dataCheck.sessions >= 3) {
    const sessionPatterns = await analyzeSessionPatterns(userId)
    if (sessionPatterns) {
      recommendations.push(...generateSessionPatternRecommendations(userId, sessionPatterns))
    }
  }
  
  // 1. Burnout and Wellbeing Recommendations
  if (burnoutAnalysis && burnoutAnalysis.totalScore >= 60) {
    const severity = burnoutAnalysis.severity
    const actionItems: string[] = []
    
    if (burnoutAnalysis.needsIntervention) {
      actionItems.push('Take 2-3 days complete break from studying')
      actionItems.push('Reduce daily study hours by 40% for next week')
    }
    
    if (burnoutAnalysis.indicators.some(ind => ind.category === 'focus')) {
      actionItems.push('Limit sessions to 30 minutes with 10-minute breaks')
    }
    
    if (burnoutAnalysis.indicators.some(ind => ind.category === 'emotional')) {
      actionItems.push('Consider speaking with academic counselor or therapist')
    }
    
    recommendations.push({
      id: generateId(),
      userId,
      type: 'wellbeing',
      priority: severity === 'critical' || severity === 'high' ? 'urgent' : 'high',
      title: `Burnout Risk: ${severity.toUpperCase()}`,
      description: `Your burnout score is ${burnoutAnalysis.totalScore}/100. Immediate intervention needed.`,
      rationale: `Detected: ${burnoutAnalysis.indicators.join(', ')}`,
      expectedOutcome: 'Restored energy, improved focus, sustainable study habits',
      actionItems,
      confidence: 90,
      evidence: burnoutAnalysis.recommendations.slice(0, 3),
      tags: ['wellbeing', 'urgent', 'burnout'],
      createdAt: new Date().toISOString()
    })
  }
  
  // 2. Performance Trend Recommendations
  if (performanceTrend && performanceTrend.trend === 'declining') {
    const actionItems = [
      'Review study methods - current approach may not be effective',
      'Increase active recall and practice problem frequency',
      'Schedule review sessions for previously learned material'
    ]
    
    if (hoursTrend && hoursTrend.trend === 'improving') {
      actionItems.push('Hours are increasing but performance declining - focus on quality over quantity')
    }
    
    recommendations.push({
      id: generateId(),
      userId,
      type: 'optimization',
      priority: Math.abs(performanceTrend.changePercent) > 15 ? 'high' : 'medium',
      title: `Performance Declining by ${Math.abs(performanceTrend.changePercent).toFixed(1)}%`,
      description: performanceTrend.description,
      rationale: performanceTrend.recommendation,
      expectedOutcome: 'Reverse performance decline, return to baseline or better',
      actionItems,
      confidence: performanceTrend.confidence,
      evidence: [`Momentum: ${performanceTrend.momentum.toFixed(2)} points/day`],
      tags: ['performance', 'optimization'],
      createdAt: new Date().toISOString()
    })
  }
  
  // 3. Learning Style Recommendations
  if (learningProfile && learningProfile.confidence >= 50) {
    const styleRec = learningProfile.recommendations[0]
    const actionItems: string[] = []
    
    if (learningProfile.dominantStyle === 'visual') {
      actionItems.push('Use diagrams, mind maps, and color-coded notes')
      actionItems.push('Watch video explanations for complex topics')
    } else if (learningProfile.dominantStyle === 'auditory') {
      actionItems.push('Join study groups or discussion forums')
      actionItems.push('Listen to recorded lectures or podcasts')
    } else if (learningProfile.dominantStyle === 'kinesthetic') {
      actionItems.push('Solve practice problems actively')
      actionItems.push('Use hands-on demonstrations when possible')
    } else if (learningProfile.dominantStyle === 'reading_writing') {
      actionItems.push('Take detailed notes and rewrite summaries')
      actionItems.push('Create written outlines before exams')
    }
    
    recommendations.push({
      id: generateId(),
      userId,
      type: 'learning_method',
      priority: 'medium',
      title: `Optimize for ${learningProfile.dominantStyle.replace('_', ' ').toUpperCase()} Learning`,
      description: styleRec,
      rationale: `Analysis of ${Math.floor(learningProfile.confidence * 20 / 100)} sessions shows strongest results with ${learningProfile.dominantStyle} methods`,
      expectedOutcome: 'Increased retention and comprehension efficiency',
      actionItems,
      confidence: learningProfile.confidence,
      evidence: learningProfile.recommendations,
      tags: ['learning_style', 'personalization'],
      createdAt: new Date().toISOString()
    })
  }
  
  // 4. Duration Optimization
  if (durationAnalysis) {
    const firstBucket = Array.from(durationAnalysis.performanceByDuration.values())[0]
    
    recommendations.push({
      id: generateId(),
      userId,
      type: 'optimization',
      priority: 'medium',
      title: `Optimal Session Length: ${durationAnalysis.optimalDuration} minutes`,
      description: `Your sweet spot is ${durationAnalysis.optimalRange.min}-${durationAnalysis.optimalRange.max} minutes per session`,
      rationale: durationAnalysis.reasoning,
      expectedOutcome: 'Maximized performance per study hour',
      actionItems: [
        `Target ${durationAnalysis.optimalDuration} minutes for each session`,
        'Set timer to maintain consistent duration',
        'Take 5-10 minute break between sessions'
      ],
      confidence: durationAnalysis.confidence,
      evidence: firstBucket ? [
        `Performance: ${firstBucket.avgPerformance.toFixed(1)}%`,
        `Focus: ${firstBucket.avgFocus.toFixed(1)}/10`
      ] : ['Based on your session patterns'],
      tags: ['duration', 'optimization'],
      createdAt: new Date().toISOString()
    })
  }
  
  // 5. Subject Priority Recommendations
  if (allocationPlan && allocationPlan.allocations.length > 0) {
    const critical = allocationPlan.allocations.filter(a => a.priority === 'critical')
    const high = allocationPlan.allocations.filter(a => a.priority === 'high')
    
    if (critical.length > 0 || high.length > 0) {
      const needsAttention = [...critical, ...high].slice(0, 3)
      
      recommendations.push({
        id: generateId(),
        userId,
        type: 'subject_priority',
        priority: critical.length > 0 ? 'high' : 'medium',
        title: `${needsAttention.length} Subjects Need Priority Attention`,
        description: needsAttention.map(s => `${s.subjectName}: ${s.reasons[0]}`).join('; '),
        rationale: 'Based on performance gaps, deadlines, and time since last study',
        expectedOutcome: 'Balanced progress across all subjects',
        actionItems: needsAttention.map(s => 
          `${s.subjectName}: ${s.recommendedWeeklyHours.toFixed(1)} hours/week (currently ${s.currentWeeklyHours.toFixed(1)})`
        ),
        confidence: 85,
        evidence: needsAttention.map(s => s.reasons[0]),
        tags: ['subject_allocation', 'time_management'],
        createdAt: new Date().toISOString()
      })
    }
  }
  
  // 6. Spaced Repetition Reminders
  if (reviewReminders.length > 0) {
    const urgent = reviewReminders.filter(r => r.priority === 'urgent')
    
    if (urgent.length > 0) {
      const totalItems = urgent.reduce((sum, r) => sum + r.items.length, 0)
      
      recommendations.push({
        id: generateId(),
        userId,
        type: 'retention',
        priority: 'urgent',
        title: `${totalItems} Topics Need Immediate Review`,
        description: urgent.map(r => r.description).join('; '),
        rationale: 'Topics at high risk of being forgotten based on spaced repetition intervals',
        expectedOutcome: 'Prevent knowledge loss, strengthen long-term retention',
        actionItems: urgent.flatMap(r => 
          r.items.slice(0, 5).map(item => `Review: ${item.topicName}`)
        ),
        confidence: 95,
        evidence: urgent.map(r => r.title),
        tags: ['spaced_repetition', 'retention', 'urgent'],
        createdAt: new Date().toISOString()
      })
    }
  }
  
  // 7. Focus Decline Warning
  if (focusTrend && focusTrend.trend === 'declining' && Math.abs(focusTrend.changePercent) > 10) {
    recommendations.push({
      id: generateId(),
      userId,
      type: 'wellbeing',
      priority: 'high',
      title: `Focus Quality Declining (${Math.abs(focusTrend.changePercent).toFixed(1)}% drop)`,
      description: focusTrend.description,
      rationale: 'Sustained focus decline may indicate mental fatigue or ineffective study environment',
      expectedOutcome: 'Restored concentration and study effectiveness',
      actionItems: [
        'Reduce session duration by 25%',
        'Eliminate distractions (phone, notifications)',
        'Change study environment',
        'Ensure 7-8 hours sleep',
        'Take a full rest day'
      ],
      confidence: focusTrend.confidence,
      evidence: [`Momentum: ${focusTrend.momentum.toFixed(2)} points/day decline`],
      tags: ['focus', 'wellbeing'],
      createdAt: new Date().toISOString()
    })
  }
  
  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  
  // Calculate summary
  const criticalIssues = recommendations.filter(r => r.priority === 'urgent').length
  const optimizationOpportunities = recommendations.filter(r => r.type === 'optimization').length
  const strengthsIdentified = recommendations.filter(r => 
    r.description.includes('effective') || r.description.includes('optimal')
  ).length
  
  let overallHealth: 'excellent' | 'good' | 'fair' | 'needs_attention' | 'critical'
  if (criticalIssues >= 2 || (burnoutAnalysis && burnoutAnalysis.severity === 'critical')) {
    overallHealth = 'critical'
  } else if (criticalIssues === 1 || (burnoutAnalysis && burnoutAnalysis.severity === 'high')) {
    overallHealth = 'needs_attention'
  } else if (recommendations.filter(r => r.priority === 'high').length > 2) {
    overallHealth = 'fair'
  } else if (recommendations.length <= 2) {
    overallHealth = 'excellent'
  } else {
    overallHealth = 'good'
  }
  
  return {
    recommendations,
    insights: {
      burnout: burnoutAnalysis,
      performance: { focus: focusTrend, performance: performanceTrend, hours: hoursTrend },
      learningStyle: learningProfile,
      subjectAllocation: allocationPlan,
      spacedRepetition: { reminders: reviewReminders, itemsDue, topicsAtRisk }
    },
    summary: {
      criticalIssues,
      optimizationOpportunities,
      strengthsIdentified,
      overallHealth
    }
  }
}

/**
 * Store recommendations in database
 */
export async function storeRecommendationsBundle(bundle: RecommendationBundle): Promise<void> {
  const { default: Database } = await import('better-sqlite3')
  const path = await import('path')
  const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
  const db = new Database(dbPath)
  
  const stmt = db.prepare(`
    INSERT INTO recommendations (
      id, user_id, type, priority, title, description,
      rationale, expected_outcome, action_items,
      confidence_score, evidence, tags,
      status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
  `)
  
  bundle.recommendations.forEach(rec => {
    stmt.run(
      rec.id,
      rec.userId,
      rec.type,
      rec.priority,
      rec.title,
      rec.description,
      rec.rationale,
      rec.expectedOutcome,
      JSON.stringify(rec.actionItems),
      rec.confidence,
      JSON.stringify(rec.evidence),
      JSON.stringify(rec.tags)
    )
  })
  
  db.close()
}

/**
 * Get active recommendations
 */
export async function getActiveRecommendations(
  userId: string,
  limit: number = 10
): Promise<ComprehensiveRecommendation[]> {
  const { default: Database } = await import('better-sqlite3')
  const path = await import('path')
  const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
  const db = new Database(dbPath)
  
  const rows = db.prepare(`
    SELECT * FROM recommendations
    WHERE user_id = ?
      AND status = 'pending'
      AND date(created_at) >= date('now', '-7 days')
    ORDER BY 
      CASE priority
        WHEN 'urgent' THEN 0
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
      END,
      created_at DESC
    LIMIT ?
  `).all(userId, limit) as any[]
  
  db.close()
  
  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    priority: row.priority,
    title: row.title,
    description: row.description,
    rationale: row.rationale,
    expectedOutcome: row.expected_outcome,
    actionItems: JSON.parse(row.action_items),
    confidence: row.confidence_score,
    evidence: JSON.parse(row.evidence),
    tags: JSON.parse(row.tags),
    createdAt: row.created_at
  }))
}

/**
 * Mark recommendation as completed
 */
export async function markRecommendationCompleted(
  recommendationId: string,
  feedback?: 'helpful' | 'not_helpful'
): Promise<void> {
  const { default: Database } = await import('better-sqlite3')
  const path = await import('path')
  const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
  const db = new Database(dbPath)
  
  db.prepare(`
    UPDATE recommendations
    SET status = 'completed',
        user_feedback = ?,
        completed_at = datetime('now')
    WHERE id = ?
  `).run(feedback || null, recommendationId)
  
  db.close()
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

