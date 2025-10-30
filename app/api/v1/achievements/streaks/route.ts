import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "guest-user"
    const subjectId = request.nextUrl.searchParams.get("subjectId") || undefined

    // Calculate and update streak from actual session data
    const streak = await database.calculateAndUpdateStreak(userId, subjectId)

    return NextResponse.json({ success: true, data: streak })
  } catch (error) {
    console.error("Error fetching streak:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch streak" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const streak = await database.updateStreak(id, updates)

    return NextResponse.json({ success: true, data: streak })
  } catch (error) {
    console.error("Error updating streak:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update streak" },
      { status: 500 }
    )
  }
}
