import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "guest-user"
    const resources = await database.getResources(userId)

    return NextResponse.json({ success: true, data: resources })
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch resources" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId || "guest-user"

    if (!body.resourceName || !body.resourceType) {
      return NextResponse.json(
        { success: false, error: "Resource name and type are required" },
        { status: 400 }
      )
    }

    const resource: any = await database.createResource({
      userId,
      ...body
    })

    await database.logAction(userId, "create_resource", "resource", resource.id)

    return NextResponse.json({ success: true, data: resource })
  } catch (error) {
    console.error("Error creating resource:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create resource" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, userId, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Resource ID required" },
        { status: 400 }
      )
    }

    const resource = await database.updateResource(id, updates)
    await database.logAction(userId || "guest-user", "update_resource", "resource", id)

    return NextResponse.json({ success: true, data: resource })
  } catch (error) {
    console.error("Error updating resource:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update resource" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId") || "guest-user"

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Resource ID required" },
        { status: 400 }
      )
    }

    await database.deleteResource(id)
    await database.logAction(userId, "delete_resource", "resource", id)

    return NextResponse.json({ success: true, message: "Resource deleted successfully" })
  } catch (error) {
    console.error("Error deleting resource:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete resource" },
      { status: 500 }
    )
  }
}
