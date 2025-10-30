/**
 * Comprehensive Recommendations API
 * Returns all analytics and recommendations
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  generateComprehensiveRecommendations, 
  storeRecommendationsBundle 
} from '@/lib/analytics/recommendation-generator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const subjectId = searchParams.get('subjectId') || undefined

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    // Generate comprehensive recommendations
    const bundle = await generateComprehensiveRecommendations(userId, subjectId)

    // Store recommendations in database
    await storeRecommendationsBundle(bundle)

    return NextResponse.json({
      success: true,
      data: bundle
    })

  } catch (error) {
    console.error('Error generating comprehensive recommendations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
