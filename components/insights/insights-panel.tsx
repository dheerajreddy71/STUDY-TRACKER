"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, TrendingUp, Award, AlertCircle } from "lucide-react"

interface Insight {
  id: string
  insight_type: string
  title: string
  description: string
  confidence_level?: number
  created_at: string
}

interface InsightsPanelProps {
  insights?: Insight[]
  isLoading?: boolean
}

export function InsightsPanel({ insights = [], isLoading = false }: InsightsPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "recommendation":
        return <Lightbulb className="w-5 h-5" />
      case "pattern":
        return <TrendingUp className="w-5 h-5" />
      case "achievement":
        return <Award className="w-5 h-5" />
      case "alert":
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Lightbulb className="w-5 h-5" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case "recommendation":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "pattern":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "achievement":
        return "bg-green-50 text-green-700 border-green-200"
      case "alert":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading insights...</div>
        </CardContent>
      </Card>
    )
  }

  const insightsToDisplay =
    insights && insights.length > 0
      ? insights
      : [
          {
            id: "1",
            insight_type: "recommendation",
            title: "Optimize Study Schedule",
            description: "You perform best in the morning. Consider scheduling more sessions between 8-11 AM.",
            confidence_level: 0.92,
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            insight_type: "pattern",
            title: "Consistent Progress",
            description: "Your focus score has improved by 15% over the last week. Keep up the great work!",
            confidence_level: 0.88,
            created_at: new Date().toISOString(),
          },
          {
            id: "3",
            insight_type: "achievement",
            title: "Subject Mastery",
            description: "Mathematics performance is at 85%. You're on track to master this subject!",
            confidence_level: 0.85,
            created_at: new Date().toISOString(),
          },
        ]

  if (insightsToDisplay.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>Keep studying to unlock personalized insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No insights yet. Start tracking your sessions!</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights & Recommendations</CardTitle>
        <CardDescription>Personalized insights based on your study patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insightsToDisplay.slice(0, 5).map((insight) => (
          <div key={insight.id} className={`p-4 border rounded-lg ${getColor(insight.insight_type)}`}>
            <div className="flex items-start gap-3">
              <div className="mt-1">{getIcon(insight.insight_type)}</div>
              <div className="flex-1">
                <h4 className="font-semibold">{insight.title}</h4>
                <p className="text-sm mt-1">{insight.description}</p>
                {insight.confidence_level && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(insight.confidence_level * 100)}% confidence
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
