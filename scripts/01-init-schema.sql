-- Create schema for Study Habit Tracker
-- This script initializes all tables and relationships

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  education_level TEXT CHECK (education_level IN ('high_school', 'undergraduate', 'graduate', 'exam_prep')),
  primary_goal TEXT CHECK (primary_goal IN ('improve_grades', 'exam_prep', 'skill_learning', 'time_management')),
  study_style TEXT CHECK (study_style IN ('visual', 'auditory', 'kinesthetic', 'reading_writing')),
  study_environment TEXT,
  energy_level TEXT CHECK (energy_level IN ('morning', 'afternoon', 'evening', 'night_owl')),
  current_challenges TEXT[],
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_guest BOOLEAN DEFAULT FALSE
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('mathematics', 'science', 'language', 'social_studies', 'technical', 'other')),
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'very_hard')),
  current_grade DECIMAL(5,2),
  target_grade DECIMAL(5,2),
  credits_weight DECIMAL(5,2),
  color_theme TEXT DEFAULT '#3B82F6',
  instructor_name TEXT,
  exam_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Study Sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  study_method TEXT CHECK (study_method IN ('reading', 'practice_problems', 'video_lecture', 'notes', 'flashcards', 'group_study', 'other')),
  session_goal TEXT,
  location TEXT,
  duration_minutes INTEGER NOT NULL,
  actual_duration_minutes INTEGER,
  target_duration_minutes INTEGER,
  average_focus_score DECIMAL(3,1),
  goal_achieved TEXT CHECK (goal_achieved IN ('yes', 'partial', 'no')),
  challenges TEXT[],
  notes TEXT,
  break_duration_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  paused_duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Focus Check-ins table (for tracking focus during sessions)
CREATE TABLE IF NOT EXISTS focus_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  focus_score INTEGER CHECK (focus_score >= 1 AND focus_score <= 10),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Entries table
CREATE TABLE IF NOT EXISTS performance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  entry_type TEXT CHECK (entry_type IN ('quiz', 'test', 'exam', 'assignment', 'self_assessment', 'mock_test')),
  score DECIMAL(5,2) NOT NULL,
  total_possible DECIMAL(5,2) NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (score * 100 / total_possible) STORED,
  assessment_name TEXT,
  difficulty_rating TEXT CHECK (difficulty_rating IN ('easy', 'medium', 'hard', 'very_hard')),
  topics_covered TEXT[],
  time_spent_minutes INTEGER,
  notes TEXT,
  assessment_date DATE NOT NULL,
  linked_session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  goal_type TEXT CHECK (goal_type IN ('study_hours', 'session_count', 'performance_average', 'streak_length', 'subject_completion', 'custom')),
  goal_category TEXT CHECK (goal_category IN ('daily', 'weekly', 'monthly', 'semester', 'annual')),
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  metric_name TEXT,
  deadline DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  streak_type TEXT CHECK (streak_type IN ('study', 'subject_specific')),
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_study_date DATE,
  skips_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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
  auto_pause_detection BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  study_reminders_enabled BOOLEAN DEFAULT TRUE,
  break_reminders_enabled BOOLEAN DEFAULT TRUE,
  performance_reminders_enabled BOOLEAN DEFAULT TRUE,
  insight_notifications_enabled BOOLEAN DEFAULT TRUE,
  achievement_notifications_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  data_retention_days INTEGER DEFAULT 365,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insights & Patterns table
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type TEXT CHECK (insight_type IN ('pattern', 'alert', 'recommendation', 'achievement')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data_json JSONB,
  confidence_level DECIMAL(3,2),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning Style Profile table
CREATE TABLE IF NOT EXISTS learning_style_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  visual_percentage DECIMAL(5,2) DEFAULT 0,
  auditory_percentage DECIMAL(5,2) DEFAULT 0,
  kinesthetic_percentage DECIMAL(5,2) DEFAULT 0,
  reading_writing_percentage DECIMAL(5,2) DEFAULT 0,
  primary_style TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Study Method Effectiveness table
CREATE TABLE IF NOT EXISTS method_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  study_method TEXT NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  average_focus_score DECIMAL(3,1),
  average_performance_improvement DECIMAL(5,2),
  success_rate DECIMAL(5,2),
  last_used DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scheduled Study Sessions table
CREATE TABLE IF NOT EXISTS scheduled_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  study_method TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IN ('weekly', 'monthly', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_study_hours DECIMAL(10,2),
  sessions_count INTEGER,
  subjects_studied TEXT[],
  performance_entries_count INTEGER,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data Backups table
CREATE TABLE IF NOT EXISTS data_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  backup_type TEXT CHECK (backup_type IN ('automatic', 'manual')),
  backup_data JSONB NOT NULL,
  file_size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
