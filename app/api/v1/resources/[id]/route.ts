import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const resource = await database.getResource(id)

    if (!resource) {
      return NextResponse.json(
        { success: false, error: "Resource not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: resource })
  } catch (error) {
    console.error("Error fetching resource:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch resource" },
      { status: 500 }
    )
  }
}
