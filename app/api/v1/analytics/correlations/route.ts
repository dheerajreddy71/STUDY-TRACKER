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

    // Correlate study methods with performance
    const methodPerformance: Record<string, number[]> = {}
    sessions.forEach((session: any) => {
      const linkedPerf = performance.find((p: any) => p.linked_session_id === session.id)
      if (linkedPerf) {
        if (!methodPerformance[session.study_method]) {
          methodPerformance[session.study_method] = []
        }
        methodPerformance[session.study_method].push(linkedPerf.percentage)
      }
    })

    const methodCorrelations = Object.entries(methodPerformance).map(([method, scores]) => ({
      method,
      averagePerformance: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      sessionCount: scores.length,
      effectiveness: scores.reduce((a, b) => a + b, 0) / scores.length > 75 ? "high" : "medium",
    }))

    // Correlate study time with performance
    const timePerformance: Record<number, number[]> = {}
    sessions.forEach((session: any) => {
      const hour = new Date(session.started_at).getHours()
      const linkedPerf = performance.find((p: any) => p.linked_session_id === session.id)
      if (linkedPerf) {
        if (!timePerformance[hour]) {
          timePerformance[hour] = []
        }
        timePerformance[hour].push(linkedPerf.percentage)
      }
    })

    const timeCorrelations = Object.entries(timePerformance).map(([hour, scores]) => ({
      hour: Number.parseInt(hour),
      averagePerformance: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      sessionCount: scores.length,
    }))

    return NextResponse.json({
      methodCorrelations,
      timeCorrelations,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
