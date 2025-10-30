/**
 * Learning Profile API
 * Generate and retrieve learning style analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  generateLearningProfile,
  getLearningProfile,
  getMethodRecommendations
} from '@/lib/analytics/learning-style-classifier'

/**
 * GET /api/v1/learning-profile
 * Get existing learning profile
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const includeRecommendations = searchParams.get('recommendations') === 'true'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    let profile = await getLearningProfile(userId)

    // If no profile exists or it's old, generate new one
    if (!profile || (new Date().getTime() - new Date(profile.lastUpdated).getTime()) > 7 * 24 * 60 * 60 * 1000) {
      profile = await generateLearningProfile(userId)
    }

    const response: any = {
      success: true,
      data: profile
    }

    if (includeRecommendations && profile) {
      response.data.methodRecommendations = getMethodRecommendations(profile)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching learning profile:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch learning profile',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/learning-profile
 * Generate new learning profile
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    const profile = await generateLearningProfile(userId)

    return NextResponse.json({
      success: true,
      data: {
        profile,
        methodRecommendations: getMethodRecommendations(profile)
      }
    })

  } catch (error) {
    console.error('Error generating learning profile:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate learning profile',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
