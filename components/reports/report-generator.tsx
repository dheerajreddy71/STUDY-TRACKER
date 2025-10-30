"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface ReportGeneratorProps {
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function ReportGenerator({ onSubmit, isLoading }: ReportGeneratorProps) {
  const [formData, setFormData] = useState({
    reportType: "weekly",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const setQuickRange = (days: number) => {
    const end = new Date()
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    setFormData({
      ...formData,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Report</CardTitle>
        <CardDescription>Create a detailed report of your study activity</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reportType">Report Type</Label>
            <Select
              value={formData.reportType}
              onValueChange={(value) => setFormData({ ...formData, reportType: value })}
            >
              <SelectTrigger id="reportType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setQuickRange(7)}>
              Last 7 Days
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setQuickRange(30)}>
              Last 30 Days
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setQuickRange(90)}>
              Last 90 Days
            </Button>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Generating..." : "Generate Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
