"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function PerformancePage() {
  const router = useRouter()
  const [performances, setPerformances] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const userId = localStorage.getItem("userId") || "guest-user"
    
    Promise.all([
      fetch(`/api/v1/performance?userId=${userId}`).then(r => r.json()),
      fetch(`/api/v1/analytics?userId=${userId}&period=all`).then(r => r.json())
    ]).then(([perfData, analyticsData]) => {
      if (perfData.success) {
        setPerformances(perfData.data || [])
      }
      if (analyticsData.success) {
        const perfStats = analyticsData.data.performanceStats?.[0]
        setStats({
          avgScore: perfStats?.avg_percentage?.toFixed(1) || 0,
          total: perfStats?.total_assessments || 0,
          bestSubject: "Check Analytics"
        })
      }
      setIsLoading(false)
    }).catch(error => {
      console.error("Error loading performance:", error)
      setIsLoading(false)
    })
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const userId = localStorage.getItem("userId") || "guest-user"
      const response = await fetch(`/api/v1/performance/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": userId }
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success("Performance entry deleted successfully")
        loadData() // Reload the list
      } else {
        toast.error(data.error || "Failed to delete entry")
      }
    } catch (error) {
      console.error("Error deleting performance:", error)
      toast.error("Failed to delete entry")
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Tracking</h1>
          <p className="text-muted-foreground mt-2">Log and track your assessment results</p>
        </div>
        <Link href="/performance/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log Performance
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-3xl font-bold">{isLoading ? "..." : `${stats?.avgScore || 0}%`}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Assessments</p>
              <p className="text-3xl font-bold">{isLoading ? "..." : stats?.total || 0}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Best Subject</p>
              <p className="text-lg font-bold">{isLoading ? "..." : stats?.bestSubject || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading assessments...</p>
            ) : performances.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No assessments logged yet. Add your first one!</p>
            ) : (
              <div className="space-y-4">
                {performances.slice(0, 10).map((perf) => (
                  <div key={perf.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">{perf.subject_name} - {perf.assessment_type}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(perf.assessment_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{perf.score}/{perf.total_marks}</p>
                        <p className="text-sm text-muted-foreground">{perf.percentage?.toFixed(1)}%</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/performance/${perf.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(perf.id, `${perf.subject_name} - ${perf.assessment_type}`)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
