"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  BookOpen, Plus, Star, ExternalLink, FileText, Video, Link as LinkIcon,
  Edit, Trash2, Search, Filter, Clock, CheckCircle2, BookMarked, TrendingUp
} from "lucide-react"
import Link from "next/link"

export default function ResourcesPage() {
  const router = useRouter()
  const [resources, setResources] = useState<any[]>([])
  const [filteredResources, setFilteredResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [subjects, setSubjects] = useState<any[]>([])

  useEffect(() => {
    loadResources()
    loadSubjects()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [resources, filterType, filterStatus, filterSubject, searchQuery])

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

  const loadResources = async () => {
    try {
      setIsLoading(true)
      const userId = localStorage.getItem("userId") || "guest-user"
      const response = await fetch(`/api/v1/resources?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setResources(data.data || [])
      } else {
        toast.error("Failed to load resources")
      }
    } catch (error) {
      console.error("Error loading resources:", error)
      toast.error("Failed to load resources")
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...resources]

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(resource => resource.resourceType === filterType)
    }

    // Filter by completion status
    if (filterStatus !== "all") {
      filtered = filtered.filter(resource => resource.completionStatus === filterStatus)
    }

    // Filter by subject
    if (filterSubject !== "all") {
      filtered = filtered.filter(resource => resource.primarySubjectId === filterSubject)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(resource => 
        resource.resourceName?.toLowerCase().includes(query) ||
        resource.authorCreator?.toLowerCase().includes(query) ||
        resource.summary?.toLowerCase().includes(query)
      )
    }

    setFilteredResources(filtered)
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      textbook: BookOpen,
      ebook: BookMarked,
      video_course: Video,
      article: FileText,
      pdf: FileText,
      website: LinkIcon,
      default: BookOpen
    }
    const Icon = icons[type] || icons.default
    return <Icon className="h-4 w-4" />
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      not_started: "bg-gray-500",
      in_progress: "bg-blue-500",
      completed: "bg-green-500",
      partially_reviewed: "bg-yellow-500",
      abandoned: "bg-red-500"
    }
    return colors[status] || "bg-gray-500"
  }

  const formatType = (type: string) => {
    if (!type) return 'N/A'
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const stats = {
    total: resources.length,
    inProgress: resources.filter(r => r.completionStatus === "in_progress").length,
    completed: resources.filter(r => r.completionStatus === "completed").length,
    avgProgress: resources.length > 0 ? resources.reduce((sum, r) => sum + (r.currentProgressPercentage || 0), 0) / resources.length : 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Library</h1>
          <p className="text-muted-foreground mt-2">Manage your study materials and resources</p>
        </div>
        <Link href="/resources/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Resources</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{stats.avgProgress.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </label>
              <Input 
                placeholder="Search resources..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Type
              </label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
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
                  <SelectItem value="flashcards">Flashcards</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Status
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="partially_reviewed">Partially Reviewed</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Subject
              </label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
            <h3 className="mt-4 text-lg font-semibold">No resources found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery || filterType !== "all" || filterStatus !== "all" || filterSubject !== "all"
                ? "Try adjusting your filters"
                : "Add your first study resource to get started"}
            </p>
            {resources.length === 0 && (
              <Link href="/resources/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredResources.map((resource) => {
            const primarySubject = subjects.find(s => s.id === resource.primarySubjectId)
            
            return (
              <Card key={resource.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getTypeIcon(resource.resourceType)}
                          <h3 className="text-xl font-semibold">{resource.resourceName}</h3>
                          <Badge variant="secondary">{formatType(resource.resourceType)}</Badge>
                          <Badge className={`${getStatusColor(resource.completionStatus)} text-white`}>
                            {formatType(resource.completionStatus)}
                          </Badge>
                          {resource.personalRating && (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: resource.personalRating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          )}
                        </div>
                        {resource.authorCreator && (
                          <p className="text-sm text-muted-foreground mt-1">
                            by {resource.authorCreator}
                            {resource.publisher && ` • ${resource.publisher}`}
                            {resource.editionVersion && ` • ${resource.editionVersion}`}
                          </p>
                        )}
                        {resource.summary && (
                          <p className="text-sm text-muted-foreground mt-2">{resource.summary}</p>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    {resource.currentProgressPercentage > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{resource.currentProgressPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={resource.currentProgressPercentage} className="h-2" />
                        {resource.totalPages && (
                          <p className="text-xs text-muted-foreground">
                            {resource.currentProgressPages || 0} / {resource.totalPages} pages
                          </p>
                        )}
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid gap-3 md:grid-cols-2 pt-3 border-t">
                      {primarySubject && (
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Subject:</span>
                          <span className="font-medium">{primarySubject.name}</span>
                        </div>
                      )}
                      {resource.difficultyLevel && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Difficulty:</span>
                          <span className="font-medium capitalize">{resource.difficultyLevel}</span>
                        </div>
                      )}
                      {resource.accessType && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Access:</span>
                          <span className="font-medium capitalize">{typeof resource.accessType === 'string' ? resource.accessType.replace(/_/g, ' ') : 'N/A'}</span>
                        </div>
                      )}
                      {resource.timesAccessed > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Accessed:</span>
                          <span className="font-medium">{resource.timesAccessed} times</span>
                        </div>
                      )}
                    </div>

                    {/* URL/Link */}
                    {resource.url && (
                      <div className="flex items-center gap-2 pt-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Open Resource
                        </a>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t flex-wrap">
                      <Link href={`/resources/${resource.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          View/Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          const newProgress = prompt(`Update progress for ${resource.resourceName}\n\nCurrent: ${resource.currentProgressPercentage?.toFixed(0) || 0}%\nEnter new percentage (0-100):`, resource.currentProgressPercentage?.toString() || "0")
                          if (newProgress !== null && !isNaN(parseFloat(newProgress))) {
                            const progress = Math.min(100, Math.max(0, parseFloat(newProgress)))
                            try {
                              const userId = localStorage.getItem("userId") || "guest-user"
                              const response = await fetch("/api/v1/resources", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  id: resource.id,
                                  userId,
                                  current_progress_percentage: progress,
                                  completion_status: progress === 100 ? "completed" : progress > 0 ? "in_progress" : "not_started"
                                })
                              })
                              const data = await response.json()
                              if (response.ok) {
                                toast.success("Progress updated!")
                                loadResources()
                              } else {
                                toast.error(data.error || "Failed to update progress")
                              }
                            } catch (error) {
                              toast.error("Failed to update progress")
                            }
                          }
                        }}
                      >
                        Update Progress
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive"
                        onClick={async () => {
                          if (confirm(`Are you sure you want to delete "${resource.resourceName}"? This cannot be undone.`)) {
                            try {
                              const userId = localStorage.getItem("userId") || "guest-user"
                              const response = await fetch(`/api/v1/resources?id=${resource.id}&userId=${userId}`, {
                                method: "DELETE"
                              })
                              const data = await response.json()
                              if (response.ok) {
                                toast.success("Resource deleted")
                                loadResources()
                              } else {
                                toast.error(data.error || "Failed to delete resource")
                              }
                            } catch (error) {
                              toast.error("Failed to delete resource")
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
