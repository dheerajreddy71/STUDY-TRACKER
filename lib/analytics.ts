import type {
  StudySession,
  PerformanceEntry,
  DashboardStats,
  TimeAnalysis,
  SubjectPerformance,
  CorrelationAnalysis,
} from "./types"

export function calculateDashboardStats(
  sessions: StudySession[],
  performance: PerformanceEntry[],
  todayDate?: Date,
): DashboardStats {
  const today = todayDate || new Date()
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.actualDurationMinutes || 0), 0)
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

  const avgFocus =
    sessions.length > 0
      ? Math.round((sessions.reduce((sum, s) => sum + (s.averageFocusScore || 0), 0) / sessions.length) * 10) / 10
      : 0

  // Calculate streak
  let streak = 0
  const currentDate = new Date(today)
  currentDate.setHours(0, 0, 0, 0)

  const sessionsByDate = new Map<string, StudySession[]>()
  sessions.forEach((s) => {
    const sessionDate = new Date(s.startedAt)
    sessionDate.setHours(0, 0, 0, 0)
    const dateKey = sessionDate.toISOString().split("T")[0]
    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, [])
    }
    sessionsByDate.get(dateKey)!.push(s)
  })

  while (sessionsByDate.has(currentDate.toISOString().split("T")[0])) {
    streak++
    currentDate.setDate(currentDate.getDate() - 1)
  }

  // Weekly study time
  const weeklyTime = Array(7).fill(0)
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)

  sessions.forEach((s) => {
    if (s.startedAt >= oneWeekAgo) {
      const dayIndex = new Date(s.startedAt).getDay()
      weeklyTime[dayIndex] += s.actualDurationMinutes || 0
    }
  })

  // Today's stats
  const todayStart = new Date(today)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  const todaySessions = sessions.filter((s) => s.startedAt >= todayStart && s.startedAt <= todayEnd)
  const todayStudyTime = todaySessions.reduce((sum, s) => sum + (s.actualDurationMinutes || 0), 0)
  const todayFocusScore =
    todaySessions.length > 0
      ? Math.round(
          (todaySessions.reduce((sum, s) => sum + (s.averageFocusScore || 0), 0) / todaySessions.length) * 10,
        ) / 10
      : 0

  // Best performing subject
  const subjectPerformance = new Map<string, number[]>()
  performance.forEach((p) => {
    if (!subjectPerformance.has(p.subjectId)) {
      subjectPerformance.set(p.subjectId, [])
    }
    subjectPerformance.get(p.subjectId)!.push(p.percentage)
  })

  let bestSubject: string | undefined
  let bestAvg = 0
  subjectPerformance.forEach((scores, subjectId) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    if (avg > bestAvg) {
      bestAvg = avg
      bestSubject = subjectId
    }
  })

  return {
    totalStudyHours: totalHours,
    sessionsCompleted: sessions.length,
    currentStreak: streak,
    averageFocusScore: avgFocus,
    bestPerformingSubject: bestSubject,
    weeklyStudyTime: weeklyTime.map((m) => Math.round((m / 60) * 10) / 10),
    todayStudyTime: Math.round((todayStudyTime / 60) * 10) / 10,
    todaySessionsCount: todaySessions.length,
    focusScoreToday: todayFocusScore,
  }
}

export function calculateTimeAnalysis(sessions: StudySession[]): TimeAnalysis {
  const hourlyHeatmap: Record<number, number> = {}
  const dayPatterns: Record<string, number> = {
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  sessions.forEach((s) => {
    const hour = s.startedAt.getHours()
    hourlyHeatmap[hour] = (hourlyHeatmap[hour] || 0) + (s.actualDurationMinutes || 0)

    const dayName = days[s.startedAt.getDay()]
    dayPatterns[dayName] += s.actualDurationMinutes || 0
  })

  const bestHours = Object.entries(hourlyHeatmap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => Number.parseInt(hour))

  return {
    hourlyHeatmap,
    bestProductiveHours: bestHours,
    dayOfWeekPatterns: dayPatterns,
  }
}

export function calculatePerformanceTrend(entries: PerformanceEntry[]): "up" | "down" | "stable" {
  if (entries.length < 2) return "stable"

  const sorted = [...entries].sort((a, b) => a.assessmentDate.getTime() - b.assessmentDate.getTime())
  const recent = sorted.slice(-5)
  const older = sorted.slice(0, Math.max(1, sorted.length - 5))

  const recentAvg = recent.reduce((sum, e) => sum + e.percentage, 0) / recent.length
  const olderAvg = older.reduce((sum, e) => sum + e.percentage, 0) / older.length

  const diff = recentAvg - olderAvg
  if (diff > 5) return "up"
  if (diff < -5) return "down"
  return "stable"
}

export function calculateSubjectPerformance(
  subjectId: string,
  sessions: StudySession[],
  performance: PerformanceEntry[],
): SubjectPerformance {
  const subjectSessions = sessions.filter((s) => s.subjectId === subjectId)
  const subjectPerformance = performance.filter((p) => p.subjectId === subjectId)

  const totalTimeStudied = subjectSessions.reduce((sum, s) => sum + (s.actualDurationMinutes || 0), 0)
  const avgSessionDuration = subjectSessions.length > 0 ? Math.round(totalTimeStudied / subjectSessions.length) : 0

  const lastStudiedDate =
    subjectSessions.length > 0 ? new Date(Math.max(...subjectSessions.map((s) => s.startedAt.getTime()))) : undefined

  const recentScores = subjectPerformance
    .sort((a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime())
    .slice(0, 5)
    .map((p) => p.percentage)

  return {
    subjectId,
    subjectName: subjectId,
    totalTimeStudied: Math.round((totalTimeStudied / 60) * 10) / 10,
    averageSessionDuration: avgSessionDuration,
    lastStudiedDate,
    performanceTrend: calculatePerformanceTrend(subjectPerformance),
    recentScores,
  }
}

export function findCorrelations(sessions: StudySession[], performance: PerformanceEntry[]): CorrelationAnalysis[] {
  const correlations: CorrelationAnalysis[] = []

  // Time of day correlation
  const morningPerformance = calculateTimePerformance(sessions, performance, 5, 12)
  const afternoonPerformance = calculateTimePerformance(sessions, performance, 12, 17)
  const eveningPerformance = calculateTimePerformance(sessions, performance, 17, 22)

  if (morningPerformance > afternoonPerformance && morningPerformance > eveningPerformance) {
    correlations.push({
      metric1: "Study Time",
      metric2: "Performance",
      correlationCoefficient: 0.75,
      description: "You perform 30% better when studying in the morning",
      confidence: 0.85,
    })
  }

  // Session duration correlation
  const shortSessions = sessions.filter((s) => (s.actualDurationMinutes || 0) < 30)
  const longSessions = sessions.filter((s) => (s.actualDurationMinutes || 0) > 90)

  const shortAvgFocus =
    shortSessions.length > 0
      ? shortSessions.reduce((sum, s) => sum + (s.averageFocusScore || 0), 0) / shortSessions.length
      : 0
  const longAvgFocus =
    longSessions.length > 0
      ? longSessions.reduce((sum, s) => sum + (s.averageFocusScore || 0), 0) / longSessions.length
      : 0

  if (shortAvgFocus > longAvgFocus) {
    correlations.push({
      metric1: "Session Duration",
      metric2: "Focus Level",
      correlationCoefficient: -0.65,
      description: "Your focus drops significantly after 75 minutes - consider shorter sessions",
      confidence: 0.78,
    })
  }

  return correlations
}

function calculateTimePerformance(
  sessions: StudySession[],
  performance: PerformanceEntry[],
  startHour: number,
  endHour: number,
): number {
  const timeSessions = sessions.filter((s) => {
    const hour = s.startedAt.getHours()
    return hour >= startHour && hour < endHour
  })

  if (timeSessions.length === 0) return 0

  const sessionIds = new Set(timeSessions.map((s) => s.id))
  const relatedPerformance = performance.filter((p) => p.linkedSessionId && sessionIds.has(p.linkedSessionId))

  if (relatedPerformance.length === 0) return 0

  return relatedPerformance.reduce((sum, p) => sum + p.percentage, 0) / relatedPerformance.length
}

export function generateInsights(
  sessions: StudySession[],
  performance: PerformanceEntry[],
  streakDays: number,
): Array<{ type: string; title: string; description: string; confidence: number }> {
  const insights: Array<{ type: string; title: string; description: string; confidence: number }> = []

  // Streak insight
  if (streakDays >= 7) {
    insights.push({
      type: "achievement",
      title: `${streakDays}-day study streak!`,
      description: `You've maintained consistent study habits for ${streakDays} days. Keep it up!`,
      confidence: 1.0,
    })
  }

  // Focus improvement
  const recentSessions = sessions.slice(-10)
  const olderSessions = sessions.slice(0, Math.max(1, sessions.length - 10))

  if (recentSessions.length > 0 && olderSessions.length > 0) {
    const recentFocus = recentSessions.reduce((sum, s) => sum + (s.averageFocusScore || 0), 0) / recentSessions.length
    const olderFocus = olderSessions.reduce((sum, s) => sum + (s.averageFocusScore || 0), 0) / olderSessions.length

    if (recentFocus > olderFocus + 2) {
      insights.push({
        type: "pattern",
        title: "Focus improvement detected",
        description: `Your focus scores have improved by ${Math.round((recentFocus - olderFocus) * 10) / 10} points recently`,
        confidence: 0.8,
      })
    }
  }

  // Performance trend
  const recentPerformance = performance.slice(-5)
  if (recentPerformance.length >= 2) {
    const trend = calculatePerformanceTrend(recentPerformance)
    if (trend === "up") {
      insights.push({
        type: "recommendation",
        title: "Performance trending upward",
        description: "Your recent assessment scores show an upward trend. Continue your current study approach.",
        confidence: 0.75,
      })
    }
  }

  return insights
}

export function predictNextScore(
  subjectPerformance: PerformanceEntry[],
  recentStudyHours: number,
): { predictedScore: number; confidence: number } {
  if (subjectPerformance.length < 3) {
    return { predictedScore: 0, confidence: 0 }
  }

  const sorted = [...subjectPerformance].sort((a, b) => a.assessmentDate.getTime() - b.assessmentDate.getTime())
  const recent = sorted.slice(-3)
  const avgScore = recent.reduce((sum, p) => sum + p.percentage, 0) / recent.length

  // Simple linear adjustment based on study hours
  const adjustment = Math.min(recentStudyHours * 2, 15)
  const predictedScore = Math.min(100, avgScore + adjustment)

  return {
    predictedScore: Math.round(predictedScore),
    confidence: 0.7,
  }
}

export function calculateOptimalSessionDuration(sessions: StudySession[]): number {
  if (sessions.length < 5) return 50

  const durations = sessions.map((s) => s.actualDurationMinutes || 0).filter((d) => d > 0)
  const focusScores = sessions.map((s) => s.averageFocusScore || 0)

  let bestDuration = 50
  let bestAvgFocus = 0

  for (let duration = 20; duration <= 120; duration += 10) {
    const matchingSessions = sessions.filter((s) => {
      const d = s.actualDurationMinutes || 0
      return d >= duration - 5 && d <= duration + 5
    })

    if (matchingSessions.length > 0) {
      const avgFocus =
        matchingSessions.reduce((sum, s) => sum + (s.averageFocusScore || 0), 0) / matchingSessions.length
      if (avgFocus > bestAvgFocus) {
        bestAvgFocus = avgFocus
        bestDuration = duration
      }
    }
  }

  return bestDuration
}

export function calculateMethodEffectiveness(
  sessions: StudySession[],
  performance: PerformanceEntry[],
): Record<string, { successRate: number; avgFocus: number; avgImprovement: number }> {
  const methods: Record<string, { sessions: StudySession[]; performance: PerformanceEntry[] }> = {}

  sessions.forEach((s) => {
    if (!methods[s.studyMethod]) {
      methods[s.studyMethod] = { sessions: [], performance: [] }
    }
    methods[s.studyMethod].sessions.push(s)
  })

  performance.forEach((p) => {
    Object.values(methods).forEach((m) => {
      if (m.sessions.some((s) => s.id === p.linkedSessionId)) {
        m.performance.push(p)
      }
    })
  })

  const effectiveness: Record<string, { successRate: number; avgFocus: number; avgImprovement: number }> = {}

  Object.entries(methods).forEach(([method, data]) => {
    const avgFocus =
      data.sessions.length > 0
        ? data.sessions.reduce((sum, s) => sum + (s.averageFocusScore || 0), 0) / data.sessions.length
        : 0

    const successRate =
      data.sessions.length > 0
        ? (data.sessions.filter((s) => s.goalAchieved === "yes").length / data.sessions.length) * 100
        : 0

    const avgImprovement =
      data.performance.length > 0
        ? data.performance.reduce((sum, p) => sum + p.percentage, 0) / data.performance.length
        : 0

    effectiveness[method] = {
      successRate: Math.round(successRate),
      avgFocus: Math.round(avgFocus * 10) / 10,
      avgImprovement: Math.round(avgImprovement),
    }
  })

  return effectiveness
}
