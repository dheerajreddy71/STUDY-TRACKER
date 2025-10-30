-- ============================================================================
-- COMPREHENSIVE STUDY TRACKER DATABASE SCHEMA
-- PostgreSQL Version - Supports 500+ fields across all modules
-- ============================================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. USERS TABLE (45+ fields)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  profile_picture_url TEXT,
  date_of_birth DATE,
  age INTEGER,
  time_zone VARCHAR(50) DEFAULT 'UTC',
  preferred_language VARCHAR(10) DEFAULT 'en',
  
  -- Academic Context
  academic_level VARCHAR(50) CHECK (academic_level IN ('high_school', 'undergraduate', 'graduate', 'exam_prep', 'other')),
  current_year_semester VARCHAR(50),
  institution_name VARCHAR(255),
  course_program_name VARCHAR(255),
  expected_graduation_date DATE,
  current_gpa DECIMAL(3,2),
  academic_goals TEXT,
  
  -- Study Preferences
  preferred_study_times JSONB, -- ['morning', 'afternoon', 'evening', 'night']
  avg_available_hours_per_day DECIMAL(4,2) DEFAULT 4.0,
  preferred_session_duration INTEGER DEFAULT 45,
  preferred_break_duration INTEGER DEFAULT 10,
  study_environment_preference VARCHAR(100),
  learning_style VARCHAR(50) CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading_writing', 'multimodal')),
  
  -- Notification Preferences
  notifications_enabled BOOLEAN DEFAULT TRUE,
  notify_study_reminders BOOLEAN DEFAULT TRUE,
  notify_break_reminders BOOLEAN DEFAULT TRUE,
  notify_review_reminders BOOLEAN DEFAULT TRUE,
  notify_goal_progress BOOLEAN DEFAULT TRUE,
  notify_streak_alerts BOOLEAN DEFAULT TRUE,
  notify_performance_insights BOOLEAN DEFAULT TRUE,
  notify_burnout_warnings BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  reminder_advance_time INTEGER DEFAULT 30,
  notification_frequency VARCHAR(20) DEFAULT 'medium' CHECK (notification_frequency IN ('low', 'medium', 'high')),
  
  -- Display Preferences
  theme VARCHAR(20) DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  color_scheme VARCHAR(50) DEFAULT 'default',
  dashboard_layout VARCHAR(20) DEFAULT 'detailed' CHECK (dashboard_layout IN ('compact', 'detailed', 'minimalist')),
  default_chart_type VARCHAR(20) DEFAULT 'bar' CHECK (default_chart_type IN ('bar', 'line', 'pie', 'mixed')),
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  time_format VARCHAR(5) DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  first_day_of_week VARCHAR(10) DEFAULT 'sunday' CHECK (first_day_of_week IN ('sunday', 'monday')),
  
  -- Goal Settings
  weekly_study_hour_target DECIMAL(5,2) DEFAULT 20.0,
  target_study_days_per_week INTEGER DEFAULT 5,
  minimum_session_length INTEGER DEFAULT 20,
  maximum_session_length INTEGER DEFAULT 120,
  rest_days_per_week INTEGER DEFAULT 2,
  
  -- Privacy & Data
  anonymous_usage_stats BOOLEAN DEFAULT FALSE,
  auto_export_schedule VARCHAR(20) DEFAULT 'never' CHECK (auto_export_schedule IN ('never', 'weekly', 'monthly')),
  
  -- Gamification
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Metadata
  is_guest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- ============================================================================
-- 2. SUBJECTS TABLE (35+ fields per subject)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Details
  name VARCHAR(255) NOT NULL,
  subject_code VARCHAR(50),
  category VARCHAR(50) CHECK (category IN ('mathematics', 'science', 'language', 'arts', 'social_studies', 'technical', 'other')),
  color_theme VARCHAR(20) DEFAULT '#3B82F6',
  icon VARCHAR(50),
  
  -- Difficulty & Priority
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'very_hard')),
  priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  importance_reason TEXT,
  
  -- Performance Tracking
  current_performance DECIMAL(5,2),
  target_performance DECIMAL(5,2),
  performance_trend VARCHAR(20) CHECK (performance_trend IN ('improving', 'stable', 'declining')),
  last_assessment_score DECIMAL(5,2),
  last_assessment_date DATE,
  
  -- Time Allocation
  weekly_target_hours DECIMAL(5,2) DEFAULT 5.0,
  actual_hours_this_week DECIMAL(5,2) DEFAULT 0,
  recommended_session_duration INTEGER DEFAULT 45,
  total_time_spent_minutes INTEGER DEFAULT 0,
  
  -- Exam Information
  has_exam BOOLEAN DEFAULT FALSE,
  exam_date DATE,
  exam_type VARCHAR(50),
  exam_weightage DECIMAL(5,2),
  exam_preparation_status VARCHAR(20) CHECK (exam_preparation_status IN ('not_started', 'in_progress', 'well_prepared', 'behind_schedule')),
  days_until_exam INTEGER,
  
  -- Content Structure
  total_chapters INTEGER DEFAULT 0,
  completed_chapters INTEGER DEFAULT 0,
  total_topics INTEGER DEFAULT 0,
  completed_topics INTEGER DEFAULT 0,
  syllabus_completion_percentage DECIMAL(5,2) DEFAULT 0,
  content_outline TEXT,
  
  -- Learning Resources
  primary_textbook VARCHAR(255),
  reference_books TEXT,
  online_resources TEXT,
  study_materials_location TEXT,
  
  -- Instructor Information
  instructor_name VARCHAR(255),
  instructor_email VARCHAR(255),
  instructor_office_hours TEXT,
  
  -- Study Approach
  preferred_study_methods TEXT,
  challenging_topics TEXT,
  mastered_topics TEXT,
  
  -- Notes & Strategies
  notes TEXT,
  study_strategy TEXT,
  improvement_areas TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  completion_status VARCHAR(20) DEFAULT 'in_progress' CHECK (completion_status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_studied_at TIMESTAMP
);

-- ============================================================================
-- 3. STUDY_SESSIONS TABLE (25+ fields)
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  
  -- Session Basics
  session_date DATE NOT NULL,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  planned_duration_minutes INTEGER,
  actual_duration_minutes INTEGER,
  session_type VARCHAR(50) CHECK (session_type IN ('new_material', 'review', 'practice', 'revision', 'exam_prep', 'homework', 'project')),
  
  -- Location & Environment
  location VARCHAR(100),
  study_environment VARCHAR(50) CHECK (study_environment IN ('home', 'library', 'classroom', 'cafe', 'outdoors', 'online', 'other')),
  noise_level VARCHAR(20) CHECK (noise_level IN ('silent', 'quiet', 'moderate', 'noisy')),
  
  -- Focus & Productivity
  average_focus_score DECIMAL(3,1),
  focus_checkins_count INTEGER DEFAULT 0,
  total_distractions INTEGER DEFAULT 0,
  distraction_types TEXT,
  productivity_rating INTEGER CHECK (productivity_rating BETWEEN 1 AND 5),
  
  -- Energy & Mood
  energy_level_before INTEGER CHECK (energy_level_before BETWEEN 1 AND 5),
  energy_level_after INTEGER CHECK (energy_level_after BETWEEN 1 AND 5),
  mood_before VARCHAR(50),
  mood_after VARCHAR(50),
  
  -- Study Method
  study_method VARCHAR(100),
  techniques_used TEXT,
  resources_used TEXT,
  
  -- Goals & Outcomes
  session_goal TEXT,
  goal_achieved VARCHAR(20) CHECK (goal_achieved IN ('fully', 'partially', 'not_achieved', 'exceeded')),
  topics_covered TEXT,
  concepts_learned TEXT,
  
  -- Challenges & Accomplishments
  challenges_faced TEXT,
  how_challenges_overcome TEXT,
  key_accomplishments TEXT,
  
  -- Reflection
  what_went_well TEXT,
  what_to_improve TEXT,
  next_session_plan TEXT,
  additional_notes TEXT,
  
  -- Breaks
  total_breaks_taken INTEGER DEFAULT 0,
  total_break_time_minutes INTEGER DEFAULT 0,
  
  -- Metadata
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. FOCUS_CHECKINS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS focus_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  
  checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  focus_score DECIMAL(3,1) NOT NULL CHECK (focus_score BETWEEN 1 AND 10),
  distraction_count INTEGER DEFAULT 0,
  distraction_description TEXT,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. PERFORMANCE_ENTRIES TABLE (25+ fields)
-- ============================================================================
CREATE TABLE IF NOT EXISTS performance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  
  -- Assessment Details
  assessment_type VARCHAR(50) CHECK (assessment_type IN ('exam', 'quiz', 'assignment', 'project', 'presentation', 'lab', 'midterm', 'final', 'practice_test', 'homework', 'other')),
  assessment_title VARCHAR(255) NOT NULL,
  assessment_date DATE NOT NULL,
  
  -- Scores
  marks_obtained DECIMAL(8,2) NOT NULL,
  total_marks DECIMAL(8,2) NOT NULL,
  percentage DECIMAL(5,2),
  grade VARCHAR(10),
  class_average DECIMAL(5,2),
  highest_score DECIMAL(8,2),
  lowest_score DECIMAL(8,2),
  
  -- Difficulty & Expectations
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('very_easy', 'easy', 'medium', 'hard', 'very_hard')),
  expected_score DECIMAL(8,2),
  score_vs_expectation VARCHAR(20) CHECK (score_vs_expectation IN ('exceeded', 'met', 'below')),
  
  -- Preparation
  preparation_time_hours DECIMAL(5,2),
  study_method_used VARCHAR(255),
  preparation_quality VARCHAR(20) CHECK (preparation_quality IN ('excellent', 'good', 'average', 'poor', 'insufficient')),
  
  -- Coverage
  topics_covered TEXT,
  chapters_covered TEXT,
  
  -- Analysis
  strong_areas TEXT,
  weak_areas TEXT,
  mistakes_made TEXT,
  lessons_learned TEXT,
  
  -- Confidence
  confidence_before_assessment INTEGER CHECK (confidence_before_assessment BETWEEN 1 AND 5),
  confidence_after_assessment INTEGER CHECK (confidence_after_assessment BETWEEN 1 AND 5),
  
  -- Improvement
  areas_for_improvement TEXT,
  action_plan TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  
  -- Additional Info
  weightage DECIMAL(5,2),
  contributes_to_final_grade BOOLEAN DEFAULT TRUE,
  instructor_feedback TEXT,
  personal_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. GOALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  
  -- Goal Details
  goal_name VARCHAR(255) NOT NULL,
  goal_description TEXT,
  goal_type VARCHAR(50) CHECK (goal_type IN ('performance', 'study_hours', 'consistency', 'completion', 'skill_mastery', 'other')),
  goal_category VARCHAR(50) CHECK (goal_category IN ('daily', 'weekly', 'monthly', 'semester', 'annual', 'custom')),
  
  -- Metrics
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(50),
  
  -- Timeline
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  
  -- Progress
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  milestones JSONB,
  
  -- Priority & Motivation
  priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  importance_reason TEXT,
  motivation_statement TEXT,
  reward_on_completion TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'failed', 'cancelled')),
  
  -- Settings
  track_automatically BOOLEAN DEFAULT TRUE,
  send_reminders BOOLEAN DEFAULT TRUE,
  reminder_frequency VARCHAR(20),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- ============================================================================
-- 7. ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  achievement_key VARCHAR(100) UNIQUE NOT NULL,
  achievement_name VARCHAR(255) NOT NULL,
  achievement_description TEXT,
  achievement_category VARCHAR(50) CHECK (achievement_category IN ('study_time', 'consistency', 'performance', 'improvement', 'special', 'milestone')),
  
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  xp_value INTEGER DEFAULT 0,
  
  unlocked BOOLEAN DEFAULT FALSE,
  unlock_date TIMESTAMP,
  progress_current INTEGER DEFAULT 0,
  progress_target INTEGER,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  
  times_earned INTEGER DEFAULT 0,
  icon VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. STREAKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  streak_type VARCHAR(50) NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  streak_start_date DATE,
  last_activity_date DATE,
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'broken')),
  freeze_tokens_available INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. CHALLENGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  challenge_title VARCHAR(255) NOT NULL,
  challenge_description TEXT,
  challenge_type VARCHAR(50) CHECK (challenge_type IN ('study_hours', 'focus_improvement', 'consistency', 'performance', 'skill_building')),
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INTEGER,
  
  challenge_goals JSONB,
  xp_reward INTEGER DEFAULT 0,
  badge_reward VARCHAR(100),
  
  difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'extreme')),
  
  progress_current INTEGER DEFAULT 0,
  progress_target INTEGER NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed', 'abandoned')),
  
  participants_count INTEGER DEFAULT 1,
  is_team_challenge BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- ============================================================================
-- 10. RECOMMENDATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  
  recommendation_type VARCHAR(50) NOT NULL,
  recommendation_category VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  impact_level VARCHAR(20) DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high')),
  
  action_items JSONB,
  reasoning TEXT,
  supporting_metrics JSONB,
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed')),
  
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  actioned_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. INSIGHTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  insight_type VARCHAR(50) NOT NULL,
  insight_title VARCHAR(255) NOT NULL,
  insight_description TEXT,
  
  key_finding TEXT,
  confidence_level DECIMAL(3,2),
  impact_potential VARCHAR(20) CHECK (impact_potential IN ('low', 'medium', 'high')),
  
  priority_score INTEGER DEFAULT 50,
  is_actionable BOOLEAN DEFAULT FALSE,
  recommended_actions TEXT,
  
  data_json JSONB,
  
  discovery_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  currently_relevant BOOLEAN DEFAULT TRUE,
  
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_date TIMESTAMP,
  
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_date TIMESTAMP,
  
  bookmarked BOOLEAN DEFAULT FALSE,
  user_rating VARCHAR(20) CHECK (user_rating IN ('helpful', 'not_helpful', 'misleading')),
  user_feedback TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. LEARNING_PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  identified_learning_style VARCHAR(50),
  learning_style_confidence DECIMAL(3,2),
  
  peak_performance_times JSONB,
  optimal_session_duration INTEGER,
  most_effective_methods JSONB,
  
  preferred_content_types JSONB,
  attention_span_estimate INTEGER,
  
  strengths JSONB,
  weaknesses JSONB,
  subject_affinities JSONB,
  
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_points_used INTEGER DEFAULT 0,
  confidence_score DECIMAL(3,2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 13. SPACED_REPETITION_ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS spaced_repetition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  
  item_type VARCHAR(50) CHECK (item_type IN ('concept', 'formula', 'vocabulary', 'fact', 'question')),
  content TEXT NOT NULL,
  answer TEXT,
  additional_notes TEXT,
  
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  
  next_review_date DATE NOT NULL,
  last_review_date DATE,
  
  review_history JSONB,
  total_reviews INTEGER DEFAULT 0,
  successful_reviews INTEGER DEFAULT 0,
  
  tags JSONB,
  
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 14. SUBJECT_ALLOCATION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subject_allocation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  allocation_week_start DATE NOT NULL,
  allocation_week_end DATE NOT NULL,
  
  total_available_hours DECIMAL(5,2) NOT NULL,
  allocation_strategy VARCHAR(50),
  
  allocations JSONB NOT NULL,
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  
  adherence_percentage DECIMAL(5,2),
  actual_hours_studied DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 15. RESOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  primary_subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  
  resource_type VARCHAR(50) CHECK (resource_type IN ('textbook', 'ebook', 'video', 'website', 'notes', 'article', 'course', 'tutorial', 'practice_problems', 'flashcards', 'other')),
  title VARCHAR(255) NOT NULL,
  author_creator VARCHAR(255),
  description TEXT,
  
  url TEXT,
  file_path TEXT,
  
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  
  progress_type VARCHAR(20) CHECK (progress_type IN ('none', 'pages', 'videos', 'chapters', 'percentage')),
  progress_current INTEGER DEFAULT 0,
  progress_total INTEGER,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused')),
  
  rating DECIMAL(2,1) CHECK (rating BETWEEN 0 AND 5),
  usefulness_rating INTEGER CHECK (usefulness_rating BETWEEN 1 AND 5),
  
  tags JSONB,
  notes TEXT,
  
  is_favorite BOOLEAN DEFAULT FALSE,
  access_type VARCHAR(20) CHECK (access_type IN ('owned', 'borrowed', 'online', 'subscription')),
  
  last_accessed_at TIMESTAMP,
  times_accessed INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 16. RESOURCE_COLLECTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS resource_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  collection_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  collection_type VARCHAR(50),
  
  resource_ids JSONB,
  
  is_public BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 17. CALENDAR_EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type VARCHAR(50) CHECK (event_type IN ('study_session', 'assessment', 'blocked_time', 'rest_day', 'milestone', 'custom')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Subject Association
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  
  -- Time Details
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP,
  duration_minutes INTEGER,
  all_day BOOLEAN DEFAULT FALSE,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB,
  recurrence_end_date DATE,
  
  -- Study Plan Association
  study_plan_id UUID,
  is_flexible BOOLEAN DEFAULT FALSE,
  
  -- Session Details
  session_type VARCHAR(100),
  study_method VARCHAR(100),
  location VARCHAR(255),
  
  -- Preparation & Tasks
  preparation_required TEXT,
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard', 'very_hard')),
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Linked Items
  linked_resource_ids JSONB,
  linked_goal_ids JSONB,
  
  -- Reminders
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_minutes_before INTEGER DEFAULT 30,
  notification_sent BOOLEAN DEFAULT FALSE,
  
  -- Pre/Post Tasks
  pre_session_checklist JSONB,
  post_session_tasks JSONB,
  
  -- Additional Details
  notes TEXT,
  tags JSONB,
  color VARCHAR(20),
  
  -- Status
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'missed', 'rescheduled', 'cancelled')),
  actual_session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
  
  -- Completion tracking
  completion_status VARCHAR(50),
  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,
  cancellation_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 18. USER_PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session Defaults
  default_session_duration INTEGER DEFAULT 45,
  default_break_duration INTEGER DEFAULT 10,
  default_study_method VARCHAR(100),
  
  -- Goal Defaults
  daily_study_hour_goal DECIMAL(4,2) DEFAULT 4.0,
  weekly_study_hour_goal DECIMAL(5,2) DEFAULT 20.0,
  
  -- Analytics Visibility
  show_focus_analytics BOOLEAN DEFAULT TRUE,
  show_performance_analytics BOOLEAN DEFAULT TRUE,
  show_time_analytics BOOLEAN DEFAULT TRUE,
  show_streak_analytics BOOLEAN DEFAULT TRUE,
  
  -- Privacy
  data_sharing_enabled BOOLEAN DEFAULT FALSE,
  anonymous_analytics BOOLEAN DEFAULT TRUE,
  
  -- Export
  auto_export_frequency VARCHAR(20),
  export_format VARCHAR(10) DEFAULT 'json',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 19. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  action_url TEXT,
  action_label VARCHAR(100),
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  delivery_method VARCHAR(20) DEFAULT 'in_app' CHECK (delivery_method IN ('in_app', 'email', 'push', 'sms')),
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMP,
  
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Subjects indexes
CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_subjects_category ON subjects(category);
CREATE INDEX idx_subjects_is_active ON subjects(is_active);
CREATE INDEX idx_subjects_exam_date ON subjects(exam_date);

-- Study sessions indexes
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_subject_id ON study_sessions(subject_id);
CREATE INDEX idx_study_sessions_date ON study_sessions(session_date);
CREATE INDEX idx_study_sessions_completed ON study_sessions(is_completed);

-- Focus checkins indexes
CREATE INDEX idx_focus_checkins_session_id ON focus_checkins(session_id);
CREATE INDEX idx_focus_checkins_time ON focus_checkins(checkin_time);

-- Performance entries indexes
CREATE INDEX idx_performance_user_id ON performance_entries(user_id);
CREATE INDEX idx_performance_subject_id ON performance_entries(subject_id);
CREATE INDEX idx_performance_date ON performance_entries(assessment_date);
CREATE INDEX idx_performance_type ON performance_entries(assessment_type);

-- Goals indexes
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_subject_id ON goals(subject_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_target_date ON goals(target_completion_date);

-- Achievements indexes
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_unlocked ON achievements(unlocked);
CREATE INDEX idx_achievements_category ON achievements(achievement_category);

-- Streaks indexes
CREATE INDEX idx_streaks_user_id ON streaks(user_id);
CREATE INDEX idx_streaks_type ON streaks(streak_type);
CREATE INDEX idx_streaks_status ON streaks(status);

-- Challenges indexes
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);

-- Recommendations indexes
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_subject_id ON recommendations(subject_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_recommendations_priority ON recommendations(priority_level);

-- Insights indexes
CREATE INDEX idx_insights_user_id ON insights(user_id);
CREATE INDEX idx_insights_relevant ON insights(currently_relevant);
CREATE INDEX idx_insights_acknowledged ON insights(acknowledged);

-- Learning profiles indexes
CREATE INDEX idx_learning_profiles_user_id ON learning_profiles(user_id);

-- Spaced repetition indexes
CREATE INDEX idx_spaced_rep_user_id ON spaced_repetition_items(user_id);
CREATE INDEX idx_spaced_rep_subject_id ON spaced_repetition_items(subject_id);
CREATE INDEX idx_spaced_rep_next_review ON spaced_repetition_items(next_review_date);
CREATE INDEX idx_spaced_rep_status ON spaced_repetition_items(status);

-- Subject allocation indexes
CREATE INDEX idx_subject_allocation_user_id ON subject_allocation(user_id);
CREATE INDEX idx_subject_allocation_week ON subject_allocation(allocation_week_start);

-- Resources indexes
CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_resources_subject_id ON resources(primary_subject_id);
CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_status ON resources(status);

-- Resource collections indexes
CREATE INDEX idx_resource_collections_user_id ON resource_collections(user_id);
CREATE INDEX idx_resource_collections_subject_id ON resource_collections(subject_id);

-- Calendar events indexes
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_datetime ON calendar_events(start_datetime);
CREATE INDEX idx_calendar_events_subject_id ON calendar_events(subject_id);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);

-- User preferences indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_sessions_updated_at BEFORE UPDATE ON study_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_entries_updated_at BEFORE UPDATE ON performance_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaced_repetition_items_updated_at BEFORE UPDATE ON spaced_repetition_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subject_allocation_updated_at BEFORE UPDATE ON subject_allocation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_collections_updated_at BEFORE UPDATE ON resource_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Stores user account information and preferences';
COMMENT ON TABLE subjects IS 'Academic subjects with comprehensive tracking data';
COMMENT ON TABLE study_sessions IS 'Individual study session records with detailed metrics';
COMMENT ON TABLE focus_checkins IS 'Real-time focus tracking during study sessions';
COMMENT ON TABLE performance_entries IS 'Academic performance and assessment results';
COMMENT ON TABLE goals IS 'User-defined study goals and targets';
COMMENT ON TABLE achievements IS 'Gamification achievements and badges';
COMMENT ON TABLE streaks IS 'Study consistency streaks';
COMMENT ON TABLE challenges IS 'Study challenges and competitions';
COMMENT ON TABLE recommendations IS 'AI-generated study recommendations';
COMMENT ON TABLE insights IS 'Auto-generated insights from study data';
COMMENT ON TABLE learning_profiles IS 'Personalized learning style analysis';
COMMENT ON TABLE spaced_repetition_items IS 'Spaced repetition system items';
COMMENT ON TABLE subject_allocation IS 'Weekly study time allocation plans';
COMMENT ON TABLE resources IS 'Study materials and resources';
COMMENT ON TABLE resource_collections IS 'Organized collections of resources';
COMMENT ON TABLE calendar_events IS 'Study schedule and calendar events';
COMMENT ON TABLE user_preferences IS 'User-specific preference settings';
COMMENT ON TABLE notifications IS 'System notifications and alerts';

-- ============================================================================
-- GRANT PERMISSIONS (Adjust based on your user roles)
-- ============================================================================

-- Example: Grant all privileges to application user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO study_tracker_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO study_tracker_app;

-- ============================================================================
-- SCHEMA MIGRATION COMPLETE
-- ============================================================================

SELECT 'PostgreSQL schema created successfully!' AS message;
