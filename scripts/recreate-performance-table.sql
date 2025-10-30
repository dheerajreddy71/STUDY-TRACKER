-- Recreate performance_entries table with complete schema

CREATE TABLE performance_entries (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
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

-- Create indexes for performance
CREATE INDEX idx_performance_user ON performance_entries(user_id);
CREATE INDEX idx_performance_subject ON performance_entries(subject_id);
CREATE INDEX idx_performance_date ON performance_entries(assessment_date);
