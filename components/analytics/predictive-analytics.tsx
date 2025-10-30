"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, Zap } from "lucide-react"

interface PredictiveData {
  performanceTrend: string
  currentPerformance: number
  predictedHoursNeeded: number
  learningVelocity: number
  recommendation: string
}

interface PredictiveAnalyticsProps {
  data: PredictiveData | null
  isLoading?: boolean
}

export function PredictiveAnalytics({ data, isLoading }: PredictiveAnalyticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading predictions...</div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const getTrendIcon = () => {
    if (data.performanceTrend === "improving") return <TrendingUp className="w-5 h-5 text-green-600" />
    if (data.performanceTrend === "declining") return <TrendingDown className="w-5 h-5 text-red-600" />
    return <Zap className="w-5 h-5 text-yellow-600" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predictive Analytics</CardTitle>
        <CardDescription>AI-powered insights about your learning</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Performance Trend</p>
              {getTrendIcon()}
            </div>
            <p className="text-2xl font-bold capitalize">{data.performanceTrend}</p>
          </div>

          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Current Performance</p>
            <p className="text-2xl font-bold">{data.currentPerformance}%</p>
          </div>

          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Hours to Target</p>
            <p className="text-2xl font-bold">{data.predictedHoursNeeded}h</p>
          </div>

          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Learning Velocity</p>
            <p className="text-2xl font-bold">{data.learningVelocity}%/h</p>
          </div>
        </div>

        <Alert>
          <AlertDescription>{data.recommendation}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
