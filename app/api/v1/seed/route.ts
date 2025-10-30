import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const guestId = "guest-user"

    // Sample subjects
    const subjects = [
      { name: "Mathematics", category: "mathematics", difficultyLevel: "hard", colorTheme: "#3B82F6" },
      { name: "Physics", category: "science", difficultyLevel: "very_hard", colorTheme: "#8B5CF6" },
      { name: "English Literature", category: "language", difficultyLevel: "medium", colorTheme: "#10B981" },
      { name: "Computer Science", category: "technical", difficultyLevel: "medium", colorTheme: "#F59E0B" },
      { name: "History", category: "social_studies", difficultyLevel: "easy", colorTheme: "#EF4444" },
    ]

    const subjectIds: string[] = []
    for (const subject of subjects) {
      const created: any = await database.createSubject({
        userId: guestId,
        ...subject,
        currentGrade: 75,
        targetGrade: 85,
      })
      subjectIds.push(created.id)
    }

    // Sample sessions
    const now = new Date()
    const sessionIds: string[] = []
    const methods = ["reading", "practice_problems", "video_lecture", "notes", "flashcards"]
    
    for (let i = 0; i < 20; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - Math.floor(i / 3))
      date.setHours(9 + (i % 12), 0, 0, 0)
      
      const duration = 30 + Math.floor(Math.random() * 60)
      const focus = 6 + Math.floor(Math.random() * 4)
      
      const session: any = await database.createSession({
        userId: guestId,
        subjectId: subjectIds[i % subjectIds.length],
        studyMethod: methods[i % methods.length],
        sessionGoal: "Study session goal",
        location: "Home",
        targetDurationMinutes: 50,
        startedAt: date.toISOString(),
      })
      
      await database.endSession(session.id, {
        actualDurationMinutes: duration,
        averageFocusScore: focus,
        goalAchieved: duration >= 45 ? "yes" : "partial",
        notes: "Sample session notes",
      })
      
      sessionIds.push(session.id)
    }

    // Sample performance
    const performanceTypes = ["quiz", "test", "exam", "assignment"]
    for (let i = 0; i < 15; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - (i * 2))
      
      const score = 60 + Math.floor(Math.random() * 35)
      
      await database.createPerformance({
        userId: guestId,
        subjectId: subjectIds[i % subjectIds.length],
        entryType: performanceTypes[i % performanceTypes.length],
        score,
        totalPossible: 100,
        assessmentName: `Sample ${performanceTypes[i % performanceTypes.length]}`,
        assessmentDate: date.toISOString().split('T')[0],
      })
    }

    // Sample goals
    const goals = [
      { goalType: "study_hours", goalCategory: "weekly", targetValue: 20 },
      { goalType: "session_count", goalCategory: "weekly", targetValue: 10 },
      { goalType: "performance_average", goalCategory: "monthly", targetValue: 85 },
    ]

    for (const goal of goals) {
      await database.createGoal({
        userId: guestId,
        ...goal,
      })
    }

    // Sample achievements
    const achievements = [
      { achievementType: "streak", achievementName: "7-Day Streak", description: "Studied 7 days in a row", badgeIcon: "🔥" },
      { achievementType: "milestone", achievementName: "100 Hours", description: "Completed 100 study hours", badgeIcon: "⏱️" },
      { achievementType: "performance", achievementName: "Perfect Score", description: "Achieved 100% on an assessment", badgeIcon: "💯" },
    ]

    for (const ach of achievements) {
      await database.createAchievement({
        userId: guestId,
        ...ach,
      })
    }

    // Sample insights
    const insights = [
      {
        insightType: "pattern",
        title: "Morning Study Sessions",
        description: "You perform 25% better when studying in the morning (9-11 AM)",
        confidenceLevel: 0.85,
      },
      {
        insightType: "recommendation",
        title: "Break Frequency",
        description: "Consider taking breaks every 45 minutes for optimal focus",
        confidenceLevel: 0.78,
      },
    ]

    for (const insight of insights) {
      await database.createInsight({
        userId: guestId,
        ...insight,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        subjects: subjectIds.length,
        sessions: sessionIds.length,
        performance: 15,
        goals: goals.length,
        achievements: achievements.length,
        insights: insights.length,
      },
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    )
  }
}
