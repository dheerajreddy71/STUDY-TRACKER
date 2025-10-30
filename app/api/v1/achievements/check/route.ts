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
    const achievements = await database.getAchievements(userId)
    const existingAchievementNames = achievements.map((a: any) => a.achievement_name)

    const newAchievements = []

    // Achievement: First Session
    if (sessions.length === 1 && !existingAchievementNames.includes("First Session")) {
      const achievement = await database.createAchievement({
        userId,
        achievementType: "milestone",
        achievementName: "First Session",
        description: "Completed your first study session",
        badgeIcon: "🎯",
      })
      newAchievements.push(achievement)
    }

    // Achievement: 10 Sessions
    if (sessions.length >= 10 && !existingAchievementNames.includes("10 Sessions")) {
      const achievement = await database.createAchievement({
        userId,
        achievementType: "milestone",
        achievementName: "10 Sessions",
        description: "Completed 10 study sessions",
        badgeIcon: "🔟",
      })
      newAchievements.push(achievement)
    }

    // Achievement: 50 Sessions
    if (sessions.length >= 50 && !existingAchievementNames.includes("50 Sessions")) {
      const achievement = await database.createAchievement({
        userId,
        achievementType: "milestone",
        achievementName: "50 Sessions",
        description: "Completed 50 study sessions",
        badgeIcon: "🏆",
      })
      newAchievements.push(achievement)
    }

    // Achievement: 100 Hours
    const totalHours = sessions.reduce((sum: number, s: any) => sum + (s.actual_duration_minutes || 0), 0) / 60
    if (totalHours >= 100 && !existingAchievementNames.includes("100 Hours")) {
      const achievement = await database.createAchievement({
        userId,
        achievementType: "milestone",
        achievementName: "100 Hours",
        description: "Studied for 100+ hours",
        badgeIcon: "⏰",
      })
      newAchievements.push(achievement)
    }

    // Achievement: Perfect Score
    const perfectScores = performance.filter((p: any) => p.percentage === 100)
    if (perfectScores.length > 0 && !existingAchievementNames.includes("Perfect Score")) {
      const achievement = await database.createAchievement({
        userId,
        achievementType: "performance",
        achievementName: "Perfect Score",
        description: "Achieved a perfect score on an assessment",
        badgeIcon: "💯",
      })
      newAchievements.push(achievement)
    }

    // Achievement: High Performer
    const avgPerformance =
      performance.length > 0
        ? performance.reduce((sum: number, p: any) => sum + p.percentage, 0) / performance.length
        : 0
    if (avgPerformance >= 90 && !existingAchievementNames.includes("High Performer")) {
      const achievement = await database.createAchievement({
        userId,
        achievementType: "performance",
        achievementName: "High Performer",
        description: "Maintained 90%+ average performance",
        badgeIcon: "⭐",
      })
      newAchievements.push(achievement)
    }

    return NextResponse.json(newAchievements)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
