import { type NextRequest, NextResponse } from "next/server"
import { createPerformanceSchema } from "@/lib/validators"
import { database } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || request.headers.get("x-user-id") || "demo-user"
    const subjectId = request.nextUrl.searchParams.get("subjectId")

    let entries
    if (subjectId) {
      entries = await database.getPerformanceBySubject(userId, subjectId)
    } else {
      entries = await database.getPerformance(userId)
    }

    return NextResponse.json({
      success: true,
      data: entries,
      total: entries.length,
    })
  } catch (error) {
    console.error("[v0] Get performance error:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch performance entries" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validated = createPerformanceSchema.parse(body)
    const userId = body.userId || request.headers.get("x-user-id") || "guest-user"

    // Verify user exists
    const user = await database.getUser(userId)
    if (!user) {
      console.error("[Performance API] User not found:", userId)
      return NextResponse.json({ 
        success: false, 
        error: "User not found. Please log in again." 
      }, { status: 401 })
    }

    // Verify subject exists
    const subject = await database.getSubject(validated.subjectId)
    if (!subject) {
      console.error("[Performance API] Subject not found:", validated.subjectId)
      return NextResponse.json({ 
        success: false, 
        error: "Subject not found. Please select a valid subject." 
      }, { status: 400 })
    }

    const entry = await database.createPerformance({
      userId,
      subjectId: validated.subjectId,
      entryType: validated.entryType,
      score: validated.score,
      totalPossible: validated.totalPossible,
      assessmentDate: new Date(validated.assessmentDate),
      
      // Assessment Identification
      assessmentTitle: validated.assessmentTitle,
      assessmentType: validated.assessmentType,
      assessmentIdNumber: validated.assessmentIdNumber,
      assessmentTime: validated.assessmentTime,
      dateReceivedResults: validated.dateReceivedResults ? new Date(validated.dateReceivedResults) : undefined,
      
      // Score Details
      percentage: validated.percentage,
      grade: validated.grade,
      scoreFormat: validated.scoreFormat,
      assessmentWeight: validated.assessmentWeight,
      importanceLevel: validated.importanceLevel,
      countsTowardFinal: validated.countsTowardFinal,
      
      // Class Context
      classAverage: validated.classAverage,
      highestScore: validated.highestScore,
      lowestScore: validated.lowestScore,
      yourRank: validated.yourRank,
      percentile: validated.percentile,
      totalStudents: validated.totalStudents,
      
      // Content Coverage
      chaptersCovered: validated.chaptersCovered,
      topicsTested: validated.topicsTested,
      totalQuestions: validated.totalQuestions,
      questionsCorrect: validated.questionsCorrect,
      topicBreakdown: validated.topicBreakdown,
      
      // Time Information
      timeAllocatedMinutes: validated.timeAllocatedMinutes,
      timeTakenMinutes: validated.timeTakenMinutes,
      timePressureLevel: validated.timePressureLevel,
      
      // Preparation Information
      totalHoursStudied: validated.totalHoursStudied,
      daysOfPreparation: validated.daysOfPreparation,
      preparationStartDate: validated.preparationStartDate ? new Date(validated.preparationStartDate) : undefined,
      studyMethodsUsed: validated.studyMethodsUsed,
      preparationQuality: validated.preparationQuality,
      
      // Linked Sessions
      linkedSessionIds: validated.linkedSessionIds,
      totalLinkedStudyHours: validated.totalLinkedStudyHours,
      averageLinkedFocus: validated.averageLinkedFocus,
      
      // Pre-Assessment State
      confidenceBefore: validated.confidenceBefore,
      feltPrepared: validated.feltPrepared,
      expectedScoreMin: validated.expectedScoreMin,
      expectedScoreMax: validated.expectedScoreMax,
      sleepNightBefore: validated.sleepNightBefore,
      stressLevelBefore: validated.stressLevelBefore,
      healthStatus: validated.healthStatus,
      otherFactors: validated.otherFactors,
      
      // Post-Assessment Reflection
      scoreVsExpectation: validated.scoreVsExpectation,
      scoreSurpriseLevel: validated.scoreSurpriseLevel,
      confidenceAfterTaking: validated.confidenceAfterTaking,
      confidenceAfterResults: validated.confidenceAfterResults,
      scoreReflectsKnowledge: validated.scoreReflectsKnowledge,
      
      // Performance Analysis
      strengthsTopics: validated.strengthsTopics,
      strengthsQuestionTypes: validated.strengthsQuestionTypes,
      whatHelpedSucceed: validated.whatHelpedSucceed,
      weaknessesTopics: validated.weaknessesTopics,
      weaknessesQuestionTypes: validated.weaknessesQuestionTypes,
      commonMistakes: validated.commonMistakes,
      conceptsStillUnclear: validated.conceptsStillUnclear,
      
      // Detailed Analysis
      questionsMissedBreakdown: validated.questionsMissedBreakdown,
      
      // Learning Insights
      lessonsLearned: validated.lessonsLearned,
      whatToDoDifferently: validated.whatToDoDifferently,
      mostEffectiveStudyApproach: validated.mostEffectiveStudyApproach,
      leastEffectiveStudyApproach: validated.leastEffectiveStudyApproach,
      
      // Next Steps
      topicsToReview: validated.topicsToReview,
      conceptsNeedingRelearning: validated.conceptsNeedingRelearning,
      actionPlan: validated.actionPlan,
      targetScoreNext: validated.targetScoreNext,
      specificSkillsToWorkOn: validated.specificSkillsToWorkOn,
      studyApproachChanges: validated.studyApproachChanges,
      
      // Tags & Notes
      assessmentTags: validated.assessmentTags,
      overallNotes: validated.overallNotes,
      instructorFeedback: validated.instructorFeedback,
      peerComparisonNotes: validated.peerComparisonNotes,
      personalReflection: validated.personalReflection,
      
      // Legacy fields for backward compatibility
      assessmentName: validated.assessmentName,
      linkedSessionId: validated.linkedSessionId,
    }) as any

    await database.logAction(userId, "performance_logged", "performance_entry", entry.id)

    return NextResponse.json({ success: true, data: entry }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create performance error:", error)
    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
        details: (error as any).issues 
      }, { status: 400 })
    }
    if (error instanceof Error && 'code' in error && (error as any).code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return NextResponse.json({ 
        success: false, 
        error: "Database constraint error. The user or subject may not exist." 
      }, { status: 400 })
    }
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create performance entry" 
    }, { status: 400 })
  }
}
