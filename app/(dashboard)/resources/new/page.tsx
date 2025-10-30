"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { BookOpen, Plus, X, Star } from "lucide-react"

export default function NewResourcePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [subjects, setSubjects] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    // Basic Information
    resourceName: "",
    resourceType: "textbook",
    
    // Subject Association
    primarySubjectId: "",
    secondarySubjectIds: [] as string[],
    topicsCovered: [] as string[],
    currentTopic: "",
    chaptersSections: [] as string[],
    currentChapter: "",
    
    // Resource Details
    authorCreator: "",
    publisher: "",
    editionVersion: "",
    publicationDate: "",
    isbnId: "",
    language: "English",
    difficultyLevel: "intermediate",
    recommendedFor: [] as string[],
    currentRecommendation: "",
    
    // Access Information
    accessType: "owned",
    locationLink: "",
    filePath: "",
    url: "",
    physicalLocation: "",
    libraryCallNumber: "",
    accessStatus: "available",
    
    // Content Information
    totalPages: 0,
    totalDurationMinutes: 0,
    totalChapters: 0,
    currentProgressPages: 0,
    currentProgressPercentage: 0,
    completionStatus: "not_started",
    
    // User Assessment
    personalRating: 0,
    usefulnessRating: "useful",
    qualityRating: "good",
    difficultyVsExpected: "as_expected",
    recommendToOthers: "yes",
    
    // Notes & Review
    personalNotes: "",
    keyInsights: "",
    summary: "",
    importantSections: "",
    crossReferences: [] as string[],
    currentReference: "",
    pros: [] as string[],
    currentPro: "",
    cons: [] as string[],
    currentCon: "",
    bestUsedFor: "",
    supplementsWellWith: [] as string[],
    resourceTags: [] as string[],
    currentTag: "",
    
    // Academic Context
    requiredByCourse: false,
    recommendedByInstructor: false,
    officialCourseMaterial: false,
    instructorName: "",
    courseNameCode: "",
    syllabusSection: ""
  })

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      const userId = localStorage.getItem("userId") || "guest-user"
      const response = await fetch(`/api/v1/subjects?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setSubjects(data.data || [])
      }
    } catch (error) {
      console.error("Error loading subjects:", error)
    }
  }

  const addToArray = (field: keyof typeof formData, currentField: keyof typeof formData) => {
    const value = formData[currentField] as string
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()],
        [currentField]: ""
      }))
    }
  }

  const removeFromArray = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Comprehensive Validation
    if (!formData.resourceName.trim()) {
      toast.error("Please enter a resource name")
      return
    }

    if (formData.resourceName.length > 300) {
      toast.error("Resource name must be less than 300 characters")
      return
    }

    if (formData.totalPages < 0) {
      toast.error("Total pages cannot be negative")
      return
    }

    if (formData.currentProgressPages < 0 || formData.currentProgressPages > formData.totalPages) {
      toast.error("Current progress pages must be between 0 and total pages")
      return
    }

    if (formData.currentProgressPercentage < 0 || formData.currentProgressPercentage > 100) {
      toast.error("Progress percentage must be between 0 and 100")
      return
    }

    if (formData.personalRating < 0 || formData.personalRating > 5) {
      toast.error("Personal rating must be between 0 and 5")
      return
    }

    if (formData.url && !formData.url.match(/^https?:\/\/.+/)) {
      toast.error("Please enter a valid URL starting with http:// or https://")
      return
    }

    setIsLoading(true)

    const userId = localStorage.getItem("userId") || "guest-user"

    try {
      const response = await fetch("/api/v1/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          
          // Basic Information
          resourceName: formData.resourceName.trim(),
          resourceType: formData.resourceType,
          
          // Subject Association
          primarySubjectId: formData.primarySubjectId || undefined,
          secondarySubjectIds: formData.secondarySubjectIds.length > 0 ? JSON.stringify(formData.secondarySubjectIds) : undefined,
          topicsCovered: formData.topicsCovered.length > 0 ? JSON.stringify(formData.topicsCovered) : undefined,
          chaptersSections: formData.chaptersSections.length > 0 ? JSON.stringify(formData.chaptersSections) : undefined,
          
          // Resource Details
          authorCreator: formData.authorCreator.trim() || undefined,
          publisher: formData.publisher.trim() || undefined,
          editionVersion: formData.editionVersion.trim() || undefined,
          publicationDate: formData.publicationDate || undefined,
          isbnId: formData.isbnId.trim() || undefined,
          language: formData.language,
          difficultyLevel: formData.difficultyLevel,
          recommendedFor: formData.recommendedFor.length > 0 ? JSON.stringify(formData.recommendedFor) : undefined,
          
          // Access Information
          accessType: formData.accessType,
          locationLink: formData.locationLink.trim() || undefined,
          filePath: formData.filePath.trim() || undefined,
          url: formData.url.trim() || undefined,
          physicalLocation: formData.physicalLocation.trim() || undefined,
          libraryCallNumber: formData.libraryCallNumber.trim() || undefined,
          accessStatus: formData.accessStatus,
          
          // Content Information
          totalPages: formData.totalPages || undefined,
          totalDurationMinutes: formData.totalDurationMinutes || undefined,
          totalChapters: formData.totalChapters || undefined,
          currentProgressPages: formData.currentProgressPages || 0,
          currentProgressPercentage: formData.currentProgressPercentage || 0,
          completionStatus: formData.completionStatus,
          
          // User Assessment
          personalRating: formData.personalRating || undefined,
          usefulnessRating: formData.usefulnessRating,
          qualityRating: formData.qualityRating,
          difficultyVsExpected: formData.difficultyVsExpected,
          recommendToOthers: formData.recommendToOthers,
          
          // Notes & Review
          personalNotes: formData.personalNotes || undefined,
          keyInsights: formData.keyInsights || undefined,
          summary: formData.summary || undefined,
          importantSections: formData.importantSections || undefined,
          crossReferences: formData.crossReferences.length > 0 ? JSON.stringify(formData.crossReferences) : undefined,
          pros: formData.pros.length > 0 ? JSON.stringify(formData.pros) : undefined,
          cons: formData.cons.length > 0 ? JSON.stringify(formData.cons) : undefined,
          bestUsedFor: formData.bestUsedFor || undefined,
          supplementsWellWith: formData.supplementsWellWith.length > 0 ? JSON.stringify(formData.supplementsWellWith) : undefined,
          resourceTags: formData.resourceTags.length > 0 ? JSON.stringify(formData.resourceTags) : undefined,
          
          // Academic Context
          requiredByCourse: formData.requiredByCourse ? 1 : 0,
          recommendedByInstructor: formData.recommendedByInstructor ? 1 : 0,
          officialCourseMaterial: formData.officialCourseMaterial ? 1 : 0,
          instructorName: formData.instructorName || undefined,
          courseNameCode: formData.courseNameCode || undefined,
          syllabusSection: formData.syllabusSection || undefined
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast.success("Resource added successfully!")
        router.push("/resources")
      } else {
        toast.error(data.error || "Failed to add resource")
      }
    } catch (error) {
      console.error("Error creating resource:", error)
      toast.error("Failed to add resource")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Resource</h1>
        <p className="text-muted-foreground mt-2">Add a study resource to your library</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resourceName">Resource Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="resourceName"
                  placeholder="e.g., Introduction to Algorithms"
                  value={formData.resourceName}
                  onChange={(e) => setFormData({...formData, resourceName: e.target.value})}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resourceType">Resource Type <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.resourceType}
                  onValueChange={(v) => setFormData({...formData, resourceType: v})}
                  disabled={isLoading}
                >
                  <SelectTrigger id="resourceType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="textbook">Textbook</SelectItem>
                    <SelectItem value="ebook">E-book</SelectItem>
                    <SelectItem value="video_course">Video Course</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="research_paper">Research Paper</SelectItem>
                    <SelectItem value="lecture_notes">Lecture Notes</SelectItem>
                    <SelectItem value="practice_problems">Practice Problems</SelectItem>
                    <SelectItem value="past_papers">Past Papers</SelectItem>
                    <SelectItem value="study_guide">Study Guide</SelectItem>
                    <SelectItem value="flashcard_deck">Flashcard Deck</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="app">App</SelectItem>
                    <SelectItem value="physical_notes">Physical Notes</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea 
                  id="summary"
                  placeholder="Brief description of what this resource covers..."
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  disabled={isLoading}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Subject Association */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Association</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primarySubject">Primary Subject</Label>
                <Select
                  value={formData.primarySubjectId}
                  onValueChange={(v) => setFormData({...formData, primarySubjectId: v})}
                  disabled={isLoading}
                >
                  <SelectTrigger id="primarySubject">
                    <SelectValue placeholder="Select primary subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific subject</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Topics Covered</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter a topic and press Add"
                    value={formData.currentTopic}
                    onChange={(e) => setFormData({...formData, currentTopic: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('topicsCovered', 'currentTopic'))}
                    disabled={isLoading}
                  />
                  <Button 
                    type="button"
                    onClick={() => addToArray('topicsCovered', 'currentTopic')}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.topicsCovered.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.topicsCovered.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                        <button
                          type="button"
                          onClick={() => removeFromArray('topicsCovered', index)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Chapters/Sections</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter chapter/section"
                    value={formData.currentChapter}
                    onChange={(e) => setFormData({...formData, currentChapter: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('chaptersSections', 'currentChapter'))}
                    disabled={isLoading}
                  />
                  <Button 
                    type="button"
                    onClick={() => addToArray('chaptersSections', 'currentChapter')}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.chaptersSections.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.chaptersSections.map((chapter, index) => (
                      <Badge key={index} variant="secondary">
                        {chapter}
                        <button
                          type="button"
                          onClick={() => removeFromArray('chaptersSections', index)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resource Details */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="author">Author/Creator</Label>
                  <Input 
                    id="author"
                    placeholder="Author name"
                    value={formData.authorCreator}
                    onChange={(e) => setFormData({...formData, authorCreator: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input 
                    id="publisher"
                    placeholder="Publisher name"
                    value={formData.publisher}
                    onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edition">Edition/Version</Label>
                  <Input 
                    id="edition"
                    placeholder="e.g., 3rd Edition"
                    value={formData.editionVersion}
                    onChange={(e) => setFormData({...formData, editionVersion: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pubDate">Publication Date</Label>
                  <Input 
                    id="pubDate"
                    placeholder="e.g., 2024"
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

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input 
                    id="language"
                    placeholder="English"
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
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Information */}
          <Card>
            <CardHeader>
              <CardTitle>Access Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
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
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="library">Library</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="free_online">Free Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessStatus">Access Status</Label>
                  <Select
                    value={formData.accessStatus}
                    onValueChange={(v) => setFormData({...formData, accessStatus: v})}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="accessStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="borrowed">Borrowed</SelectItem>
                      <SelectItem value="need_purchase">Need Purchase</SelectItem>
                      <SelectItem value="subscription_expired">Subscription Expired</SelectItem>
                      <SelectItem value="missing">Missing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="filePath">File Path</Label>
                  <Input 
                    id="filePath"
                    placeholder="Local file path"
                    value={formData.filePath}
                    onChange={(e) => setFormData({...formData, filePath: e.target.value})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="physicalLocation">Physical Location</Label>
                  <Input 
                    id="physicalLocation"
                    placeholder="e.g., Shelf A3"
                    value={formData.physicalLocation}
                    onChange={(e) => setFormData({...formData, physicalLocation: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Information */}
          <Card>
            <CardHeader>
              <CardTitle>Content Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="totalPages">Total Pages</Label>
                  <Input 
                    id="totalPages"
                    type="number"
                    placeholder="0"
                    value={formData.totalPages || ""}
                    onChange={(e) => setFormData({...formData, totalPages: parseInt(e.target.value) || 0})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalDuration">Duration (minutes)</Label>
                  <Input 
                    id="totalDuration"
                    type="number"
                    placeholder="0"
                    value={formData.totalDurationMinutes || ""}
                    onChange={(e) => setFormData({...formData, totalDurationMinutes: parseInt(e.target.value) || 0})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalChapters">Total Chapters</Label>
                  <Input 
                    id="totalChapters"
                    type="number"
                    placeholder="0"
                    value={formData.totalChapters || ""}
                    onChange={(e) => setFormData({...formData, totalChapters: parseInt(e.target.value) || 0})}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPages">Current Progress (pages)</Label>
                  <Input 
                    id="currentPages"
                    type="number"
                    placeholder="0"
                    value={formData.currentProgressPages || ""}
                    onChange={(e) => setFormData({...formData, currentProgressPages: parseInt(e.target.value) || 0})}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentPercentage">Progress %</Label>
                  <Input 
                    id="currentPercentage"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={formData.currentProgressPercentage || ""}
                    onChange={(e) => setFormData({...formData, currentProgressPercentage: parseFloat(e.target.value) || 0})}
                    disabled={isLoading}
                  />
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
                      <SelectItem value="partially_reviewed">Partially Reviewed</SelectItem>
                      <SelectItem value="abandoned">Abandoned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Your Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Personal Rating</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({...formData, personalRating: rating})}
                      disabled={isLoading}
                    >
                      <Star 
                        className={`h-6 w-6 ${formData.personalRating >= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
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
                      <SelectItem value="very_useful">Very Useful</SelectItem>
                      <SelectItem value="useful">Useful</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="not_very_useful">Not Very Useful</SelectItem>
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

                <div className="space-y-2">
                  <Label htmlFor="difficultyVsExpected">Difficulty vs Expected</Label>
                  <Select
                    value={formData.difficultyVsExpected}
                    onValueChange={(v) => setFormData({...formData, difficultyVsExpected: v})}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="difficultyVsExpected">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easier">Easier</SelectItem>
                      <SelectItem value="as_expected">As Expected</SelectItem>
                      <SelectItem value="harder">Harder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommend">Recommend to Others</Label>
                  <Select
                    value={formData.recommendToOthers}
                    onValueChange={(v) => setFormData({...formData, recommendToOthers: v})}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="recommend">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="maybe">Maybe</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Review */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personalNotes">Personal Notes</Label>
                <Textarea 
                  id="personalNotes"
                  placeholder="Your notes about this resource..."
                  value={formData.personalNotes}
                  onChange={(e) => setFormData({...formData, personalNotes: e.target.value})}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyInsights">Key Insights</Label>
                <Textarea 
                  id="keyInsights"
                  placeholder="Important takeaways..."
                  value={formData.keyInsights}
                  onChange={(e) => setFormData({...formData, keyInsights: e.target.value})}
                  disabled={isLoading}
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Pros</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter a pro"
                      value={formData.currentPro}
                      onChange={(e) => setFormData({...formData, currentPro: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('pros', 'currentPro'))}
                      disabled={isLoading}
                    />
                    <Button 
                      type="button"
                      onClick={() => addToArray('pros', 'currentPro')}
                      disabled={isLoading}
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.pros.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.pros.map((pro, index) => (
                        <Badge key={index} variant="default" className="bg-green-600">
                          {pro}
                          <button
                            type="button"
                            onClick={() => removeFromArray('pros', index)}
                            className="ml-2"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Cons</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter a con"
                      value={formData.currentCon}
                      onChange={(e) => setFormData({...formData, currentCon: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('cons', 'currentCon'))}
                      disabled={isLoading}
                    />
                    <Button 
                      type="button"
                      onClick={() => addToArray('cons', 'currentCon')}
                      disabled={isLoading}
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.cons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.cons.map((con, index) => (
                        <Badge key={index} variant="destructive">
                          {con}
                          <button
                            type="button"
                            onClick={() => removeFromArray('cons', index)}
                            className="ml-2"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bestUsedFor">Best Used For</Label>
                <Input 
                  id="bestUsedFor"
                  placeholder="What is this resource best for?"
                  value={formData.bestUsedFor}
                  onChange={(e) => setFormData({...formData, bestUsedFor: e.target.value})}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add tags"
                    value={formData.currentTag}
                    onChange={(e) => setFormData({...formData, currentTag: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('resourceTags', 'currentTag'))}
                    disabled={isLoading}
                  />
                  <Button 
                    type="button"
                    onClick={() => addToArray('resourceTags', 'currentTag')}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.resourceTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.resourceTags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeFromArray('resourceTags', index)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Academic Context */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="required"
                    checked={formData.requiredByCourse}
                    onCheckedChange={(checked) => setFormData({...formData, requiredByCourse: checked as boolean})}
                    disabled={isLoading}
                  />
                  <Label htmlFor="required" className="cursor-pointer">
                    Required by course
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="recommended"
                    checked={formData.recommendedByInstructor}
                    onCheckedChange={(checked) => setFormData({...formData, recommendedByInstructor: checked as boolean})}
                    disabled={isLoading}
                  />
                  <Label htmlFor="recommended" className="cursor-pointer">
                    Recommended by instructor
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="official"
                    checked={formData.officialCourseMaterial}
                    onCheckedChange={(checked) => setFormData({...formData, officialCourseMaterial: checked as boolean})}
                    disabled={isLoading}
                  />
                  <Label htmlFor="official" className="cursor-pointer">
                    Official course material
                  </Label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor Name</Label>
                  <Input 
                    id="instructor"
                    placeholder="Instructor name"
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

              <div className="space-y-2">
                <Label htmlFor="syllabus">Syllabus Section</Label>
                <Input 
                  id="syllabus"
                  placeholder="Related syllabus section"
                  value={formData.syllabusSection}
                  onChange={(e) => setFormData({...formData, syllabusSection: e.target.value})}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/resources")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? "Adding..." : "Add Resource"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
