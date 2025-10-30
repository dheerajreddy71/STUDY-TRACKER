-- ============================================================================
-- CALENDAR EVENTS COMPREHENSIVE FIELDS MIGRATION
-- Adds missing comprehensive fields to calendar_events table
-- ============================================================================

-- Session Details
ALTER TABLE calendar_events ADD COLUMN session_type TEXT;
ALTER TABLE calendar_events ADD COLUMN study_method TEXT;
ALTER TABLE calendar_events ADD COLUMN location TEXT;

-- Preparation & Tasks
ALTER TABLE calendar_events ADD COLUMN preparation_required TEXT;
ALTER TABLE calendar_events ADD COLUMN difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard', 'very_hard'));
ALTER TABLE calendar_events ADD COLUMN priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Linked Items (JSON arrays)
ALTER TABLE calendar_events ADD COLUMN linked_resource_ids TEXT;
ALTER TABLE calendar_events ADD COLUMN linked_goal_ids TEXT;

-- Reminders
ALTER TABLE calendar_events ADD COLUMN reminder_enabled INTEGER DEFAULT 1;
ALTER TABLE calendar_events ADD COLUMN reminder_minutes_before INTEGER DEFAULT 30;
ALTER TABLE calendar_events ADD COLUMN notification_sent INTEGER DEFAULT 0;

-- Pre/Post Tasks (JSON arrays)
ALTER TABLE calendar_events ADD COLUMN pre_session_checklist TEXT;
ALTER TABLE calendar_events ADD COLUMN post_session_tasks TEXT;

-- Additional Details
ALTER TABLE calendar_events ADD COLUMN notes TEXT;
ALTER TABLE calendar_events ADD COLUMN tags TEXT; -- JSON array
ALTER TABLE calendar_events ADD COLUMN color TEXT;

-- Status tracking
ALTER TABLE calendar_events ADD COLUMN completion_status TEXT;
ALTER TABLE calendar_events ADD COLUMN actual_start_time TEXT;
ALTER TABLE calendar_events ADD COLUMN actual_end_time TEXT;
ALTER TABLE calendar_events ADD COLUMN cancellation_reason TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_priority ON calendar_events(priority);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_difficulty ON calendar_events(difficulty);
