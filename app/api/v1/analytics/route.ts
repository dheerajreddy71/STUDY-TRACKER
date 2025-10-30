import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "guest-user"
    const period = request.nextUrl.searchParams.get("period") || "week"

    let fromDate, toDate
    const now = new Date()

    if (period === "week") {
      fromDate = startOfWeek(now, { weekStartsOn: 1 })
      toDate = endOfWeek(now, { weekStartsOn: 1 })
    } else if (period === "month") {
      fromDate = startOfMonth(now)
      toDate = endOfMonth(now)
    } else {
      fromDate = subDays(now, 30)
      toDate = now
    }

    const fromDateStr = format(fromDate, "yyyy-MM-dd HH:mm:ss")
    const toDateStr = format(toDate, "yyyy-MM-dd HH:mm:ss")

    const [studyStats, subjectStats, performanceStats, methodStats] = await Promise.all([
      database.getStudyStats(userId, fromDateStr, toDateStr),
      database.getSubjectStats(userId, fromDateStr, toDateStr),
      database.getPerformanceStats(userId, fromDateStr, toDateStr),
      database.getMethodStats(userId, fromDateStr, toDateStr),
    ])

    const analytics = {
      period,
      fromDate: format(fromDate, "yyyy-MM-dd"),
      toDate: format(toDate, "yyyy-MM-dd"),
      studyStats,
      subjectStats,
      performanceStats,
      methodStats,
    }

    return NextResponse.json({ success: true, data: analytics })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
