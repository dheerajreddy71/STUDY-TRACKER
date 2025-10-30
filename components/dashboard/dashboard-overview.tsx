"use client"

import { useAnalytics } from "@/hooks/use-analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardOverview() {
  const { stats, isLoading } = useAnalytics()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    {
      title: "Total Study Hours",
      value: stats.totalStudyHours,
      unit: "hrs",
    },
    {
      title: "Sessions Completed",
      value: stats.sessionsCompleted,
      unit: "sessions",
    },
    {
      title: "Current Streak",
      value: stats.currentStreak,
      unit: "days",
    },
    {
      title: "Avg Focus Score",
      value: stats.averageFocusScore,
      unit: "/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">{card.unit}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
