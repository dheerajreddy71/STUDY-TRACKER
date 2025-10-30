"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function EditPerformancePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])
  const [formData, setFormData] = useState({
    subjectId: "",
    entryType: "quiz",
    assessmentName: "",
    score: 0,
    totalPossible: 100,
    assessmentDate: "",
    difficultyRating: "",
    topicsCovered: "",
    timeSpentMinutes: 0,
    linkedSessionId: "",
    notes: ""
  })

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "guest-user"
    
    // Load subjects and performance entry in parallel
    Promise.all([
      fetch(`/api/v1/subjects?userId=${userId}`).then(r => r.json()),
      fetch(`/api/v1/performance/${id}`, {
        headers: { "x-user-id": userId }
      }).then(r => r.json())
    ])
      .then(([subjectsData, perfData]) => {
        if (subjectsData.success) {
          setSubjects(subjectsData.data || [])
        }
        
        if (perfData) {
          const entry = perfData
          setFormData({
            subjectId: entry.subject_id || "",
            entryType: entry.entry_type || "quiz",
            assessmentName: entry.assessment_name || "",
            score: entry.score || 0,
            totalPossible: entry.total_possible || 100,
            assessmentDate: entry.assessment_date ? entry.assessment_date.split('T')[0] : "",
            difficultyRating: entry.difficulty_rating || "",
            topicsCovered: entry.topics_covered ? JSON.parse(entry.topics_covered).join(", ") : "",
            timeSpentMinutes: entry.time_spent_minutes || 0,
            linkedSessionId: entry.linked_session_id || "",
            notes: entry.notes || ""
          })
        }
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Error loading data:", err)
        toast.error("Failed to load performance entry")
        setIsLoading(false)
      })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const userId = localStorage.getItem("userId") || "guest-user"

    try {
      const response = await fetch(`/api/v1/performance/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": userId
        },
        body: JSON.stringify({
          subjectId: formData.subjectId,
          entryType: formData.entryType,
          assessmentName: formData.assessmentName || undefined,
          score: Number(formData.score),
          totalPossible: Number(formData.totalPossible),
          assessmentDate: new Date(formData.assessmentDate).toISOString(),
          difficultyRating: formData.difficultyRating || undefined,
          topicsCovered: formData.topicsCovered ? formData.topicsCovered.split(",").map(t => t.trim()).filter(Boolean) : undefined,
          timeSpentMinutes: formData.timeSpentMinutes ? Number(formData.timeSpentMinutes) : undefined,
          linkedSessionId: formData.linkedSessionId || undefined,
          notes: formData.notes || undefined
        })
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Performance updated successfully!")
        router.push("/performance")
      } else {
        toast.error(data.error || "Failed to update performance")
      }
    } catch (error) {
      console.error("Error updating performance:", error)
      toast.error("Failed to update performance")
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
        <h1 className="text-3xl font-bold tracking-tight">Edit Performance</h1>
        <p className="text-muted-foreground mt-2">Update your assessment results</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(v) => setFormData({...formData, subjectId: v})}
                  disabled={isSaving}
                  required
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
                <Label htmlFor="type">Assessment Type *</Label>
                <Select
                  value={formData.entryType}
                  onValueChange={(v) => setFormData({...formData, entryType: v})}
                  disabled={isSaving}
                  required
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="self_assessment">Self Assessment</SelectItem>
                    <SelectItem value="mock_test">Mock Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessmentName">Assessment Name</Label>
              <Input 
                id="assessmentName" 
                type="text" 
                placeholder="e.g., Midterm Exam, Chapter 5 Quiz"
                value={formData.assessmentName || ""}
                onChange={(e) => setFormData({...formData, assessmentName: e.target.value})}
                disabled={isSaving}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="score">Score *</Label>
                <Input 
                  id="score" 
                  type="number" 
                  placeholder="85"
                  value={formData.score || ""}
                  onChange={(e) => setFormData({...formData, score: parseFloat(e.target.value) || 0})}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total">Total Possible *</Label>
                <Input 
                  id="total" 
                  type="number" 
                  placeholder="100"
                  value={formData.totalPossible || ""}
                  onChange={(e) => setFormData({...formData, totalPossible: parseFloat(e.target.value) || 100})}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Assessment Date *</Label>
                <Input 
                  id="date" 
                  type="date"
                  value={formData.assessmentDate}
                  onChange={(e) => setFormData({...formData, assessmentDate: e.target.value})}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Rating</Label>
                <Select
                  value={formData.difficultyRating}
                  onValueChange={(v) => setFormData({...formData, difficultyRating: v})}
                  disabled={isSaving}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_set">Not set</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="very_hard">Very Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
                <Input 
                  id="timeSpent" 
                  type="number" 
                  placeholder="60"
                  value={formData.timeSpentMinutes || ""}
                  onChange={(e) => setFormData({...formData, timeSpentMinutes: parseInt(e.target.value) || 0})}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topics">Topics Covered</Label>
              <Input 
                id="topics" 
                type="text" 
                placeholder="e.g., Derivatives, Limits, Integration (comma separated)"
                value={formData.topicsCovered}
                onChange={(e) => setFormData({...formData, topicsCovered: e.target.value})}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">Separate multiple topics with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedSession">Linked Study Session ID (Optional)</Label>
              <Input 
                id="linkedSession" 
                type="text" 
                placeholder="Session ID if this assessment relates to a specific study session"
                value={formData.linkedSessionId}
                onChange={(e) => setFormData({...formData, linkedSessionId: e.target.value})}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">Link this assessment to a study session for better insights</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="How did you feel about this assessment? Any insights?"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                disabled={isSaving}
                rows={4}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Calculated Percentage</p>
              <p className="text-2xl font-bold">
                {formData.totalPossible > 0 
                  ? ((formData.score / formData.totalPossible) * 100).toFixed(1) 
                  : 0}%
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/performance")}
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
