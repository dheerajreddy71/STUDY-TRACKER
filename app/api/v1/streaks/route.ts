import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

// GET /api/v1/streaks - Get all streaks for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    const type = request.nextUrl.searchParams.get("type")
    const subjectId = request.nextUrl.searchParams.get("subjectId")
    
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    // If type and optionally subjectId are provided, get specific streak
    if (type) {
      const streak = await database.getStreak(userId, type, subjectId || undefined)
      return NextResponse.json(streak || {})
    }

    // Otherwise get all streaks
    const streaks = await database.getStreaks(userId)
    return NextResponse.json(streaks)
  } catch (error) {
    console.error("Error fetching streaks:", error)
    return NextResponse.json({ error: "Failed to fetch streaks" }, { status: 500 })
  }
}

// PUT /api/v1/streaks - Update a streak
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, streakType, subjectId } = body

    if (!userId || !streakType) {
      return NextResponse.json({ error: "userId and streakType are required" }, { status: 400 })
    }

    const newStreakCount = await database.updateStreak(userId, streakType, subjectId || undefined)

    return NextResponse.json({ success: true, currentStreak: newStreakCount })
  } catch (error) {
    console.error("Error updating streak:", error)
    return NextResponse.json({ error: "Failed to update streak" }, { status: 500 })
  }
}
