"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

interface PerformanceFormProps {
  subjectId: string
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function PerformanceForm({ subjectId, onSubmit, isLoading }: PerformanceFormProps) {
  const [formData, setFormData] = useState({
    entryType: "quiz",
    score: "",
    totalPossible: "100",
    assessmentName: "",
    assessmentDate: new Date().toISOString().split("T")[0],
    difficultyRating: "medium",
    timeSpentMinutes: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...formData,
      score: Number.parseFloat(formData.score),
      totalPossible: Number.parseFloat(formData.totalPossible),
      timeSpentMinutes: formData.timeSpentMinutes ? Number.parseInt(formData.timeSpentMinutes) : null,
    })
    setFormData({
      entryType: "quiz",
      score: "",
      totalPossible: "100",
      assessmentName: "",
      assessmentDate: new Date().toISOString().split("T")[0],
      difficultyRating: "medium",
      timeSpentMinutes: "",
      notes: "",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Performance</CardTitle>
        <CardDescription>Record your assessment results and performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entryType">Assessment Type</Label>
              <Select
                value={formData.entryType}
                onValueChange={(value) => setFormData({ ...formData, entryType: value })}
              >
                <SelectTrigger id="entryType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="self_assessment">Self Assessment</SelectItem>
                  <SelectItem value="mock_test">Mock Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assessmentDate">Date</Label>
              <Input
                id="assessmentDate"
                type="date"
                value={formData.assessmentDate}
                onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="score">Score</Label>
              <Input
                id="score"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="totalPossible">Total Possible</Label>
              <Input
                id="totalPossible"
                type="number"
                step="0.01"
                value={formData.totalPossible}
                onChange={(e) => setFormData({ ...formData, totalPossible: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="assessmentName">Assessment Name</Label>
            <Input
              id="assessmentName"
              placeholder="e.g., Chapter 5 Quiz"
              value={formData.assessmentName}
              onChange={(e) => setFormData({ ...formData, assessmentName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficultyRating">Difficulty</Label>
              <Select
                value={formData.difficultyRating}
                onValueChange={(value) => setFormData({ ...formData, difficultyRating: value })}
              >
                <SelectTrigger id="difficultyRating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="very_hard">Very Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timeSpentMinutes">Time Spent (minutes)</Label>
              <Input
                id="timeSpentMinutes"
                type="number"
                placeholder="0"
                value={formData.timeSpentMinutes}
                onChange={(e) => setFormData({ ...formData, timeSpentMinutes: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any observations or notes about this assessment..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Log Performance"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
