"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface SubjectFormProps {
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  initialData?: any
}

const COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
]

export function SubjectForm({ onSubmit, isLoading, initialData }: SubjectFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "mathematics",
    difficultyLevel: initialData?.difficulty_level || "medium",
    currentGrade: initialData?.current_grade || "",
    targetGrade: initialData?.target_grade || "",
    colorTheme: initialData?.color_theme || COLORS[0],
    instructorName: initialData?.instructor_name || "",
    examDate: initialData?.exam_date || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      ...formData,
      currentGrade: formData.currentGrade ? Number.parseFloat(formData.currentGrade) : null,
      targetGrade: formData.targetGrade ? Number.parseFloat(formData.targetGrade) : null,
    })
    if (!initialData) {
      setFormData({
        name: "",
        category: "mathematics",
        difficultyLevel: "medium",
        currentGrade: "",
        targetGrade: "",
        colorTheme: COLORS[0],
        instructorName: "",
        examDate: "",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Subject" : "Add New Subject"}</CardTitle>
        <CardDescription>{initialData ? "Update subject details" : "Create a new subject to track"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Subject Name</Label>
            <Input
              id="name"
              placeholder="e.g., Mathematics, Physics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                  <SelectItem value="social_studies">Social Studies</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficultyLevel">Difficulty Level</Label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}
              >
                <SelectTrigger id="difficultyLevel">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentGrade">Current Grade</Label>
              <Input
                id="currentGrade"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.currentGrade}
                onChange={(e) => setFormData({ ...formData, currentGrade: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="targetGrade">Target Grade</Label>
              <Input
                id="targetGrade"
                type="number"
                step="0.01"
                placeholder="100"
                value={formData.targetGrade}
                onChange={(e) => setFormData({ ...formData, targetGrade: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instructorName">Instructor Name</Label>
              <Input
                id="instructorName"
                placeholder="Optional"
                value={formData.instructorName}
                onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="examDate">Exam Date</Label>
              <Input
                id="examDate"
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Color Theme</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.colorTheme === color ? "border-gray-800" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, colorTheme: color })}
                />
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : initialData ? "Update Subject" : "Add Subject"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
