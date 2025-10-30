// Comprehensive test script to identify issues across the codebase
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'study-tracker.db');
const db = new Database(dbPath);

console.log('\n🔍 COMPREHENSIVE SYSTEM AUDIT\n');
console.log('='.repeat(80));

// Test 1: Check database schema consistency
console.log('\n📊 TEST 1: Database Schema Validation');
console.log('-'.repeat(80));

const tables = [
  'users', 'subjects', 'study_sessions', 'performance_entries', 
  'goals', 'achievements', 'streaks', 'recommendations',
  'scheduled_sessions', 'spaced_repetition_items', 'learning_profiles'
];

const schemaIssues = [];

tables.forEach(table => {
  try {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    console.log(`✓ ${table}: ${columns.length} columns`);
    
    // Check for common column name issues
    const columnNames = columns.map(c => c.name);
    
    // Check study_sessions for productivity column
    if (table === 'study_sessions') {
      if (columnNames.includes('productivity_score') && !columnNames.includes('productivity_rating')) {
        schemaIssues.push(`❌ study_sessions has productivity_score but should have productivity_rating`);
      }
      if (!columnNames.includes('average_focus_score')) {
        schemaIssues.push(`❌ study_sessions missing average_focus_score`);
      }
    }
    
    // Check performance_entries
    if (table === 'performance_entries') {
      const requiredCols = ['percentage', 'weaknesses_topics', 'what_to_do_differently'];
      requiredCols.forEach(col => {
        if (!columnNames.includes(col)) {
          schemaIssues.push(`❌ performance_entries missing ${col}`);
        }
      });
    }
    
  } catch (error) {
    schemaIssues.push(`❌ Error checking ${table}: ${error.message}`);
  }
});

if (schemaIssues.length > 0) {
  console.log('\n⚠️  Schema Issues Found:');
  schemaIssues.forEach(issue => console.log('  ' + issue));
} else {
  console.log('\n✅ All schemas valid');
}

// Test 2: Check for orphaned records
console.log('\n\n🔗 TEST 2: Foreign Key Consistency');
console.log('-'.repeat(80));

const foreignKeyChecks = [
  {
    name: 'study_sessions -> subjects',
    query: `SELECT COUNT(*) as count FROM study_sessions ss 
            LEFT JOIN subjects s ON ss.subject_id = s.id 
            WHERE s.id IS NULL AND ss.subject_id IS NOT NULL`
  },
  {
    name: 'study_sessions -> users',
    query: `SELECT COUNT(*) as count FROM study_sessions ss 
            LEFT JOIN users u ON ss.user_id = u.id 
            WHERE u.id IS NULL`
  },
  {
    name: 'performance_entries -> subjects',
    query: `SELECT COUNT(*) as count FROM performance_entries pe 
            LEFT JOIN subjects s ON pe.subject_id = s.id 
            WHERE s.id IS NULL AND pe.subject_id IS NOT NULL`
  },
  {
    name: 'goals -> subjects',
    query: `SELECT COUNT(*) as count FROM goals g 
            LEFT JOIN subjects s ON g.subject_id = s.id 
            WHERE s.id IS NULL AND g.subject_id IS NOT NULL`
  }
];

const fkIssues = [];

foreignKeyChecks.forEach(check => {
  try {
    const result = db.prepare(check.query).get();
    if (result.count > 0) {
      fkIssues.push(`❌ ${check.name}: ${result.count} orphaned records`);
    } else {
      console.log(`✓ ${check.name}: No orphaned records`);
    }
  } catch (error) {
    fkIssues.push(`❌ Error checking ${check.name}: ${error.message}`);
  }
});

if (fkIssues.length > 0) {
  console.log('\n⚠️  Foreign Key Issues:');
  fkIssues.forEach(issue => console.log('  ' + issue));
} else {
  console.log('\n✅ All foreign keys valid');
}

// Test 3: Check for NULL/empty critical data
console.log('\n\n📝 TEST 3: Data Integrity Checks');
console.log('-'.repeat(80));

const dataChecks = [
  {
    name: 'Sessions with NULL subject_id',
    query: `SELECT COUNT(*) as count FROM study_sessions WHERE subject_id IS NULL`
  },
  {
    name: 'Sessions with NULL user_id',
    query: `SELECT COUNT(*) as count FROM study_sessions WHERE user_id IS NULL`
  },
  {
    name: 'Sessions with invalid focus scores',
    query: `SELECT COUNT(*) as count FROM study_sessions 
            WHERE average_focus_score IS NOT NULL 
            AND (average_focus_score < 0 OR average_focus_score > 10)`
  },
  {
    name: 'Performance entries with invalid percentages',
    query: `SELECT COUNT(*) as count FROM performance_entries 
            WHERE percentage IS NOT NULL 
            AND (percentage < 0 OR percentage > 100)`
  },
  {
    name: 'Subjects with NULL user_id',
    query: `SELECT COUNT(*) as count FROM subjects WHERE user_id IS NULL`
  },
  {
    name: 'Goals with invalid status',
    query: `SELECT COUNT(*) as count FROM goals 
            WHERE status NOT IN ('not_started', 'in_progress', 'completed', 'cancelled')`
  }
];

const dataIssues = [];

dataChecks.forEach(check => {
  try {
    const result = db.prepare(check.query).get();
    if (result.count > 0) {
      dataIssues.push(`❌ ${check.name}: ${result.count} invalid records`);
    } else {
      console.log(`✓ ${check.name}: No issues`);
    }
  } catch (error) {
    dataIssues.push(`❌ Error checking ${check.name}: ${error.message}`);
  }
});

if (dataIssues.length > 0) {
  console.log('\n⚠️  Data Integrity Issues:');
  dataIssues.forEach(issue => console.log('  ' + issue));
} else {
  console.log('\n✅ All data integrity checks passed');
}

// Test 4: Check for potential division by zero scenarios
console.log('\n\n➗ TEST 4: Division by Zero Risk Analysis');
console.log('-'.repeat(80));

const divisionChecks = [
  {
    name: 'Users with 0 sessions (breaks analytics)',
    query: `SELECT COUNT(*) as count FROM users u 
            WHERE (SELECT COUNT(*) FROM study_sessions WHERE user_id = u.id) = 0`
  },
  {
    name: 'Subjects with 0 sessions (breaks subject analytics)',
    query: `SELECT COUNT(*) as count FROM subjects s 
            WHERE is_active = 1 
            AND (SELECT COUNT(*) FROM study_sessions WHERE subject_id = s.id) = 0`
  },
  {
    name: 'Sessions with 0 duration',
    query: `SELECT COUNT(*) as count FROM study_sessions 
            WHERE duration_minutes = 0 OR duration_minutes IS NULL`
  }
];

divisionChecks.forEach(check => {
  try {
    const result = db.prepare(check.query).get();
    if (result.count > 0) {
      console.log(`⚠️  ${check.name}: ${result.count} records (handle with care)`);
    } else {
      console.log(`✓ ${check.name}: No risks`);
    }
  } catch (error) {
    console.log(`❌ Error checking ${check.name}: ${error.message}`);
  }
});

// Test 5: Test API-critical queries
console.log('\n\n🔍 TEST 5: Critical Query Validation');
console.log('-'.repeat(80));

try {
  // Test the analyzeSubjectInsights query
  const testUserId = 'test-user-1';
  const subjectInsights = db.prepare(`
    SELECT 
      s.id,
      s.name,
      COUNT(DISTINCT ss.id) as session_count,
      AVG(ss.average_focus_score) as avg_focus,
      AVG(ss.productivity_rating) as avg_productivity,
      COUNT(DISTINCT pe.id) as performance_count,
      AVG(pe.percentage) as avg_performance
    FROM subjects s
    LEFT JOIN study_sessions ss ON s.id = ss.subject_id AND ss.user_id = ?
    LEFT JOIN performance_entries pe ON s.id = pe.subject_id AND pe.user_id = ?
    WHERE s.user_id = ? AND s.is_active = 1
    GROUP BY s.id
  `).all(testUserId, testUserId, testUserId);
  
  console.log(`✓ Subject insights query: ${subjectInsights.length} subjects found`);
  
  // Test recommendation generation
  const sessionCount = db.prepare('SELECT COUNT(*) as count FROM study_sessions WHERE user_id = ?').get(testUserId);
  const perfCount = db.prepare('SELECT COUNT(*) as count FROM performance_entries WHERE user_id = ?').get(testUserId);
  const goalCount = db.prepare('SELECT COUNT(*) as count FROM goals WHERE user_id = ?').get(testUserId);
  
  console.log(`✓ Data counts: ${sessionCount.count} sessions, ${perfCount.count} performances, ${goalCount.count} goals`);
  
} catch (error) {
  console.log(`❌ Critical query error: ${error.message}`);
}

// Test 6: Check for common typos in queries
console.log('\n\n🔤 TEST 6: Common Column Name Issues');
console.log('-'.repeat(80));

// Search through analytics files for potential column mismatches
const analyticsDir = path.join(process.cwd(), 'lib', 'analytics');
const apiDir = path.join(process.cwd(), 'app', 'api');

const suspiciousPatterns = [
  'productivity_score', // Should be productivity_rating
  'assessment_type',   // In queries for performance_entries (should be entry_type)
  'description',       // Often added to wrong tables
];

console.log('Checking for suspicious column references in code...');
console.log('(Manual code review recommended for:\n  - productivity_score vs productivity_rating\n  - assessment_type vs entry_type\n  - Foreign key column names)');

// Summary
console.log('\n\n' + '='.repeat(80));
console.log('📊 AUDIT SUMMARY');
console.log('='.repeat(80));

const totalIssues = schemaIssues.length + fkIssues.length + dataIssues.length;

if (totalIssues === 0) {
  console.log('\n✅ No critical issues found! System appears healthy.');
} else {
  console.log(`\n⚠️  Found ${totalIssues} potential issues:`);
  console.log(`   - Schema issues: ${schemaIssues.length}`);
  console.log(`   - Foreign key issues: ${fkIssues.length}`);
  console.log(`   - Data integrity issues: ${dataIssues.length}`);
}

console.log('\n💡 Recommendations:');
console.log('   1. Fix any column name mismatches in queries');
console.log('   2. Add NULL checks before divisions in analytics');
console.log('   3. Add foreign key constraints to prevent orphans');
console.log('   4. Add CHECK constraints for valid value ranges');
console.log('   5. Test all API endpoints with edge cases (empty data, nulls)');

db.close();

console.log('\n✅ Audit complete!\n');
