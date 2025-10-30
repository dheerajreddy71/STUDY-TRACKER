import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const goal = await database.getGoal(id)

    if (!goal) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: goal })
  } catch (error) {
    console.error("Error fetching goal:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch goal" },
      { status: 500 }
    )
  }
}
