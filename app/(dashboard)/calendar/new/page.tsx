"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Calendar, Loader2, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NewCalendarEventPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Information
    eventType: "study_session" as string,
    title: "",
    description: "",
    
    // Subject Association
    subjectId: "",
    
    // Time Details
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    durationMinutes: 60,
    allDay: false,
    
    // Recurrence
    isRecurring: false,
    recurrenceType: "none" as string, // none, daily, weekly, monthly, yearly
    recurrenceFrequency: 1,
    recurrenceEndDate: "",
    recurrenceExceptions: [] as string[],
    
    // Session Details (for study_session type)
    sessionType: "",
    studyMethod: "",
    location: "",
    
    // Preparation & Tasks
    preparationRequired: "",
    difficulty: "medium" as string,
    priority: "medium" as string,
    
    // Linked Items
    linkedResourceIds: [] as string[],
    linkedGoalIds: [] as string[],
    
    // Reminders
    reminderEnabled: true,
    reminderMinutesBefore: 30,
    notificationSent: false,
    
    // Pre/Post Tasks
    preSessionChecklist: [] as string[],
    postSessionTasks: [] as string[],
    
    // Additional Details
    notes: "",
    tags: [] as string[],
    color: "",
    
    // Status tracking
    status: "planned" as string,
    completionStatus: "",
    actualStartTime: "",
    actualEndTime: "",
    cancellationReason: "",
    
    // Study Plan
    studyPlanId: "",
    isFlexible: false,
  })

  // Temporary fields for array inputs
  const [currentException, setCurrentException] = useState("")
  const [currentResource, setCurrentResource] = useState("")
  const [currentGoal, setCurrentGoal] = useState("")
  const [currentPreTask, setCurrentPreTask] = useState("")
  const [currentPostTask, setCurrentPostTask] = useState("")
  const [currentTag, setCurrentTag] = useState("")

  useEffect(() => {
    loadSubjects()
    // Set default start date/time to now
    const now = new Date()
    setFormData(prev => ({
      ...prev,
      startDate: now.toISOString().split('T')[0],
      startTime: now.toTimeString().slice(0, 5)
    }))
  }, [])

  const loadSubjects = async () => {
    const userId = localStorage.getItem("userId") || "guest-user"
    try {
      const response = await fetch(`/api/v1/subjects?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setSubjects(data.data || [])
        if (data.data.length > 0) {
          setFormData(prev => ({ ...prev, subjectId: data.data[0].id }))
        }
      }
    } catch (error) {
      console.error("Error loading subjects:", error)
    }
  }

  const addToArray = (field: keyof typeof formData, value: string) => {
    if (!value.trim()) return
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()]
    }))
  }

  const removeFromArray = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Comprehensive Validation
    if (!formData.title.trim()) {
      toast.error("Please enter an event title")
      return
    }

    if (formData.title.length > 200) {
      toast.error("Event title must be less than 200 characters")
      return
    }

    if (!formData.startDate || !formData.startTime) {
      toast.error("Please fill in start date and time")
      return
    }

    // Validate end time is after start time
    if (formData.endDate && formData.endTime) {
      const start = new Date(`${formData.startDate}T${formData.startTime}`)
      const end = new Date(`${formData.endDate}T${formData.endTime}`)
      if (end < start) {
        toast.error("End time cannot be before start time")
        return
      }
      
      // Check duration is reasonable (max 24 hours)
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      if (durationHours > 24) {
        toast.error("Event duration cannot exceed 24 hours")
        return
      }
    }

    if (formData.durationMinutes < 0 || formData.durationMinutes > 1440) {
      toast.error("Duration must be between 0 and 1440 minutes (24 hours)")
      return
    }

    if (formData.reminderMinutesBefore < 0) {
      toast.error("Reminder time cannot be negative")
      return
    }

    setIsLoading(true)
    const userId = localStorage.getItem("userId") || "guest-user"

    try {
      // Combine date and time into ISO datetime
      const startDatetime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString()
      const endDatetime = formData.endDate && formData.endTime
        ? new Date(`${formData.endDate}T${formData.endTime}`).toISOString()
        : undefined

      // Build recurrence pattern if recurring
      const recurrencePattern = formData.isRecurring
        ? {
            type: formData.recurrenceType,
            frequency: formData.recurrenceFrequency,
            exceptions: formData.recurrenceExceptions
          }
        : undefined

      const response = await fetch("/api/v1/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          eventType: formData.eventType,
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          subjectId: formData.subjectId || undefined,
          startDatetime,
          endDatetime,
          durationMinutes: formData.durationMinutes,
          allDay: formData.allDay,
          isRecurring: formData.isRecurring,
          recurrencePattern,
          recurrenceEndDate: formData.recurrenceEndDate || undefined,
          studyPlanId: formData.studyPlanId || undefined,
          isFlexible: formData.isFlexible,
          
          // Session Details
          sessionType: formData.sessionType.trim() || undefined,
          studyMethod: formData.studyMethod.trim() || undefined,
          location: formData.location.trim() || undefined,
          
          // Preparation & Tasks
          preparationRequired: formData.preparationRequired.trim() || undefined,
          difficulty: formData.difficulty,
          priority: formData.priority,
          
          // Linked Items
          linkedResourceIds: formData.linkedResourceIds.length > 0 ? JSON.stringify(formData.linkedResourceIds) : undefined,
          linkedGoalIds: formData.linkedGoalIds.length > 0 ? JSON.stringify(formData.linkedGoalIds) : undefined,
          
          // Reminders
          reminderEnabled: formData.reminderEnabled,
          reminderMinutesBefore: formData.reminderMinutesBefore,
          notificationSent: formData.notificationSent,
          
          // Pre/Post Tasks
          preSessionChecklist: formData.preSessionChecklist.length > 0 ? JSON.stringify(formData.preSessionChecklist) : undefined,
          postSessionTasks: formData.postSessionTasks.length > 0 ? JSON.stringify(formData.postSessionTasks) : undefined,
          
          // Additional Details
          notes: formData.notes || undefined,
          tags: formData.tags.length > 0 ? JSON.stringify(formData.tags) : undefined,
          color: formData.color || undefined,
          
          // Status tracking
          status: formData.status,
          completionStatus: formData.completionStatus || undefined,
          actualStartTime: formData.actualStartTime || undefined,
          actualEndTime: formData.actualEndTime || undefined,
          cancellationReason: formData.cancellationReason || undefined,
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success("Event scheduled successfully!")
        router.push("/calendar")
      } else {
        toast.error(data.error || "Failed to schedule event")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error("Failed to schedule event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule New Event</h1>
          <p className="text-muted-foreground">Create a new calendar event or study session</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core details about the event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventType">
                  Event Type <span className="text-destructive">*</span>
                </Label>
                <select
                  id="eventType"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="study_session">Study Session</option>
                  <option value="assessment">Assessment/Exam</option>
                  <option value="blocked_time">Blocked Time</option>
                  <option value="rest_day">Rest Day</option>
                  <option value="milestone">Milestone</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <select
                  id="subject"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Study Session - Chapter 5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about this event..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Time & Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Time & Schedule</CardTitle>
            <CardDescription>When this event will occur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                id="allDay"
                checked={formData.allDay}
                onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked as boolean })}
              />
              <Label htmlFor="allDay" className="cursor-pointer">All Day Event</Label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              {!formData.allDay && (
                <div className="space-y-2">
                  <Label htmlFor="startTime">
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              {!formData.allDay && formData.endDate && (
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 60 })}
                min={1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recurrence */}
        <Card>
          <CardHeader>
            <CardTitle>Recurrence</CardTitle>
            <CardDescription>Set up recurring events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked as boolean })}
              />
              <Label htmlFor="isRecurring" className="cursor-pointer">This is a recurring event</Label>
            </div>

            {formData.isRecurring && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="recurrenceType">Repeat Pattern</Label>
                    <select
                      id="recurrenceType"
                      value={formData.recurrenceType}
                      onChange={(e) => setFormData({ ...formData, recurrenceType: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="none">None</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recurrenceFrequency">Every</Label>
                    <Input
                      id="recurrenceFrequency"
                      type="number"
                      value={formData.recurrenceFrequency}
                      onChange={(e) => setFormData({ ...formData, recurrenceFrequency: parseInt(e.target.value) || 1 })}
                      min={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recurrenceEndDate">Until</Label>
                    <Input
                      id="recurrenceEndDate"
                      type="date"
                      value={formData.recurrenceEndDate}
                      onChange={(e) => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Exception Dates</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={currentException}
                      onChange={(e) => setCurrentException(e.target.value)}
                      placeholder="Add exception date"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (currentException) {
                          addToArray("recurrenceExceptions", currentException)
                          setCurrentException("")
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.recurrenceExceptions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.recurrenceExceptions.map((date, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-sm">
                          {new Date(date).toLocaleDateString()}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeFromArray("recurrenceExceptions", index)}
                          />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>Extra information and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Library, Room 101"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparationRequired">Preparation Required</Label>
              <Textarea
                id="preparationRequired"
                value={formData.preparationRequired}
                onChange={(e) => setFormData({ ...formData, preparationRequired: e.target.value })}
                placeholder="What needs to be prepared before this event..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (currentTag) {
                        addToArray("tags", currentTag)
                        setCurrentTag("")
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (currentTag) {
                      addToArray("tags", currentTag)
                      setCurrentTag("")
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-sm">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeFromArray("tags", index)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reminders */}
        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
            <CardDescription>Get notified before the event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="reminderEnabled"
                checked={formData.reminderEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, reminderEnabled: checked as boolean })}
              />
              <Label htmlFor="reminderEnabled" className="cursor-pointer">Enable reminders</Label>
            </div>

            {formData.reminderEnabled && (
              <div className="space-y-2">
                <Label htmlFor="reminderMinutesBefore">Remind me (minutes before)</Label>
                <Input
                  id="reminderMinutesBefore"
                  type="number"
                  value={formData.reminderMinutesBefore}
                  onChange={(e) => setFormData({ ...formData, reminderMinutesBefore: parseInt(e.target.value) || 30 })}
                  min={0}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isFlexible"
                checked={formData.isFlexible}
                onCheckedChange={(checked) => setFormData({ ...formData, isFlexible: checked as boolean })}
              />
              <Label htmlFor="isFlexible" className="cursor-pointer">
                Flexible scheduling (can be moved if needed)
              </Label>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Event
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/calendar")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
