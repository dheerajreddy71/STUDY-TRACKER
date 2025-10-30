import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await database.getSession(id)
    if (!session) return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 })
    return NextResponse.json({ success: true, data: session })
  } catch (error) {
    console.error("GET /api/v1/sessions/[id] error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch session" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const updated = await database.updateSession(id, body)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("PUT /api/v1/sessions/[id] error:", error)
    return NextResponse.json({ success: false, error: "Failed to update session" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await database.deleteSession(id)
    return NextResponse.json({ success: true, message: "Session deleted" })
  } catch (error) {
    console.error("DELETE /api/v1/sessions/[id] error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete session" }, { status: 500 })
  }
}
