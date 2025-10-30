-- Migration to fix CHECK constraints and add missing columns
-- Run this to fix all constraint errors

-- ============================================================================
-- FIX CHECK CONSTRAINTS
-- ============================================================================

-- Drop and recreate performance_entries table with expanded entry_type options
DROP TABLE IF EXISTS performance_entries_backup;
CREATE TABLE performance_entries_backup AS SELECT * FROM performance_entries;

DROP TABLE IF EXISTS performance_entries;
CREATE TABLE performance_entries (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  entry_type TEXT CHECK (entry_type IN ('quiz', 'test', 'exam', 'midterm', 'final', 'assignment', 'homework', 'project', 'presentation', 'lab_report', 'practice_test', 'mock_exam', 'competitive_exam', 'self_assessment', 'other')),
  score REAL NOT NULL,
  total_possible REAL NOT NULL,
  percentage REAL,
  assessment_name TEXT,
  difficulty_rating TEXT CHECK (difficulty_rating IN ('easy', 'medium', 'hard', 'very_hard', 'not_set')),
  topics_covered TEXT,
  time_spent_minutes INTEGER,
  notes TEXT,
  assessment_date TEXT NOT NULL,
  linked_session_id TEXT REFERENCES study_sessions(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT INTO performance_entries SELECT * FROM performance_entries_backup;
DROP TABLE performance_entries_backup;

-- ============================================================================
-- ADD MISSING COLUMNS TO GOALS TABLE
-- ============================================================================

ALTER TABLE goals ADD COLUMN goal_name TEXT;
ALTER TABLE goals ADD COLUMN goal_description TEXT;
ALTER TABLE goals ADD COLUMN unit TEXT DEFAULT 'units';
ALTER TABLE goals ADD COLUMN start_date TEXT;
ALTER TABLE goals ADD COLUMN target_completion_date TEXT;
ALTER TABLE goals ADD COLUMN duration_days INTEGER;
ALTER TABLE goals ADD COLUMN milestones TEXT;
ALTER TABLE goals ADD COLUMN priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE goals ADD COLUMN importance_reason TEXT;
ALTER TABLE goals ADD COLUMN motivation_statement TEXT;
ALTER TABLE goals ADD COLUMN reward_on_completion TEXT;
ALTER TABLE goals ADD COLUMN consequence_if_missed TEXT;
ALTER TABLE goals ADD COLUMN track_automatically INTEGER DEFAULT 1;
ALTER TABLE goals ADD COLUMN send_reminders INTEGER DEFAULT 1;
ALTER TABLE goals ADD COLUMN reminder_frequency TEXT DEFAULT 'daily';
ALTER TABLE goals ADD COLUMN alert_when_behind INTEGER DEFAULT 1;
ALTER TABLE goals ADD COLUMN celebrate_milestones INTEGER DEFAULT 1;
ALTER TABLE goals ADD COLUMN visible_on_dashboard INTEGER DEFAULT 1;
ALTER TABLE goals ADD COLUMN parent_goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL;
ALTER TABLE goals ADD COLUMN related_goals TEXT;
ALTER TABLE goals ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'failed', 'archived'));
ALTER TABLE goals ADD COLUMN on_track_status TEXT CHECK (on_track_status IN ('on_track', 'behind', 'ahead', 'at_risk'));
ALTER TABLE goals ADD COLUMN progress_percentage REAL DEFAULT 0;

-- ============================================================================
-- ADD MISSING COLUMNS TO SUBJECTS TABLE
-- ============================================================================

ALTER TABLE subjects ADD COLUMN subject_code TEXT;
ALTER TABLE subjects ADD COLUMN icon TEXT;
ALTER TABLE subjects ADD COLUMN priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE subjects ADD COLUMN priority_reason TEXT;
ALTER TABLE subjects ADD COLUMN current_performance REAL DEFAULT 0;
ALTER TABLE subjects ADD COLUMN target_performance REAL DEFAULT 100;
ALTER TABLE subjects ADD COLUMN baseline_performance REAL;
ALTER TABLE subjects ADD COLUMN target_weekly_hours REAL DEFAULT 5;
ALTER TABLE subjects ADD COLUMN min_hours_per_week REAL;
ALTER TABLE subjects ADD COLUMN recommended_session_duration INTEGER DEFAULT 45;
ALTER TABLE subjects ADD COLUMN preferred_study_method TEXT;
ALTER TABLE subjects ADD COLUMN next_exam_date TEXT;
ALTER TABLE subjects ADD COLUMN exam_type TEXT;
ALTER TABLE subjects ADD COLUMN exam_weightage REAL;
ALTER TABLE subjects ADD COLUMN exam_preparation_status TEXT CHECK (exam_preparation_status IN ('not_started', 'in_progress', 'well_prepared'));
ALTER TABLE subjects ADD COLUMN total_chapters INTEGER;
ALTER TABLE subjects ADD COLUMN completed_chapters INTEGER DEFAULT 0;
ALTER TABLE subjects ADD COLUMN current_chapter TEXT;
ALTER TABLE subjects ADD COLUMN topics_list TEXT;
ALTER TABLE subjects ADD COLUMN textbook_name TEXT;
ALTER TABLE subjects ADD COLUMN textbook_edition TEXT;
ALTER TABLE subjects ADD COLUMN online_resources TEXT;
ALTER TABLE subjects ADD COLUMN video_course_links TEXT;
ALTER TABLE subjects ADD COLUMN study_materials_location TEXT;
ALTER TABLE subjects ADD COLUMN reference_books TEXT;
ALTER TABLE subjects ADD COLUMN subject_description TEXT;
ALTER TABLE subjects ADD COLUMN study_strategy_notes TEXT;
ALTER TABLE subjects ADD COLUMN class_schedule TEXT;
ALTER TABLE subjects ADD COLUMN notes TEXT;

-- ============================================================================
-- ADD MISSING COLUMNS TO STUDY_SESSIONS TABLE
-- ============================================================================

ALTER TABLE study_sessions ADD COLUMN focus_rating INTEGER CHECK (focus_rating >= 1 AND focus_rating <= 10);
ALTER TABLE study_sessions ADD COLUMN productivity_rating INTEGER CHECK (productivity_rating >= 1 AND productivity_rating <= 10);
ALTER TABLE study_sessions ADD COLUMN retention_rating INTEGER CHECK (retention_rating >= 1 AND retention_rating <= 10);
ALTER TABLE study_sessions ADD COLUMN effort_rating INTEGER CHECK (effort_rating >= 1 AND effort_rating <= 10);
ALTER TABLE study_sessions ADD COLUMN difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10);
ALTER TABLE study_sessions ADD COLUMN engagement_rating INTEGER CHECK (engagement_rating >= 1 AND engagement_rating <= 10);
ALTER TABLE study_sessions ADD COLUMN satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 10);
ALTER TABLE study_sessions ADD COLUMN goals_achieved_percentage INTEGER DEFAULT 0;
ALTER TABLE study_sessions ADD COLUMN topics_fully_understood INTEGER DEFAULT 0;
ALTER TABLE study_sessions ADD COLUMN topics_need_review INTEGER DEFAULT 0;
ALTER TABLE study_sessions ADD COLUMN pages_completed INTEGER DEFAULT 0;
ALTER TABLE study_sessions ADD COLUMN problems_completed INTEGER DEFAULT 0;
ALTER TABLE study_sessions ADD COLUMN what_went_well TEXT;
ALTER TABLE study_sessions ADD COLUMN what_didnt_go_well TEXT;
ALTER TABLE study_sessions ADD COLUMN key_concepts_learned TEXT;
ALTER TABLE study_sessions ADD COLUMN difficulties_encountered TEXT;
ALTER TABLE study_sessions ADD COLUMN questions_to_research TEXT;
ALTER TABLE study_sessions ADD COLUMN method_effective TEXT CHECK (method_effective IN ('yes', 'partial', 'no'));
ALTER TABLE study_sessions ADD COLUMN better_method_suggestion TEXT;
ALTER TABLE study_sessions ADD COLUMN main_distraction_source TEXT;
ALTER TABLE study_sessions ADD COLUMN distraction_impact TEXT CHECK (distraction_impact IN ('low', 'medium', 'high'));
ALTER TABLE study_sessions ADD COLUMN energy_level_after INTEGER CHECK (energy_level_after >= 1 AND energy_level_after <= 10);
ALTER TABLE study_sessions ADD COLUMN confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 10);
ALTER TABLE study_sessions ADD COLUMN action_items TEXT;
ALTER TABLE study_sessions ADD COLUMN topics_for_review TEXT;
ALTER TABLE study_sessions ADD COLUMN next_session_focus TEXT;
ALTER TABLE study_sessions ADD COLUMN schedule_next_session INTEGER DEFAULT 0;
ALTER TABLE study_sessions ADD COLUMN overall_notes TEXT;
ALTER TABLE study_sessions ADD COLUMN session_tags TEXT;

-- ============================================================================
-- CREATE MISSING TABLES
-- ============================================================================

-- Study Resources Table
CREATE TABLE IF NOT EXISTS study_resources (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_name TEXT NOT NULL,
  resource_type TEXT CHECK (resource_type IN ('textbook', 'ebook', 'video_course', 'article', 'pdf', 'research_paper', 'lecture_notes', 'practice_problems', 'past_papers', 'study_guide', 'flashcard_deck', 'audio', 'tutorial', 'website', 'app', 'physical_notes', 'other')),
  primary_subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  secondary_subjects TEXT, -- JSON array
  topics_covered TEXT, -- JSON array
  chapters_relevant TEXT,
  
  author_creator TEXT,
  publisher TEXT,
  edition_version TEXT,
  publication_date TEXT,
  isbn TEXT,
  language TEXT DEFAULT 'en',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  recommended_for TEXT, -- JSON array: initial_learning, review, practice, exam_prep, etc.
  
  access_type TEXT CHECK (access_type IN ('owned', 'digital', 'online', 'library', 'subscription', 'free', 'need_purchase')),
  location_link TEXT,
  physical_location TEXT,
  access_status TEXT CHECK (access_status IN ('available', 'borrowed', 'need_purchase', 'subscription_expired', 'lost')),
  
  total_pages INTEGER,
  total_duration TEXT,
  total_chapters INTEGER,
  current_progress INTEGER DEFAULT 0,
  pages_read INTEGER DEFAULT 0,
  chapters_completed INTEGER DEFAULT 0,
  completion_status TEXT CHECK (completion_status IN ('not_started', 'in_progress', 'completed', 'partially_reviewed', 'abandoned')),
  
  date_added TEXT DEFAULT (datetime('now')),
  last_accessed TEXT,
  times_accessed INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0,
  effectiveness_score REAL,
  
  personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
  usefulness_rating TEXT CHECK (usefulness_rating IN ('very_useful', 'useful', 'neutral', 'not_very_useful', 'not_useful')),
  quality_rating TEXT CHECK (quality_rating IN ('excellent', 'good', 'average', 'poor')),
  difficulty_vs_expected TEXT CHECK (difficulty_vs_expected IN ('easier', 'as_expected', 'harder')),
  would_recommend INTEGER DEFAULT 1,
  
  personal_notes TEXT,
  pros TEXT,
  cons TEXT,
  best_used_for TEXT,
  supplements_well_with TEXT, -- IDs of other resources
  tags TEXT, -- JSON array
  
  required_by_course INTEGER DEFAULT 0,
  recommended_by_instructor INTEGER DEFAULT 0,
  official_course_material INTEGER DEFAULT 0,
  instructor_name TEXT,
  course_name TEXT,
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN ('study_reminder', 'break_reminder', 'review_reminder', 'goal_progress', 'goal_deadline', 'streak_alert', 'performance_insight', 'burnout_warning', 'achievement', 'milestone', 'assessment_reminder', 'subject_attention', 'recommendation', 'system', 'motivational')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority_level TEXT CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed', 'acted_upon')),
  action_required INTEGER DEFAULT 0,
  primary_action_text TEXT,
  primary_action_link TEXT,
  secondary_action_text TEXT,
  secondary_action_link TEXT,
  related_subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  related_goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
  related_session_id TEXT REFERENCES study_sessions(id) ON DELETE SET NULL,
  related_assessment_id TEXT REFERENCES performance_entries(id) ON DELETE SET NULL,
  user_response TEXT,
  dismissed_reason TEXT,
  snoozed_until TEXT,
  expires_at TEXT,
  repeat_schedule TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  read_at TEXT,
  acted_at TEXT
);

-- Calendar Events Table (scheduled sessions)
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('study_session', 'assessment', 'review', 'break', 'blocked_time', 'class', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  end_time TEXT,
  study_method TEXT,
  topics TEXT, -- JSON array
  session_goal TEXT,
  is_all_day INTEGER DEFAULT 0,
  location TEXT,
  is_completed INTEGER DEFAULT 0,
  completed_session_id TEXT REFERENCES study_sessions(id) ON DELETE SET NULL,
  is_recurring INTEGER DEFAULT 0,
  recurrence_pattern TEXT, -- daily, weekly, monthly, custom
  recurrence_end_date TEXT,
  study_plan_id TEXT,
  is_flexible INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- CREATE INDEXES FOR NEW TABLES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_study_resources_user_id ON study_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_study_resources_subject_id ON study_resources(primary_subject_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_datetime ON calendar_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_calendar_events_subject_id ON calendar_events(subject_id);

-- ============================================================================
-- FINISHED
-- ============================================================================

SELECT 'Migration completed successfully!' as message;
