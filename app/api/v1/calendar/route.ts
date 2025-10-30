import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

// GET - Get calendar events for a date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!userId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "userId, startDate, and endDate are required" },
        { status: 400 }
      )
    }

    const events = await database.getCalendarEvents(userId, startDate, endDate)
    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    )
  }
}

// POST - Create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      eventType,
      title,
      description,
      subjectId,
      startDatetime,
      endDatetime,
      durationMinutes,
      allDay,
      isRecurring,
      recurrencePattern,
      recurrenceEndDate,
      studyPlanId,
      isFlexible,
      // Session Details
      sessionType,
      studyMethod,
      location,
      // Preparation & Tasks
      preparationRequired,
      difficulty,
      priority,
      // Linked Items
      linkedResourceIds,
      linkedGoalIds,
      // Reminders
      reminderEnabled,
      reminderMinutesBefore,
      notificationSent,
      // Pre/Post Tasks
      preSessionChecklist,
      postSessionTasks,
      // Additional Details
      notes,
      tags,
      color,
      // Status tracking
      status,
      completionStatus,
      actualStartTime,
      actualEndTime,
      cancellationReason,
    } = body

    // Validation
    if (!userId || !eventType || !title || !startDatetime) {
      return NextResponse.json(
        { error: "userId, eventType, title, and startDatetime are required" },
        { status: 400 }
      )
    }

    const event = await database.createCalendarEvent({
      userId,
      eventType,
      title,
      description,
      subjectId,
      startDatetime,
      endDatetime,
      durationMinutes,
      allDay,
      isRecurring,
      recurrencePattern,
      recurrenceEndDate,
      studyPlanId,
      isFlexible,
      // Session Details
      sessionType,
      studyMethod,
      location,
      // Preparation & Tasks
      preparationRequired,
      difficulty,
      priority,
      // Linked Items
      linkedResourceIds,
      linkedGoalIds,
      // Reminders
      reminderEnabled,
      reminderMinutesBefore,
      notificationSent,
      // Pre/Post Tasks
      preSessionChecklist,
      postSessionTasks,
      // Additional Details
      notes,
      tags,
      color,
      // Status tracking
      status,
      completionStatus,
      actualStartTime,
      actualEndTime,
      cancellationReason,
    })

    // Log action
    await database.logAction(
      userId,
      "create",
      "calendar_event",
      event.id,
      { details: `Created calendar event: ${title}` }
    )

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    )
  }
}

// PUT - Update a calendar event
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, userId, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Event id is required" }, { status: 400 })
    }

    const event = await database.updateCalendarEvent(id, updates)

    if (userId) {
      await database.logAction(
        userId,
        "update",
        "calendar_event",
        id,
        { details: "Updated calendar event" }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error updating calendar event:", error)
    return NextResponse.json(
      { error: "Failed to update calendar event" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a calendar event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (!id) {
      return NextResponse.json({ error: "Event id is required" }, { status: 400 })
    }

    await database.deleteCalendarEvent(id)

    if (userId) {
      await database.logAction(
        userId,
        "delete",
        "calendar_event",
        id,
        { details: "Deleted calendar event" }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting calendar event:", error)
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 }
    )
  }
}
