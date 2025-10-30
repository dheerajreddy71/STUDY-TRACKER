-- ============================================================================
-- STUDY TRACKER - POSTGRESQL INITIALIZATION SCRIPT
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\echo '✓ Extensions enabled'

-- Execute the comprehensive schema
\i comprehensive-schema-postgresql.sql

\echo '✓ Schema created'

-- ============================================================================
-- CREATE DEFAULT DEMO USER
-- ============================================================================

INSERT INTO users (
  id,
  full_name,
  email,
  academic_level,
  current_year_semester,
  institution_name,
  preferred_study_times,
  learning_style,
  weekly_study_hour_target,
  theme,
  is_guest
) VALUES (
  gen_random_uuid(),
  'Demo User',
  'demo@studytracker.local',
  'undergraduate',
  'Year 3, Semester 1',
  'Demo University',
  '["morning", "evening"]'::jsonb,
  'multimodal',
  20.0,
  'auto',
  true
) ON CONFLICT (email) DO NOTHING;

\echo '✓ Demo user created'

-- ============================================================================
-- CREATE SAMPLE SUBJECTS
-- ============================================================================

WITH demo_user AS (
  SELECT id FROM users WHERE email = 'demo@studytracker.local' LIMIT 1
)
INSERT INTO subjects (
  user_id,
  name,
  subject_code,
  category,
  color_theme,
  difficulty_level,
  priority_level,
  weekly_target_hours,
  is_active
)
SELECT
  demo_user.id,
  name,
  code,
  category,
  color,
  difficulty,
  priority,
  hours,
  true
FROM demo_user, (VALUES
  ('Mathematics', 'MATH301', 'mathematics', '#3B82F6', 'hard', 'high', 6.0),
  ('Physics', 'PHYS201', 'science', '#10B981', 'very_hard', 'high', 5.0),
  ('Computer Science', 'CS202', 'technical', '#8B5CF6', 'medium', 'high', 7.0),
  ('English Literature', 'ENG101', 'language', '#F59E0B', 'easy', 'medium', 3.0),
  ('History', 'HIST150', 'social_studies', '#EF4444', 'medium', 'medium', 4.0)
) AS subjects(name, code, category, color, difficulty, priority, hours);

\echo '✓ Sample subjects created'

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

\echo ''
\echo '========================================='
\echo 'Database Initialization Complete'
\echo '========================================='
\echo ''

-- Count tables
SELECT 
  'Tables created: ' || COUNT(*)::text AS info
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';

-- Count indexes
SELECT 
  'Indexes created: ' || COUNT(*)::text AS info
FROM pg_indexes 
WHERE schemaname = 'public';

-- Count triggers
SELECT 
  'Triggers created: ' || COUNT(*)::text AS info
FROM pg_trigger 
WHERE tgisinternal = false;

-- Show user count
SELECT 
  'Users: ' || COUNT(*)::text AS info
FROM users;

-- Show subject count
SELECT 
  'Subjects: ' || COUNT(*)::text AS info
FROM subjects;

\echo ''
\echo '========================================='
\echo 'Ready to use!'
\echo '========================================='
