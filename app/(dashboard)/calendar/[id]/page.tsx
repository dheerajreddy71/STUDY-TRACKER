"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Calendar, Clock, MapPin, Target } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CalendarEventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!eventId) return

    const userId = localStorage.getItem("userId") || "guest-user"

    fetch(`/api/v1/calendar/${eventId}?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setEvent(data)
        } else {
          toast.error("Failed to load event")
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Error loading event:", error)
        toast.error("Failed to load event")
        setIsLoading(false)
      })
  }, [eventId])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return
    }

    try {
      const userId = localStorage.getItem("userId") || "guest-user"
      const response = await fetch(`/api/v1/calendar?id=${eventId}&userId=${userId}`, {
        method: "DELETE"
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success("Event deleted successfully")
        router.push("/calendar")
      } else {
        toast.error(data.error || "Failed to delete event")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast.error("Failed to delete event")
    }
  }

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "N/A"
    try {
      return new Date(dateStr).toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return "N/A"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white"
      case "in_progress": return "bg-blue-500 text-white"
      case "planned": return "bg-gray-500 text-white"
      case "cancelled": return "bg-red-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-muted-foreground mb-4">Event not found</p>
        <Link href="/calendar">
          <Button>Back to Calendar</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/calendar">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            {event.description && (
              <p className="text-muted-foreground mt-1">{event.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/calendar/${eventId}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status and Type */}
      <div className="flex gap-2 flex-wrap">
        <Badge className={getStatusColor(event.status)}>
          {event.status?.replace('_', ' ')}
        </Badge>
        <Badge variant="secondary">
          {event.event_type?.replace('_', ' ')}
        </Badge>
        {event.priority && (
          <Badge variant="outline" className="capitalize">
            {event.priority} Priority
          </Badge>
        )}
      </div>

      {/* Main Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Start Time</p>
                <p className="text-sm text-muted-foreground">{formatDateTime(event.start_datetime)}</p>
              </div>
            </div>
            {event.end_datetime && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">End Time</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(event.end_datetime)}</p>
                </div>
              </div>
            )}
            {event.duration_minutes && (
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {event.duration_minutes >= 60 
                      ? `${Math.floor(event.duration_minutes / 60)}h ${event.duration_minutes % 60}m`
                      : `${event.duration_minutes}m`
                    }
                  </p>
                </div>
              </div>
            )}
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {event.subject_name && (
              <div>
                <p className="text-muted-foreground">Subject</p>
                <p className="font-medium">{event.subject_name}</p>
              </div>
            )}

            {event.session_type && (
              <div>
                <p className="text-muted-foreground">Session Type</p>
                <p className="font-medium capitalize">{event.session_type.replace('_', ' ')}</p>
              </div>
            )}

            {event.study_method && (
              <div>
                <p className="text-muted-foreground">Study Method</p>
                <p className="font-medium capitalize">{event.study_method.replace('_', ' ')}</p>
              </div>
            )}

            {event.difficulty && (
              <div>
                <p className="text-muted-foreground">Difficulty</p>
                <p className="font-medium capitalize">{event.difficulty}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes and Preparation */}
      {(event.notes || event.preparation_required) && (
        <Card>
          <CardHeader>
            <CardTitle>Notes & Preparation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.preparation_required && (
              <div>
                <p className="text-sm font-medium mb-1">Preparation Required</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.preparation_required}
                </p>
              </div>
            )}
            {event.notes && (
              <div>
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recurrence Info */}
      {event.is_recurring === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Recurrence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              This is a recurring event
              {event.recurrence_end_date && ` until ${formatDateTime(event.recurrence_end_date)}`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
