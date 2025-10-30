import { database } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")
    const fromDate = request.nextUrl.searchParams.get("fromDate")
    const toDate = request.nextUrl.searchParams.get("toDate")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 })
    }

    const sessions = await database.getScheduledSessions(userId, fromDate || undefined, toDate || undefined)

    return NextResponse.json({ success: true, data: sessions })
  } catch (error: any) {
    console.error("Error fetching scheduled sessions:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, subjectId, scheduledDate, scheduledTime, durationMinutes, studyMethod } = body

    if (!userId || !subjectId || !scheduledDate || !scheduledTime || !durationMinutes) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const session = await database.createScheduledSession({
      userId,
      subjectId,
      scheduledDate,
      scheduledTime,
      durationMinutes,
      studyMethod,
    })

    return NextResponse.json({ success: true, data: session }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating scheduled session:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}
