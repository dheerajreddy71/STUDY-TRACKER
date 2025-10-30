import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"
import { calculateDashboardStats } from "@/lib/analytics"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || request.headers.get("x-user-id") || "demo-user"

    const sessions = await database.getSessions(userId)
    const performance = await database.getPerformance(userId)

    // Calculate simple stats directly instead of using calculateDashboardStats
    const totalMinutes = sessions.reduce((sum: number, s: any) => sum + (s.actual_duration_minutes || s.duration_minutes || 0), 0)
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10
    const avgFocus = sessions.length > 0
      ? Math.round((sessions.reduce((sum: number, s: any) => sum + (s.average_focus_score || 0), 0) / sessions.length) * 10) / 10
      : 0
    const avgPerformance = performance.length > 0
      ? Math.round((performance.reduce((sum: number, p: any) => sum + (p.percentage || 0), 0) / performance.length) * 10) / 10
      : 0

    const stats = {
      totalStudyHours: totalHours,
      totalSessions: sessions.length,
      averageFocusScore: avgFocus,
      averagePerformance: avgPerformance,
      currentStreak: 0, // Would need streak calculation
      weeklyStudyTime: Array(7).fill(0),
      subjectBreakdown: {}
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
