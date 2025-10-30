// User Types
export interface User {
  id: string
  email: string
  name: string
  educationLevel: "high_school" | "undergraduate" | "graduate" | "exam_prep"
  primaryGoal: "improve_grades" | "exam_prep" | "skill_learning" | "time_management"
  studyStyle: "visual" | "auditory" | "kinesthetic" | "reading_writing"
  studyEnvironment?: string
  energyLevel: "morning" | "afternoon" | "evening" | "night_owl"
  currentChallenges: string[]
  profilePictureUrl?: string
  isGuest: boolean
  createdAt: Date
  updatedAt: Date
}

// Subject Types
export interface Subject {
  id: string
  userId: string
  name: string
  category: "mathematics" | "science" | "language" | "social_studies" | "technical" | "other"
  difficultyLevel: "easy" | "medium" | "hard" | "very_hard"
  currentGrade?: number
  targetGrade?: number
  creditsWeight?: number
  colorTheme: string
  instructorName?: string
  examDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Study Session Types
export interface StudySession {
  id: string
  userId: string
  subjectId: string
  studyMethod: "reading" | "practice_problems" | "video_lecture" | "notes" | "flashcards" | "group_study" | "other"
  sessionGoal?: string
  location?: string
  durationMinutes: number
  actualDurationMinutes?: number
  targetDurationMinutes?: number
  averageFocusScore?: number
  goalAchieved?: "yes" | "partial" | "no"
  challenges?: string[]
  notes?: string
  breakDurationMinutes: number
  startedAt: Date
  endedAt?: Date
  pausedDurationMinutes: number
  createdAt: Date
  updatedAt: Date
}

// Focus Check-in Types
export interface FocusCheckin {
  id: string
  sessionId: string
  focusScore: number
  timestamp: Date
}

// Performance Entry Types
export interface PerformanceEntry {
  id: string
  userId: string
  subjectId: string
  entryType: "quiz" | "test" | "exam" | "assignment" | "self_assessment" | "mock_test"
  score: number
  totalPossible: number
  percentage: number
  assessmentName?: string
  difficultyRating?: "easy" | "medium" | "hard" | "very_hard"
  topicsCovered?: string[]
  timeSpentMinutes?: number
  notes?: string
  linkedSessionId?: string
  assessmentDate: Date
  createdAt: Date
  updatedAt: Date
}

// Goal Types
export interface Goal {
  id: string
  userId: string
  subjectId?: string
  goalType: "study_hours" | "session_count" | "performance_average" | "streak_length" | "subject_completion" | "custom"
  goalCategory: "daily" | "weekly" | "monthly" | "semester" | "annual"
  targetValue: number
  currentValue: number
  metricName?: string
  deadline?: Date
  isCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

// Achievement Types
export interface Achievement {
  id: string
  userId: string
  achievementType: string
  achievementName: string
  description?: string
  badgeIcon?: string
  earnedAt: Date
  createdAt: Date
}

// Streak Types
export interface Streak {
  id: string
  userId: string
  subjectId?: string
  streakType: "study" | "subject_specific"
  currentStreakDays: number
  longestStreakDays: number
  lastStudyDate?: Date
  skipsUsed: number
  createdAt: Date
  updatedAt: Date
}

// User Preferences Types
export interface UserPreferences {
  id: string
  userId: string
  theme: "light" | "dark" | "auto"
  primaryColor: string
  fontSize: "small" | "medium" | "large"
  timeFormat: "12h" | "24h"
  weekStartDay: "sunday" | "monday"
  timezone: string
  defaultSessionDurationMinutes: number
  breakIntervalMinutes: number
  focusCheckinFrequencyMinutes: number
  minSessionDurationMinutes: number
  autoPauseDetection: boolean
  notificationsEnabled: boolean
  studyRemindersEnabled: boolean
  breakRemindersEnabled: boolean
  performanceRemindersEnabled: boolean
  insightNotificationsEnabled: boolean
  achievementNotificationsEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  dataRetentionDays: number
  createdAt: Date
  updatedAt: Date
}

// Insight Types
export interface Insight {
  id: string
  userId: string
  insightType: "pattern" | "alert" | "recommendation" | "achievement"
  title: string
  description: string
  dataJson?: Record<string, any>
  confidenceLevel?: number
  isRead: boolean
  createdAt: Date
}

// Learning Style Profile Types
export interface LearningStyleProfile {
  id: string
  userId: string
  visualPercentage: number
  auditoryPercentage: number
  kinestheticPercentage: number
  readingWritingPercentage: number
  primaryStyle?: string
  lastUpdated: Date
}

// Method Effectiveness Types
export interface MethodEffectiveness {
  id: string
  userId: string
  subjectId?: string
  studyMethod: string
  totalSessions: number
  averageFocusScore?: number
  averagePerformanceImprovement?: number
  successRate?: number
  lastUsedDate?: Date
  createdAt: Date
  updatedAt: Date
}

// Scheduled Session Types
export interface ScheduledSession {
  id: string
  userId: string
  subjectId: string
  scheduledDate: Date
  scheduledTime: string
  durationMinutes: number
  studyMethod?: string
  isCompleted: boolean
  completedSessionId?: string
  createdAt: Date
  updatedAt: Date
}

// Report Types
export interface Report {
  id: string
  userId: string
  reportType: "weekly" | "monthly" | "custom"
  startDate: Date
  endDate: Date
  totalStudyHours?: number
  sessionsCount?: number
  subjectsStudied?: string[]
  performanceEntriesCount?: number
  reportData?: Record<string, any>
  createdAt: Date
}

// Analytics Types
export interface DashboardStats {
  totalStudyHours: number
  sessionsCompleted: number
  currentStreak: number
  averageFocusScore: number
  bestPerformingSubject?: string
  weeklyStudyTime: number[]
  todayStudyTime: number
  todaySessionsCount: number
  focusScoreToday: number
}

export interface TimeAnalysis {
  hourlyHeatmap: Record<number, number>
  bestProductiveHours: number[]
  dayOfWeekPatterns: Record<string, number>
}

export interface SubjectPerformance {
  subjectId: string
  subjectName: string
  totalTimeStudied: number
  averageSessionDuration: number
  lastStudiedDate?: Date
  performanceTrend: "up" | "down" | "stable"
  currentGrade?: number
  recentScores: number[]
}

export interface CorrelationAnalysis {
  metric1: string
  metric2: string
  correlationCoefficient: number
  description: string
  confidence: number
}
