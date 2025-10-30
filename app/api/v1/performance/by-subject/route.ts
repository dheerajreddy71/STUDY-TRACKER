import { database } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const subjectId = request.nextUrl.searchParams.get("subjectId")

    if (!userId || !subjectId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const performance = await database.getPerformanceBySubject(userId, subjectId)
    return NextResponse.json(performance)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
