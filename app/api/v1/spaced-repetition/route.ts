/**
 * Spaced Repetition API
 * Manage review schedules and forgetting curves
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getItemsDueForReview,
  getReviewSchedule,
  getTopicsAtRisk,
  recordReview,
  createSpacedRepetitionItem,
  generateReviewReminders
} from '@/lib/analytics/spaced-repetition'

/**
 * GET /api/v1/spaced-repetition
 * Get items due for review
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const subjectId = searchParams.get('subjectId') || undefined
    const action = searchParams.get('action') || 'due'
    const days = parseInt(searchParams.get('days') || '7')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    let data: any

    switch (action) {
      case 'due':
        data = await getItemsDueForReview(userId, subjectId)
        break
      
      case 'schedule':
        const schedule = await getReviewSchedule(userId, days)
        data = Object.fromEntries(schedule)
        break
      
      case 'at-risk':
        const threshold = parseInt(searchParams.get('threshold') || '60')
        data = await getTopicsAtRisk(userId, threshold)
        break
      
      case 'reminders':
        data = await generateReviewReminders(userId)
        break
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error fetching spaced repetition data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch review data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/spaced-repetition
 * Create new item or record review
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    if (action === 'create') {
      const { userId, subjectId, topicName, confidence, difficultyLevel, chapterReference } = data

      if (!userId || !subjectId || !topicName || !confidence) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        )
      }

      const item = await createSpacedRepetitionItem(
        userId,
        subjectId,
        topicName,
        confidence,
        difficultyLevel || 3,
        chapterReference
      )

      return NextResponse.json({
        success: true,
        data: item
      })

    } else if (action === 'review') {
      const { itemId, confidence, timeSpent, result } = data

      if (!itemId || !confidence || !timeSpent || !result) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        )
      }

      await recordReview(itemId, confidence, timeSpent, result)

      return NextResponse.json({
        success: true,
        message: 'Review recorded successfully'
      })

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error in spaced repetition operation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Operation failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
