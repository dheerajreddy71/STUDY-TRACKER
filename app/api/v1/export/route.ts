import { database } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || request.headers.get("x-user-id") || "guest-user"

    const user: any = await database.getUser(userId)
    const subjects = await database.getSubjects(userId)
    const sessions = await database.getSessions(userId, 10000)
    const performance = await database.getPerformance(userId)
    const goals = await database.getGoals(userId)
    const achievements = await database.getAchievements(userId)

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user?.id || userId,
        email: user?.email || "guest@example.com",
        name: user?.name || "Guest User",
      },
      subjects,
      sessions,
      performance,
      goals,
      achievements,
    }

    return NextResponse.json({
      success: true,
      data: exportData
    })
  } catch (error: any) {
    console.error("Export error:", error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}
