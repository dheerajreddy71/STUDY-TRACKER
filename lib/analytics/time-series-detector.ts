/**
 * Time-Series Pattern Detector
 * Identifies trends and patterns over time in study habits
 */

export interface TimeSeriesTrend {
  metric: string
  period: 'daily' | 'weekly' | 'monthly'
  trend: 'improving' | 'declining' | 'stable'
  momentum: number // Rate of change as percentage
  currentValue: number
  previousValue: number
  change: number
  changePercent: number
  confidence: number
  description: string
  recommendation: string
}

export interface SeasonalPattern {
  pattern: string
  frequency: 'weekly' | 'monthly'
  strength: number
  description: string
  affectedDays?: string[]
  affectedWeeks?: number[]
}

export interface Anomaly {
  date: string
  metric: string
  expectedValue: number
  actualValue: number
  deviation: number
  severity: 'low' | 'medium' | 'high'
  description: string
}

/**
 * Calculate moving average for smoothing data
 */
export function calculateMovingAverage(data: number[], windowSize: number): number[] {
  const result: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1)
    const window = data.slice(start, i + 1)
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length
    result.push(avg)
  }
  
  return result
}

/**
 * Calculate exponential moving average (gives more weight to recent data)
 */
export function calculateExponentialMovingAverage(
  data: number[],
  alpha: number = 0.3
): number[] {
  if (data.length === 0) return []
  
  const result: number[] = [data[0]]
  
  for (let i = 1; i < data.length; i++) {
    const ema = alpha * data[i] + (1 - alpha) * result[i - 1]
    result.push(ema)
  }
  
  return result
}

/**
 * Calculate standard deviation
 */
function calculateStandardDeviation(data: number[]): number {
  if (data.length === 0) return 0
  
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length
  const squaredDiffs = data.map(val => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length
  
  return Math.sqrt(variance)
}

/**
 * Detect trend in time series data
 */
export function detectTrend(
  data: number[],
  metric: string,
  windowSize: number = 7
): TimeSeriesTrend | null {
  if (data.length < windowSize * 2) return null
  
  // Calculate moving averages for recent and previous periods
  const smoothed = calculateMovingAverage(data, windowSize)
  
  const recentPeriod = smoothed.slice(-windowSize)
  const previousPeriod = smoothed.slice(-windowSize * 2, -windowSize)
  
  const recentAvg = recentPeriod.reduce((sum, val) => sum + val, 0) / recentPeriod.length
  const previousAvg = previousPeriod.reduce((sum, val) => sum + val, 0) / previousPeriod.length
  
  // Protect against division by zero
  if (previousAvg === 0 || recentAvg === 0) {
    return {
      metric,
      period: 'daily',
      trend: 'stable',
      currentValue: recentAvg,
      previousValue: previousAvg,
      change: 0,
      changePercent: 0,
      momentum: 0,
      confidence: 0,
      description: `Insufficient ${metric} data for trend analysis`,
      recommendation: 'Continue collecting data to identify trends'
    }
  }
  
  const change = recentAvg - previousAvg
  const changePercent = (change / previousAvg) * 100
  const momentum = changePercent / windowSize // Rate of change per day
  
  // Determine trend direction
  let trend: 'improving' | 'declining' | 'stable'
  if (Math.abs(changePercent) < 5) {
    trend = 'stable'
  } else if (change > 0) {
    trend = 'improving'
  } else {
    trend = 'declining'
  }
  
  // Calculate confidence based on consistency
  const stdDev = calculateStandardDeviation(recentPeriod)
  const confidence = Math.max(0, Math.min(100, 100 - (stdDev / recentAvg) * 100))
  
  const description = generateTrendDescription(metric, trend, changePercent, windowSize)
  const recommendation = generateTrendRecommendation(metric, trend, changePercent)
  
  return {
    metric,
    period: 'weekly',
    trend,
    momentum,
    currentValue: recentAvg,
    previousValue: previousAvg,
    change,
    changePercent,
    confidence,
    description,
    recommendation
  }
}

/**
 * Detect weekly seasonal patterns
 */
export function detectWeeklyPattern(
  dataByDayOfWeek: Map<number, number[]>
): SeasonalPattern | null {
  // Calculate average for each day of week
  const dayAverages = new Map<number, number>()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  for (const [day, values] of dataByDayOfWeek.entries()) {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    dayAverages.set(day, avg)
  }
  
  if (dayAverages.size < 5) return null
  
  const allAverages = Array.from(dayAverages.values())
  const overallAvg = allAverages.reduce((sum, val) => sum + val, 0) / allAverages.length
  const stdDev = calculateStandardDeviation(allAverages)
  
  // Find days that significantly deviate from average
  const anomalousdays: Array<{ day: number; avg: number; deviation: number }> = []
  
  for (const [day, avg] of dayAverages.entries()) {
    const deviation = ((avg - overallAvg) / overallAvg) * 100
    if (Math.abs(deviation) > 15) {
      anomalousdays.push({ day, avg, deviation })
    }
  }
  
  if (anomalousdays.length === 0) return null
  
  // Calculate pattern strength
  const strength = Math.min(100, (stdDev / overallAvg) * 100)
  
  const affectedDayNames = anomalousdays.map(d => dayNames[d.day])
  const description = `${affectedDayNames.join(', ')} show ${anomalousdays[0].deviation > 0 ? 'higher' : 'lower'} than average performance`
  
  return {
    pattern: 'weekly_cycle',
    frequency: 'weekly',
    strength,
    description,
    affectedDays: affectedDayNames
  }
}

/**
 * Detect anomalies in time series
 */
export function detectAnomalies(
  data: Array<{ date: string; value: number }>,
  metric: string,
  threshold: number = 2
): Anomaly[] {
  if (data.length < 14) return []
  
  const values = data.map(d => d.value)
  const smoothed = calculateExponentialMovingAverage(values, 0.3)
  const stdDev = calculateStandardDeviation(values)
  
  const anomalies: Anomaly[] = []
  
  for (let i = 7; i < data.length; i++) {
    const expected = smoothed[i]
    const actual = data[i].value
    const deviation = Math.abs(actual - expected) / stdDev
    
    if (deviation > threshold) {
      const severity = deviation > 3 ? 'high' : deviation > 2.5 ? 'medium' : 'low'
      
      anomalies.push({
        date: data[i].date,
        metric,
        expectedValue: expected,
        actualValue: actual,
        deviation: deviation,
        severity,
        description: `${metric} was ${actual > expected ? 'significantly higher' : 'significantly lower'} than expected (${deviation.toFixed(1)} standard deviations)`
      })
    }
  }
  
  return anomalies
}

/**
 * Analyze focus rating trends
 */
export async function analyzeFocusTrend(
  userId: string,
  days: number = 30
): Promise<TimeSeriesTrend | null> {
  try {
    const { default: Database } = await import('better-sqlite3')
    const path = await import('path')
    const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
    const db = new Database(dbPath)
    
    const query = `
      SELECT date(started_at) as date, AVG(average_focus_score) as avg_focus
      FROM study_sessions
      WHERE user_id = ?
        AND started_at >= date('now', '-${days} days')
        AND average_focus_score IS NOT NULL
      GROUP BY date(started_at)
      ORDER BY date(started_at)
    `
    
    const rows = db.prepare(query).all(userId) as Array<{ date: string; avg_focus: number }>
    db.close()
    
    if (rows.length < 14) return null
    
    const focusValues = rows.map(r => r.avg_focus)
    return detectTrend(focusValues, 'focus_rating', 7)
  } catch (error) {
    console.error('Error analyzing focus trend:', error)
    return null
  }
}

/**
 * Analyze performance trends
 */
export async function analyzePerformanceTrend(
  userId: string,
  subjectId?: string,
  days: number = 60
): Promise<TimeSeriesTrend | null> {
  try {
    const { default: Database } = await import('better-sqlite3')
    const path = await import('path')
    const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
    const db = new Database(dbPath)
    
    const query = `
      SELECT date(assessment_date) as date, AVG(percentage) as avg_score
      FROM performance_entries
      WHERE user_id = ?
        ${subjectId ? 'AND subject_id = ?' : ''}
        AND assessment_date >= date('now', '-${days} days')
      GROUP BY date(assessment_date)
      ORDER BY date(assessment_date)
    `
    
    const params = subjectId ? [userId, subjectId] : [userId]
    const rows = db.prepare(query).all(...params) as Array<{ date: string; avg_score: number }>
    db.close()
    
    if (rows.length < 10) return null
    
    const scoreValues = rows.map(r => r.avg_score)
    return detectTrend(scoreValues, 'performance_score', 7)
  } catch (error) {
    console.error('Error analyzing performance trend:', error)
    return null
  }
}

/**
 * Analyze study hours trends
 */
export async function analyzeStudyHoursTrend(
  userId: string,
  days: number = 30
): Promise<TimeSeriesTrend | null> {
  try {
    const { default: Database } = await import('better-sqlite3')
    const path = await import('path')
    const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
    const db = new Database(dbPath)
    
    const query = `
      SELECT 
        date(started_at) as date,
        SUM(duration_minutes) / 60.0 as total_hours
      FROM study_sessions
      WHERE user_id = ?
        AND started_at >= date('now', '-${days} days')
      GROUP BY date(started_at)
      ORDER BY date(started_at)
    `
    
    const rows = db.prepare(query).all(userId) as Array<{ date: string; total_hours: number }>
    db.close()
    
    if (rows.length < 14) return null
    
    const hoursValues = rows.map(r => r.total_hours)
    return detectTrend(hoursValues, 'study_hours', 7)
  } catch (error) {
    console.error('Error analyzing study hours trend:', error)
    return null
  }
}

/**
 * Detect weekly patterns in performance
 */
export async function detectWeeklyPerformancePattern(
  userId: string,
  days: number = 60
): Promise<SeasonalPattern | null> {
  try {
    const { default: Database } = await import('better-sqlite3')
    const path = await import('path')
    const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
    const db = new Database(dbPath)
    
    const query = `
      SELECT 
        CAST(strftime('%w', started_at) AS INTEGER) as day_of_week,
        average_focus_score as focus
      FROM study_sessions
      WHERE user_id = ?
        AND started_at >= date('now', '-${days} days')
        AND average_focus_score IS NOT NULL
      ORDER BY started_at
    `
    
    const rows = db.prepare(query).all(userId) as Array<{ day_of_week: number; focus: number }>
    db.close()
    
    // Group by day of week
    const dataByDay = new Map<number, number[]>()
    rows.forEach(row => {
      if (!dataByDay.has(row.day_of_week)) {
        dataByDay.set(row.day_of_week, [])
      }
      dataByDay.get(row.day_of_week)!.push(row.focus)
    })
    
    return detectWeeklyPattern(dataByDay)
  } catch (error) {
    console.error('Error detecting weekly pattern:', error)
    return null
  }
}

function generateTrendDescription(
  metric: string,
  trend: string,
  changePercent: number,
  windowSize: number
): string {
  const metricName = metric.replace('_', ' ')
  const period = windowSize === 7 ? 'week' : `${windowSize} days`
  
  if (trend === 'stable') {
    return `Your ${metricName} has remained stable over the past ${period}`
  }
  
  return `Your ${metricName} has ${trend === 'improving' ? 'improved' : 'declined'} by ${Math.abs(changePercent).toFixed(1)}% over the past ${period}`
}

function generateTrendRecommendation(
  metric: string,
  trend: string,
  changePercent: number
): string {
  if (trend === 'improving') {
    return `Excellent! Your current approach is working. Maintain these study habits.`
  } else if (trend === 'declining') {
    if (metric === 'focus_rating') {
      return `Focus is declining. Consider: shorter sessions, more breaks, or changing study environment.`
    } else if (metric === 'performance_score') {
      return `Performance is declining. Review your study methods and time allocation. Consider revisiting difficult topics.`
    } else if (metric === 'study_hours') {
      return `Study time is decreasing. Set specific daily goals and schedule study sessions in advance.`
    }
  }
  
  return `Continue monitoring your ${metric.replace('_', ' ')}.`
}

/**
 * Get comprehensive time series analysis
 */
export async function getComprehensiveTimeSeriesAnalysis(userId: string): Promise<{
  trends: TimeSeriesTrend[]
  patterns: SeasonalPattern[]
  anomalies: Anomaly[]
}> {
  const [focusTrend, performanceTrend, hoursTrend, weeklyPattern] = await Promise.all([
    analyzeFocusTrend(userId),
    analyzePerformanceTrend(userId),
    analyzeStudyHoursTrend(userId),
    detectWeeklyPerformancePattern(userId)
  ])
  
  const trends: TimeSeriesTrend[] = [focusTrend, performanceTrend, hoursTrend].filter(Boolean) as TimeSeriesTrend[]
  const patterns: SeasonalPattern[] = weeklyPattern ? [weeklyPattern] : []
  
  return {
    trends,
    patterns,
    anomalies: [] // Can be extended with anomaly detection
  }
}
