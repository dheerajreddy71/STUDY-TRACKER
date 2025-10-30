"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Edit, Trash2, Target, Calendar, TrendingUp, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = params.id as string

  const [goal, setGoal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!goalId) return

    const userId = localStorage.getItem("userId") || "guest-user"

    fetch(`/api/v1/goals/${goalId}?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setGoal(data.data)
        } else {
          toast.error("Failed to load goal")
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Error loading goal:", error)
        toast.error("Failed to load goal")
        setIsLoading(false)
      })
  }, [goalId])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this goal? This action cannot be undone.")) {
      return
    }

    try {
      const userId = localStorage.getItem("userId") || "guest-user"
      const response = await fetch(`/api/v1/goals?id=${goalId}&userId=${userId}`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        toast.success("Goal deleted successfully")
        router.push("/goals")
      } else {
        toast.error("Failed to delete goal")
      }
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast.error("Failed to delete goal")
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return "N/A"
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white"
      case "active": return "bg-blue-500 text-white"
      case "paused": return "bg-yellow-500 text-white"
      case "failed": return "bg-red-500 text-white"
      default: return "bg-gray-500 text-white"
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading goal...</p>
        </div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-muted-foreground mb-4">Goal not found</p>
        <Link href="/goals">
          <Button>Back to Goals</Button>
        </Link>
      </div>
    )
  }

  const daysRemaining = getDaysRemaining(goal.targetDate || goal.target_completion_date)
  const milestones = parseMilestones(goal.milestones)

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/goals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{goal.goalName || goal.goal_name}</h1>
            <p className="text-muted-foreground mt-1">{goal.goalDescription || goal.goal_description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/goals/${goalId}/edit`}>
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

      {/* Status Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant={getPriorityColor(goal.priorityLevel || goal.priority_level)} className="capitalize">
          {goal.priorityLevel || goal.priority_level} Priority
        </Badge>
        <Badge className={getStatusColor(goal.progressStatus || goal.progress_status)}>
          {goal.progressStatus || goal.progress_status}
        </Badge>
        <Badge variant="secondary" className="capitalize">
          {(goal.goalCategory || goal.goal_category)?.replace("_", " ")}
        </Badge>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Current Progress</span>
              <span className="text-muted-foreground">
                {goal.currentValue || goal.current_value || 0} / {goal.targetValue || goal.target_value} {goal.unit}
              </span>
            </div>
            <Progress value={goal.percentageComplete || goal.progress_percentage || 0} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{(goal.percentageComplete || goal.progress_percentage || 0).toFixed(1)}% Complete</span>
              {daysRemaining !== null && (
                <span className={daysRemaining < 0 ? "text-red-500" : daysRemaining < 7 ? "text-orange-500" : ""}>
                  {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatDate(goal.startDate || goal.start_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Target Date</p>
                <p className="font-medium">{formatDate(goal.targetDate || goal.target_completion_date)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      {milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((milestone: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className={`p-1 rounded-full ${milestone.completed ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {milestone.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-gray-400 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {milestone.name}
                    </p>
                    {milestone.targetDate && (
                      <p className="text-xs text-muted-foreground">Target: {formatDate(milestone.targetDate)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goal.importanceReason && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Why This Matters</p>
              <p className="text-sm">{goal.importanceReason || goal.importance_reason}</p>
            </div>
          )}
          
          {goal.motivationStatement && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Motivation</p>
              <p className="text-sm italic">&quot;{goal.motivationStatement || goal.motivation_statement}&quot;</p>
            </div>
          )}

          {goal.successCriteria && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Success Criteria</p>
              <p className="text-sm">{goal.successCriteria || goal.success_criteria}</p>
            </div>
          )}

          {goal.notesPrivateThoughts && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{goal.notesPrivateThoughts || goal.notes_private_thoughts}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
