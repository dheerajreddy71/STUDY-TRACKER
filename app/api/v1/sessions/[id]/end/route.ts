import { type NextRequest, NextResponse } from "next/server"
import { endSessionSchema } from "@/lib/validators"
import { database } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const validated = endSessionSchema.parse(body)
    const userId = request.headers.get("x-user-id") || "demo-user"

    const { id } = await params
    const session = await database.getSession(id)
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const updated = await database.endSession(id, {
      actualDurationMinutes: validated.actualDurationMinutes,
      averageFocusScore: validated.averageFocusScore,
      goalAchieved: validated.goalAchieved,
      challenges: validated.challenges,
      notes: validated.notes,
    })

    await database.logAction(userId, "session_ended", "study_session", id, {
      duration: validated.actualDurationMinutes,
      focusScore: validated.averageFocusScore,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[v0] End session error:", error)
    return NextResponse.json({ error: "Failed to end session" }, { status: 400 })
  }
}
