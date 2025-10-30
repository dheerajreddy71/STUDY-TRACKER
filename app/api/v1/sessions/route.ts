import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || request.headers.get("x-user-id") || "guest-user"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const sessions = await database.getSessions(userId, limit, offset)

    return NextResponse.json({
      success: true,
      data: sessions,
      total: sessions.length,
      hasMore: sessions.length === limit,
    })
  } catch (error) {
    console.error("GET /api/v1/sessions error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch sessions" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, subjectId, studyMethod, sessionGoal, location, targetDurationMinutes } = body

    if (!userId || !subjectId) {
      return NextResponse.json({ 
        success: false,
        error: "Missing required fields: userId and subjectId" 
      }, { status: 400 })
    }

    const session = await database.createSession({
      userId,
      subjectId,
      studyMethod: studyMethod || "reading",
      sessionGoal: sessionGoal || "",
      location: location || "",
      targetDurationMinutes: targetDurationMinutes || 60,
      startedAt: new Date()
    })

    return NextResponse.json({ 
      success: true,
      data: session 
    }, { status: 201 })
  } catch (error) {
    console.error("POST /api/v1/sessions error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to create session" 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      sessionId, 
      // Core ratings
      focusRating, productivityRating, retentionRating, effortRating, 
      difficultyRating, engagementRating, satisfactionRating,
      // Progress
      actualDurationMinutes, accomplishments, goalAchieved, goalsAchievedPercentage,
      topicsFullyUnderstood, topicsNeedReview, pagesCompleted, problemsCompleted,
      // Quality reflection
      whatWentWell, whatDidntGoWell, keyConceptsLearned, difficultiesEncountered, questionsToResearch,
      // Method effectiveness
      methodEffective, betterMethodSuggestion,
      // Distractions
      mainDistractionSource, distractionImpact, distractionLog, totalDistractionTime,
      // State
      energyLevelAfter, confidenceLevel,
      // Next steps
      actionItems, topicsForReview, nextSessionFocus, scheduleNextSession,
      // Overall
      completionNotes, challenges, sessionTags
    } = body
    
    if (!sessionId) {
      return NextResponse.json({ 
        success: false,
        error: "Session ID required" 
      }, { status: 400 })
    }

    const session = await database.endSession(sessionId, {
      actualDurationMinutes: actualDurationMinutes || 0,
      averageFocusScore: focusRating || 5,
      goalAchieved: goalAchieved || "partial",
      accomplishments: accomplishments || "",
      challenges: challenges ? (Array.isArray(challenges) ? challenges : [challenges]) : [],
      notes: completionNotes || "",
      // Add all comprehensive fields
      focusRating: focusRating || null,
      productivityRating: productivityRating || null,
      retentionRating: retentionRating || null,
      effortRating: effortRating || null,
      difficultyRating: difficultyRating || null,
      engagementRating: engagementRating || null,
      satisfactionRating: satisfactionRating || null,
      goalsAchievedPercentage: goalsAchievedPercentage || null,
      topicsFullyUnderstood: topicsFullyUnderstood || null,
      topicsNeedReview: topicsNeedReview || null,
      pagesCompleted: pagesCompleted || null,
      problemsCompleted: problemsCompleted || null,
      whatWentWell: whatWentWell || null,
      whatDidntGoWell: whatDidntGoWell || null,
      keyConceptsLearned: keyConceptsLearned || null,
      difficultiesEncountered: difficultiesEncountered || null,
      questionsToResearch: questionsToResearch || null,
      methodEffective: methodEffective || null,
      betterMethodSuggestion: betterMethodSuggestion || null,
      mainDistractionSource: mainDistractionSource || null,
      distractionImpact: distractionImpact || null,
      energyLevelAfter: energyLevelAfter || null,
      confidenceLevel: confidenceLevel || null,
      actionItems: actionItems || null,
      topicsForReview: topicsForReview || null,
      nextSessionFocus: nextSessionFocus || null,
      scheduleNextSession: scheduleNextSession ? 1 : 0,
      overallNotes: completionNotes || null,
      sessionTags: sessionTags || null
    })

    return NextResponse.json({ 
      success: true,
      data: session,
      message: "Session ended successfully" 
    })
  } catch (error) {
    console.error("DELETE /api/v1/sessions error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to end session" 
    }, { status: 500 })
  }
}
