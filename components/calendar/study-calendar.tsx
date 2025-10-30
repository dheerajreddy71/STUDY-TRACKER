"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"

interface StudySession {
  id: string
  started_at: string
  subject_id: string
  study_method: string
  actual_duration_minutes?: number
}

interface StudyCalendarProps {
  sessions: StudySession[]
  subjects: any[]
  onDateSelect?: (date: Date) => void
  isLoading?: boolean
}

export function StudyCalendar({ sessions, subjects, onDateSelect, isLoading }: StudyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      onDateSelect?.(date)
    }
  }

  // Get sessions for selected date
  const selectedDateStr = selectedDate.toISOString().split("T")[0]
  const sessionsForDate = sessions.filter((s) => s.started_at.split("T")[0] === selectedDateStr)

  // Get all dates with sessions
  const datesWithSessions = new Set(sessions.map((s) => s.started_at.split("T")[0]))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              const dateStr = date.toISOString().split("T")[0]
              return !datesWithSessions.has(dateStr)
            }}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Sessions for {selectedDate.toLocaleDateString()}</CardTitle>
          <CardDescription>{sessionsForDate.length} session(s) scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
          ) : sessionsForDate.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No sessions scheduled for this date</div>
          ) : (
            <div className="space-y-3">
              {sessionsForDate.map((session) => {
                const subject = subjects.find((s) => s.id === session.subject_id)
                return (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject?.color_theme || "#3B82F6" }}
                      />
                      <div>
                        <p className="font-medium">{subject?.name || "Unknown Subject"}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {session.study_method.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{session.actual_duration_minutes || 0} min</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.started_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
