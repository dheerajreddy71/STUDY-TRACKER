"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Clock, BookOpen, Edit, Trash } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [scheduledSessions, setScheduledSessions] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const userId = localStorage.getItem("userId") || "guest-user"
      const [sessionsRes, analyticsRes, scheduledRes] = await Promise.all([
        fetch(`/api/v1/sessions?userId=${userId}`),
        fetch(`/api/v1/analytics?userId=${userId}&period=month`),
        fetch(`/api/v1/scheduled-sessions?userId=${userId}`)
      ])
      const sessionsData = await sessionsRes.json()
      const analyticsData = await analyticsRes.json()
      const scheduledData = await scheduledRes.json()

      const sessionsList = sessionsData.success ? sessionsData.data || [] : []
      setSessions(sessionsList)
      
      if (scheduledData.success) setScheduledSessions(scheduledData.data || [])
      
      // Calculate stats from sessions directly if analytics fails or returns 0
      if (analyticsData.success && analyticsData.data?.studyStats?.total_sessions > 0) {
        const data = analyticsData.data
        setStats({
          totalSessions: data.studyStats.total_sessions,
          totalHours: ((data.studyStats.total_minutes || 0) / 60).toFixed(1),
          avgFocusScore: data.studyStats.avg_focus?.toFixed(1) || 0
        })
      } else {
        // Fallback: calculate from sessions list
        const totalMinutes = sessionsList.reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0)
        const totalFocus = sessionsList.reduce((sum: number, s: any) => sum + (s.average_focus_score || 0), 0)
        setStats({
          totalSessions: sessionsList.length,
          totalHours: (totalMinutes / 60).toFixed(1),
          avgFocusScore: sessionsList.length > 0 ? (totalFocus / sessionsList.length).toFixed(1) : 0
        })
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadSessions() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this session? This action cannot be undone.")) return
    try {
      const res = await fetch(`/api/v1/sessions/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        setSessions(prev => prev.filter(s => s.id !== id))
        toast.success("Session deleted")
      } else {
        toast.error(json.error || "Failed to delete session")
      }
    } catch (err) {
      console.error("Error deleting session:", err)
      toast.error("Failed to delete session")
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Unknown date"
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return "Invalid date"
      
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffHours < 1) return "Just now"
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  const formatTime = (dateStr: string) => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return ""
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } catch (error) {
      return ""
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Categorize sessions
  const categorizeSessionsFunction = () => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const recent = sessions.filter((s: any) => {
      const sessionDate = new Date(s.started_at)
      return sessionDate >= sevenDaysAgo && sessionDate <= now
    })
    
    const past = sessions.filter((s: any) => {
      const sessionDate = new Date(s.started_at)
      return sessionDate < sevenDaysAgo
    })
    
    return { recent, past }
  }

  const { recent: recentSessions, past: pastSessions } = categorizeSessionsFunction()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Sessions</h1>
          <p className="text-muted-foreground mt-2">Track and manage your study sessions</p>
        </div>
        <Link href="/sessions/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-3xl font-bold">{isLoading ? "..." : stats?.totalSessions || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-3xl font-bold">{isLoading ? "..." : stats?.totalHours || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Avg Focus Score</p>
              <p className="text-3xl font-bold">{isLoading ? "..." : `${stats?.avgFocusScore || 0}/10`}</p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Scheduled Sessions */}
        {scheduledSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledSessions
                  .filter(s => new Date(s.scheduled_date) >= new Date())
                  .slice(0, 5)
                  .map((scheduled) => (
                    <div key={scheduled.id} className="flex justify-between items-center p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium capitalize">{scheduled.study_method?.replace('_', ' ') || 'Study Session'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(scheduled.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {scheduled.scheduled_time} • {scheduled.duration_minutes}min
                          </p>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/sessions/new">Start Now</Link>
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Sessions (Last 7 Days) */}
        {recentSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Completed within the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Link href={`/sessions/${session.id}`} className="flex items-center gap-4 flex-1 no-underline">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{session.subject_name || "Unknown Subject"}</p>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                          <span>{formatDate(session.started_at)}</span>
                          {session.started_at && (
                            <span>• Started: {formatTime(session.started_at)}</span>
                          )}
                          {session.ended_at && (
                            <span>• Ended: {formatTime(session.ended_at)}</span>
                          )}
                          {session.study_method && (
                            <span>• {session.study_method}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/sessions/${session.id}/edit`} className="p-2 rounded hover:bg-muted/25">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(session.id)} className="p-2 rounded hover:bg-red-50" aria-label={`Delete session ${session.id}`}>
                          <Trash className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{formatDuration(session.duration_minutes || 0)}</span>
                        </div>
                        {session.average_focus_score && (
                          <span className="text-xs text-muted-foreground">
                            Focus: {session.average_focus_score}/10
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Sessions (Older than 7 Days) */}
        {pastSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Past Sessions</CardTitle>
              <CardDescription>Completed more than 7 days ago</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastSessions.slice(0, 10).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Link href={`/sessions/${session.id}`} className="flex items-center gap-4 flex-1 no-underline">
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{session.subject_name || "Unknown Subject"}</p>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-1">
                          <span>{formatDate(session.started_at)}</span>
                          {session.started_at && (
                            <span>• Started: {formatTime(session.started_at)}</span>
                          )}
                          {session.ended_at && (
                            <span>• Ended: {formatTime(session.ended_at)}</span>
                          )}
                          {session.study_method && (
                            <span>• {session.study_method}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/sessions/${session.id}/edit`} className="p-2 rounded hover:bg-muted/25">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(session.id)} className="p-2 rounded hover:bg-red-50" aria-label={`Delete session ${session.id}`}>
                          <Trash className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{formatDuration(session.duration_minutes || 0)}</span>
                        </div>
                        {session.average_focus_score && (
                          <span className="text-xs text-muted-foreground">
                            Focus: {session.average_focus_score}/10
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && sessions.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No study sessions yet</p>
                <p className="text-sm mt-2">Start your first session to track your progress!</p>
                <Button asChild className="mt-4">
                  <Link href="/sessions/new">Start Session</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">Loading sessions...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
