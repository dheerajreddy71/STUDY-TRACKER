const Database = require('better-sqlite3');
const db = new Database('./study-tracker.db');

console.log('\n🎨 Checking Subject Colors in Database\n');
console.log('='.repeat(60));

// First check what tables exist
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\nTables in database:', tables.map(t => t.name).join(', '));

if (!tables.find(t => t.name === 'subjects')) {
  console.log('\n❌ No subjects table found! Database needs to be initialized.\n');
  db.close();
  process.exit(1);
}

const subjects = db.prepare('SELECT id, name, color_theme FROM subjects').all();

if (subjects.length === 0) {
  console.log('\n❌ No subjects found in database\n');
} else {
  console.log(`\nFound ${subjects.length} subjects:\n`);
  subjects.forEach(s => {
    console.log(`  📚 ${s.name}`);
    console.log(`     Color: ${s.color_theme || '❌ NULL/EMPTY'}`);
    console.log('');
  });
}

db.close();
