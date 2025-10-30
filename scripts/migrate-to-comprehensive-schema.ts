import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'study-tracker.db');
const schemaPath = path.join(process.cwd(), 'scripts', 'comprehensive-schema.sql');

interface TableInfo {
  name: string;
  type: string;
  sql: string | null;
}

interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

/**
 * Comprehensive Migration Script
 * 
 * This script safely migrates the existing database to the new comprehensive schema.
 * It preserves all existing data while adding new tables and columns.
 * 
 * Features:
 * - Detects existing tables and columns
 * - Adds new tables if they don't exist
 * - Adds new columns to existing tables without data loss
 * - Creates all necessary indexes
 * - Provides detailed migration log
 */

async function migrateDatabase() {
  console.log('🚀 Starting database migration to comprehensive schema...\n');

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`✅ Created data directory: ${dataDir}\n`);
  }

  // Connect to database
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  console.log(`📂 Connected to database: ${dbPath}\n`);

  try {
    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Read comprehensive schema
    const comprehensiveSchema = fs.readFileSync(schemaPath, 'utf-8');
    console.log('📖 Loaded comprehensive schema file\n');

    // Get existing tables
    const existingTables = db.prepare(`
      SELECT name, type, sql 
      FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as TableInfo[];

    console.log(`📊 Found ${existingTables.length} existing tables:\n`);
    existingTables.forEach(table => {
      console.log(`   - ${table.name}`);
    });
    console.log('');

    // Define expected tables from comprehensive schema
    const expectedTables = [
      'users',
      'subjects',
      'study_sessions',
      'focus_checkins',
      'performance_entries',
      'goals',
      'resources',
      'notifications',
      'achievements',
      'streaks',
      'challenges',
      'insights',
      'user_preferences',
      'resource_collections',
      'calendar_events',
      'study_plans'
    ];

    // Track migration actions
    const migrationLog = {
      tablesCreated: [] as string[],
      columnsAdded: [] as Array<{ table: string; column: string }>,
      indexesCreated: [] as string[],
      errors: [] as string[]
    };

    // Begin transaction
    db.exec('BEGIN TRANSACTION');

    // Parse schema to extract table creation statements
    const tableStatements = parseSchemaForTables(comprehensiveSchema);

    // Step 1: Create missing tables
    console.log('🔨 Step 1: Creating missing tables...\n');
    for (const tableName of expectedTables) {
      const tableExists = existingTables.some(t => t.name === tableName);
      
      if (!tableExists) {
        const createStatement = tableStatements[tableName];
        if (createStatement) {
          try {
            db.exec(createStatement);
            migrationLog.tablesCreated.push(tableName);
            console.log(`   ✅ Created table: ${tableName}`);
          } catch (error: any) {
            console.log(`   ❌ Failed to create table ${tableName}: ${error.message}`);
            migrationLog.errors.push(`Failed to create table ${tableName}: ${error.message}`);
          }
        }
      } else {
        console.log(`   ⏭️  Table already exists: ${tableName}`);
      }
    }
    console.log('');

    // Step 2: Add missing columns to existing tables
    console.log('🔧 Step 2: Adding missing columns to existing tables...\n');
    
    // Define column additions for each table
    const columnAdditions: Record<string, Array<{ column: string; definition: string }>> = {
      users: [
        { column: 'institution', definition: 'TEXT' },
        { column: 'major_program', definition: 'TEXT' },
        { column: 'current_year', definition: 'INTEGER' },
        { column: 'current_semester', definition: 'TEXT' },
        { column: 'timezone', definition: "TEXT DEFAULT 'UTC'" },
        { column: 'country', definition: 'TEXT' },
        { column: 'preferred_study_times', definition: 'TEXT' },
        { column: 'avg_available_hours_per_day', definition: 'REAL DEFAULT 3.0' },
        { column: 'preferred_session_duration', definition: 'INTEGER DEFAULT 45' },
        { column: 'learning_style', definition: 'TEXT' },
        { column: 'study_environment_preference', definition: 'TEXT' },
        { column: 'distraction_level', definition: 'TEXT' },
        { column: 'procrastination_tendency', definition: 'TEXT' },
        { column: 'energy_peak_time', definition: 'TEXT' },
        { column: 'break_preference', definition: 'TEXT' },
        { column: 'focus_music_preference', definition: 'TEXT' },
        { column: 'notifications_enabled', definition: 'INTEGER DEFAULT 1' },
        { column: 'notify_study_reminders', definition: 'INTEGER DEFAULT 1' },
        { column: 'notify_break_reminders', definition: 'INTEGER DEFAULT 1' },
        { column: 'notify_review_reminders', definition: 'INTEGER DEFAULT 1' },
        { column: 'notify_goal_progress', definition: 'INTEGER DEFAULT 1' },
        { column: 'notify_goal_deadlines', definition: 'INTEGER DEFAULT 1' },
        { column: 'notify_streak_alerts', definition: 'INTEGER DEFAULT 1' },
        { column: 'notify_performance_insights', definition: 'INTEGER DEFAULT 1' },
        { column: 'notify_burnout_warnings', definition: 'INTEGER DEFAULT 1' },
        { column: 'notify_achievements', definition: 'INTEGER DEFAULT 1' },
        { column: 'quiet_hours_start', definition: 'TEXT' },
        { column: 'quiet_hours_end', definition: 'TEXT' },
        { column: 'reminder_advance_minutes', definition: 'INTEGER DEFAULT 15' },
        { column: 'theme', definition: "TEXT DEFAULT 'system'" },
        { column: 'primary_color', definition: "TEXT DEFAULT 'blue'" },
        { column: 'dashboard_layout', definition: "TEXT DEFAULT 'default'" },
        { column: 'chart_style', definition: "TEXT DEFAULT 'line'" },
        { column: 'date_format', definition: "TEXT DEFAULT 'MM/DD/YYYY'" },
        { column: 'time_format', definition: "TEXT DEFAULT '12h'" },
        { column: 'first_day_of_week', definition: "TEXT DEFAULT 'Monday'" },
        { column: 'show_motivational_quotes', definition: 'INTEGER DEFAULT 1' },
        { column: 'weekly_study_hours_goal', definition: 'REAL DEFAULT 20.0' },
        { column: 'daily_session_goal', definition: 'INTEGER DEFAULT 2' },
        { column: 'min_session_duration', definition: 'INTEGER DEFAULT 15' },
        { column: 'target_performance_score', definition: 'REAL DEFAULT 80.0' },
        { column: 'data_sharing', definition: 'INTEGER DEFAULT 0' },
        { column: 'analytics_tracking', definition: 'INTEGER DEFAULT 1' },
        { column: 'gamification_enabled', definition: 'INTEGER DEFAULT 1' },
        { column: 'xp_points', definition: 'INTEGER DEFAULT 0' },
        { column: 'current_level', definition: 'INTEGER DEFAULT 1' },
        { column: 'current_streak_days', definition: 'INTEGER DEFAULT 0' },
        { column: 'longest_streak_days', definition: 'INTEGER DEFAULT 0' }
      ],
      subjects: [
        { column: 'subject_code', definition: 'TEXT' },
        { column: 'category', definition: 'TEXT' },
        { column: 'color_code', definition: 'TEXT' },
        { column: 'icon', definition: 'TEXT' },
        { column: 'difficulty_level', definition: 'TEXT' },
        { column: 'difficulty_reason', definition: 'TEXT' },
        { column: 'priority_level', definition: 'TEXT' },
        { column: 'priority_reason', definition: 'TEXT' },
        { column: 'current_performance_score', definition: 'REAL DEFAULT 0.0' },
        { column: 'target_performance_score', definition: 'REAL DEFAULT 80.0' },
        { column: 'baseline_performance_score', definition: 'REAL DEFAULT 0.0' },
        { column: 'weekly_target_hours', definition: 'REAL DEFAULT 0.0' },
        { column: 'preferred_session_duration', definition: 'INTEGER DEFAULT 45' },
        { column: 'preferred_study_method', definition: 'TEXT' },
        { column: 'next_exam_date', definition: 'TEXT' },
        { column: 'next_exam_type', definition: 'TEXT' },
        { column: 'exam_weight_percentage', definition: 'REAL' },
        { column: 'exam_prep_status', definition: 'TEXT' },
        { column: 'total_chapters', definition: 'INTEGER' },
        { column: 'completed_chapters', definition: 'INTEGER' },
        { column: 'total_topics', definition: 'INTEGER' },
        { column: 'mastered_topics', definition: 'INTEGER' },
        { column: 'current_chapter', definition: 'TEXT' },
        { column: 'current_topic', definition: 'TEXT' },
        { column: 'chapter_list', definition: 'TEXT' },
        { column: 'main_textbook', definition: 'TEXT' },
        { column: 'online_resources', definition: 'TEXT' },
        { column: 'additional_materials', definition: 'TEXT' },
        { column: 'instructor_name', definition: 'TEXT' },
        { column: 'class_schedule', definition: 'TEXT' },
        { column: 'office_hours', definition: 'TEXT' },
        { column: 'study_strategy', definition: 'TEXT' },
        { column: 'personal_notes', definition: 'TEXT' },
        { column: 'total_study_hours', definition: 'REAL DEFAULT 0.0' },
        { column: 'total_sessions', definition: 'INTEGER DEFAULT 0' },
        { column: 'average_session_duration', definition: 'REAL DEFAULT 0.0' },
        { column: 'average_focus_score', definition: 'REAL DEFAULT 0.0' },
        { column: 'performance_trend', definition: 'TEXT' },
        { column: 'last_studied', definition: 'TEXT' },
        { column: 'study_streak_days', definition: 'INTEGER DEFAULT 0' },
        { column: 'subject_health_score', definition: 'REAL DEFAULT 0.0' },
        { column: 'preparation_status', definition: 'TEXT' },
        { column: 'retention_risk_level', definition: 'TEXT' },
        { column: 'burnout_risk_level', definition: 'TEXT' }
      ],
      study_sessions: [
        { column: 'session_type', definition: 'TEXT' },
        { column: 'session_purpose', definition: 'TEXT' },
        { column: 'content_planned', definition: 'TEXT' },
        { column: 'chapters_topics', definition: 'TEXT' },
        { column: 'use_pomodoro', definition: 'INTEGER DEFAULT 0' },
        { column: 'pomodoro_duration', definition: 'INTEGER' },
        { column: 'pomodoro_break_duration', definition: 'INTEGER' },
        { column: 'background_music', definition: 'INTEGER DEFAULT 0' },
        { column: 'music_type', definition: 'TEXT' },
        { column: 'do_not_disturb', definition: 'INTEGER DEFAULT 0' },
        { column: 'pre_session_energy_level', definition: 'INTEGER' },
        { column: 'pre_session_motivation_level', definition: 'INTEGER' },
        { column: 'pre_session_sleep_quality', definition: 'INTEGER' },
        { column: 'pre_session_meals_today', definition: 'TEXT' },
        { column: 'pre_session_mood', definition: 'TEXT' },
        { column: 'pre_session_distractions_expected', definition: 'TEXT' },
        { column: 'breaks_taken', definition: 'INTEGER DEFAULT 0' },
        { column: 'total_break_minutes', definition: 'INTEGER DEFAULT 0' },
        { column: 'break_log', definition: 'TEXT' },
        { column: 'actual_ended_at', definition: 'TEXT' },
        { column: 'interruptions_count', definition: 'INTEGER DEFAULT 0' },
        { column: 'focus_log', definition: 'TEXT' },
        { column: 'timestamped_notes', definition: 'TEXT' },
        { column: 'distraction_log', definition: 'TEXT' },
        { column: 'content_covered', definition: 'TEXT' },
        { column: 'pages_read', definition: 'INTEGER' },
        { column: 'problems_solved', definition: 'INTEGER' },
        { column: 'concepts_learned', definition: 'TEXT' },
        { column: 'progress_percentage', definition: 'REAL' },
        { column: 'confidence_rating', definition: 'INTEGER' },
        { column: 'energy_level_after', definition: 'INTEGER' },
        { column: 'productivity_rating', definition: 'INTEGER' },
        { column: 'difficulty_rating', definition: 'INTEGER' },
        { column: 'learning_quality_rating', definition: 'INTEGER' },
        { column: 'satisfaction_rating', definition: 'INTEGER' },
        { column: 'goals_progress_rating', definition: 'TEXT' },
        { column: 'tasks_completed', definition: 'TEXT' },
        { column: 'tasks_pending', definition: 'TEXT' },
        { column: 'distraction_types', definition: 'TEXT' },
        { column: 'distraction_total_minutes', definition: 'INTEGER' },
        { column: 'distraction_impact_rating', definition: 'INTEGER' },
        { column: 'focused_time_percentage', definition: 'REAL' },
        { column: 'flow_state_achieved', definition: 'INTEGER DEFAULT 0' },
        { column: 'retention_confidence', definition: 'INTEGER' },
        { column: 'review_needed', definition: 'INTEGER DEFAULT 0' },
        { column: 'post_session_notes', definition: 'TEXT' },
        { column: 'challenges_faced', definition: 'TEXT' },
        { column: 'what_went_well', definition: 'TEXT' },
        { column: 'what_to_improve', definition: 'TEXT' },
        { column: 'method_effectiveness_rating', definition: 'INTEGER' },
        { column: 'method_notes', definition: 'TEXT' },
        { column: 'would_use_method_again', definition: 'INTEGER' },
        { column: 'session_tags', definition: 'TEXT' }
      ],
      performance_entries: [
        { column: 'assessment_title', definition: 'TEXT NOT NULL' },
        { column: 'assessment_type', definition: 'TEXT' },
        { column: 'assessment_id_number', definition: 'TEXT' },
        { column: 'assessment_date', definition: 'TEXT' },
        { column: 'submission_date', definition: 'TEXT' },
        { column: 'received_date', definition: 'TEXT' },
        { column: 'score_raw', definition: 'REAL' },
        { column: 'score_max_points', definition: 'REAL' },
        { column: 'score_percentage', definition: 'REAL' },
        { column: 'grade_letter', definition: 'TEXT' },
        { column: 'grade_points', definition: 'REAL' },
        { column: 'class_average_score', definition: 'REAL' },
        { column: 'class_highest_score', definition: 'REAL' },
        { column: 'class_lowest_score', definition: 'REAL' },
        { column: 'class_rank', definition: 'INTEGER' },
        { column: 'class_percentile', definition: 'REAL' },
        { column: 'class_total_students', definition: 'INTEGER' },
        { column: 'weight_in_course', definition: 'REAL' },
        { column: 'importance_level', definition: 'TEXT' },
        { column: 'chapters_covered', definition: 'TEXT' },
        { column: 'topics_covered', definition: 'TEXT' },
        { column: 'detailed_topic_breakdown', definition: 'TEXT' },
        { column: 'time_allowed_minutes', definition: 'INTEGER' },
        { column: 'time_taken_minutes', definition: 'INTEGER' },
        { column: 'time_pressure_felt', definition: 'INTEGER' },
        { column: 'preparation_hours', definition: 'REAL' },
        { column: 'preparation_days', definition: 'INTEGER' },
        { column: 'study_methods_used', definition: 'TEXT' },
        { column: 'preparation_quality_rating', definition: 'INTEGER' },
        { column: 'linked_session_ids', definition: 'TEXT' },
        { column: 'pre_confidence_level', definition: 'INTEGER' },
        { column: 'pre_preparation_feeling', definition: 'INTEGER' },
        { column: 'pre_difficulty_expectation', definition: 'INTEGER' },
        { column: 'pre_score_expectation', definition: 'REAL' },
        { column: 'sleep_quality_before', definition: 'INTEGER' },
        { column: 'stress_level_before', definition: 'INTEGER' },
        { column: 'health_status', definition: 'TEXT' },
        { column: 'other_commitments_impact', definition: 'TEXT' },
        { column: 'external_circumstances', definition: 'TEXT' },
        { column: 'vs_expectation', definition: 'TEXT' },
        { column: 'surprise_level', definition: 'INTEGER' },
        { column: 'confidence_after', definition: 'INTEGER' },
        { column: 'disappointment_level', definition: 'INTEGER' },
        { column: 'satisfaction_level', definition: 'INTEGER' },
        { column: 'strengths_by_topic', definition: 'TEXT' },
        { column: 'weaknesses_by_topic', definition: 'TEXT' },
        { column: 'strengths_by_question_type', definition: 'TEXT' },
        { column: 'weaknesses_by_question_type', definition: 'TEXT' },
        { column: 'careless_mistakes_count', definition: 'INTEGER' },
        { column: 'conceptual_errors_count', definition: 'INTEGER' },
        { column: 'time_management_issues', definition: 'INTEGER' },
        { column: 'detailed_missed_questions', definition: 'TEXT' },
        { column: 'why_questions_missed', definition: 'TEXT' },
        { column: 'correct_approach', definition: 'TEXT' },
        { column: 'key_learnings', definition: 'TEXT' },
        { column: 'misconceptions_identified', definition: 'TEXT' },
        { column: 'areas_needing_review', definition: 'TEXT' },
        { column: 'study_methods_effectiveness', definition: 'TEXT' },
        { column: 'what_helped_most', definition: 'TEXT' },
        { column: 'what_helped_least', definition: 'TEXT' },
        { column: 'would_change_preparation', definition: 'TEXT' },
        { column: 'immediate_action_items', definition: 'TEXT' },
        { column: 'topics_to_review', definition: 'TEXT' },
        { column: 'resources_to_use', definition: 'TEXT' },
        { column: 'estimated_review_hours', definition: 'REAL' }
      ]
    };

    for (const [tableName, columns] of Object.entries(columnAdditions)) {
      const tableExists = existingTables.some(t => t.name === tableName);
      
      if (tableExists) {
        // Get existing columns
        const existingColumns = db.prepare(`PRAGMA table_info(${tableName})`).all() as ColumnInfo[];
        const existingColumnNames = existingColumns.map(c => c.name);

        console.log(`   📋 Checking table: ${tableName} (${existingColumns.length} existing columns)`);

        for (const { column, definition } of columns) {
          if (!existingColumnNames.includes(column)) {
            try {
              db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${column} ${definition}`);
              migrationLog.columnsAdded.push({ table: tableName, column });
              console.log(`      ✅ Added column: ${column}`);
            } catch (error: any) {
              console.log(`      ❌ Failed to add column ${column}: ${error.message}`);
              migrationLog.errors.push(`Failed to add column ${tableName}.${column}: ${error.message}`);
            }
          }
        }
      }
    }
    console.log('');

    // Step 3: Create indexes
    console.log('📑 Step 3: Creating indexes...\n');
    const indexStatements = parseSchemaForIndexes(comprehensiveSchema);
    
    for (const indexStatement of indexStatements) {
      try {
        db.exec(indexStatement);
        const indexName = extractIndexName(indexStatement);
        if (indexName) {
          migrationLog.indexesCreated.push(indexName);
          console.log(`   ✅ Created index: ${indexName}`);
        }
      } catch (error: any) {
        // Index might already exist, that's OK
        if (!error.message.includes('already exists')) {
          console.log(`   ⚠️  Index creation warning: ${error.message}`);
        }
      }
    }
    console.log('');

    // Commit transaction
    db.exec('COMMIT');

    // Print summary
    console.log('=' .repeat(60));
    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY\n');
    console.log(`📊 Summary:`);
    console.log(`   - Tables created: ${migrationLog.tablesCreated.length}`);
    console.log(`   - Columns added: ${migrationLog.columnsAdded.length}`);
    console.log(`   - Indexes created: ${migrationLog.indexesCreated.length}`);
    console.log(`   - Errors: ${migrationLog.errors.length}`);
    console.log('');

    if (migrationLog.tablesCreated.length > 0) {
      console.log('📝 New tables:');
      migrationLog.tablesCreated.forEach(t => console.log(`   - ${t}`));
      console.log('');
    }

    if (migrationLog.columnsAdded.length > 0) {
      console.log(`📝 New columns added (${migrationLog.columnsAdded.length} total):`);
      const groupedByTable = migrationLog.columnsAdded.reduce((acc, item) => {
        if (!acc[item.table]) acc[item.table] = [];
        acc[item.table].push(item.column);
        return acc;
      }, {} as Record<string, string[]>);
      
      Object.entries(groupedByTable).forEach(([table, cols]) => {
        console.log(`   ${table}: ${cols.length} columns`);
      });
      console.log('');
    }

    if (migrationLog.errors.length > 0) {
      console.log('❌ Errors encountered:');
      migrationLog.errors.forEach(e => console.log(`   - ${e}`));
      console.log('');
    }

    console.log('✅ Database is now using the comprehensive schema!');
    console.log('=' .repeat(60));

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('Rolling back transaction...');
    try {
      db.exec('ROLLBACK');
      console.log('✅ Rollback successful. Database unchanged.');
    } catch (rollbackError) {
      console.error('❌ Rollback failed. Database may be in inconsistent state.');
    }
    throw error;
  } finally {
    db.close();
  }
}

function parseSchemaForTables(schema: string): Record<string, string> {
  const tables: Record<string, string> = {};
  
  // Match CREATE TABLE statements
  const tableRegex = /CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\);/g;
  let match;
  
  while ((match = tableRegex.exec(schema)) !== null) {
    const tableName = match[1];
    const fullStatement = match[0];
    tables[tableName] = fullStatement;
  }
  
  return tables;
}

function parseSchemaForIndexes(schema: string): string[] {
  const indexes: string[] = [];
  
  // Match CREATE INDEX statements
  const indexRegex = /CREATE INDEX IF NOT EXISTS [\s\S]*?;/g;
  let match;
  
  while ((match = indexRegex.exec(schema)) !== null) {
    indexes.push(match[0]);
  }
  
  return indexes;
}

function extractIndexName(indexStatement: string): string | null {
  const match = indexStatement.match(/CREATE INDEX IF NOT EXISTS (\w+)/);
  return match ? match[1] : null;
}

// Run migration
migrateDatabase().catch(error => {
  console.error('Migration script error:', error);
  process.exit(1);
});
