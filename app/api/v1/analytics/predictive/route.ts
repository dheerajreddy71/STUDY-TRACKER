import { database } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await database.getSessions(userId, 1000)
    const performance = await database.getPerformance(userId)

    // Predict performance trend
    const recentPerformance = performance.slice(0, 10)
    const performanceValues = recentPerformance.map((p: any) => p.percentage)
    const avgPerformance = performanceValues.reduce((a, b) => a + b, 0) / performanceValues.length || 0

    // Calculate trend
    let trend = "stable"
    if (performanceValues.length >= 2) {
      const recent = performanceValues.slice(0, 5).reduce((a, b) => a + b, 0) / 5
      const older = performanceValues.slice(5, 10).reduce((a, b) => a + b, 0) / 5
      if (recent > older + 5) trend = "improving"
      else if (recent < older - 5) trend = "declining"
    }

    // Predict study hours needed
    const totalHours = sessions.reduce((sum: number, s: any) => sum + (s.actual_duration_minutes || 0), 0) / 60
    const avgHoursPerSession = totalHours / (sessions.length || 1)
    const predictedHoursNeeded = Math.max(0, (100 - avgPerformance) / 10) * avgHoursPerSession

    // Learning velocity
    const learningVelocity = sessions.length > 0 ? avgPerformance / (totalHours || 1) : 0

    return NextResponse.json({
      performanceTrend: trend,
      currentPerformance: Math.round(avgPerformance * 10) / 10,
      predictedHoursNeeded: Math.round(predictedHoursNeeded * 10) / 10,
      learningVelocity: Math.round(learningVelocity * 100) / 100,
      recommendation:
        trend === "declining"
          ? "Your performance is declining. Consider increasing study time or trying different methods."
          : trend === "improving"
            ? "Great progress! Keep up the momentum."
            : "Your performance is stable. Try new study methods to improve further.",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
