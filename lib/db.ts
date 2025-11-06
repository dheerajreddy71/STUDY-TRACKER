// PostgreSQL/Supabase Database Module
// Migrated from SQLite to Supabase for production deployment

import { db as pgDb } from './db-supabase'

// Database wrapper that mimics better-sqlite3 API but uses PostgreSQL
const getDb = () => ({
  prepare: (sql: string) => ({
    run: async (...params: any[]) => {
      await pgDb.prepare(sql).run(...params)
    },
    get: async (...params: any[]) => {
      return await pgDb.prepare(sql).get(...params)
    },
    all: async (...params: any[]) => {
      return await pgDb.prepare(sql).all(...params)
    },
  }),
  exec: async (sql: string) => {
    await pgDb.exec(sql)
  },
})

function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36)
  )
}

// Whitelist of valid column names for each table to prevent SQL injection
const VALID_COLUMNS: Record<string, Set<string>> = {
  users: new Set(['email', 'name', 'full_name', 'education_level', 'primary_goal', 'study_style', 'energy_level', 'current_challenges', 'is_guest', 'avatar_url', 'bio', 'timezone', 'notification_preferences']),
  subjects: new Set(['name', 'subject_code', 'category', 'difficulty_level', 'current_priority', 'priority_level', 'priority_reason', 'color_theme', 'icon', 'current_performance', 'target_performance', 'baseline_performance', 'target_weekly_hours', 'minimum_hours_per_week', 'min_hours_per_week', 'recommended_session_duration', 'preferred_study_method', 'next_exam_date', 'exam_type', 'exam_weightage', 'exam_prep_status', 'exam_preparation_status', 'total_chapters', 'completed_chapters', 'current_chapter', 'topics_list', 'textbook_name', 'textbook_edition', 'online_resources', 'video_course_links', 'study_materials_location', 'reference_books', 'description', 'subject_description', 'study_strategy_notes', 'instructor_name', 'class_schedule', 'notes', 'current_grade', 'target_grade', 'is_active']),
  study_sessions: new Set(['subject_id', 'study_method', 'session_goal', 'location', 'target_duration_minutes', 'started_at', 'ended_at', 'duration_minutes', 'actual_duration_minutes', 'average_focus_score', 'distractions_count', 'breaks_taken', 'productivity_rating', 'energy_level_before', 'energy_level_after', 'mood_before', 'mood_after', 'key_concepts_learned', 'questions_encountered', 'resources_used', 'accomplishments', 'challenges_faced', 'action_items', 'reflection_notes', 'is_completed']),
  performance_entries: new Set(['user_id', 'subject_id', 'assessment_type', 'assessment_title', 'total_marks', 'marks_obtained', 'percentage', 'grade', 'assessment_date', 'difficulty_level', 'preparation_time_hours', 'study_method_used', 'topics_covered', 'strengths', 'weaknesses', 'mistakes_made', 'lessons_learned', 'notes', 'confidence_level_before', 'confidence_level_after', 'time_spent_on_assessment_minutes', 'key_concepts_tested', 'areas_for_improvement', 'what_went_well', 'whatToDoDifferently', 'what_to_do_differently', 'next_steps']),
  goals: new Set(['user_id', 'subject_id', 'goal_type', 'title', 'description', 'target_value', 'current_value', 'unit', 'deadline', 'priority', 'status', 'progress_status', 'completion_date', 'notes', 'milestones', 'is_active']),
  user_preferences: new Set(['user_id', 'theme', 'language', 'timezone', 'notification_email', 'notification_push', 'notification_reminders', 'default_session_duration', 'default_break_duration', 'focus_check_interval', 'daily_study_goal_hours', 'weekly_study_goal_hours', 'preferred_study_times', 'analytics_visibility']),
  resources: new Set(['user_id', 'subject_id', 'title', 'type', 'url', 'description', 'file_path', 'tags', 'rating', 'notes', 'is_favorite', 'access_count', 'last_accessed_at']),
  calendar_events: new Set(['user_id', 'subject_id', 'title', 'description', 'event_type', 'start_datetime', 'end_datetime', 'location', 'is_recurring', 'recurrence_pattern', 'reminder_minutes_before', 'is_completed', 'completion_notes']),
  resource_collections: new Set(['user_id', 'name', 'description', 'subject_id', 'resource_ids', 'priority_order', 'color_code', 'icon', 'is_public', 'tags'])
}

function validateAndSanitizeUpdates(tableName: string, updates: Record<string, any>): { keys: string[], values: any[] } {
  const validColumns = VALID_COLUMNS[tableName]
  if (!validColumns) {
    throw new Error(`Unknown table: ${tableName}`)
  }
  
  const keys: string[] = []
  const values: any[] = []
  
  for (const [key, value] of Object.entries(updates)) {
    if (validColumns.has(key)) {
      keys.push(key)
      values.push(value)
    } else {
      console.warn(`Ignoring invalid column "${key}" for table "${tableName}"`)
    }
  }
  
  if (keys.length === 0) {
    throw new Error('No valid columns to update')
  }
  
  return { keys, values }
}


export const database: any = {
  // Users
  async createUser(user: {
    email: string
    name: string
    educationLevel: string
    primaryGoal: string
    studyStyle: string
    energyLevel: string
    currentChallenges: string[]
    isGuest: boolean
  }) {
    const database = getDb()
    const id = generateId()
    // Only insert core fields that exist in the schema
    const stmt = database.prepare(`
      INSERT INTO users (id, email, full_name, academic_level, learning_style, is_guest)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    await stmt.run(
      id,
      user.email,
      user.name || user.email.split('@')[0], // Use email username if name not provided
      user.educationLevel || 'other',
      user.studyStyle || 'multimodal',
      user.isGuest ? true : false,
    )
    return await database.prepare("SELECT * FROM users WHERE id = ?").get(id)
  },

  async getUser(id: string) {
    const database = getDb()
    return await database.prepare("SELECT * FROM users WHERE id = ?").get(id)
  },

  async getUserByEmail(email: string) {
    const database = getDb()
    return await database.prepare("SELECT * FROM users WHERE email = ?").get(email)
  },

  async updateUser(id: string, updates: Record<string, any>) {
    const database = getDb()
    const { keys, values } = validateAndSanitizeUpdates('users', updates)
    const setClause = keys.map((k) => `${k} = ?`).join(", ")
    const stmt = database.prepare(`UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`)
    await stmt.run(...values, id)
    return await database.prepare("SELECT * FROM users WHERE id = ?").get(id)
  },

  // Subjects
  async createSubject(subject: {
    userId: string
    name: string
    subjectCode?: string | null
    category: string
    difficultyLevel: string
    priorityLevel?: string
    priorityReason?: string | null
    subjectDescription?: string | null
    colorTheme: string
    targetWeeklyHours?: number
    minHoursPerWeek?: number | null
    recommendedSessionDuration?: number
    preferredStudyMethod?: string | null
    currentPerformance?: number
    targetPerformance?: number
    baselinePerformance?: number | null
    nextExamDate?: string | null
    examType?: string | null
    examWeightage?: number | null
    examPreparationStatus?: string
    totalChapters?: number | null
    completedChapters?: number
    currentChapter?: string | null
    textbookName?: string | null
    textbookEdition?: string | null
    onlineResources?: string | null
    videoCourseLinks?: string | null
    studyMaterialsLocation?: string | null
    classSchedule?: string | null
    studyStrategyNotes?: string | null
    notes?: string | null
    currentGrade?: number
    targetGrade?: number
  }) {
    const database = getDb()
    const id = generateId()
    const stmt = database.prepare(`
      INSERT INTO subjects (
        id, user_id, name, subject_code, category, difficulty_level, priority_level, 
        priority_reason, subject_description, color_theme, target_weekly_hours, 
        min_hours_per_week, recommended_session_duration, preferred_study_method,
        current_performance, target_performance, baseline_performance, next_exam_date,
        exam_type, exam_weightage, exam_preparation_status, total_chapters, 
        completed_chapters, current_chapter, textbook_name, textbook_edition,
        online_resources, video_course_links, study_materials_location, class_schedule,
        study_strategy_notes, notes, current_grade, target_grade
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    await stmt.run(
      id,
      subject.userId,
      subject.name,
      subject.subjectCode || null,
      subject.category,
      subject.difficultyLevel,
      subject.priorityLevel || "medium",
      subject.priorityReason || null,
      subject.subjectDescription || null,
      subject.colorTheme,
      subject.targetWeeklyHours || 5,
      subject.minHoursPerWeek || null,
      subject.recommendedSessionDuration || 45,
      subject.preferredStudyMethod || null,
      subject.currentPerformance || 0,
      subject.targetPerformance || 100,
      subject.baselinePerformance || null,
      subject.nextExamDate || null,
      subject.examType || null,
      subject.examWeightage || null,
      subject.examPreparationStatus || "not_started",
      subject.totalChapters || null,
      subject.completedChapters || 0,
      subject.currentChapter || null,
      subject.textbookName || null,
      subject.textbookEdition || null,
      subject.onlineResources || null,
      subject.videoCourseLinks || null,
      subject.studyMaterialsLocation || null,
      subject.classSchedule || null,
      subject.studyStrategyNotes || null,
      subject.notes || null,
      subject.currentGrade || null,
      subject.targetGrade || null
    )
    return await database.prepare("SELECT * FROM subjects WHERE id = ?").get(id)
  },

  async getSubjects(userId: string) {
    const database = getDb()
    const subjects = database.prepare(`
      SELECT 
        s.*,
        COALESCE(SUM(ss.duration_minutes), 0) / 60.0 as total_study_hours,
        COUNT(DISTINCT ss.id) as total_sessions,
        COALESCE(AVG(pe.percentage), 0) as current_performance_score
      FROM subjects s
      LEFT JOIN study_sessions ss ON s.id = ss.subject_id AND ss.ended_at IS NOT NULL
      LEFT JOIN performance_entries pe ON s.id = pe.subject_id
      WHERE s.user_id = ? AND s.is_active = 1
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `).all(userId)
    
    return subjects
  },

  async getSubject(id: string) {
    const database = getDb()
    return await database.prepare("SELECT * FROM subjects WHERE id = ?").get(id)
  },

  async updateSubject(id: string, updates: Record<string, any>) {
    const database = getDb()
    const { keys, values } = validateAndSanitizeUpdates('subjects', updates)
    const setClause = keys.map((k) => `${k} = ?`).join(", ")
    const stmt = database.prepare(`UPDATE subjects SET ${setClause}, updated_at = NOW() WHERE id = ?`)
    await stmt.run(...values, id)
    return await database.prepare("SELECT * FROM subjects WHERE id = ?").get(id)
  },

  async deleteSubject(id: string) {
    const database = getDb()
    await database.prepare("UPDATE subjects SET is_active = 0 WHERE id = ?").run(id)
  },

  // Study Sessions
  async createSession(session: {
    userId: string
    subjectId: string
    studyMethod: string
    sessionGoal?: string
    location?: string
    targetDurationMinutes?: number
    startedAt: Date | string
  }) {
    const database = getDb()
    const id = generateId()
    const stmt = database.prepare(`
      INSERT INTO study_sessions (id, user_id, subject_id, study_method, session_goal, location, target_duration_minutes, started_at, duration_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `)
    await stmt.run(
      id,
      session.userId,
      session.subjectId,
      session.studyMethod,
      session.sessionGoal || null,
      session.location || null,
      session.targetDurationMinutes || 50,
      typeof session.startedAt === 'string' ? session.startedAt : session.startedAt.toISOString(),
    )
    return await database.prepare("SELECT * FROM study_sessions WHERE id = ?").get(id)
  },

  async getSessions(userId: string, limit = 50, offset = 0) {
    const database = getDb()
    return database
      .prepare(`
        SELECT 
          ss.*,
          s.name as subject_name,
          s.category as subject_category
        FROM study_sessions ss
        LEFT JOIN subjects s ON ss.subject_id = s.id
        WHERE ss.user_id = ? 
        ORDER BY ss.started_at DESC 
        LIMIT ? OFFSET ?
      `)
      .all(userId, limit, offset)
  },

  async getSession(id: string) {
    const database = getDb()
    return await database.prepare(`
      SELECT 
        ss.*,
        s.name as subject_name,
        s.category,
        s.color_theme
      FROM study_sessions ss
      LEFT JOIN subjects s ON ss.subject_id = s.id
      WHERE ss.id = ?
    `).get(id)
  },

  async updateSession(id: string, updates: Record<string, any>) {
    const database = getDb()
    const { keys, values } = validateAndSanitizeUpdates('study_sessions', updates)
    const setClause = keys.map((k) => `${k} = ?`).join(", ")
    const stmt = database.prepare(`UPDATE study_sessions SET ${setClause}, updated_at = NOW() WHERE id = ?`)
    await stmt.run(...values, id)
    return await database.prepare("SELECT * FROM study_sessions WHERE id = ?").get(id)
  },

  async deleteSession(id: string) {
    const database = getDb()
    // Permanently remove a session record. Use with caution.
    await database.prepare("DELETE FROM study_sessions WHERE id = ?").run(id)
  },

  async endSession(
    id: string,
    endData: {
      actualDurationMinutes: number
      averageFocusScore: number
      goalAchieved: string
      accomplishments?: string
      challenges?: string[]
      notes?: string
      // Comprehensive fields
      focusRating?: number | null
      productivityRating?: number | null
      retentionRating?: number | null
      effortRating?: number | null
      difficultyRating?: number | null
      engagementRating?: number | null
      satisfactionRating?: number | null
      goalsAchievedPercentage?: number | null
      topicsFullyUnderstood?: number | null
      topicsNeedReview?: number | null
      pagesCompleted?: number | null
      problemsCompleted?: number | null
      whatWentWell?: string | null
      whatDidntGoWell?: string | null
      keyConceptsLearned?: string | null
      difficultiesEncountered?: string | null
      questionsToResearch?: string | null
      methodEffective?: string | null
      betterMethodSuggestion?: string | null
      mainDistractionSource?: string | null
      distractionImpact?: string | null
      energyLevelAfter?: number | null
      confidenceLevel?: number | null
      actionItems?: string | null
      topicsForReview?: string | null
      nextSessionFocus?: string | null
      scheduleNextSession?: number
      overallNotes?: string | null
      sessionTags?: string | null
    },
  ) {
    const database = getDb()
    const endedAt = new Date().toISOString()
    const stmt = database.prepare(`
      UPDATE study_sessions 
      SET ended_at = ?, 
          actual_duration_minutes = ?, 
          average_focus_score = ?, 
          goal_achieved = ?,
          accomplishments = ?,
          challenges = ?, 
          notes = ?, 
          duration_minutes = ?,
          focus_rating = ?,
          productivity_rating = ?,
          retention_rating = ?,
          effort_rating = ?,
          difficulty_rating = ?,
          engagement_rating = ?,
          satisfaction_rating = ?,
          goals_achieved_percentage = ?,
          topics_fully_understood = ?,
          topics_need_review = ?,
          pages_completed = ?,
          problems_completed = ?,
          what_went_well = ?,
          what_didnt_go_well = ?,
          key_concepts_learned = ?,
          difficulties_encountered = ?,
          questions_to_research = ?,
          method_effective = ?,
          better_method_suggestion = ?,
          main_distraction_source = ?,
          distraction_impact = ?,
          energy_level_after = ?,
          confidence_level = ?,
          action_items = ?,
          topics_for_review = ?,
          next_session_focus = ?,
          schedule_next_session = ?,
          overall_notes = ?,
          session_tags = ?,
          updated_at = NOW()
      WHERE id = ?
    `)
    await stmt.run(
      endedAt,
      endData.actualDurationMinutes,
      endData.averageFocusScore,
      endData.goalAchieved,
      endData.accomplishments || null,
      endData.challenges ? JSON.stringify(endData.challenges) : null,
      endData.notes || null,
      endData.actualDurationMinutes,
      endData.focusRating || null,
      endData.productivityRating || null,
      endData.retentionRating || null,
      endData.effortRating || null,
      endData.difficultyRating || null,
      endData.engagementRating || null,
      endData.satisfactionRating || null,
      endData.goalsAchievedPercentage || null,
      endData.topicsFullyUnderstood || null,
      endData.topicsNeedReview || null,
      endData.pagesCompleted || null,
      endData.problemsCompleted || null,
      endData.whatWentWell || null,
      endData.whatDidntGoWell || null,
      endData.keyConceptsLearned || null,
      endData.difficultiesEncountered || null,
      endData.questionsToResearch || null,
      endData.methodEffective || null,
      endData.betterMethodSuggestion || null,
      endData.mainDistractionSource || null,
      endData.distractionImpact || null,
      endData.energyLevelAfter || null,
      endData.confidenceLevel || null,
      endData.actionItems || null,
      endData.topicsForReview || null,
      endData.nextSessionFocus || null,
      endData.scheduleNextSession || 0,
      endData.overallNotes || null,
      endData.sessionTags || null,
      id,
    )
    return await database.prepare("SELECT * FROM study_sessions WHERE id = ?").get(id)
  },

  // Focus Check-ins
  async addFocusCheckin(sessionId: string, focusScore: number) {
    const database = getDb()
    const id = generateId()
    const stmt = database.prepare(`
      INSERT INTO focus_checkins (id, session_id, focus_score)
      VALUES (?, ?, ?)
    `)
    await stmt.run(id, sessionId, focusScore)
    return { id, sessionId, focusScore }
  },

  async getFocusCheckins(sessionId: string) {
    const database = getDb()
    return await database.prepare("SELECT * FROM focus_checkins WHERE session_id = ? ORDER BY timestamp ASC").all(sessionId)
  },

  // Performance Entries
  async createPerformance(entry: {
    userId: string
    subjectId: string
    entryType: string
    score: number
    totalPossible: number
    assessmentDate: Date | string
    
    // Assessment Identification
    assessmentTitle?: string
    assessmentType?: string
    assessmentIdNumber?: string
    assessmentTime?: string
    dateReceivedResults?: Date | string
    
    // Score Details
    percentage?: number
    grade?: string
    scoreFormat?: string
    assessmentWeight?: number
    importanceLevel?: string
    countsTowardFinal?: number
    
    // Class Context
    classAverage?: number
    highestScore?: number
    lowestScore?: number
    yourRank?: number
    percentile?: number
    totalStudents?: number
    
    // Content Coverage
    chaptersCovered?: string
    topicsTested?: string
    totalQuestions?: number
    questionsCorrect?: number
    topicBreakdown?: string
    
    // Time Information
    timeAllocatedMinutes?: number
    timeTakenMinutes?: number
    timePressureLevel?: string
    
    // Preparation Information
    totalHoursStudied?: number
    daysOfPreparation?: number
    preparationStartDate?: Date | string
    studyMethodsUsed?: string
    preparationQuality?: number
    
    // Linked Sessions
    linkedSessionIds?: string
    totalLinkedStudyHours?: number
    averageLinkedFocus?: number
    
    // Pre-Assessment State
    confidenceBefore?: number
    feltPrepared?: string
    expectedScoreMin?: number
    expectedScoreMax?: number
    sleepNightBefore?: number
    stressLevelBefore?: number
    healthStatus?: string
    otherFactors?: string
    
    // Post-Assessment Reflection
    scoreVsExpectation?: string
    scoreSurpriseLevel?: number
    confidenceAfterTaking?: number
    confidenceAfterResults?: number
    scoreReflectsKnowledge?: string
    
    // Performance Analysis
    strengthsTopics?: string
    strengthsQuestionTypes?: string
    whatHelpedSucceed?: string
    weaknessesTopics?: string
    weaknessesQuestionTypes?: string
    commonMistakes?: string
    conceptsStillUnclear?: string
    
    // Detailed Analysis
    questionsMissedBreakdown?: string
    
    // Learning Insights
    lessonsLearned?: string
    whatToDoDifferently?: string
    mostEffectiveStudyApproach?: string
    leastEffectiveStudyApproach?: string
    
    // Next Steps
    topicsToReview?: string
    conceptsNeedingRelearning?: string
    actionPlan?: string
    targetScoreNext?: number
    specificSkillsToWorkOn?: string
    studyApproachChanges?: string
    
    // Tags & Notes
    assessmentTags?: string
    overallNotes?: string
    instructorFeedback?: string
    peerComparisonNotes?: string
    personalReflection?: string
    
    // Legacy fields for backward compatibility
    assessmentName?: string
    linkedSessionId?: string
    difficultyRating?: string
    topicsCovered?: string[]
    timeSpentMinutes?: number
    notes?: string
  }) {
    const database = getDb()
    const id = generateId()
    const percentage = entry.percentage || ((entry.score * 100) / entry.totalPossible)
    
    const stmt = database.prepare(`
      INSERT INTO performance_entries (
        id, user_id, subject_id, entry_type, score, total_possible, percentage, 
        assessment_date,
        assessment_title, assessment_type, assessment_id_number, assessment_time, 
        date_received_results,
        grade, score_format, assessment_weight, importance_level, counts_toward_final,
        class_average, highest_score, lowest_score, your_rank, percentile, total_students,
        chapters_covered, topics_tested, total_questions, questions_correct, topic_breakdown,
        time_allocated_minutes, time_taken_minutes, time_pressure_level,
        total_hours_studied, days_of_preparation, preparation_start_date, study_methods_used, 
        preparation_quality,
        linked_session_ids, total_linked_study_hours, average_linked_focus,
        confidence_before, felt_prepared, expected_score_min, expected_score_max, 
        sleep_night_before, stress_level_before, health_status, other_factors,
        score_vs_expectation, score_surprise_level, confidence_after_taking, 
        confidence_after_results, score_reflects_knowledge,
        strengths_topics, strengths_question_types, what_helped_succeed,
        weaknesses_topics, weaknesses_question_types, common_mistakes, concepts_still_unclear,
        questions_missed_breakdown,
        lessons_learned, what_to_do_differently, most_effective_study_approach, 
        least_effective_study_approach,
        topics_to_review, concepts_needing_relearning, action_plan, target_score_next,
        specific_skills_to_work_on, study_approach_changes,
        assessment_tags, overall_notes, instructor_feedback, peer_comparison_notes, 
        personal_reflection,
        assessment_name, linked_session_id, difficulty_rating, topics_covered, 
        time_spent_minutes, notes
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `)
    
    await stmt.run(
      id,
      entry.userId,
      entry.subjectId,
      entry.entryType,
      entry.score,
      entry.totalPossible,
      percentage,
      typeof entry.assessmentDate === 'string' ? entry.assessmentDate : entry.assessmentDate.toISOString(),
      // Assessment Identification
      entry.assessmentTitle || null,
      entry.assessmentType || entry.entryType,
      entry.assessmentIdNumber || null,
      entry.assessmentTime || null,
      entry.dateReceivedResults ? (typeof entry.dateReceivedResults === 'string' ? entry.dateReceivedResults : entry.dateReceivedResults.toISOString()) : null,
      // Score Details
      entry.grade || null,
      entry.scoreFormat || 'percentage',
      entry.assessmentWeight || null,
      entry.importanceLevel || 'medium',
      entry.countsTowardFinal !== undefined ? entry.countsTowardFinal : 1,
      // Class Context
      entry.classAverage || null,
      entry.highestScore || null,
      entry.lowestScore || null,
      entry.yourRank || null,
      entry.percentile || null,
      entry.totalStudents || null,
      // Content Coverage
      entry.chaptersCovered || null,
      entry.topicsTested || null,
      entry.totalQuestions || null,
      entry.questionsCorrect || null,
      entry.topicBreakdown || null,
      // Time Information
      entry.timeAllocatedMinutes || null,
      entry.timeTakenMinutes || entry.timeSpentMinutes || null,
      entry.timePressureLevel || 'just_right',
      // Preparation Information
      entry.totalHoursStudied || null,
      entry.daysOfPreparation || null,
      entry.preparationStartDate ? (typeof entry.preparationStartDate === 'string' ? entry.preparationStartDate : entry.preparationStartDate.toISOString()) : null,
      entry.studyMethodsUsed || null,
      entry.preparationQuality || null,
      // Linked Sessions
      entry.linkedSessionIds || null,
      entry.totalLinkedStudyHours || null,
      entry.averageLinkedFocus || null,
      // Pre-Assessment State
      entry.confidenceBefore || null,
      entry.feltPrepared || null,
      entry.expectedScoreMin || null,
      entry.expectedScoreMax || null,
      entry.sleepNightBefore || null,
      entry.stressLevelBefore || null,
      entry.healthStatus || null,
      entry.otherFactors || null,
      // Post-Assessment Reflection
      entry.scoreVsExpectation || null,
      entry.scoreSurpriseLevel || null,
      entry.confidenceAfterTaking || null,
      entry.confidenceAfterResults || null,
      entry.scoreReflectsKnowledge || null,
      // Performance Analysis
      entry.strengthsTopics || null,
      entry.strengthsQuestionTypes || null,
      entry.whatHelpedSucceed || null,
      entry.weaknessesTopics || null,
      entry.weaknessesQuestionTypes || null,
      entry.commonMistakes || null,
      entry.conceptsStillUnclear || null,
      // Detailed Analysis
      entry.questionsMissedBreakdown || null,
      // Learning Insights
      entry.lessonsLearned || null,
      entry.whatToDoDifferently || null,
      entry.mostEffectiveStudyApproach || null,
      entry.leastEffectiveStudyApproach || null,
      // Next Steps
      entry.topicsToReview || null,
      entry.conceptsNeedingRelearning || null,
      entry.actionPlan || null,
      entry.targetScoreNext || null,
      entry.specificSkillsToWorkOn || null,
      entry.studyApproachChanges || null,
      // Tags & Notes
      entry.assessmentTags || null,
      entry.overallNotes || null,
      entry.instructorFeedback || null,
      entry.peerComparisonNotes || null,
      entry.personalReflection || null,
      // Legacy fields
      entry.assessmentName || entry.assessmentTitle || null,
      entry.linkedSessionId || null,
      entry.difficultyRating || null,
      entry.topicsCovered ? JSON.stringify(entry.topicsCovered) : null,
      entry.timeSpentMinutes || null,
      entry.notes || null,
    )
    return await database.prepare("SELECT * FROM performance_entries WHERE id = ?").get(id)
  },

  async getPerformance(userId: string) {
    const database = getDb()
    return await database.prepare(`
      SELECT 
        pe.*,
        s.name as subject_name
      FROM performance_entries pe
      LEFT JOIN subjects s ON pe.subject_id = s.id
      WHERE pe.user_id = ? 
      ORDER BY pe.assessment_date DESC
    `).all(userId)
  },

  async getPerformanceBySubject(userId: string, subjectId: string) {
    const database = getDb()
    return database
      .prepare(`
        SELECT 
          pe.*,
          s.name as subject_name
        FROM performance_entries pe
        LEFT JOIN subjects s ON pe.subject_id = s.id
        WHERE pe.user_id = ? AND pe.subject_id = ? 
        ORDER BY pe.assessment_date DESC
      `)
      .all(userId, subjectId)
  },

  async updatePerformance(id: string, updates: Record<string, any>) {
    const database = getDb()
    const { keys, values } = validateAndSanitizeUpdates('performance_entries', updates)
    const setClause = keys.map((k) => `${k} = ?`).join(", ")
    const stmt = database.prepare(`UPDATE performance_entries SET ${setClause}, updated_at = NOW() WHERE id = ?`)
    await stmt.run(...values, id)
    return await database.prepare("SELECT * FROM performance_entries WHERE id = ?").get(id)
  },

  // Goals
  async createGoal(goal: Record<string, any>) {
    const database = getDb()
    const id = generateId()
    
    // Build comprehensive insert statement with all fields
    const fields = ['id', 'user_id']
    const placeholders = ['?', '?']
    const values: any[] = [id, goal.userId]
    
    // Map all incoming goal fields to database columns
    const fieldMapping: Record<string, string> = {
      subjectId: 'subject_id',
      goalName: 'goal_name',
      goalDescription: 'goal_description',
      goalType: 'goal_type',
      goalCategory: 'goal_category',
      targetValue: 'target_value',
      currentValue: 'current_value',
      metricName: 'metric_name',
      deadline: 'deadline',
      unit: 'unit',
      startDate: 'start_date',
      targetCompletionDate: 'target_completion_date',
      durationDays: 'duration_days',
      milestones: 'milestones',
      priorityLevel: 'priority_level',
      importanceReason: 'importance_reason',
      motivationStatement: 'motivation_statement',
      rewardOnCompletion: 'reward_on_completion',
      consequenceIfMissed: 'consequence_if_missed',
      trackAutomatically: 'track_automatically',
      sendReminders: 'send_reminders',
      reminderFrequency: 'reminder_frequency',
      reminderTime: 'reminder_time',
      alertWhenBehind: 'alert_when_behind',
      celebrateMilestones: 'celebrate_milestones',
      visibleOnDashboard: 'visible_on_dashboard',
      percentageComplete: 'percentage_complete',
      progressPercentage: 'progress_percentage',
      progressStatus: 'progress_status',
      status: 'status',
      onTrackStatus: 'on_track_status',
      parentGoalId: 'parent_goal_id',
      relatedGoals: 'related_goals'
    }
    
    Object.keys(fieldMapping).forEach(jsField => {
      if (goal[jsField] !== undefined) {
        fields.push(fieldMapping[jsField])
        placeholders.push('?')
        values.push(goal[jsField])
      }
    })
    
    const stmt = database.prepare(`
      INSERT INTO goals (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
    `)
    await stmt.run(...values)
    return await database.prepare("SELECT * FROM goals WHERE id = ?").get(id)
  },

  async getGoals(userId: string) {
    const database = getDb()
    const goals = await database.prepare("SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC").all(userId)
    
    // Transform snake_case to camelCase and calculate percentage
    return goals.map((goal: any) => {
      const percentageComplete = goal.target_value && goal.target_value > 0
        ? Math.min(100, Math.max(0, (goal.current_value / goal.target_value) * 100))
        : 0
      
      return {
        ...goal,
        // Add camelCase aliases for snake_case fields
        goalName: goal.goal_name,
        goalDescription: goal.goal_description,
        goalType: goal.goal_type,
        goalCategory: goal.goal_category,
        targetValue: goal.target_value,
        currentValue: goal.current_value,
        unit: goal.unit,
        progressStatus: goal.progress_status,
        priorityLevel: goal.priority_level,
        startDate: goal.start_date,
        targetDate: goal.target_completion_date,
        targetCompletionDate: goal.target_completion_date,
        actualCompletionDate: goal.actual_completion_date,
        onTrackStatus: goal.on_track_status,
        percentageComplete: percentageComplete,
        progressPercentage: percentageComplete,
        importanceReason: goal.importance_reason,
        motivationStatement: goal.motivation_statement,
        trackAutomatically: goal.track_automatically,
        sendReminders: goal.send_reminders,
        reminderFrequency: goal.reminder_frequency,
        lastReminderSent: goal.last_reminder_sent,
        bookmarked: goal.bookmarked,
        relatedGoalIds: goal.related_goal_ids,
        subgoals: goal.subgoals,
        milestones: goal.milestones,
        rewards: goal.rewards,
        consequencesIfFailed: goal.consequences_if_failed,
        visualizationImageUrl: goal.visualization_image_url,
        notesPrivateThoughts: goal.notes_private_thoughts,
        successCriteria: goal.success_criteria,
        linkedSubjectId: goal.linked_subject_id,
        subjectId: goal.subject_id,
        createdAt: goal.created_at,
        updatedAt: goal.updated_at
      }
    })
  },
  
  async getGoal(id: string) {
    const database = getDb()
    const goal: any = await database.prepare("SELECT * FROM goals WHERE id = ?").get(id)
    
    if (!goal) return null
    
    // Transform snake_case to camelCase and calculate percentage
    const percentageComplete = goal.target_value && goal.target_value > 0
      ? Math.min(100, Math.max(0, (goal.current_value / goal.target_value) * 100))
      : 0
    
    return {
      ...goal,
      goalName: goal.goal_name,
      goalDescription: goal.goal_description,
      goalType: goal.goal_type,
      goalCategory: goal.goal_category,
      targetValue: goal.target_value,
      currentValue: goal.current_value,
      unit: goal.unit,
      progressStatus: goal.progress_status,
      priorityLevel: goal.priority_level,
      startDate: goal.start_date,
      targetDate: goal.target_completion_date,
      targetCompletionDate: goal.target_completion_date,
      actualCompletionDate: goal.actual_completion_date,
      onTrackStatus: goal.on_track_status,
      percentageComplete: percentageComplete,
      progressPercentage: percentageComplete,
      importanceReason: goal.importance_reason,
      motivationStatement: goal.motivation_statement,
      trackAutomatically: goal.track_automatically,
      sendReminders: goal.send_reminders,
      reminderFrequency: goal.reminder_frequency,
      lastReminderSent: goal.last_reminder_sent,
      bookmarked: goal.bookmarked,
      relatedGoalIds: goal.related_goal_ids,
      subgoals: goal.subgoals,
      milestones: goal.milestones,
      rewards: goal.rewards,
      consequencesIfFailed: goal.consequences_if_failed,
      visualizationImageUrl: goal.visualization_image_url,
      notesPrivateThoughts: goal.notes_private_thoughts,
      successCriteria: goal.success_criteria,
      linkedSubjectId: goal.linked_subject_id,
      subjectId: goal.subject_id,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    }
  },

  async updateGoal(id: string, updates: Record<string, any>) {
    const database = getDb()
    const { keys, values } = validateAndSanitizeUpdates('goals', updates)
    const setClause = keys.map((k) => `${k} = ?`).join(", ")
    const stmt = database.prepare(`UPDATE goals SET ${setClause}, updated_at = NOW() WHERE id = ?`)
    await stmt.run(...values, id)
    return await database.prepare("SELECT * FROM goals WHERE id = ?").get(id)
  },
  
  async deleteGoal(id: string) {
    const database = getDb()
    const stmt = database.prepare("DELETE FROM goals WHERE id = ?")
    await stmt.run(id)
  },

  // Achievements
  async createAchievement(achievement: {
    userId: string
    achievementType: string
    achievementName: string
    description?: string
    badgeIcon?: string
  }) {
    const database = getDb()
    const id = generateId()
    const stmt = database.prepare(`
      INSERT INTO achievements (id, user_id, achievement_type, achievement_name, description, badge_icon)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    await stmt.run(
      id,
      achievement.userId,
      achievement.achievementType,
      achievement.achievementName,
      achievement.description || null,
      achievement.badgeIcon || null,
    )
    return await database.prepare("SELECT * FROM achievements WHERE id = ?").get(id)
  },

  // Preferences
  async getOrCreatePreferences(userId: string) {
    const database = getDb()
    const existing = await database.prepare("SELECT * FROM user_preferences WHERE user_id = ?").get(userId)
    if (existing) return existing

    const id = generateId()
    const stmt = database.prepare("INSERT INTO user_preferences (id, user_id) VALUES (?, ?)")
    await stmt.run(id, userId)
    return await database.prepare("SELECT * FROM user_preferences WHERE id = ?").get(id)
  },

  async updatePreferences(userId: string, updates: Record<string, any>) {
    const database = getDb()
    const { keys, values } = validateAndSanitizeUpdates('user_preferences', updates)
    const setClause = keys.map((k) => `${k} = ?`).join(", ")
    const stmt = database.prepare(`UPDATE user_preferences SET ${setClause}, updated_at = NOW() WHERE user_id = ?`)
    await stmt.run(...values, userId)
    return await database.prepare("SELECT * FROM user_preferences WHERE user_id = ?").get(userId)
  },

  // Scheduled Sessions
  async createScheduledSession(session: {
    userId: string
    subjectId: string
    scheduledDate: string
    scheduledTime: string
    durationMinutes: number
    studyMethod?: string
  }) {
    const database = getDb()
    const id = generateId()
    const stmt = database.prepare(`
      INSERT INTO scheduled_sessions (id, user_id, subject_id, scheduled_date, scheduled_time, duration_minutes, study_method)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    await stmt.run(
      id,
      session.userId,
      session.subjectId,
      session.scheduledDate,
      session.scheduledTime,
      session.durationMinutes,
      session.studyMethod || null,
    )
    return await database.prepare("SELECT * FROM scheduled_sessions WHERE id = ?").get(id)
  },

  async getScheduledSessions(userId: string, fromDate?: string, toDate?: string) {
    const database = getDb()
    if (fromDate && toDate) {
      return database
        .prepare("SELECT * FROM scheduled_sessions WHERE user_id = ? AND scheduled_date BETWEEN ? AND ? ORDER BY scheduled_date, scheduled_time")
        .all(userId, fromDate, toDate)
    }
    return await database.prepare("SELECT * FROM scheduled_sessions WHERE user_id = ? ORDER BY scheduled_date, scheduled_time").all(userId)
  },

  async completeScheduledSession(id: string, completedSessionId: string) {
    const database = getDb()
    await database.prepare("UPDATE scheduled_sessions SET is_completed = 1, completed_session_id = ? WHERE id = ?").run(completedSessionId, id)
  },

  // Method Effectiveness
  async updateMethodEffectiveness(
    userId: string,
    subjectId: string | null,
    studyMethod: string,
    focusScore: number,
    performanceImprovement?: number,
  ) {
    const database = getDb()
    const existing: any = database
      .prepare("SELECT * FROM method_effectiveness WHERE user_id = ? AND subject_id IS ? AND study_method = ?")
      .get(userId, subjectId, studyMethod)

    if (existing) {
      const newTotal = (existing.total_sessions || 0) + 1
      const newAvgFocus =
        ((existing.average_focus_score || 0) * (existing.total_sessions || 0) + focusScore) / newTotal
      const newAvgPerf = performanceImprovement
        ? ((existing.average_performance_improvement || 0) * (existing.total_sessions || 0) + performanceImprovement) / newTotal
        : existing.average_performance_improvement

      database.prepare(`
        UPDATE method_effectiveness 
        SET total_sessions = ?, 
            average_focus_score = ?, 
            average_performance_improvement = ?,
            last_used = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = ?
      `).run(newTotal, newAvgFocus, newAvgPerf, existing.id)
    } else {
      const id = generateId()
      database.prepare(`
        INSERT INTO method_effectiveness (id, user_id, subject_id, study_method, total_sessions, average_focus_score, average_performance_improvement, last_used)
        VALUES (?, ?, ?, ?, 1, ?, ?, CURRENT_DATE)
      `).run(id, userId, subjectId, studyMethod, focusScore, performanceImprovement || null)
    }
  },

  async getMethodEffectiveness(userId: string, subjectId?: string) {
    const database = getDb()
    if (subjectId) {
      return database
        .prepare("SELECT * FROM method_effectiveness WHERE user_id = ? AND subject_id = ?")
        .all(userId, subjectId)
    }
    return await database.prepare("SELECT * FROM method_effectiveness WHERE user_id = ?").all(userId)
  },

  // Reports
  async createReport(report: {
    userId: string
    reportType: string
    startDate: Date | string
    endDate: Date | string
    totalStudyHours?: number
    sessionsCount?: number
    reportData?: Record<string, any>
  }) {
    const database = getDb()
    const id = generateId()
    const stmt = database.prepare(`
      INSERT INTO reports (id, user_id, report_type, start_date, end_date, total_study_hours, sessions_count, report_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    await stmt.run(
      id,
      report.userId,
      report.reportType,
      typeof report.startDate === 'string' ? report.startDate : report.startDate.toISOString().split('T')[0],
      typeof report.endDate === 'string' ? report.endDate : report.endDate.toISOString().split('T')[0],
      report.totalStudyHours || null,
      report.sessionsCount || null,
      report.reportData ? JSON.stringify(report.reportData) : null,
    )
    return await database.prepare("SELECT * FROM reports WHERE id = ?").get(id)
  },

  async getReports(userId: string) {
    const database = getDb()
    return await database.prepare("SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC").all(userId)
  },

  // Analytics queries
  async getStudyStats(userId: string, fromDate: string, toDate: string) {
    const database = getDb()
    return database.prepare(`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(duration_minutes) as total_minutes,
        AVG(average_focus_score) as avg_focus,
        AVG(duration_minutes) as avg_duration
      FROM study_sessions
      WHERE user_id = ? AND started_at BETWEEN ? AND ?
    `).get(userId, fromDate, toDate)
  },

  async getSubjectStats(userId: string, fromDate: string, toDate: string) {
    const database = getDb()
    return database.prepare(`
      SELECT 
        s.id, s.name, s.color_theme,
        COUNT(ss.id) as session_count,
        SUM(ss.duration_minutes) as total_minutes,
        AVG(ss.average_focus_score) as avg_focus
      FROM subjects s
      LEFT JOIN study_sessions ss ON s.id = ss.subject_id AND ss.started_at BETWEEN ? AND ?
      WHERE s.user_id = ? AND s.is_active = 1
      GROUP BY s.id
      ORDER BY total_minutes DESC
    `).all(fromDate, toDate, userId)
  },

  async getPerformanceStats(userId: string, fromDate: string, toDate: string) {
    const database = getDb()
    return database.prepare(`
      SELECT 
        s.id, s.name, s.color_theme,
        COUNT(pe.id) as assessment_count,
        AVG(pe.percentage) as avg_percentage,
        MIN(pe.percentage) as min_percentage,
        MAX(pe.percentage) as max_percentage
      FROM subjects s
      LEFT JOIN performance_entries pe ON s.id = pe.subject_id AND pe.assessment_date BETWEEN ? AND ?
      WHERE s.user_id = ? AND s.is_active = 1
      GROUP BY s.id
      ORDER BY avg_percentage DESC
    `).all(fromDate, toDate, userId)
  },

  async getMethodStats(userId: string, fromDate: string, toDate: string) {
    const database = getDb()
    return database.prepare(`
      SELECT 
        study_method,
        COUNT(*) as session_count,
        SUM(duration_minutes) as total_minutes,
        AVG(average_focus_score) as avg_focus,
        AVG(duration_minutes) as avg_duration
      FROM study_sessions
      WHERE user_id = ? AND started_at BETWEEN ? AND ? AND study_method IS NOT NULL
      GROUP BY study_method
      ORDER BY session_count DESC
    `).all(userId, fromDate, toDate)
  },

  // Audit Log
  async logAction(
    userId: string,
    action: string,
    entityType?: string,
    entityId?: string,
    changes?: Record<string, any>,
  ) {
    const database = getDb()
    const id = generateId()
    database.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, changes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      action,
      entityType || null,
      entityId || null,
      changes ? JSON.stringify(changes) : null,
    )
  },

  // ============================================================================
  // RESOURCES MANAGEMENT
  // ============================================================================
  
  async createResource(resource: Record<string, any>) {
    const database = getDb()
    const id = generateId()
    
    // Build comprehensive insert with all 35+ fields
    const fields: string[] = []
    const placeholders: string[] = []
    const values: any[] = []
    
    // Required fields
    fields.push('id', 'user_id', 'resource_name', 'resource_type', 'access_type')
    placeholders.push('?', '?', '?', '?', '?')
    values.push(id, resource.userId, resource.resourceName, resource.resourceType, resource.accessType || 'owned')
    
    // Optional fields mapping
    const optionalFields: Record<string, any> = {
      primary_subject_id: resource.primarySubjectId,
      secondary_subject_ids: resource.secondarySubjectIds,
      topics_covered: resource.topicsCovered,
      chapters_sections: resource.chaptersSections,
      author_creator: resource.authorCreator,
      publisher: resource.publisher,
      edition_version: resource.editionVersion,
      publication_date: resource.publicationDate,
      isbn_id: resource.isbnId,
      language: resource.language || 'English',
      difficulty_level: resource.difficultyLevel,
      recommended_for: resource.recommendedFor,
      location_link: resource.locationLink,
      file_path: resource.filePath,
      url: resource.url,
      physical_location: resource.physicalLocation,
      library_call_number: resource.libraryCallNumber,
      access_status: resource.accessStatus || 'available',
      total_pages: resource.totalPages,
      total_duration_minutes: resource.totalDurationMinutes,
      total_chapters: resource.totalChapters,
      current_progress_pages: resource.currentProgressPages || 0,
      current_progress_percentage: resource.currentProgressPercentage || 0,
      completion_status: resource.completionStatus || 'not_started',
      personal_rating: resource.personalRating,
      usefulness_rating: resource.usefulnessRating,
      quality_rating: resource.qualityRating,
      difficulty_vs_expected: resource.difficultyVsExpected,
      recommend_to_others: resource.recommendToOthers,
      personal_notes: resource.personalNotes,
      key_insights: resource.keyInsights,
      summary: resource.summary,
      important_sections: resource.importantSections,
      cross_references: resource.crossReferences,
      pros: resource.pros,
      cons: resource.cons,
      best_used_for: resource.bestUsedFor,
      supplements_well_with: resource.supplementsWellWith,
      resource_tags: resource.resourceTags,
      required_by_course: resource.requiredByCourse ? 1 : 0,
      recommended_by_instructor: resource.recommendedByInstructor ? 1 : 0,
      official_course_material: resource.officialCourseMaterial ? 1 : 0,
      instructor_name: resource.instructorName,
      course_name_code: resource.courseNameCode,
      syllabus_section: resource.syllabusSection
    }
    
    Object.entries(optionalFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fields.push(key)
        placeholders.push('?')
        values.push(value)
      }
    })
    
    const stmt = database.prepare(`
      INSERT INTO resources (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
    `)
    await stmt.run(...values)
    return await database.prepare("SELECT * FROM resources WHERE id = ?").get(id)
  },

  async getResources(userId: string) {
    const database = getDb()
    const resources = await database.prepare(`
      SELECT r.*, s.name as subject_name
      FROM resources r
      LEFT JOIN subjects s ON r.primary_subject_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `).all(userId)
    
    // Transform snake_case to camelCase
    return resources.map((resource: any) => ({
      ...resource,
      resourceName: resource.resource_name,
      resourceType: resource.resource_type,
      authorCreator: resource.author_creator,
      publisher: resource.publisher,
      editionVersion: resource.edition_version,
      url: resource.url,
      summary: resource.summary,
      primarySubjectId: resource.primary_subject_id,
      secondarySubjectIds: resource.secondary_subject_ids,
      completionStatus: resource.completion_status,
      currentProgressPercentage: resource.current_progress_percentage,
      currentProgressPages: resource.current_progress_pages,
      totalPages: resource.total_pages,
      difficultyLevel: resource.difficulty_level,
      personalRating: resource.personal_rating,
      accessType: resource.access_type,
      timesAccessed: resource.times_accessed,
      lastAccessedAt: resource.last_accessed_at,
      subjectName: resource.subject_name,
      createdAt: resource.created_at,
      updatedAt: resource.updated_at
    }))
  },

  async getResource(id: string) {
    const database = getDb()
    const resource: any = await database.prepare("SELECT * FROM resources WHERE id = ?").get(id)
    
    if (!resource) return null
    
    // Transform snake_case to camelCase
    return {
      ...resource,
      resourceName: resource.resource_name,
      resourceType: resource.resource_type,
      authorCreator: resource.author_creator,
      publisher: resource.publisher,
      editionVersion: resource.edition_version,
      url: resource.url,
      summary: resource.summary,
      primarySubjectId: resource.primary_subject_id,
      secondarySubjectIds: resource.secondary_subject_ids,
      completionStatus: resource.completion_status,
      currentProgressPercentage: resource.current_progress_percentage,
      currentProgressPages: resource.current_progress_pages,
      totalPages: resource.total_pages,
      difficultyLevel: resource.difficulty_level,
      personalRating: resource.personal_rating,
      accessType: resource.access_type,
      timesAccessed: resource.times_accessed,
      lastAccessedAt: resource.last_accessed_at,
      createdAt: resource.created_at,
      updatedAt: resource.updated_at
    }
  },

  async getResourcesBySubject(subjectId: string) {
    const database = getDb()
    return await database.prepare(`
      SELECT * FROM resources 
      WHERE primary_subject_id = ? OR secondary_subject_ids LIKE ?
      ORDER BY resource_name
    `).all(subjectId, `%"${subjectId}"%`)
  },

  async updateResource(id: string, updates: Record<string, any>) {
    const database = getDb()
    const { keys, values } = validateAndSanitizeUpdates('resources', updates)
    const setClause = keys.map(key => `${key} = ?`).join(", ")
    database.prepare(`UPDATE resources SET ${setClause}, updated_at = NOW() WHERE id = ?`).run(...values, id)
    return await database.prepare("SELECT * FROM resources WHERE id = ?").get(id)
  },

  async deleteResource(id: string) {
    const database = getDb()
    await database.prepare("DELETE FROM resources WHERE id = ?").run(id)
  },

  async updateResourceProgress(id: string, pagesRead: number, percentage: number) {
    const database = getDb()
    database.prepare(`
      UPDATE resources 
      SET current_progress_pages = ?, current_progress_percentage = ?,
          last_accessed = NOW(), times_accessed = times_accessed + 1,
          updated_at = NOW()
      WHERE id = ?
    `).run(pagesRead, percentage, id)
  },

  async updateResourceRating(id: string, personalRating: number, usefulnessRating: string, qualityRating: string) {
    const database = getDb()
    database.prepare(`
      UPDATE resources 
      SET personal_rating = ?, usefulness_rating = ?, quality_rating = ?,
          updated_at = NOW()
      WHERE id = ?
    `).run(personalRating, usefulnessRating, qualityRating, id)
  },

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  async createNotification(notification: {
    userId: string
    notificationType: string
    title: string
    message: string
    priorityLevel?: string
    actionRequired?: boolean
    primaryActionText?: string
    primaryActionLink?: string
    secondaryActionText?: string
    secondaryActionLink?: string
    relatedSubjectId?: string
    relatedGoalId?: string
    relatedSessionId?: string
    relatedAssessmentId?: string
    expiryDate?: string
    repeatSchedule?: string
  }) {
    const database = getDb()
    const id = generateId()
    database.prepare(`
      INSERT INTO notifications (
        id, user_id, notification_type, title, message, priority_level,
        action_required, primary_action_text, primary_action_link,
        secondary_action_text, secondary_action_link, related_subject_id,
        related_goal_id, related_session_id, related_assessment_id,
        expiry_date, repeat_schedule
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      notification.userId,
      notification.notificationType,
      notification.title,
      notification.message,
      notification.priorityLevel || 'medium',
      notification.actionRequired ? 1 : 0,
      notification.primaryActionText || null,
      notification.primaryActionLink || null,
      notification.secondaryActionText || null,
      notification.secondaryActionLink || null,
      notification.relatedSubjectId || null,
      notification.relatedGoalId || null,
      notification.relatedSessionId || null,
      notification.relatedAssessmentId || null,
      notification.expiryDate || null,
      notification.repeatSchedule || null,
    )
    return await database.prepare("SELECT * FROM notifications WHERE id = ?").get(id)
  },

  async getNotifications(userId: string, status?: string) {
    const database = getDb()
    if (status) {
      return await database.prepare(`
        SELECT * FROM notifications 
        WHERE user_id = ? AND status = ?
        ORDER BY created_at DESC
        LIMIT 100
      `).all(userId, status)
    }
    return await database.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(userId)
  },

  async getUnreadNotificationCount(userId: string) {
    const database = getDb()
    const result = database.prepare(`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND status = 'unread'
    `).get(userId) as any
    return result.count
  },

  async markNotificationRead(id: string) {
    const database = getDb()
    database.prepare(`
      UPDATE notifications 
      SET status = 'read', read_at = NOW()
      WHERE id = ?
    `).run(id)
  },

  async markNotificationActedUpon(id: string, actionTaken: string) {
    const database = getDb()
    database.prepare(`
      UPDATE notifications 
      SET status = 'acted_upon', user_action_taken = ?, acted_upon_at = NOW()
      WHERE id = ?
    `).run(actionTaken, id)
  },

  async dismissNotification(id: string, reason?: string) {
    const database = getDb()
    await database.prepare(`
      UPDATE notifications 
      SET status = 'dismissed', dismissed_reason = ?
      WHERE id = ?
    `).run(reason || null, id)
  },

  async snoozeNotification(id: string, snoozeUntil: string) {
    const database = getDb()
    await database.prepare(`
      UPDATE notifications 
      SET snoozed_until = ?
      WHERE id = ?
    `).run(snoozeUntil, id)
  },

  // ============================================================================
  // ACHIEVEMENTS & GAMIFICATION
  // ============================================================================

  async initializeAchievements(userId: string) {
    const database = getDb()
    const achievementDefs = [
      { key: 'first_session', name: 'First Step', description: 'Complete your first study session', category: 'consistency', rarity: 'common', xp: 10, target: 1 },
      { key: 'streak_7', name: 'Week Warrior', description: 'Study for 7 days in a row', category: 'consistency', rarity: 'uncommon', xp: 50, target: 7 },
      { key: 'streak_30', name: 'Month Master', description: 'Study for 30 days in a row', category: 'consistency', rarity: 'rare', xp: 200, target: 30 },
      { key: 'streak_100', name: 'Century Scholar', description: 'Study for 100 days in a row', category: 'consistency', rarity: 'epic', xp: 1000, target: 100 },
      { key: 'sessions_10', name: 'Getting Started', description: 'Complete 10 study sessions', category: 'volume', rarity: 'common', xp: 25, target: 10 },
      { key: 'sessions_50', name: 'Dedicated Learner', description: 'Complete 50 study sessions', category: 'volume', rarity: 'uncommon', xp: 100, target: 50 },
      { key: 'sessions_100', name: 'Study Champion', description: 'Complete 100 study sessions', category: 'volume', rarity: 'rare', xp: 250, target: 100 },
      { key: 'hours_10', name: 'Time Investment', description: 'Study for 10 hours total', category: 'volume', rarity: 'common', xp: 30, target: 10 },
      { key: 'hours_50', name: 'Serious Student', description: 'Study for 50 hours total', category: 'volume', rarity: 'uncommon', xp: 120, target: 50 },
      { key: 'hours_100', name: 'Master of Time', description: 'Study for 100 hours total', category: 'volume', rarity: 'rare', xp: 300, target: 100 },
      { key: 'focus_100', name: 'Laser Focus', description: 'Achieve 100% focus in a session', category: 'focus', rarity: 'rare', xp: 150, target: 1 },
      { key: 'perfect_score', name: 'Perfection', description: 'Score 100% on an assessment', category: 'performance', rarity: 'epic', xp: 500, target: 1 },
      { key: 'goal_complete', name: 'Goal Getter', description: 'Complete your first goal', category: 'goals', rarity: 'uncommon', xp: 75, target: 1 },
      { key: 'all_methods', name: 'Method Explorer', description: 'Try all study methods', category: 'methods', rarity: 'rare', xp: 200, target: 1 },
    ]

    for (const def of achievementDefs) {
      try {
        database.prepare(`
          INSERT INTO achievements (
            id, user_id, achievement_key, achievement_name, achievement_description,
            achievement_category, rarity, xp_value, progress_target, criteria
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          generateId(),
          userId,
          def.key,
          def.name,
          def.description,
          def.category,
          def.rarity,
          def.xp,
          def.target,
          JSON.stringify({ type: def.category, target: def.target })
        )
      } catch (error) {
        // Achievement might already exist, skip
      }
    }
  },

  async getAchievements(userId: string) {
    const database = getDb()
    return await database.prepare(`
      SELECT * FROM achievements 
      WHERE user_id = ?
      ORDER BY earned_at DESC, created_at DESC
    `).all(userId)
  },

  async unlockAchievement(userId: string, achievementType: string) {
    const database = getDb()
    const achievement = await database.prepare(`
      SELECT * FROM achievements 
      WHERE user_id = ? AND achievement_type = ?
    `).get(userId, achievementType) as any

    // If achievement already exists, return it
    if (achievement) {
      return achievement
    }

    // Generate ID
    const id = generateId()

    // Create new achievement with RETURNING clause for PostgreSQL
    const newAchievement = await database.prepare(`
      INSERT INTO achievements (id, user_id, achievement_type, achievement_name, description, badge_icon)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      achievementType,
      achievementType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      `Earned ${achievementType} achievement`,
      '🏆'
    )

    return await database.prepare('SELECT * FROM achievements WHERE id = ?').get(id)
  },

  async updateAchievementProgress(userId: string, achievementType: string, progress: number) {
    // Simplified version - achievements table doesn't have progress tracking
    // Just return null for now
    return null
  },

  // ============================================================================
  // STREAKS
  // ============================================================================

  async getStreaks(userId: string) {
    const database = getDb()
    return await database.prepare(`
      SELECT s.*, sub.name as subject_name
      FROM streaks s
      LEFT JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.user_id = ?
    `).all(userId)
  },

  async getStreak(userId: string, streakType: string, subjectId?: string) {
    const database = getDb()
    if (subjectId) {
      return await database.prepare(`
        SELECT * FROM streaks 
        WHERE user_id = ? AND streak_type = ? AND subject_id = ?
      `).get(userId, streakType, subjectId)
    }
    return await database.prepare(`
      SELECT * FROM streaks 
      WHERE user_id = ? AND streak_type = ? AND subject_id IS NULL
    `).get(userId, streakType)
  },

  async calculateAndUpdateStreak(userId: string, subjectId?: string) {
    // Calculate current and longest streak from actual session data
    const database = getDb()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const query = subjectId 
      ? `SELECT DISTINCT DATE(started_at) as session_date 
         FROM study_sessions 
         WHERE user_id = ? AND subject_id = ?
         ORDER BY session_date DESC`
      : `SELECT DISTINCT DATE(started_at) as session_date 
         FROM study_sessions 
         WHERE user_id = ?
         ORDER BY session_date DESC`
    
    const params = subjectId ? [userId, subjectId] : [userId]
    const sessions = await database.prepare(query).all(...params) as any[]
    
    if (sessions.length === 0) {
      return {
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null
      }
    }
    
    // Calculate current streak
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastDate = null
    
    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].session_date)
      sessionDate.setHours(0, 0, 0, 0)
      
      if (i === 0) {
        // Check if last session was today or yesterday
        const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff <= 1) {
          currentStreak = 1
          tempStreak = 1
          lastDate = sessions[i].session_date
        }
      } else {
        const prevDate = new Date(sessions[i - 1].session_date)
        prevDate.setHours(0, 0, 0, 0)
        const daysDiff = Math.floor((prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          tempStreak++
          if (i === 1 || currentStreak > 0) {
            currentStreak = tempStreak
          }
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak
          }
          tempStreak = 1
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak)
    
    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: lastDate
    }
  },

  async updateStreak(userId: string, streakType: string, subjectId?: string) {
    const database = getDb()
    const today = new Date().toISOString().split('T')[0]
    
    let streak = this.getStreak(userId, streakType, subjectId) as any
    
    if (!streak) {
      // Create new streak
      const id = generateId()
      database.prepare(`
        INSERT INTO streaks (id, user_id, streak_type, subject_id, current_streak, longest_streak, streak_start_date, last_activity_date)
        VALUES (?, ?, ?, ?, 1, 1, ?, ?)
      `).run(id, userId, streakType, subjectId || null, today, today)
      return 1
    }

    const lastDate = new Date(streak.last_activity_date)
    const todayDate = new Date(today)
    const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === 0) {
      // Same day, no update needed
      return streak.current_streak
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      const newStreak = streak.current_streak + 1
      const newLongest = Math.max(newStreak, streak.longest_streak)
      await database.prepare(`
        UPDATE streaks 
        SET current_streak = ?, longest_streak = ?, last_activity_date = ?
        WHERE id = ?
      `).run(newStreak, newLongest, today, streak.id)
      return newStreak
    } else {
      // Streak broken, reset
      database.prepare(`
        UPDATE streaks 
        SET current_streak = 1, streak_start_date = ?, last_activity_date = ?, status = 'broken', broken_at = NOW()
        WHERE id = ?
      `).run(today, today, streak.id)
      return 1
    }
  },

  // ============================================================================
  // CHALLENGES
  // ============================================================================

  async createChallenge(challenge: {
    userId: string
    challengeTitle: string
    challengeDescription: string
    challengeType: string
    startDate: string
    endDate: string
    durationDays: number
    challengeGoals: any[]
    xpReward?: number
    badgeReward?: string
    difficultyLevel?: string
    progressTarget: number
  }) {
    const database = getDb()
    const id = generateId()
    database.prepare(`
      INSERT INTO challenges (
        id, user_id, challenge_title, challenge_description, challenge_type,
        start_date, end_date, duration_days, challenge_goals, xp_reward,
        badge_reward, difficulty_level, progress_target
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      challenge.userId,
      challenge.challengeTitle,
      challenge.challengeDescription,
      challenge.challengeType,
      challenge.startDate,
      challenge.endDate,
      challenge.durationDays,
      JSON.stringify(challenge.challengeGoals),
      challenge.xpReward || 0,
      challenge.badgeReward || null,
      challenge.difficultyLevel || 'medium',
      challenge.progressTarget,
    )
    return await database.prepare("SELECT * FROM challenges WHERE id = ?").get(id)
  },

  async getChallenges(userId: string, status?: string) {
    const database = getDb()
    if (status) {
      return await database.prepare(`
        SELECT * FROM challenges 
        WHERE user_id = ? AND status = ?
        ORDER BY end_date DESC
      `).all(userId, status)
    }
    return await database.prepare(`
      SELECT * FROM challenges 
      WHERE user_id = ?
      ORDER BY status ASC, end_date DESC
    `).all(userId)
  },

  async updateChallengeProgress(id: string, progressCurrent: number) {
    const database = getDb()
    database.prepare(`
      UPDATE challenges 
      SET progress_current = ?, 
          progress_percentage = (CAST(? AS REAL) / progress_target * 100),
          updated_at = NOW()
      WHERE id = ?
    `).run(progressCurrent, progressCurrent, id)

    // Check if challenge is completed
    const challenge = await database.prepare(`
      SELECT * FROM challenges WHERE id = ?
    `).get(id) as any

    if (challenge && challenge.progress_current >= challenge.progress_target) {
      database.prepare(`
        UPDATE challenges 
        SET status = 'completed', completed_at = NOW()
        WHERE id = ?
      `).run(id)

      // Award XP if applicable
      if (challenge.xp_reward > 0) {
        await database.prepare(`
          UPDATE users 
          SET xp_points = xp_points + ?
          WHERE id = ?
        `).run(challenge.xp_reward, challenge.user_id)
      }
    }
  },

  // ============================================================================
  // INSIGHTS
  // ============================================================================

  async createInsight(insight: {
    userId: string
    insightType: string
    insightTitle: string
    insightDescription: string
    keyFinding: string
    dataPointsUsed?: number
    timePeriodAnalyzed?: string
    subjectsInvolved?: string[]
    methodsCompared?: string[]
    supportingData?: any
    visualizationType?: string
    visualizationData?: any
    confidenceLevel?: number
    impactPotential?: string
    expectedBenefit?: string
    expectedBenefitValue?: number
    priorityScore?: number
    isActionable?: boolean
    recommendedActions?: string[]
    implementationDifficulty?: string
    timeToImplement?: string
    resourcesNeeded?: string
    currentlyRelevant?: boolean
    relevanceExpiry?: string
    affectedSubjects?: string[]
    affectedGoals?: string[]
    relatedInsights?: string[]
  }) {
    const database = getDb()
    const id = generateId()
    database.prepare(`
      INSERT INTO insights (
        id, user_id, insight_type, insight_title, insight_description, key_finding,
        data_points_used, time_period_analyzed, subjects_involved, methods_compared,
        supporting_data, visualization_type, visualization_data, confidence_level,
        impact_potential, expected_benefit, expected_benefit_value, priority_score,
        is_actionable, recommended_actions, implementation_difficulty, time_to_implement,
        resources_needed, currently_relevant, relevance_expiry, affected_subjects,
        affected_goals, related_insights
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      insight.userId,
      insight.insightType,
      insight.insightTitle,
      insight.insightDescription,
      insight.keyFinding,
      insight.dataPointsUsed || null,
      insight.timePeriodAnalyzed || null,
      insight.subjectsInvolved ? JSON.stringify(insight.subjectsInvolved) : null,
      insight.methodsCompared ? JSON.stringify(insight.methodsCompared) : null,
      insight.supportingData ? JSON.stringify(insight.supportingData) : null,
      insight.visualizationType || null,
      insight.visualizationData ? JSON.stringify(insight.visualizationData) : null,
      insight.confidenceLevel || null,
      insight.impactPotential || 'medium',
      insight.expectedBenefit || null,
      insight.expectedBenefitValue || null,
      insight.priorityScore || 0,
      insight.isActionable !== false ? 1 : 0,
      insight.recommendedActions ? JSON.stringify(insight.recommendedActions) : null,
      insight.implementationDifficulty || 'medium',
      insight.timeToImplement || null,
      insight.resourcesNeeded || null,
      insight.currentlyRelevant !== false ? 1 : 0,
      insight.relevanceExpiry || null,
      insight.affectedSubjects ? JSON.stringify(insight.affectedSubjects) : null,
      insight.affectedGoals ? JSON.stringify(insight.affectedGoals) : null,
      insight.relatedInsights ? JSON.stringify(insight.relatedInsights) : null,
    )
    return await database.prepare("SELECT * FROM insights WHERE id = ?").get(id)
  },

  async getInsights(userId: string, onlyRelevant = true) {
    const database = getDb()
    if (onlyRelevant) {
      return await database.prepare(`
        SELECT * FROM insights 
        WHERE user_id = ? AND currently_relevant = 1 AND dismissed = 0
        ORDER BY priority_score DESC, discovery_date DESC
        LIMIT 50
      `).all(userId)
    }
    return await database.prepare(`
      SELECT * FROM insights 
      WHERE user_id = ?
      ORDER BY discovery_date DESC
      LIMIT 100
    `).all(userId)
  },

  async acknowledgeInsight(id: string) {
    const database = getDb()
    database.prepare(`
      UPDATE insights 
      SET acknowledged = 1, acknowledged_date = NOW()
      WHERE id = ?
    `).run(id)
  },

  async rateInsight(id: string, rating: string, feedback?: string) {
    const database = getDb()
    await database.prepare(`
      UPDATE insights 
      SET user_rating = ?, user_feedback = ?
      WHERE id = ?
    `).run(rating, feedback || null, id)
  },

  async bookmarkInsight(id: string) {
    const database = getDb()
    await database.prepare(`
      UPDATE insights 
      SET bookmarked = 1
      WHERE id = ?
    `).run(id)
  },

  async dismissInsight(id: string, reason?: string) {
    const database = getDb()
    await database.prepare(`
      UPDATE insights 
      SET dismissed = 1, dismiss_reason = ?
      WHERE id = ?
    `).run(reason || null, id)
  },

  // ============================================================================
  // CALENDAR & STUDY PLANS
  // ============================================================================

  async createCalendarEvent(event: {
    userId: string
    eventType: string
    title: string
    description?: string
    subjectId?: string
    startDatetime: string
    endDatetime?: string
    durationMinutes?: number
    allDay?: boolean
    isRecurring?: boolean
    recurrencePattern?: any
    recurrenceEndDate?: string
    studyPlanId?: string
    isFlexible?: boolean
    // Session Details
    sessionType?: string
    studyMethod?: string
    location?: string
    // Preparation & Tasks
    preparationRequired?: string
    difficulty?: string
    priority?: string
    // Linked Items
    linkedResourceIds?: string
    linkedGoalIds?: string
    // Reminders
    reminderEnabled?: boolean
    reminderMinutesBefore?: number
    notificationSent?: boolean
    // Pre/Post Tasks
    preSessionChecklist?: string
    postSessionTasks?: string
    // Additional Details
    notes?: string
    tags?: string
    color?: string
    // Status tracking
    status?: string
    completionStatus?: string
    actualStartTime?: string
    actualEndTime?: string
    cancellationReason?: string
  }) {
    const database = getDb()
    const id = generateId()
    database.prepare(`
      INSERT INTO calendar_events (
        id, user_id, event_type, title, description, subject_id,
        start_datetime, end_datetime, duration_minutes, all_day,
        is_recurring, recurrence_pattern, recurrence_end_date,
        study_plan_id, is_flexible,
        session_type, study_method, location,
        preparation_required, difficulty, priority,
        linked_resource_ids, linked_goal_ids,
        reminder_enabled, reminder_minutes_before, notification_sent,
        pre_session_checklist, post_session_tasks,
        notes, tags, color,
        status, completion_status, actual_start_time, actual_end_time,
        cancellation_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      event.userId,
      event.eventType,
      event.title,
      event.description || null,
      event.subjectId || null,
      event.startDatetime,
      event.endDatetime || null,
      event.durationMinutes || null,
      event.allDay ? 1 : 0,
      event.isRecurring ? 1 : 0,
      event.recurrencePattern ? JSON.stringify(event.recurrencePattern) : null,
      event.recurrenceEndDate || null,
      event.studyPlanId || null,
      event.isFlexible ? 1 : 0,
      event.sessionType || null,
      event.studyMethod || null,
      event.location || null,
      event.preparationRequired || null,
      event.difficulty || null,
      event.priority || null,
      event.linkedResourceIds || null,
      event.linkedGoalIds || null,
      event.reminderEnabled !== undefined ? (event.reminderEnabled ? 1 : 0) : 1,
      event.reminderMinutesBefore || 30,
      event.notificationSent ? 1 : 0,
      event.preSessionChecklist || null,
      event.postSessionTasks || null,
      event.notes || null,
      event.tags || null,
      event.color || null,
      event.status || 'planned',
      event.completionStatus || null,
      event.actualStartTime || null,
      event.actualEndTime || null,
      event.cancellationReason || null,
    )
    return await database.prepare("SELECT * FROM calendar_events WHERE id = ?").get(id)
  },

  async getCalendarEvent(id: string) {
    const database = getDb()
    return await database.prepare(`
      SELECT ce.*, s.name as subject_name, s.color_theme as color_code
      FROM calendar_events ce
      LEFT JOIN subjects s ON ce.subject_id = s.id
      WHERE ce.id = ?
    `).get(id)
  },

  async getCalendarEvents(userId: string, startDate: string, endDate: string) {
    const database = getDb()
    return await database.prepare(`
      SELECT ce.*, s.name as subject_name, s.color_theme as color_code
      FROM calendar_events ce
      LEFT JOIN subjects s ON ce.subject_id = s.id
      WHERE ce.user_id = ? AND ce.start_datetime BETWEEN ? AND ?
      ORDER BY ce.start_datetime
    `).all(userId, startDate, endDate)
  },

  async updateCalendarEvent(id: string, updates: Record<string, any>) {
    const database = getDb()
    const { keys, values } = validateAndSanitizeUpdates('calendar_events', updates)
    const setClause = keys.map(key => `${key} = ?`).join(", ")
    database.prepare(`UPDATE calendar_events SET ${setClause}, updated_at = NOW() WHERE id = ?`).run(...values, id)
    return await database.prepare("SELECT * FROM calendar_events WHERE id = ?").get(id)
  },

  async deleteCalendarEvent(id: string) {
    const database = getDb()
    await database.prepare("DELETE FROM calendar_events WHERE id = ?").run(id)
  },

  async markEventCompleted(id: string, actualSessionId: string) {
    const database = getDb()
    await database.prepare(`
      UPDATE calendar_events 
      SET status = 'completed', actual_session_id = ?
      WHERE id = ?
    `).run(actualSessionId, id)
  },

  async createStudyPlan(plan: {
    userId: string
    planName: string
    planType: string
    planGoal?: string
    priorityLevel?: string
    startDate: string
    endDate: string
    subjectAllocations: any[]
    totalPlannedHours?: number
    sessionsPlanned?: number
  }) {
    const database = getDb()
    const id = generateId()
    database.prepare(`
      INSERT INTO study_plans (
        id, user_id, plan_name, plan_type, plan_goal, priority_level,
        start_date, end_date, subject_allocations, total_planned_hours,
        sessions_planned
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      plan.userId,
      plan.planName,
      plan.planType,
      plan.planGoal || null,
      plan.priorityLevel || 'normal',
      plan.startDate,
      plan.endDate,
      JSON.stringify(plan.subjectAllocations),
      plan.totalPlannedHours || null,
      plan.sessionsPlanned || null,
    )
    return await database.prepare("SELECT * FROM study_plans WHERE id = ?").get(id)
  },

  async getStudyPlans(userId: string, status?: string) {
    const database = getDb()
    if (status) {
      return await database.prepare(`
        SELECT * FROM study_plans 
        WHERE user_id = ? AND status = ?
        ORDER BY start_date DESC
      `).all(userId, status)
    }
    return await database.prepare(`
      SELECT * FROM study_plans 
      WHERE user_id = ?
      ORDER BY status ASC, start_date DESC
    `).all(userId)
  },

  async updateStudyPlanProgress(id: string, completedHours: number, completedSessions: number) {
    const database = getDb()
    database.prepare(`
      UPDATE study_plans 
      SET total_completed_hours = ?, sessions_completed = ?,
          completion_percentage = (CAST(? AS REAL) / total_planned_hours * 100),
          updated_at = NOW()
      WHERE id = ?
    `).run(completedHours, completedSessions, completedHours, id)
  },

  // ============================================================================
  // RESOURCE COLLECTIONS
  // ============================================================================

  async createResourceCollection(collection: {
    userId: string
    collectionName: string
    collectionDescription?: string
    collectionPurpose?: string
    resourceIds: string[]
    priorityOrder?: string[]
    colorCode?: string
    icon?: string
  }) {
    const database = getDb()
    const id = generateId()
    database.prepare(`
      INSERT INTO resource_collections (
        id, user_id, collection_name, collection_description, collection_purpose,
        resource_ids, priority_order, color_code, icon
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      collection.userId,
      collection.collectionName,
      collection.collectionDescription || null,
      collection.collectionPurpose || null,
      JSON.stringify(collection.resourceIds),
      collection.priorityOrder ? JSON.stringify(collection.priorityOrder) : null,
      collection.colorCode || null,
      collection.icon || null,
    )
    return await database.prepare("SELECT * FROM resource_collections WHERE id = ?").get(id)
  },

  async getResourceCollections(userId: string) {
    const database = getDb()
    return await database.prepare(`
      SELECT * FROM resource_collections 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId)
  },

  async updateResourceCollection(id: string, updates: Record<string, any>) {
    const database = getDb()
    const { keys, values } = validateAndSanitizeUpdates('resource_collections', updates)
    const setClause = keys.map(key => `${key} = ?`).join(", ")
    database.prepare(`UPDATE resource_collections SET ${setClause}, updated_at = NOW() WHERE id = ?`).run(...values, id)
  },

  async deleteResourceCollection(id: string) {
    const database = getDb()
    await database.prepare("DELETE FROM resource_collections WHERE id = ?").run(id)
  },
}

export { generateId, getDb }


