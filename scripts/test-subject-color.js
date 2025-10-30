const Database = require('better-sqlite3');

const db = new Database('./study-tracker.db');

console.log('\n🎨 Testing Subject Color Storage\n');
console.log('='.repeat(60));

// Ensure test user exists
const userId = 'test-user-1';
let user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

if (!user) {
  console.log('\nCreating test user...');
  db.prepare(`
    INSERT INTO users (id, email, full_name, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `).run(userId, 'test@example.com', 'Test User');
  console.log('✅ Test user created');
}

// Delete any existing test subjects
db.prepare("DELETE FROM subjects WHERE user_id = ? AND name LIKE 'Color Test%'").run(userId);

// Test colors
const testColors = [
  { name: 'Color Test Red', color: '#EF4444' },
  { name: 'Color Test Green', color: '#10B981' },
  { name: 'Color Test Purple', color: '#8B5CF6' },
  { name: 'Color Test Orange', color: '#F97316' },
];

console.log('\n📝 Inserting test subjects with colors...\n');

testColors.forEach((test, index) => {
  const id = 'test-color-' + index;
  db.prepare(`
    INSERT INTO subjects (
      id, user_id, name, category, difficulty_level, 
      color_theme, created_at, updated_at, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 1)
  `).run(id, userId, test.name, 'mathematics', 'medium', test.color);
  
  console.log(`  ✓ ${test.name} -> ${test.color}`);
});

// Now retrieve and verify
console.log('\n🔍 Verifying stored colors...\n');

const subjects = db.prepare(`
  SELECT name, color_theme 
  FROM subjects 
  WHERE user_id = ? AND name LIKE 'Color Test%'
  ORDER BY name
`).all(userId);

let allCorrect = true;
subjects.forEach(subject => {
  const expected = testColors.find(t => t.name === subject.name)?.color;
  const isCorrect = subject.color_theme === expected;
  allCorrect = allCorrect && isCorrect;
  
  console.log(`  ${isCorrect ? '✅' : '❌'} ${subject.name}`);
  console.log(`     Expected: ${expected}`);
  console.log(`     Got:      ${subject.color_theme}`);
  console.log('');
});

if (allCorrect) {
  console.log('='.repeat(60));
  console.log('✅ ALL COLORS STORED CORRECTLY IN DATABASE');
  console.log('='.repeat(60));
} else {
  console.log('='.repeat(60));
  console.log('❌ COLOR STORAGE FAILED');
  console.log('='.repeat(60));
}

// Clean up
db.prepare("DELETE FROM subjects WHERE user_id = ? AND name LIKE 'Color Test%'").run(userId);

db.close();
