-- ============================================================================
-- COMPREHENSIVE STUDY TRACKER DATABASE SCHEMA
-- SQLite Version - Supports 500+ fields across all modules
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE (45+ fields)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  
  -- Basic Information
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  profile_picture_url TEXT,
  date_of_birth TEXT,
  age INTEGER,
  time_zone TEXT DEFAULT 'UTC',
  preferred_language TEXT DEFAULT 'en',
  
  -- Academic Context
  academic_level TEXT CHECK (academic_level IN ('high_school', 'undergraduate', 'graduate', 'exam_prep', 'other')),
  current_year_semester TEXT,
  institution_name TEXT,
  course_program_name TEXT,
  expected_graduation_date TEXT,
  current_gpa REAL,
  academic_goals TEXT,
  
  -- Study Preferences
  preferred_study_times TEXT, -- JSON array: ['morning', 'afternoon', 'evening', 'night']
  avg_available_hours_per_day REAL DEFAULT 4.0,
  preferred_session_duration INTEGER DEFAULT 45,
  preferred_break_duration INTEGER DEFAULT 10,
  study_environment_preference TEXT,
  learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading_writing', 'multimodal')),
  
  -- Notification Preferences
  notifications_enabled INTEGER DEFAULT 1,
  notify_study_reminders INTEGER DEFAULT 1,
  notify_break_reminders INTEGER DEFAULT 1,
  notify_review_reminders INTEGER DEFAULT 1,
  notify_goal_progress INTEGER DEFAULT 1,
  notify_streak_alerts INTEGER DEFAULT 1,
  notify_performance_insights INTEGER DEFAULT 1,
  notify_burnout_warnings INTEGER DEFAULT 1,
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '07:00',
  reminder_advance_time INTEGER DEFAULT 30,
  notification_frequency TEXT DEFAULT 'medium' CHECK (notification_frequency IN ('low', 'medium', 'high')),
  
  -- Display Preferences
  theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  color_scheme TEXT DEFAULT 'default',
  dashboard_layout TEXT DEFAULT 'detailed' CHECK (dashboard_layout IN ('compact', 'detailed', 'minimalist')),
  default_chart_type TEXT DEFAULT 'bar' CHECK (default_chart_type IN ('bar', 'line', 'pie', 'mixed')),
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  first_day_of_week TEXT DEFAULT 'sunday' CHECK (first_day_of_week IN ('sunday', 'monday')),
  
  -- Goal Settings
  weekly_study_hour_target REAL DEFAULT 20.0,
  target_study_days_per_week INTEGER DEFAULT 5,
  minimum_session_length INTEGER DEFAULT 20,
  maximum_session_length INTEGER DEFAULT 120,
  rest_days_per_week INTEGER DEFAULT 2,
  
  -- Privacy & Data
  anonymous_usage_stats INTEGER DEFAULT 0,
  auto_export_schedule TEXT DEFAULT 'never' CHECK (auto_export_schedule IN ('never', 'weekly', 'monthly')),
  
  -- Gamification
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Metadata
  is_guest INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT
);

-- ============================================================================
-- 2. SUBJECTS TABLE (35+ fields per subject)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Details
  name TEXT NOT NULL,
  subject_code TEXT,
  category TEXT CHECK (category IN ('mathematics', 'science', 'language', 'arts', 'social_studies', 'technical', 'other')),
  color_theme TEXT DEFAULT '#3B82F6',
  icon TEXT,
  
  -- Difficulty & Priority
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'very_hard')),
  current_priority TEXT DEFAULT 'medium' CHECK (current_priority IN ('low', 'medium', 'high', 'critical')),
  priority_reason TEXT,
  
  -- Performance Details
  current_performance REAL DEFAULT 0.0,
  target_performance REAL DEFAULT 85.0,
  baseline_performance REAL,
  
  -- Time Allocation
  target_weekly_hours REAL DEFAULT 5.0,
  minimum_hours_per_week REAL DEFAULT 2.0,
  recommended_session_duration INTEGER DEFAULT 45,
  preferred_study_method TEXT,
  
  -- Assessment Schedule
  next_exam_date TEXT,
  exam_type TEXT,
  exam_weightage REAL,
  exam_prep_status TEXT CHECK (exam_prep_status IN ('not_started', 'in_progress', 'well_prepared')),
  
  -- Content Structure
  total_chapters INTEGER DEFAULT 0,
  completed_chapters INTEGER DEFAULT 0,
  current_chapter TEXT,
  topics_list TEXT, -- JSON array
  
  -- Learning Resources
  textbook_name TEXT,
  textbook_edition TEXT,
  online_resources TEXT, -- JSON array
  video_course_links TEXT, -- JSON array
  study_materials_location TEXT,
  reference_books TEXT, -- JSON array
  
  -- Custom Notes
  description TEXT,
  study_strategy_notes TEXT,
  instructor_name TEXT,
  class_schedule TEXT, -- JSON array
  
  -- Historical Data (Auto-tracked)
  total_study_hours REAL DEFAULT 0.0,
  average_session_duration REAL DEFAULT 0.0,
  total_sessions_completed INTEGER DEFAULT 0,
  average_focus_rating REAL DEFAULT 0.0,
  average_confidence_rating REAL DEFAULT 0.0,
  performance_trend TEXT,
  last_studied_at TEXT,
  days_since_last_studied INTEGER DEFAULT 0,
  current_subject_streak INTEGER DEFAULT 0,
  longest_subject_streak INTEGER DEFAULT 0,
  
  -- Status Indicators (Auto-calculated)
  overall_health_status TEXT,
  preparation_level REAL DEFAULT 0.0,
  retention_risk TEXT CHECK (retention_risk IN ('low', 'medium', 'high')),
  burnout_risk TEXT CHECK (burnout_risk IN ('none', 'low', 'moderate', 'high')),
  
  -- Metadata
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  UNIQUE(user_id, name)
);

-- ============================================================================
-- 3. STUDY_SESSIONS TABLE (50+ fields per session)
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  
  -- Pre-Session Setup
  session_type TEXT CHECK (session_type IN ('new_material', 'review', 'practice', 'revision', 'exam_prep', 'homework', 'project')),
  session_purpose TEXT,
  study_method TEXT CHECK (study_method IN ('reading', 'video_lecture', 'practice_problems', 'flashcards', 'notes', 'mind_mapping', 'active_recall', 'spaced_repetition', 'past_papers', 'group_study', 'teaching_others', 'coding', 'writing', 'research', 'audio_lectures', 'custom')),
  secondary_method TEXT,
  
  -- Content Specification
  chapter_unit TEXT,
  topics_covered TEXT, -- JSON array
  specific_pages TEXT,
  learning_objectives TEXT,
  
  -- Session Settings
  target_duration_minutes INTEGER DEFAULT 60,
  auto_break_enabled INTEGER DEFAULT 1,
  break_interval_minutes INTEGER DEFAULT 50,
  break_duration_minutes INTEGER DEFAULT 10,
  focus_mode_enabled INTEGER DEFAULT 0,
  background_ambiance TEXT,
  
  -- Pre-Session State
  energy_level_before INTEGER CHECK (energy_level_before BETWEEN 1 AND 10),
  motivation_level_before INTEGER CHECK (motivation_level_before BETWEEN 1 AND 10),
  hours_sleep_last_night REAL,
  meals_today TEXT, -- JSON array: ['breakfast', 'lunch', 'dinner']
  mood_before TEXT CHECK (mood_before IN ('great', 'good', 'okay', 'low', 'very_low')),
  distractions_present TEXT,
  
  -- Time Tracking
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  actual_duration_minutes INTEGER,
  break_count INTEGER DEFAULT 0,
  total_break_time_minutes INTEGER DEFAULT 0,
  productive_time_minutes INTEGER DEFAULT 0,
  paused_duration_minutes INTEGER DEFAULT 0,
  
  -- During Session Tracking
  focus_level_log TEXT, -- JSON array of {timestamp, level}
  session_notes TEXT,
  timestamped_notes TEXT, -- JSON array
  distraction_log TEXT, -- JSON array
  pages_completed INTEGER DEFAULT 0,
  problems_completed INTEGER DEFAULT 0,
  
  -- Post-Session Ratings
  average_focus_score REAL CHECK (average_focus_score BETWEEN 1 AND 10),
  confidence_level REAL CHECK (confidence_level BETWEEN 1 AND 10),
  energy_level_after INTEGER CHECK (energy_level_after BETWEEN 1 AND 10),
  productivity_rating REAL CHECK (productivity_rating BETWEEN 1 AND 10),
  material_difficulty INTEGER CHECK (material_difficulty BETWEEN 1 AND 5),
  
  -- Progress Assessment
  session_goal TEXT,
  accomplishments TEXT,
  goals_achieved_percentage REAL DEFAULT 0.0,
  goal_achieved TEXT CHECK (goal_achieved IN ('yes', 'partial', 'no')),
  topics_fully_understood INTEGER DEFAULT 0,
  topics_need_review INTEGER DEFAULT 0,
  
  -- Distraction Analysis
  total_distraction_time_minutes INTEGER DEFAULT 0,
  main_distraction_source TEXT,
  distraction_impact TEXT CHECK (distraction_impact IN ('low', 'medium', 'high')),
  
  -- Quality Indicators (JSON arrays)
  what_went_well TEXT,
  what_didnt_go_well TEXT,
  
  -- Detailed Notes
  overall_notes TEXT,
  key_concepts_learned TEXT,
  difficulties_encountered TEXT,
  questions_to_research TEXT,
  action_items TEXT,
  
  -- Method Effectiveness
  method_effective TEXT CHECK (method_effective IN ('yes', 'no', 'partially')),
  better_method_suggestion TEXT,
  
  -- Tags & Next Steps
  session_tags TEXT, -- JSON array
  topics_for_review TEXT, -- JSON array
  next_session_focus TEXT,
  schedule_next_session INTEGER DEFAULT 0,
  
  -- Location
  location TEXT,
  
  -- Metadata
  challenges TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- 4. FOCUS_CHECKINS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS focus_checkins (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  session_id TEXT NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  focus_score INTEGER CHECK (focus_score BETWEEN 1 AND 10),
  timestamp TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- 5. PERFORMANCE_ENTRIES TABLE (40+ fields per assessment)
-- ============================================================================
CREATE TABLE IF NOT EXISTS performance_entries (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  
  -- Assessment Identification
  assessment_title TEXT NOT NULL,
  assessment_type TEXT CHECK (assessment_type IN ('quiz', 'test', 'midterm', 'final', 'assignment', 'homework', 'project', 'presentation', 'lab_report', 'practice_test', 'mock_exam', 'competitive_exam', 'other')),
  assessment_id_number TEXT,
  
  -- Date & Time
  assessment_date TEXT NOT NULL,
  assessment_time TEXT,
  date_received_results TEXT,
  
  -- Score Information
  score REAL NOT NULL,
  total_possible REAL NOT NULL,
  percentage REAL,
  grade TEXT,
  score_format TEXT CHECK (score_format IN ('percentage', 'points', 'grade', 'gpa')),
  
  -- Class Context
  class_average REAL,
  highest_score REAL,
  lowest_score REAL,
  your_rank INTEGER,
  percentile REAL,
  total_students INTEGER,
  
  -- Weight & Importance
  assessment_weight REAL DEFAULT 0.0,
  importance_level TEXT CHECK (importance_level IN ('low', 'medium', 'high', 'critical')),
  counts_toward_final INTEGER DEFAULT 1,
  
  -- Content Coverage
  chapters_covered TEXT, -- JSON array
  topics_tested TEXT, -- JSON array
  total_questions INTEGER,
  questions_correct INTEGER,
  
  -- Topic-wise Performance
  topic_breakdown TEXT, -- JSON array: [{topic, questions, correct, difficulty, confidence}]
  
  -- Time Information
  time_allocated_minutes INTEGER,
  time_taken_minutes INTEGER,
  time_pressure_level TEXT CHECK (time_pressure_level IN ('too_rushed', 'bit_rushed', 'just_right', 'too_much_time')),
  
  -- Preparation Information
  total_hours_studied REAL DEFAULT 0.0,
  days_of_preparation INTEGER DEFAULT 0,
  preparation_start_date TEXT,
  study_methods_used TEXT, -- JSON array
  preparation_quality INTEGER CHECK (preparation_quality BETWEEN 1 AND 10),
  
  -- Linked Sessions
  linked_session_ids TEXT, -- JSON array
  total_linked_study_hours REAL DEFAULT 0.0,
  average_linked_focus REAL DEFAULT 0.0,
  
  -- Pre-Assessment State
  confidence_before INTEGER CHECK (confidence_before BETWEEN 1 AND 10),
  felt_prepared TEXT CHECK (felt_prepared IN ('yes', 'no', 'partially')),
  expected_score_min REAL,
  expected_score_max REAL,
  
  -- External Factors
  sleep_night_before REAL,
  stress_level_before INTEGER CHECK (stress_level_before BETWEEN 1 AND 10),
  health_status TEXT CHECK (health_status IN ('healthy', 'minor_illness', 'unwell')),
  other_factors TEXT,
  
  -- Post-Assessment Reflection
  score_vs_expectation TEXT CHECK (score_vs_expectation IN ('better', 'as_expected', 'worse')),
  score_surprise_level INTEGER CHECK (score_surprise_level BETWEEN 1 AND 10),
  confidence_after_taking INTEGER CHECK (confidence_after_taking BETWEEN 1 AND 10),
  confidence_after_results INTEGER CHECK (confidence_after_results BETWEEN 1 AND 10),
  score_reflects_knowledge TEXT CHECK (score_reflects_knowledge IN ('yes', 'no', 'partially')),
  
  -- Performance Analysis
  strengths_topics TEXT, -- JSON array
  strengths_question_types TEXT, -- JSON array
  what_helped_succeed TEXT,
  weaknesses_topics TEXT, -- JSON array
  weaknesses_question_types TEXT, -- JSON array
  common_mistakes TEXT,
  concepts_still_unclear TEXT,
  
  -- Detailed Analysis
  questions_missed_breakdown TEXT, -- JSON: {lack_knowledge, careless, time_pressure, misread, anxiety, other}
  
  -- Learning Insights
  lessons_learned TEXT,
  what_to_do_differently TEXT,
  most_effective_study_approach TEXT,
  least_effective_study_approach TEXT,
  
  -- Study Strategy Evaluation
  most_effective_methods TEXT, -- JSON array ranked
  least_effective_methods TEXT, -- JSON array ranked
  study_time_sufficient TEXT CHECK (study_time_sufficient IN ('yes', 'too_much', 'not_enough')),
  study_time_distribution TEXT CHECK (study_time_distribution IN ('yes', 'too_cramped', 'too_early')),
  
  -- Next Steps
  topics_to_review TEXT, -- JSON array
  concepts_needing_relearning TEXT,
  action_plan TEXT,
  target_score_next REAL,
  specific_skills_to_work_on TEXT,
  study_approach_changes TEXT,
  
  -- Tags & Documents
  assessment_tags TEXT, -- JSON array
  document_urls TEXT, -- JSON array: uploaded papers, answer keys, etc.
  
  -- Notes
  overall_notes TEXT,
  instructor_feedback TEXT,
  peer_comparison_notes TEXT,
  personal_reflection TEXT,
  
  -- Additional Fields
  difficulty_rating TEXT CHECK (difficulty_rating IN ('easy', 'medium', 'hard', 'very_hard')),
  topics_covered TEXT,
  time_spent_minutes INTEGER,
  linked_session_id TEXT REFERENCES study_sessions(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- 6. GOALS TABLE (30+ fields per goal)
-- ============================================================================
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  
  -- Basic Information
  goal_name TEXT NOT NULL,
  goal_description TEXT,
  goal_category TEXT CHECK (goal_category IN ('study_hours', 'performance_score', 'streak', 'subject_mastery', 'habit_formation', 'assessment_prep', 'skill_development', 'time_management', 'custom')),
  
  -- Type & Metrics (JSON for flexibility)
  goal_type_data TEXT, -- JSON: specific to goal type
  target_value REAL NOT NULL,
  current_value REAL DEFAULT 0.0,
  unit TEXT, -- hours, percentage, days, count
  
  -- Timeline
  start_date TEXT NOT NULL,
  target_completion_date TEXT NOT NULL,
  duration_days INTEGER,
  
  -- Milestones
  milestones TEXT, -- JSON array: [{name, target, date, completed}]
  
  -- Priority & Motivation
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  importance_reason TEXT,
  motivation_statement TEXT,
  reward_on_completion TEXT,
  consequence_if_missed TEXT,
  
  -- Settings
  track_automatically INTEGER DEFAULT 1,
  send_reminders INTEGER DEFAULT 1,
  reminder_frequency TEXT DEFAULT 'weekly',
  reminder_time TEXT,
  alert_when_behind INTEGER DEFAULT 1,
  celebrate_milestones INTEGER DEFAULT 1,
  visible_on_dashboard INTEGER DEFAULT 1,
  
  -- Related Goals
  parent_goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
  related_goal_ids TEXT, -- JSON array
  dependency_goal_ids TEXT, -- JSON array
  
  -- Progress Tracking
  percentage_complete REAL DEFAULT 0.0,
  progress_status TEXT DEFAULT 'active' CHECK (progress_status IN ('active', 'completed', 'paused', 'failed', 'archived')),
  on_track_status TEXT CHECK (on_track_status IN ('ahead', 'on_track', 'behind', 'at_risk')),
  projected_completion_date TEXT,
  probability_of_success REAL,
  
  -- History
  progress_log TEXT, -- JSON array: [{date, value, percentage, notes}]
  edits_history TEXT, -- JSON array
  
  -- Analytics
  average_daily_progress REAL DEFAULT 0.0,
  best_day_progress REAL DEFAULT 0.0,
  consistency_score REAL DEFAULT 0.0,
  
  -- User Interaction
  acknowledged INTEGER DEFAULT 0,
  acknowledged_date TEXT,
  bookmarked INTEGER DEFAULT 0,
  dismissed INTEGER DEFAULT 0,
  
  -- Metadata
  status TEXT DEFAULT 'active',
  completed_at TEXT,
  paused_at TEXT,
  pause_reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- 7. RESOURCES TABLE (35+ fields per resource)
-- ============================================================================
CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Information
  resource_name TEXT NOT NULL,
  resource_type TEXT CHECK (resource_type IN ('textbook', 'ebook', 'video_course', 'article', 'pdf', 'research_paper', 'lecture_notes', 'practice_problems', 'past_papers', 'study_guide', 'flashcards', 'audio', 'interactive_tutorial', 'website', 'app', 'physical_notes', 'other')),
  
  -- Subject Association
  primary_subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  secondary_subject_ids TEXT, -- JSON array
  topics_covered TEXT, -- JSON array
  chapters_sections TEXT, -- JSON array
  
  -- Resource Details
  author_creator TEXT,
  publisher TEXT,
  edition_version TEXT,
  publication_date TEXT,
  isbn_id TEXT,
  language TEXT DEFAULT 'English',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  recommended_for TEXT, -- JSON array
  
  -- Access Information
  access_type TEXT CHECK (access_type IN ('owned', 'digital', 'online', 'library', 'subscription', 'free_online')),
  location_link TEXT,
  file_path TEXT,
  url TEXT,
  physical_location TEXT,
  library_call_number TEXT,
  access_status TEXT CHECK (access_status IN ('available', 'borrowed', 'need_purchase', 'subscription_expired', 'missing')),
  
  -- Content Information
  total_pages INTEGER,
  total_duration_minutes INTEGER,
  total_chapters INTEGER,
  current_progress_pages INTEGER DEFAULT 0,
  current_progress_percentage REAL DEFAULT 0.0,
  completion_status TEXT DEFAULT 'not_started' CHECK (completion_status IN ('not_started', 'in_progress', 'completed', 'partially_reviewed', 'abandoned')),
  
  -- Usage Tracking
  date_added TEXT DEFAULT (datetime('now')),
  last_accessed TEXT,
  times_accessed INTEGER DEFAULT 0,
  total_time_spent_hours REAL DEFAULT 0.0,
  sessions_using_count INTEGER DEFAULT 0,
  effectiveness_score REAL DEFAULT 0.0,
  
  -- User Assessment
  personal_rating INTEGER CHECK (personal_rating BETWEEN 1 AND 5),
  usefulness_rating TEXT CHECK (usefulness_rating IN ('very_useful', 'useful', 'neutral', 'not_very_useful', 'not_useful')),
  quality_rating TEXT CHECK (quality_rating IN ('excellent', 'good', 'average', 'poor')),
  difficulty_vs_expected TEXT CHECK (difficulty_vs_expected IN ('easier', 'as_expected', 'harder')),
  recommend_to_others TEXT CHECK (recommend_to_others IN ('yes', 'maybe', 'no')),
  
  -- Notes & Review
  personal_notes TEXT,
  key_insights TEXT,
  summary TEXT,
  important_sections TEXT,
  cross_references TEXT, -- JSON array
  pros TEXT, -- JSON array
  cons TEXT, -- JSON array
  best_used_for TEXT,
  supplements_well_with TEXT, -- JSON array (resource IDs)
  
  -- Tags
  resource_tags TEXT, -- JSON array
  
  -- Academic Context
  required_by_course INTEGER DEFAULT 0,
  recommended_by_instructor INTEGER DEFAULT 0,
  official_course_material INTEGER DEFAULT 0,
  instructor_name TEXT,
  course_name_code TEXT,
  syllabus_section TEXT,
  
  -- Sharing
  shared_resource INTEGER DEFAULT 0,
  shared_by TEXT,
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- 8. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Details
  notification_type TEXT NOT NULL CHECK (notification_type IN ('study_reminder', 'break_reminder', 'review_reminder', 'goal_progress', 'goal_deadline', 'streak_alert', 'performance_insight', 'burnout_warning', 'achievement_unlocked', 'milestone_reached', 'assessment_reminder', 'subject_attention', 'recommendation', 'system_update', 'motivational')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  
  -- Status
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed', 'acted_upon')),
  action_required INTEGER DEFAULT 0,
  primary_action_text TEXT,
  primary_action_link TEXT,
  secondary_action_text TEXT,
  secondary_action_link TEXT,
  
  -- Related Data
  related_subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  related_goal_id TEXT REFERENCES goals(id) ON DELETE SET NULL,
  related_session_id TEXT REFERENCES study_sessions(id) ON DELETE SET NULL,
  related_assessment_id TEXT REFERENCES performance_entries(id) ON DELETE SET NULL,
  
  -- User Response
  user_action_taken TEXT,
  dismissed_reason TEXT,
  snoozed_until TEXT,
  
  -- Metadata
  expiry_date TEXT,
  repeat_schedule TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  read_at TEXT,
  acted_upon_at TEXT
);

-- ============================================================================
-- 9. ACHIEVEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Achievement Details
  achievement_key TEXT NOT NULL, -- Unique identifier for achievement type
  achievement_name TEXT NOT NULL,
  achievement_description TEXT NOT NULL,
  achievement_category TEXT CHECK (achievement_category IN ('consistency', 'volume', 'performance', 'focus', 'goals', 'methods', 'subjects', 'special')),
  criteria TEXT NOT NULL,
  
  -- Badge Info
  icon TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  xp_value INTEGER DEFAULT 0,
  
  -- Progress
  unlocked INTEGER DEFAULT 0,
  unlock_date TEXT,
  progress_current INTEGER DEFAULT 0,
  progress_target INTEGER,
  progress_percentage REAL DEFAULT 0.0,
  times_earned INTEGER DEFAULT 0,
  
  -- Display
  display_prominence TEXT DEFAULT 'normal' CHECK (display_prominence IN ('hidden', 'normal', 'featured')),
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  UNIQUE(user_id, achievement_key)
);

-- ============================================================================
-- 10. STREAKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS streaks (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Streak Type
  streak_type TEXT NOT NULL CHECK (streak_type IN ('study', 'subject_specific', 'goal_completion', 'performance')),
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  
  -- Streak Data
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  streak_start_date TEXT,
  last_activity_date TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'broken', 'frozen')),
  freeze_tokens_available INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  broken_at TEXT,
  
  UNIQUE(user_id, streak_type, subject_id)
);

-- ============================================================================
-- 11. CHALLENGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Challenge Details
  challenge_title TEXT NOT NULL,
  challenge_description TEXT NOT NULL,
  challenge_type TEXT CHECK (challenge_type IN ('time_limited', 'weekly', 'monthly', 'personal_best', 'subject', 'method')),
  
  -- Time Period
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  duration_days INTEGER,
  
  -- Goals & Rewards
  challenge_goals TEXT NOT NULL, -- JSON array
  xp_reward INTEGER DEFAULT 0,
  badge_reward TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  
  -- Progress
  progress_current REAL DEFAULT 0.0,
  progress_target REAL NOT NULL,
  progress_percentage REAL DEFAULT 0.0,
  status TEXT DEFAULT 'active' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

-- ============================================================================
-- 12. INSIGHTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS insights (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Insight Details
  insight_type TEXT NOT NULL CHECK (insight_type IN ('time_optimization', 'duration_optimization', 'method_effectiveness', 'performance_pattern', 'learning_style', 'subject_specific', 'behavioral', 'correlation', 'trend', 'anomaly', 'prediction', 'comparative', 'efficiency', 'warning', 'opportunity')),
  insight_title TEXT NOT NULL,
  insight_description TEXT NOT NULL,
  key_finding TEXT NOT NULL,
  
  -- Supporting Evidence
  data_points_used INTEGER,
  time_period_analyzed TEXT,
  subjects_involved TEXT, -- JSON array
  methods_compared TEXT, -- JSON array
  supporting_data TEXT, -- JSON: statistical measures
  
  -- Visualization
  visualization_type TEXT,
  visualization_data TEXT, -- JSON
  
  -- Metrics
  confidence_level REAL CHECK (confidence_level BETWEEN 0 AND 1),
  impact_potential TEXT CHECK (impact_potential IN ('low', 'medium', 'high')),
  expected_benefit TEXT,
  expected_benefit_value REAL,
  priority_score REAL DEFAULT 0.0,
  
  -- Actionability
  is_actionable INTEGER DEFAULT 1,
  recommended_actions TEXT, -- JSON array
  implementation_difficulty TEXT CHECK (implementation_difficulty IN ('easy', 'medium', 'hard')),
  time_to_implement TEXT,
  resources_needed TEXT,
  
  -- Relevance
  currently_relevant INTEGER DEFAULT 1,
  relevance_expiry TEXT,
  affected_subjects TEXT, -- JSON array
  affected_goals TEXT, -- JSON array
  related_insights TEXT, -- JSON array (insight IDs)
  
  -- User Interaction
  acknowledged INTEGER DEFAULT 0,
  acknowledged_date TEXT,
  user_rating TEXT CHECK (user_rating IN ('helpful', 'not_helpful')),
  user_feedback TEXT,
  action_taken INTEGER DEFAULT 0,
  action_results TEXT,
  bookmarked INTEGER DEFAULT 0,
  dismissed INTEGER DEFAULT 0,
  dismiss_reason TEXT,
  
  -- Evolution
  original_insight_id TEXT REFERENCES insights(id) ON DELETE SET NULL,
  version_number INTEGER DEFAULT 1,
  change_log TEXT,
  superseded_by_id TEXT REFERENCES insights(id) ON DELETE SET NULL,
  
  -- Metadata
  discovery_date TEXT DEFAULT (datetime('now')),
  updated_date TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- 13. USER_PREFERENCES TABLE (Additional granular preferences)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Preference Category
  category TEXT NOT NULL,
  subcategory TEXT,
  
  -- Preference Details
  preference_key TEXT NOT NULL,
  preference_value TEXT,
  value_type TEXT CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  
  UNIQUE(user_id, category, preference_key)
);

-- ============================================================================
-- 14. RESOURCE_COLLECTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS resource_collections (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Collection Details
  collection_name TEXT NOT NULL,
  collection_description TEXT,
  collection_purpose TEXT,
  
  -- Contents
  resource_ids TEXT NOT NULL, -- JSON array
  priority_order TEXT, -- JSON array
  
  -- Display
  color_code TEXT,
  icon TEXT,
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- 15. CALENDAR_EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Event Details
  event_type TEXT CHECK (event_type IN ('study_session', 'assessment', 'blocked_time', 'rest_day', 'milestone', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  
  -- Subject Association
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  
  -- Time Details
  start_datetime TEXT NOT NULL,
  end_datetime TEXT,
  duration_minutes INTEGER,
  all_day INTEGER DEFAULT 0,
  
  -- Recurrence
  is_recurring INTEGER DEFAULT 0,
  recurrence_pattern TEXT, -- JSON
  recurrence_end_date TEXT,
  
  -- Study Plan Association
  study_plan_id TEXT,
  is_flexible INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'missed', 'rescheduled', 'cancelled')),
  actual_session_id TEXT REFERENCES study_sessions(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================================
-- 16. STUDY_PLANS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS study_plans (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Plan Details
  plan_name TEXT NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('daily', 'weekly', 'custom_range', 'exam_prep')),
  plan_goal TEXT,
  priority_level TEXT CHECK (priority_level IN ('normal', 'high', 'urgent')),
  
  -- Time Period
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  
  -- Subject Allocation
  subject_allocations TEXT, -- JSON array: [{subjectId, targetHours, topics, sessions, etc}]
  
  -- Progress
  total_planned_hours REAL,
  total_completed_hours REAL DEFAULT 0.0,
  sessions_planned INTEGER,
  sessions_completed INTEGER DEFAULT 0,
  completion_percentage REAL DEFAULT 0.0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'abandoned')),
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

-- ============================================================================
-- 15. ADVANCED ANALYTICS TABLES
-- ============================================================================

-- Recommendations Table - AI-generated personalized recommendations
CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('wellbeing', 'optimization', 'learning_method', 'time_management', 'subject_priority', 'retention')),
  priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  
  -- Recommendation Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  action_items TEXT NOT NULL, -- JSON array of actionable steps
  
  -- Confidence and Evidence
  confidence_score REAL NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  evidence TEXT NOT NULL, -- JSON array of supporting evidence
  tags TEXT NOT NULL, -- JSON array of tags
  
  -- Status and Feedback
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  user_feedback TEXT CHECK (user_feedback IN ('helpful', 'not_helpful', NULL)),
  
  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Learning Profiles Table - VARK learning style analysis
CREATE TABLE IF NOT EXISTS learning_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  
  -- Learning Style Analysis
  dominant_style TEXT NOT NULL CHECK (dominant_style IN ('visual', 'auditory', 'kinesthetic', 'reading_writing')),
  style_scores TEXT NOT NULL, -- JSON: {visual, auditory, kinesthetic, reading_writing}
  
  -- Preferences and Patterns
  preferred_methods TEXT NOT NULL, -- JSON array of effective study methods
  optimal_duration INTEGER, -- In minutes
  best_time_of_day TEXT, -- morning, afternoon, evening, night
  concentration_pattern TEXT, -- peak hours, decline patterns
  
  -- Confidence and Recommendations
  confidence_score REAL NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  recommendations TEXT NOT NULL, -- JSON array of personalized suggestions
  
  -- Metadata
  updated_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Spaced Repetition Items Table - Review scheduling and retention tracking
CREATE TABLE IF NOT EXISTS spaced_repetition_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subject_id TEXT,
  
  -- Topic Information
  topic_name TEXT NOT NULL,
  chapter_reference TEXT,
  
  -- Memory and Scheduling
  initial_study_date TEXT NOT NULL,
  memory_strength REAL NOT NULL CHECK (memory_strength >= 0 AND memory_strength <= 1),
  initial_confidence REAL NOT NULL CHECK (initial_confidence >= 0 AND initial_confidence <= 10),
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  
  -- Review Tracking
  next_review_date TEXT NOT NULL,
  last_reviewed_date TEXT,
  review_count INTEGER DEFAULT 0,
  review_history TEXT DEFAULT '[]', -- JSON array of review events
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'mastered', 'archived')),
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Subjects
CREATE INDEX IF NOT EXISTS idx_subjects_user ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON subjects(user_id, is_active);

-- Study Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON study_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON study_sessions(user_id, started_at);

-- Focus Checkins
CREATE INDEX IF NOT EXISTS idx_focus_session ON focus_checkins(session_id);

-- Performance Entries
CREATE INDEX IF NOT EXISTS idx_performance_user ON performance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_subject ON performance_entries(subject_id);
CREATE INDEX IF NOT EXISTS idx_performance_date ON performance_entries(assessment_date);

-- Goals
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(user_id, progress_status);
CREATE INDEX IF NOT EXISTS idx_goals_subject ON goals(subject_id);

-- Resources
CREATE INDEX IF NOT EXISTS idx_resources_user ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(primary_subject_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Achievements
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked ON achievements(user_id, unlocked);

-- Streaks
CREATE INDEX IF NOT EXISTS idx_streaks_user ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_type ON streaks(user_id, streak_type);

-- Challenges
CREATE INDEX IF NOT EXISTS idx_challenges_user ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(user_id, status);

-- Insights
CREATE INDEX IF NOT EXISTS idx_insights_user ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_relevance ON insights(user_id, currently_relevant);

-- Calendar Events
CREATE INDEX IF NOT EXISTS idx_calendar_user ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar_events(user_id, start_datetime);

-- Study Plans
CREATE INDEX IF NOT EXISTS idx_plans_user ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_status ON study_plans(user_id, status);

-- Advanced Analytics Tables
CREATE INDEX IF NOT EXISTS idx_recommendations_user_status ON recommendations(user_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON recommendations(priority, status);
CREATE INDEX IF NOT EXISTS idx_learning_profiles_user ON learning_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_spaced_rep_user_status ON spaced_repetition_items(user_id, status, next_review_date);
CREATE INDEX IF NOT EXISTS idx_spaced_rep_subject ON spaced_repetition_items(subject_id, status);
CREATE INDEX IF NOT EXISTS idx_spaced_rep_review_date ON spaced_repetition_items(next_review_date, status);
