import { type NextRequest, NextResponse } from "next/server"
import { database } from "@/lib/db"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  educationLevel: z.string(),
  primaryGoal: z.string(),
  studyStyle: z.string(),
  energyLevel: z.string(),
  currentChallenges: z.array(z.string()),
  isGuest: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user exists
    const existingUser = await database.getUserByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json({ success: false, error: "User already exists" }, { status: 400 })
    }

    // Create user
    const user: any = await database.createUser({
      name: validatedData.name,
      email: validatedData.email,
      educationLevel: validatedData.educationLevel,
      primaryGoal: validatedData.primaryGoal,
      studyStyle: validatedData.studyStyle,
      energyLevel: validatedData.energyLevel,
      currentChallenges: validatedData.currentChallenges,
      isGuest: validatedData.isGuest,
    })

    // Create default preferences
    await database.getOrCreatePreferences(user.id)

    // Create default streak
    await database.getOrCreateStreak(user.id)

    // Log action
    await database.logAction(user.id, "user_created")

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ success: false, error: "Registration failed" }, { status: 500 })
  }
}
