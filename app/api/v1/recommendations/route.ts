import { NextRequest, NextResponse } from 'next/server'
import { assessBurnoutRisk } from '@/lib/analytics/burnout-detector'
import { analyzeOptimalDuration } from '@/lib/analytics/duration-optimizer'
import { getComprehensiveTimeSeriesAnalysis } from '@/lib/analytics/time-series-detector'

/**
 * GET /api/v1/recommendations
 * Get comprehensive recommendations for user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const subjectId = searchParams.get('subjectId') || undefined
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }
    
    // Run all analyses in parallel
    const [
      burnoutAssessment,
      durationAnalysis,
      timeSeriesAnalysis
    ] = await Promise.all([
      assessBurnoutRisk(userId).catch(error => {
        console.error('Burnout analysis error:', error)
        return null
      }),
      analyzeOptimalDuration(userId, subjectId).catch(error => {
        console.error('Duration analysis error:', error)
        return null
      }),
      getComprehensiveTimeSeriesAnalysis(userId).catch(error => {
        console.error('Time series analysis error:', error)
        return { trends: [], patterns: [], anomalies: [] }
      })
    ])
    
    // Generate priority recommendations
    const recommendations = generatePriorityRecommendations(
      burnoutAssessment,
      durationAnalysis,
      timeSeriesAnalysis
    )
    
    // Store recommendations in database
    await storeRecommendations(userId, recommendations, subjectId)
    
    return NextResponse.json({
      success: true,
      data: {
        burnout: burnoutAssessment,
        duration: durationAnalysis,
        trends: timeSeriesAnalysis.trends,
        patterns: timeSeriesAnalysis.patterns,
        recommendations
      }
    })
  } catch (error: any) {
    console.error('[Recommendations API] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate recommendations',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * Generate priority-ranked recommendations
 */
function generatePriorityRecommendations(
  burnout: any,
  duration: any,
  timeSeries: any
): Array<{
  id: string
  type: string
  priority: string
  title: string
  description: string
  rationale: string
  expectedOutcome: string
  confidence: number
}> {
  const recommendations: any[] = []
  let idCounter = 1
  
  // URGENT: Burnout intervention (overrides everything)
  if (burnout && burnout.needsIntervention) {
    recommendations.push({
      id: `rec-${idCounter++}`,
      type: 'intervention',
      priority: 'urgent',
      title: '⚠️ Burnout Intervention Needed',
      description: burnout.recommendations[0] || 'Take immediate rest',
      rationale: `Burnout score: ${burnout.totalScore}/100 (${burnout.severity})`,
      expectedOutcome: 'Prevent complete burnout and restore mental health',
      confidence: 95
    })
  }
  
  // HIGH: Duration optimization
  if (duration && duration.confidence > 70) {
    recommendations.push({
      id: `rec-${idCounter++}`,
      type: 'strategic',
      priority: 'high',
      title: 'Optimize Session Duration',
      description: duration.recommendation,
      rationale: duration.reasoning,
      expectedOutcome: `Improve performance and focus by studying at your optimal duration`,
      confidence: duration.confidence
    })
  }
  
  // MEDIUM: Trend-based recommendations
  if (timeSeries.trends) {
    timeSeries.trends.forEach((trend: any) => {
      if (trend.trend === 'declining' && Math.abs(trend.changePercent) > 10) {
        recommendations.push({
          id: `rec-${idCounter++}`,
          type: 'strategic',
          priority: 'medium',
          title: `Address Declining ${trend.metric.replace('_', ' ')}`,
          description: trend.recommendation,
          rationale: trend.description,
          expectedOutcome: 'Reverse negative trend and restore performance',
          confidence: trend.confidence
        })
      } else if (trend.trend === 'improving') {
        recommendations.push({
          id: `rec-${idCounter++}`,
          type: 'insight',
          priority: 'low',
          title: `${trend.metric.replace('_', ' ')} Improving`,
          description: trend.description,
          rationale: 'Your current approach is working well',
          expectedOutcome: 'Continue momentum for sustained improvement',
          confidence: trend.confidence
        })
      }
    })
  }
  
  // Pattern-based recommendations
  if (timeSeries.patterns && timeSeries.patterns.length > 0) {
    timeSeries.patterns.forEach((pattern: any) => {
      recommendations.push({
        id: `rec-${idCounter++}`,
        type: 'insight',
        priority: 'medium',
        title: 'Weekly Pattern Detected',
        description: pattern.description,
        rationale: `${pattern.frequency} pattern with ${pattern.strength.toFixed(0)}% strength`,
        expectedOutcome: 'Adjust schedule to work with your natural rhythms',
        confidence: 75
      })
    })
  }
  
  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
  recommendations.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder])
  
  return recommendations
}

/**
 * Store recommendations in database
 */
async function storeRecommendations(
  userId: string,
  recommendations: any[],
  subjectId?: string
): Promise<void> {
  try {
    const { default: Database } = await import('better-sqlite3')
    const path = await import('path')
    const fs = await import('fs')
    const dbPath = path.default.join(process.cwd(), 'data', 'study-tracker.db')
    
    // Ensure data directory exists
    const dbDir = path.default.dirname(dbPath)
    if (!fs.default.existsSync(dbDir)) {
      fs.default.mkdirSync(dbDir, { recursive: true })
    }
    
    const db = new Database(dbPath)
    
    const stmt = db.prepare(`
      INSERT INTO recommendations (
        id, user_id, subject_id, recommendation_type, priority,
        title, description, rationale, expected_outcome, confidence_level,
        source_modules, status, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1, datetime('now'))
    `)
    
    for (const rec of recommendations) {
      const id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
      
      stmt.run(
        id,
        userId,
        subjectId || null,
        rec.type,
        rec.priority,
        rec.title,
        rec.description,
        rec.rationale,
        rec.expectedOutcome,
        rec.confidence,
        JSON.stringify([rec.type]) // source modules
      )
    }
    
    db.close()
  } catch (error) {
    console.error('Error storing recommendations:', error)
  }
}
