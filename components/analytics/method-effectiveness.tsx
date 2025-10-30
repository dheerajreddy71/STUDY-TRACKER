"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MethodData {
  method: string
  averagePerformance: number
  sessionCount: number
  effectiveness: string
}

interface MethodEffectivenessProps {
  methods: MethodData[]
  isLoading?: boolean
}

export function MethodEffectiveness({ methods, isLoading }: MethodEffectivenessProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Method Effectiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading data...</div>
        </CardContent>
      </Card>
    )
  }

  if (methods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Method Effectiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No data yet</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Method Effectiveness</CardTitle>
        <CardDescription>Performance by study method</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={methods}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="method" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="averagePerformance" fill="#3b82f6" name="Avg Performance %" />
          </BarChart>
        </ResponsiveContainer>

        <div className="space-y-2">
          {methods.map((method) => (
            <div key={method.method} className="flex items-center justify-between p-2 border rounded">
              <div>
                <p className="font-medium capitalize">{method.method.replace("_", " ")}</p>
                <p className="text-sm text-muted-foreground">{method.sessionCount} sessions</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={method.effectiveness === "high" ? "default" : "outline"}>
                  {method.averagePerformance}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
