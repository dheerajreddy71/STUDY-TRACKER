"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface ScheduleSessionFormProps {
  subjects: any[]
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function ScheduleSessionForm({ subjects, onSubmit, isLoading }: ScheduleSessionFormProps) {
  const [formData, setFormData] = useState({
    subjectId: subjects[0]?.id || "",
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "09:00",
    durationMinutes: "50",
    studyMethod: "reading",
    sessionGoal: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...formData,
      durationMinutes: Number.parseInt(formData.durationMinutes),
    })
    setFormData({
      subjectId: subjects[0]?.id || "",
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: "09:00",
      durationMinutes: "50",
      studyMethod: "reading",
      sessionGoal: "",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Study Session</CardTitle>
        <CardDescription>Plan your study sessions in advance</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
            >
              <SelectTrigger id="subject">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                step="5"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="method">Study Method</Label>
              <Select
                value={formData.studyMethod}
                onValueChange={(value) => setFormData({ ...formData, studyMethod: value })}
              >
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="practice_problems">Practice Problems</SelectItem>
                  <SelectItem value="video_lecture">Video Lecture</SelectItem>
                  <SelectItem value="notes">Notes</SelectItem>
                  <SelectItem value="flashcards">Flashcards</SelectItem>
                  <SelectItem value="group_study">Group Study</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="goal">Session Goal</Label>
            <Input
              id="goal"
              placeholder="What do you want to accomplish?"
              value={formData.sessionGoal}
              onChange={(e) => setFormData({ ...formData, sessionGoal: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Scheduling..." : "Schedule Session"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
