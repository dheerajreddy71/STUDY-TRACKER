"use client"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { StudyTrendsChart } from "@/components/dashboard/study-trends-chart"
import { SubjectBreakdown } from "@/components/dashboard/subject-breakdown"
import { StreakDisplay } from "@/components/gamification/streak-display"
import { AchievementsDisplay } from "@/components/gamification/achievements-display"
import { InsightsPanel } from "@/components/insights/insights-panel"
import { RecommendationsPanel } from "@/components/recommendations/recommendations-panel"
import { SpacedRepetitionPanel } from "@/components/spaced-repetition/spaced-repetition-panel"
import { LearningProfileCard } from "@/components/learning-profile/learning-profile-card"
import { SubjectAllocationPlanner } from "@/components/subject-allocation/subject-allocation-planner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, TrendingUp, Calendar, Brain, Clock, Target } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [streak, setStreak] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "guest-user"
    
    Promise.all([
      fetch(`/api/v1/analytics?userId=${userId}&period=week`).then(r => r.json()),
      fetch(`/api/v1/sessions?userId=${userId}`).then(r => r.json()),
      fetch(`/api/v1/achievements?userId=${userId}`).then(r => r.json()),
      fetch(`/api/v1/achievements/streaks?userId=${userId}`).then(r => r.json()),
    ]).then(([analyticsData, sessionsData, achievementsData, streakData]) => {
      if (analyticsData.success) {
        const data = analyticsData.data
        setStats({
          totalStudyHours: ((data.studyStats?.total_minutes || 0) / 60).toFixed(1),
          totalSessions: data.studyStats?.total_sessions || 0,
          averageFocusScore: data.studyStats?.avg_focus?.toFixed(1) || 0,
          averagePerformance: data.performanceStats?.[0]?.avg_percentage?.toFixed(1) || 0,
          completedGoals: 0,
          totalAchievements: achievementsData.data?.length || 0,
          currentStreak: streakData.data?.current_streak_days || 0,
        })
        
        // Map subject stats for SubjectBreakdown component
        if (data.subjectStats && data.subjectStats.length > 0) {
          const subjectsData = data.subjectStats.map((s: any) => ({
            id: s.id,
            name: s.name,
            color: s.color_theme || '#3b82f6',
            totalHours: Number(((s.total_minutes || 0) / 60).toFixed(1)),
            sessionCount: s.session_count || 0,
            avgFocus: Number((s.avg_focus || 0).toFixed(1)),
            avgPerformance: 0 // Will be populated from performanceStats if available
          }))
          
          // Merge with performance data if available
          if (data.performanceStats && data.performanceStats.length > 0) {
            subjectsData.forEach((subject: any) => {
              const perfData = data.performanceStats.find((p: any) => p.id === subject.id)
              if (perfData) {
                subject.avgPerformance = Number((perfData.avg_percentage || 0).toFixed(1))
              }
            })
          }
          
          setSubjects(subjectsData)
        }
      }
      
      // Prepare trend data from sessions
      if (sessionsData.success && sessionsData.data) {
        const sessions = sessionsData.data
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const dailyData: any = {}
        
        // Group sessions by day
        sessions.forEach((session: any) => {
          try {
            const date = new Date(session.started_at)
            const dayKey = dayNames[date.getDay()]
            
            if (!dailyData[dayKey]) {
              dailyData[dayKey] = { date: dayKey, hours: 0, sessions: 0, totalFocus: 0 }
            }
            
            dailyData[dayKey].hours += (session.duration_minutes || 0) / 60
            dailyData[dayKey].sessions += 1
            dailyData[dayKey].totalFocus += session.average_focus_score || 0
          } catch (e) {
            console.error("Error processing session for trends:", e)
          }
        })
        
        // Convert to array and calculate averages
        const trendsArray = Object.values(dailyData).map((day: any) => ({
          date: day.date,
          hours: Number(day.hours.toFixed(1)),
          sessions: day.sessions,
          avgFocus: day.sessions > 0 ? Number((day.totalFocus / day.sessions).toFixed(1)) : 0
        }))
        
        // Sort by day of week
        const dayOrder: any = { 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7 }
        trendsArray.sort((a, b) => dayOrder[a.date] - dayOrder[b.date])
        
        setTrendData(trendsArray)
      }
      
      if (achievementsData.success) {
        setAchievements(achievementsData.data || [])
      }
      if (streakData.success) {
        setStreak(streakData.data)
      }
      setIsLoading(false)
    }).catch(error => {
      console.error("Error loading dashboard:", error)
      setIsLoading(false)
    })
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's your study overview.</p>
        </div>
        <Link href="/sessions/new">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Start Session
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} isLoading={isLoading} />

      {/* Main Grid */}
      {!isLoading && stats && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Study Trends */}
          <div className="md:col-span-2">
            <StudyTrendsChart data={trendData} isLoading={isLoading} />
          </div>

          {/* Streak Display */}
          <StreakDisplay 
            currentStreak={stats.currentStreak || 0} 
            longestStreak={streak?.longest_streak_days || 0} 
            isLoading={isLoading} 
          />
        </div>
      )}

      {/* Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <SubjectBreakdown subjects={subjects} isLoading={isLoading} />
        <InsightsPanel />
      </div>

      {/* Smart Recommendations & Advanced Analytics */}
      {!isLoading && stats && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recommendations" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="recommendations" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Recommendations
                </TabsTrigger>
                <TabsTrigger value="retention" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Spaced Repetition
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Learning Profile
                </TabsTrigger>
                <TabsTrigger value="allocation" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Time Allocation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommendations" className="mt-6">
                <RecommendationsPanel userId={localStorage.getItem("userId") || "guest-user"} />
              </TabsContent>

              <TabsContent value="retention" className="mt-6">
                <SpacedRepetitionPanel userId={localStorage.getItem("userId") || "guest-user"} />
              </TabsContent>

              <TabsContent value="profile" className="mt-6">
                <LearningProfileCard userId={localStorage.getItem("userId") || "guest-user"} />
              </TabsContent>

              <TabsContent value="allocation" className="mt-6">
                <SubjectAllocationPlanner userId={localStorage.getItem("userId") || "guest-user"} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <AchievementsDisplay achievements={achievements} isLoading={isLoading} />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Start Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Begin a new study session</p>
            <Link href="/sessions/new">
              <Button variant="outline" className="w-full bg-transparent">
                View
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Log Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Record assessment results</p>
            <Link href="/performance/new">
              <Button variant="outline" className="w-full bg-transparent">
                View
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule Study
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Plan your study sessions</p>
            <Link href="/calendar">
              <Button variant="outline" className="w-full bg-transparent">
                View
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
