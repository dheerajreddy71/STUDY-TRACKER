import { database } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await database.getSessions(userId, 1000)
    const performance = await database.getPerformance(userId)
    const goals = await database.getGoals(userId)
    const achievements = await database.getAchievements(userId)

    const totalStudyHours = sessions.reduce((sum: number, s: any) => sum + (s.actual_duration_minutes || 0), 0) / 60
    const totalSessions = sessions.length
    const averageFocusScore =
      sessions.length > 0
        ? sessions.reduce((sum: number, s: any) => sum + (s.average_focus_score || 0), 0) / sessions.length
        : 0

    const averagePerformance =
      performance.length > 0
        ? performance.reduce((sum: number, p: any) => sum + p.percentage, 0) / performance.length
        : 0

    const completedGoals = goals.filter((g: any) => g.is_completed).length
    const totalAchievements = achievements.length

    // Calculate streak
    const today = new Date()
    let currentStreak = 0
    const checkDate = new Date(today)

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0]
      const hasSession = sessions.some((s: any) => s.started_at.split("T")[0] === dateStr)

      if (hasSession) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return NextResponse.json({
      totalStudyHours: Math.round(totalStudyHours * 10) / 10,
      totalSessions,
      averageFocusScore: Math.round(averageFocusScore * 10) / 10,
      averagePerformance: Math.round(averagePerformance * 10) / 10,
      completedGoals,
      totalAchievements,
      currentStreak,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
