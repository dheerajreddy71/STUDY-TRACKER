"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useState, useEffect } from "react"

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessions, setSessions] = useState<any[]>([])

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "guest-user"
    
    // Fetch analytics stats
    Promise.all([
      fetch(`/api/v1/analytics?userId=${userId}&period=week`).then(r => r.json()),
      fetch(`/api/v1/sessions?userId=${userId}`).then(r => r.json())
    ])
      .then(([analyticsData, sessionsData]) => {
        if (analyticsData.success) {
          setStats(analyticsData.data)
        }
        if (sessionsData.success) {
          setSessions(sessionsData.data || [])
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Error loading analytics:", error)
        setIsLoading(false)
      })
  }, [])

  // Prepare daily chart data from sessions
  const prepareDailyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const dailyData = days.map(day => ({ day, hours: 0, focus: 0, count: 0 }))
    
    sessions.forEach((session: any) => {
      try {
        const date = new Date(session.started_at)
        const dayIndex = (date.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0
        if (dailyData[dayIndex]) {
          dailyData[dayIndex].hours += (session.duration_minutes || 0) / 60
          dailyData[dayIndex].focus += session.average_focus_score || 0
          dailyData[dayIndex].count += 1
        }
      } catch (e) {
        console.error("Error processing session date:", e)
      }
    })
    
    // Calculate average focus per day
    return dailyData.map(day => ({
      ...day,
      hours: Number(day.hours.toFixed(1)),
      focus: day.count > 0 ? Number((day.focus / day.count).toFixed(1)) : 0
    }))
  }

  // Prepare subject chart data
  const prepareSubjectData = () => {
    if (!stats?.subjectStats) return []
    
    const totalMinutes = stats.subjectStats.reduce((sum: number, s: any) => sum + (s.total_minutes || 0), 0)
    if (totalMinutes === 0) return []
    
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    
    return stats.subjectStats
      .filter((s: any) => s.total_minutes > 0)
      .map((s: any, index: number) => ({
        name: s.name,
        value: Number(((s.total_minutes / totalMinutes) * 100).toFixed(1)),
        color: s.color_theme || colors[index % colors.length]
      }))
  }

  const studyData = prepareDailyData()
  const subjectData = prepareSubjectData()
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">Analyze your study patterns and performance</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="methods">Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Study Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : ((stats?.studyStats?.total_minutes || 0) / 60).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Focus Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : `${stats?.studyStats?.avg_focus?.toFixed(1) || 0}/10`}
                </p>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : stats?.studyStats?.total_sessions || 0}
                </p>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : `${stats?.performanceStats?.[0]?.avg_percentage?.toFixed(1) || 0}%`}
                </p>
                <p className="text-xs text-muted-foreground">Overall</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Study Hours & Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hours" fill="#3b82f6" name="Hours" />
                  <Bar dataKey="focus" fill="#10b981" name="Focus Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={studyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="focus" stroke="#3b82f6" name="Focus Score" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Study Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {subjectData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No subject data available yet.</p>
                    <p className="text-sm mt-2">Start studying to see your distribution!</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {subjectData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 60}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {!stats?.subjectStats || stats.subjectStats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No subject statistics available.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {stats.subjectStats
                      .filter((s: any) => s.session_count > 0)
                      .map((subject: any) => (
                        <div key={subject.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: subject.color_theme || '#3b82f6' }}
                            />
                            <div>
                              <p className="font-medium">{subject.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {subject.session_count} session{subject.session_count !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{(subject.total_minutes / 60).toFixed(1)}h</p>
                            <p className="text-xs text-muted-foreground">
                              Focus: {subject.avg_focus?.toFixed(1) || 0}/10
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Study Method Effectiveness</CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.methodStats || stats.methodStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No study methods data available yet.</p>
                  <p className="text-sm mt-2">Start tracking your sessions to see method effectiveness!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.methodStats.map((method: any) => {
                    const effectiveness = method.avg_focus ? (method.avg_focus / 10) * 100 : 0
                    return (
                      <div key={method.study_method} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium capitalize">{method.study_method?.replace(/_/g, ' ') || 'Unknown'}</span>
                          <span className="text-sm text-muted-foreground">
                            {method.session_count} session{method.session_count !== 1 ? 's' : ''} • {(method.total_minutes / 60).toFixed(1)}h
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ width: `${effectiveness}%` }} 
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{effectiveness.toFixed(1)}% effectiveness</span>
                          <span className="text-muted-foreground">Avg focus: {method.avg_focus?.toFixed(1) || 0}/10</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
