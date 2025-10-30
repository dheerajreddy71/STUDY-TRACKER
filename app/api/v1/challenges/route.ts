import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

// GET /api/v1/challenges - Get all challenges for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    const status = request.nextUrl.searchParams.get("status")
    
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const challenges = await database.getChallenges(userId, status || undefined)
    return NextResponse.json(challenges)
  } catch (error) {
    console.error("Error fetching challenges:", error)
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
  }
}

// POST /api/v1/challenges - Create a new challenge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const challenge = await database.createChallenge({
      userId: body.userId,
      challengeTitle: body.title,
      challengeDescription: body.description,
      challengeType: body.type,
      startDate: body.startDate,
      endDate: body.endDate,
      durationDays: body.durationDays || 0,
      challengeGoals: body.goals || [],
      xpReward: body.xpReward || 0,
      badgeReward: body.badgeReward,
      difficultyLevel: body.difficultyLevel || 'medium',
      progressTarget: body.progressTarget || 100
    })

    return NextResponse.json(challenge, { status: 201 })
  } catch (error) {
    console.error("Error creating challenge:", error)
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
  }
}

// PUT /api/v1/challenges - Update challenge progress
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, progressCurrent } = body

    if (!id || progressCurrent === undefined) {
      return NextResponse.json({ error: "id and progressCurrent are required" }, { status: 400 })
    }

    await database.updateChallengeProgress(id, progressCurrent)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating challenge:", error)
    return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 })
  }
}
