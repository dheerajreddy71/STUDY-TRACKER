import { database } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subjects = await database.getSubjects(userId)
    const sessions = await database.getSessions(userId, 1000)
    const performance = await database.getPerformance(userId)

    const subjectBreakdown = subjects.map((subject: any) => {
      const subjectSessions = sessions.filter((s: any) => s.subject_id === subject.id)
      const subjectPerformance = performance.filter((p: any) => p.subject_id === subject.id)

      const totalHours = subjectSessions.reduce((sum: number, s: any) => sum + (s.actual_duration_minutes || 0), 0) / 60
      const avgFocus =
        subjectSessions.length > 0
          ? subjectSessions.reduce((sum: number, s: any) => sum + (s.average_focus_score || 0), 0) /
            subjectSessions.length
          : 0
      const avgPerformance =
        subjectPerformance.length > 0
          ? subjectPerformance.reduce((sum: number, p: any) => sum + p.percentage, 0) / subjectPerformance.length
          : 0

      return {
        id: subject.id,
        name: subject.name,
        color: subject.color_theme,
        totalHours: Math.round(totalHours * 10) / 10,
        sessionCount: subjectSessions.length,
        avgFocus: Math.round(avgFocus * 10) / 10,
        avgPerformance: Math.round(avgPerformance * 10) / 10,
      }
    })

    return NextResponse.json(subjectBreakdown)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
