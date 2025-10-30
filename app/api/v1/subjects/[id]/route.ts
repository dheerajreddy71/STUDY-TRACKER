import { database } from "@/lib/db"
import { subjectSchema } from "@/lib/validators"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const subject = await database.getSubject(id)
    if (!subject || subject.user_id !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(subject)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = subjectSchema.partial().parse(body)

    const { id } = await params
    const subject = await database.getSubject(id)
    if (!subject || subject.user_id !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updated = await database.updateSubject(id, validated)
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const subject = await database.getSubject(id)
    if (!subject || subject.user_id !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await database.updateSubject(id, { is_active: false })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
