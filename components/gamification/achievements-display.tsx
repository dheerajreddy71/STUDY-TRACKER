"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Achievement {
  id: string
  achievement_name: string
  achievement_type: string
  description: string
  badge_icon: string
  earned_at: string
}

interface AchievementsDisplayProps {
  achievements: Achievement[]
  isLoading?: boolean
}

export function AchievementsDisplay({ achievements, isLoading }: AchievementsDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading achievements...</div>
        </CardContent>
      </Card>
    )
  }

  if (achievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Earn badges by reaching milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No achievements yet. Keep studying!</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>{achievements.length} badges earned</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex flex-col items-center text-center p-3 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="text-4xl mb-2">{achievement.badge_icon}</div>
              <h4 className="font-semibold text-sm">{achievement.achievement_name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
              <Badge variant="outline" className="mt-2 text-xs capitalize">
                {achievement.achievement_type}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
