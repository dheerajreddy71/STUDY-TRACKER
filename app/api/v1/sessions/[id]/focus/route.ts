import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id: sessionId } = await params
    const focusScore = body.focusLevel || body.focusScore

    if (!focusScore) {
      return NextResponse.json({ 
        success: false, 
        error: "Focus score required" 
      }, { status: 400 })
    }

    await database.addFocusCheckin(sessionId, focusScore)

    return NextResponse.json({ success: true, message: "Focus check-in recorded" })
  } catch (error) {
    console.error("Error recording focus check-in:", error)
    return NextResponse.json(
      { success: false, error: "Failed to record focus check-in" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params
    const checkins = await database.getFocusCheckins(sessionId)

    return NextResponse.json({ success: true, data: checkins })
  } catch (error) {
    console.error("Error fetching focus check-ins:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch focus check-ins" },
      { status: 500 }
    )
  }
}
