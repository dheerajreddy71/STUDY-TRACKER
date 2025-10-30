"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Calendar, FileText, BarChart3, BookOpen, Target, TrendingUp, AlertCircle, CheckCircle2, Plus, X } from "lucide-react"

export default function NewPerformancePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>("identification")
  const [subjects, setSubjects] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  
  // Step 1: Assessment Identification
  const [identificationData, setIdentificationData] = useState({
    assessmentTitle: "",
    assessmentType: "quiz",
    assessmentIdNumber: "",
    assessmentDate: new Date().toISOString().split('T')[0],
    assessmentTime: "",
    dateReceivedResults: "",
    subjectId: ""
  })

  // Step 2: Score Details
  const [scoreData, setScoreData] = useState({
    score: 0,
    totalPossible: 100,
    percentage: 0,
    grade: "",
    scoreFormat: "percentage",
    assessmentWeight: 0,
    importanceLevel: "medium",
    countsTowardFinal: true
  })

  // Step 3: Class Context
  const [contextData, setContextData] = useState({
    classAverage: 0,
    highestScore: 0,
    lowestScore: 0,
    yourRank: 0,
    percentile: 0,
    totalStudents: 0
  })

  // Step 4: Content & Preparation
  const [contentData, setContentData] = useState({
    chaptersCovered: [] as string[],
    currentChapter: "",
    topicsTested: [] as string[],
    currentTopic: "",
    totalQuestions: 0,
    questionsCorrect: 0,
    topicBreakdown: [] as Array<{topic: string, questions: number, correct: number, difficulty: string, confidence: number}>,
    timeAllocatedMinutes: 0,
    timeTakenMinutes: 0,
    timePressureLevel: "just_right",
    totalHoursStudied: 0,
    daysOfPreparation: 0,
    preparationStartDate: "",
    studyMethodsUsed: [] as string[],
    currentMethod: "",
    preparationQuality: 5,
    linkedSessionIds: [] as string[],
    totalLinkedStudyHours: 0,
    averageLinkedFocus: 0
  })

  // Step 5: Pre/Post State & Analysis
  const [analysisData, setAnalysisData] = useState({
    // Pre-assessment
    confidenceBefore: 5,
    feltPrepared: "partially",
    expectedScoreMin: 0,
    expectedScoreMax: 100,
    sleepNightBefore: 7,
    stressLevelBefore: 5,
    healthStatus: "healthy",
    otherFactors: "",
    
    // Post-assessment
    scoreVsExpectation: "as_expected",
    scoreSurpriseLevel: 5,
    confidenceAfterTaking: 5,
    confidenceAfterResults: 5,
    scoreReflectsKnowledge: "yes",
    
    // Strengths & Weaknesses
    strengthsTopics: [] as string[],
    currentStrengthTopic: "",
    strengthsQuestionTypes: [] as string[],
    currentStrengthType: "",
    whatHelpedSucceed: "",
    weaknessesTopics: [] as string[],
    currentWeaknessTopic: "",
    weaknessesQuestionTypes: [] as string[],
    currentWeaknessType: "",
    commonMistakes: "",
    conceptsStillUnclear: "",
    
    // Detailed Analysis
    questionsMissedLackKnowledge: 0,
    questionsMissedCareless: 0,
    questionsMissedTimePressure: 0,
    questionsMissedMisread: 0,
    questionsMissedAnxiety: 0,
    questionsMissedOther: 0,
    
    // Learning Insights
    lessonsLearned: "",
    whatToDoDifferently: "",
    mostEffectiveStudyApproach: "",
    leastEffectiveStudyApproach: ""
  })

  // Step 6: Next Steps & Reflection
  const [nextStepsData, setNextStepsData] = useState({
    topicsToReview: [] as string[],
    currentReviewTopic: "",
    conceptsNeedingRelearning: "",
    actionPlan: "",
    targetScoreNext: 0,
    specificSkillsToWorkOn: "",
    studyApproachChanges: "",
    assessmentTags: [] as string[],
    currentTag: "",
    overallNotes: "",
    instructorFeedback: "",
    peerComparisonNotes: "",
    personalReflection: ""
  })

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "guest-user"
    
    // Load subjects
    fetch(`/api/v1/subjects?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        console.log("[Performance Form] Subjects loaded:", data)
        if (data.success) {
          setSubjects(data.data || [])
          if (data.data && data.data.length > 0) {
            console.log("[Performance Form] Setting default subject:", data.data[0].id)
            setIdentificationData(prev => ({ ...prev, subjectId: data.data[0].id }))
          } else {
            console.warn("[Performance Form] No subjects available")
          }
        }
      })
      .catch(err => console.error("Error loading subjects:", err))
    
    // Load sessions for linking
    fetch(`/api/v1/sessions?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setSessions(data.data || [])
        }
      })
      .catch(err => console.error("Error loading sessions:", err))
  }, [])

  // Calculate percentage when score changes
  useEffect(() => {
    if (scoreData.totalPossible > 0) {
      const percentage = (scoreData.score / scoreData.totalPossible) * 100
      setScoreData(prev => ({ ...prev, percentage: Number(percentage.toFixed(2)) }))
    }
  }, [scoreData.score, scoreData.totalPossible])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Comprehensive Validation
    if (!identificationData.subjectId) {
      toast.error("Please select a subject")
      return
    }

    if (!identificationData.assessmentTitle.trim()) {
      toast.error("Please enter an assessment title")
      return
    }

    if (identificationData.assessmentTitle.length > 300) {
      toast.error("Assessment title must be less than 300 characters")
      return
    }

    if (scoreData.score < 0) {
      toast.error("Score cannot be negative")
      return
    }

    if (scoreData.totalPossible <= 0) {
      toast.error("Total possible score must be greater than 0")
      return
    }

    if (scoreData.score > scoreData.totalPossible) {
      toast.error("Score cannot exceed total possible score")
      return
    }

    if (scoreData.assessmentWeight < 0 || scoreData.assessmentWeight > 100) {
      toast.error("Assessment weight must be between 0 and 100")
      return
    }

    if (contextData.classAverage < 0 || contextData.classAverage > scoreData.totalPossible) {
      toast.error("Class average must be valid")
      return
    }

    if (contentData.totalQuestions > 0 && contentData.questionsCorrect > contentData.totalQuestions) {
      toast.error("Questions correct cannot exceed total questions")
      return
    }

    setIsLoading(true)

    const userId = localStorage.getItem("userId") || "guest-user"

    try {
      const response = await fetch("/api/v1/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          subjectId: identificationData.subjectId,
          
          // Assessment Identification
          entryType: identificationData.assessmentType, // Map assessmentType to entryType for API
          assessmentTitle: identificationData.assessmentTitle.trim(),
          assessmentType: identificationData.assessmentType,
          assessmentIdNumber: identificationData.assessmentIdNumber.trim() || undefined,
          assessmentDate: new Date(identificationData.assessmentDate).toISOString(),
          assessmentTime: identificationData.assessmentTime || undefined,
          dateReceivedResults: identificationData.dateReceivedResults ? new Date(identificationData.dateReceivedResults).toISOString() : undefined,
          
          // Score Information
          score: Number(scoreData.score),
          totalPossible: Number(scoreData.totalPossible),
          percentage: scoreData.percentage,
          grade: scoreData.grade.trim() || undefined,
          scoreFormat: scoreData.scoreFormat,
          assessmentWeight: scoreData.assessmentWeight,
          importanceLevel: scoreData.importanceLevel,
          countsTowardFinal: scoreData.countsTowardFinal ? 1 : 0,
          
          // Class Context
          classAverage: contextData.classAverage || undefined,
          highestScore: contextData.highestScore || undefined,
          lowestScore: contextData.lowestScore || undefined,
          yourRank: contextData.yourRank || undefined,
          percentile: contextData.percentile || undefined,
          totalStudents: contextData.totalStudents || undefined,
          
          // Content Coverage
          chaptersCovered: JSON.stringify(contentData.chaptersCovered),
          topicsTested: JSON.stringify(contentData.topicsTested),
          totalQuestions: contentData.totalQuestions || undefined,
          questionsCorrect: contentData.questionsCorrect || undefined,
          topicBreakdown: contentData.topicBreakdown.length > 0 ? JSON.stringify(contentData.topicBreakdown) : undefined,
          
          // Time Information
          timeAllocatedMinutes: contentData.timeAllocatedMinutes || undefined,
          timeTakenMinutes: contentData.timeTakenMinutes || undefined,
          timePressureLevel: contentData.timePressureLevel,
          
          // Preparation Information
          totalHoursStudied: contentData.totalHoursStudied,
          daysOfPreparation: contentData.daysOfPreparation,
          preparationStartDate: contentData.preparationStartDate ? new Date(contentData.preparationStartDate).toISOString() : undefined,
          studyMethodsUsed: JSON.stringify(contentData.studyMethodsUsed),
          preparationQuality: contentData.preparationQuality,
          
          // Linked Sessions
          linkedSessionIds: JSON.stringify(contentData.linkedSessionIds),
          totalLinkedStudyHours: contentData.totalLinkedStudyHours,
          averageLinkedFocus: contentData.averageLinkedFocus,
          
          // Pre-Assessment State
          confidenceBefore: analysisData.confidenceBefore,
          feltPrepared: analysisData.feltPrepared,
          expectedScoreMin: analysisData.expectedScoreMin || undefined,
          expectedScoreMax: analysisData.expectedScoreMax || undefined,
          sleepNightBefore: analysisData.sleepNightBefore,
          stressLevelBefore: analysisData.stressLevelBefore,
          healthStatus: analysisData.healthStatus,
          otherFactors: analysisData.otherFactors || undefined,
          
          // Post-Assessment Reflection
          scoreVsExpectation: analysisData.scoreVsExpectation,
          scoreSurpriseLevel: analysisData.scoreSurpriseLevel,
          confidenceAfterTaking: analysisData.confidenceAfterTaking,
          confidenceAfterResults: analysisData.confidenceAfterResults,
          scoreReflectsKnowledge: analysisData.scoreReflectsKnowledge,
          
          // Performance Analysis
          strengthsTopics: JSON.stringify(analysisData.strengthsTopics),
          strengthsQuestionTypes: JSON.stringify(analysisData.strengthsQuestionTypes),
          whatHelpedSucceed: analysisData.whatHelpedSucceed || undefined,
          weaknessesTopics: JSON.stringify(analysisData.weaknessesTopics),
          weaknessesQuestionTypes: JSON.stringify(analysisData.weaknessesQuestionTypes),
          commonMistakes: analysisData.commonMistakes || undefined,
          conceptsStillUnclear: analysisData.conceptsStillUnclear || undefined,
          
          // Detailed Analysis
          questionsMissedBreakdown: JSON.stringify({
            lackKnowledge: analysisData.questionsMissedLackKnowledge,
            careless: analysisData.questionsMissedCareless,
            timePressure: analysisData.questionsMissedTimePressure,
            misread: analysisData.questionsMissedMisread,
            anxiety: analysisData.questionsMissedAnxiety,
            other: analysisData.questionsMissedOther
          }),
          
          // Learning Insights
          lessonsLearned: analysisData.lessonsLearned || undefined,
          whatToDoDifferently: analysisData.whatToDoDifferently || undefined,
          mostEffectiveStudyApproach: analysisData.mostEffectiveStudyApproach || undefined,
          leastEffectiveStudyApproach: analysisData.leastEffectiveStudyApproach || undefined,
          
          // Next Steps
          topicsToReview: JSON.stringify(nextStepsData.topicsToReview),
          conceptsNeedingRelearning: nextStepsData.conceptsNeedingRelearning || undefined,
          actionPlan: nextStepsData.actionPlan || undefined,
          targetScoreNext: nextStepsData.targetScoreNext || undefined,
          specificSkillsToWorkOn: nextStepsData.specificSkillsToWorkOn || undefined,
          studyApproachChanges: nextStepsData.studyApproachChanges || undefined,
          
          // Tags & Notes
          assessmentTags: JSON.stringify(nextStepsData.assessmentTags),
          overallNotes: nextStepsData.overallNotes || undefined,
          instructorFeedback: nextStepsData.instructorFeedback || undefined,
          peerComparisonNotes: nextStepsData.peerComparisonNotes || undefined,
          personalReflection: nextStepsData.personalReflection || undefined
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success("Performance logged successfully!")
        router.push("/performance")
      } else {
        toast.error(data.error || "Failed to log performance")
      }
    } catch (error) {
      console.error("Error logging performance:", error)
      toast.error("Failed to log performance")
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = (array: string[], item: string, setData: any, field: string) => {
    if (item.trim()) {
      setData((prev: any) => ({
        ...prev,
        [field]: [...array, item.trim()],
        [`current${field.charAt(0).toUpperCase() + field.slice(1, -1)}`]: ""
      }))
    }
  }

  const removeItem = (array: string[], index: number, setData: any, field: string) => {
    setData((prev: any) => ({
      ...prev,
      [field]: array.filter((_, i) => i !== index)
    }))
  }

  const canProceed = () => {
    if (currentStep === "identification") {
      return identificationData.assessmentTitle.trim() && identificationData.subjectId
    }
    if (currentStep === "scores") {
      return scoreData.totalPossible > 0
    }
    return true
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Performance</h1>
        <p className="text-muted-foreground mt-2">Complete assessment with comprehensive analysis (40+ fields)</p>
      </div>

      {subjects.length === 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            No subjects found. Please <a href="/subjects" className="underline font-medium">create a subject</a> first before logging performance.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Performance Assessment - 6-Step Comprehensive Wizard</CardTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant={currentStep === "identification" ? "default" : "outline"}>1. Identification</Badge>
              <Badge variant={currentStep === "scores" ? "default" : "outline"}>2. Scores</Badge>
              <Badge variant={currentStep === "context" ? "default" : "outline"}>3. Context</Badge>
              <Badge variant={currentStep === "content" ? "default" : "outline"}>4. Content & Prep</Badge>
              <Badge variant={currentStep === "analysis" ? "default" : "outline"}>5. Analysis</Badge>
              <Badge variant={currentStep === "nextsteps" ? "default" : "outline"}>6. Next Steps</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="identification" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  ID
                </TabsTrigger>
                <TabsTrigger value="scores" disabled={!identificationData.assessmentTitle}>
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Scores
                </TabsTrigger>
                <TabsTrigger value="context" disabled={!identificationData.assessmentTitle}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Context
                </TabsTrigger>
                <TabsTrigger value="content" disabled={!identificationData.assessmentTitle}>
                  <BookOpen className="h-3 w-3 mr-1" />
                  Prep
                </TabsTrigger>
                <TabsTrigger value="analysis" disabled={!identificationData.assessmentTitle}>
                  <FileText className="h-3 w-3 mr-1" />
                  Analysis
                </TabsTrigger>
                <TabsTrigger value="nextsteps" disabled={!identificationData.assessmentTitle}>
                  <Target className="h-3 w-3 mr-1" />
                  Next
                </TabsTrigger>
              </TabsList>

              {/* STEP 1: Assessment Identification */}
              <TabsContent value="identification" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Step 1: Assessment Identification
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
                      <Select
                        value={identificationData.subjectId}
                        onValueChange={(v) => setIdentificationData({...identificationData, subjectId: v})}
                        disabled={isLoading || subjects.length === 0}
                      >
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select subject" />
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
                      <Label htmlFor="assessmentType">Assessment Type</Label>
                      <Select
                        value={identificationData.assessmentType}
                        onValueChange={(v) => setIdentificationData({...identificationData, assessmentType: v})}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="assessmentType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="test">Test</SelectItem>
                          <SelectItem value="midterm">Midterm</SelectItem>
                          <SelectItem value="final">Final Exam</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="homework">Homework</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="lab_report">Lab Report</SelectItem>
                          <SelectItem value="practice_test">Practice Test</SelectItem>
                          <SelectItem value="mock_exam">Mock Exam</SelectItem>
                          <SelectItem value="competitive_exam">Competitive Exam</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assessmentTitle">Assessment Title <span className="text-destructive">*</span></Label>
                    <Input 
                      id="assessmentTitle" 
                      type="text" 
                      placeholder="e.g., Midterm Exam, Chapter 5 Quiz"
                      value={identificationData.assessmentTitle}
                      onChange={(e) => setIdentificationData({...identificationData, assessmentTitle: e.target.value})}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assessmentIdNumber">Assessment ID Number (Optional)</Label>
                    <Input 
                      id="assessmentIdNumber" 
                      type="text" 
                      placeholder="e.g., EXAM-2024-001"
                      value={identificationData.assessmentIdNumber}
                      onChange={(e) => setIdentificationData({...identificationData, assessmentIdNumber: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="assessmentDate">Assessment Date <span className="text-destructive">*</span></Label>
                      <Input 
                        id="assessmentDate" 
                        type="date"
                        value={identificationData.assessmentDate}
                        onChange={(e) => setIdentificationData({...identificationData, assessmentDate: e.target.value})}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assessmentTime">Time (Optional)</Label>
                      <Input 
                        id="assessmentTime" 
                        type="time"
                        value={identificationData.assessmentTime}
                        onChange={(e) => setIdentificationData({...identificationData, assessmentTime: e.target.value})}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateReceivedResults">Date Received Results</Label>
                      <Input 
                        id="dateReceivedResults" 
                        type="date"
                        value={identificationData.dateReceivedResults}
                        onChange={(e) => setIdentificationData({...identificationData, dateReceivedResults: e.target.value})}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={() => setCurrentStep("scores")}
                      disabled={!canProceed() || isLoading}
                    >
                      Next: Scores <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* STEP 2: Score Details */}
              <TabsContent value="scores" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Step 2: Score Details
                  </h3>
                  <p className="text-sm text-muted-foreground">Enter your assessment scores and grading information</p>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="score">Score Earned <span className="text-destructive">*</span></Label>
                      <Input 
                        id="score" 
                        type="number" 
                        step="0.01"
                        placeholder="85"
                        value={scoreData.score || ""}
                        onChange={(e) => setScoreData({...scoreData, score: parseFloat(e.target.value) || 0})}
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalPossible">Total Possible <span className="text-destructive">*</span></Label>
                      <Input 
                        id="totalPossible" 
                        type="number" 
                        step="0.01"
                        placeholder="100"
                        value={scoreData.totalPossible || ""}
                        onChange={(e) => setScoreData({...scoreData, totalPossible: parseFloat(e.target.value) || 100})}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium mb-1">Calculated Percentage</p>
                    <p className="text-3xl font-bold text-primary">
                      {scoreData.percentage.toFixed(2)}%
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="grade">Letter Grade (Optional)</Label>
                      <Input 
                        id="grade" 
                        type="text" 
                        placeholder="A, B+, 85, etc."
                        value={scoreData.grade}
                        onChange={(e) => setScoreData({...scoreData, grade: e.target.value})}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scoreFormat">Score Format</Label>
                      <Select
                        value={scoreData.scoreFormat}
                        onValueChange={(v) => setScoreData({...scoreData, scoreFormat: v})}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="scoreFormat">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="points">Points</SelectItem>
                          <SelectItem value="grade">Letter Grade</SelectItem>
                          <SelectItem value="gpa">GPA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Weight & Importance</h4>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="assessmentWeight">Assessment Weight (%)</Label>
                        <Input 
                          id="assessmentWeight" 
                          type="number" 
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="0-100"
                          value={scoreData.assessmentWeight || ""}
                          onChange={(e) => setScoreData({...scoreData, assessmentWeight: parseFloat(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">How much this counts toward final grade</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="importanceLevel">Importance Level</Label>
                        <Select
                          value={scoreData.importanceLevel}
                          onValueChange={(v) => setScoreData({...scoreData, importanceLevel: v})}
                          disabled={isLoading}
                        >
                          <SelectTrigger id="importanceLevel">
                            <SelectValue placeholder="Select importance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="countsTowardFinal"
                        checked={scoreData.countsTowardFinal}
                        onCheckedChange={(checked) => setScoreData({...scoreData, countsTowardFinal: checked as boolean})}
                        disabled={isLoading}
                      />
                      <Label htmlFor="countsTowardFinal" className="cursor-pointer">
                        This assessment counts toward my final grade
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep("identification")}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setCurrentStep("context")} disabled={!scoreData.totalPossible}>
                      Next: Class Context <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* STEP 3: Class Context */}
              <TabsContent value="context" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Step 3: Class Context
                  </h3>
                  <p className="text-sm text-muted-foreground">How did you perform compared to the class? (All fields optional)</p>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="classAverage">Class Average</Label>
                      <Input 
                        id="classAverage" 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 75"
                        value={contextData.classAverage || ""}
                        onChange={(e) => setContextData({...contextData, classAverage: parseFloat(e.target.value) || 0})}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="highestScore">Highest Score</Label>
                      <Input 
                        id="highestScore" 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 98"
                        value={contextData.highestScore || ""}
                        onChange={(e) => setContextData({...contextData, highestScore: parseFloat(e.target.value) || 0})}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lowestScore">Lowest Score</Label>
                      <Input 
                        id="lowestScore" 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 45"
                        value={contextData.lowestScore || ""}
                        onChange={(e) => setContextData({...contextData, lowestScore: parseFloat(e.target.value) || 0})}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {contextData.classAverage > 0 && scoreData.score > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Your Performance vs Class</p>
                      <p className="text-xl font-bold">
                        {scoreData.score > contextData.classAverage ? (
                          <span className="text-green-600">+{(scoreData.score - contextData.classAverage).toFixed(1)} above average</span>
                        ) : scoreData.score < contextData.classAverage ? (
                          <span className="text-orange-600">{(contextData.classAverage - scoreData.score).toFixed(1)} below average</span>
                        ) : (
                          <span>At class average</span>
                        )}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Your Ranking</h4>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="yourRank">Your Rank</Label>
                        <Input 
                          id="yourRank" 
                          type="number" 
                          min="1"
                          placeholder="e.g., 5"
                          value={contextData.yourRank || ""}
                          onChange={(e) => setContextData({...contextData, yourRank: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="totalStudents">Total Students</Label>
                        <Input 
                          id="totalStudents" 
                          type="number" 
                          min="1"
                          placeholder="e.g., 30"
                          value={contextData.totalStudents || ""}
                          onChange={(e) => setContextData({...contextData, totalStudents: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="percentile">Percentile</Label>
                        <Input 
                          id="percentile" 
                          type="number" 
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="e.g., 85"
                          value={contextData.percentile || ""}
                          onChange={(e) => setContextData({...contextData, percentile: parseFloat(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {contextData.yourRank > 0 && contextData.totalStudents > 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          You ranked <strong>#{contextData.yourRank}</strong> out of <strong>{contextData.totalStudents}</strong> students
                          {contextData.yourRank <= Math.ceil(contextData.totalStudents * 0.1) && " (Top 10%! 🎉)"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep("scores")}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setCurrentStep("content")}>
                      Next: Content & Prep <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* STEP 4: Content & Preparation */}
              <TabsContent value="content" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Step 4: Content & Preparation
                  </h3>
                  <p className="text-sm text-muted-foreground">What topics were covered and how did you prepare?</p>
                  
                  {/* Chapters Covered */}
                  <div className="space-y-2">
                    <Label>Chapters Covered</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="text" 
                        placeholder="Add chapter (e.g., Chapter 5)"
                        value={contentData.currentChapter}
                        onChange={(e) => setContentData({...contentData, currentChapter: e.target.value})}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addItem(contentData.chaptersCovered, contentData.currentChapter, setContentData, 'chaptersCovered')
                          }
                        }}
                        disabled={isLoading}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => addItem(contentData.chaptersCovered, contentData.currentChapter, setContentData, 'chaptersCovered')}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {contentData.chaptersCovered.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {contentData.chaptersCovered.map((chapter, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {chapter}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeItem(contentData.chaptersCovered, index, setContentData, 'chaptersCovered')}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Topics Tested */}
                  <div className="space-y-2">
                    <Label>Topics Tested</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="text" 
                        placeholder="Add topic (e.g., Derivatives)"
                        value={contentData.currentTopic}
                        onChange={(e) => setContentData({...contentData, currentTopic: e.target.value})}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addItem(contentData.topicsTested, contentData.currentTopic, setContentData, 'topicsTested')
                          }
                        }}
                        disabled={isLoading}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => addItem(contentData.topicsTested, contentData.currentTopic, setContentData, 'topicsTested')}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {contentData.topicsTested.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {contentData.topicsTested.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {topic}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeItem(contentData.topicsTested, index, setContentData, 'topicsTested')}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Questions */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Question Breakdown</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="totalQuestions">Total Questions</Label>
                        <Input 
                          id="totalQuestions" 
                          type="number" 
                          min="0"
                          placeholder="e.g., 50"
                          value={contentData.totalQuestions || ""}
                          onChange={(e) => setContentData({...contentData, totalQuestions: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="questionsCorrect">Questions Correct</Label>
                        <Input 
                          id="questionsCorrect" 
                          type="number" 
                          min="0"
                          placeholder="e.g., 42"
                          value={contentData.questionsCorrect || ""}
                          onChange={(e) => setContentData({...contentData, questionsCorrect: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {contentData.totalQuestions > 0 && contentData.questionsCorrect > 0 && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                        <p className="text-2xl font-bold">
                          {((contentData.questionsCorrect / contentData.totalQuestions) * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Time Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Time Management</h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="timeAllocated">Time Allocated (min)</Label>
                        <Input 
                          id="timeAllocated" 
                          type="number" 
                          min="0"
                          placeholder="e.g., 90"
                          value={contentData.timeAllocatedMinutes || ""}
                          onChange={(e) => setContentData({...contentData, timeAllocatedMinutes: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeTaken">Time Taken (min)</Label>
                        <Input 
                          id="timeTaken" 
                          type="number" 
                          min="0"
                          placeholder="e.g., 85"
                          value={contentData.timeTakenMinutes || ""}
                          onChange={(e) => setContentData({...contentData, timeTakenMinutes: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timePressure">Time Pressure Level</Label>
                        <Select
                          value={contentData.timePressureLevel}
                          onValueChange={(v) => setContentData({...contentData, timePressureLevel: v})}
                          disabled={isLoading}
                        >
                          <SelectTrigger id="timePressure">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="too_rushed">Too Rushed</SelectItem>
                            <SelectItem value="bit_rushed">Bit Rushed</SelectItem>
                            <SelectItem value="just_right">Just Right</SelectItem>
                            <SelectItem value="too_much_time">Too Much Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Preparation Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Preparation Details</h4>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="hoursStudied">Total Hours Studied</Label>
                        <Input 
                          id="hoursStudied" 
                          type="number" 
                          step="0.5"
                          min="0"
                          placeholder="e.g., 15.5"
                          value={contentData.totalHoursStudied || ""}
                          onChange={(e) => setContentData({...contentData, totalHoursStudied: parseFloat(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daysOfPrep">Days of Preparation</Label>
                        <Input 
                          id="daysOfPrep" 
                          type="number" 
                          min="0"
                          placeholder="e.g., 7"
                          value={contentData.daysOfPreparation || ""}
                          onChange={(e) => setContentData({...contentData, daysOfPreparation: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prepStartDate">Prep Start Date</Label>
                        <Input 
                          id="prepStartDate" 
                          type="date"
                          value={contentData.preparationStartDate}
                          onChange={(e) => setContentData({...contentData, preparationStartDate: e.target.value})}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prepQuality">Preparation Quality: {contentData.preparationQuality}/10</Label>
                      <Slider
                        id="prepQuality"
                        min={1}
                        max={10}
                        step={1}
                        value={[contentData.preparationQuality]}
                        onValueChange={(value) => setContentData({...contentData, preparationQuality: value[0]})}
                        disabled={isLoading}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Poor</span>
                        <span>Excellent</span>
                      </div>
                    </div>

                    {/* Study Methods Used */}
                    <div className="space-y-2">
                      <Label>Study Methods Used</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="text" 
                          placeholder="Add method (e.g., Practice problems)"
                          value={contentData.currentMethod}
                          onChange={(e) => setContentData({...contentData, currentMethod: e.target.value})}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addItem(contentData.studyMethodsUsed, contentData.currentMethod, setContentData, 'studyMethodsUsed')
                            }
                          }}
                          disabled={isLoading}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => addItem(contentData.studyMethodsUsed, contentData.currentMethod, setContentData, 'studyMethodsUsed')}
                          disabled={isLoading}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {contentData.studyMethodsUsed.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {contentData.studyMethodsUsed.map((method, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              {method}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeItem(contentData.studyMethodsUsed, index, setContentData, 'studyMethodsUsed')}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep("context")}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setCurrentStep("analysis")}>
                      Next: Analysis <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* STEP 5: Performance Analysis */}
              <TabsContent value="analysis" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Step 5: Performance Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground">Analyze your strengths, weaknesses, and insights</p>
                  
                  {/* Pre-Assessment State */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Pre-Assessment State</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confidenceBefore">Confidence Before: {analysisData.confidenceBefore}/10</Label>
                      <Slider
                        id="confidenceBefore"
                        min={1}
                        max={10}
                        step={1}
                        value={[analysisData.confidenceBefore]}
                        onValueChange={(value) => setAnalysisData({...analysisData, confidenceBefore: value[0]})}
                        disabled={isLoading}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Not Confident</span>
                        <span>Very Confident</span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="feltPrepared">Felt Prepared?</Label>
                        <Select
                          value={analysisData.feltPrepared}
                          onValueChange={(v) => setAnalysisData({...analysisData, feltPrepared: v})}
                          disabled={isLoading}
                        >
                          <SelectTrigger id="feltPrepared">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="partially">Partially</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expectedScoreMin">Expected Score (Min)</Label>
                        <Input 
                          id="expectedScoreMin" 
                          type="number" 
                          step="0.01"
                          placeholder="e.g., 80"
                          value={analysisData.expectedScoreMin || ""}
                          onChange={(e) => setAnalysisData({...analysisData, expectedScoreMin: parseFloat(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expectedScoreMax">Expected Score (Max)</Label>
                        <Input 
                          id="expectedScoreMax" 
                          type="number" 
                          step="0.01"
                          placeholder="e.g., 95"
                          value={analysisData.expectedScoreMax || ""}
                          onChange={(e) => setAnalysisData({...analysisData, expectedScoreMax: parseFloat(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="sleepNightBefore">Sleep Night Before (hrs)</Label>
                        <Input 
                          id="sleepNightBefore" 
                          type="number" 
                          step="0.5"
                          min="0"
                          max="24"
                          placeholder="e.g., 7"
                          value={analysisData.sleepNightBefore || ""}
                          onChange={(e) => setAnalysisData({...analysisData, sleepNightBefore: parseFloat(e.target.value) || 7})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stressLevelBefore">Stress Level Before: {analysisData.stressLevelBefore}/10</Label>
                        <Slider
                          id="stressLevelBefore"
                          min={1}
                          max={10}
                          step={1}
                          value={[analysisData.stressLevelBefore]}
                          onValueChange={(value) => setAnalysisData({...analysisData, stressLevelBefore: value[0]})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="healthStatus">Health Status</Label>
                        <Select
                          value={analysisData.healthStatus}
                          onValueChange={(v) => setAnalysisData({...analysisData, healthStatus: v})}
                          disabled={isLoading}
                        >
                          <SelectTrigger id="healthStatus">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="healthy">Healthy</SelectItem>
                            <SelectItem value="minor_illness">Minor Illness</SelectItem>
                            <SelectItem value="unwell">Unwell</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otherFactors">Other External Factors</Label>
                      <Textarea 
                        id="otherFactors" 
                        placeholder="Any other factors that affected your performance..."
                        value={analysisData.otherFactors}
                        onChange={(e) => setAnalysisData({...analysisData, otherFactors: e.target.value})}
                        disabled={isLoading}
                        rows={2}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Post-Assessment Reflection */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Post-Assessment Reflection</h4>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="scoreVsExpectation">Score vs Expectation</Label>
                        <Select
                          value={analysisData.scoreVsExpectation}
                          onValueChange={(v) => setAnalysisData({...analysisData, scoreVsExpectation: v})}
                          disabled={isLoading}
                        >
                          <SelectTrigger id="scoreVsExpectation">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="better">Better than Expected</SelectItem>
                            <SelectItem value="as_expected">As Expected</SelectItem>
                            <SelectItem value="worse">Worse than Expected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="scoreSurprise">Surprise Level: {analysisData.scoreSurpriseLevel}/10</Label>
                        <Slider
                          id="scoreSurprise"
                          min={1}
                          max={10}
                          step={1}
                          value={[analysisData.scoreSurpriseLevel]}
                          onValueChange={(value) => setAnalysisData({...analysisData, scoreSurpriseLevel: value[0]})}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="confidenceAfterTaking">Confidence After Taking: {analysisData.confidenceAfterTaking}/10</Label>
                        <Slider
                          id="confidenceAfterTaking"
                          min={1}
                          max={10}
                          step={1}
                          value={[analysisData.confidenceAfterTaking]}
                          onValueChange={(value) => setAnalysisData({...analysisData, confidenceAfterTaking: value[0]})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confidenceAfterResults">Confidence After Results: {analysisData.confidenceAfterResults}/10</Label>
                        <Slider
                          id="confidenceAfterResults"
                          min={1}
                          max={10}
                          step={1}
                          value={[analysisData.confidenceAfterResults]}
                          onValueChange={(value) => setAnalysisData({...analysisData, confidenceAfterResults: value[0]})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="scoreReflectsKnowledge">Score Reflects Knowledge?</Label>
                        <Select
                          value={analysisData.scoreReflectsKnowledge}
                          onValueChange={(v) => setAnalysisData({...analysisData, scoreReflectsKnowledge: v})}
                          disabled={isLoading}
                        >
                          <SelectTrigger id="scoreReflectsKnowledge">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="partially">Partially</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Strengths */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Strengths</h4>
                    
                    <div className="space-y-2">
                      <Label>Topics You Excelled At</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="text" 
                          placeholder="Add topic (e.g., Calculus)"
                          value={analysisData.currentStrengthTopic}
                          onChange={(e) => setAnalysisData({...analysisData, currentStrengthTopic: e.target.value})}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addItem(analysisData.strengthsTopics, analysisData.currentStrengthTopic, setAnalysisData, 'strengthsTopics')
                            }
                          }}
                          disabled={isLoading}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => addItem(analysisData.strengthsTopics, analysisData.currentStrengthTopic, setAnalysisData, 'strengthsTopics')}
                          disabled={isLoading}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {analysisData.strengthsTopics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {analysisData.strengthsTopics.map((topic, index) => (
                            <Badge key={index} variant="default" className="gap-1 bg-green-600">
                              {topic}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeItem(analysisData.strengthsTopics, index, setAnalysisData, 'strengthsTopics')}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatHelped">What Helped You Succeed?</Label>
                      <Textarea 
                        id="whatHelped" 
                        placeholder="Describe what study methods or strategies helped you excel..."
                        value={analysisData.whatHelpedSucceed}
                        onChange={(e) => setAnalysisData({...analysisData, whatHelpedSucceed: e.target.value})}
                        disabled={isLoading}
                        rows={3}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Weaknesses */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Weaknesses & Areas to Improve</h4>
                    
                    <div className="space-y-2">
                      <Label>Topics You Struggled With</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="text" 
                          placeholder="Add topic (e.g., Integration)"
                          value={analysisData.currentWeaknessTopic}
                          onChange={(e) => setAnalysisData({...analysisData, currentWeaknessTopic: e.target.value})}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addItem(analysisData.weaknessesTopics, analysisData.currentWeaknessTopic, setAnalysisData, 'weaknessesTopics')
                            }
                          }}
                          disabled={isLoading}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => addItem(analysisData.weaknessesTopics, analysisData.currentWeaknessTopic, setAnalysisData, 'weaknessesTopics')}
                          disabled={isLoading}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {analysisData.weaknessesTopics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {analysisData.weaknessesTopics.map((topic, index) => (
                            <Badge key={index} variant="destructive" className="gap-1">
                              {topic}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeItem(analysisData.weaknessesTopics, index, setAnalysisData, 'weaknessesTopics')}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commonMistakes">Common Mistakes Made</Label>
                      <Textarea 
                        id="commonMistakes" 
                        placeholder="Describe the types of mistakes you made..."
                        value={analysisData.commonMistakes}
                        onChange={(e) => setAnalysisData({...analysisData, commonMistakes: e.target.value})}
                        disabled={isLoading}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="conceptsUnclear">Concepts Still Unclear</Label>
                      <Textarea 
                        id="conceptsUnclear" 
                        placeholder="What concepts do you still not fully understand?"
                        value={analysisData.conceptsStillUnclear}
                        onChange={(e) => setAnalysisData({...analysisData, conceptsStillUnclear: e.target.value})}
                        disabled={isLoading}
                        rows={2}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Questions Missed Breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Why Did You Miss Questions?</h4>
                    <p className="text-sm text-muted-foreground">Categorize your errors (total should equal questions missed)</p>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="lackKnowledge">Lack of Knowledge</Label>
                        <Input 
                          id="lackKnowledge" 
                          type="number" 
                          min="0"
                          placeholder="0"
                          value={analysisData.questionsMissedLackKnowledge || ""}
                          onChange={(e) => setAnalysisData({...analysisData, questionsMissedLackKnowledge: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="careless">Careless Errors</Label>
                        <Input 
                          id="careless" 
                          type="number" 
                          min="0"
                          placeholder="0"
                          value={analysisData.questionsMissedCareless || ""}
                          onChange={(e) => setAnalysisData({...analysisData, questionsMissedCareless: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timePressure">Time Pressure</Label>
                        <Input 
                          id="timePressure" 
                          type="number" 
                          min="0"
                          placeholder="0"
                          value={analysisData.questionsMissedTimePressure || ""}
                          onChange={(e) => setAnalysisData({...analysisData, questionsMissedTimePressure: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="misread">Misread Question</Label>
                        <Input 
                          id="misread" 
                          type="number" 
                          min="0"
                          placeholder="0"
                          value={analysisData.questionsMissedMisread || ""}
                          onChange={(e) => setAnalysisData({...analysisData, questionsMissedMisread: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="anxiety">Test Anxiety</Label>
                        <Input 
                          id="anxiety" 
                          type="number" 
                          min="0"
                          placeholder="0"
                          value={analysisData.questionsMissedAnxiety || ""}
                          onChange={(e) => setAnalysisData({...analysisData, questionsMissedAnxiety: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="other">Other Reasons</Label>
                        <Input 
                          id="other" 
                          type="number" 
                          min="0"
                          placeholder="0"
                          value={analysisData.questionsMissedOther || ""}
                          onChange={(e) => setAnalysisData({...analysisData, questionsMissedOther: parseInt(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Learning Insights */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Learning Insights</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lessonsLearned">Lessons Learned</Label>
                      <Textarea 
                        id="lessonsLearned" 
                        placeholder="What did you learn from this assessment?"
                        value={analysisData.lessonsLearned}
                        onChange={(e) => setAnalysisData({...analysisData, lessonsLearned: e.target.value})}
                        disabled={isLoading}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatToDoDifferently">What Would You Do Differently?</Label>
                      <Textarea 
                        id="whatToDoDifferently" 
                        placeholder="If you could prepare again, what would you change?"
                        value={analysisData.whatToDoDifferently}
                        onChange={(e) => setAnalysisData({...analysisData, whatToDoDifferently: e.target.value})}
                        disabled={isLoading}
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="mostEffective">Most Effective Study Approach</Label>
                        <Textarea 
                          id="mostEffective" 
                          placeholder="What study method worked best?"
                          value={analysisData.mostEffectiveStudyApproach}
                          onChange={(e) => setAnalysisData({...analysisData, mostEffectiveStudyApproach: e.target.value})}
                          disabled={isLoading}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="leastEffective">Least Effective Study Approach</Label>
                        <Textarea 
                          id="leastEffective" 
                          placeholder="What didn't work well?"
                          value={analysisData.leastEffectiveStudyApproach}
                          onChange={(e) => setAnalysisData({...analysisData, leastEffectiveStudyApproach: e.target.value})}
                          disabled={isLoading}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep("content")}>
                      Back
                    </Button>
                    <Button type="button" onClick={() => setCurrentStep("nextsteps")}>
                      Next: Next Steps <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* STEP 6: Next Steps & Reflection */}
              <TabsContent value="nextsteps" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Step 6: Next Steps & Reflection
                  </h3>
                  <p className="text-sm text-muted-foreground">Plan your improvements and reflect on the experience</p>
                  
                  {/* Topics to Review */}
                  <div className="space-y-2">
                    <Label>Topics to Review</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="text" 
                        placeholder="Add topic that needs review (e.g., Chain Rule)"
                        value={nextStepsData.currentReviewTopic}
                        onChange={(e) => setNextStepsData({...nextStepsData, currentReviewTopic: e.target.value})}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addItem(nextStepsData.topicsToReview, nextStepsData.currentReviewTopic, setNextStepsData, 'topicsToReview')
                          }
                        }}
                        disabled={isLoading}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => addItem(nextStepsData.topicsToReview, nextStepsData.currentReviewTopic, setNextStepsData, 'topicsToReview')}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {nextStepsData.topicsToReview.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {nextStepsData.topicsToReview.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {topic}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeItem(nextStepsData.topicsToReview, index, setNextStepsData, 'topicsToReview')}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conceptsNeedingRelearning">Concepts Needing Complete Relearning</Label>
                    <Textarea 
                      id="conceptsNeedingRelearning" 
                      placeholder="List concepts you need to learn from scratch again..."
                      value={nextStepsData.conceptsNeedingRelearning}
                      onChange={(e) => setNextStepsData({...nextStepsData, conceptsNeedingRelearning: e.target.value})}
                      disabled={isLoading}
                      rows={2}
                    />
                  </div>

                  <Separator />

                  {/* Action Plan */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Action Plan</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="actionPlan">Detailed Action Plan</Label>
                      <Textarea 
                        id="actionPlan" 
                        placeholder="What specific actions will you take to improve? Be as detailed as possible..."
                        value={nextStepsData.actionPlan}
                        onChange={(e) => setNextStepsData({...nextStepsData, actionPlan: e.target.value})}
                        disabled={isLoading}
                        rows={4}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="targetScoreNext">Target Score Next Time</Label>
                        <Input 
                          id="targetScoreNext" 
                          type="number" 
                          step="0.01"
                          placeholder="e.g., 95"
                          value={nextStepsData.targetScoreNext || ""}
                          onChange={(e) => setNextStepsData({...nextStepsData, targetScoreNext: parseFloat(e.target.value) || 0})}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skillsToWorkOn">Specific Skills to Work On</Label>
                        <Input 
                          id="skillsToWorkOn" 
                          type="text" 
                          placeholder="e.g., Time management, problem-solving"
                          value={nextStepsData.specificSkillsToWorkOn}
                          onChange={(e) => setNextStepsData({...nextStepsData, specificSkillsToWorkOn: e.target.value})}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studyApproachChanges">Study Approach Changes</Label>
                      <Textarea 
                        id="studyApproachChanges" 
                        placeholder="How will you change your study approach for next time?"
                        value={nextStepsData.studyApproachChanges}
                        onChange={(e) => setNextStepsData({...nextStepsData, studyApproachChanges: e.target.value})}
                        disabled={isLoading}
                        rows={3}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Assessment Tags</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="text" 
                        placeholder="Add tag (e.g., important, difficult)"
                        value={nextStepsData.currentTag}
                        onChange={(e) => setNextStepsData({...nextStepsData, currentTag: e.target.value})}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addItem(nextStepsData.assessmentTags, nextStepsData.currentTag, setNextStepsData, 'assessmentTags')
                          }
                        }}
                        disabled={isLoading}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={() => addItem(nextStepsData.assessmentTags, nextStepsData.currentTag, setNextStepsData, 'assessmentTags')}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {nextStepsData.assessmentTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {nextStepsData.assessmentTags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="gap-1">
                            {tag}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => removeItem(nextStepsData.assessmentTags, index, setNextStepsData, 'assessmentTags')}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Notes & Reflection */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Final Notes & Reflection</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="overallNotes">Overall Notes</Label>
                      <Textarea 
                        id="overallNotes" 
                        placeholder="Any additional notes about this assessment..."
                        value={nextStepsData.overallNotes}
                        onChange={(e) => setNextStepsData({...nextStepsData, overallNotes: e.target.value})}
                        disabled={isLoading}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instructorFeedback">Instructor Feedback</Label>
                      <Textarea 
                        id="instructorFeedback" 
                        placeholder="What feedback did your instructor provide?"
                        value={nextStepsData.instructorFeedback}
                        onChange={(e) => setNextStepsData({...nextStepsData, instructorFeedback: e.target.value})}
                        disabled={isLoading}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="peerComparison">Peer Comparison Notes</Label>
                      <Textarea 
                        id="peerComparison" 
                        placeholder="How did your peers approach this? What can you learn from them?"
                        value={nextStepsData.peerComparisonNotes}
                        onChange={(e) => setNextStepsData({...nextStepsData, peerComparisonNotes: e.target.value})}
                        disabled={isLoading}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="personalReflection">Personal Reflection</Label>
                      <Textarea 
                        id="personalReflection" 
                        placeholder="How do you feel about this assessment overall? What does it mean for your learning journey?"
                        value={nextStepsData.personalReflection}
                        onChange={(e) => setNextStepsData({...nextStepsData, personalReflection: e.target.value})}
                        disabled={isLoading}
                        rows={3}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Assessment Summary
                    </p>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assessment:</span>
                        <span className="font-medium">{identificationData.assessmentTitle || "Not set"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium capitalize">{identificationData.assessmentType.replace("_", " ")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-bold text-lg">{scoreData.score}/{scoreData.totalPossible} ({scoreData.percentage.toFixed(1)}%)</span>
                      </div>
                      {scoreData.grade && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Grade:</span>
                          <span className="font-medium">{scoreData.grade}</span>
                        </div>
                      )}
                      {contextData.classAverage > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">vs Class Average:</span>
                          <span className={scoreData.score > contextData.classAverage ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                            {scoreData.score > contextData.classAverage ? "+" : ""}{(scoreData.score - contextData.classAverage).toFixed(1)} points
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Topics Tested:</span>
                        <span className="font-medium">{contentData.topicsTested.length} topics</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours Studied:</span>
                        <span className="font-medium">{contentData.totalHoursStudied}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prep Quality:</span>
                        <span className="font-medium">{contentData.preparationQuality}/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setCurrentStep("analysis")}>
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !identificationData.subjectId || subjects.length === 0}
                      className="bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {isLoading ? "Saving..." : "Complete & Save Performance"}
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
