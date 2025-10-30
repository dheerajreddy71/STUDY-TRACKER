"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

interface PreferencesFormProps {
  preferences: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function PreferencesForm({ preferences, onSubmit, isLoading }: PreferencesFormProps) {
  const [formData, setFormData] = useState({
    theme: preferences?.theme || "light",
    fontSize: preferences?.font_size || "medium",
    timeFormat: preferences?.time_format || "24h",
    weekStartDay: preferences?.week_start_day || "monday",
    timezone: preferences?.timezone || "UTC",
    defaultSessionDuration: preferences?.default_session_duration_minutes || 50,
    breakInterval: preferences?.break_interval_minutes || 25,
    focusCheckinFrequency: preferences?.focus_checkin_frequency_minutes || 15,
    autoNotifications: preferences?.notifications_enabled ?? true,
    studyReminders: preferences?.study_reminders_enabled ?? true,
    breakReminders: preferences?.break_reminders_enabled ?? true,
    performanceReminders: preferences?.performance_reminders_enabled ?? true,
    insightNotifications: preferences?.insight_notifications_enabled ?? true,
    achievementNotifications: preferences?.achievement_notifications_enabled ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      theme: formData.theme,
      font_size: formData.fontSize,
      time_format: formData.timeFormat,
      week_start_day: formData.weekStartDay,
      timezone: formData.timezone,
      default_session_duration_minutes: Number.parseInt(formData.defaultSessionDuration.toString()),
      break_interval_minutes: Number.parseInt(formData.breakInterval.toString()),
      focus_checkin_frequency_minutes: Number.parseInt(formData.focusCheckinFrequency.toString()),
      notifications_enabled: formData.autoNotifications,
      study_reminders_enabled: formData.studyReminders,
      break_reminders_enabled: formData.breakReminders,
      performance_reminders_enabled: formData.performanceReminders,
      insight_notifications_enabled: formData.insightNotifications,
      achievement_notifications_enabled: formData.achievementNotifications,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>Customize how the app looks and feels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select value={formData.theme} onValueChange={(value) => setFormData({ ...formData, theme: value })}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fontSize">Font Size</Label>
            <Select value={formData.fontSize} onValueChange={(value) => setFormData({ ...formData, fontSize: value })}>
              <SelectTrigger id="fontSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time & Location</CardTitle>
          <CardDescription>Set your timezone and time preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">Eastern</SelectItem>
                <SelectItem value="CST">Central</SelectItem>
                <SelectItem value="MST">Mountain</SelectItem>
                <SelectItem value="PST">Pacific</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="timeFormat">Time Format</Label>
            <Select
              value={formData.timeFormat}
              onValueChange={(value) => setFormData({ ...formData, timeFormat: value })}
            >
              <SelectTrigger id="timeFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12 Hour</SelectItem>
                <SelectItem value="24h">24 Hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="weekStart">Week Starts On</Label>
            <Select
              value={formData.weekStartDay}
              onValueChange={(value) => setFormData({ ...formData, weekStartDay: value })}
            >
              <SelectTrigger id="weekStart">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Study Session Defaults</CardTitle>
          <CardDescription>Configure default session parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="sessionDuration">Default Session Duration (minutes)</Label>
            <input
              id="sessionDuration"
              type="number"
              min="5"
              step="5"
              value={formData.defaultSessionDuration}
              onChange={(e) => setFormData({ ...formData, defaultSessionDuration: Number.parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <Label htmlFor="breakInterval">Break Interval (minutes)</Label>
            <input
              id="breakInterval"
              type="number"
              min="5"
              step="5"
              value={formData.breakInterval}
              onChange={(e) => setFormData({ ...formData, breakInterval: Number.parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <Label htmlFor="focusCheckin">Focus Check-in Frequency (minutes)</Label>
            <input
              id="focusCheckin"
              type="number"
              min="5"
              step="5"
              value={formData.focusCheckinFrequency}
              onChange={(e) => setFormData({ ...formData, focusCheckinFrequency: Number.parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Control what notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoNotifications">Enable All Notifications</Label>
            <Switch
              id="autoNotifications"
              checked={formData.autoNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, autoNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="studyReminders">Study Reminders</Label>
            <Switch
              id="studyReminders"
              checked={formData.studyReminders}
              onCheckedChange={(checked) => setFormData({ ...formData, studyReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="breakReminders">Break Reminders</Label>
            <Switch
              id="breakReminders"
              checked={formData.breakReminders}
              onCheckedChange={(checked) => setFormData({ ...formData, breakReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="performanceReminders">Performance Reminders</Label>
            <Switch
              id="performanceReminders"
              checked={formData.performanceReminders}
              onCheckedChange={(checked) => setFormData({ ...formData, performanceReminders: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="insightNotifications">Insight Notifications</Label>
            <Switch
              id="insightNotifications"
              checked={formData.insightNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, insightNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="achievementNotifications">Achievement Notifications</Label>
            <Switch
              id="achievementNotifications"
              checked={formData.achievementNotifications}
              onCheckedChange={(checked) => setFormData({ ...formData, achievementNotifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : "Save Preferences"}
      </Button>
    </form>
  )
}
