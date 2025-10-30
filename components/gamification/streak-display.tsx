"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame } from "lucide-react"

interface StreakDisplayProps {
  currentStreak: number
  longestStreak: number
  isLoading?: boolean
}

export function StreakDisplay({ currentStreak, longestStreak, isLoading }: StreakDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading streak...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Streak</CardTitle>
        <CardDescription>Keep the momentum going!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </div>
          <Flame className="w-12 h-12 text-orange-500" />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-muted-foreground">Longest Streak</p>
          <p className="text-2xl font-bold text-blue-600">{longestStreak}</p>
          <p className="text-xs text-muted-foreground mt-1">days</p>
        </div>
      </CardContent>
    </Card>
  )
}
