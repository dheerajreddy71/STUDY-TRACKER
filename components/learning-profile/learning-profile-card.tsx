/**
 * Learning Profile Dashboard Card
 * Displays user's learning style analysis and personalized recommendations
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Eye,
  Ear,
  Hand,
  BookOpen,
  Brain,
  Clock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Zap,
  Target,
  RefreshCw,
  Sparkles
} from 'lucide-react'

interface LearningProfile {
  id: string
  userId: string
  dominantStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | 'multimodal'
  styleScores: {
    visual: number
    auditory: number
    kinesthetic: number
    reading_writing: number
  }
  preferredStudyMethods: string[]
  optimalSessionDuration: number
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  concentrationPattern: 'sprint' | 'marathon' | 'steady'
  confidence: number
  lastUpdated: string
  recommendations: string[]
}

interface MethodRecommendation {
  category: string
  suggestions: string[]
}

export function LearningProfileCard({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [profile, setProfile] = useState<LearningProfile | null>(null)
  const [methodRecommendations, setMethodRecommendations] = useState<MethodRecommendation[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/v1/learning-profile?userId=${userId}&recommendations=true`)
      
      if (res.ok) {
        const data = await res.json()
        setProfile(data.data)
        setMethodRecommendations(data.data.methodRecommendations || [])
      } else {
        setError('No profile found. Generate one to get personalized insights!')
      }
    } catch (err) {
      setError('Failed to load learning profile')
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateNewProfile = async () => {
    setGenerating(true)
    setError(null)
    
    try {
      const res = await fetch('/api/v1/learning-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      
      if (res.ok) {
        const data = await res.json()
        setProfile(data.data.profile)
        setMethodRecommendations(data.data.methodRecommendations || [])
      } else {
        setError('Failed to generate profile')
      }
    } catch (err) {
      setError('Failed to generate profile')
      console.error('Error generating profile:', err)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchProfile()
    }
  }, [userId])

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'visual': return <Eye className="h-5 w-5" />
      case 'auditory': return <Ear className="h-5 w-5" />
      case 'kinesthetic': return <Hand className="h-5 w-5" />
      case 'reading_writing': return <BookOpen className="h-5 w-5" />
      case 'multimodal': return <Brain className="h-5 w-5" />
      default: return <Brain className="h-5 w-5" />
    }
  }

  const getTimeIcon = (time: string) => {
    switch (time) {
      case 'morning': return <Sunrise className="h-5 w-5" />
      case 'afternoon': return <Sun className="h-5 w-5" />
      case 'evening': return <Sunset className="h-5 w-5" />
      case 'night': return <Moon className="h-5 w-5" />
      default: return <Clock className="h-5 w-5" />
    }
  }

  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'sprint': return <Zap className="h-5 w-5" />
      case 'marathon': return <Target className="h-5 w-5" />
      case 'steady': return <Clock className="h-5 w-5" />
      default: return <Brain className="h-5 w-5" />
    }
  }

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'visual': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'auditory': return 'text-green-600 bg-green-50 border-green-200'
      case 'kinesthetic': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'reading_writing': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'multimodal': return 'text-pink-600 bg-pink-50 border-pink-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Learning Style Profile
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

  if (error && !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Learning Style Profile
          </CardTitle>
          <CardDescription>Discover how you learn best</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={generateNewProfile} 
            disabled={generating}
            className="w-full mt-4"
          >
            {generating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Your Study Patterns...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Learning Profile
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Requires at least 10 study sessions for accurate analysis
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!profile) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStyleIcon(profile.dominantStyle)}
              {profile.dominantStyle.replace('_', ' ').toUpperCase()} Learner
            </CardTitle>
            <CardDescription>
              Confidence: {profile.confidence.toFixed(0)}% • Updated {new Date(profile.lastUpdated).toLocaleDateString()}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateNewProfile}
            disabled={generating}
          >
            <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="methods">Methods</TabsTrigger>
            <TabsTrigger value="recommendations">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Learning Style Breakdown */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Learning Style Breakdown</h4>
              <div className="space-y-3">
                {Object.entries(profile.styleScores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([style, score]) => (
                    <div key={style}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getStyleIcon(style)}
                          <span className="text-sm font-medium capitalize">
                            {style.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-sm font-semibold">{score.toFixed(0)}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
              </div>
            </div>

            {/* Optimal Conditions */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className={`border rounded-lg p-3 ${getStyleColor(profile.dominantStyle)}`}>
                <div className="flex items-center gap-2 mb-1">
                  {getTimeIcon(profile.bestTimeOfDay)}
                  <span className="text-sm font-semibold">Best Time</span>
                </div>
                <p className="text-sm capitalize">{profile.bestTimeOfDay}</p>
              </div>

              <div className={`border rounded-lg p-3 ${getStyleColor(profile.dominantStyle)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm font-semibold">Session Length</span>
                </div>
                <p className="text-sm">{profile.optimalSessionDuration} minutes</p>
              </div>

              <div className={`border rounded-lg p-3 ${getStyleColor(profile.dominantStyle)} md:col-span-2`}>
                <div className="flex items-center gap-2 mb-1">
                  {getPatternIcon(profile.concentrationPattern)}
                  <span className="text-sm font-semibold">Concentration Pattern</span>
                </div>
                <p className="text-sm capitalize">{profile.concentrationPattern} sessions</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="methods" className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold mb-2">Your Most Effective Methods</h4>
              <div className="flex flex-wrap gap-2">
                {profile.preferredStudyMethods.map((method, idx) => (
                  <Badge key={idx} variant="secondary">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>

            {methodRecommendations.map((rec, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-2">{rec.category}</h4>
                <ul className="space-y-1">
                  {rec.suggestions.map((suggestion, sIdx) => (
                    <li key={sIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-3">
            {profile.recommendations.map((rec, idx) => (
              <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
