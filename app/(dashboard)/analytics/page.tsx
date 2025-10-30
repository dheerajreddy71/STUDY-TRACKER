"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Trophy,
  Flame,
  Star,
  Lightbulb,
  ChevronRight,
  Brain,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  X,
  Target,
  Zap
} from "lucide-react"

type Insight = {
  id: string
  insight_type: string
  insight_title: string
  insight_description: string
  key_finding: string
  confidence_level: number
  impact_potential: string
  priority_score: number
  is_actionable: number
  recommended_actions: string
  acknowledged: number
  bookmarked: number
  user_rating: string
}

type Achievement = {
  id: string
  achievement_key: string
  achievement_name: string
  achievement_description: string
  achievement_category: string
  rarity: string
  xp_value: number
  unlocked: number
  unlock_date: string
  progress_current: number
  progress_target: number
  progress_percentage: number
  times_earned: number
  icon: string
}

type Streak = {
  id: string
  streak_type: string
  subject_id: string
  current_streak: number
  longest_streak: number
  streak_start_date: string
  last_activity_date: string
  status: string
  freeze_tokens_available: number
}

type Challenge = {
  id: string
  challenge_title: string
  challenge_description: string
  challenge_type: string
  start_date: string
  end_date: string
  duration_days: number
  xp_reward: number
  difficulty_level: string
  progress_current: number
  progress_target: number
  progress_percentage: number
  status: string
}

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("insights")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    const userId = localStorage.getItem("userId") || "guest-user"

    try {
      const [insightsData, achievementsData, streaksData, challengesData] = await Promise.all([
        fetch(`/api/v1/insights?userId=${userId}`).then(r => r.json()),
        fetch(`/api/v1/achievements?userId=${userId}`).then(r => r.json()),
        fetch(`/api/v1/streaks?userId=${userId}`).then(r => r.json()),
        fetch(`/api/v1/challenges?userId=${userId}`).then(r => r.json())
      ])

      setInsights(Array.isArray(insightsData) ? insightsData : [])
      
      // Handle wrapped response for achievements
      const achievementsArray = achievementsData.success && Array.isArray(achievementsData.data) 
        ? achievementsData.data 
        : (Array.isArray(achievementsData) ? achievementsData : [])
      
      setAchievements(achievementsArray)
      setStreaks(Array.isArray(streaksData) ? streaksData : [])
      setChallenges(Array.isArray(challengesData) ? challengesData : [])
    } catch (error) {
      console.error("Error loading analytics data:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInsightAction = async (insightId: string, action: "acknowledge" | "rate" | "bookmark" | "dismiss", value?: string) => {
    try {
      const endpoint = action === "rate" ? `/api/v1/insights/${insightId}/rate` : `/api/v1/insights/${insightId}/${action}`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value })
      })

      if (response.ok) {
        toast.success(`Insight ${action}d successfully`)
        loadData()
      }
    } catch (error) {
      console.error(`Error ${action}ing insight:`, error)
      toast.error(`Failed to ${action} insight`)
    }
  }

  const getRarityBadge = (rarity: string) => {
    const variants: Record<string, any> = {
      common: { variant: "secondary" as const, className: "bg-gray-100" },
      uncommon: { variant: "default" as const, className: "bg-green-100 text-green-800" },
      rare: { variant: "default" as const, className: "bg-blue-100 text-blue-800" },
      epic: { variant: "default" as const, className: "bg-purple-100 text-purple-800" },
      legendary: { variant: "default" as const, className: "bg-yellow-100 text-yellow-800" }
    }
    const config = variants[rarity] || variants.common
    return <Badge variant={config.variant} className={config.className}>{rarity.toUpperCase()}</Badge>
  }

  const getImpactBadge = (impact: string) => {
    const variants: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800"
    }
    return <Badge className={variants[impact] || variants.medium}>{impact.toUpperCase()} IMPACT</Badge>
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked === 1)
  const lockedAchievements = achievements.filter(a => a.unlocked === 0)
  const totalXP = unlockedAchievements.reduce((sum, a) => sum + a.xp_value, 0)
  
  const activeStreaks = streaks.filter(s => s.status === "active")
  const longestStreak = Math.max(...streaks.map(s => s.longest_streak), 0)
  
  const activeChallenges = challenges.filter(c => c.status === "in_progress")
  const completedChallenges = challenges.filter(c => c.status === "completed")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics & Gamification</h1>
        <p className="text-muted-foreground">Track your progress, insights, and achievements</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Insights</CardTitle>
            <Lightbulb className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">Personalized recommendations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unlockedAchievements.length}/{achievements.length}</div>
            <p className="text-xs text-muted-foreground">{totalXP} XP earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streaks</CardTitle>
            <Flame className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStreaks.length}</div>
            <p className="text-xs text-muted-foreground">Longest: {longestStreak} days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeChallenges.length}</div>
            <p className="text-xs text-muted-foreground">{completedChallenges.length} completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-4">
          <TabsTrigger value="insights">
            <Lightbulb className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Trophy className="w-4 h-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="streaks">
            <Flame className="w-4 h-4 mr-2" />
            Streaks
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Target className="w-4 h-4 mr-2" />
            Challenges
          </TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Insights</CardTitle>
              <CardDescription>
                AI-powered recommendations based on your study patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No insights available yet</p>
                  <p className="text-sm">Keep studying to generate personalized insights!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map(insight => {
                    let recommendedActions: string[] = []
                    try {
                      recommendedActions = insight.recommended_actions 
                        ? JSON.parse(insight.recommended_actions) 
                        : []
                    } catch (e) {
                      console.error("Error parsing recommended actions:", e)
                    }

                    return (
                      <Card key={insight.id} className={insight.bookmarked === 1 ? "border-primary" : ""}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <CardTitle className="text-lg">{insight.insight_title}</CardTitle>
                                {getImpactBadge(insight.impact_potential)}
                                {insight.bookmarked === 1 && (
                                  <Badge variant="outline">
                                    <Bookmark className="w-3 h-3 mr-1" />
                                    Bookmarked
                                  </Badge>
                                )}
                              </div>
                              <CardDescription>{insight.insight_description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="p-3 rounded-lg bg-accent">
                            <div className="flex items-start gap-2">
                              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm mb-1">Key Finding</p>
                                <p className="text-sm">{insight.key_finding}</p>
                              </div>
                            </div>
                          </div>

                          {insight.confidence_level && (
                            <div>
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Confidence Level</span>
                                <span className="font-medium">{Math.round(insight.confidence_level * 100)}%</span>
                              </div>
                              <Progress value={insight.confidence_level * 100} />
                            </div>
                          )}

                          {insight.is_actionable === 1 && recommendedActions.length > 0 && (
                            <div>
                              <p className="font-medium text-sm mb-2">Recommended Actions:</p>
                              <ul className="space-y-1">
                                {recommendedActions.map((action, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm">
                                    <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 pt-2 border-t">
                            {insight.acknowledged === 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInsightAction(insight.id, "acknowledge")}
                              >
                                Acknowledge
                              </Button>
                            )}
                            {!insight.user_rating && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleInsightAction(insight.id, "rate", "helpful")}
                                >
                                  <ThumbsUp className="w-4 h-4 mr-1" />
                                  Helpful
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleInsightAction(insight.id, "rate", "not_helpful")}
                                >
                                  <ThumbsDown className="w-4 h-4 mr-1" />
                                  Not Helpful
                                </Button>
                              </>
                            )}
                            {insight.bookmarked === 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInsightAction(insight.id, "bookmark")}
                              >
                                <Bookmark className="w-4 h-4 mr-1" />
                                Bookmark
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleInsightAction(insight.id, "dismiss")}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Dismiss
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Unlocked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Unlocked Achievements ({unlockedAchievements.length})</CardTitle>
                <CardDescription>Your earned badges and accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                {unlockedAchievements.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No achievements unlocked yet</p>
                ) : (
                  <div className="space-y-3">
                    {unlockedAchievements.map(achievement => (
                      <div key={achievement.id} className="p-3 rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-2xl flex-shrink-0">
                            {achievement.icon || "🏆"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold">{achievement.achievement_name}</span>
                              {getRarityBadge(achievement.rarity)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{achievement.achievement_description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <span>+{achievement.xp_value} XP</span>
                              {achievement.unlock_date && (
                                <span>Unlocked: {new Date(achievement.unlock_date).toLocaleDateString()}</span>
                              )}
                              {achievement.times_earned > 1 && (
                                <span>×{achievement.times_earned}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Locked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Locked Achievements ({lockedAchievements.length})</CardTitle>
                <CardDescription>Achievements you can unlock</CardDescription>
              </CardHeader>
              <CardContent>
                {lockedAchievements.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">All achievements unlocked!</p>
                ) : (
                  <div className="space-y-3">
                    {lockedAchievements.map(achievement => (
                      <div key={achievement.id} className="p-3 rounded-lg border opacity-60">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-2xl flex-shrink-0 grayscale">
                            {achievement.icon || "🔒"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold">{achievement.achievement_name}</span>
                              {getRarityBadge(achievement.rarity)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{achievement.achievement_description}</p>
                            {achievement.progress_target > 0 && (
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>{achievement.progress_current}/{achievement.progress_target}</span>
                                </div>
                                <Progress value={achievement.progress_percentage} />
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">+{achievement.xp_value} XP</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Streaks Tab */}
        <TabsContent value="streaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Streaks</CardTitle>
              <CardDescription>Keep your momentum going!</CardDescription>
            </CardHeader>
            <CardContent>
              {streaks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No streaks yet</p>
                  <p className="text-sm">Start studying to build your first streak!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {streaks.map(streak => (
                    <Card key={streak.id} className={streak.status === "active" ? "border-orange-500" : ""}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg capitalize">
                            {streak.streak_type.replace(/_/g, " ")} Streak
                          </CardTitle>
                          {streak.status === "active" ? (
                            <Flame className="w-6 h-6 text-orange-500" />
                          ) : (
                            <Badge variant="secondary">{streak.status}</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-3xl font-bold">{streak.current_streak}</span>
                          <span className="text-sm text-muted-foreground">Current Days</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Longest Streak</span>
                          <span className="font-medium">{streak.longest_streak} days</span>
                        </div>
                        {streak.streak_start_date && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Started</span>
                            <span className="font-medium">{new Date(streak.streak_start_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {streak.last_activity_date && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last Activity</span>
                            <span className="font-medium">{new Date(streak.last_activity_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {streak.freeze_tokens_available > 0 && (
                          <Badge variant="outline" className="w-full justify-center">
                            {streak.freeze_tokens_available} Freeze Token{streak.freeze_tokens_available > 1 ? "s" : ""} Available
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-6">
            {/* Active Challenges */}
            {activeChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Challenges ({activeChallenges.length})</CardTitle>
                  <CardDescription>Challenges you're currently working on</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeChallenges.map(challenge => (
                    <Card key={challenge.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <CardTitle className="text-lg">{challenge.challenge_title}</CardTitle>
                              <Badge variant={
                                challenge.difficulty_level === "hard" ? "destructive" :
                                challenge.difficulty_level === "medium" ? "default" : "secondary"
                              }>
                                {challenge.difficulty_level}
                              </Badge>
                            </div>
                            <CardDescription>{challenge.challenge_description}</CardDescription>
                          </div>
                          <Zap className="w-6 h-6 text-yellow-500" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{challenge.progress_current}/{challenge.progress_target}</span>
                          </div>
                          <Progress value={challenge.progress_percentage} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Time Remaining</p>
                            <p className="font-medium">
                              {Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reward</p>
                            <p className="font-medium">+{challenge.xp_reward} XP</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Completed Challenges */}
            {completedChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Completed Challenges ({completedChallenges.length})</CardTitle>
                  <CardDescription>Challenges you've conquered</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedChallenges.map(challenge => (
                    <div key={challenge.id} className="p-3 rounded-lg border bg-green-50 dark:bg-green-950">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{challenge.challenge_title}</p>
                          <p className="text-sm text-muted-foreground">{challenge.challenge_description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">+{challenge.xp_reward} XP</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {challenges.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">No challenges available</p>
                  <p className="text-sm text-muted-foreground">Check back soon for new challenges!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
