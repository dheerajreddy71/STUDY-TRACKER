"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Edit, Trash2, ExternalLink, BookOpen, Star } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ResourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const resourceId = params.id as string

  const [resource, setResource] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!resourceId) return

    const userId = localStorage.getItem("userId") || "guest-user"

    fetch(`/api/v1/resources/${resourceId}?userId=${userId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setResource(data.data)
        } else {
          toast.error("Failed to load resource")
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Error loading resource:", error)
        toast.error("Failed to load resource")
        setIsLoading(false)
      })
  }, [resourceId])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resource? This action cannot be undone.")) {
      return
    }

    try {
      const userId = localStorage.getItem("userId") || "guest-user"
      const response = await fetch(`/api/v1/resources?id=${resourceId}&userId=${userId}`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        toast.success("Resource deleted successfully")
        router.push("/resources")
      } else {
        toast.error("Failed to delete resource")
      }
    } catch (error) {
      console.error("Error deleting resource:", error)
      toast.error("Failed to delete resource")
    }
  }

  const formatType = (type: string) => {
    if (!type) return 'N/A'
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading resource...</p>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-muted-foreground mb-4">Resource not found</p>
        <Link href="/resources">
          <Button>Back to Resources</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/resources">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {resource.resourceName || resource.resource_name}
            </h1>
            {(resource.authorCreator || resource.author_creator) && (
              <p className="text-muted-foreground mt-1">
                by {resource.authorCreator || resource.author_creator}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/resources/${resourceId}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant="secondary">
          {formatType(resource.resourceType || resource.resource_type)}
        </Badge>
        <Badge variant="outline">
          {formatType(resource.completionStatus || resource.completion_status)}
        </Badge>
        {(resource.personalRating || resource.personal_rating) && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {resource.personalRating || resource.personal_rating}/5
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column - Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Summary */}
          {resource.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{resource.summary}</p>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          {(resource.currentProgressPercentage > 0 || resource.current_progress_percentage > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completion</span>
                    <span className="font-medium">
                      {(resource.currentProgressPercentage || resource.current_progress_percentage || 0).toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={resource.currentProgressPercentage || resource.current_progress_percentage || 0} 
                    className="h-2" 
                  />
                </div>
                {(resource.totalPages || resource.total_pages) && (
                  <p className="text-sm text-muted-foreground">
                    {resource.currentProgressPages || resource.current_progress_pages || 0} / {resource.totalPages || resource.total_pages} pages
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Access Link */}
          {resource.url && (
            <Card>
              <CardHeader>
                <CardTitle>Access Resource</CardTitle>
              </CardHeader>
              <CardContent>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Resource
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {(resource.publisher || resource.edition_version) && (
                <div>
                  <p className="text-muted-foreground">Publication</p>
                  <p className="font-medium">
                    {resource.publisher}
                    {resource.editionVersion && ` • ${resource.editionVersion}`}
                  </p>
                </div>
              )}

              {resource.difficultyLevel && (
                <div>
                  <p className="text-muted-foreground">Difficulty</p>
                  <p className="font-medium capitalize">{resource.difficultyLevel || resource.difficulty_level}</p>
                </div>
              )}

              {resource.accessType && (
                <div>
                  <p className="text-muted-foreground">Access Type</p>
                  <p className="font-medium capitalize">
                    {typeof resource.accessType === 'string' 
                      ? resource.accessType.replace(/_/g, ' ') 
                      : (resource.access_type || '').replace(/_/g, ' ')}
                  </p>
                </div>
              )}

              {(resource.timesAccessed > 0 || resource.times_accessed > 0) && (
                <div>
                  <p className="text-muted-foreground">Times Accessed</p>
                  <p className="font-medium">{resource.timesAccessed || resource.times_accessed}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
