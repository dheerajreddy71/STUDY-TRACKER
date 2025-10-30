import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = loginSchema.parse(body)

    let user: any = await database.getUserByEmail(email)
    if (!user) {
      // Create user if doesn't exist (simplified auth for demo)
      user = await database.createUser({
        email,
        name: email.split('@')[0],
        educationLevel: 'undergraduate',
        primaryGoal: 'improve_grades',
        studyStyle: 'visual',
        energyLevel: 'morning',
        currentChallenges: [],
        isGuest: false,
      })
      await database.getOrCreatePreferences(user.id)
      await database.getOrCreateStreak(user.id)
    }

    await database.logAction(user.id, "user_login")

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
  }
}
