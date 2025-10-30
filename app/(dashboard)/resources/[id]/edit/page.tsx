"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditResourcePage() {
  const router = useRouter()
  const params = useParams()
  const resourceId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [subjects, setSubjects] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    resourceName: "",
    resourceType: "textbook",
    primarySubjectId: "",
    authorCreator: "",
    publisher: "",
    editionVersion: "",
    publicationDate: "",
    isbnId: "",
    language: "English",
    difficultyLevel: "intermediate",
    accessType: "owned",
    locationLink: "",
    url: "",
    physicalLocation: "",
    totalPages: 0,
    totalDurationMinutes: 0,
    totalChapters: 0,
    currentProgressPages: 0,
    currentProgressPercentage: 0,
    completionStatus: "not_started",
    personalRating: 0,
    usefulnessRating: "useful",
    qualityRating: "good",
    recommendToOthers: "yes",
    personalNotes: "",
    keyInsights: "",
    summary: "",
    importantSections: "",
    bestUsedFor: "",
    requiredByCourse: false,
    recommendedByInstructor: false,
    instructorName: "",
    courseNameCode: ""
  })

  useEffect(() => {
    loadData()
  }, [resourceId])

  const loadData = async () => {
    try {
      const userId = localStorage.getItem("userId") || "guest-user"
      
      const [resourceRes, subjectsRes] = await Promise.all([
        fetch(`/api/v1/resources/${resourceId}?userId=${userId}`),
        fetch(`/api/v1/subjects?userId=${userId}`)
      ])

      if (!resourceRes.ok) {
        throw new Error("Failed to fetch resource")
      }

      const resourceData = await resourceRes.json()
      const subjectsData = await subjectsRes.json()

      if (subjectsData.success) {
        setSubjects(subjectsData.data || [])
      }

      // Handle both {success: true, data: resource} and direct resource object responses
      const r = resourceData.success ? resourceData.data : resourceData
      
      if (!r || !r.id) {
        toast.error("Resource not found")
        setTimeout(() => router.push("/resources"), 2000)
        setIsFetching(false)
        return
      }
      
      setFormData({
        resourceName: r.resourceName || r.resource_name || "",
        resourceType: r.resourceType || r.resource_type || "textbook",
        primarySubjectId: r.primarySubjectId || r.primary_subject_id || "",
        authorCreator: r.authorCreator || r.author_creator || "",
        publisher: r.publisher || "",
        editionVersion: r.editionVersion || r.edition_version || "",
        publicationDate: r.publicationDate || r.publication_date ? new Date(r.publicationDate || r.publication_date).toISOString().split('T')[0] : "",
        isbnId: r.isbnId || r.isbn_id || "",
        language: r.language || "English",
        difficultyLevel: r.difficultyLevel || r.difficulty_level || "intermediate",
        accessType: r.accessType || r.access_type || "owned",
        locationLink: r.locationLink || r.location_link || "",
        url: r.url || "",
        physicalLocation: r.physicalLocation || r.physical_location || "",
        totalPages: r.totalPages || r.total_pages || 0,
        totalDurationMinutes: r.totalDurationMinutes || r.total_duration_minutes || 0,
        totalChapters: r.totalChapters || r.total_chapters || 0,
        currentProgressPages: r.currentProgressPages || r.current_progress_pages || 0,
        currentProgressPercentage: r.currentProgressPercentage || r.current_progress_percentage || 0,
        completionStatus: r.completionStatus || r.completion_status || "not_started",
        personalRating: r.personalRating || r.personal_rating || 0,
        usefulnessRating: r.usefulnessRating || r.usefulness_rating || "useful",
        qualityRating: r.qualityRating || r.quality_rating || "good",
        recommendToOthers: r.recommendToOthers || r.recommend_to_others || "yes",
        personalNotes: r.personalNotes || r.personal_notes || "",
        keyInsights: r.keyInsights || r.key_insights || "",
        summary: r.summary || "",
        importantSections: r.importantSections || r.important_sections || "",
        bestUsedFor: r.bestUsedFor || r.best_used_for || "",
        requiredByCourse: r.requiredByCourse || r.required_by_course || false,
        recommendedByInstructor: r.recommendedByInstructor || r.recommended_by_instructor || false,
        instructorName: r.instructorName || r.instructor_name || "",
        courseNameCode: r.courseNameCode || r.course_name_code || ""
      })
      
      setIsFetching(false)
    } catch (error) {
      console.error("Error loading resource:", error)
      toast.error("Failed to load resource")
      setTimeout(() => router.push("/resources"), 2000)
      setIsFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const userId = localStorage.getItem("userId") || "guest-user"

    try {
      const response = await fetch("/api/v1/resources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resourceId,
          userId,
          resourceName: formData.resourceName,
          resourceType: formData.resourceType,
          primarySubjectId: formData.primarySubjectId || undefined,
          authorCreator: formData.authorCreator,
          publisher: formData.publisher,
          editionVersion: formData.editionVersion,
          publicationDate: formData.publicationDate,
          isbnId: formData.isbnId,
          language: formData.language,
          difficultyLevel: formData.difficultyLevel,
          accessType: formData.accessType,
          locationLink: formData.locationLink,
          url: formData.url,
          physicalLocation: formData.physicalLocation,
          totalPages: formData.totalPages,
          totalDurationMinutes: formData.totalDurationMinutes,
          totalChapters: formData.totalChapters,
          currentProgressPages: formData.currentProgressPages,
          currentProgressPercentage: formData.currentProgressPercentage,
          completionStatus: formData.completionStatus,
          personalRating: formData.personalRating,
          usefulnessRating: formData.usefulnessRating,
          qualityRating: formData.qualityRating,
          recommendToOthers: formData.recommendToOthers,
          personalNotes: formData.personalNotes,
          keyInsights: formData.keyInsights,
          summary: formData.summary,
          importantSections: formData.importantSections,
          bestUsedFor: formData.bestUsedFor,
          requiredByCourse: formData.requiredByCourse,
          recommendedByInstructor: formData.recommendedByInstructor,
          instructorName: formData.instructorName,
          courseNameCode: formData.courseNameCode
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success("Resource updated successfully!")
        router.push(`/resources/${resourceId}`)
      } else {
        toast.error(data.error || "Failed to update resource")
      }
    } catch (error) {
      console.error("Error updating resource:", error)
      toast.error("Failed to update resource")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/resources/${resourceId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Resource</h1>
          <p className="text-muted-foreground mt-2">Update resource information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="access">Access & Progress</TabsTrigger>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="notes">Notes & Review</TabsTrigger>
          </TabsList>

          {/* BASIC INFO TAB */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Resource Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Advanced Calculus Textbook"
                    value={formData.resourceName}
                    onChange={(e) => setFormData({...formData, resourceName: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Resource Type</Label>
                    <Select 
                      value={formData.resourceType}
                      onValueChange={(v) => setFormData({...formData, resourceType: v})}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="textbook">Textbook</SelectItem>
                        <SelectItem value="video_course">Video Course</SelectItem>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="research_paper">Research Paper</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="practice_problems">Practice Problems</SelectItem>
                        <SelectItem value="notes">Notes</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Primary Subject</Label>
                    <Select 
                      value={formData.primarySubjectId}
                      onValueChange={(v) => setFormData({...formData, primarySubjectId: v})}
                      disabled={isLoading}
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
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author/Creator</Label>
                    <Input 
                      id="author" 
                      placeholder="e.g., James Stewart"
                      value={formData.authorCreator}
                      onChange={(e) => setFormData({...formData, authorCreator: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input 
                      id="publisher" 
                      placeholder="e.g., Pearson"
                      value={formData.publisher}
                      onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="edition">Edition/Version</Label>
                    <Input 
                      id="edition" 
                      placeholder="e.g., 8th Edition"
                      value={formData.editionVersion}
                      onChange={(e) => setFormData({...formData, editionVersion: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pubDate">Publication Date</Label>
                    <Input 
                      id="pubDate" 
                      type="date"
                      value={formData.publicationDate}
                      onChange={(e) => setFormData({...formData, publicationDate: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isbn">ISBN/ID</Label>
                    <Input 
                      id="isbn" 
                      placeholder="ISBN or identifier"
                      value={formData.isbnId}
                      onChange={(e) => setFormData({...formData, isbnId: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input 
                      id="language" 
                      value={formData.language}
                      onChange={(e) => setFormData({...formData, language: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select 
                      value={formData.difficultyLevel}
                      onValueChange={(v) => setFormData({...formData, difficultyLevel: v})}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea 
                    id="summary" 
                    placeholder="Brief description of the resource"
                    value={formData.summary}
                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ACCESS & PROGRESS TAB */}
          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Access & Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="accessType">Access Type</Label>
                  <Select 
                    value={formData.accessType}
                    onValueChange={(v) => setFormData({...formData, accessType: v})}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="accessType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owned">Owned</SelectItem>
                      <SelectItem value="library">Library</SelectItem>
                      <SelectItem value="online_free">Online Free</SelectItem>
                      <SelectItem value="online_paid">Online Paid</SelectItem>
                      <SelectItem value="borrowed">Borrowed</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL/Link</Label>
                  <Input 
                    id="url" 
                    type="url"
                    placeholder="https://..."
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Physical Location</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g., Shelf 3B, Library 2nd Floor"
                    value={formData.physicalLocation}
                    onChange={(e) => setFormData({...formData, physicalLocation: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="totalPages">Total Pages</Label>
                    <Input 
                      id="totalPages" 
                      type="number"
                      min="0"
                      value={formData.totalPages}
                      onChange={(e) => setFormData({...formData, totalPages: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input 
                      id="duration" 
                      type="number"
                      min="0"
                      value={formData.totalDurationMinutes}
                      onChange={(e) => setFormData({...formData, totalDurationMinutes: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chapters">Total Chapters</Label>
                    <Input 
                      id="chapters" 
                      type="number"
                      min="0"
                      value={formData.totalChapters}
                      onChange={(e) => setFormData({...formData, totalChapters: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="progressPages">Current Progress (pages)</Label>
                    <Input 
                      id="progressPages" 
                      type="number"
                      min="0"
                      value={formData.currentProgressPages}
                      onChange={(e) => setFormData({...formData, currentProgressPages: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="progressPercent">Progress (%)</Label>
                    <Input 
                      id="progressPercent" 
                      type="number"
                      min="0"
                      max="100"
                      value={formData.currentProgressPercentage}
                      onChange={(e) => setFormData({...formData, currentProgressPercentage: parseInt(e.target.value) || 0})}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completionStatus">Completion Status</Label>
                  <Select 
                    value={formData.completionStatus}
                    onValueChange={(v) => setFormData({...formData, completionStatus: v})}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="completionStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                      <SelectItem value="abandoned">Abandoned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ASSESSMENT TAB */}
          <TabsContent value="assessment">
            <Card>
              <CardHeader>
                <CardTitle>Your Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="rating">Personal Rating (0-5)</Label>
                  <Input 
                    id="rating" 
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.personalRating}
                    onChange={(e) => setFormData({...formData, personalRating: parseFloat(e.target.value) || 0})}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="usefulness">Usefulness</Label>
                    <Select 
                      value={formData.usefulnessRating}
                      onValueChange={(v) => setFormData({...formData, usefulnessRating: v})}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="usefulness">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="extremely_useful">Extremely Useful</SelectItem>
                        <SelectItem value="useful">Useful</SelectItem>
                        <SelectItem value="somewhat_useful">Somewhat Useful</SelectItem>
                        <SelectItem value="not_useful">Not Useful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quality">Quality</Label>
                    <Select 
                      value={formData.qualityRating}
                      onValueChange={(v) => setFormData({...formData, qualityRating: v})}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="quality">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommend">Recommend to Others?</Label>
                  <Select 
                    value={formData.recommendToOthers}
                    onValueChange={(v) => setFormData({...formData, recommendToOthers: v})}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="recommend">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, definitely</SelectItem>
                      <SelectItem value="maybe">Maybe</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bestFor">Best Used For</Label>
                  <Textarea 
                    id="bestFor" 
                    placeholder="When is this resource most helpful?"
                    value={formData.bestUsedFor}
                    onChange={(e) => setFormData({...formData, bestUsedFor: e.target.value})}
                    disabled={isLoading}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Course Information</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        id="required"
                        checked={formData.requiredByCourse}
                        onChange={(e) => setFormData({...formData, requiredByCourse: e.target.checked})}
                        disabled={isLoading}
                        className="rounded"
                      />
                      <Label htmlFor="required" className="font-normal cursor-pointer">Required by course</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        id="recommended"
                        checked={formData.recommendedByInstructor}
                        onChange={(e) => setFormData({...formData, recommendedByInstructor: e.target.checked})}
                        disabled={isLoading}
                        className="rounded"
                      />
                      <Label htmlFor="recommended" className="font-normal cursor-pointer">Recommended by instructor</Label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor Name</Label>
                    <Input 
                      id="instructor" 
                      placeholder="Professor name"
                      value={formData.instructorName}
                      onChange={(e) => setFormData({...formData, instructorName: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">Course Name/Code</Label>
                    <Input 
                      id="course" 
                      placeholder="e.g., CS101"
                      value={formData.courseNameCode}
                      onChange={(e) => setFormData({...formData, courseNameCode: e.target.value})}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTES & REVIEW TAB */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes & Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="personalNotes">Personal Notes</Label>
                  <Textarea 
                    id="personalNotes" 
                    placeholder="Your thoughts and observations"
                    value={formData.personalNotes}
                    onChange={(e) => setFormData({...formData, personalNotes: e.target.value})}
                    disabled={isLoading}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyInsights">Key Insights</Label>
                  <Textarea 
                    id="keyInsights" 
                    placeholder="Main takeaways and important points"
                    value={formData.keyInsights}
                    onChange={(e) => setFormData({...formData, keyInsights: e.target.value})}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="importantSections">Important Sections</Label>
                  <Textarea 
                    id="importantSections" 
                    placeholder="Chapters or sections to focus on"
                    value={formData.importantSections}
                    onChange={(e) => setFormData({...formData, importantSections: e.target.value})}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 justify-end mt-6">
          <Link href={`/resources/${resourceId}`}>
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
