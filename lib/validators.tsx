import { z } from "zod"

// User & Auth Validators
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  educationLevel: z.enum(["high_school", "undergraduate", "graduate", "exam_prep"]),
  primaryGoal: z.enum(["improve_grades", "exam_prep", "skill_learning", "time_management"]),
  studyStyle: z.enum(["visual", "auditory", "kinesthetic", "reading_writing"]),
  energyLevel: z.enum(["morning", "afternoon", "evening", "night_owl"]),
  currentChallenges: z.array(z.string()).optional(),
  isGuest: z.boolean().default(false),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  educationLevel: z.enum(["high_school", "undergraduate", "graduate", "exam_prep"]).optional(),
  primaryGoal: z.enum(["improve_grades", "exam_prep", "skill_learning", "time_management"]).optional(),
  studyStyle: z.enum(["visual", "auditory", "kinesthetic", "reading_writing"]).optional(),
  energyLevel: z.enum(["morning", "afternoon", "evening", "night_owl"]).optional(),
  currentChallenges: z.array(z.string()).optional(),
})

// Subject Validators
export const createSubjectSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(["mathematics", "science", "language", "social_studies", "technical", "other"]),
  difficultyLevel: z.enum(["easy", "medium", "hard", "very_hard"]),
  currentGrade: z.number().min(0).max(100).optional(),
  targetGrade: z.number().min(0).max(100).optional(),
  creditsWeight: z.number().positive().optional(),
  colorTheme: z.string().regex(/^#[0-9A-F]{6}$/i),
  instructorName: z.string().max(255).optional(),
  examDate: z.string().datetime().optional(),
})

export const updateSubjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.enum(["mathematics", "science", "language", "social_studies", "technical", "other"]).optional(),
  difficultyLevel: z.enum(["easy", "medium", "hard", "very_hard"]).optional(),
  currentGrade: z.number().min(0).max(100).optional(),
  targetGrade: z.number().min(0).max(100).optional(),
  colorTheme: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  isActive: z.boolean().optional(),
})

// Session Validators
export const createSessionSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required"),
  studyMethod: z.enum(["reading", "practice_problems", "video_lecture", "notes", "flashcards", "group_study", "other"]),
  sessionGoal: z.string().max(500).optional(),
  location: z.string().max(255).optional(),
  targetDurationMinutes: z.number().int().positive().optional(),
})

export const endSessionSchema = z.object({
  actualDurationMinutes: z.number().int().positive(),
  averageFocusScore: z.number().min(1).max(10),
  goalAchieved: z.enum(["yes", "partial", "no"]),
  challenges: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
  confidenceLevel: z.number().min(1).max(10).optional(),
})

export const focusCheckinSchema = z.object({
  focusScore: z.number().int().min(1).max(10),
})

// Performance Validators
export const createPerformanceSchema = z.object({
  // Basic Required Fields
  subjectId: z.string().min(1, "Subject ID is required"),
  entryType: z.enum(["quiz", "test", "exam", "assignment", "self_assessment", "mock_test"]),
  score: z.number(),
  totalPossible: z.number().positive(),
  assessmentDate: z.string().datetime(),
  
  // Assessment Identification
  assessmentTitle: z.string().optional(),
  assessmentType: z.string().optional(),
  assessmentIdNumber: z.string().optional(),
  assessmentTime: z.string().optional(),
  dateReceivedResults: z.string().datetime().optional(),
  
  // Score Details
  percentage: z.number().optional(),
  grade: z.string().optional(),
  scoreFormat: z.string().optional(),
  assessmentWeight: z.number().optional(),
  importanceLevel: z.string().optional(),
  countsTowardFinal: z.number().optional(),
  
  // Class Context
  classAverage: z.number().optional(),
  highestScore: z.number().optional(),
  lowestScore: z.number().optional(),
  yourRank: z.number().optional(),
  percentile: z.number().optional(),
  totalStudents: z.number().optional(),
  
  // Content Coverage
  chaptersCovered: z.string().optional(),
  topicsTested: z.string().optional(),
  totalQuestions: z.number().optional(),
  questionsCorrect: z.number().optional(),
  topicBreakdown: z.string().optional(),
  
  // Time Information
  timeAllocatedMinutes: z.number().optional(),
  timeTakenMinutes: z.number().optional(),
  timePressureLevel: z.string().optional(),
  
  // Preparation Information
  totalHoursStudied: z.number().optional(),
  daysOfPreparation: z.number().optional(),
  preparationStartDate: z.string().datetime().optional(),
  studyMethodsUsed: z.string().optional(),
  preparationQuality: z.number().optional(),
  
  // Linked Sessions
  linkedSessionIds: z.string().optional(),
  totalLinkedStudyHours: z.number().optional(),
  averageLinkedFocus: z.number().optional(),
  
  // Pre-Assessment State
  confidenceBefore: z.number().optional(),
  feltPrepared: z.string().optional(),
  expectedScoreMin: z.number().optional(),
  expectedScoreMax: z.number().optional(),
  sleepNightBefore: z.number().optional(),
  stressLevelBefore: z.number().optional(),
  healthStatus: z.string().optional(),
  otherFactors: z.string().optional(),
  
  // Post-Assessment Reflection
  scoreVsExpectation: z.string().optional(),
  scoreSurpriseLevel: z.number().optional(),
  confidenceAfterTaking: z.number().optional(),
  confidenceAfterResults: z.number().optional(),
  scoreReflectsKnowledge: z.string().optional(),
  
  // Performance Analysis
  strengthsTopics: z.string().optional(),
  strengthsQuestionTypes: z.string().optional(),
  whatHelpedSucceed: z.string().optional(),
  weaknessesTopics: z.string().optional(),
  weaknessesQuestionTypes: z.string().optional(),
  commonMistakes: z.string().optional(),
  conceptsStillUnclear: z.string().optional(),
  
  // Detailed Analysis
  questionsMissedBreakdown: z.string().optional(),
  
  // Learning Insights
  lessonsLearned: z.string().optional(),
  whatToDoDifferently: z.string().optional(),
  mostEffectiveStudyApproach: z.string().optional(),
  leastEffectiveStudyApproach: z.string().optional(),
  
  // Next Steps
  topicsToReview: z.string().optional(),
  conceptsNeedingRelearning: z.string().optional(),
  actionPlan: z.string().optional(),
  targetScoreNext: z.number().optional(),
  specificSkillsToWorkOn: z.string().optional(),
  studyApproachChanges: z.string().optional(),
  
  // Tags & Notes
  assessmentTags: z.string().optional(),
  overallNotes: z.string().optional(),
  instructorFeedback: z.string().optional(),
  peerComparisonNotes: z.string().optional(),
  personalReflection: z.string().optional(),
  
  // Legacy fields for backward compatibility
  assessmentName: z.string().max(255).optional(),
  difficultyRating: z.enum(["easy", "medium", "hard", "very_hard"]).optional(),
  topicsCovered: z.array(z.string()).optional(),
  timeSpentMinutes: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
  linkedSessionId: z.string().optional(),
})

// Goal Validators
export const createGoalSchema = z.object({
  subjectId: z.string().optional(),
  goalType: z.enum([
    "study_hours",
    "session_count",
    "performance_average",
    "streak_length",
    "subject_completion",
    "custom",
  ]),
  goalCategory: z.enum(["daily", "weekly", "monthly", "semester", "annual"]),
  targetValue: z.number().positive(),
  metricName: z.string().max(255).optional(),
  deadline: z.string().datetime().optional(),
})

// Preferences Validators
export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]).optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  fontSize: z.enum(["small", "medium", "large"]).optional(),
  timeFormat: z.enum(["12h", "24h"]).optional(),
  weekStartDay: z.enum(["sunday", "monday"]).optional(),
  timezone: z.string().optional(),
  defaultSessionDurationMinutes: z.number().int().positive().optional(),
  breakIntervalMinutes: z.number().int().positive().optional(),
  notificationsEnabled: z.boolean().optional(),
  studyRemindersEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
})

// Scheduled Session Validators
export const createScheduledSessionSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required"),
  scheduledDate: z.string().datetime(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().int().positive(),
  studyMethod: z
    .enum(["reading", "practice_problems", "video_lecture", "notes", "flashcards", "group_study", "other"])
    .optional(),
})

// Report Validators
export const createReportSchema = z.object({
  reportType: z.enum(["weekly", "monthly", "custom"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

// Export types
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>
export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type EndSessionInput = z.infer<typeof endSessionSchema>
export type FocusCheckinInput = z.infer<typeof focusCheckinSchema>
export type CreatePerformanceInput = z.infer<typeof createPerformanceSchema>
export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
export type CreateScheduledSessionInput = z.infer<typeof createScheduledSessionSchema>
export type CreateReportInput = z.infer<typeof createReportSchema>

// Alias exports for performanceSchema and subjectSchema to match API route imports
export const performanceSchema = createPerformanceSchema
export const subjectSchema = createSubjectSchema
