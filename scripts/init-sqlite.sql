-- SQLite Schema for Study Habit Tracker
-- This script initializes all tables and relationships

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  education_level TEXT CHECK (education_level IN ('high_school', 'undergraduate', 'graduate', 'exam_prep')),
  primary_goal TEXT CHECK (primary_goal IN ('improve_grades', 'exam_prep', 'skill_learning', 'time_management')),
  study_style TEXT CHECK (study_style IN ('visual', 'auditory', 'kinesthetic', 'reading_writing')),
  study_environment TEXT,
  energy_level TEXT CHECK (energy_level IN ('morning', 'afternoon', 'evening', 'night_owl')),
  current_challenges TEXT,
  profile_picture_url TEXT,
  is_guest INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('mathematics', 'science', 'language', 'social_studies', 'technical', 'other')),
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'very_hard')),
  current_grade REAL,
  target_grade REAL,
  credits_weight REAL,
  color_theme TEXT DEFAULT '#3B82F6',
  instructor_name TEXT,
  exam_date TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, name)
);

-- Study Sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  study_method TEXT CHECK (study_method IN ('reading', 'practice_problems', 'video_lecture', 'notes', 'flashcards', 'group_study', 'other')),
  session_goal TEXT,
  accomplishments TEXT,
  location TEXT,
  duration_minutes INTEGER NOT NULL,
  actual_duration_minutes INTEGER,
  target_duration_minutes INTEGER,
  average_focus_score REAL,
  goal_achieved TEXT CHECK (goal_achieved IN ('yes', 'partial', 'no')),
  challenges TEXT,
  notes TEXT,
  break_duration_minutes INTEGER DEFAULT 0,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  paused_duration_minutes INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Focus Check-ins table
CREATE TABLE IF NOT EXISTS focus_checkins (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_id TEXT NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  focus_score INTEGER CHECK (focus_score >= 1 AND focus_score <= 10),
  timestamp TEXT DEFAULT (datetime('now'))
);

-- Performance Entries table
CREATE TABLE IF NOT EXISTS performance_entries (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  entry_type TEXT CHECK (entry_type IN ('quiz', 'test', 'exam', 'assignment', 'self_assessment', 'mock_test')),
  score REAL NOT NULL,
  total_possible REAL NOT NULL,
  percentage REAL,
  assessment_name TEXT,
  difficulty_rating TEXT CHECK (difficulty_rating IN ('easy', 'medium', 'hard', 'very_hard')),
  topics_covered TEXT,
  time_spent_minutes INTEGER,
  notes TEXT,
  assessment_date TEXT NOT NULL,
  linked_session_id TEXT REFERENCES study_sessions(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  goal_type TEXT CHECK (goal_type IN ('study_hours', 'session_count', 'performance_average', 'streak_length', 'subject_completion', 'custom')),
  goal_category TEXT CHECK (goal_category IN ('daily', 'weekly', 'monthly', 'semester', 'annual')),
  target_value REAL NOT NULL,
  current_value REAL DEFAULT 0,
  metric_name TEXT,
  deadline TEXT,
  is_completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  earned_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  streak_type TEXT CHECK (streak_type IN ('study', 'subject_specific')),
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_study_date TEXT,
  skips_used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  primary_color TEXT DEFAULT '#3B82F6',
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  time_format TEXT DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
  week_start_day TEXT DEFAULT 'monday' CHECK (week_start_day IN ('sunday', 'monday')),
  timezone TEXT DEFAULT 'UTC',
  default_session_duration_minutes INTEGER DEFAULT 50,
  break_interval_minutes INTEGER DEFAULT 25,
  focus_checkin_frequency_minutes INTEGER DEFAULT 15,
  min_session_duration_minutes INTEGER DEFAULT 5,
  auto_pause_detection INTEGER DEFAULT 1,
  notifications_enabled INTEGER DEFAULT 1,
  study_reminders_enabled INTEGER DEFAULT 1,
  break_reminders_enabled INTEGER DEFAULT 1,
  performance_reminders_enabled INTEGER DEFAULT 1,
  insight_notifications_enabled INTEGER DEFAULT 1,
  achievement_notifications_enabled INTEGER DEFAULT 1,
  quiet_hours_start TEXT,
  quiet_hours_end TEXT,
  data_retention_days INTEGER DEFAULT 365,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Insights & Patterns table
CREATE TABLE IF NOT EXISTS insights (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type TEXT CHECK (insight_type IN ('pattern', 'alert', 'recommendation', 'achievement')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data_json TEXT,
  confidence_level REAL,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Learning Style Profile table
CREATE TABLE IF NOT EXISTS learning_style_profile (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  visual_percentage REAL DEFAULT 0,
  auditory_percentage REAL DEFAULT 0,
  kinesthetic_percentage REAL DEFAULT 0,
  reading_writing_percentage REAL DEFAULT 0,
  primary_style TEXT,
  last_updated TEXT DEFAULT (datetime('now'))
);

-- Study Method Effectiveness table
CREATE TABLE IF NOT EXISTS method_effectiveness (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  study_method TEXT NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  average_focus_score REAL,
  average_performance_improvement REAL,
  success_rate REAL,
  last_used TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Scheduled Study Sessions table
CREATE TABLE IF NOT EXISTS scheduled_sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  study_method TEXT,
  is_completed INTEGER DEFAULT 0,
  completed_session_id TEXT REFERENCES study_sessions(id) ON DELETE SET NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IN ('weekly', 'monthly', 'custom')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_study_hours REAL,
  sessions_count INTEGER,
  subjects_studied TEXT,
  performance_entries_count INTEGER,
  report_data TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Data Backups table
CREATE TABLE IF NOT EXISTS data_backups (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  backup_type TEXT CHECK (backup_type IN ('automatic', 'manual')),
  backup_data TEXT NOT NULL,
  file_size_bytes INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  changes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject_id ON study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON study_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_performance_entries_user_id ON performance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_entries_subject_id ON performance_entries(subject_id);
CREATE INDEX IF NOT EXISTS idx_performance_entries_assessment_date ON performance_entries(assessment_date);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_checkins_session_id ON focus_checkins(session_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_user_id ON scheduled_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_scheduled_date ON scheduled_sessions(scheduled_date);

-- Create a default guest user for demo purposes
INSERT OR IGNORE INTO users (id, email, name, education_level, primary_goal, study_style, energy_level, current_challenges, is_guest)
VALUES ('guest-user', 'guest@studytracker.app', 'Guest User', 'undergraduate', 'improve_grades', 'visual', 'morning', '[]', 1);

-- Create default preferences for guest user
INSERT OR IGNORE INTO user_preferences (user_id) VALUES ('guest-user');
