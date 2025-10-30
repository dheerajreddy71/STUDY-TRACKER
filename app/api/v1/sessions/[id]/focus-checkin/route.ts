import { type NextRequest, NextResponse } from "next/server"
import { focusCheckinSchema } from "@/lib/validators"
import { database } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const validated = focusCheckinSchema.parse(body)
    const userId = request.headers.get("x-user-id") || "demo-user"

    const { id } = await params
    const session = await database.getSession(id)
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // In production, store focus checkin in database
    await database.logAction(userId, "focus_checkin", "study_session", id, {
      focusScore: validated.focusScore,
    })

    return NextResponse.json({ success: true, focusScore: validated.focusScore })
  } catch (error) {
    console.error("[v0] Focus checkin error:", error)
    return NextResponse.json({ error: "Failed to record focus checkin" }, { status: 400 })
  }
}
