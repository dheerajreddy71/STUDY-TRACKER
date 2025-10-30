'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Brain,
  CheckCircle2,
  X,
  Lightbulb,
  Target,
  Heart,
  BookOpen,
  Calendar,
  RefreshCw,
  Eye,
  Sparkles,
  ListChecks
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

interface ComprehensiveRecommendation {
  id: string
  type: 'wellbeing' | 'optimization' | 'learning_method' | 'time_management' | 'subject_priority' | 'retention'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  description: string
  rationale: string
  expectedOutcome: string
  actionItems: string[]
  confidence: number
  evidence: string[]
  tags: string[]
}

interface BurnoutData {
  totalScore: number
  severity: 'none' | 'mild' | 'moderate' | 'high' | 'critical'
  needsIntervention: boolean
  indicators: Array<{
    name: string
    category: string
    score: number
    maxScore: number
    severity: string
    description: string
    detected: boolean
  }>
  recommendations: string[]
}

interface InsightsSummary {
  criticalIssues: number
  optimizationOpportunities: number
  strengthsIdentified: number
  overallHealth: 'excellent' | 'good' | 'fair' | 'needs_attention' | 'critical'
}

export function RecommendationsPanel({ userId, subjectId }: { userId: string; subjectId?: string }) {
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<ComprehensiveRecommendation[]>([])
  const [burnout, setBurnout] = useState<BurnoutData | null>(null)
  const [summary, setSummary] = useState<InsightsSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecommendations()
  }, [userId, subjectId])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({ userId })
      if (subjectId) params.append('subjectId', subjectId)
      
      console.log('Fetching recommendations from:', `/api/v1/recommendations/comprehensive?${params}`)
      const response = await fetch(`/api/v1/recommendations/comprehensive?${params}`)
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to load recommendations')
      }
      
      const result = await response.json()
      console.log('Recommendations result:', result)
      
      if (result.success) {
        setRecommendations(result.data.recommendations || [])
        setBurnout(result.data.insights?.burnout || null)
        setSummary(result.data.summary || null)
      } else {
        throw new Error(result.error || 'Unknown error')
      }
    } catch (error: any) {
      console.error('Error loading recommendations:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-5 w-5" />
      case 'high': return <Target className="h-5 w-5" />
      case 'medium': return <Lightbulb className="h-5 w-5" />
      case 'low': return <Brain className="h-5 w-5" />
      default: return null
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-red-500'
      case 'moderate': return 'bg-orange-500'
      case 'mild': return 'bg-yellow-500'
      case 'none': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'good': return <CheckCircle2 className="h-5 w-5 text-blue-600" />
      case 'fair': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'needs_attention': return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
          <CardDescription>Analyzing your study patterns...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadRecommendations}
                className="ml-4"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Burnout Assessment */}
      {burnout && (
        <Card className={burnout.needsIntervention ? 'border-red-500 border-2' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Wellbeing Assessment
                </CardTitle>
                <CardDescription>Academic burnout risk analysis</CardDescription>
              </div>
              <Badge className={getSeverityColor(burnout.severity)}>
                {burnout.severity.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Burnout Score</span>
                <span className="text-sm text-muted-foreground">{burnout.totalScore}/100</span>
              </div>
              <Progress value={burnout.totalScore} className="h-2" />
            </div>
            
            {burnout.needsIntervention && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Intervention Needed:</strong> Your burnout risk is high. Please take care of your wellbeing.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Detected Indicators:</h4>
              {burnout.indicators.filter(i => i.detected).map((indicator, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{indicator.name}:</span> {indicator.description}
                  </div>
                </div>
              ))}
              
              {burnout.indicators.filter(i => i.detected).length === 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No concerning burnout indicators detected. Keep maintaining healthy study habits!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Health Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getHealthIcon(summary.overallHealth)}
                <div>
                  <CardTitle>Study Health Overview</CardTitle>
                  <CardDescription className="capitalize">
                    Status: {summary.overallHealth.replace('_', ' ')}
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={loadRecommendations}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Critical Issues</span>
                </div>
                <p className="text-2xl font-bold">{summary.criticalIssues}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Opportunities</span>
                </div>
                <p className="text-2xl font-bold">{summary.optimizationOpportunities}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Strengths</span>
                </div>
                <p className="text-2xl font-bold">{summary.strengthsIdentified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Urgent Alerts */}
      {recommendations.filter(r => r.priority === 'urgent').length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Urgent Attention Required</AlertTitle>
          <AlertDescription>
            You have {recommendations.filter(r => r.priority === 'urgent').length} urgent recommendation(s) that need immediate action.
          </AlertDescription>
        </Alert>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Smart Recommendations
              </CardTitle>
              <CardDescription>
                {recommendations.length} insights generated from your study patterns
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadRecommendations}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">Not Enough Data Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Keep studying! We need at least 10 study sessions to generate personalized recommendations.
              </p>
              <Button variant="outline" onClick={loadRecommendations}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Again
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  All ({recommendations.length})
                </TabsTrigger>
                <TabsTrigger value="urgent">
                  Urgent ({recommendations.filter(r => r.priority === 'urgent').length})
                </TabsTrigger>
                <TabsTrigger value="high">
                  High ({recommendations.filter(r => r.priority === 'high').length})
                </TabsTrigger>
                <TabsTrigger value="wellbeing">
                  Wellbeing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4">
                {recommendations.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </TabsContent>

              <TabsContent value="urgent" className="space-y-4 mt-4">
                {recommendations.filter(r => r.priority === 'urgent').length > 0 ? (
                  recommendations.filter(r => r.priority === 'urgent').map((rec) => (
                    <RecommendationCard key={rec.id} recommendation={rec} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No urgent issues! Everything looks good.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="high" className="space-y-4 mt-4">
                {recommendations.filter(r => r.priority === 'high').length > 0 ? (
                  recommendations.filter(r => r.priority === 'high').map((rec) => (
                    <RecommendationCard key={rec.id} recommendation={rec} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No high priority recommendations at this time.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="wellbeing" className="space-y-4 mt-4">
                {recommendations.filter(r => r.type === 'wellbeing').length > 0 ? (
                  recommendations
                    .filter(r => r.type === 'wellbeing')
                    .map((rec) => <RecommendationCard key={rec.id} recommendation={rec} />)
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>Your wellbeing looks good! Keep it up!</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function RecommendationCard({ recommendation }: { recommendation: ComprehensiveRecommendation }) {
  const [expanded, setExpanded] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 dark:bg-red-950/20'
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      case 'low': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
      default: return 'border-gray-300'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'high': return <Target className="h-5 w-5 text-orange-600" />
      case 'medium': return <Lightbulb className="h-5 w-5 text-yellow-600" />
      case 'low': return <Brain className="h-5 w-5 text-blue-600" />
      default: return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wellbeing': return <Heart className="h-4 w-4" />
      case 'optimization': return <Target className="h-4 w-4" />
      case 'learning_method': return <Brain className="h-4 w-4" />
      case 'time_management': return <Clock className="h-4 w-4" />
      case 'subject_priority': return <BookOpen className="h-4 w-4" />
      case 'retention': return <Sparkles className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className={`border-l-4 rounded-lg p-4 ${getPriorityColor(recommendation.priority)}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-background">
          {getPriorityIcon(recommendation.priority)}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold">{recommendation.title}</h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="text-xs">
                {recommendation.confidence}%
              </Badge>
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                {getTypeIcon(recommendation.type)}
                {recommendation.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm">{recommendation.description}</p>
          
          {recommendation.actionItems && recommendation.actionItems.length > 0 && (
            <div className="space-y-1">
              <h5 className="text-xs font-semibold flex items-center gap-1">
                <ListChecks className="h-3 w-3" />
                Action Items:
              </h5>
              <ul className="space-y-1">
                {recommendation.actionItems.slice(0, expanded ? undefined : 3).map((item, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {recommendation.actionItems.length > 3 && !expanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs"
                  onClick={() => setExpanded(true)}
                >
                  Show {recommendation.actionItems.length - 3} more
                </Button>
              )}
            </div>
          )}

          {expanded && (
            <>
              <div className="text-xs space-y-2 pt-2 border-t">
                <div>
                  <strong className="text-muted-foreground">Rationale:</strong>
                  <p className="mt-1">{recommendation.rationale}</p>
                </div>
                <div>
                  <strong className="text-muted-foreground">Expected Outcome:</strong>
                  <p className="mt-1">{recommendation.expectedOutcome}</p>
                </div>
                {recommendation.evidence && recommendation.evidence.length > 0 && (
                  <div>
                    <strong className="text-muted-foreground">Evidence:</strong>
                    <ul className="mt-1 space-y-1">
                      {recommendation.evidence.map((evidence, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{evidence}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-1 px-2 text-xs"
                onClick={() => setExpanded(false)}
              >
                Show less
              </Button>
            </>
          )}

          {!expanded && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={() => setExpanded(true)}
            >
              Show details
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
