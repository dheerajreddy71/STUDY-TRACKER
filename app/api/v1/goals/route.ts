import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "guest-user"
    const goals = await database.getGoals(userId)

    return NextResponse.json({ success: true, data: goals })
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch goals" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId || "guest-user"

    const goal: any = await database.createGoal({
      userId,
      subjectId: body.subjectId || null,
      goalName: body.goalName,
      goalDescription: body.goalDescription,
      goalType: body.goalType || 'custom',
      goalCategory: body.goalCategory || 'weekly',
      targetValue: body.targetValue,
      metricName: body.unit || 'units',
      deadline: body.targetCompletionDate,
      currentValue: body.currentValue || 0,
      priorityLevel: body.priorityLevel,
      importanceReason: body.importanceReason,
      motivationStatement: body.motivationStatement,
      trackAutomatically: body.trackAutomatically,
      sendReminders: body.sendReminders,
    })

    await database.logAction(userId, "create_goal", "goal", goal.id)

    return NextResponse.json({ success: true, data: goal })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create goal" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, userId, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Goal ID required" },
        { status: 400 }
      )
    }

    const goal = await database.updateGoal(id, updates)
    await database.logAction(userId || "guest-user", "update_goal", "goal", id)

    return NextResponse.json({ success: true, data: goal })
  } catch (error) {
    console.error("Error updating goal:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update goal" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId") || "guest-user"

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Goal ID required" },
        { status: 400 }
      )
    }

    await database.deleteGoal(id)
    await database.logAction(userId, "delete_goal", "goal", id)

    return NextResponse.json({ success: true, message: "Goal deleted successfully" })
  } catch (error) {
    console.error("Error deleting goal:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete goal" },
      { status: 500 }
    )
  }
}
