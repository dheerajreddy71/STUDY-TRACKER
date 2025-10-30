"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, BookOpen, Edit, Trash } from "lucide-react"
import { toast } from "sonner"

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id
  const [session, setSession] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/v1/sessions/${id}`)
        const json = await res.json()
        if (json.success) setSession(json.data)
      } catch (err) {
        console.error("Error loading session:", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const handleDelete = async () => {
    if (!id || !confirm("Delete this session?")) return
    try {
      const res = await fetch(`/api/v1/sessions/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        toast.success("Session deleted")
        router.push("/sessions")
      } else {
        toast.error(json.error || "Failed to delete")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete")
    }
  }

  if (!id) return <p>Invalid session</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Session Details</h1>
        <p className="text-muted-foreground mt-2">View and manage this study session</p>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-start">
          <div>
            <CardTitle>{session?.subject_name || 'Session'}</CardTitle>
            <p className="text-sm text-muted-foreground">{session?.study_method}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/sessions/${id}/edit`}><Edit className="w-4 h-4" /></a>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}><Trash className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-6">
              {/* Subject Information */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Subject</h3>
                <div className="flex items-center gap-2">
                  {session?.color_theme && (
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: session.color_theme }} />
                  )}
                  <span className="font-medium">{session?.subject_name || 'Unknown Subject'}</span>
                  {session?.category && (
                    <span className="text-sm text-muted-foreground">• {session.category.replace('_', ' ')}</span>
                  )}
                </div>
              </div>

              {/* Time Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-1 text-green-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Started</div>
                    <div className="font-medium">{session?.started_at ? new Date(session.started_at).toLocaleString() : '—'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 mt-1 text-red-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Ended</div>
                    <div className="font-medium">{session?.ended_at ? new Date(session.ended_at).toLocaleString() : 'In Progress'}</div>
                  </div>
                </div>
              </div>

              {/* Duration and Focus */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="text-2xl font-bold">{session?.duration_minutes ? `${Math.floor(session.duration_minutes/60)}h ${session.duration_minutes%60}m` : '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Target Duration</div>
                  <div className="text-2xl font-bold">{session?.target_duration_minutes ? `${session.target_duration_minutes}m` : '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Focus Score</div>
                  <div className="text-2xl font-bold">{session?.average_focus_score || 0}/10</div>
                </div>
              </div>

              {/* Study Method and Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Study Method</div>
                  <div className="font-medium capitalize">{session?.study_method?.replace('_', ' ') || '—'}</div>
                </div>
                {session?.location && (
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">{session.location}</div>
                  </div>
                )}
              </div>

              {/* Session Goal */}
              {session?.session_goal && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Session Goal (What you wanted to accomplish)</div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border">{session.session_goal}</div>
                </div>
              )}

              {/* Accomplishments */}
              {session?.accomplishments && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Accomplishments (What you actually did)</div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border whitespace-pre-wrap">{session.accomplishments}</div>
                </div>
              )}

              {/* Goal Achievement Status */}
              {session?.goal_achieved && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Goal Achieved</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    session.goal_achieved === 'yes' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                    session.goal_achieved === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                  }`}>
                    {session.goal_achieved === 'yes' ? 'Yes, completed' : 
                     session.goal_achieved === 'partial' ? 'Partially completed' : 
                     'No, not completed'}
                  </div>
                </div>
              )}

              {/* Notes */}
              {session?.notes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Notes</div>
                  <div className="p-3 bg-muted rounded border whitespace-pre-wrap">{session.notes}</div>
                </div>
              )}

              {/* Challenges */}
              {session?.challenges && session.challenges !== '[]' && session.challenges.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Challenges</div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded border whitespace-pre-wrap">
                    {typeof session.challenges === 'string' 
                      ? (session.challenges.startsWith('[') || session.challenges.startsWith('{'))
                        ? (() => {
                            try {
                              const parsed = JSON.parse(session.challenges);
                              if (Array.isArray(parsed) && parsed.length === 0) return null;
                              if (Array.isArray(parsed)) return parsed.join(', ');
                              return String(parsed);
                            } catch {
                              return session.challenges;
                            }
                          })()
                        : session.challenges
                      : Array.isArray(session.challenges) 
                        ? session.challenges.join(', ')
                        : String(session.challenges)}
                  </div>
                </div>
              )}

              {/* Comprehensive Ratings Section */}
              {(session?.focus_rating || session?.productivity_rating || session?.retention_rating || 
                session?.effort_rating || session?.difficulty_rating || session?.engagement_rating || 
                session?.satisfaction_rating) && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 text-lg">Session Ratings</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {session?.focus_rating && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                        <div className="text-sm text-muted-foreground">Focus</div>
                        <div className="text-2xl font-bold">{session.focus_rating}/10</div>
                      </div>
                    )}
                    {session?.productivity_rating && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded">
                        <div className="text-sm text-muted-foreground">Productivity</div>
                        <div className="text-2xl font-bold">{session.productivity_rating}/10</div>
                      </div>
                    )}
                    {session?.retention_rating && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded">
                        <div className="text-sm text-muted-foreground">Retention</div>
                        <div className="text-2xl font-bold">{session.retention_rating}/10</div>
                      </div>
                    )}
                    {session?.effort_rating && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded">
                        <div className="text-sm text-muted-foreground">Effort</div>
                        <div className="text-2xl font-bold">{session.effort_rating}/10</div>
                      </div>
                    )}
                    {session?.difficulty_rating && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded">
                        <div className="text-sm text-muted-foreground">Difficulty</div>
                        <div className="text-2xl font-bold">{session.difficulty_rating}/10</div>
                      </div>
                    )}
                    {session?.engagement_rating && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                        <div className="text-sm text-muted-foreground">Engagement</div>
                        <div className="text-2xl font-bold">{session.engagement_rating}/10</div>
                      </div>
                    )}
                    {session?.satisfaction_rating && (
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded">
                        <div className="text-sm text-muted-foreground">Satisfaction</div>
                        <div className="text-2xl font-bold">{session.satisfaction_rating}/10</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Tracking */}
              {(session?.goals_achieved_percentage || session?.topics_fully_understood || 
                session?.topics_need_review || session?.pages_completed || session?.problems_completed) && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 text-lg">Progress & Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {session?.goals_achieved_percentage !== null && session?.goals_achieved_percentage !== undefined && (
                      <div>
                        <div className="text-sm text-muted-foreground">Goals Achieved</div>
                        <div className="text-xl font-bold">{session.goals_achieved_percentage}%</div>
                      </div>
                    )}
                    {session?.topics_fully_understood !== null && session?.topics_fully_understood !== undefined && (
                      <div>
                        <div className="text-sm text-muted-foreground">Topics Mastered</div>
                        <div className="text-xl font-bold">{session.topics_fully_understood}</div>
                      </div>
                    )}
                    {session?.topics_need_review !== null && session?.topics_need_review !== undefined && (
                      <div>
                        <div className="text-sm text-muted-foreground">Topics Need Review</div>
                        <div className="text-xl font-bold">{session.topics_need_review}</div>
                      </div>
                    )}
                    {session?.pages_completed !== null && session?.pages_completed !== undefined && (
                      <div>
                        <div className="text-sm text-muted-foreground">Pages Completed</div>
                        <div className="text-xl font-bold">{session.pages_completed}</div>
                      </div>
                    )}
                    {session?.problems_completed !== null && session?.problems_completed !== undefined && (
                      <div>
                        <div className="text-sm text-muted-foreground">Problems Solved</div>
                        <div className="text-xl font-bold">{session.problems_completed}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reflection Section */}
              {(session?.what_went_well || session?.what_didnt_go_well || session?.key_concepts_learned || 
                session?.difficulties_encountered || session?.questions_to_research) && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 text-lg">Session Reflection</h3>
                  <div className="space-y-3">
                    {session?.what_went_well && (
                      <div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">What Went Well</div>
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded whitespace-pre-wrap">{session.what_went_well}</div>
                      </div>
                    )}
                    {session?.what_didnt_go_well && (
                      <div>
                        <div className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">What Didn't Go Well</div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded whitespace-pre-wrap">{session.what_didnt_go_well}</div>
                      </div>
                    )}
                    {session?.key_concepts_learned && (
                      <div>
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Key Concepts Learned</div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded whitespace-pre-wrap">{session.key_concepts_learned}</div>
                      </div>
                    )}
                    {session?.difficulties_encountered && (
                      <div>
                        <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Difficulties Encountered</div>
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded whitespace-pre-wrap">{session.difficulties_encountered}</div>
                      </div>
                    )}
                    {session?.questions_to_research && (
                      <div>
                        <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Questions to Research</div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded whitespace-pre-wrap">{session.questions_to_research}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Method Effectiveness */}
              {(session?.method_effective || session?.better_method_suggestion) && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 text-lg">Method Effectiveness</h3>
                  {session?.method_effective && (
                    <div className="mb-3">
                      <div className="text-sm text-muted-foreground mb-1">Was the Study Method Effective?</div>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        session.method_effective === 'yes' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        session.method_effective === 'somewhat' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {session.method_effective === 'yes' ? 'Yes, very effective' : 
                         session.method_effective === 'somewhat' ? 'Somewhat effective' : 
                         'Not effective'}
                      </div>
                    </div>
                  )}
                  {session?.better_method_suggestion && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Better Method Suggestion</div>
                      <div className="p-3 bg-muted rounded whitespace-pre-wrap">{session.better_method_suggestion}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Distractions */}
              {(session?.main_distraction_source || session?.distraction_impact) && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 text-lg">Distractions</h3>
                  {session?.main_distraction_source && (
                    <div className="mb-3">
                      <div className="text-sm text-muted-foreground mb-1">Main Distraction Source</div>
                      <div className="font-medium capitalize">{session.main_distraction_source.replace(/_/g, ' ')}</div>
                    </div>
                  )}
                  {session?.distraction_impact && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Impact Level</div>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        session.distraction_impact === 'none' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        session.distraction_impact === 'minor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        session.distraction_impact === 'moderate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {session.distraction_impact.charAt(0).toUpperCase() + session.distraction_impact.slice(1)} Impact
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* State Assessment */}
              {(session?.energy_level_after || session?.confidence_level) && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 text-lg">Post-Session State</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {session?.energy_level_after && (
                      <div>
                        <div className="text-sm text-muted-foreground">Energy Level</div>
                        <div className="text-xl font-bold">{session.energy_level_after}/10</div>
                      </div>
                    )}
                    {session?.confidence_level && (
                      <div>
                        <div className="text-sm text-muted-foreground">Confidence Level</div>
                        <div className="text-xl font-bold">{session.confidence_level}/10</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {(session?.action_items || session?.topics_for_review || session?.next_session_focus) && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 text-lg">Next Steps</h3>
                  <div className="space-y-3">
                    {session?.action_items && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Action Items</div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded whitespace-pre-wrap">{session.action_items}</div>
                      </div>
                    )}
                    {session?.topics_for_review && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Topics for Review</div>
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded whitespace-pre-wrap">{session.topics_for_review}</div>
                      </div>
                    )}
                    {session?.next_session_focus && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Next Session Focus</div>
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded whitespace-pre-wrap">{session.next_session_focus}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Session Tags */}
              {session?.session_tags && (
                <div className="border-t pt-6">
                  <div className="text-sm text-muted-foreground mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {(typeof session.session_tags === 'string' ? session.session_tags.split(',') : []).map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-muted rounded text-sm">{tag.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
