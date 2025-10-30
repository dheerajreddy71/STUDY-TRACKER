"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function NewSubjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    subjectCode: "",
    category: "other",
    difficulty: "medium",
    color: "#3b82f6",
    priorityLevel: "medium",
    priorityReason: "",
    description: "",
    
    // Study Planning
    targetWeeklyHours: 5,
    minHoursPerWeek: 3,
    recommendedSessionDuration: 45,
    preferredStudyMethod: "",
    
    // Performance & Goals
    targetGrade: "",
    currentPerformance: 0,
    targetPerformance: 100,
    baselinePerformance: 0,
    
    // Exam Info
    nextExamDate: "",
    examType: "",
    examWeightage: "",
    examPrepStatus: "not_started",
    
    // Course Content
    totalChapters: 0,
    completedChapters: 0,
    currentChapter: "",
    textbookName: "",
    textbookEdition: "",
    
    // Resources
    onlineResources: "",
    videoCourseLinks: "",
    studyMaterialsLocation: "",
    
    // Schedule
    classSchedule: "",
    
    // Notes
    studyStrategyNotes: "",
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Subject name is required")
      return
    }
    
    if (formData.name.length > 200) {
      toast.error("Subject name must be less than 200 characters")
      return
    }
    
    if (formData.targetWeeklyHours < 0 || formData.targetWeeklyHours > 168) {
      toast.error("Target weekly hours must be between 0 and 168")
      return
    }
    
    if (formData.currentPerformance < 0 || formData.currentPerformance > 100) {
      toast.error("Current performance must be between 0 and 100")
      return
    }
    
    if (formData.targetPerformance < 0 || formData.targetPerformance > 100) {
      toast.error("Target performance must be between 0 and 100")
      return
    }
    
    if (formData.totalChapters < 0) {
      toast.error("Total chapters cannot be negative")
      return
    }
    
    if (formData.completedChapters < 0 || formData.completedChapters > formData.totalChapters) {
      toast.error("Completed chapters must be between 0 and total chapters")
      return
    }
    
    setIsLoading(true)

    const userId = localStorage.getItem("userId") || "guest-user"

    try {
      const response = await fetch("/api/v1/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: formData.name.trim(),
          subjectCode: formData.subjectCode.trim(),
          category: formData.category,
          difficultyLevel: formData.difficulty,
          priorityLevel: formData.priorityLevel,
          priorityReason: formData.priorityReason.trim(),
          subjectDescription: formData.description.trim(),
          colorTheme: formData.color,
          targetWeeklyHours: formData.targetWeeklyHours,
          minHoursPerWeek: formData.minHoursPerWeek,
          recommendedSessionDuration: formData.recommendedSessionDuration,
          preferredStudyMethod: formData.preferredStudyMethod.trim(),
          currentPerformance: formData.currentPerformance,
          targetPerformance: formData.targetPerformance,
          baselinePerformance: formData.baselinePerformance,
          nextExamDate: formData.nextExamDate,
          examType: formData.examType.trim(),
          examWeightage: formData.examWeightage ? parseFloat(formData.examWeightage) : null,
          examPreparationStatus: formData.examPrepStatus,
          totalChapters: formData.totalChapters,
          completedChapters: formData.completedChapters,
          currentChapter: formData.currentChapter.trim(),
          textbookName: formData.textbookName.trim(),
          textbookEdition: formData.textbookEdition,
          onlineResources: formData.onlineResources,
          videoCourseLinks: formData.videoCourseLinks,
          studyMaterialsLocation: formData.studyMaterialsLocation,
          classSchedule: formData.classSchedule,
          studyStrategyNotes: formData.studyStrategyNotes,
          notes: formData.notes
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success("Subject created successfully!")
        router.push("/subjects")
      } else {
        toast.error(data.error || "Failed to create subject")
      }
    } catch (error) {
      console.error("Error creating subject:", error)
      toast.error("Failed to create subject")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Subject</h1>
        <p className="text-muted-foreground mt-2">Create a comprehensive subject profile</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="exam">Exam & Progress</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* BASIC INFO TAB */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Subject Name *</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g., Advanced Mathematics"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subjectCode">Subject Code</Label>
                    <Input 
                      id="subjectCode" 
                      placeholder="e.g., MATH301"
                      value={formData.subjectCode}
                      onChange={(e) => setFormData({...formData, subjectCode: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Brief description of the subject"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select 
                      value={formData.difficulty}
                      onValueChange={(v) => setFormData({...formData, difficulty: v})}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priorityLevel">Priority Level</Label>
                    <Select 
                      value={formData.priorityLevel}
                      onValueChange={(v) => setFormData({...formData, priorityLevel: v})}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="priorityLevel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priorityReason">Why is this priority level?</Label>
                  <Textarea 
                    id="priorityReason" 
                    placeholder="e.g., Final exam worth 40%, struggling with concepts"
                    value={formData.priorityReason}
                    onChange={(e) => setFormData({...formData, priorityReason: e.target.value})}
                    disabled={isLoading}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color Theme</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-20 h-10 cursor-pointer"
                      disabled={isLoading}
                    />
                    <Input 
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      placeholder="#3b82f6"
                      className="flex-1"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PLANNING TAB */}
          <TabsContent value="planning">
            <Card>
              <CardHeader>
                <CardTitle>Study Planning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="targetWeeklyHours">Target Weekly Hours</Label>
                    <Input 
                      id="targetWeeklyHours" 
                      type="number" 
                      placeholder="10"
                      value={formData.targetWeeklyHours}
                      onChange={(e) => setFormData({...formData, targetWeeklyHours: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minHoursPerWeek">Minimum Hours/Week</Label>
                    <Input 
                      id="minHoursPerWeek" 
                      type="number" 
                      placeholder="3"
                      value={formData.minHoursPerWeek}
                      onChange={(e) => setFormData({...formData, minHoursPerWeek: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recommendedSessionDuration">Session Duration (min)</Label>
                    <Input 
                      id="recommendedSessionDuration" 
                      type="number" 
                      placeholder="45"
                      value={formData.recommendedSessionDuration}
                      onChange={(e) => setFormData({...formData, recommendedSessionDuration: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredStudyMethod">Preferred Study Method</Label>
                  <Input 
                    id="preferredStudyMethod" 
                    placeholder="e.g., Practice problems, flashcards, video lectures"
                    value={formData.preferredStudyMethod}
                    onChange={(e) => setFormData({...formData, preferredStudyMethod: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classSchedule">Class Schedule</Label>
                  <Textarea 
                    id="classSchedule" 
                    placeholder="e.g., Mon/Wed/Fri 10:00 AM - 11:30 AM"
                    value={formData.classSchedule}
                    onChange={(e) => setFormData({...formData, classSchedule: e.target.value})}
                    disabled={isLoading}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studyStrategyNotes">Study Strategy & Notes</Label>
                  <Textarea 
                    id="studyStrategyNotes" 
                    placeholder="Your study approach, what works best, tips for this subject..."
                    value={formData.studyStrategyNotes}
                    onChange={(e) => setFormData({...formData, studyStrategyNotes: e.target.value})}
                    disabled={isLoading}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXAM & PROGRESS TAB */}
          <TabsContent value="exam">
            <Card>
              <CardHeader>
                <CardTitle>Exam Info & Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nextExamDate">Next Exam Date</Label>
                    <Input 
                      id="nextExamDate" 
                      type="date"
                      value={formData.nextExamDate}
                      onChange={(e) => setFormData({...formData, nextExamDate: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="examType">Exam Type</Label>
                    <Input 
                      id="examType" 
                      placeholder="e.g., Midterm, Final, Quiz"
                      value={formData.examType}
                      onChange={(e) => setFormData({...formData, examType: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="examWeightage">Exam Weightage (%)</Label>
                    <Input 
                      id="examWeightage" 
                      type="number"
                      placeholder="40"
                      value={formData.examWeightage}
                      onChange={(e) => setFormData({...formData, examWeightage: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="examPrepStatus">Preparation Status</Label>
                    <Select 
                      value={formData.examPrepStatus}
                      onValueChange={(v) => setFormData({...formData, examPrepStatus: v})}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="examPrepStatus">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="well_prepared">Well Prepared</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetGrade">Target Grade</Label>
                  <Input 
                    id="targetGrade" 
                    placeholder="A, 90%, 3.5 GPA, etc."
                    value={formData.targetGrade}
                    onChange={(e) => setFormData({...formData, targetGrade: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPerformance">Current Performance (%)</Label>
                    <Input 
                      id="currentPerformance" 
                      type="number"
                      placeholder="75"
                      value={formData.currentPerformance}
                      onChange={(e) => setFormData({...formData, currentPerformance: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetPerformance">Target Performance (%)</Label>
                    <Input 
                      id="targetPerformance" 
                      type="number"
                      placeholder="90"
                      value={formData.targetPerformance}
                      onChange={(e) => setFormData({...formData, targetPerformance: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baselinePerformance">Baseline Performance (%)</Label>
                    <Input 
                      id="baselinePerformance" 
                      type="number"
                      placeholder="70"
                      value={formData.baselinePerformance}
                      onChange={(e) => setFormData({...formData, baselinePerformance: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTENT TAB */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="totalChapters">Total Chapters</Label>
                    <Input 
                      id="totalChapters" 
                      type="number"
                      placeholder="12"
                      value={formData.totalChapters}
                      onChange={(e) => setFormData({...formData, totalChapters: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="completedChapters">Completed Chapters</Label>
                    <Input 
                      id="completedChapters" 
                      type="number"
                      placeholder="3"
                      value={formData.completedChapters}
                      onChange={(e) => setFormData({...formData, completedChapters: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentChapter">Current Chapter</Label>
                    <Input 
                      id="currentChapter" 
                      placeholder="Chapter 4"
                      value={formData.currentChapter}
                      onChange={(e) => setFormData({...formData, currentChapter: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="textbookName">Textbook Name</Label>
                    <Input 
                      id="textbookName" 
                      placeholder="e.g., Calculus: Early Transcendentals"
                      value={formData.textbookName}
                      onChange={(e) => setFormData({...formData, textbookName: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textbookEdition">Edition</Label>
                    <Input 
                      id="textbookEdition" 
                      placeholder="8th Edition"
                      value={formData.textbookEdition}
                      onChange={(e) => setFormData({...formData, textbookEdition: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RESOURCES TAB */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Learning Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="onlineResources">Online Resources</Label>
                  <Textarea 
                    id="onlineResources" 
                    placeholder="List websites, online platforms, etc. (one per line)"
                    value={formData.onlineResources}
                    onChange={(e) => setFormData({...formData, onlineResources: e.target.value})}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoCourseLinks">Video Course Links</Label>
                  <Textarea 
                    id="videoCourseLinks" 
                    placeholder="YouTube playlists, Coursera, Khan Academy, etc."
                    value={formData.videoCourseLinks}
                    onChange={(e) => setFormData({...formData, videoCourseLinks: e.target.value})}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studyMaterialsLocation">Study Materials Location</Label>
                  <Input 
                    id="studyMaterialsLocation" 
                    placeholder="e.g., Google Drive folder, Desktop/Math folder"
                    value={formData.studyMaterialsLocation}
                    onChange={(e) => setFormData({...formData, studyMaterialsLocation: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Any other information about this subject"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    disabled={isLoading}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
              {isLoading ? "Creating Subject..." : "Create Subject"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
