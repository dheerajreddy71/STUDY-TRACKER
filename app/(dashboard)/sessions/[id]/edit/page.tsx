"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

export default function EditSessionPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])
  const [formData, setFormData] = useState({
    // Basic fields
    subjectId: "",
    subjectName: "",
    studyMethod: "reading",
    targetDurationMinutes: 60,
    sessionGoal: "",
    accomplishments: "",
    startedAt: "",
    endedAt: "",
    durationMinutes: 0,
    averageFocusScore: 0,
    goalAchieved: "partial",
    location: "",
    notes: "",
    challenges: "",
    
    // Comprehensive Rating fields (7 core ratings)
    focusRating: 0,
    productivityRating: 0,
    retentionRating: 0,
    effortRating: 0,
    difficultyRating: 0,
    engagementRating: 0,
    satisfactionRating: 0,
    
    // Progress & Metrics
    goalsAchievedPercentage: 0,
    topicsFullyUnderstood: 0,
    topicsNeedReview: 0,
    pagesCompleted: 0,
    problemsCompleted: 0,
    
    // Reflection fields
    whatWentWell: "",
    whatDidntGoWell: "",
    keyConceptsLearned: "",
    difficultiesEncountered: "",
    questionsToResearch: "",
    
    // Method effectiveness
    methodEffective: "",
    betterMethodSuggestion: "",
    
    // Distractions
    mainDistractionSource: "",
    distractionImpact: "",
    
    // State tracking
    energyLevelAfter: 0,
    confidenceLevel: 0,
    
    // Next steps
    nextSessionPlan: "",
    followUpNeeded: "",
  })

  // Calculate duration when start/end times change
  useEffect(() => {
    if (formData.startedAt && formData.endedAt) {
      const start = new Date(formData.startedAt)
      const end = new Date(formData.endedAt)
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffMs = end.getTime() - start.getTime()
        const diffMinutes = Math.round(diffMs / (1000 * 60))
        // Update duration even if negative to show the issue
        if (diffMinutes !== formData.durationMinutes) {
          setFormData(prev => ({ ...prev, durationMinutes: diffMinutes }))
        }
      }
    }
  }, [formData.startedAt, formData.endedAt])

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const userId = localStorage.getItem("userId") || "guest-user"
        const [sessionRes, subjectsRes] = await Promise.all([
          fetch(`/api/v1/sessions/${id}`),
          fetch(`/api/v1/subjects?userId=${userId}`)
        ])
        
        const sessionJson = await sessionRes.json()
        const subjectsJson = await subjectsRes.json()
        
        if (subjectsJson.success) {
          setSubjects(subjectsJson.data || [])
        }
        
        if (sessionJson.success && sessionJson.data) {
          const session = sessionJson.data
          setFormData({
            // Basic fields
            subjectId: session.subject_id || "",
            subjectName: session.subject_name || "",
            studyMethod: session.study_method || "reading",
            targetDurationMinutes: session.target_duration_minutes || 60,
            sessionGoal: session.session_goal || "",
            accomplishments: session.accomplishments || "",
            startedAt: session.started_at ? new Date(session.started_at).toISOString().slice(0, 16) : "",
            endedAt: session.ended_at ? new Date(session.ended_at).toISOString().slice(0, 16) : "",
            durationMinutes: session.duration_minutes || 0,
            averageFocusScore: session.average_focus_score || 0,
            goalAchieved: session.goal_achieved || "partial",
            location: session.location || "",
            notes: session.notes || "",
            challenges: typeof session.challenges === 'string' ? session.challenges : (session.challenges ? JSON.stringify(session.challenges) : ""),
            
            // Comprehensive Rating fields
            focusRating: session.focus_rating || 0,
            productivityRating: session.productivity_rating || 0,
            retentionRating: session.retention_rating || 0,
            effortRating: session.effort_rating || 0,
            difficultyRating: session.difficulty_rating || 0,
            engagementRating: session.engagement_rating || 0,
            satisfactionRating: session.satisfaction_rating || 0,
            
            // Progress & Metrics
            goalsAchievedPercentage: session.goals_achieved_percentage || 0,
            topicsFullyUnderstood: session.topics_fully_understood || 0,
            topicsNeedReview: session.topics_need_review || 0,
            pagesCompleted: session.pages_completed || 0,
            problemsCompleted: session.problems_completed || 0,
            
            // Reflection fields
            whatWentWell: session.what_went_well || "",
            whatDidntGoWell: session.what_didnt_go_well || "",
            keyConceptsLearned: session.key_concepts_learned || "",
            difficultiesEncountered: session.difficulties_encountered || "",
            questionsToResearch: session.questions_to_research || "",
            
            // Method effectiveness
            methodEffective: session.method_effective || "",
            betterMethodSuggestion: session.better_method_suggestion || "",
            
            // Distractions
            mainDistractionSource: session.main_distraction_source || "",
            distractionImpact: session.distraction_impact || "",
            
            // State tracking
            energyLevelAfter: session.energy_level_after || 0,
            confidenceLevel: session.confidence_level || 0,
            
            // Next steps
            nextSessionPlan: session.next_session_plan || "",
            followUpNeeded: session.follow_up_needed || "",
          })
        }
      } catch (err) {
        console.error("Error loading session:", err)
        toast.error("Failed to load session")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate times
    if (formData.startedAt && formData.endedAt) {
      const start = new Date(formData.startedAt)
      const end = new Date(formData.endedAt)
      if (end < start) {
        toast.error("End time cannot be before start time. Please fix the dates.")
        return
      }
    }
    
    setIsSaving(true)

    try {
      // Calculate duration if both times are provided
      let duration = formData.durationMinutes
      if (formData.startedAt && formData.endedAt) {
        const start = new Date(formData.startedAt)
        const end = new Date(formData.endedAt)
        duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
      }

      // Convert datetime-local to ISO string for consistent storage
      const startedAtISO = formData.startedAt ? new Date(formData.startedAt).toISOString() : null
      const endedAtISO = formData.endedAt ? new Date(formData.endedAt).toISOString() : null

      const res = await fetch(`/api/v1/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Basic fields
          subject_id: formData.subjectId,
          study_method: formData.studyMethod,
          target_duration_minutes: formData.targetDurationMinutes,
          session_goal: formData.sessionGoal,
          accomplishments: formData.accomplishments,
          started_at: startedAtISO,
          ended_at: endedAtISO,
          duration_minutes: duration,
          average_focus_score: formData.averageFocusScore,
          goal_achieved: formData.goalAchieved,
          location: formData.location,
          notes: formData.notes,
          challenges: formData.challenges,
          
          // Comprehensive Rating fields
          focus_rating: formData.focusRating || null,
          productivity_rating: formData.productivityRating || null,
          retention_rating: formData.retentionRating || null,
          effort_rating: formData.effortRating || null,
          difficulty_rating: formData.difficultyRating || null,
          engagement_rating: formData.engagementRating || null,
          satisfaction_rating: formData.satisfactionRating || null,
          
          // Progress & Metrics
          goals_achieved_percentage: formData.goalsAchievedPercentage || null,
          topics_fully_understood: formData.topicsFullyUnderstood || null,
          topics_need_review: formData.topicsNeedReview || null,
          pages_completed: formData.pagesCompleted || null,
          problems_completed: formData.problemsCompleted || null,
          
          // Reflection fields
          what_went_well: formData.whatWentWell || null,
          what_didnt_go_well: formData.whatDidntGoWell || null,
          key_concepts_learned: formData.keyConceptsLearned || null,
          difficulties_encountered: formData.difficultiesEncountered || null,
          questions_to_research: formData.questionsToResearch || null,
          
          // Method effectiveness
          method_effective: formData.methodEffective || null,
          better_method_suggestion: formData.betterMethodSuggestion || null,
          
          // Distractions
          main_distraction_source: formData.mainDistractionSource || null,
          distraction_impact: formData.distractionImpact || null,
          
          // State tracking
          energy_level_after: formData.energyLevelAfter || null,
          confidence_level: formData.confidenceLevel || null,
          
          // Next steps
          next_session_plan: formData.nextSessionPlan || null,
          follow_up_needed: formData.followUpNeeded || null,
        })
      })

      const json = await res.json()
      if (json.success) {
        toast.success("Session updated successfully!")
        router.push(`/sessions/${id}`)
      } else {
        toast.error(json.error || "Failed to update session")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to update session")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Session</h1>
        <p className="text-muted-foreground mt-2">Update your study session details</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(v) => setFormData({...formData, subjectId: v})}
                  disabled={isSaving}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder={formData.subjectName || "Select subject"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Study Method</Label>
                <Select
                  value={formData.studyMethod}
                  onValueChange={(v) => setFormData({...formData, studyMethod: v})}
                  disabled={isSaving}
                >
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reading">Reading Textbook</SelectItem>
                    <SelectItem value="practice_problems">Practice Problems</SelectItem>
                    <SelectItem value="video_lecture">Video Lecture</SelectItem>
                    <SelectItem value="notes">Note-taking</SelectItem>
                    <SelectItem value="flashcards">Flashcards</SelectItem>
                    <SelectItem value="group_study">Group Study</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDuration">Target Duration (minutes)</Label>
              <Input 
                id="targetDuration"
                type="number"
                value={formData.targetDurationMinutes || ""}
                onChange={(e) => setFormData({...formData, targetDurationMinutes: parseInt(e.target.value) || 0})}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">What do you want to accomplish?</Label>
              <Textarea 
                id="goal"
                value={formData.sessionGoal}
                onChange={(e) => setFormData({...formData, sessionGoal: e.target.value})}
                placeholder="e.g., Complete chapter 5 exercises, understand derivatives"
                disabled={isSaving}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accomplishments">What did you accomplish?</Label>
              <Textarea 
                id="accomplishments"
                value={formData.accomplishments}
                onChange={(e) => setFormData({...formData, accomplishments: e.target.value})}
                placeholder="Describe what you covered and learned in this session"
                disabled={isSaving}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startedAt">Started At</Label>
                <Input 
                  id="startedAt"
                  type="datetime-local"
                  value={formData.startedAt}
                  onChange={(e) => setFormData({...formData, startedAt: e.target.value})}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endedAt">Ended At (Optional)</Label>
                <Input 
                  id="endedAt"
                  type="datetime-local"
                  value={formData.endedAt}
                  onChange={(e) => setFormData({...formData, endedAt: e.target.value})}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Did you accomplish your goal?</Label>
              <RadioGroup 
                value={formData.goalAchieved}
                onValueChange={(v) => setFormData({...formData, goalAchieved: v})}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="goal-yes" disabled={isSaving} />
                  <Label htmlFor="goal-yes" className="font-normal cursor-pointer">
                    Yes, I accomplished my goal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partial" id="goal-partial" disabled={isSaving} />
                  <Label htmlFor="goal-partial" className="font-normal cursor-pointer">
                    Partially completed
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="goal-no" disabled={isSaving} />
                  <Label htmlFor="goal-no" className="font-normal cursor-pointer">
                    No, I didn't complete it
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Overall Focus Rating (1-10)</Label>
              <div className="grid grid-cols-10 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <Button
                    key={i}
                    type="button"
                    variant={formData.averageFocusScore === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({...formData, averageFocusScore: i})}
                    disabled={isSaving}
                  >
                    {i}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                1 = Constantly distracted, 10 = Perfect concentration
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Library, Home, Café"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any challenges, insights, or things to remember?"
                disabled={isSaving}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges">Challenges Faced</Label>
              <Textarea 
                id="challenges"
                value={formData.challenges}
                onChange={(e) => setFormData({...formData, challenges: e.target.value})}
                placeholder="What challenges did you encounter?"
                disabled={isSaving}
                rows={2}
              />
            </div>

            <Separator className="my-6" />

            {/* Comprehensive Fields - Tabs */}
            <Tabs defaultValue="ratings" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="ratings">Ratings</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="reflection">Reflection</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>

              {/* RATINGS TAB */}
              <TabsContent value="ratings" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div>
                    <Label>Focus Rating (1-10)</Label>
                    <div className="grid grid-cols-10 gap-2 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <Button
                          key={i}
                          type="button"
                          variant={formData.focusRating === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, focusRating: i})}
                          disabled={isSaving}
                        >
                          {i}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Productivity Rating (1-10)</Label>
                    <div className="grid grid-cols-10 gap-2 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <Button
                          key={i}
                          type="button"
                          variant={formData.productivityRating === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, productivityRating: i})}
                          disabled={isSaving}
                        >
                          {i}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Retention Rating (1-10)</Label>
                    <div className="grid grid-cols-10 gap-2 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <Button
                          key={i}
                          type="button"
                          variant={formData.retentionRating === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, retentionRating: i})}
                          disabled={isSaving}
                        >
                          {i}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Effort Rating (1-10)</Label>
                    <div className="grid grid-cols-10 gap-2 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <Button
                          key={i}
                          type="button"
                          variant={formData.effortRating === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, effortRating: i})}
                          disabled={isSaving}
                        >
                          {i}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Difficulty Rating (1-10)</Label>
                    <div className="grid grid-cols-10 gap-2 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <Button
                          key={i}
                          type="button"
                          variant={formData.difficultyRating === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, difficultyRating: i})}
                          disabled={isSaving}
                        >
                          {i}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Engagement Rating (1-10)</Label>
                    <div className="grid grid-cols-10 gap-2 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <Button
                          key={i}
                          type="button"
                          variant={formData.engagementRating === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, engagementRating: i})}
                          disabled={isSaving}
                        >
                          {i}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Satisfaction Rating (1-10)</Label>
                    <div className="grid grid-cols-10 gap-2 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <Button
                          key={i}
                          type="button"
                          variant={formData.satisfactionRating === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, satisfactionRating: i})}
                          disabled={isSaving}
                        >
                          {i}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* PROGRESS TAB */}
              <TabsContent value="progress" className="space-y-4 mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="goalsAchieved">Goals Achieved (%)</Label>
                    <Input 
                      id="goalsAchieved"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.goalsAchievedPercentage || ""}
                      onChange={(e) => setFormData({...formData, goalsAchievedPercentage: parseInt(e.target.value) || 0})}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topicsUnderstood">Topics Fully Understood</Label>
                    <Input 
                      id="topicsUnderstood"
                      type="number"
                      min="0"
                      value={formData.topicsFullyUnderstood || ""}
                      onChange={(e) => setFormData({...formData, topicsFullyUnderstood: parseInt(e.target.value) || 0})}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topicsReview">Topics Need Review</Label>
                    <Input 
                      id="topicsReview"
                      type="number"
                      min="0"
                      value={formData.topicsNeedReview || ""}
                      onChange={(e) => setFormData({...formData, topicsNeedReview: parseInt(e.target.value) || 0})}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pagesCompleted">Pages Completed</Label>
                    <Input 
                      id="pagesCompleted"
                      type="number"
                      min="0"
                      value={formData.pagesCompleted || ""}
                      onChange={(e) => setFormData({...formData, pagesCompleted: parseInt(e.target.value) || 0})}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problemsCompleted">Problems Completed</Label>
                    <Input 
                      id="problemsCompleted"
                      type="number"
                      min="0"
                      value={formData.problemsCompleted || ""}
                      onChange={(e) => setFormData({...formData, problemsCompleted: parseInt(e.target.value) || 0})}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* REFLECTION TAB */}
              <TabsContent value="reflection" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="whatWentWell">What Went Well</Label>
                  <Textarea 
                    id="whatWentWell"
                    value={formData.whatWentWell}
                    onChange={(e) => setFormData({...formData, whatWentWell: e.target.value})}
                    placeholder="What worked well in this session?"
                    disabled={isSaving}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatDidntGoWell">What Didn't Go Well</Label>
                  <Textarea 
                    id="whatDidntGoWell"
                    value={formData.whatDidntGoWell}
                    onChange={(e) => setFormData({...formData, whatDidntGoWell: e.target.value})}
                    placeholder="What could have been better?"
                    disabled={isSaving}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyConceptsLearned">Key Concepts Learned</Label>
                  <Textarea 
                    id="keyConceptsLearned"
                    value={formData.keyConceptsLearned}
                    onChange={(e) => setFormData({...formData, keyConceptsLearned: e.target.value})}
                    placeholder="What were the main takeaways?"
                    disabled={isSaving}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficultiesEncountered">Difficulties Encountered</Label>
                  <Textarea 
                    id="difficultiesEncountered"
                    value={formData.difficultiesEncountered}
                    onChange={(e) => setFormData({...formData, difficultiesEncountered: e.target.value})}
                    placeholder="What was challenging?"
                    disabled={isSaving}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionsToResearch">Questions to Research</Label>
                  <Textarea 
                    id="questionsToResearch"
                    value={formData.questionsToResearch}
                    onChange={(e) => setFormData({...formData, questionsToResearch: e.target.value})}
                    placeholder="What do you need to look up or clarify?"
                    disabled={isSaving}
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* OTHER TAB */}
              <TabsContent value="other" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>Was the Study Method Effective?</Label>
                  <RadioGroup 
                    value={formData.methodEffective}
                    onValueChange={(v) => setFormData({...formData, methodEffective: v})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="method-yes" disabled={isSaving} />
                      <Label htmlFor="method-yes" className="font-normal cursor-pointer">Yes, very effective</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="somewhat" id="method-somewhat" disabled={isSaving} />
                      <Label htmlFor="method-somewhat" className="font-normal cursor-pointer">Somewhat effective</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="method-no" disabled={isSaving} />
                      <Label htmlFor="method-no" className="font-normal cursor-pointer">Not effective</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="betterMethod">Better Method Suggestion</Label>
                  <Textarea 
                    id="betterMethod"
                    value={formData.betterMethodSuggestion}
                    onChange={(e) => setFormData({...formData, betterMethodSuggestion: e.target.value})}
                    placeholder="What method might work better next time?"
                    disabled={isSaving}
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mainDistraction">Main Distraction Source</Label>
                    <Input 
                      id="mainDistraction"
                      value={formData.mainDistractionSource}
                      onChange={(e) => setFormData({...formData, mainDistractionSource: e.target.value})}
                      placeholder="e.g., Phone, Noise, Social media"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distractionImpact">Distraction Impact (1-10)</Label>
                    <Input 
                      id="distractionImpact"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.distractionImpact || ""}
                      onChange={(e) => setFormData({...formData, distractionImpact: e.target.value})}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="energyAfter">Energy Level After (1-10)</Label>
                    <Input 
                      id="energyAfter"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.energyLevelAfter || ""}
                      onChange={(e) => setFormData({...formData, energyLevelAfter: parseInt(e.target.value) || 0})}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confidence">Confidence Level (1-10)</Label>
                    <Input 
                      id="confidence"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.confidenceLevel || ""}
                      onChange={(e) => setFormData({...formData, confidenceLevel: parseInt(e.target.value) || 0})}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextPlan">Next Session Plan</Label>
                  <Textarea 
                    id="nextPlan"
                    value={formData.nextSessionPlan}
                    onChange={(e) => setFormData({...formData, nextSessionPlan: e.target.value})}
                    placeholder="What should you focus on next?"
                    disabled={isSaving}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followUp">Follow-up Needed</Label>
                  <Textarea 
                    id="followUp"
                    value={formData.followUpNeeded}
                    onChange={(e) => setFormData({...formData, followUpNeeded: e.target.value})}
                    placeholder="Any follow-up actions required?"
                    disabled={isSaving}
                    rows={2}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className={`p-4 rounded-lg ${formData.durationMinutes < 0 ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900' : 'bg-muted'}`}>
              <p className="text-sm text-muted-foreground">Calculated Duration</p>
              {formData.durationMinutes < 0 ? (
                <div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formData.durationMinutes} minutes
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    ⚠️ End time is before start time! Please fix the dates.
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold">
                  {Math.floor(formData.durationMinutes / 60)}h {formData.durationMinutes % 60}m
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(`/sessions/${id}`)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
