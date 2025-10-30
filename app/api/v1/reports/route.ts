import { database } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reports = await database.getReports(userId)
    return NextResponse.json(reports)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const startDate = new Date(body.startDate)
    const endDate = new Date(body.endDate)

    const sessions = await database.getSessions(userId, 1000)
    const performance = await database.getPerformance(userId)

    const filteredSessions = sessions.filter((s: any) => {
      const date = new Date(s.started_at)
      return date >= startDate && date <= endDate
    })

    const totalStudyHours =
      filteredSessions.reduce((sum: number, s: any) => sum + (s.actual_duration_minutes || 0), 0) / 60
    const sessionsCount = filteredSessions.length
    const subjectsStudied = [...new Set(filteredSessions.map((s: any) => s.subject_id))]

    const report = await database.createReport({
      userId,
      reportType: body.reportType || "custom",
      startDate,
      endDate,
      totalStudyHours,
      sessionsCount,
      reportData: {
        averageFocusScore:
          filteredSessions.length > 0
            ? filteredSessions.reduce((sum: number, s: any) => sum + (s.average_focus_score || 0), 0) /
              filteredSessions.length
            : 0,
        subjectsCount: subjectsStudied.length,
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
