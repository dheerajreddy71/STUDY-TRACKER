-- ============================================================================
-- FIX SCHEMA - Add Missing Columns to All Tables
-- This script adds all missing fields to match the comprehensive schema
-- ============================================================================

-- Backup existing data
CREATE TABLE IF NOT EXISTS performance_entries_backup AS SELECT * FROM performance_entries;

-- Drop and recreate performance_entries table with all required fields
DROP TABLE IF NOT EXISTS performance_entries;

CREATE TABLE performance_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  
  -- Core Assessment Info
  entry_type TEXT CHECK (entry_type IN ('quiz', 'test', 'exam', 'assignment', 'self_assessment', 'mock_test')),
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
  chapters_covered TEXT,
  topics_tested TEXT,
  total_questions INTEGER,
  questions_correct INTEGER,
  topic_breakdown TEXT,
  
  -- Time Information
  time_allocated_minutes INTEGER,
  time_taken_minutes INTEGER,
  time_pressure_level TEXT CHECK (time_pressure_level IN ('too_rushed', 'bit_rushed', 'just_right', 'too_much_time')),
  
  -- Preparation Information
  total_hours_studied REAL DEFAULT 0.0,
  days_of_preparation INTEGER DEFAULT 0,
  preparation_start_date TEXT,
  study_methods_used TEXT,
  preparation_quality INTEGER CHECK (preparation_quality BETWEEN 1 AND 10),
  
  -- Linked Sessions
  linked_session_ids TEXT,
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
  strengths_topics TEXT,
  strengths_question_types TEXT,
  what_helped_succeed TEXT,
  weaknesses_topics TEXT,
  weaknesses_question_types TEXT,
  common_mistakes TEXT,
  concepts_still_unclear TEXT,
  questions_missed_breakdown TEXT,
  
  -- Learning Insights
  lessons_learned TEXT,
  what_to_do_differently TEXT,
  most_effective_study_approach TEXT,
  least_effective_study_approach TEXT,
  
  -- Next Steps
  topics_to_review TEXT,
  concepts_needing_relearning TEXT,
  action_plan TEXT,
  target_score_next REAL,
  specific_skills_to_work_on TEXT,
  study_approach_changes TEXT,
  
  -- Tags & Notes
  assessment_tags TEXT,
  overall_notes TEXT,
  instructor_feedback TEXT,
  peer_comparison_notes TEXT,
  personal_reflection TEXT,
  
  -- Legacy compatibility fields
  assessment_name TEXT,
  linked_session_id TEXT,
  difficulty_rating TEXT,
  topics_covered TEXT,
  time_spent_minutes INTEGER,
  notes TEXT,
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Restore data from backup
INSERT INTO performance_entries (
  id, user_id, subject_id, entry_type, score, total_possible, percentage,
  assessment_date, notes, created_at, updated_at
)
SELECT 
  id, user_id, subject_id, entry_type, score, total_possible, percentage,
  assessment_date, notes, created_at, updated_at
FROM performance_entries_backup;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_user ON performance_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_subject ON performance_entries(subject_id);
CREATE INDEX IF NOT EXISTS idx_performance_date ON performance_entries(assessment_date);

-- Create table for storing recommendation patterns
CREATE TABLE IF NOT EXISTS recommendation_patterns (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'correlation', 'time_optimal', 'duration_optimal', 'method_effective'
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  
  -- Pattern details
  variable_x TEXT, -- e.g., 'study_time', 'time_of_day'
  variable_y TEXT, -- e.g., 'performance_score'
  correlation_coefficient REAL,
  p_value REAL,
  sample_size INTEGER,
  confidence_level REAL,
  
  -- Pattern metadata
  pattern_strength TEXT CHECK (pattern_strength IN ('weak', 'moderate', 'strong', 'very_strong')),
  pattern_description TEXT,
  recommendation_text TEXT,
  
  -- Time range
  data_start_date TEXT,
  data_end_date TEXT,
  
  -- Status
  is_active INTEGER DEFAULT 1,
  last_validated_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create table for storing learning style profiles
CREATE TABLE IF NOT EXISTS learning_profiles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Learning style classification
  primary_style TEXT, -- 'morning_sprint', 'evening_marathon', 'balanced'
  secondary_style TEXT,
  confidence_score REAL,
  
  -- Temporal preferences
  optimal_time_window TEXT, -- JSON: {start_hour, end_hour}
  chronotype TEXT CHECK (chronotype IN ('morning_lark', 'night_owl', 'afternoon_peak', 'flexible')),
  
  -- Session preferences
  optimal_duration INTEGER,
  break_preference TEXT,
  
  -- Method preferences (JSON arrays)
  preferred_methods TEXT,
  avoided_methods TEXT,
  
  -- Clustering data
  cluster_assignments TEXT, -- JSON: cluster analysis results
  
  -- Metadata
  last_updated TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create table for spaced repetition schedule
CREATE TABLE IF NOT EXISTS spaced_repetition_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  
  -- Topic information
  topic_name TEXT NOT NULL,
  chapter_reference TEXT,
  initial_study_date TEXT NOT NULL,
  
  -- Forgetting curve parameters
  memory_strength REAL DEFAULT 3.0, -- S parameter in days
  initial_confidence INTEGER CHECK (initial_confidence BETWEEN 1 AND 10),
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  
  -- Review schedule
  next_review_date TEXT NOT NULL,
  review_count INTEGER DEFAULT 0,
  last_review_date TEXT,
  last_review_confidence INTEGER CHECK (last_review_confidence BETWEEN 1 AND 10),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'mastered', 'paused')),
  retention_estimate REAL, -- Current estimated retention %
  
  -- History
  review_history TEXT, -- JSON array of review results
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create table for burnout tracking
CREATE TABLE IF NOT EXISTS burnout_assessments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_date TEXT NOT NULL,
  
  -- Burnout indicators (scores 0-25/30/20/15/10 based on weight)
  focus_decline_score REAL DEFAULT 0,
  performance_effort_mismatch_score REAL DEFAULT 0,
  avoidance_behavior_score REAL DEFAULT 0,
  emotional_indicator_score REAL DEFAULT 0,
  extreme_behavior_score REAL DEFAULT 0,
  
  -- Total score and severity
  total_burnout_score REAL DEFAULT 0,
  severity_level TEXT CHECK (severity_level IN ('none', 'mild', 'moderate', 'high', 'critical')),
  
  -- Detailed breakdown
  indicators_detected TEXT, -- JSON array
  recommendations TEXT, -- JSON array
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now'))
);

-- Create table for recommendations history
CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  
  -- Recommendation details
  recommendation_type TEXT NOT NULL, -- 'immediate', 'strategic', 'insight', 'goal', 'intervention'
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT, -- Why this recommendation
  expected_outcome TEXT,
  confidence_level REAL,
  
  -- Source modules
  source_modules TEXT, -- JSON array of contributing modules
  
  -- User interaction
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'dismissed', 'completed')),
  user_feedback TEXT, -- 'helpful', 'not_helpful', null
  user_notes TEXT,
  
  -- Outcome tracking
  followed INTEGER DEFAULT 0,
  followed_at TEXT,
  actual_outcome TEXT,
  outcome_measured INTEGER DEFAULT 0,
  
  -- Validity
  expires_at TEXT,
  is_active INTEGER DEFAULT 1,
  
  -- Metadata
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patterns_user ON recommendation_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_patterns_subject ON recommendation_patterns(subject_id);
CREATE INDEX IF NOT EXISTS idx_spaced_rep_user ON spaced_repetition_items(user_id);
CREATE INDEX IF NOT EXISTS idx_spaced_rep_next_review ON spaced_repetition_items(next_review_date);
CREATE INDEX IF NOT EXISTS idx_burnout_user ON burnout_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_burnout_date ON burnout_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);

-- Clean up backup table
DROP TABLE IF EXISTS performance_entries_backup;
