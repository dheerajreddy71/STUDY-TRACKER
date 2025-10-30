const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "..", "data", "study-tracker.db");
const schemaPath = path.join(__dirname, "init-sqlite.sql");

// Ensure data directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log("Initializing database...");
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Read and execute schema
if (fs.existsSync(schemaPath)) {
  console.log("Executing schema...");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
  console.log("✓ Schema initialized");
}

// Add sample data for guest user
console.log("Adding sample data...");

const guestId = "guest-user";

// Sample subjects
const subjects = [
  { name: "Mathematics", category: "mathematics", difficulty: "hard", color: "#3B82F6" },
  { name: "Physics", category: "science", difficulty: "very_hard", color: "#8B5CF6" },
  { name: "English Literature", category: "language", difficulty: "medium", color: "#10B981" },
  { name: "Computer Science", category: "technical", difficulty: "medium", color: "#F59E0B" },
  { name: "History", category: "social_studies", difficulty: "easy", color: "#EF4444" },
];

const subjectIds = [];
subjects.forEach((subject) => {
  const id = `subject-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  subjectIds.push(id);
  db.prepare(`
    INSERT INTO subjects (id, user_id, name, category, difficulty_level, color_theme, current_grade, target_grade)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, guestId, subject.name, subject.category, subject.difficulty, subject.color, 75, 85);
});

console.log(`✓ Added ${subjects.length} subjects`);

// Sample sessions (last 7 days)
const sessions = [];
const now = new Date();
for (let i = 0; i < 20; i++) {
  const date = new Date(now);
  date.setDate(date.getDate() - Math.floor(i / 3));
  date.setHours(9 + (i % 12), 0, 0, 0);
  
  const subjectId = subjectIds[i % subjectIds.length];
  const methods = ["reading", "practice_problems", "video_lecture", "notes", "flashcards"];
  const duration = 30 + Math.floor(Math.random() * 60);
  const focus = 6 + Math.floor(Math.random() * 4);
  
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const endDate = new Date(date);
  endDate.setMinutes(endDate.getMinutes() + duration);
  
  db.prepare(`
    INSERT INTO study_sessions (
      id, user_id, subject_id, study_method, duration_minutes, 
      actual_duration_minutes, average_focus_score, goal_achieved,
      started_at, ended_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sessionId,
    guestId,
    subjectId,
    methods[i % methods.length],
    duration,
    duration,
    focus,
    duration >= 45 ? "yes" : "partial",
    date.toISOString(),
    endDate.toISOString()
  );
  
  sessions.push(sessionId);
}

console.log(`✓ Added ${sessions.length} study sessions`);

// Sample performance entries
const performanceTypes = ["quiz", "test", "exam", "assignment"];
for (let i = 0; i < 15; i++) {
  const date = new Date(now);
  date.setDate(date.getDate() - (i * 2));
  
  const subjectId = subjectIds[i % subjectIds.length];
  const score = 60 + Math.floor(Math.random() * 35);
  const total = 100;
  
  const perfId = `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  db.prepare(`
    INSERT INTO performance_entries (
      id, user_id, subject_id, entry_type, score, total_possible, 
      percentage, assessment_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    perfId,
    guestId,
    subjectId,
    performanceTypes[i % performanceTypes.length],
    score,
    total,
    (score / total) * 100,
    date.toISOString().split('T')[0]
  );
}

console.log("✓ Added 15 performance entries");

// Sample goals
const goals = [
  { type: "study_hours", category: "weekly", target: 20, current: 15 },
  { type: "session_count", category: "weekly", target: 10, current: 8 },
  { type: "performance_average", category: "monthly", target: 85, current: 78 },
];

goals.forEach((goal) => {
  const goalId = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  db.prepare(`
    INSERT INTO goals (id, user_id, goal_type, goal_category, target_value, current_value)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(goalId, guestId, goal.type, goal.category, goal.target, goal.current);
});

console.log(`✓ Added ${goals.length} goals`);

// Sample achievements
const achievements = [
  { type: "streak", name: "7-Day Streak", desc: "Studied 7 days in a row", icon: "🔥" },
  { type: "milestone", name: "100 Hours", desc: "Completed 100 study hours", icon: "⏱️" },
  { type: "performance", name: "Perfect Score", desc: "Achieved 100% on an assessment", icon: "💯" },
];

achievements.forEach((ach) => {
  const achId = `ach-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  db.prepare(`
    INSERT INTO achievements (id, user_id, achievement_type, achievement_name, description, badge_icon)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(achId, guestId, ach.type, ach.name, ach.desc, ach.icon);
});

console.log(`✓ Added ${achievements.length} achievements`);

// Update streak
const streakId = db.prepare("SELECT id FROM streaks WHERE user_id = ? AND streak_type = 'study'").get(guestId);
if (streakId) {
  db.prepare(`
    UPDATE streaks 
    SET current_streak_days = 7, 
        longest_streak_days = 12, 
        last_study_date = date('now')
    WHERE id = ?
  `).run(streakId.id);
  console.log("✓ Updated streak data");
}

// Sample insights
const insights = [
  {
    type: "pattern",
    title: "Morning Study Sessions",
    desc: "You perform 25% better when studying in the morning (9-11 AM)",
    confidence: 0.85,
  },
  {
    type: "recommendation",
    title: "Break Frequency",
    desc: "Consider taking breaks every 45 minutes for optimal focus",
    confidence: 0.78,
  },
];

insights.forEach((insight) => {
  const insightId = `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  db.prepare(`
    INSERT INTO insights (id, user_id, insight_type, title, description, confidence_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(insightId, guestId, insight.type, insight.title, insight.desc, insight.confidence);
});

console.log(`✓ Added ${insights.length} insights`);

db.close();

console.log("\n✅ Database initialized successfully!");
console.log(`📁 Database location: ${dbPath}`);
console.log("🚀 You can now start the application with: pnpm dev\n");
