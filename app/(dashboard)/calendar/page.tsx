"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Filter,
  Loader2
} from "lucide-react"
import Link from "next/link"

type CalendarEvent = {
  id: string
  event_type: string
  title: string
  description?: string
  subject_id?: string
  subject_name?: string
  color_code?: string
  start_datetime: string
  end_datetime?: string
  duration_minutes?: number
  all_day: number
  is_recurring: number
  recurrence_pattern?: string
  status: string
  created_at: string
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [currentDate, view])

  const loadData = async () => {
    setIsLoading(true)
    const userId = localStorage.getItem("userId") || "guest-user"

    try {
      // Calculate date range based on view
      const { startDate, endDate } = getDateRange()

      const [eventsData, subjectsData] = await Promise.all([
        fetch(`/api/v1/calendar?userId=${userId}&startDate=${startDate}&endDate=${endDate}`).then(r => r.json()),
        fetch(`/api/v1/subjects?userId=${userId}`).then(r => r.json())
      ])

      setEvents(eventsData || [])
      if (subjectsData.success) {
        setSubjects(subjectsData.data || [])
      }
    } catch (error) {
      console.error("Error loading calendar data:", error)
      toast.error("Failed to load calendar data")
    } finally {
      setIsLoading(false)
    }
  }

  const getDateRange = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const day = currentDate.getDate()

    let startDate: string
    let endDate: string

    if (view === "month") {
      startDate = new Date(year, month, 1).toISOString()
      endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
    } else if (view === "week") {
      const dayOfWeek = currentDate.getDay()
      const startOfWeek = new Date(year, month, day - dayOfWeek)
      const endOfWeek = new Date(year, month, day - dayOfWeek + 6, 23, 59, 59)
      startDate = startOfWeek.toISOString()
      endDate = endOfWeek.toISOString()
    } else {
      startDate = new Date(year, month, day, 0, 0, 0).toISOString()
      endDate = new Date(year, month, day, 23, 59, 59).toISOString()
    }

    return { startDate, endDate }
  }

  const navigateCalendar = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const formatDateHeader = () => {
    if (view === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    } else if (view === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    } else {
      return currentDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    }
  }

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      study_session: "bg-blue-500",
      assessment: "bg-red-500",
      blocked_time: "bg-gray-500",
      rest_day: "bg-green-500",
      milestone: "bg-purple-500",
      custom: "bg-orange-500"
    }
    return colors[type] || "bg-blue-500"
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      planned: { variant: "outline" as const, label: "Planned" },
      completed: { variant: "default" as const, label: "Completed" },
      missed: { variant: "destructive" as const, label: "Missed" },
      rescheduled: { variant: "secondary" as const, label: "Rescheduled" },
      cancelled: { variant: "outline" as const, label: "Cancelled" }
    }
    const config = variants[status] || variants.planned
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredEvents = events.filter(event => {
    if (filterSubject !== "all" && event.subject_id !== filterSubject) return false
    if (filterType !== "all" && event.event_type !== filterType) return false
    return true
  })

  const groupEventsByDate = () => {
    const grouped: Record<string, CalendarEvent[]> = {}
    filteredEvents.forEach(event => {
      const dateKey = new Date(event.start_datetime).toLocaleDateString()
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(event)
    })
    return grouped
  }

  const eventsByDate = groupEventsByDate()

  const todayEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.start_datetime).toDateString()
    return eventDate === new Date().toDateString()
  })

  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.start_datetime) > new Date())
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
    .slice(0, 5)

  const stats = {
    total: filteredEvents.length,
    planned: filteredEvents.filter(e => e.status === "planned").length,
    completed: filteredEvents.filter(e => e.status === "completed").length,
    today: todayEvents.length
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendar & Study Planning</h1>
          <p className="text-muted-foreground">Schedule and manage your study sessions</p>
        </div>
        <Link href="/calendar/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Event
          </Button>
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planned</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.planned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Controls */}
      <Card>
        <CardHeader>
          <CardTitle>View & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* View Selector */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <CalendarIcon className="w-4 h-4" />
                View
              </label>
              <div className="flex gap-1">
                <Button
                  variant={view === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("month")}
                >
                  Month
                </Button>
                <Button
                  variant={view === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("week")}
                >
                  Week
                </Button>
                <Button
                  variant={view === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("day")}
                >
                  Day
                </Button>
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4" />
                Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4" />
                Event Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="study_session">Study Session</option>
                <option value="assessment">Assessment</option>
                <option value="blocked_time">Blocked Time</option>
                <option value="rest_day">Rest Day</option>
                <option value="milestone">Milestone</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Navigation */}
            <div>
              <label className="text-sm font-medium mb-2 block">Navigate</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateCalendar("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateCalendar("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Display */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Events List */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{formatDateHeader()}</CardTitle>
              <CardDescription>
                {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} in this {view}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(eventsByDate).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No events scheduled for this period</p>
                    <p className="text-sm">Click "Schedule Event" to create one</p>
                  </div>
                ) : (
                  Object.entries(eventsByDate)
                    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                    .map(([date, dateEvents]) => (
                      <div key={date} className="border-l-2 border-primary pl-4">
                        <h3 className="font-semibold mb-2">{date}</h3>
                        <div className="space-y-2">
                          {dateEvents.map(event => (
                            <Link key={event.id} href={`/calendar/${event.id}`}>
                              <div className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.event_type)}`} />
                                      <span className="font-medium">{event.title}</span>
                                      {event.subject_name && (
                                        <Badge variant="outline" style={{ borderColor: event.color_code }}>
                                          {event.subject_name}
                                        </Badge>
                                      )}
                                      {getStatusBadge(event.status)}
                                    </div>
                                    {event.description && (
                                      <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(event.start_datetime).toLocaleTimeString("en-US", {
                                          hour: "2-digit",
                                          minute: "2-digit"
                                        })}
                                      </span>
                                      {event.duration_minutes && (
                                        <span>{event.duration_minutes} min</span>
                                      )}
                                      {event.is_recurring === 1 && (
                                        <Badge variant="secondary" className="text-xs">Recurring</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {todayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events scheduled for today</p>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map(event => (
                    <div key={event.id} className="text-sm p-2 rounded border">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.start_datetime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="text-sm p-2 rounded border">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.start_datetime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric"
                        })} at {new Date(event.start_datetime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
