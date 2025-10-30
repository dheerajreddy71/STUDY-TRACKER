"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, BookOpen, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle2, Clock, Target, Loader2, Edit, Trash2, Search, Filter
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function SubjectsPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
  const [filterHealth, setFilterHealth] = useState<string>("all")

  const loadSubjects = () => {
    const userId = localStorage.getItem("userId") || "guest-user"
    
    fetch(`/api/v1/subjects?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setSubjects(data.data || [])
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Error loading subjects:", error)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [subjects, searchQuery, filterCategory, filterDifficulty, filterHealth])

  const applyFilters = () => {
    let filtered = [...subjects]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(subject => 
        subject.name?.toLowerCase().includes(query) ||
        subject.subject_code?.toLowerCase().includes(query) ||
        subject.description?.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter(subject => subject.category === filterCategory)
    }

    // Filter by difficulty
    if (filterDifficulty !== "all") {
      filtered = filtered.filter(subject => subject.difficulty_level === filterDifficulty)
    }

    // Filter by health score
    if (filterHealth !== "all") {
      filtered = filtered.filter(subject => {
        const score = subject.subject_health_score || 0
        if (filterHealth === "excellent") return score >= 80
        if (filterHealth === "good") return score >= 60 && score < 80
        if (filterHealth === "attention") return score >= 40 && score < 60
        if (filterHealth === "critical") return score < 40
        return true
      })
    }

    setFilteredSubjects(filtered)
  }

  const getHealthBadge = (score: number) => {
    if (score >= 80) return { label: "Excellent", variant: "default" as const }
    if (score >= 60) return { label: "Good", variant: "secondary" as const }
    if (score >= 40) return { label: "Needs Attention", variant: "outline" as const }
    return { label: "Critical", variant: "destructive" as const }
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground mt-2">Manage and track all your subjects</p>
        </div>
        <Link href="/subjects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="elective">Elective</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="general_education">General Education</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="very_hard">Very Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterHealth} onValueChange={setFilterHealth}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Health" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Health</SelectItem>
                  <SelectItem value="excellent">Excellent (80+)</SelectItem>
                  <SelectItem value="good">Good (60-79)</SelectItem>
                  <SelectItem value="attention">Needs Attention (40-59)</SelectItem>
                  <SelectItem value="critical">Critical (&lt;40)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(searchQuery || filterCategory !== "all" || filterDifficulty !== "all" || filterHealth !== "all") && (
            <div className="mt-3 text-sm text-muted-foreground">
              Showing {filteredSubjects.length} of {subjects.length} subjects
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredSubjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {subjects.length === 0 ? "No subjects yet" : "No matching subjects"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {subjects.length === 0 
                ? "Start by adding your first subject to track your studies"
                : "Try adjusting your filters or search query"
              }
            </p>
            {subjects.length === 0 && (
              <Link href="/subjects/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Subject
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject) => {
            const healthScore = subject.subject_health_score || 0
            const healthBadge = getHealthBadge(healthScore)
            const completionPercentage = subject.total_chapters > 0 
              ? (subject.completed_chapters / subject.total_chapters) * 100 
              : 0

            return (
              <Card 
                key={subject.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/subjects/${subject.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: subject.color_theme || '#3b82f6' }}
                      />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{subject.name}</CardTitle>
                        {subject.subject_code && (
                          <p className="text-xs text-muted-foreground mt-1">{subject.subject_code}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={healthBadge.variant} className="ml-2">
                      {healthBadge.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Category</p>
                      <p className="font-medium">
                        {subject.category 
                          ? subject.category.replace('_', ' ').split(' ').map((word: string) => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')
                          : "General"
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Difficulty</p>
                      <div className="flex items-center gap-1">
                        {subject.difficulty_level === 'hard' && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                        <p className="font-medium">
                          {subject.difficulty_level 
                            ? subject.difficulty_level.charAt(0).toUpperCase() + subject.difficulty_level.slice(1)
                            : "Medium"
                          }
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Performance</p>
                      <p className="font-semibold">
                        {subject.current_performance_score && subject.current_performance_score > 0
                          ? `${subject.current_performance_score.toFixed(1)}%`
                          : "0.0%"
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Target</p>
                      <p className="font-semibold">
                        {subject.target_performance_score
                          ? `${subject.target_performance_score.toFixed(1)}%`
                          : "80.0%"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  {subject.total_chapters > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{subject.completed_chapters || 0}/{subject.total_chapters} chapters</span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>
                  )}

                  {/* Study Stats */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {subject.total_study_hours?.toFixed(1) || 0}h studied
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Target className="h-3 w-3" />
                      {subject.total_sessions || 0} sessions
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Link href={`/subjects/${subject.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete "${subject.name}"? This will also delete all associated sessions, performance entries, and goals.`)) {
                          try {
                            const userId = localStorage.getItem("userId") || "guest-user"
                            const response = await fetch(`/api/v1/subjects?id=${subject.id}&userId=${userId}`, {
                              method: "DELETE"
                            })
                            const data = await response.json()
                            if (response.ok) {
                              toast.success("Subject deleted successfully")
                              loadSubjects()
                            } else {
                              toast.error(data.error || "Failed to delete subject")
                            }
                          } catch (error) {
                            console.error("Error deleting subject:", error)
                            toast.error("Failed to delete subject")
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Trend Indicator */}
                  {subject.performance_trend && (
                    <div className="flex items-center gap-2 text-xs pt-2 border-t">
                      {subject.performance_trend === 'improving' ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-600 dark:text-green-400 font-medium">Improving</span>
                        </>
                      ) : subject.performance_trend === 'declining' ? (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span className="text-red-600 dark:text-red-400 font-medium">Declining</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          <span className="text-blue-600 dark:text-blue-400 font-medium">Stable</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Warning Indicators */}
                  {(subject.retention_risk_level === 'high' || subject.burnout_risk_level === 'high') && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t">
                      {subject.retention_risk_level === 'high' && (
                        <Badge variant="outline" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Retention Risk
                        </Badge>
                      )}
                      {subject.burnout_risk_level === 'high' && (
                        <Badge variant="outline" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Burnout Risk
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
