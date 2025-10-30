"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface SubjectData {
  id: string
  name: string
  color: string
  totalHours: number
  sessionCount: number
  avgFocus: number
  avgPerformance: number
}

interface SubjectBreakdownProps {
  subjects?: SubjectData[]
  isLoading?: boolean
}

export function SubjectBreakdown({ subjects = [], isLoading = false }: SubjectBreakdownProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subject Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading subjects...</div>
        </CardContent>
      </Card>
    )
  }

  const subjectsToDisplay =
    subjects && subjects.length > 0
      ? subjects
      : [
          {
            id: "1",
            name: "Mathematics",
            color: "#3b82f6",
            totalHours: 12.5,
            sessionCount: 8,
            avgFocus: 8.5,
            avgPerformance: 85,
          },
          {
            id: "2",
            name: "Physics",
            color: "#8b5cf6",
            totalHours: 10,
            sessionCount: 6,
            avgFocus: 8,
            avgPerformance: 80,
          },
          {
            id: "3",
            name: "Chemistry",
            color: "#ec4899",
            totalHours: 8.5,
            sessionCount: 5,
            avgFocus: 7.5,
            avgPerformance: 75,
          },
        ]

  if (subjectsToDisplay.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subject Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No subjects yet. Create one to get started!</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Breakdown</CardTitle>
        <CardDescription>Performance and study time by subject</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjectsToDisplay.map((subject) => (
          <div key={subject.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                <span className="font-medium">{subject.name}</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{subject.totalHours}h</Badge>
                <Badge variant="outline">{subject.sessionCount} sessions</Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Performance</span>
                <span className="font-medium">{subject.avgPerformance}%</span>
              </div>
              <Progress value={subject.avgPerformance} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Focus Score</span>
                <span className="font-medium">{subject.avgFocus}/10</span>
              </div>
              <Progress value={(subject.avgFocus / 10) * 100} className="h-2" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
