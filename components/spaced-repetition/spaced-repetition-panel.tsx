/**
 * Spaced Repetition Review Panel
 * Displays items due for review with forgetting curve visualization
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown,
  Calendar,
  RefreshCw
} from 'lucide-react'

interface SpacedRepetitionItem {
  id: string
  topicName: string
  chapterReference?: string
  subjectId: string
  nextReviewDate: string
  reviewCount: number
  memoryStrength: number
  retentionEstimate?: number
  lastReviewDate?: string
}

interface ReviewReminder {
  priority: 'urgent' | 'high' | 'medium'
  title: string
  description: string
  items: SpacedRepetitionItem[]
}

export function SpacedRepetitionPanel({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true)
  const [itemsDue, setItemsDue] = useState<SpacedRepetitionItem[]>([])
  const [topicsAtRisk, setTopicsAtRisk] = useState<SpacedRepetitionItem[]>([])
  const [reminders, setReminders] = useState<ReviewReminder[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchReviewData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [dueRes, riskRes, remindersRes] = await Promise.all([
        fetch(`/api/v1/spaced-repetition?userId=${userId}&action=due`),
        fetch(`/api/v1/spaced-repetition?userId=${userId}&action=at-risk&threshold=60`),
        fetch(`/api/v1/spaced-repetition?userId=${userId}&action=reminders`)
      ])

      if (dueRes.ok) {
        const data = await dueRes.json()
        setItemsDue(data.data || [])
      }

      if (riskRes.ok) {
        const data = await riskRes.json()
        setTopicsAtRisk(data.data || [])
      }

      if (remindersRes.ok) {
        const data = await remindersRes.json()
        setReminders(data.data || [])
      }
    } catch (err) {
      setError('Failed to load review data')
      console.error('Error fetching review data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchReviewData()
    }
  }, [userId])

  const getRetentionColor = (retention: number) => {
    if (retention >= 75) return 'text-green-600'
    if (retention >= 60) return 'text-yellow-600'
    if (retention >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50'
      case 'high': return 'border-orange-500 bg-orange-50'
      case 'medium': return 'border-yellow-500 bg-yellow-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Spaced Repetition Review
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Spaced Repetition Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchReviewData} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const totalDue = itemsDue.length
  const criticalRisk = topicsAtRisk.filter(t => (t.retentionEstimate || 0) < 40).length

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDue}</div>
            <p className="text-xs text-muted-foreground">
              {totalDue === 0 ? 'All caught up!' : 'Topics need review'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalRisk}</div>
            <p className="text-xs text-muted-foreground">
              Below 40% retention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracked</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itemsDue.length + topicsAtRisk.length}</div>
            <p className="text-xs text-muted-foreground">
              Active topics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reminders */}
      {reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Review Reminders
            </CardTitle>
            <CardDescription>Priority notifications based on forgetting curve</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reminders.map((reminder, idx) => (
              <div
                key={idx}
                className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(reminder.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getPriorityBadgeVariant(reminder.priority)}>
                        {reminder.priority.toUpperCase()}
                      </Badge>
                      <span className="font-semibold">{reminder.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {reminder.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {reminder.items.slice(0, 5).map((item) => (
                        <Badge key={item.id} variant="outline" className="text-xs">
                          {item.topicName}
                          {item.retentionEstimate !== undefined && (
                            <span className={`ml-2 ${getRetentionColor(item.retentionEstimate)}`}>
                              {item.retentionEstimate.toFixed(0)}%
                            </span>
                          )}
                        </Badge>
                      ))}
                      {reminder.items.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{reminder.items.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Items Due Today */}
      {itemsDue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Review Schedule - Today
            </CardTitle>
            <CardDescription>Topics scheduled for review today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {itemsDue.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.topicName}</h4>
                      {item.chapterReference && (
                        <p className="text-sm text-muted-foreground">{item.chapterReference}</p>
                      )}
                    </div>
                    <Badge variant="outline">
                      Review #{item.reviewCount + 1}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Memory Strength:</span>
                      <span className="font-medium">{item.memoryStrength.toFixed(1)} days</span>
                    </div>
                    
                    {item.retentionEstimate !== undefined && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Estimated Retention:</span>
                          <span className={`font-medium ${getRetentionColor(item.retentionEstimate)}`}>
                            {item.retentionEstimate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={item.retentionEstimate} 
                          className="h-2"
                        />
                      </>
                    )}

                    {item.lastReviewDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Reviewed:</span>
                        <span className="font-medium">
                          {new Date(item.lastReviewDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button size="sm" className="w-full mt-3">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Start Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {itemsDue.length === 0 && topicsAtRisk.length === 0 && reminders.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Spaced Repetition Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground mb-4">
                No reviews due today. Great job maintaining your knowledge!
              </p>
              <Button onClick={fetchReviewData} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
