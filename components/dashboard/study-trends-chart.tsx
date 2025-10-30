"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TrendData {
  date: string
  hours: number
  sessions: number
  avgFocus: number
}

interface StudyTrendsChartProps {
  data?: TrendData[]
  isLoading?: boolean
}

export function StudyTrendsChart({ data = [], isLoading = false }: StudyTrendsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">Loading chart...</div>
        </CardContent>
      </Card>
    )
  }

  const chartData =
    data && data.length > 0
      ? data
      : [
          { date: "Mon", hours: 2, sessions: 1, avgFocus: 7 },
          { date: "Tue", hours: 3, sessions: 2, avgFocus: 8 },
          { date: "Wed", hours: 2.5, sessions: 1, avgFocus: 7.5 },
          { date: "Thu", hours: 4, sessions: 2, avgFocus: 8.5 },
          { date: "Fri", hours: 3.5, sessions: 2, avgFocus: 8 },
          { date: "Sat", hours: 5, sessions: 3, avgFocus: 9 },
          { date: "Sun", hours: 2, sessions: 1, avgFocus: 7 },
        ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Trends</CardTitle>
        <CardDescription>Your study hours and focus over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="hours" stroke="#3b82f6" name="Study Hours" />
            <Line type="monotone" dataKey="avgFocus" stroke="#8b5cf6" name="Avg Focus" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
