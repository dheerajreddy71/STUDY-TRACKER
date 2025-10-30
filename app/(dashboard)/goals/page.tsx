"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  Target, Plus, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, 
  Clock, Calendar, Bookmark, Flag, Play, Pause, Archive, Trash2,
  Filter, Search, Trophy, BarChart3
} from "lucide-react"
import Link from "next/link"

export default function GoalsPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<any[]>([])
  const [filteredGoals, setFilteredGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadGoals()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [goals, filterStatus, filterPriority, filterCategory, searchQuery])

  const loadGoals = async () => {
    try {
      setIsLoading(true)
      const userId = localStorage.getItem("userId") || "guest-user"
      const response = await fetch(`/api/v1/goals?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setGoals(data.data || [])
      } else {
        toast.error("Failed to load goals")
      }
    } catch (error) {
      console.error("Error loading goals:", error)
      toast.error("Failed to load goals")
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...goals]

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(goal => goal.progressStatus === filterStatus)
    }

    // Filter by priority
    if (filterPriority !== "all") {
      filtered = filtered.filter(goal => goal.priorityLevel === filterPriority)
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter(goal => goal.goalCategory === filterCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(goal => 
        goal.goalName?.toLowerCase().includes(query) ||
        goal.goalDescription?.toLowerCase().includes(query)
      )
    }

    setFilteredGoals(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500"
      case "active": return "bg-blue-500"
      case "paused": return "bg-yellow-500"
      case "failed": return "bg-red-500"
      case "archived": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive"
      case "high": return "default"
      case "medium": return "secondary"
      case "low": return "outline"
      default: return "outline"
    }
  }

  const getOnTrackColor = (status: string) => {
    switch (status) {
      case "ahead": return "text-green-600"
      case "on_track": return "text-blue-600"
      case "behind": return "text-orange-600"
      case "at_risk": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  const getOnTrackIcon = (status: string) => {
    switch (status) {
      case "ahead": return <TrendingUp className="h-4 w-4" />
      case "on_track": return <Target className="h-4 w-4" />
      case "behind": return <TrendingDown className="h-4 w-4" />
      case "at_risk": return <AlertCircle className="h-4 w-4" />
      default: return null
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getDaysRemaining = (targetDate: string) => {
    if (!targetDate) return null
    const target = new Date(targetDate)
    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const parseMilestones = (milestonesJson: string) => {
    try {
      return JSON.parse(milestonesJson || "[]")
    } catch {
      return []
    }
  }

  const stats = {
    total: goals.length,
    active: goals.filter(g => g.progressStatus === "active").length,
    completed: goals.filter(g => g.progressStatus === "completed").length,
    atRisk: goals.filter(g => g.onTrackStatus === "at_risk").length,
    avgProgress: goals.length > 0 ? goals.reduce((sum, g) => sum + (g.percentageComplete || 0), 0) / goals.length : 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading goals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-2">Track and achieve your study goals</p>
        </div>
        <Link href="/goals/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.atRisk}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </label>
              <Input
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Status
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Priority
              </label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Category
              </label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="study_hours">Study Hours</SelectItem>
                  <SelectItem value="performance_score">Performance Score</SelectItem>
                  <SelectItem value="streak">Streak</SelectItem>
                  <SelectItem value="subject_mastery">Subject Mastery</SelectItem>
                  <SelectItem value="habit_formation">Habit Formation</SelectItem>
                  <SelectItem value="assessment_prep">Assessment Prep</SelectItem>
                  <SelectItem value="skill_development">Skill Development</SelectItem>
                  <SelectItem value="time_management">Time Management</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
            <h3 className="mt-4 text-lg font-semibold">No goals found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery || filterStatus !== "all" || filterPriority !== "all" || filterCategory !== "all"
                ? "Try adjusting your filters"
                : "Create your first goal to start tracking your progress"}
            </p>
            {goals.length === 0 && (
              <Link href="/goals/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Goal
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredGoals.map((goal) => {
            const milestones = parseMilestones(goal.milestones)
            const completedMilestones = milestones.filter((m: any) => m.completed).length
            const daysRemaining = getDaysRemaining(goal.targetCompletionDate)

            return (
              <Card key={goal.id} className={goal.bookmarked ? "border-primary" : ""}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-semibold">{goal.goalName}</h3>
                          {goal.bookmarked && <Bookmark className="h-4 w-4 fill-primary text-primary" />}
                          <Badge variant={getPriorityColor(goal.priorityLevel)} className="capitalize">
                            {goal.priorityLevel}
                          </Badge>
                          <Badge variant="outline" className={`capitalize ${getStatusColor(goal.progressStatus)} text-white`}>
                            {goal.progressStatus}
                          </Badge>
                          <Badge variant="secondary" className="capitalize">
                            {goal.goalCategory?.replace("_", " ")}
                          </Badge>
                          {goal.onTrackStatus && (
                            <Badge variant="outline" className={`flex items-center gap-1 ${getOnTrackColor(goal.onTrackStatus)}`}>
                              {getOnTrackIcon(goal.onTrackStatus)}
                              <span className="capitalize">{goal.onTrackStatus.replace("_", " ")}</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-2">{goal.goalDescription}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Progress</span>
                        <span className="text-muted-foreground">
                          {goal.currentValue?.toFixed(1) || 0} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      <Progress value={goal.percentageComplete || 0} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{goal.percentageComplete?.toFixed(1) || 0}% Complete</span>
                        {daysRemaining !== null && (
                          <span className={daysRemaining < 0 ? "text-red-500" : daysRemaining < 7 ? "text-orange-500" : ""}>
                            {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Milestones */}
                    {milestones.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            Milestones
                          </span>
                          <span className="text-muted-foreground">
                            {completedMilestones} / {milestones.length} completed
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {milestones.map((milestone: any, index: number) => (
                            <Badge 
                              key={index} 
                              variant={milestone.completed ? "default" : "outline"}
                              className={milestone.completed ? "bg-green-600" : ""}
                            >
                              {milestone.completed && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {milestone.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid gap-3 md:grid-cols-2 pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Start:</span>
                        <span className="font-medium">{formatDate(goal.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Target:</span>
                        <span className="font-medium">{formatDate(goal.targetCompletionDate)}</span>
                      </div>
                      {goal.averageDailyProgress > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Avg Daily:</span>
                          <span className="font-medium">{goal.averageDailyProgress?.toFixed(2)} {goal.unit}/day</span>
                        </div>
                      )}
                      {goal.consistencyScore > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Consistency:</span>
                          <span className="font-medium">{(goal.consistencyScore * 100).toFixed(0)}%</span>
                        </div>
                      )}
                      {goal.motivationStatement && (
                        <div className="md:col-span-2 flex items-start gap-2 text-sm">
                          <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <span className="text-muted-foreground">Motivation:</span>
                            <p className="font-medium italic">&quot;{goal.motivationStatement}&quot;</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t flex-wrap">
                      <Link href={`/goals/${goal.id}/edit`}>
                        <Button variant="outline" size="sm">
                          View/Edit Details
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          const newValue = prompt(`Update progress for ${goal.goalName}\n\nCurrent: ${goal.currentValue} ${goal.unit}\nEnter new value:`, goal.currentValue?.toString() || "0")
                          if (newValue !== null && !isNaN(parseFloat(newValue))) {
                            try {
                              const userId = localStorage.getItem("userId") || "guest-user"
                              const response = await fetch("/api/v1/goals", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  id: goal.id,
                                  userId,
                                  current_value: parseFloat(newValue),
                                  percentage_complete: goal.targetValue > 0 ? (parseFloat(newValue) / goal.targetValue) * 100 : 0
                                })
                              })
                              const data = await response.json()
                              if (response.ok) {
                                toast.success("Progress updated!")
                                loadGoals()
                              } else {
                                toast.error(data.error || "Failed to update progress")
                              }
                            } catch (error) {
                              toast.error("Failed to update progress")
                            }
                          }
                        }}
                      >
                        Update Progress
                      </Button>
                      {goal.progressStatus === "active" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const userId = localStorage.getItem("userId") || "guest-user"
                              const response = await fetch("/api/v1/goals", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  id: goal.id,
                                  userId,
                                  progress_status: "paused"
                                })
                              })
                              const data = await response.json()
                              if (response.ok) {
                                toast.success("Goal paused")
                                loadGoals()
                              } else {
                                toast.error(data.error || "Failed to pause goal")
                              }
                            } catch (error) {
                              toast.error("Failed to pause goal")
                            }
                          }}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {goal.progressStatus === "paused" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const userId = localStorage.getItem("userId") || "guest-user"
                              const response = await fetch("/api/v1/goals", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  id: goal.id,
                                  userId,
                                  progress_status: "active"
                                })
                              })
                              const data = await response.json()
                              if (response.ok) {
                                toast.success("Goal resumed")
                                loadGoals()
                              } else {
                                toast.error(data.error || "Failed to resume goal")
                              }
                            } catch (error) {
                              toast.error("Failed to resume goal")
                            }
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          try {
                            const userId = localStorage.getItem("userId") || "guest-user"
                            const response = await fetch("/api/v1/goals", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                id: goal.id,
                                userId,
                                progress_status: "archived"
                              })
                            })
                            const data = await response.json()
                            if (response.ok) {
                              toast.success("Goal archived")
                              loadGoals()
                            } else {
                              toast.error(data.error || "Failed to archive goal")
                            }
                          } catch (error) {
                            toast.error("Failed to archive goal")
                          }
                        }}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Archive
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete "${goal.goalName}"? This cannot be undone.`)) {
                            try {
                              const userId = localStorage.getItem("userId") || "guest-user"
                              const response = await fetch(`/api/v1/goals?id=${goal.id}&userId=${userId}`, {
                                method: "DELETE"
                              })
                              const data = await response.json()
                              if (response.ok) {
                                toast.success("Goal deleted")
                                loadGoals()
                              } else {
                                toast.error(data.error || "Failed to delete goal")
                              }
                            } catch (error) {
                              toast.error("Failed to delete goal")
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
