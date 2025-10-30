import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

// GET - Get single calendar event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = await database.getCalendarEvent(id)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching calendar event:", error)
    return NextResponse.json(
      { error: "Failed to fetch calendar event" },
      { status: 500 }
    )
  }
}
