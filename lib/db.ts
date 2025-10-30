import { neon } from '@neondatabase/serverless'

// PostgreSQL connection using Neon serverless driver (Supabase-compatible)
const sql = neon(process.env.DATABASE_URL!)

function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36)
  )
}

export const database = {
  // USER OPERATIONS
  async getUserByEmail(email: string) {
    const result = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
    return result[0] || null
  },

  async getUserById(id: string) {
    const result = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`
    return result[0] || null
  },

  async createUser(data: {
    name: string
    email: string
    educationLevel: string
    primaryGoal: string
    studyStyle: string
    energyLevel: string
    currentChallenges: string[]
    isGuest: boolean
  }) {
    const id = generateId()
    const result = await sql`
      INSERT INTO users (
        id, full_name, email, education_level, primary_goal, study_style, energy_level,
        current_challenges, is_guest, created_at, updated_at
      )
      VALUES (
        ${id}, ${data.name}, ${data.email}, ${data.educationLevel}, ${data.primaryGoal},
        ${data.studyStyle}, ${data.energyLevel}, ${JSON.stringify(data.currentChallenges)},
        ${data.isGuest}, NOW(), NOW()
      )
      RETURNING *
    `
    return result[0]
  },

  // SUBJECT OPERATIONS
  async getSubjects(userId: string) {
    return await sql`
      SELECT * FROM subjects 
      WHERE user_id = ${userId} AND (is_active IS NULL OR is_active = true)
      ORDER BY created_at DESC
    `
  },

  async getSubjectById(id: string) {
    const result = await sql`SELECT * FROM subjects WHERE id = ${id} LIMIT 1`
    return result[0] || null
  },

  async createSubject(data: any) {
    const id = generateId()
    const result = await sql`
      INSERT INTO subjects (
        id, user_id, name, color_theme, icon, category, difficulty_level,
        target_weekly_hours, current_priority, notes, is_active, created_at, updated_at
      )
      VALUES (
        ${id}, ${data.userId}, ${data.name}, ${data.color || '#3B82F6'}, ${data.icon || '📚'},
        ${data.category || 'general'}, ${data.difficulty || 'medium'}, ${data.weeklyGoalHours || 5},
        ${data.priority || 'medium'}, ${data.notes || ''}, true, NOW(), NOW()
      )
      RETURNING *
    `
    return result[0]
  },

  async updateSubject(id: string, data: any) {
    // Since Neon doesn't support dynamic SQL well, we do targeted updates
    const subject = await this.getSubjectById(id)
    if (!subject) return null
    
    const result = await sql`
      UPDATE subjects SET
        name = ${data.name !== undefined ? data.name : subject.name},
        color_theme = ${data.color !== undefined ? data.color : subject.color_theme},
        icon = ${data.icon !== undefined ? data.icon : subject.icon},
        category = ${data.category !== undefined ? data.category : subject.category},
        difficulty_level = ${data.difficulty !== undefined ? data.difficulty : subject.difficulty_level},
        target_weekly_hours = ${data.weeklyGoalHours !== undefined ? data.weeklyGoalHours : subject.target_weekly_hours},
        current_priority = ${data.priority !== undefined ? data.priority : subject.current_priority},
        notes = ${data.notes !== undefined ? data.notes : subject.notes},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result[0]
  },

  async deleteSubject(id: string) {
    await sql`UPDATE subjects SET is_active = false WHERE id = ${id}`
  },

  // SESSION OPERATIONS
  async getSessions(userId: string, limit?: number) {
    if (limit) {
      return await sql`
        SELECT s.*, sub.name as subject_name, sub.color_theme as subject_color
        FROM study_sessions s LEFT JOIN subjects sub ON s.subject_id = sub.id
        WHERE s.user_id = ${userId} ORDER BY s.created_at DESC LIMIT ${limit}
      `
    }
    return await sql`
      SELECT s.*, sub.name as subject_name, sub.color_theme as subject_color
      FROM study_sessions s LEFT JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.user_id = ${userId} ORDER BY s.created_at DESC
    `
  },

  async getSessionById(id: string) {
    const result = await sql`
      SELECT s.*, sub.name as subject_name, sub.color_theme as subject_color
      FROM study_sessions s LEFT JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.id = ${id} LIMIT 1
    `
    return result[0] || null
  },

  async createSession(data: any) {
    const id = generateId()
    const startTime = data.startTime || new Date().toISOString()
    const result = await sql`
      INSERT INTO study_sessions (
        id, user_id, subject_id, started_at, duration_minutes, average_focus_score,
        productivity_rating, mood_before, reflection_notes, breaks_taken, distractions_count,
        is_completed, created_at, updated_at
      )
      VALUES (
        ${id}, ${data.userId}, ${data.subjectId || null}, ${startTime}, ${data.duration || 0},
        ${data.focusLevel || 3}, ${data.productivity || 3}, ${data.mood || 'neutral'},
        ${data.notes || ''}, ${data.breaks || 0}, ${data.distractions || 0},
        ${data.duration ? true : false}, NOW(), NOW()
      )
      RETURNING *
    `
    return result[0]
  },

  async updateSession(id: string, data: any) {
    const session = await this.getSessionById(id)
    if (!session) return null
    
    const result = await sql`
      UPDATE study_sessions SET
        ended_at = ${data.endTime !== undefined ? data.endTime : session.ended_at},
        duration_minutes = ${data.duration !== undefined ? data.duration : session.duration_minutes},
        is_completed = ${data.duration !== undefined ? true : session.is_completed},
        average_focus_score = ${data.focusLevel !== undefined ? data.focusLevel : session.average_focus_score},
        productivity_rating = ${data.productivity !== undefined ? data.productivity : session.productivity_rating},
        mood_after = ${data.mood !== undefined ? data.mood : session.mood_after},
        reflection_notes = ${data.notes !== undefined ? data.notes : session.reflection_notes},
        breaks_taken = ${data.breaks !== undefined ? data.breaks : session.breaks_taken},
        distractions_count = ${data.distractions !== undefined ? data.distractions : session.distractions_count},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result[0]
  },

  async deleteSession(id: string) {
    await sql`DELETE FROM study_sessions WHERE id = ${id}`
  },

  // GOAL OPERATIONS
  async getGoals(userId: string) {
    return await sql`
      SELECT g.*, s.name as subject_name FROM goals g
      LEFT JOIN subjects s ON g.subject_id = s.id
      WHERE g.user_id = ${userId} AND (g.is_active IS NULL OR g.is_active = true)
      ORDER BY g.created_at DESC
    `
  },

  async getGoalById(id: string) {
    const result = await sql`
      SELECT g.*, s.name as subject_name FROM goals g
      LEFT JOIN subjects s ON g.subject_id = s.id
      WHERE g.id = ${id} LIMIT 1
    `
    return result[0] || null
  },

  async createGoal(data: any) {
    const id = generateId()
    const result = await sql`
      INSERT INTO goals (
        id, user_id, title, description, goal_type, target_value, current_value, unit,
        deadline, subject_id, priority, status, is_active, created_at, updated_at
      )
      VALUES (
        ${id}, ${data.userId}, ${data.title}, ${data.description || ''}, ${data.type},
        ${data.targetValue}, ${data.currentValue || 0}, ${data.unit}, ${data.deadline || null},
        ${data.subjectId || null}, ${data.priority || 'medium'}, 'active', true, NOW(), NOW()
      )
      RETURNING *
    `
    return result[0]
  },

  async updateGoal(id: string, data: any) {
    const goal = await this.getGoalById(id)
    if (!goal) return null
    
    const result = await sql`
      UPDATE goals SET
        title = ${data.title !== undefined ? data.title : goal.title},
        description = ${data.description !== undefined ? data.description : goal.description},
        target_value = ${data.targetValue !== undefined ? data.targetValue : goal.target_value},
        current_value = ${data.currentValue !== undefined ? data.currentValue : goal.current_value},
        deadline = ${data.deadline !== undefined ? data.deadline : goal.deadline},
        status = ${data.status !== undefined ? data.status : goal.status},
        priority = ${data.priority !== undefined ? data.priority : goal.priority},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result[0]
  },

  async deleteGoal(id: string) {
    await sql`UPDATE goals SET is_active = false WHERE id = ${id}`
  },

  // RESOURCE OPERATIONS
  async getResources(userId: string) {
    return await sql`
      SELECT r.*, s.name as subject_name FROM resources r
      LEFT JOIN subjects s ON r.subject_id = s.id
      WHERE r.user_id = ${userId} ORDER BY r.created_at DESC
    `
  },

  async getResourceById(id: string) {
    const result = await sql`
      SELECT r.*, s.name as subject_name FROM resources r
      LEFT JOIN subjects s ON r.subject_id = s.id
      WHERE r.id = ${id} LIMIT 1
    `
    return result[0] || null
  },

  async createResource(data: any) {
    const id = generateId()
    const result = await sql`
      INSERT INTO resources (
        id, user_id, subject_id, title, type, url, description, tags, rating, created_at, updated_at
      )
      VALUES (
        ${id}, ${data.userId}, ${data.subjectId || null}, ${data.title}, ${data.type},
        ${data.url || ''}, ${data.description || ''}, ${JSON.stringify(data.tags || [])},
        ${data.rating || 0}, NOW(), NOW()
      )
      RETURNING *
    `
    return result[0]
  },

  async updateResource(id: string, data: any) {
    const resource = await this.getResourceById(id)
    if (!resource) return null
    
    const result = await sql`
      UPDATE resources SET
        title = ${data.title !== undefined ? data.title : resource.title},
        type = ${data.type !== undefined ? data.type : resource.type},
        url = ${data.url !== undefined ? data.url : resource.url},
        description = ${data.description !== undefined ? data.description : resource.description},
        tags = ${data.tags !== undefined ? JSON.stringify(data.tags) : resource.tags},
        rating = ${data.rating !== undefined ? data.rating : resource.rating},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result[0]
  },

  async deleteResource(id: string) {
    await sql`DELETE FROM resources WHERE id = ${id}`
  },

  // PERFORMANCE TRACKING
  async getPerformanceRecords(userId: string) {
    return await sql`
      SELECT p.*, s.name as subject_name FROM performance_entries p
      LEFT JOIN subjects s ON p.subject_id = s.id
      WHERE p.user_id = ${userId} ORDER BY p.assessment_date DESC
    `
  },

  async getPerformanceById(id: string) {
    const result = await sql`SELECT * FROM performance_entries WHERE id = ${id} LIMIT 1`
    return result[0] || null
  },

  async createPerformanceRecord(data: any) {
    const id = generateId()
    const percentage = (data.score / data.maxScore) * 100
    const result = await sql`
      INSERT INTO performance_entries (
        id, user_id, subject_id, assessment_type, marks_obtained, total_marks, percentage,
        assessment_date, notes, grade, created_at, updated_at
      )
      VALUES (
        ${id}, ${data.userId}, ${data.subjectId || null}, ${data.assessmentType}, ${data.score},
        ${data.maxScore}, ${percentage}, ${data.date}, ${data.notes || ''}, ${data.grade || ''},
        NOW(), NOW()
      )
      RETURNING *
    `
    return result[0]
  },

  async updatePerformanceRecord(id: string, data: any) {
    const perf = await this.getPerformanceById(id)
    if (!perf) return null
    
    const newScore = data.score !== undefined ? data.score : perf.marks_obtained
    const newMaxScore = data.maxScore !== undefined ? data.maxScore : perf.total_marks
    const percentage = (newScore / newMaxScore) * 100
    
    const result = await sql`
      UPDATE performance_entries SET
        marks_obtained = ${newScore},
        total_marks = ${newMaxScore},
        percentage = ${percentage},
        grade = ${data.grade !== undefined ? data.grade : perf.grade},
        notes = ${data.notes !== undefined ? data.notes : perf.notes},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result[0]
  },

  async deletePerformanceRecord(id: string) {
    await sql`DELETE FROM performance_entries WHERE id = ${id}`
  },

  // CALENDAR/SCHEDULED SESSIONS
  async getScheduledSessions(userId: string) {
    return await sql`
      SELECT c.*, s.name as subject_name FROM calendar_events c
      LEFT JOIN subjects s ON c.subject_id = s.id
      WHERE c.user_id = ${userId} ORDER BY c.start_datetime DESC
    `
  },

  async getScheduledSessionById(id: string) {
    const result = await sql`SELECT * FROM calendar_events WHERE id = ${id} LIMIT 1`
    return result[0] || null
  },

  async createScheduledSession(data: any) {
    const id = generateId()
    const result = await sql`
      INSERT INTO calendar_events (
        id, user_id, subject_id, title, start_datetime, end_datetime, description, location,
        is_recurring, is_completed, created_at, updated_at
      )
      VALUES (
        ${id}, ${data.userId}, ${data.subjectId || null}, ${data.title}, ${data.startTime},
        ${data.endTime}, ${data.description || ''}, ${data.location || ''}, ${data.isRecurring || false},
        false, NOW(), NOW()
      )
      RETURNING *
    `
    return result[0]
  },

  async updateScheduledSession(id: string, data: any) {
    const event = await this.getScheduledSessionById(id)
    if (!event) return null
    
    const result = await sql`
      UPDATE calendar_events SET
        title = ${data.title !== undefined ? data.title : event.title},
        start_datetime = ${data.startTime !== undefined ? data.startTime : event.start_datetime},
        end_datetime = ${data.endTime !== undefined ? data.endTime : event.end_datetime},
        description = ${data.description !== undefined ? data.description : event.description},
        location = ${data.location !== undefined ? data.location : event.location},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result[0]
  },

  async deleteScheduledSession(id: string) {
    await sql`DELETE FROM calendar_events WHERE id = ${id}`
  },

  // PREFERENCES
  async getPreferences(userId: string) {
    const result = await sql`SELECT * FROM user_preferences WHERE user_id = ${userId} LIMIT 1`
    return result[0] || null
  },

  async getOrCreatePreferences(userId: string) {
    let prefs = await this.getPreferences(userId)
    if (!prefs) {
      const id = generateId()
      const result = await sql`
        INSERT INTO user_preferences (id, user_id, created_at, updated_at)
        VALUES (${id}, ${userId}, NOW(), NOW()) RETURNING *
      `
      prefs = result[0]
    }
    return prefs
  },

  async updatePreferences(userId: string, data: any) {
    const prefs = await this.getOrCreatePreferences(userId)
    
    const result = await sql`
      UPDATE user_preferences SET
        theme = ${data.theme !== undefined ? data.theme : prefs.theme},
        notification_email = ${data.notificationsEnabled !== undefined ? data.notificationsEnabled : prefs.notification_email},
        notification_reminders = ${data.studyReminders !== undefined ? data.studyReminders : prefs.notification_reminders},
        daily_study_goal_hours = ${data.dailyGoalHours !== undefined ? data.dailyGoalHours : prefs.daily_study_goal_hours},
        default_session_duration = ${data.preferredSessionDuration !== undefined ? data.preferredSessionDuration : prefs.default_session_duration},
        default_break_duration = ${data.preferredBreakDuration !== undefined ? data.preferredBreakDuration : prefs.default_break_duration},
        updated_at = NOW()
      WHERE user_id = ${userId}
      RETURNING *
    `
    return result[0] || prefs
  },

  // STREAKS & GAMIFICATION
  async getStreak(userId: string) {
    const result = await sql`SELECT * FROM streaks WHERE user_id = ${userId} LIMIT 1`
    return result[0] || null
  },

  async getOrCreateStreak(userId: string) {
    let streak = await this.getStreak(userId)
    if (!streak) {
      const id = generateId()
      const result = await sql`
        INSERT INTO streaks (id, user_id, current_streak, longest_streak, last_activity_date, created_at, updated_at)
        VALUES (${id}, ${userId}, 0, 0, NOW(), NOW(), NOW()) RETURNING *
      `
      streak = result[0]
    }
    return streak
  },

  async updateStreak(userId: string, data: { currentStreak: number; longestStreak: number }) {
    const result = await sql`
      UPDATE streaks
      SET current_streak = ${data.currentStreak}, longest_streak = ${data.longestStreak},
          last_activity_date = NOW(), updated_at = NOW()
      WHERE user_id = ${userId} RETURNING *
    `
    return result[0]
  },

  async getAchievements(userId: string) {
    return await sql`
      SELECT * FROM achievements WHERE user_id = ${userId} ORDER BY unlocked_at DESC
    `
  },

  async unlockAchievement(userId: string, achievementType: string, title: string, description: string) {
    const id = generateId()
    const result = await sql`
      INSERT INTO achievements (id, user_id, achievement_type, title, description, unlocked_at, created_at, updated_at)
      VALUES (${id}, ${userId}, ${achievementType}, ${title}, ${description}, NOW(), NOW(), NOW())
      ON CONFLICT (user_id, achievement_type) DO NOTHING RETURNING *
    `
    return result[0]
  },

  // ANALYTICS & INSIGHTS
  async getStudyStats(userId: string, startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      const result = await sql`
        SELECT COUNT(*) as total_sessions, COALESCE(SUM(duration_minutes), 0) as total_minutes,
               COALESCE(AVG(average_focus_score), 0) as avg_focus, COALESCE(AVG(productivity_rating), 0) as avg_productivity
        FROM study_sessions WHERE user_id = ${userId} AND started_at >= ${startDate} AND started_at <= ${endDate}
      `
      return result[0]
    }
    const result = await sql`
      SELECT COUNT(*) as total_sessions, COALESCE(SUM(duration_minutes), 0) as total_minutes,
             COALESCE(AVG(average_focus_score), 0) as avg_focus, COALESCE(AVG(productivity_rating), 0) as avg_productivity
      FROM study_sessions WHERE user_id = ${userId}
    `
    return result[0]
  },

  async getSubjectBreakdown(userId: string) {
    return await sql`
      SELECT s.id, s.name, s.color_theme as color, COUNT(ss.id) as session_count,
             COALESCE(SUM(ss.duration_minutes), 0) as total_minutes
      FROM subjects s LEFT JOIN study_sessions ss ON s.id = ss.subject_id
      WHERE s.user_id = ${userId} GROUP BY s.id, s.name, s.color_theme ORDER BY total_minutes DESC
    `
  },

  async getStudyTrends(userId: string, days: number = 30) {
    // Calculate the date dynamically in JavaScript instead of SQL
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString()
    
    return await sql`
      SELECT DATE(started_at) as date, COUNT(*) as session_count,
             COALESCE(SUM(duration_minutes), 0) as total_minutes, COALESCE(AVG(average_focus_score), 0) as avg_focus
      FROM study_sessions
      WHERE user_id = ${userId} AND started_at >= ${startDateStr}
      GROUP BY DATE(started_at) ORDER BY date DESC
    `
  },

  // ACTIVITY LOG
  async logAction(userId: string, action: string, details?: any) {
    const id = generateId()
    await sql`
      INSERT INTO activity_log (id, user_id, action, details, created_at, updated_at)
      VALUES (${id}, ${userId}, ${action}, ${JSON.stringify(details || {})}, NOW(), NOW())
    `
  },

  async getActivityLog(userId: string, limit: number = 50) {
    return await sql`
      SELECT * FROM activity_log WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}
    `
  },
}
