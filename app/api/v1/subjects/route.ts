import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || request.headers.get("x-user-id") || "guest-user"
    
    const subjects = await database.getSubjects(userId)

    return NextResponse.json({ 
      success: true,
      data: subjects 
    })
  } catch (error) {
    console.error("GET /api/v1/subjects error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch subjects" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, name, subjectCode, category, difficultyLevel, priorityLevel, priorityReason,
      subjectDescription, colorTheme, targetWeeklyHours, minHoursPerWeek, 
      recommendedSessionDuration, preferredStudyMethod, currentPerformance, 
      targetPerformance, baselinePerformance, nextExamDate, examType, examWeightage,
      examPreparationStatus, totalChapters, completedChapters, currentChapter,
      textbookName, textbookEdition, onlineResources, videoCourseLinks,
      studyMaterialsLocation, classSchedule, studyStrategyNotes, notes
    } = body

    if (!userId || !name) {
      return NextResponse.json({ 
        success: false,
        error: "Missing required fields: userId and name" 
      }, { status: 400 })
    }

    // Map subject name to category if not provided
    const getCategoryFromName = (subjectName: string): string => {
      const lowerName = subjectName.toLowerCase()
      if (lowerName.includes('math') || lowerName.includes('algebra') || lowerName.includes('calculus') || lowerName.includes('geometry')) {
        return 'mathematics'
      }
      if (lowerName.includes('physics') || lowerName.includes('chemistry') || lowerName.includes('biology') || lowerName.includes('science')) {
        return 'science'
      }
      if (lowerName.includes('english') || lowerName.includes('spanish') || lowerName.includes('french') || lowerName.includes('language')) {
        return 'language'
      }
      if (lowerName.includes('history') || lowerName.includes('geography') || lowerName.includes('social') || lowerName.includes('economics')) {
        return 'social_studies'
      }
      if (lowerName.includes('computer') || lowerName.includes('programming') || lowerName.includes('engineering') || lowerName.includes('technical')) {
        return 'technical'
      }
      return 'other'
    }

    const subject = await database.createSubject({
      userId,
      name,
      subjectCode: subjectCode || null,
      category: category || getCategoryFromName(name),
      difficultyLevel: difficultyLevel || "medium",
      priorityLevel: priorityLevel || "medium",
      priorityReason: priorityReason || null,
      subjectDescription: subjectDescription || null,
      colorTheme: colorTheme || "blue",
      targetWeeklyHours: targetWeeklyHours || 5,
      minHoursPerWeek: minHoursPerWeek || null,
      recommendedSessionDuration: recommendedSessionDuration || 45,
      preferredStudyMethod: preferredStudyMethod || null,
      currentPerformance: currentPerformance || 0,
      targetPerformance: targetPerformance || 100,
      baselinePerformance: baselinePerformance || null,
      nextExamDate: nextExamDate || null,
      examType: examType || null,
      examWeightage: examWeightage || null,
      examPreparationStatus: examPreparationStatus || "not_started",
      totalChapters: totalChapters || null,
      completedChapters: completedChapters || 0,
      currentChapter: currentChapter || null,
      textbookName: textbookName || null,
      textbookEdition: textbookEdition || null,
      onlineResources: onlineResources || null,
      videoCourseLinks: videoCourseLinks || null,
      studyMaterialsLocation: studyMaterialsLocation || null,
      classSchedule: classSchedule || null,
      studyStrategyNotes: studyStrategyNotes || null,
      notes: notes || null
    })

    return NextResponse.json({ 
      success: true,
      data: subject 
    }, { status: 201 })
  } catch (error) {
    console.error("POST /api/v1/subjects error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to create subject" 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, subjectName, difficultyLevel, targetScore, color } = body

    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: "Subject ID required" 
      }, { status: 400 })
    }

    const updates: any = {}
    if (subjectName) updates.name = subjectName
    if (difficultyLevel) updates.difficulty_level = difficultyLevel
    if (targetScore) {
      updates.target_grade = targetScore
      updates.current_grade = targetScore
    }
    if (color) updates.color_theme = color

    const subject = await database.updateSubject(id, updates)

    return NextResponse.json({ 
      success: true,
      data: subject 
    })
  } catch (error) {
    console.error("PUT /api/v1/subjects error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to update subject" 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ 
        success: false,
        error: "Subject ID required" 
      }, { status: 400 })
    }

    await database.deleteSubject(id)

    return NextResponse.json({ 
      success: true,
      message: "Subject deleted successfully" 
    })
  } catch (error) {
    console.error("DELETE /api/v1/subjects error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to delete subject" 
    }, { status: 500 })
  }
}
