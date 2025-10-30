/**
 * Subject Allocation Planner
 * Weekly time distribution visualization with priority indicators
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  BookOpen,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Calendar
} from 'lucide-react'

interface SubjectAllocation {
  subjectId: string
  subjectName: string
  attentionNeedScore: number
  recommendedWeeklyHours: number
  currentWeeklyHours: number
  gap: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  reasons: string[]
  nextDeadline?: string
  urgencyFactor: number
}

interface AllocationPlan {
  totalAvailableHours: number
  allocations: SubjectAllocation[]
  weeklySchedule: Record<string, Array<{
    subjectId: string
    duration: number
    timeWindow: string
    reason: string
  }>>
}

export function SubjectAllocationPlanner({ 
  userId, 
  availableHours = 20 
}: { 
  userId: string
  availableHours?: number 
}) {
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<AllocationPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hours, setHours] = useState(availableHours)

  const fetchAllocationPlan = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/v1/subject-allocation?userId=${userId}&hours=${hours}&action=plan`)
      
      if (res.ok) {
        const data = await res.json()
        setPlan(data.data)
      } else {
        setError('Failed to generate allocation plan')
      }
    } catch (err) {
      setError('Failed to load allocation plan')
      console.error('Error fetching allocation:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchAllocationPlan()
    }
  }, [userId, hours])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !plan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Study Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || 'No data available'}</AlertDescription>
          </Alert>
          <Button onClick={fetchAllocationPlan} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const criticalSubjects = plan.allocations.filter(a => a.priority === 'critical')
  const highPrioritySubjects = plan.allocations.filter(a => a.priority === 'high')
  const totalAllocated = plan.allocations.reduce((sum, a) => sum + a.recommendedWeeklyHours, 0)

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.totalAvailableHours}h</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllocated.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {((totalAllocated / plan.totalAvailableHours) * 100).toFixed(0)}% capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalSubjects.length}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highPrioritySubjects.length}</div>
            <p className="text-xs text-muted-foreground">Important subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalSubjects.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Priority Subjects</AlertTitle>
          <AlertDescription>
            {criticalSubjects.map(s => s.subjectName).join(', ')} need immediate attention based on deadlines and performance gaps.
          </AlertDescription>
        </Alert>
      )}

      {/* Subject Allocations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recommended Time Distribution
          </CardTitle>
          <CardDescription>
            Based on performance gaps, deadlines, and difficulty levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plan.allocations.map((allocation) => (
              <div
                key={allocation.subjectId}
                className={`border rounded-lg p-4 ${getPriorityColor(allocation.priority)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{allocation.subjectName}</h4>
                      <Badge variant={getPriorityBadgeVariant(allocation.priority)}>
                        {allocation.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Attention Score: {allocation.attentionNeedScore.toFixed(0)}/100
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {allocation.recommendedWeeklyHours.toFixed(1)}h
                    </div>
                    <p className="text-xs text-muted-foreground">recommended</p>
                  </div>
                </div>

                {/* Current vs Recommended */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current:</span>
                    <span className="font-medium">{allocation.currentWeeklyHours.toFixed(1)}h/week</span>
                  </div>
                  
                  {allocation.gap !== 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gap:</span>
                      <div className="flex items-center gap-1">
                        {allocation.gap > 0 ? (
                          <>
                            <TrendingUp className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-red-600">
                              +{allocation.gap.toFixed(1)}h needed
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-600">
                              {Math.abs(allocation.gap).toFixed(1)}h ahead
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <Progress 
                    value={(allocation.currentWeeklyHours / allocation.recommendedWeeklyHours) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Reasons */}
                <div className="space-y-1">
                  {allocation.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="mt-1">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Deadline */}
                {allocation.nextDeadline && (
                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next Deadline:</span>
                    <span className="font-medium">
                      {new Date(allocation.nextDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week's Schedule
          </CardTitle>
          <CardDescription>Suggested daily distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(plan.weeklySchedule).map(([day, sessions]) => {
              if (sessions.length === 0) return null
              
              const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0)
              
              return (
                <div key={day} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{day}</h4>
                    <Badge variant="outline">{totalHours.toFixed(1)}h total</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {sessions.map((session, idx) => {
                      const subject = plan.allocations.find(a => a.subjectId === session.subjectId)
                      return (
                        <div key={idx} className="flex items-center justify-between text-sm bg-accent rounded px-3 py-2">
                          <div className="flex-1">
                            <span className="font-medium">{subject?.subjectName || 'Unknown'}</span>
                            <span className="text-muted-foreground ml-2">
                              ({session.timeWindow})
                            </span>
                          </div>
                          <span className="font-medium">{(session.duration * 60).toFixed(0)}min</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={fetchAllocationPlan} variant="outline" className="flex-1">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Plan
        </Button>
        <Button onClick={() => {/* TODO: Export to calendar */}} className="flex-1">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Apply to Calendar
        </Button>
      </div>
    </div>
  )
}
