/**
 * Spaced Repetition Scheduler
 * Implements forgetting curve mathematics for optimal review timing
 */

export interface SpacedRepetitionItem {
  id: string
  userId: string
  subjectId: string
  topicName: string
  chapterReference?: string
  initialStudyDate: string
  memoryStrength: number // S parameter in days
  initialConfidence: number // 1-10
  difficultyLevel: number // 1-5
  nextReviewDate: string
  reviewCount: number
  lastReviewDate?: string
  lastReviewConfidence?: number
  status: 'active' | 'mastered' | 'paused'
  retentionEstimate?: number // Current estimated retention %
  reviewHistory: ReviewRecord[]
}

export interface ReviewRecord {
  date: string
  confidence: number
  timeSpent: number // minutes
  result: 'easy' | 'good' | 'hard' | 'forgot'
}

/**
 * Calculate retention using Ebbinghaus forgetting curve
 * Formula: Retention = e^(-t/S)
 * where t = time since learning, S = memory strength
 */
export function calculateRetention(
  daysSinceStudy: number,
  memoryStrength: number
): number {
  const retention = Math.exp(-daysSinceStudy / memoryStrength)
  return Math.max(0, Math.min(100, retention * 100))
}

/**
 * Calculate optimal review date when retention drops to 70-75%
 */
export function calculateNextReviewDate(
  lastStudyDate: Date,
  memoryStrength: number,
  targetRetention: number = 75
): Date {
  // Solve for t: 0.75 = e^(-t/S)
  // t = -S * ln(0.75)
  const daysUntilReview = -memoryStrength * Math.log(targetRetention / 100)
  
  const nextReview = new Date(lastStudyDate)
  nextReview.setDate(nextReview.getDate() + Math.ceil(daysUntilReview))
  
  return nextReview
}

/**
 * Update memory strength after successful review
 */
export function updateMemoryStrength(
  currentStrength: number,
  reviewResult: 'easy' | 'good' | 'hard' | 'forgot',
  reviewCount: number
): number {
  const multipliers = {
    easy: 2.5,
    good: 2.0,
    hard: 1.5,
    forgot: 0.5 // Reset if forgotten
  }
  
  const newStrength = currentStrength * multipliers[reviewResult]
  
  // Cap maximum interval at 90 days
  return Math.min(90, Math.max(1, newStrength))
}

/**
 * Calculate initial memory strength based on mastery
 */
export function calculateInitialMemoryStrength(
  confidence: number,
  difficultyLevel: number
): number {
  // Base strength: 3 days
  // Adjusted by confidence (1-10) and difficulty (1-5)
  const confidenceFactor = confidence / 10
  const difficultyFactor = (6 - difficultyLevel) / 5
  
  const strength = 3 * confidenceFactor * difficultyFactor
  
  return Math.max(1, Math.min(7, strength))
}

/**
 * Create a new spaced repetition item
 */
export async function createSpacedRepetitionItem(
  userId: string,
  subjectId: string,
  topicName: string,
  confidence: number,
  difficultyLevel: number = 3,
  chapterReference?: string
): Promise<SpacedRepetitionItem> {
  const { default: Database } = await import('better-sqlite3')
  const path = await import('path')
  const fs = await import('fs')
  const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
  
  const dbDir = path.default.dirname(dbPath)
  if (!fs.default.existsSync(dbDir)) {
    fs.default.mkdirSync(dbDir, { recursive: true })
  }
  
  const db = new Database(dbPath)
  
  const id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
  const initialStudyDate = new Date()
  const memoryStrength = calculateInitialMemoryStrength(confidence, difficultyLevel)
  const nextReviewDate = calculateNextReviewDate(initialStudyDate, memoryStrength)
  
  const stmt = db.prepare(`
    INSERT INTO spaced_repetition_items (
      id, user_id, subject_id, topic_name, chapter_reference,
      initial_study_date, memory_strength, initial_confidence,
      difficulty_level, next_review_date, review_count,
      status, review_history
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'active', '[]')
  `)
  
  stmt.run(
    id,
    userId,
    subjectId,
    topicName,
    chapterReference || null,
    initialStudyDate.toISOString(),
    memoryStrength,
    confidence,
    difficultyLevel,
    nextReviewDate.toISOString()
  )
  
  db.close()
  
  return {
    id,
    userId,
    subjectId,
    topicName,
    chapterReference,
    initialStudyDate: initialStudyDate.toISOString(),
    memoryStrength,
    initialConfidence: confidence,
    difficultyLevel,
    nextReviewDate: nextReviewDate.toISOString(),
    reviewCount: 0,
    status: 'active',
    reviewHistory: []
  }
}

/**
 * Record a review and update memory strength
 */
export async function recordReview(
  itemId: string,
  confidence: number,
  timeSpent: number,
  result: 'easy' | 'good' | 'hard' | 'forgot'
): Promise<void> {
  const { default: Database } = await import('better-sqlite3')
  const path = await import('path')
  const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
  const db = new Database(dbPath)
  
  // Get current item
  const item = db.prepare(`
    SELECT * FROM spaced_repetition_items WHERE id = ?
  `).get(itemId) as any
  
  if (!item) {
    db.close()
    throw new Error('Item not found')
  }
  
  // Update memory strength
  const newStrength = updateMemoryStrength(
    item.memory_strength,
    result,
    item.review_count
  )
  
  // Calculate next review date
  const nextReview = calculateNextReviewDate(new Date(), newStrength)
  
  // Update review history
  const history = JSON.parse(item.review_history || '[]')
  history.push({
    date: new Date().toISOString(),
    confidence,
    timeSpent,
    result
  })
  
  // Check if mastered (5+ successful reviews with high confidence)
  const recentReviews = history.slice(-5)
  const ismastered = recentReviews.length >= 5 &&
    recentReviews.every((r: any) => r.result === 'easy' || r.result === 'good') &&
    recentReviews.every((r: any) => r.confidence >= 8)
  
  // Update item
  const updateStmt = db.prepare(`
    UPDATE spaced_repetition_items
    SET memory_strength = ?,
        next_review_date = ?,
        review_count = review_count + 1,
        last_review_date = ?,
        last_review_confidence = ?,
        status = ?,
        review_history = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `)
  
  updateStmt.run(
    newStrength,
    nextReview.toISOString(),
    new Date().toISOString(),
    confidence,
    ismastered ? 'mastered' : 'active',
    JSON.stringify(history),
    itemId
  )
  
  db.close()
}

/**
 * Get items due for review
 */
export async function getItemsDueForReview(
  userId: string,
  subjectId?: string
): Promise<SpacedRepetitionItem[]> {
  const { default: Database } = await import('better-sqlite3')
  const path = await import('path')
  const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
  const db = new Database(dbPath)
  
  const query = `
    SELECT * FROM spaced_repetition_items
    WHERE user_id = ?
      ${subjectId ? 'AND subject_id = ?' : ''}
      AND status = 'active'
      AND date(next_review_date) <= date('now')
    ORDER BY next_review_date ASC
    LIMIT 20
  `
  
  const params = subjectId ? [userId, subjectId] : [userId]
  const rows = db.prepare(query).all(...params) as any[]
  db.close()
  
  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    subjectId: row.subject_id,
    topicName: row.topic_name,
    chapterReference: row.chapter_reference,
    initialStudyDate: row.initial_study_date,
    memoryStrength: row.memory_strength,
    initialConfidence: row.initial_confidence,
    difficultyLevel: row.difficulty_level,
    nextReviewDate: row.next_review_date,
    reviewCount: row.review_count,
    lastReviewDate: row.last_review_date,
    lastReviewConfidence: row.last_review_confidence,
    status: row.status,
    retentionEstimate: calculateRetention(
      Math.floor((Date.now() - new Date(row.last_review_date || row.initial_study_date).getTime()) / (1000 * 60 * 60 * 24)),
      row.memory_strength
    ),
    reviewHistory: JSON.parse(row.review_history || '[]')
  }))
}

/**
 * Get review schedule for next 7 days
 */
export async function getReviewSchedule(
  userId: string,
  days: number = 7
): Promise<Map<string, SpacedRepetitionItem[]>> {
  const { default: Database } = await import('better-sqlite3')
  const path = await import('path')
  const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
  const db = new Database(dbPath)
  
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + days)
  
  const query = `
    SELECT * FROM spaced_repetition_items
    WHERE user_id = ?
      AND status = 'active'
      AND date(next_review_date) <= date(?)
    ORDER BY next_review_date ASC
  `
  
  const rows = db.prepare(query).all(userId, endDate.toISOString().split('T')[0]) as any[]
  db.close()
  
  // Group by date
  const schedule = new Map<string, SpacedRepetitionItem[]>()
  
  rows.forEach(row => {
    const date = row.next_review_date.split('T')[0]
    
    if (!schedule.has(date)) {
      schedule.set(date, [])
    }
    
    schedule.get(date)!.push({
      id: row.id,
      userId: row.user_id,
      subjectId: row.subject_id,
      topicName: row.topic_name,
      chapterReference: row.chapter_reference,
      initialStudyDate: row.initial_study_date,
      memoryStrength: row.memory_strength,
      initialConfidence: row.initial_confidence,
      difficultyLevel: row.difficulty_level,
      nextReviewDate: row.next_review_date,
      reviewCount: row.review_count,
      lastReviewDate: row.last_review_date,
      lastReviewConfidence: row.last_review_confidence,
      status: row.status,
      reviewHistory: JSON.parse(row.review_history || '[]')
    })
  })
  
  return schedule
}

/**
 * Get topics at high risk of being forgotten
 */
export async function getTopicsAtRisk(
  userId: string,
  retentionThreshold: number = 60
): Promise<SpacedRepetitionItem[]> {
  const { default: Database } = await import('better-sqlite3')
  const path = await import('path')
  const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
  const db = new Database(dbPath)
  
  const query = `
    SELECT * FROM spaced_repetition_items
    WHERE user_id = ?
      AND status = 'active'
    ORDER BY memory_strength ASC
  `
  
  const rows = db.prepare(query).all(userId) as any[]
  db.close()
  
  // Filter by retention estimate
  const atRisk: SpacedRepetitionItem[] = []
  
  rows.forEach(row => {
    const daysSinceLastStudy = Math.floor(
      (Date.now() - new Date(row.last_review_date || row.initial_study_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    const retention = calculateRetention(daysSinceLastStudy, row.memory_strength)
    
    if (retention < retentionThreshold) {
      atRisk.push({
        id: row.id,
        userId: row.user_id,
        subjectId: row.subject_id,
        topicName: row.topic_name,
        chapterReference: row.chapter_reference,
        initialStudyDate: row.initial_study_date,
        memoryStrength: row.memory_strength,
        initialConfidence: row.initial_confidence,
        difficultyLevel: row.difficulty_level,
        nextReviewDate: row.next_review_date,
        reviewCount: row.review_count,
        lastReviewDate: row.last_review_date,
        lastReviewConfidence: row.last_review_confidence,
        status: row.status,
        retentionEstimate: retention,
        reviewHistory: JSON.parse(row.review_history || '[]')
      })
    }
  })
  
  // Sort by retention (lowest first)
  return atRisk.sort((a, b) => (a.retentionEstimate || 0) - (b.retentionEstimate || 0))
}

/**
 * Generate spaced repetition reminders
 */
export async function generateReviewReminders(
  userId: string
): Promise<Array<{
  priority: 'urgent' | 'high' | 'medium'
  title: string
  description: string
  items: SpacedRepetitionItem[]
}>> {
  const [overdueItems, todayItems, atRisk] = await Promise.all([
    getItemsDueForReview(userId),
    getItemsDueForReview(userId),
    getTopicsAtRisk(userId, 50)
  ])
  
  const reminders: Array<{
    priority: 'urgent' | 'high' | 'medium'
    title: string
    description: string
    items: SpacedRepetitionItem[]
  }> = []
  
  // Overdue reviews
  if (overdueItems.length > 0) {
    reminders.push({
      priority: 'urgent',
      title: `${overdueItems.length} Overdue Reviews`,
      description: `These topics need immediate review to prevent forgetting`,
      items: overdueItems
    })
  }
  
  // High forgetting risk
  const criticalRisk = atRisk.filter(item => (item.retentionEstimate || 0) < 40)
  if (criticalRisk.length > 0) {
    reminders.push({
      priority: 'high',
      title: `${criticalRisk.length} Topics at Critical Risk`,
      description: `Retention below 40% - review urgently to avoid relearning`,
      items: criticalRisk
    })
  }
  
  // Moderate risk
  const moderateRisk = atRisk.filter(item => {
    const retention = item.retentionEstimate || 0
    return retention >= 40 && retention < 60
  })
  
  if (moderateRisk.length > 0) {
    reminders.push({
      priority: 'medium',
      title: `${moderateRisk.length} Topics Need Attention`,
      description: `Retention dropping - review soon to maintain mastery`,
      items: moderateRisk
    })
  }
  
  return reminders
}
