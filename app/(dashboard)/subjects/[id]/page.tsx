"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, TrendingUp, BookOpen, Calendar, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function SubjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.id as string

  const [subject, setSubject] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [performance, setPerformance] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!subjectId) return

    const userId = localStorage.getItem("userId") || "guest-user"

    // Fetch subject details
    Promise.all([
      fetch(`/api/v1/subjects?userId=${userId}`).then(r => r.json()),
      fetch(`/api/v1/sessions?userId=${userId}`).then(r => r.json()),
      fetch(`/api/v1/performance?userId=${userId}`).then(r => r.json()),
      fetch(`/api/v1/goals?userId=${userId}`).then(r => r.json()),
      fetch(`/api/v1/resources?userId=${userId}`).then(r => r.json())
    ])
      .then(([subjectsData, sessionsData, performanceData, goalsData, resourcesData]) => {
        // Find the specific subject
        if (subjectsData.success) {
          const foundSubject = subjectsData.data?.find((s: any) => s.id === subjectId)
          setSubject(foundSubject)
        }

        // Filter sessions for this subject
        if (sessionsData.success) {
          const subjectSessions = sessionsData.data?.filter((s: any) => s.subject_id === subjectId) || []
          setSessions(subjectSessions)
        }

        // Filter performance for this subject
        if (performanceData.success) {
          const subjectPerformance = performanceData.data?.filter((p: any) => p.subject_id === subjectId) || []
          setPerformance(subjectPerformance)
        }

        // Filter goals for this subject
        if (goalsData.success) {
          const subjectGoals = goalsData.data?.filter((g: any) => g.subject_id === subjectId || g.linked_subject_id === subjectId) || []
          setGoals(subjectGoals)
        }

        // Filter resources for this subject
        if (resourcesData.success) {
          const subjectResources = resourcesData.data?.filter((r: any) => r.primary_subject_id === subjectId) || []
          setResources(subjectResources)
        }

        setIsLoading(false)
      })
      .catch(error => {
        console.error("Error loading subject details:", error)
        setIsLoading(false)
      })
  }, [subjectId])

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return "Invalid date"
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return "Invalid date"
    }
  }

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return ""
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ""
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this subject? This will also delete all associated sessions, performance records, goals, and resources. This action cannot be undone.")) {
      return
    }

    try {
      const userId = localStorage.getItem("userId") || "guest-user"
      const response = await fetch(`/api/v1/subjects?id=${subjectId}&userId=${userId}`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        toast.success("Subject deleted successfully")
        router.push("/subjects")
      } else {
        toast.error("Failed to delete subject")
      }
    } catch (error) {
      console.error("Error deleting subject:", error)
      toast.error("Failed to delete subject")
    }
  }

  // Calculate statistics
  const totalHours = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60
  const avgFocus = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + (s.average_focus_score || 0), 0) / sessions.length 
    : 0
  const avgPerformance = performance.length > 0
    ? performance.reduce((sum, p) => sum + (p.percentage || 0), 0) / performance.length
    : 0

  // Prepare chart data for performance trend
  const performanceChartData = performance
    .sort((a, b) => new Date(a.assessment_date).getTime() - new Date(b.assessment_date).getTime())
    .map(p => ({
      date: formatDate(p.assessment_date),
      score: p.percentage || 0
    }))

  // Prepare chart data for study hours over time
  const studyHoursData = sessions
    .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
    .slice(-10) // Last 10 sessions
    .map(s => ({
      date: formatDate(s.started_at),
      hours: Number(((s.duration_minutes || 0) / 60).toFixed(2)),
      focus: s.average_focus_score || 0
    }))

  if (isLoading) {
    return (
      <div className="space-y-8">
        <p className="text-center text-muted-foreground py-8">Loading subject details...</p>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="space-y-8">
        <Link href="/subjects">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Subjects
          </Button>
        </Link>
        <p className="text-center text-muted-foreground py-8">Subject not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/subjects">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
            <p className="text-muted-foreground mt-1">
              {subject.category?.replace('_', ' ').toUpperCase()} • {subject.difficulty_level?.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/subjects/${subjectId}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Study Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Study Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{sessions.length}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Focus Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{avgFocus.toFixed(1)}/10</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{avgPerformance.toFixed(1)}%</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{performance.length} assessments</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Trend */}
        {performance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Score %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Study Hours Trend */}
        {sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Study Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={studyHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#10b981" name="Hours" />
                  <Bar dataKey="focus" fill="#8b5cf6" name="Focus" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Study Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No study sessions yet</p>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 10).map((session) => (
                <div 
                  key={session.id} 
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/sessions/${session.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatDate(session.started_at)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(session.started_at)} • {session.study_method?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {session.duration_minutes >= 60 
                        ? `${(session.duration_minutes / 60).toFixed(1)}h`
                        : session.duration_minutes > 0
                        ? `${session.duration_minutes}min`
                        : '0min'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Focus: {session.average_focus_score || 0}/10</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Records */}
      {performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performance.map((perf) => (
                <div key={perf.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{perf.assessment_type?.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(perf.assessment_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{perf.percentage}%</p>
                    <p className="text-sm text-muted-foreground">{perf.score_obtained}/{perf.total_score}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal) => (
                <div 
                  key={goal.id} 
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/goals/${goal.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{goal.goalName || goal.goal_name}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      goal.progressStatus === 'completed' || goal.progress_status === 'completed' ? 'bg-green-100 text-green-800' :
                      goal.progressStatus === 'active' || goal.progress_status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {goal.progressStatus || goal.progress_status || 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${goal.percentageComplete || goal.progress_percentage || 0}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {goal.currentValue || goal.current_value || 0} / {goal.targetValue || goal.target_value || 0} {goal.unit || 'units'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Study Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resources.map((resource) => (
                <div 
                  key={resource.id} 
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/resources/${resource.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{resource.resource_name || resource.resourceName}</p>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {resource.resource_type?.replace('_', ' ') || resource.resourceType?.replace('_', ' ') || 'Resource'}
                    </span>
                  </div>
                  {resource.author_creator && (
                    <p className="text-sm text-muted-foreground">by {resource.author_creator}</p>
                  )}
                  {(resource.current_progress_percentage > 0 || resource.currentProgressPercentage > 0) && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${resource.current_progress_percentage || resource.currentProgressPercentage || 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(resource.current_progress_percentage || resource.currentProgressPercentage || 0).toFixed(0)}% complete
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
