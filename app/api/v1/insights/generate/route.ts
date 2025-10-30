import { database } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await database.getSessions(userId, 1000)
    const performance = await database.getPerformance(userId)
    const subjects = await database.getSubjects(userId)

    const insights = []

    // Insight 1: Best performing subject
    if (performance.length > 0) {
      const subjectPerformance: Record<string, number[]> = {}
      performance.forEach((p: any) => {
        if (!subjectPerformance[p.subject_id]) {
          subjectPerformance[p.subject_id] = []
        }
        subjectPerformance[p.subject_id].push(p.percentage)
      })

      let bestSubject = ""
      let bestAvg = 0
      Object.entries(subjectPerformance).forEach(([subjectId, scores]) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length
        if (avg > bestAvg) {
          bestAvg = avg
          bestSubject = subjectId
        }
      })

      if (bestSubject) {
        const subject = subjects.find((s: any) => s.id === bestSubject)
        insights.push({
          insightType: "recommendation",
          title: "Your Strongest Subject",
          description: `You're performing best in ${subject?.name} with an average score of ${bestAvg.toFixed(1)}%`,
          dataJson: { subjectId: bestSubject, averageScore: bestAvg },
          confidenceLevel: 0.95,
        })
      }
    }

    // Insight 2: Study consistency
    if (sessions.length > 0) {
      const today = new Date()
      let streak = 0
      const checkDate = new Date(today)

      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split("T")[0]
        const hasSession = sessions.some((s: any) => s.started_at.split("T")[0] === dateStr)

        if (hasSession) {
          streak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }

      if (streak > 0) {
        insights.push({
          insightType: "achievement",
          title: `${streak} Day Study Streak!`,
          description: `You've been studying consistently for ${streak} days. Keep it up!`,
          dataJson: { streakDays: streak },
          confidenceLevel: 1.0,
        })
      }
    }

    // Insight 3: Recommended study time
    if (sessions.length > 5) {
      const hourlyData: Record<number, number> = {}
      sessions.forEach((s: any) => {
        const hour = new Date(s.started_at).getHours()
        hourlyData[hour] = (hourlyData[hour] || 0) + (s.average_focus_score || 0)
      })

      let bestHour = 0
      let bestScore = 0
      Object.entries(hourlyData).forEach(([hour, score]) => {
        if (score > bestScore) {
          bestScore = score
          bestHour = Number.parseInt(hour)
        }
      })

      insights.push({
        insightType: "recommendation",
        title: "Your Peak Study Time",
        description: `You focus best around ${bestHour}:00. Try scheduling important sessions then.`,
        dataJson: { peakHour: bestHour },
        confidenceLevel: 0.85,
      })
    }

    // Save insights
    for (const insight of insights) {
      await database.createInsight({
        userId,
        ...insight,
      })
    }

    return NextResponse.json(insights)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
