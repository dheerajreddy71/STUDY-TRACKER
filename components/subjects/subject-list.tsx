"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trash2 } from "lucide-react"

interface Subject {
  id: string
  name: string
  category: string
  difficulty_level: string
  current_grade?: number
  target_grade?: number
  color_theme: string
  exam_date?: string
}

interface SubjectListProps {
  subjects: Subject[]
  isLoading?: boolean
  onDelete?: (id: string) => Promise<void>
}

export function SubjectList({ subjects, isLoading, onDelete }: SubjectListProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading subjects...</div>
  }

  if (subjects.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No subjects yet. Create one to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject) => {
        const progress = subject.target_grade ? ((subject.current_grade || 0) / subject.target_grade) * 100 : 0

        return (
          <Card key={subject.id} className="overflow-hidden">
            <div
              className="h-2"
              style={{
                backgroundColor: subject.color_theme,
              }}
            />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <CardDescription className="capitalize">{subject.category.replace("_", " ")}</CardDescription>
                </div>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(subject.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Badge variant="outline" className="capitalize">
                  {subject.difficulty_level.replace("_", " ")}
                </Badge>
              </div>

              {subject.current_grade !== undefined && subject.target_grade && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {subject.current_grade} / {subject.target_grade}
                    </span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                </div>
              )}

              {subject.exam_date && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Exam: </span>
                  <span className="font-medium">{new Date(subject.exam_date).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
