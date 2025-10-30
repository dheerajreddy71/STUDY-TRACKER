const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'study-tracker.db');
const db = new Database(dbPath);

console.log('🚀 Inserting comprehensive test data...\n');

// Use existing user ID or create new one
const userId = 'test-user-1';

// Ensure user exists
console.log('Ensuring user exists...');
const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
if (!userExists) {
  db.prepare(`
    INSERT INTO users (id, email, name, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `).run(userId, 'test@example.com', 'Test User');
  console.log('✅ User created\n');
} else {
  console.log('✅ User exists\n');
}

// Clear existing test data for clean slate
console.log('Cleaning existing test data...');
db.prepare('DELETE FROM performance_entries WHERE user_id = ?').run(userId);
db.prepare('DELETE FROM study_sessions WHERE user_id = ?').run(userId);
db.prepare('DELETE FROM goals WHERE user_id = ?').run(userId);
db.prepare('DELETE FROM subjects WHERE user_id = ?').run(userId);

console.log('✅ Cleaned\n');

// Insert comprehensive subjects
console.log('Inserting subjects...');
const subjects = [
  {
    id: 'subj-math-001',
    name: 'Advanced Mathematics',
    color_theme: 'blue',
    difficulty_level: 'hard',
    priority_level: 'high',
    description: 'Calculus, Linear Algebra, Differential Equations',
    target_grade: 85.0,
    current_grade: 78.0
  },
  {
    id: 'subj-phys-001',
    name: 'Physics',
    color_theme: 'purple',
    difficulty_level: 'very_hard',
    priority_level: 'high',
    description: 'Classical Mechanics, Electromagnetism',
    target_grade: 80.0,
    current_grade: 65.0
  },
  {
    id: 'subj-chem-001',
    name: 'Chemistry',
    color_theme: 'green',
    difficulty_level: 'medium',
    priority_level: 'medium',
    description: 'Organic Chemistry, Thermodynamics',
    target_grade: 85.0,
    current_grade: 88.0
  },
  {
    id: 'subj-hist-001',
    name: 'World History',
    color_theme: 'orange',
    difficulty_level: 'easy',
    priority_level: 'low',
    description: 'Modern World History 1900-2000',
    target_grade: 80.0,
    current_grade: 82.0
  },
  {
    id: 'subj-eng-001',
    name: 'English Literature',
    color_theme: 'red',
    difficulty_level: 'medium',
    priority_level: 'medium',
    description: 'Shakespeare, Modern Literature',
    target_grade: 85.0,
    current_grade: 0.0
  }
];

const insertSubject = db.prepare(`
  INSERT INTO subjects (id, user_id, name, color_theme, difficulty_level, priority_level, target_grade, current_grade, is_active, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
`);

subjects.forEach(s => {
  insertSubject.run(s.id, userId, s.name, s.color_theme, s.difficulty_level, s.priority_level, s.target_grade, s.current_grade);
  console.log(`  ✓ ${s.name}`);
});

console.log('✅ 5 subjects inserted\n');

// Insert study sessions with varied times and patterns
console.log('Inserting study sessions...');

const sessionsData = [
  // Math sessions - consistent morning routine, good focus
  { subject: 'subj-math-001', date: '2025-10-25', time: '09:00:00', duration: 60, focus: 9, productivity: 85, method: 'practice_problems' },
  { subject: 'subj-math-001', date: '2025-10-26', time: '09:30:00', duration: 55, focus: 8, productivity: 80, method: 'practice_problems' },
  { subject: 'subj-math-001', date: '2025-10-27', time: '10:00:00', duration: 65, focus: 10, productivity: 90, method: 'practice_problems' },
  { subject: 'subj-math-001', date: '2025-10-28', time: '09:15:00', duration: 50, focus: 8, productivity: 82, method: 'video_lecture' },
  { subject: 'subj-math-001', date: '2025-10-29', time: '10:00:00', duration: 70, focus: 9, productivity: 88, method: 'practice_problems' },
  
  // Physics - struggling with focus, inconsistent times
  { subject: 'subj-phys-001', date: '2025-10-24', time: '14:00:00', duration: 45, focus: 5, productivity: 60, method: 'reading' },
  { subject: 'subj-phys-001', date: '2025-10-26', time: '15:30:00', duration: 40, focus: 4, productivity: 55, method: 'reading' },
  { subject: 'subj-phys-001', date: '2025-10-28', time: '21:00:00', duration: 35, focus: 3, productivity: 45, method: 'reading' },
  { subject: 'subj-phys-001', date: '2025-10-29', time: '16:00:00', duration: 50, focus: 6, productivity: 65, method: 'video_lecture' },
  
  // Chemistry - excellent performance, high focus
  { subject: 'subj-chem-001', date: '2025-10-25', time: '11:00:00', duration: 55, focus: 9, productivity: 90, method: 'practice_problems' },
  { subject: 'subj-chem-001', date: '2025-10-27', time: '11:30:00', duration: 60, focus: 9, productivity: 88, method: 'flashcards' },
  { subject: 'subj-chem-001', date: '2025-10-28', time: '11:00:00', duration: 50, focus: 10, productivity: 92, method: 'practice_problems' },
  { subject: 'subj-chem-001', date: '2025-10-29', time: '11:15:00', duration: 55, focus: 9, productivity: 89, method: 'group_study' },
  
  // History - moderate sessions
  { subject: 'subj-hist-001', date: '2025-10-26', time: '13:00:00', duration: 45, focus: 7, productivity: 75, method: 'reading' },
  { subject: 'subj-hist-001', date: '2025-10-28', time: '13:30:00', duration: 50, focus: 7, productivity: 72, method: 'notes' },
  { subject: 'subj-hist-001', date: '2025-10-29', time: '13:00:00', duration: 40, focus: 8, productivity: 78, method: 'flashcards' },
  
  // English Literature - NEGLECTED (only 1 session!)
  { subject: 'subj-eng-001', date: '2025-10-24', time: '12:00:00', duration: 30, focus: 6, productivity: 65, method: 'reading' }
];

const insertSession = db.prepare(`
  INSERT INTO study_sessions (
    id, user_id, subject_id, started_at, ended_at, 
    duration_minutes, average_focus_score, productivity_rating,
    study_method, session_type, notes, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', 'Test session', datetime('now'), datetime('now'))
`);

let sessionCount = 0;
sessionsData.forEach((s, idx) => {
  const sessionId = `sess-${Date.now()}-${idx}`;
  const startedAt = `${s.date}T${s.time}.000Z`;
  const endDate = new Date(startedAt);
  endDate.setMinutes(endDate.getMinutes() + s.duration);
  const endedAt = endDate.toISOString();
  
  insertSession.run(
    sessionId, userId, s.subject, startedAt, endedAt,
    s.duration, s.focus, s.productivity, s.method
  );
  sessionCount++;
});

console.log(`✅ ${sessionCount} study sessions inserted\n`);

// Insert performance entries with detailed data
console.log('Inserting performance entries...');

const performances = [
  {
    subject: 'subj-math-001',
    title: 'Calculus Midterm Exam',
    type: 'midterm',
    entry_type: 'exam',
    date: '2025-10-28',
    score: 78,
    total: 100,
    weaknesses: JSON.stringify(['Integration by parts', 'Differential equations', 'Series convergence']),
    improvements: 'Need more practice with integration techniques. Should work through 20+ problems daily. Consider forming study group for difficult topics.',
    study_hours: 12,
    preparation_days: 7
  },
  {
    subject: 'subj-phys-001',
    title: 'Mechanics Quiz 1',
    type: 'quiz',
    entry_type: 'quiz',
    date: '2025-10-27',
    score: 65,
    total: 100,
    weaknesses: JSON.stringify(['Newton\'s laws applications', 'Free body diagrams', 'Kinematics equations']),
    improvements: 'Struggled with word problems. Need to practice drawing diagrams first. Low focus during study sessions affecting performance. Should study physics in the morning instead of afternoon.',
    study_hours: 4,
    preparation_days: 3
  },
  {
    subject: 'subj-phys-001',
    title: 'Electromagnetism Quiz',
    type: 'quiz',
    entry_type: 'quiz',
    date: '2025-10-29',
    score: 62,
    total: 100,
    weaknesses: JSON.stringify(['Electric fields', 'Gauss\'s law', 'Circuit analysis']),
    improvements: 'Current study method (reading textbook) is not effective. Need to switch to solving practice problems. Consider watching video explanations before attempting problems.',
    study_hours: 5,
    preparation_days: 4
  },
  {
    subject: 'subj-chem-001',
    title: 'Organic Chemistry Exam',
    type: 'midterm',
    entry_type: 'exam',
    date: '2025-10-29',
    score: 91,
    total: 100,
    weaknesses: JSON.stringify(['Stereochemistry mechanisms']),
    improvements: 'Overall strong performance. Just need minor review of stereochemistry. Current study approach is working great!',
    study_hours: 10,
    preparation_days: 6
  },
  {
    subject: 'subj-hist-001',
    title: 'World War II Essay',
    type: 'assignment',
    entry_type: 'assignment',
    date: '2025-10-28',
    score: 82,
    total: 100,
    weaknesses: JSON.stringify(['Citation format', 'Thesis clarity']),
    improvements: 'Good content but need to improve writing structure. Should outline essays before writing.',
    study_hours: 6,
    preparation_days: 5
  }
];

const insertPerformance = db.prepare(`
  INSERT INTO performance_entries (
    id, user_id, subject_id, entry_type, assessment_title, assessment_type,
    assessment_date, score, total_possible, percentage,
    weaknesses_topics, what_to_do_differently,
    total_hours_studied, days_of_preparation, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

performances.forEach((p, idx) => {
  const perfId = `perf-${Date.now()}-${idx}`;
  const percentage = (p.score / p.total) * 100;
  
  insertPerformance.run(
    perfId, userId, p.subject, p.entry_type, p.title, p.type,
    p.date, p.score, p.total, percentage,
    p.weaknesses, p.improvements,
    p.study_hours, p.preparation_days
  );
  console.log(`  ✓ ${p.title}: ${p.score}/${p.total} (${percentage.toFixed(1)}%)`);
});

console.log('✅ 5 performance entries inserted\n');

// Insert goals with various statuses
console.log('Inserting goals...');

const goals = [
  {
    id: 'goal-001',
    subject_id: 'subj-math-001',
    goal_type: 'study_hours',
    target: 50,
    current: 18,
    deadline: '2025-11-15',
    status: 'active'
  },
  {
    id: 'goal-002',
    subject_id: 'subj-phys-001',
    goal_type: 'performance_average',
    target: 75,
    current: 63.5,
    deadline: '2025-11-10',
    status: 'active'
  },
  {
    id: 'goal-003',
    subject_id: 'subj-chem-001',
    goal_type: 'performance_average',
    target: 90,
    current: 91,
    deadline: '2025-12-01',
    status: 'active'
  },
  {
    id: 'goal-004',
    subject_id: 'subj-eng-001',
    goal_type: 'session_count',
    target: 10,
    current: 1,
    deadline: '2025-11-05',
    status: 'active'
  },
  {
    id: 'goal-005',
    subject_id: null,
    goal_type: 'study_hours',
    target: 100,
    current: 32,
    deadline: '2025-11-20',
    status: 'active'
  }
];

const insertGoal = db.prepare(`
  INSERT INTO goals (
    id, user_id, subject_id, goal_type, target_value, current_value,
    progress_percentage, status, on_track_status, target_completion_date,
    created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-5 days'), datetime('now'))
`);

goals.forEach(g => {
  const progress = (g.current / g.target) * 100;
  const daysLeft = Math.ceil((new Date(g.deadline) - new Date('2025-10-30')) / (1000 * 60 * 60 * 24));
  const daysElapsed = 5; // Created 5 days ago
  const totalDays = daysLeft + daysElapsed;
  const expectedProgress = (daysElapsed / totalDays) * 100;
  
  let onTrackStatus = 'on_track';
  if (progress < expectedProgress - 10) onTrackStatus = 'behind';
  else if (progress > expectedProgress + 10) onTrackStatus = 'ahead';
  
  insertGoal.run(
    g.id, userId, g.subject_id, g.goal_type, g.target, g.current,
    progress, g.status, onTrackStatus, g.deadline
  );
  
  const subjectName = subjects.find(s => s.id === g.subject_id)?.name || 'General';
  console.log(`  ✓ ${subjectName} - ${g.goal_type}: ${g.current}/${g.target} (${progress.toFixed(0)}%) [${onTrackStatus}]`);
});

console.log('✅ 5 goals inserted\n');

// Summary
console.log('═══════════════════════════════════════════════════════════');
console.log('📊 TEST DATA SUMMARY');
console.log('═══════════════════════════════════════════════════════════');
console.log(`
✅ Subjects: 5
   - Advanced Mathematics (hard, high priority)
   - Physics (very hard, high priority, STRUGGLING)
   - Chemistry (medium, high performance)
   - World History (easy, moderate)
   - English Literature (NEGLECTED - 1 session only!)

✅ Study Sessions: ${sessionCount}
   - Math: 5 sessions (morning, 9-10 AM, high focus 8-10)
   - Physics: 4 sessions (afternoon/evening, LOW focus 3-6)
   - Chemistry: 4 sessions (11 AM, high focus 9-10)
   - History: 3 sessions (1 PM, moderate focus 7-8)
   - English: 1 session (NEEDS ATTENTION!)

✅ Performance Entries: 5
   - Math: 78% (needs improvement)
   - Physics: 65%, 62% (POOR - below 75%)
   - Chemistry: 91% (EXCELLENT)
   - History: 82% (good)

✅ Goals: 5
   - Math study_hours: 36% (BEHIND)
   - Physics performance: 84.7% but score is 63.5 (CRISIS)
   - Chemistry performance: 101% (AHEAD)
   - English sessions: 10% (SEVERELY BEHIND)
   - Overall hours: 32% (BEHIND)

Expected Recommendations:
🚨 URGENT: English Literature - Zero activity
🚨 URGENT: Physics - Poor performance (63.5%)
🔴 URGENT: English goal severely behind (1/10 sessions)
🟠 HIGH: Physics goal behind schedule
🟠 HIGH: Math study hours goal behind
🎯 HIGH: Physics low focus (3-6/10)
⏰ PEAK TIME: 10:00 AM (Math best focus)
📊 AVOID: Afternoon/Evening for Physics
🌟 EXCELLENT: Chemistry (91% performance)
🚀 AHEAD: Chemistry goal
`);

db.close();
console.log('✅ Database closed. Test data insertion complete!\n');
console.log('🚀 Now refresh your dashboard to see comprehensive recommendations!');
