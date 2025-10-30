import { NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId") || "guest-user"
    const subjectId = request.nextUrl.searchParams.get("subjectId") || undefined

    const methods = await database.getMethodEffectiveness(userId, subjectId)

    return NextResponse.json({ success: true, data: methods })
  } catch (error) {
    console.error("Error fetching method effectiveness:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch method effectiveness" },
      { status: 500 }
    )
  }
}
