"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { Target, Plus, X, Calendar, TrendingUp } from "lucide-react"

export default function EditGoalPage() {
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [subjects, setSubjects] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    // Basic Information
    goalName: "",
    goalDescription: "",
    goalType: "study_hours", // What kind of goal (study_hours, performance_average, etc.)
    goalCategory: "weekly", // Time period (daily, weekly, monthly, semester, annual)
    subjectId: "",
    
    // Type & Metrics
    targetValue: 0,
    currentValue: 0,
    unit: "hours",
    
    // Timeline
    startDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: "",
    
    // Milestones
    milestones: [] as Array<{name: string, target: number, date: string, completed: boolean}>,
    currentMilestone: { name: "", target: 0, date: "", completed: false },
    
    // Priority & Motivation
    priorityLevel: "medium",
    importanceReason: "",
    motivationStatement: "",
    rewardOnCompletion: "",
    consequenceIfMissed: "",
    
    // Settings
    trackAutomatically: true,
    sendReminders: true,
    reminderFrequency: "weekly",
    reminderTime: "09:00",
    alertWhenBehind: true,
    celebrateMilestones: true,
    visibleOnDashboard: true
  })

  useEffect(() => {
    loadSubjects()
    loadGoal()
  }, [goalId])

  const loadSubjects = async () => {
    try {
      const userId = localStorage.getItem("userId") || "guest-user"
      const response = await fetch(`/api/v1/subjects?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setSubjects(data.data || [])
      }
    } catch (error) {
      console.error("Error loading subjects:", error)
    }
  }

  const loadGoal = async () => {
    try {
      setIsLoadingData(true)
      const userId = localStorage.getItem("userId") || "guest-user"
      const response = await fetch(`/api/v1/goals/${goalId}?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch goal")
      }
      
      const data = await response.json()
      
      // Handle both {success: true, data: goal} and direct goal object responses
      const goal = data.success ? data.data : data
      
      if (!goal || !goal.id) {
        toast.error("Goal not found")
        setTimeout(() => router.push("/goals"), 2000)
        return
      }
      
      // Parse milestones
      let parsedMilestones = []
      try {
        parsedMilestones = JSON.parse(goal.milestones || "[]")
      } catch (e) {
        console.error("Error parsing milestones:", e)
      }
      
      setFormData({
        goalName: goal.goal_name || goal.goalName || "",
        goalDescription: goal.goal_description || goal.goalDescription || "",
        goalType: goal.goal_type || goal.goalType || "study_hours",
        goalCategory: goal.goal_category || goal.goalCategory || "weekly",
        subjectId: goal.subject_id || goal.subjectId || "",
        targetValue: goal.target_value || goal.targetValue || 0,
        currentValue: goal.current_value || goal.currentValue || 0,
        unit: goal.unit || "hours",
        startDate: goal.start_date ? new Date(goal.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        targetCompletionDate: goal.target_completion_date ? new Date(goal.target_completion_date).toISOString().split('T')[0] : "",
        milestones: parsedMilestones,
        currentMilestone: { name: "", target: 0, date: "", completed: false },
        priorityLevel: goal.priority_level || goal.priorityLevel || "medium",
        importanceReason: goal.importance_reason || goal.importanceReason || "",
        motivationStatement: goal.motivation_statement || goal.motivationStatement || "",
        rewardOnCompletion: goal.reward_on_completion || goal.rewardOnCompletion || "",
        consequenceIfMissed: goal.consequence_if_missed || goal.consequenceIfMissed || "",
        trackAutomatically: Boolean(goal.track_automatically ?? goal.trackAutomatically ?? true),
        sendReminders: Boolean(goal.send_reminders ?? goal.sendReminders ?? true),
        reminderFrequency: goal.reminder_frequency || goal.reminderFrequency || "weekly",
        reminderTime: goal.reminder_time || goal.reminderTime || "09:00",
        alertWhenBehind: Boolean(goal.alert_when_behind ?? goal.alertWhenBehind ?? true),
        celebrateMilestones: Boolean(goal.celebrate_milestones ?? goal.celebrateMilestones ?? true),
        visibleOnDashboard: Boolean(goal.visible_on_dashboard ?? goal.visibleOnDashboard ?? true)
      })
    } catch (error) {
      console.error("Error loading goal:", error)
      toast.error("Failed to load goal")
      setTimeout(() => router.push("/goals"), 2000)
    } finally {
      setIsLoadingData(false)
    }
  }

  const addMilestone = () => {
    if (formData.currentMilestone.name.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, prev.currentMilestone],
        currentMilestone: { name: "", target: 0, date: "", completed: false }
      }))
    }
  }

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const userId = localStorage.getItem("userId") || "guest-user"

    if (!formData.goalName.trim()) {
      toast.error("Please enter a goal name")
      setIsLoading(false)
      return
    }

    if (!formData.targetCompletionDate) {
      toast.error("Please select a target completion date")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/v1/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: goalId,
          userId,
          subject_id: formData.subjectId || undefined,
          
          // Basic Information
          goal_name: formData.goalName,
          goal_description: formData.goalDescription || undefined,
          goal_type: formData.goalType,
          goal_category: formData.goalCategory,
          
          // Type & Metrics
          target_value: Number(formData.targetValue),
          current_value: Number(formData.currentValue),
          unit: formData.unit,
          
          // Timeline
          start_date: new Date(formData.startDate).toISOString(),
          target_completion_date: new Date(formData.targetCompletionDate).toISOString(),
          duration_days: Math.ceil((new Date(formData.targetCompletionDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)),
          
          // Milestones
          milestones: JSON.stringify(formData.milestones),
          
          // Priority & Motivation
          priority_level: formData.priorityLevel,
          importance_reason: formData.importanceReason || undefined,
          motivation_statement: formData.motivationStatement || undefined,
          reward_on_completion: formData.rewardOnCompletion || undefined,
          consequence_if_missed: formData.consequenceIfMissed || undefined,
          
          // Settings
          track_automatically: formData.trackAutomatically ? 1 : 0,
          send_reminders: formData.sendReminders ? 1 : 0,
          reminder_frequency: formData.reminderFrequency,
          reminder_time: formData.reminderTime,
          alert_when_behind: formData.alertWhenBehind ? 1 : 0,
          celebrate_milestones: formData.celebrateMilestones ? 1 : 0,
          visible_on_dashboard: formData.visibleOnDashboard ? 1 : 0,
          
          // Recalculate progress
          percentage_complete: formData.targetValue > 0 ? (formData.currentValue / formData.targetValue) * 100 : 0,
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success("Goal updated successfully!")
        router.push("/goals")
      } else {
        toast.error(data.error || "Failed to update goal")
      }
    } catch (error) {
      console.error("Error updating goal:", error)
      toast.error("Failed to update goal")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading goal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Goal</h1>
        <p className="text-muted-foreground mt-2">Update your goal details and progress</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="goalName"
                  placeholder="e.g., Study 100 hours for Finals"
                  value={formData.goalName}
                  onChange={(e) => setFormData({...formData, goalName: e.target.value})}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalDescription">Description</Label>
                <Textarea 
                  id="goalDescription"
                  placeholder="Describe your goal in detail..."
                  value={formData.goalDescription}
                  onChange={(e) => setFormData({...formData, goalDescription: e.target.value})}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="goalType">Goal Type <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.goalType}
                    onValueChange={(v) => setFormData({...formData, goalType: v})}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="goalType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study_hours">Study Hours</SelectItem>
                      <SelectItem value="session_count">Session Count</SelectItem>
                      <SelectItem value="performance_average">Performance Average</SelectItem>
                      <SelectItem value="streak_length">Streak Length</SelectItem>
                      <SelectItem value="subject_completion">Subject Completion</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goalCategory">Time Period <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.goalCategory}
                    onValueChange={(v) => setFormData({...formData, goalCategory: v})}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="goalCategory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="semester">Semester</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(v) => setFormData({...formData, subjectId: v})}
                  disabled={isLoading}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific subject</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Target & Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Target & Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Value <span className="text-destructive">*</span></Label>
                  <Input 
                    id="targetValue"
                    type="number"
                    step="0.01"
                    placeholder="100"
                    value={formData.targetValue || ""}
                    onChange={(e) => setFormData({...formData, targetValue: parseFloat(e.target.value) || 0})}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentValue">Current Value</Label>
                  <Input 
                    id="currentValue"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.currentValue || ""}
                    onChange={(e) => setFormData({...formData, currentValue: parseFloat(e.target.value) || 0})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input 
                    id="unit"
                    placeholder="hours, days, points"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {formData.targetValue > 0 && (
                <div className="p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Progress</p>
                  <p className="text-2xl font-bold">
                    {((formData.currentValue / formData.targetValue) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.currentValue} / {formData.targetValue} {formData.unit}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date <span className="text-destructive">*</span></Label>
                  <Input 
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Completion Date <span className="text-destructive">*</span></Label>
                  <Input 
                    id="targetDate"
                    type="date"
                    value={formData.targetCompletionDate}
                    onChange={(e) => setFormData({...formData, targetCompletionDate: e.target.value})}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {formData.startDate && formData.targetCompletionDate && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    Duration: <strong>
                      {Math.ceil((new Date(formData.targetCompletionDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                    </strong> days
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Milestone Name</Label>
                  <Input 
                    placeholder="e.g., First 25 hours"
                    value={formData.currentMilestone.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      currentMilestone: {...formData.currentMilestone, name: e.target.value}
                    })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Value</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="25"
                    value={formData.currentMilestone.target || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      currentMilestone: {...formData.currentMilestone, target: parseFloat(e.target.value) || 0}
                    })}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="date"
                      value={formData.currentMilestone.date}
                      onChange={(e) => setFormData({
                        ...formData,
                        currentMilestone: {...formData.currentMilestone, date: e.target.value}
                      })}
                      disabled={isLoading}
                    />
                    <Button 
                      type="button"
                      onClick={addMilestone}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {formData.milestones.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Milestones</Label>
                  <div className="space-y-2">
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={milestone.completed}
                            onCheckedChange={(checked) => {
                              const newMilestones = [...formData.milestones]
                              newMilestones[index].completed = checked as boolean
                              setFormData({...formData, milestones: newMilestones})
                            }}
                          />
                          <div>
                            <p className="font-medium">{milestone.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Target: {milestone.target} {formData.unit} by {new Date(milestone.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Priority & Motivation */}
          <Card>
            <CardHeader>
              <CardTitle>Priority & Motivation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="importance">Why is this goal important?</Label>
                <Textarea 
                  id="importance"
                  placeholder="Explain why achieving this goal matters to you..."
                  value={formData.importanceReason}
                  onChange={(e) => setFormData({...formData, importanceReason: e.target.value})}
                  disabled={isLoading}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation">Motivation Statement</Label>
                <Textarea 
                  id="motivation"
                  placeholder="What will keep you motivated to achieve this goal?"
                  value={formData.motivationStatement}
                  onChange={(e) => setFormData({...formData, motivationStatement: e.target.value})}
                  disabled={isLoading}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reward">Reward on Completion</Label>
                  <Input 
                    id="reward"
                    placeholder="How will you celebrate?"
                    value={formData.rewardOnCompletion}
                    onChange={(e) => setFormData({...formData, rewardOnCompletion: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consequence">Consequence if Missed</Label>
                  <Input 
                    id="consequence"
                    placeholder="What happens if you don't achieve this?"
                    value={formData.consequenceIfMissed}
                    onChange={(e) => setFormData({...formData, consequenceIfMissed: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Goal Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="trackAuto"
                    checked={formData.trackAutomatically}
                    onCheckedChange={(checked) => setFormData({...formData, trackAutomatically: checked as boolean})}
                    disabled={isLoading}
                  />
                  <Label htmlFor="trackAuto" className="cursor-pointer">
                    Track automatically from study sessions
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="reminders"
                    checked={formData.sendReminders}
                    onCheckedChange={(checked) => setFormData({...formData, sendReminders: checked as boolean})}
                    disabled={isLoading}
                  />
                  <Label htmlFor="reminders" className="cursor-pointer">
                    Send progress reminders
                  </Label>
                </div>

                {formData.sendReminders && (
                  <div className="ml-6 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Reminder Frequency</Label>
                      <Select
                        value={formData.reminderFrequency}
                        onValueChange={(v) => setFormData({...formData, reminderFrequency: v})}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="frequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Reminder Time</Label>
                      <Input 
                        id="time"
                        type="time"
                        value={formData.reminderTime}
                        onChange={(e) => setFormData({...formData, reminderTime: e.target.value})}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="alert"
                    checked={formData.alertWhenBehind}
                    onCheckedChange={(checked) => setFormData({...formData, alertWhenBehind: checked as boolean})}
                    disabled={isLoading}
                  />
                  <Label htmlFor="alert" className="cursor-pointer">
                    Alert me when falling behind schedule
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="celebrate"
                    checked={formData.celebrateMilestones}
                    onCheckedChange={(checked) => setFormData({...formData, celebrateMilestones: checked as boolean})}
                    disabled={isLoading}
                  />
                  <Label htmlFor="celebrate" className="cursor-pointer">
                    Celebrate milestone completions
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="visible"
                    checked={formData.visibleOnDashboard}
                    onCheckedChange={(checked) => setFormData({...formData, visibleOnDashboard: checked as boolean})}
                    disabled={isLoading}
                  />
                  <Label htmlFor="visible" className="cursor-pointer">
                    Show on dashboard
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/goals")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
