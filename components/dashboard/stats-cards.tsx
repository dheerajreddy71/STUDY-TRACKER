"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardsProps {
  stats: {
    totalStudyHours: number
    totalSessions: number
    averageFocusScore: number
    averagePerformance: number
    completedGoals: number
    totalAchievements: number
    currentStreak: number
  } | null
  isLoading: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      title: "Total Study Hours",
      value: stats.totalStudyHours,
      unit: "hrs",
      color: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Study Sessions",
      value: stats.totalSessions,
      unit: "sessions",
      color: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      title: "Average Focus Score",
      value: stats.averageFocusScore,
      unit: "/10",
      color: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      title: "Average Performance",
      value: stats.averagePerformance,
      unit: "%",
      color: "bg-orange-50",
      textColor: "text-orange-700",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => (
        <Card key={card.title} className={card.color}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.textColor}`}>
              {card.value}
              <span className="text-sm ml-1">{card.unit}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
