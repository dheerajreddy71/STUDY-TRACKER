"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditSubjectPage() {
  const router = useRouter()
  const params = useParams()
  const subjectId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
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

  useEffect(() => {
    if (!subjectId) return

    const userId = localStorage.getItem("userId") || "guest-user"
    
    fetch(`/api/v1/subjects?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const subject = data.data?.find((s: any) => s.id === subjectId)
          if (subject) {
            setFormData({
              name: subject.name || "",
              subjectCode: subject.subject_code || "",
              category: subject.category || "other",
              difficulty: subject.difficulty_level || "medium",
              color: subject.color_theme || "#3b82f6",
              priorityLevel: subject.priority_level || "medium",
              priorityReason: subject.priority_reason || "",
              description: subject.subject_description || "",
              targetWeeklyHours: subject.target_weekly_hours || 5,
              minHoursPerWeek: subject.min_hours_per_week || 3,
              recommendedSessionDuration: subject.recommended_session_duration || 45,
              preferredStudyMethod: subject.preferred_study_method || "",
              targetGrade: subject.target_grade || "",
              currentPerformance: subject.current_performance || 0,
              targetPerformance: subject.target_performance || 100,
              baselinePerformance: subject.baseline_performance || 0,
              nextExamDate: subject.next_exam_date ? new Date(subject.next_exam_date).toISOString().split('T')[0] : "",
              examType: subject.exam_type || "",
              examWeightage: subject.exam_weightage?.toString() || "",
              examPrepStatus: subject.exam_preparation_status || "not_started",
              totalChapters: subject.total_chapters || 0,
              completedChapters: subject.completed_chapters || 0,
              currentChapter: subject.current_chapter || "",
              textbookName: subject.textbook_name || "",
              textbookEdition: subject.textbook_edition || "",
              onlineResources: subject.online_resources || "",
              videoCourseLinks: subject.video_course_links || "",
              studyMaterialsLocation: subject.study_materials_location || "",
              classSchedule: subject.class_schedule || "",
              studyStrategyNotes: subject.study_strategy_notes || "",
              notes: subject.notes || ""
            })
          } else {
            toast.error("Subject not found")
            router.push("/subjects")
          }
        }
        setIsFetching(false)
      })
      .catch(error => {
        console.error("Error loading subject:", error)
        toast.error("Failed to load subject")
        setIsFetching(false)
      })
  }, [subjectId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const userId = localStorage.getItem("userId") || "guest-user"

    try {
      const response = await fetch("/api/v1/subjects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: subjectId,
          userId,
          name: formData.name,
          subjectCode: formData.subjectCode,
          category: formData.category,
          difficultyLevel: formData.difficulty,
          priorityLevel: formData.priorityLevel,
          priorityReason: formData.priorityReason,
          subjectDescription: formData.description,
          colorTheme: formData.color,
          targetWeeklyHours: formData.targetWeeklyHours,
          minHoursPerWeek: formData.minHoursPerWeek,
          recommendedSessionDuration: formData.recommendedSessionDuration,
          preferredStudyMethod: formData.preferredStudyMethod,
          targetGrade: formData.targetGrade,
          currentPerformance: formData.currentPerformance,
          targetPerformance: formData.targetPerformance,
          baselinePerformance: formData.baselinePerformance,
          nextExamDate: formData.nextExamDate,
          examType: formData.examType,
          examWeightage: formData.examWeightage ? parseFloat(formData.examWeightage) : null,
          examPreparationStatus: formData.examPrepStatus,
          totalChapters: formData.totalChapters,
          completedChapters: formData.completedChapters,
          currentChapter: formData.currentChapter,
          textbookName: formData.textbookName,
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
        toast.success("Subject updated successfully!")
        router.push(`/subjects/${subjectId}`)
      } else {
        toast.error(data.error || "Failed to update subject")
      }
    } catch (error) {
      console.error("Error updating subject:", error)
      toast.error("Failed to update subject")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/subjects/${subjectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Subject</h1>
          <p className="text-muted-foreground mt-2">Update subject information</p>
        </div>
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

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category}
                      onValueChange={(v) => setFormData({...formData, category: v})}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="language">Language</SelectItem>
                        <SelectItem value="social_studies">Social Studies</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

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
                        <SelectItem value="very_hard">Very Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select 
                      value={formData.priorityLevel}
                      onValueChange={(v) => setFormData({...formData, priorityLevel: v})}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priorityReason">Priority Reason</Label>
                  <Textarea 
                    id="priorityReason" 
                    placeholder="Why is this subject a priority?"
                    value={formData.priorityReason}
                    onChange={(e) => setFormData({...formData, priorityReason: e.target.value})}
                    disabled={isLoading}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color Theme</Label>
                  <Input 
                    id="color" 
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    disabled={isLoading}
                    className="h-12"
                  />
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
                    <Label htmlFor="targetHours">Target Weekly Hours</Label>
                    <Input 
                      id="targetHours" 
                      type="number"
                      min="0"
                      value={formData.targetWeeklyHours}
                      onChange={(e) => setFormData({...formData, targetWeeklyHours: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minHours">Minimum Hours/Week</Label>
                    <Input 
                      id="minHours" 
                      type="number"
                      min="0"
                      value={formData.minHoursPerWeek}
                      onChange={(e) => setFormData({...formData, minHoursPerWeek: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionDuration">Recommended Session (min)</Label>
                    <Input 
                      id="sessionDuration" 
                      type="number"
                      min="0"
                      value={formData.recommendedSessionDuration}
                      onChange={(e) => setFormData({...formData, recommendedSessionDuration: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studyMethod">Preferred Study Method</Label>
                  <Input 
                    id="studyMethod" 
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
                    placeholder="Mon/Wed/Fri 10:00-11:30 AM"
                    value={formData.classSchedule}
                    onChange={(e) => setFormData({...formData, classSchedule: e.target.value})}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategyNotes">Study Strategy Notes</Label>
                  <Textarea 
                    id="strategyNotes" 
                    placeholder="Notes about your study approach for this subject"
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
                <CardTitle>Exam Information & Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nextExam">Next Exam Date</Label>
                    <Input 
                      id="nextExam" 
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
                      placeholder="Midterm, Final, Quiz, etc."
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
                      min="0"
                      max="100"
                      placeholder="e.g., 30"
                      value={formData.examWeightage}
                      onChange={(e) => setFormData({...formData, examWeightage: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="examPrepStatus">Exam Prep Status</Label>
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
                        <SelectItem value="exam_completed">Exam Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentPerf">Current Performance (%)</Label>
                    <Input 
                      id="currentPerf" 
                      type="number"
                      min="0"
                      max="100"
                      value={formData.currentPerformance}
                      onChange={(e) => setFormData({...formData, currentPerformance: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetPerf">Target Performance (%)</Label>
                    <Input 
                      id="targetPerf" 
                      type="number"
                      min="0"
                      max="100"
                      value={formData.targetPerformance}
                      onChange={(e) => setFormData({...formData, targetPerformance: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baselinePerf">Baseline Performance (%)</Label>
                    <Input 
                      id="baselinePerf" 
                      type="number"
                      min="0"
                      max="100"
                      value={formData.baselinePerformance}
                      onChange={(e) => setFormData({...formData, baselinePerformance: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetGrade">Target Grade</Label>
                  <Input 
                    id="targetGrade" 
                    placeholder="e.g., A, A+, 90%"
                    value={formData.targetGrade}
                    onChange={(e) => setFormData({...formData, targetGrade: e.target.value})}
                    disabled={isLoading}
                  />
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
                      min="0"
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
                      min="0"
                      value={formData.completedChapters}
                      onChange={(e) => setFormData({...formData, completedChapters: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentChapter">Current Chapter</Label>
                    <Input 
                      id="currentChapter" 
                      placeholder="e.g., Chapter 5"
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
                      placeholder="e.g., Advanced Calculus"
                      value={formData.textbookName}
                      onChange={(e) => setFormData({...formData, textbookName: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textbookEdition">Textbook Edition</Label>
                    <Input 
                      id="textbookEdition" 
                      placeholder="e.g., 5th Edition"
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
                <CardTitle>Study Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="onlineResources">Online Resources</Label>
                  <Textarea 
                    id="onlineResources" 
                    placeholder="Websites, online tools, etc."
                    value={formData.onlineResources}
                    onChange={(e) => setFormData({...formData, onlineResources: e.target.value})}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoCourses">Video Course Links</Label>
                  <Textarea 
                    id="videoCourses" 
                    placeholder="YouTube channels, Coursera, Udemy, etc."
                    value={formData.videoCourseLinks}
                    onChange={(e) => setFormData({...formData, videoCourseLinks: e.target.value})}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="materialsLocation">Study Materials Location</Label>
                  <Textarea 
                    id="materialsLocation" 
                    placeholder="Where to find notes, handouts, practice problems"
                    value={formData.studyMaterialsLocation}
                    onChange={(e) => setFormData({...formData, studyMaterialsLocation: e.target.value})}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Any other notes about this subject"
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

        <div className="flex gap-4 justify-end mt-6">
          <Link href={`/subjects/${subjectId}`}>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
