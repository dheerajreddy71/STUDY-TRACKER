import { database } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || request.headers.get("x-user-id")
    const days = request.nextUrl.searchParams.get("days") || "30"

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await database.getSessions(userId, 1000)
    const daysNum = Number.parseInt(days)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysNum)

    const recentSessions = sessions.filter((s: any) => new Date(s.started_at) >= cutoffDate)

    // Group by date
    const dailyData: Record<string, { hours: number; sessions: number; avgFocus: number }> = {}

    recentSessions.forEach((session: any) => {
      const date = session.started_at.split("T")[0]
      if (!dailyData[date]) {
        dailyData[date] = { hours: 0, sessions: 0, avgFocus: 0 }
      }
      dailyData[date].hours += (session.actual_duration_minutes || 0) / 60
      dailyData[date].sessions += 1
      dailyData[date].avgFocus += session.average_focus_score || 0
    })

    // Calculate averages
    const trendData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      hours: Math.round(data.hours * 10) / 10,
      sessions: data.sessions,
      avgFocus: Math.round((data.avgFocus / data.sessions) * 10) / 10,
    }))

    return NextResponse.json(trendData)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
