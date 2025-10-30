const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'study-tracker.db');
const db = new Database(dbPath);

const userId = 'test-user-1';

console.log('\n🔍 Testing analyzeSubjectInsights query...\n');

const subjects = db.prepare(`
  SELECT 
    s.id,
    s.name,
    s.color_theme,
    s.difficulty_level,
    s.priority_level,
    COUNT(DISTINCT ss.id) as session_count,
    SUM(ss.duration_minutes) as total_minutes,
    AVG(ss.average_focus_score) as avg_focus,
    MIN(ss.average_focus_score) as min_focus,
    MAX(ss.average_focus_score) as max_focus,
    AVG(ss.productivity_rating) as avg_productivity,
    COUNT(DISTINCT pe.id) as performance_count,
    AVG(pe.percentage) as avg_performance,
    MAX(pe.percentage) as best_performance,
    MIN(pe.percentage) as worst_performance,
    GROUP_CONCAT(DISTINCT pe.weaknesses_topics) as all_weaknesses,
    GROUP_CONCAT(DISTINCT pe.what_to_do_differently) as improvement_plans,
    MAX(ss.created_at) as last_session_date,
    MAX(pe.assessment_date) as last_assessment_date
  FROM subjects s
  LEFT JOIN study_sessions ss ON s.id = ss.subject_id AND ss.user_id = ?
  LEFT JOIN performance_entries pe ON s.id = pe.subject_id AND pe.user_id = ?
  WHERE s.user_id = ? AND s.is_active = 1
  GROUP BY s.id
  ORDER BY session_count DESC
`).all(userId, userId, userId);

console.log('Total subjects found:', subjects.length);
console.log('\n📊 Subject Details:\n');

subjects.forEach((subject, index) => {
  console.log(`${index + 1}. ${subject.name}`);
  console.log(`   - Sessions: ${subject.session_count}`);
  console.log(`   - Avg Focus: ${subject.avg_focus}`);
  console.log(`   - Avg Performance: ${subject.avg_performance}`);
  console.log(`   - Performance Count: ${subject.performance_count}`);
  console.log('');
});

console.log('\n🎯 Checking recommendation conditions:\n');

// Check neglected subjects (0 sessions)
const neglected = subjects.filter(s => s.session_count === 0);
console.log(`Neglected subjects (0 sessions): ${neglected.length}`);
neglected.forEach(s => console.log(`  - ${s.name}`));

// Check low activity (1-3 sessions)
const lowActivity = subjects.filter(s => s.session_count > 0 && s.session_count <= 3);
console.log(`\nLow activity subjects (1-3 sessions): ${lowActivity.length}`);
lowActivity.forEach(s => console.log(`  - ${s.name}: ${s.session_count} sessions`));

// Check low focus (<7, >=2 sessions)
const lowFocus = subjects.filter(s => s.session_count >= 2 && s.avg_focus && s.avg_focus < 7);
console.log(`\nLow focus subjects (<7 focus, >=2 sessions): ${lowFocus.length}`);
lowFocus.forEach(s => console.log(`  - ${s.name}: ${s.avg_focus} focus`));

// Check poor performance (<75%, has assessments)
const poorPerf = subjects.filter(s => s.performance_count > 0 && s.avg_performance && s.avg_performance < 75);
console.log(`\nPoor performance subjects (<75%, has assessments): ${poorPerf.length}`);
poorPerf.forEach(s => console.log(`  - ${s.name}: ${s.avg_performance}%`));

// Check high performers (>=85% perf, >=7 focus, >=3 sessions)
const highPerf = subjects.filter(s => 
  s.session_count >= 3 && 
  s.performance_count > 0 && 
  s.avg_performance >= 85 && 
  s.avg_focus >= 7
);
console.log(`\nHigh performer subjects (>=85% perf, >=7 focus, >=3 sessions): ${highPerf.length}`);
highPerf.forEach(s => console.log(`  - ${s.name}: ${s.avg_performance}% perf, ${s.avg_focus} focus`));

console.log('\n✅ Test complete!\n');

db.close();
