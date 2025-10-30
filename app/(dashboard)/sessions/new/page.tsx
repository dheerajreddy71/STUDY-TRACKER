"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { 
  Play, Pause, Square, Coffee, Brain, Zap, Moon, Target, 
  Clock, AlertCircle, CheckCircle2, TrendingUp, Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function NewSessionPage() {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [lastFocusLevel, setLastFocusLevel] = useState<number | null>(null)
  const [breakCount, setBreakCount] = useState(0)
  const [distractionCount, setDistractionCount] = useState(0)
  
  // PRE-SESSION FORM DATA (Comprehensive Setup)
  const [formData, setFormData] = useState({
    // Basic Info
    subjectId: "",
    sessionType: "new_material",
    sessionPurpose: "",
    studyMethod: "reading",
    secondaryMethod: "",
    
    // Content Planning
    chapterUnit: "",
    topicsCovered: [] as string[],
    specificPages: "",
    learningObjectives: "",
    
    // Session Settings
    targetDuration: 60,
    autoBreakEnabled: true,
    breakInterval: 50,
    breakDuration: 10,
    focusModeEnabled: false,
    backgroundAmbiance: "",
    location: "",
    
    // Pre-Session State Assessment
    energyLevelBefore: 5,
    motivationLevelBefore: 5,
    hoursSleepLastNight: 7,
    mealsToday: [] as string[],
    moodBefore: "okay",
    distractionsPresent: "",
    
    // Goal Setting
    sessionGoal: "",
    targetPagesCompleted: 0,
    targetProblemsCompleted: 0
  })

  // DURING-SESSION DATA (Live Tracking)
  const [duringData, setDuringData] = useState({
    focusLog: [] as { timestamp: string; level: number }[],
    timestampedNotes: [] as { timestamp: string; note: string }[],
    distractionLog: [] as { timestamp: string; source: string; duration: number }[],
    currentNote: "",
    currentDistraction: ""
  })

  // POST-SESSION DATA (Comprehensive Reflection)
  const [afterData, setAfterData] = useState({
    // Core Ratings (7 required)
    focusRating: 5,
    productivityRating: 5,
    retentionRating: 5,
    effortRating: 5,
    difficultyRating: 3,
    engagementRating: 5,
    satisfactionRating: 5,
    
    // Progress Assessment
    accomplishments: "",
    goalAchieved: "yes",
    goalsAchievedPercentage: 100,
    topicsFullyUnderstood: 0,
    topicsNeedReview: 0,
    pagesCompleted: 0,
    problemsCompleted: 0,
    
    // Quality Reflection
    whatWentWell: "",
    whatDidntGoWell: "",
    keyConceptsLearned: "",
    difficultiesEncountered: "",
    questionsToResearch: "",
    
    // Method Effectiveness
    methodEffective: "yes",
    betterMethodSuggestion: "",
    
    // Distraction Analysis
    mainDistractionSource: "",
    distractionImpact: "low",
    
    // Post-Session State
    energyLevelAfter: 5,
    confidenceLevel: 5,
    
    // Next Steps
    actionItems: "",
    topicsForReview: [] as string[],
    nextSessionFocus: "",
    scheduleNextSession: false,
    
    // Overall
    overallNotes: "",
    challenges: "",
    sessionTags: [] as string[]
  })

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "guest-user"
    fetch(`/api/v1/subjects?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setSubjects(data.data)
          if (data.data.length > 0) {
            setFormData(prev => ({ ...prev, subjectId: data.data[0].id }))
          }
        }
      })
      .catch(err => console.error("Error loading subjects:", err))
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, isPaused])

  const handleStartSession = async () => {
    const userId = localStorage.getItem("userId") || "guest-user"
    
    if (!formData.subjectId) {
      toast.error("Please select a subject")
      return
    }

    if (!formData.sessionGoal?.trim()) {
      toast.error("Please specify a session goal")
      return
    }

    try {
      const response = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          // Basic Info
          subjectId: formData.subjectId,
          sessionType: formData.sessionType,
          sessionPurpose: formData.sessionPurpose,
          studyMethod: formData.studyMethod,
          secondaryMethod: formData.secondaryMethod,
          
          // Content Planning
          chapterUnit: formData.chapterUnit,
          topicsCovered: JSON.stringify(formData.topicsCovered),
          specificPages: formData.specificPages,
          learningObjectives: formData.learningObjectives,
          
          // Session Settings
          targetDurationMinutes: formData.targetDuration,
          autoBreakEnabled: formData.autoBreakEnabled ? 1 : 0,
          breakIntervalMinutes: formData.breakInterval,
          breakDurationMinutes: formData.breakDuration,
          focusModeEnabled: formData.focusModeEnabled ? 1 : 0,
          backgroundAmbiance: formData.backgroundAmbiance,
          location: formData.location,
          
          // Pre-Session State
          energyLevelBefore: formData.energyLevelBefore,
          motivationLevelBefore: formData.motivationLevelBefore,
          hoursSleepLastNight: formData.hoursSleepLastNight,
          mealsToday: JSON.stringify(formData.mealsToday),
          moodBefore: formData.moodBefore,
          distractionsPresent: formData.distractionsPresent,
          
          // Goals
          sessionGoal: formData.sessionGoal,
          targetPagesCompleted: formData.targetPagesCompleted,
          targetProblemsCompleted: formData.targetProblemsCompleted
        })
      })

      const data = await response.json()
      if (data.success) {
        setSessionId(data.data.id)
        setIsActive(true)
        toast.success("Session started!")
      } else {
        toast.error(data.error || "Failed to start session")
      }
    } catch (error) {
      console.error("Error starting session:", error)
      toast.error("Failed to start session")
    }
  }

  const handleFocusCheckin = async (level: number) => {
    if (!sessionId) return

    try {
      await fetch(`/api/v1/sessions/${sessionId}/focus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusLevel: level })
      })
      setLastFocusLevel(level)
      toast.success(`Focus level ${level} recorded`)
      
      // Clear selection after 2 seconds
      setTimeout(() => setLastFocusLevel(null), 2000)
    } catch (error) {
      console.error("Error recording focus:", error)
    }
  }

  const handleEndSession = async () => {
    if (!sessionId) return
    // Show completion dialog instead of immediately ending
    setShowCompletionDialog(true)
  }

  const handleCompleteSession = async () => {
    if (!sessionId) return

    try {
      const response = await fetch("/api/v1/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          
          // Core ratings
          focusRating: afterData.focusRating,
          productivityRating: afterData.productivityRating,
          retentionRating: afterData.retentionRating,
          effortRating: afterData.effortRating,
          difficultyRating: afterData.difficultyRating,
          engagementRating: afterData.engagementRating,
          satisfactionRating: afterData.satisfactionRating,
          
          // Progress
          actualDurationMinutes: Math.floor(duration / 60),
          accomplishments: afterData.accomplishments,
          goalAchieved: afterData.goalAchieved,
          goalsAchievedPercentage: afterData.goalsAchievedPercentage,
          topicsFullyUnderstood: afterData.topicsFullyUnderstood,
          topicsNeedReview: afterData.topicsNeedReview,
          pagesCompleted: afterData.pagesCompleted,
          problemsCompleted: afterData.problemsCompleted,
          
          // Quality reflection
          whatWentWell: afterData.whatWentWell,
          whatDidntGoWell: afterData.whatDidntGoWell,
          keyConceptsLearned: afterData.keyConceptsLearned,
          difficultiesEncountered: afterData.difficultiesEncountered,
          questionsToResearch: afterData.questionsToResearch,
          
          // Method effectiveness
          methodEffective: afterData.methodEffective,
          betterMethodSuggestion: afterData.betterMethodSuggestion,
          
          // Distractions
          mainDistractionSource: afterData.mainDistractionSource,
          distractionImpact: afterData.distractionImpact,
          distractionLog: JSON.stringify(duringData.distractionLog),
          totalDistractionTime: duringData.distractionLog.reduce((sum, d) => sum + d.duration, 0),
          
          // State
          energyLevelAfter: afterData.energyLevelAfter,
          confidenceLevel: afterData.confidenceLevel,
          
          // Next steps
          actionItems: afterData.actionItems,
          topicsForReview: JSON.stringify(afterData.topicsForReview),
          nextSessionFocus: afterData.nextSessionFocus,
          scheduleNextSession: afterData.scheduleNextSession,
          
          // Overall
          completionNotes: afterData.overallNotes,
          challenges: afterData.challenges,
          sessionTags: JSON.stringify(afterData.sessionTags),
          
          // During-session data
          focusLevelLog: JSON.stringify(duringData.focusLog),
          timestampedNotes: JSON.stringify(duringData.timestampedNotes),
          averageFocusScore: duringData.focusLog.length > 0 
            ? duringData.focusLog.reduce((sum, f) => sum + f.level, 0) / duringData.focusLog.length 
            : afterData.focusRating,
          breakCount: breakCount
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Session completed successfully!")
        router.push("/sessions")
      } else {
        toast.error(data.error || "Failed to complete session")
      }
    } catch (error) {
      console.error("Error completing session:", error)
      toast.error("Failed to complete session")
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Start Study Session</h1>
        <p className="text-muted-foreground mt-2">Begin a new focused study session</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Session Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Session Setup</CardTitle>
              <CardDescription>Configure your study session with comprehensive tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isActive ? (
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="state">Pre-Session</TabsTrigger>
                  </TabsList>

                  {/* BASIC TAB */}
                  <TabsContent value="basic" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select 
                        value={formData.subjectId} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, subjectId: v }))}
                      >
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select a subject" />
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
                      <Label htmlFor="sessionType">Session Type</Label>
                      <Select 
                        value={formData.sessionType}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, sessionType: v }))}
                      >
                        <SelectTrigger id="sessionType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_material">New Material</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="practice">Practice</SelectItem>
                          <SelectItem value="revision">Revision</SelectItem>
                          <SelectItem value="exam_prep">Exam Prep</SelectItem>
                          <SelectItem value="homework">Homework</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="method">Study Method *</Label>
                      <Select 
                        value={formData.studyMethod}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, studyMethod: v }))}
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
                          <SelectItem value="active_recall">Active Recall</SelectItem>
                          <SelectItem value="mind_mapping">Mind Mapping</SelectItem>
                          <SelectItem value="group_study">Group Study</SelectItem>
                          <SelectItem value="past_papers">Past Papers</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal">Session Goal *</Label>
                      <Textarea 
                        id="goal" 
                        placeholder="What do you want to accomplish in this session?"
                        value={formData.sessionGoal}
                        onChange={(e) => setFormData(prev => ({ ...prev, sessionGoal: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        placeholder="Library, Home, Café, etc."
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                  </TabsContent>

                  {/* CONTENT TAB */}
                  <TabsContent value="content" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="chapter">Chapter/Unit</Label>
                      <Input 
                        id="chapter" 
                        placeholder="e.g., Chapter 5, Unit 3"
                        value={formData.chapterUnit}
                        onChange={(e) => setFormData(prev => ({ ...prev, chapterUnit: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pages">Specific Pages</Label>
                      <Input 
                        id="pages" 
                        placeholder="e.g., 120-145, or Problem Set 3"
                        value={formData.specificPages}
                        onChange={(e) => setFormData(prev => ({ ...prev, specificPages: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="objectives">Learning Objectives</Label>
                      <Textarea 
                        id="objectives" 
                        placeholder="What specific concepts or skills do you want to master?"
                        value={formData.learningObjectives}
                        onChange={(e) => setFormData(prev => ({ ...prev, learningObjectives: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="targetPages">Target Pages</Label>
                        <Input 
                          id="targetPages" 
                          type="number"
                          placeholder="0"
                          value={formData.targetPagesCompleted || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, targetPagesCompleted: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetProblems">Target Problems</Label>
                        <Input 
                          id="targetProblems" 
                          type="number"
                          placeholder="0"
                          value={formData.targetProblemsCompleted || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, targetProblemsCompleted: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* SETTINGS TAB */}
                  <TabsContent value="settings" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetDuration">Target Duration (minutes)</Label>
                      <Input 
                        id="targetDuration" 
                        type="number" 
                        value={formData.targetDuration}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetDuration: parseInt(e.target.value) || 60 }))}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <Label>Auto Break Enabled</Label>
                        <p className="text-xs text-muted-foreground">Automatically remind you to take breaks</p>
                      </div>
                      <Switch 
                        checked={formData.autoBreakEnabled}
                        onCheckedChange={(v) => setFormData(prev => ({ ...prev, autoBreakEnabled: v }))}
                      />
                    </div>

                    {formData.autoBreakEnabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="breakInterval">Break Interval (min)</Label>
                          <Input 
                            id="breakInterval" 
                            type="number" 
                            value={formData.breakInterval}
                            onChange={(e) => setFormData(prev => ({ ...prev, breakInterval: parseInt(e.target.value) || 50 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="breakDuration">Break Duration (min)</Label>
                          <Input 
                            id="breakDuration" 
                            type="number" 
                            value={formData.breakDuration}
                            onChange={(e) => setFormData(prev => ({ ...prev, breakDuration: parseInt(e.target.value) || 10 }))}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <Label>Focus Mode</Label>
                        <p className="text-xs text-muted-foreground">Block distractions during session</p>
                      </div>
                      <Switch 
                        checked={formData.focusModeEnabled}
                        onCheckedChange={(v) => setFormData(prev => ({ ...prev, focusModeEnabled: v }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ambiance">Background Ambiance</Label>
                      <Select 
                        value={formData.backgroundAmbiance}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, backgroundAmbiance: v }))}
                      >
                        <SelectTrigger id="ambiance">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          <SelectItem value="white_noise">White Noise</SelectItem>
                          <SelectItem value="rain">Rain Sounds</SelectItem>
                          <SelectItem value="coffee_shop">Coffee Shop</SelectItem>
                          <SelectItem value="lofi">Lo-fi Music</SelectItem>
                          <SelectItem value="classical">Classical Music</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  {/* PRE-SESSION STATE TAB */}
                  <TabsContent value="state" className="space-y-4">
                    <div className="space-y-3">
                      <Label>Energy Level (1-10)</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[formData.energyLevelBefore]}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, energyLevelBefore: v[0] }))}
                          max={10}
                          min={1}
                          step={1}
                          className="flex-1"
                        />
                        <span className="w-8 text-center font-medium">{formData.energyLevelBefore}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Motivation Level (1-10)</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[formData.motivationLevelBefore]}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, motivationLevelBefore: v[0] }))}
                          max={10}
                          min={1}
                          step={1}
                          className="flex-1"
                        />
                        <span className="w-8 text-center font-medium">{formData.motivationLevelBefore}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sleep">Hours of Sleep Last Night</Label>
                      <Input 
                        id="sleep" 
                        type="number"
                        step="0.5"
                        value={formData.hoursSleepLastNight}
                        onChange={(e) => setFormData(prev => ({ ...prev, hoursSleepLastNight: parseFloat(e.target.value) || 7 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Meals Today</Label>
                      <div className="flex gap-2">
                        {['breakfast', 'lunch', 'dinner'].map(meal => (
                          <div key={meal} className="flex items-center space-x-2">
                            <Checkbox 
                              id={meal}
                              checked={formData.mealsToday.includes(meal)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData(prev => ({ ...prev, mealsToday: [...prev.mealsToday, meal] }))
                                } else {
                                  setFormData(prev => ({ ...prev, mealsToday: prev.mealsToday.filter(m => m !== meal) }))
                                }
                              }}
                            />
                            <Label htmlFor={meal} className="font-normal capitalize cursor-pointer">{meal}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mood">Current Mood</Label>
                      <Select 
                        value={formData.moodBefore}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, moodBefore: v }))}
                      >
                        <SelectTrigger id="mood">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="great">😄 Great</SelectItem>
                          <SelectItem value="good">🙂 Good</SelectItem>
                          <SelectItem value="okay">😐 Okay</SelectItem>
                          <SelectItem value="low">😔 Low</SelectItem>
                          <SelectItem value="very_low">😞 Very Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="distractions">Potential Distractions</Label>
                      <Textarea 
                        id="distractions" 
                        placeholder="Phone, notifications, noise, etc."
                        value={formData.distractionsPresent}
                        onChange={(e) => setFormData(prev => ({ ...prev, distractionsPresent: e.target.value }))}
                        rows={2}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Session in progress. Complete the session to edit details.</p>
                </div>
              )}

              {!isActive && (
                <Button className="w-full" size="lg" onClick={handleStartSession}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Session
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timer Display */}
        <Card>
          <CardHeader>
            <CardTitle>Session Timer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold font-mono">
                {String(Math.floor(duration / 60)).padStart(2, "0")}:{String(duration % 60).padStart(2, "0")}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Elapsed Time</p>
              {formData.targetDuration > 0 && (
                <p className="text-xs text-muted-foreground">
                  Target: {formData.targetDuration} minutes
                </p>
              )}
            </div>

            <div className="space-y-2">
              {isActive && (
                <>
                  <Button variant="destructive" className="w-full" onClick={handleEndSession}>
                    End Session
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent"
                    onClick={() => setIsPaused(!isPaused)}
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                </>
              )}
              {!isActive && (
                <Button variant="outline" className="w-full" disabled>
                  Session Not Started
                </Button>
              )}
            </div>

            {isActive && (
              <div className="space-y-2 pt-4 border-t">
                <Label>Focus Level Check-in (1-10)</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <Button 
                      key={i} 
                      variant={lastFocusLevel === i ? "default" : "outline"}
                      size="sm" 
                      className={lastFocusLevel === i ? "bg-primary text-primary-foreground" : "bg-transparent"}
                      onClick={() => handleFocusCheckin(i)}
                    >
                      {i}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  1 = Very Distracted, 10 = Fully Focused
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Study Session</DialogTitle>
            <DialogDescription>
              Review your session and provide comprehensive feedback
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="reflection" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reflection">Reflection</TabsTrigger>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
              <TabsTrigger value="next">Next Steps</TabsTrigger>
            </TabsList>

            {/* REFLECTION TAB */}
            <TabsContent value="reflection" className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <Label className="text-sm font-semibold">Your Goal:</Label>
                <p className="text-sm mt-1">{formData.sessionGoal || "No goal specified"}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accomplishments">What did you accomplish? *</Label>
                <Textarea 
                  id="accomplishments"
                  placeholder="Describe what you covered and learned"
                  value={afterData.accomplishments}
                  onChange={(e) => setAfterData(prev => ({ ...prev, accomplishments: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pagesCompleted">Pages Completed</Label>
                  <Input 
                    id="pagesCompleted"
                    type="number"
                    value={afterData.pagesCompleted || ''}
                    onChange={(e) => setAfterData(prev => ({ ...prev, pagesCompleted: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="problemsCompleted">Problems Completed</Label>
                  <Input 
                    id="problemsCompleted"
                    type="number"
                    value={afterData.problemsCompleted || ''}
                    onChange={(e) => setAfterData(prev => ({ ...prev, problemsCompleted: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Did you accomplish your goal?</Label>
                <RadioGroup 
                  value={afterData.goalAchieved}
                  onValueChange={(v) => setAfterData(prev => ({ ...prev, goalAchieved: v }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="goal-yes" />
                    <Label htmlFor="goal-yes" className="font-normal cursor-pointer">
                      Yes, completely
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" id="goal-partial" />
                    <Label htmlFor="goal-partial" className="font-normal cursor-pointer">
                      Partially completed
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="goal-no" />
                    <Label htmlFor="goal-no" className="font-normal cursor-pointer">
                      No, didn't complete
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyLearnings">Key Concepts Learned</Label>
                <Textarea 
                  id="keyLearnings"
                  placeholder="What are the main takeaways?"
                  value={afterData.keyConceptsLearned}
                  onChange={(e) => setAfterData(prev => ({ ...prev, keyConceptsLearned: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatWentWell">What Went Well</Label>
                <Textarea 
                  id="whatWentWell"
                  placeholder="Positive aspects of this session"
                  value={afterData.whatWentWell}
                  onChange={(e) => setAfterData(prev => ({ ...prev, whatWentWell: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatDidntGoWell">What Didn't Go Well</Label>
                <Textarea 
                  id="whatDidntGoWell"
                  placeholder="Challenges or issues faced"
                  value={afterData.whatDidntGoWell}
                  onChange={(e) => setAfterData(prev => ({ ...prev, whatDidntGoWell: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulties">Difficulties Encountered</Label>
                <Textarea 
                  id="difficulties"
                  placeholder="Specific concepts or problems that were difficult"
                  value={afterData.difficultiesEncountered}
                  onChange={(e) => setAfterData(prev => ({ ...prev, difficultiesEncountered: e.target.value }))}
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* RATINGS TAB */}
            <TabsContent value="ratings" className="space-y-4">
              <div className="space-y-3">
                <Label>Focus Rating (1-10) *</Label>
                <Slider 
                  value={[afterData.focusRating]}
                  onValueChange={(v) => setAfterData(prev => ({ ...prev, focusRating: v[0] }))}
                  max={10}
                  min={1}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very Distracted</span>
                  <span className="font-medium text-lg">{afterData.focusRating}/10</span>
                  <span>Fully Focused</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Productivity Rating (1-10) *</Label>
                <Slider 
                  value={[afterData.productivityRating]}
                  onValueChange={(v) => setAfterData(prev => ({ ...prev, productivityRating: v[0] }))}
                  max={10}
                  min={1}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not Productive</span>
                  <span className="font-medium text-lg">{afterData.productivityRating}/10</span>
                  <span>Very Productive</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Retention Rating (1-10)</Label>
                <Slider 
                  value={[afterData.retentionRating]}
                  onValueChange={(v) => setAfterData(prev => ({ ...prev, retentionRating: v[0] }))}
                  max={10}
                  min={1}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Won't Remember</span>
                  <span className="font-medium text-lg">{afterData.retentionRating}/10</span>
                  <span>Will Remember</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Difficulty Rating (1-5)</Label>
                <Slider 
                  value={[afterData.difficultyRating]}
                  onValueChange={(v) => setAfterData(prev => ({ ...prev, difficultyRating: v[0] }))}
                  max={5}
                  min={1}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very Easy</span>
                  <span className="font-medium text-lg">{afterData.difficultyRating}/5</span>
                  <span>Very Hard</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Energy Level After (1-10)</Label>
                <Slider 
                  value={[afterData.energyLevelAfter]}
                  onValueChange={(v) => setAfterData(prev => ({ ...prev, energyLevelAfter: v[0] }))}
                  max={10}
                  min={1}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Exhausted</span>
                  <span className="font-medium text-lg">{afterData.energyLevelAfter}/10</span>
                  <span>Energized</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Confidence Level (1-10)</Label>
                <Slider 
                  value={[afterData.confidenceLevel]}
                  onValueChange={(v) => setAfterData(prev => ({ ...prev, confidenceLevel: v[0] }))}
                  max={10}
                  min={1}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not Confident</span>
                  <span className="font-medium text-lg">{afterData.confidenceLevel}/10</span>
                  <span>Very Confident</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Was the study method effective?</Label>
                <RadioGroup 
                  value={afterData.methodEffective}
                  onValueChange={(v) => setAfterData(prev => ({ ...prev, methodEffective: v }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="method-yes" />
                    <Label htmlFor="method-yes" className="font-normal cursor-pointer">Yes, very effective</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="somewhat" id="method-somewhat" />
                    <Label htmlFor="method-somewhat" className="font-normal cursor-pointer">Somewhat effective</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="method-no" />
                    <Label htmlFor="method-no" className="font-normal cursor-pointer">Not effective</Label>
                  </div>
                </RadioGroup>
              </div>

              {afterData.methodEffective !== "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="betterMethod">What method might work better?</Label>
                  <Input 
                    id="betterMethod"
                    placeholder="Suggest an alternative approach"
                    value={afterData.betterMethodSuggestion}
                    onChange={(e) => setAfterData(prev => ({ ...prev, betterMethodSuggestion: e.target.value }))}
                  />
                </div>
              )}
            </TabsContent>

            {/* NEXT STEPS TAB */}
            <TabsContent value="next" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="actionItems">Action Items</Label>
                <Textarea 
                  id="actionItems"
                  placeholder="What do you need to do next? (e.g., review notes, solve more problems)"
                  value={afterData.actionItems}
                  onChange={(e) => setAfterData(prev => ({ ...prev, actionItems: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questions">Questions to Research</Label>
                <Textarea 
                  id="questions"
                  placeholder="Concepts or topics you need to look up"
                  value={afterData.questionsToResearch}
                  onChange={(e) => setAfterData(prev => ({ ...prev, questionsToResearch: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextFocus">Next Session Focus</Label>
                <Textarea 
                  id="nextFocus"
                  placeholder="What should you focus on in your next study session?"
                  value={afterData.nextSessionFocus}
                  onChange={(e) => setAfterData(prev => ({ ...prev, nextSessionFocus: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topicsUnderstood">Topics Fully Understood</Label>
                  <Input 
                    id="topicsUnderstood"
                    type="number"
                    value={afterData.topicsFullyUnderstood || ''}
                    onChange={(e) => setAfterData(prev => ({ ...prev, topicsFullyUnderstood: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topicsReview">Topics Need Review</Label>
                  <Input 
                    id="topicsReview"
                    type="number"
                    value={afterData.topicsNeedReview || ''}
                    onChange={(e) => setAfterData(prev => ({ ...prev, topicsNeedReview: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="overallNotes">Overall Notes</Label>
                <Textarea 
                  id="overallNotes"
                  placeholder="Any other thoughts, insights, or reminders"
                  value={afterData.overallNotes}
                  onChange={(e) => setAfterData(prev => ({ ...prev, overallNotes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="scheduleNext"
                  checked={afterData.scheduleNextSession}
                  onCheckedChange={(checked) => setAfterData(prev => ({ ...prev, scheduleNextSession: checked as boolean }))}
                />
                <Label htmlFor="scheduleNext" className="font-normal cursor-pointer">
                  I want to schedule my next session now
                </Label>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCompletionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteSession}
              disabled={!afterData.accomplishments?.trim()}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
