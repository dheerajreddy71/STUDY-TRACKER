import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: "User ID required" 
      }, { status: 400 })
    }

    const user = await database.getUser(userId)

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: "User not found" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      data: user 
    })
  } catch (error) {
    console.error("GET /api/v1/auth/user error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch user" 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, updates } = body

    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: "User ID required" 
      }, { status: 400 })
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ 
        success: false,
        error: "Updates required" 
      }, { status: 400 })
    }

    // Remove fields that shouldn't be updated via this endpoint
    const { id, email, created_at, ...allowedUpdates } = updates

    const updatedUser = await database.updateUser(userId, allowedUpdates)

    if (!updatedUser) {
      return NextResponse.json({ 
        success: false,
        error: "User not found" 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      data: updatedUser 
    })
  } catch (error) {
    console.error("PUT /api/v1/auth/user error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to update user" 
    }, { status: 500 })
  }
}
