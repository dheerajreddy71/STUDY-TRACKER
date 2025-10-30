"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PerformanceEntry {
  id: string
  entryType: string
  score: number
  totalPossible: number
  percentage: number
  assessmentName: string
  assessmentDate: string
  difficultyRating: string
  timeSpentMinutes?: number
  notes?: string
}

interface PerformanceListProps {
  entries: PerformanceEntry[]
  isLoading?: boolean
}

export function PerformanceList({ entries, isLoading }: PerformanceListProps) {
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-100 text-green-800"
    if (percentage >= 80) return "bg-blue-100 text-blue-800"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-50 text-green-700"
      case "medium":
        return "bg-yellow-50 text-yellow-700"
      case "hard":
        return "bg-orange-50 text-orange-700"
      case "very_hard":
        return "bg-red-50 text-red-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading performance data...</div>
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No performance entries yet. Start logging your assessments!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance History</CardTitle>
        <CardDescription>Your assessment results and scores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Time (min)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.assessmentName || "Unnamed"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {entry.entryType.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(entry.assessmentDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {entry.score} / {entry.totalPossible}
                  </TableCell>
                  <TableCell>
                    <Badge className={getPercentageColor(entry.percentage)}>{entry.percentage.toFixed(1)}%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(entry.difficultyRating)} variant="outline">
                      {entry.difficultyRating.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.timeSpentMinutes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
