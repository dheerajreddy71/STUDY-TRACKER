/**
 * Subject Allocation API
 * Get optimal time distribution across subjects
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  generateAllocationPlan,
  getSubjectPriorities,
  getNeglectedSubjects
} from '@/lib/analytics/subject-allocator'

/**
 * GET /api/v1/subject-allocation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const availableHours = parseFloat(searchParams.get('hours') || '20')
    const action = searchParams.get('action') || 'plan'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    let data: any

    switch (action) {
      case 'plan':
        data = await generateAllocationPlan(userId, availableHours)
        break
      
      case 'priorities':
        data = await getSubjectPriorities(userId)
        break
      
      case 'neglected':
        const daysThreshold = parseInt(searchParams.get('days') || '5')
        data = await getNeglectedSubjects(userId, daysThreshold)
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
    console.error('Error generating subject allocation:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate allocation plan',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
