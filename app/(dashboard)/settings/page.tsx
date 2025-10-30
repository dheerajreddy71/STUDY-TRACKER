"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "guest-user"
    
    fetch(`/api/v1/auth/user?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setUser(data.data)
          setFormData(data.data)
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Error loading user:", error)
        toast.error("Failed to load user settings")
        setIsLoading(false)
      })
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
    
    // Apply theme immediately when changed
    if (field === "theme") {
      setTheme(value)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const userId = localStorage.getItem("userId") || "guest-user"
      const response = await fetch(`/api/v1/auth/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, updates: formData })
      })

      const data = await response.json()
      
      if (data.success) {
        setUser(data.data)
        toast.success("Settings saved successfully!")
      } else {
        toast.error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your preferences, notifications, and account settings</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="study">Study</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
        </TabsList>

        {/* SECTION 1: BASIC INFORMATION */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Your name" 
                    value={formData.name || ""} 
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={formData.email || ""} 
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
              </div>

              <Separator />

              <div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 2: ACADEMIC CONTEXT */}
        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Context</CardTitle>
              <CardDescription>Information about your educational background and current studies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution Name</Label>
                  <Input 
                    id="institution" 
                    placeholder="University/College name" 
                    value={formData.institution || ""} 
                    onChange={(e) => handleInputChange("institution", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major_program">Major/Program</Label>
                  <Input 
                    id="major_program" 
                    placeholder="Your field of study" 
                    value={formData.major_program || ""} 
                    onChange={(e) => handleInputChange("major_program", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="current_year">Current Year</Label>
                  <Select 
                    value={formData.current_year?.toString() || "1"} 
                    onValueChange={(value) => handleInputChange("current_year", parseInt(value))}
                  >
                    <SelectTrigger id="current_year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Freshman / Year 1</SelectItem>
                      <SelectItem value="2">Sophomore / Year 2</SelectItem>
                      <SelectItem value="3">Junior / Year 3</SelectItem>
                      <SelectItem value="4">Senior / Year 4</SelectItem>
                      <SelectItem value="5">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_semester">Current Semester</Label>
                  <Select 
                    value={formData.current_semester || "fall"} 
                    onValueChange={(value) => handleInputChange("current_semester", value)}
                  >
                    <SelectTrigger id="current_semester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="winter">Winter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education_level">Education Level</Label>
                  <Select 
                    value={formData.education_level || "undergraduate"} 
                    onValueChange={(value) => handleInputChange("education_level", value)}
                  >
                    <SelectTrigger id="education_level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_school">High School</SelectItem>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                      <SelectItem value="postgraduate">Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input 
                    id="timezone" 
                    placeholder="e.g., America/New_York" 
                    value={formData.timezone || "UTC"} 
                    onChange={(e) => handleInputChange("timezone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    placeholder="Your country" 
                    value={formData.country || ""} 
                    onChange={(e) => handleInputChange("country", e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 3: STUDY PREFERENCES */}
        <TabsContent value="study" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Preferences</CardTitle>
              <CardDescription>Customize your study habits and environment preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preferred_session_duration">Preferred Session Duration (minutes)</Label>
                  <Input 
                    id="preferred_session_duration" 
                    type="number" 
                    min="15" 
                    max="180" 
                    placeholder="45" 
                    value={formData.preferred_session_duration || 45} 
                    onChange={(e) => handleInputChange("preferred_session_duration", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avg_available_hours_per_day">Available Hours Per Day</Label>
                  <Input 
                    id="avg_available_hours_per_day" 
                    type="number" 
                    min="0.5" 
                    max="24" 
                    step="0.5" 
                    placeholder="3.0" 
                    value={formData.avg_available_hours_per_day || 3.0} 
                    onChange={(e) => handleInputChange("avg_available_hours_per_day", parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="learning_style">Learning Style</Label>
                  <Select 
                    value={formData.learning_style || "visual"} 
                    onValueChange={(value) => handleInputChange("learning_style", value)}
                  >
                    <SelectTrigger id="learning_style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditory">Auditory</SelectItem>
                      <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                      <SelectItem value="reading-writing">Reading/Writing</SelectItem>
                      <SelectItem value="multimodal">Multimodal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="energy_peak_time">Energy Peak Time</Label>
                  <Select 
                    value={formData.energy_peak_time || formData.energy_level || "morning"} 
                    onValueChange={(value) => handleInputChange("energy_peak_time", value)}
                  >
                    <SelectTrigger id="energy_peak_time">
                      <SelectValue placeholder="When are you most alert?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12 PM - 6 PM)</SelectItem>
                      <SelectItem value="evening">Evening (6 PM - 10 PM)</SelectItem>
                      <SelectItem value="night">Night (10 PM - 2 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="study_environment_preference">Study Environment</Label>
                  <Select 
                    value={formData.study_environment_preference || "quiet"} 
                    onValueChange={(value) => handleInputChange("study_environment_preference", value)}
                  >
                    <SelectTrigger id="study_environment_preference">
                      <SelectValue placeholder="Preferred environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiet">Quiet (library-like)</SelectItem>
                      <SelectItem value="moderate">Moderate noise</SelectItem>
                      <SelectItem value="busy">Busy (cafe-like)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="focus_music_preference">Focus Music</Label>
                  <Select 
                    value={formData.focus_music_preference || "sometimes"} 
                    onValueChange={(value) => handleInputChange("focus_music_preference", value)}
                  >
                    <SelectTrigger id="focus_music_preference">
                      <SelectValue placeholder="Music preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, always</SelectItem>
                      <SelectItem value="sometimes">Sometimes</SelectItem>
                      <SelectItem value="no">No, never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="distraction_level">Distraction Level</Label>
                  <Select 
                    value={formData.distraction_level || "medium"} 
                    onValueChange={(value) => handleInputChange("distraction_level", value)}
                  >
                    <SelectTrigger id="distraction_level">
                      <SelectValue placeholder="How easily distracted?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="procrastination_tendency">Procrastination</Label>
                  <Select 
                    value={formData.procrastination_tendency || "medium"} 
                    onValueChange={(value) => handleInputChange("procrastination_tendency", value)}
                  >
                    <SelectTrigger id="procrastination_tendency">
                      <SelectValue placeholder="Tendency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="break_preference">Break Preference</Label>
                  <Select 
                    value={formData.break_preference || "short-frequent"} 
                    onValueChange={(value) => handleInputChange("break_preference", value)}
                  >
                    <SelectTrigger id="break_preference">
                      <SelectValue placeholder="Break style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short-frequent">Short & Frequent</SelectItem>
                      <SelectItem value="long-infrequent">Long & Infrequent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 4: NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control what notifications you receive and when</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications_enabled">Enable All Notifications</Label>
                  <p className="text-sm text-muted-foreground">Master toggle for all notifications</p>
                </div>
                <Switch 
                  id="notifications_enabled" 
                  checked={formData.notifications_enabled !== 0}
                  onCheckedChange={(checked) => handleInputChange("notifications_enabled", checked ? 1 : 0)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify_study_reminders">Study Reminders</Label>
                    <p className="text-sm text-muted-foreground">Remind you to start study sessions</p>
                  </div>
                  <Switch 
                    id="notify_study_reminders" 
                    checked={formData.notify_study_reminders !== 0}
                    onCheckedChange={(checked) => handleInputChange("notify_study_reminders", checked ? 1 : 0)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify_break_reminders">Break Reminders</Label>
                    <p className="text-sm text-muted-foreground">Remind you to take breaks</p>
                  </div>
                  <Switch 
                    id="notify_break_reminders" 
                    checked={formData.notify_break_reminders !== 0}
                    onCheckedChange={(checked) => handleInputChange("notify_break_reminders", checked ? 1 : 0)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify_review_reminders">Review Reminders</Label>
                    <p className="text-sm text-muted-foreground">Spaced repetition review alerts</p>
                  </div>
                  <Switch 
                    id="notify_review_reminders" 
                    checked={formData.notify_review_reminders !== 0}
                    onCheckedChange={(checked) => handleInputChange("notify_review_reminders", checked ? 1 : 0)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify_goal_progress">Goal Progress Updates</Label>
                    <p className="text-sm text-muted-foreground">Updates on your goal progress</p>
                  </div>
                  <Switch 
                    id="notify_goal_progress" 
                    checked={formData.notify_goal_progress !== 0}
                    onCheckedChange={(checked) => handleInputChange("notify_goal_progress", checked ? 1 : 0)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify_goal_deadlines">Goal Deadline Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alerts when goals are due soon</p>
                  </div>
                  <Switch 
                    id="notify_goal_deadlines" 
                    checked={formData.notify_goal_deadlines !== 0}
                    onCheckedChange={(checked) => handleInputChange("notify_goal_deadlines", checked ? 1 : 0)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify_streak_alerts">Streak Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify about streaks at risk</p>
                  </div>
                  <Switch 
                    id="notify_streak_alerts" 
                    checked={formData.notify_streak_alerts !== 0}
                    onCheckedChange={(checked) => handleInputChange("notify_streak_alerts", checked ? 1 : 0)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify_performance_insights">Performance Insights</Label>
                    <p className="text-sm text-muted-foreground">AI-generated study insights</p>
                  </div>
                  <Switch 
                    id="notify_performance_insights" 
                    checked={formData.notify_performance_insights !== 0}
                    onCheckedChange={(checked) => handleInputChange("notify_performance_insights", checked ? 1 : 0)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify_burnout_warnings">Burnout Warnings</Label>
                    <p className="text-sm text-muted-foreground">Alerts when you're overworking</p>
                  </div>
                  <Switch 
                    id="notify_burnout_warnings" 
                    checked={formData.notify_burnout_warnings !== 0}
                    onCheckedChange={(checked) => handleInputChange("notify_burnout_warnings", checked ? 1 : 0)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify_achievements">Achievement Unlocks</Label>
                    <p className="text-sm text-muted-foreground">Celebrate your achievements</p>
                  </div>
                  <Switch 
                    id="notify_achievements" 
                    checked={formData.notify_achievements !== 0}
                    onCheckedChange={(checked) => handleInputChange("notify_achievements", checked ? 1 : 0)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Quiet Hours</h4>
                <p className="text-sm text-muted-foreground">Set times when you don't want to receive notifications</p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quiet_hours_start">Start Time</Label>
                    <Input 
                      id="quiet_hours_start" 
                      type="time" 
                      value={formData.quiet_hours_start || ""} 
                      onChange={(e) => handleInputChange("quiet_hours_start", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet_hours_end">End Time</Label>
                    <Input 
                      id="quiet_hours_end" 
                      type="time" 
                      value={formData.quiet_hours_end || ""} 
                      onChange={(e) => handleInputChange("quiet_hours_end", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder_advance_minutes">Reminder Advance Time (minutes)</Label>
                  <Input 
                    id="reminder_advance_minutes" 
                    type="number" 
                    min="0" 
                    max="60" 
                    placeholder="15" 
                    value={formData.reminder_advance_minutes || 15} 
                    onChange={(e) => handleInputChange("reminder_advance_minutes", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">How many minutes before events to send reminders</p>
                </div>
              </div>

              <Separator />

              <div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 5: DISPLAY PREFERENCES */}
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>Customize how information is displayed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select 
                    value={formData.theme || "system"} 
                    onValueChange={(value) => handleInputChange("theme", value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <Select 
                    value={formData.primary_color || "blue"} 
                    onValueChange={(value) => handleInputChange("primary_color", value)}
                  >
                    <SelectTrigger id="primary_color">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dashboard_layout">Dashboard Layout</Label>
                  <Select 
                    value={formData.dashboard_layout || "default"} 
                    onValueChange={(value) => handleInputChange("dashboard_layout", value)}
                  >
                    <SelectTrigger id="dashboard_layout">
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chart_style">Chart Style</Label>
                  <Select 
                    value={formData.chart_style || "line"} 
                    onValueChange={(value) => handleInputChange("chart_style", value)}
                  >
                    <SelectTrigger id="chart_style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date_format">Date Format</Label>
                  <Select 
                    value={formData.date_format || "MM/DD/YYYY"} 
                    onValueChange={(value) => handleInputChange("date_format", value)}
                  >
                    <SelectTrigger id="date_format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time_format">Time Format</Label>
                  <Select 
                    value={formData.time_format || "12h"} 
                    onValueChange={(value) => handleInputChange("time_format", value)}
                  >
                    <SelectTrigger id="time_format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12-hour</SelectItem>
                      <SelectItem value="24h">24-hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first_day_of_week">First Day of Week</Label>
                  <Select 
                    value={formData.first_day_of_week || "Monday"} 
                    onValueChange={(value) => handleInputChange("first_day_of_week", value)}
                  >
                    <SelectTrigger id="first_day_of_week">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                      <SelectItem value="Monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show_motivational_quotes">Show Motivational Quotes</Label>
                  <p className="text-sm text-muted-foreground">Display inspirational quotes on dashboard</p>
                </div>
                <Switch 
                  id="show_motivational_quotes" 
                  checked={formData.show_motivational_quotes !== 0}
                  onCheckedChange={(checked) => handleInputChange("show_motivational_quotes", checked ? 1 : 0)}
                />
              </div>

              <Separator />

              <div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 6: GOAL SETTINGS */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Goal Settings</CardTitle>
              <CardDescription>Set your default targets and expectations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weekly_study_hours_goal">Weekly Study Hours Goal</Label>
                  <Input 
                    id="weekly_study_hours_goal" 
                    type="number" 
                    min="1" 
                    max="100" 
                    step="0.5" 
                    placeholder="20.0" 
                    value={formData.weekly_study_hours_goal || 20.0} 
                    onChange={(e) => handleInputChange("weekly_study_hours_goal", parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Target hours of study per week</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily_session_goal">Daily Session Goal</Label>
                  <Input 
                    id="daily_session_goal" 
                    type="number" 
                    min="1" 
                    max="10" 
                    placeholder="2" 
                    value={formData.daily_session_goal || 2} 
                    onChange={(e) => handleInputChange("daily_session_goal", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Number of study sessions per day</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min_session_duration">Minimum Session Duration (minutes)</Label>
                  <Input 
                    id="min_session_duration" 
                    type="number" 
                    min="5" 
                    max="60" 
                    placeholder="15" 
                    value={formData.min_session_duration || 15} 
                    onChange={(e) => handleInputChange("min_session_duration", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Minimum time to count as a session</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_performance_score">Target Performance Score (%)</Label>
                  <Input 
                    id="target_performance_score" 
                    type="number" 
                    min="0" 
                    max="100" 
                    placeholder="80.0" 
                    value={formData.target_performance_score || 80.0} 
                    onChange={(e) => handleInputChange("target_performance_score", parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Your target grade percentage</p>
                </div>
              </div>

              <Separator />

              <div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 7: PRIVACY */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data</CardTitle>
              <CardDescription>Control how your data is used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics_tracking">Analytics Tracking</Label>
                  <p className="text-sm text-muted-foreground">Help improve the app by sharing usage data</p>
                </div>
                <Switch 
                  id="analytics_tracking" 
                  checked={formData.analytics_tracking !== 0}
                  onCheckedChange={(checked) => handleInputChange("analytics_tracking", checked ? 1 : 0)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data_sharing">Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">Share anonymized data for research</p>
                </div>
                <Switch 
                  id="data_sharing" 
                  checked={formData.data_sharing !== 0}
                  onCheckedChange={(checked) => handleInputChange("data_sharing", checked ? 1 : 0)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Download My Data
                  </Button>
                  <p className="text-xs text-muted-foreground">Export all your data in JSON format</p>
                </div>
                
                <div className="space-y-2">
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                  <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                </div>
              </div>

              <Separator />

              <div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 8: APPEARANCE */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel (links to Display settings)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Most appearance settings are available in the <strong>Display</strong> tab.
              </p>

              <Separator />

              <div>
                <Button variant="outline" onClick={() => {
                  const displayTab = document.querySelector('[value="display"]') as HTMLElement
                  displayTab?.click()
                }}>
                  Go to Display Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 9: GAMIFICATION */}
        <TabsContent value="gamification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gamification</CardTitle>
              <CardDescription>Your progress, achievements, and stats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="gamification_enabled">Enable Gamification</Label>
                  <p className="text-sm text-muted-foreground">Show XP, levels, achievements, and badges</p>
                </div>
                <Switch 
                  id="gamification_enabled" 
                  checked={formData.gamification_enabled !== 0}
                  onCheckedChange={(checked) => handleInputChange("gamification_enabled", checked ? 1 : 0)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Your Stats</h4>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">XP Points</p>
                    <p className="text-2xl font-bold">{formData.xp_points || 0}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Current Level</p>
                    <p className="text-2xl font-bold">Level {formData.current_level || 1}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Study Streak</p>
                    <p className="text-2xl font-bold">{formData.current_streak_days || 0} days</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Longest Streak</p>
                    <p className="text-xl font-semibold">{formData.longest_streak_days || 0} days</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
