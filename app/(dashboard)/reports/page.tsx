"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  const generateReport = async (reportType: string, period: string) => {
    setIsGenerating(reportType)
    const userId = localStorage.getItem("userId") || "guest-user"

    try {
      const response = await fetch("/api/v1/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          reportType,
          period,
          format: "pdf"
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success("Report generated successfully!")
        // In a real app, this would download the PDF
      } else {
        toast.error(data.error || "Failed to generate report")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Failed to generate report")
    } finally {
      setIsGenerating(null)
    }
  }

  const exportData = async (format: string) => {
    const userId = localStorage.getItem("userId") || "guest-user"

    try {
      const response = await fetch(`/api/v1/export?userId=${userId}&format=${format}`)
      const data = await response.json()
      
      if (data.success) {
        // Create download link
        const jsonStr = JSON.stringify(data.data, null, 2)
        const blob = new Blob([jsonStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `study-tracker-data.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        toast.success(`Data exported as ${format.toUpperCase()}`)
      } else {
        toast.error(data.error || "Failed to export data")
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Failed to export data")
    }
  }

  const reports = [
    { id: "weekly", title: "Weekly Report", period: "week", description: "Last 7 days" },
    { id: "monthly", title: "Monthly Report", period: "month", description: "Last 30 days" },
    { id: "semester", title: "Semester Report", period: "semester", description: "Last 6 months" },
    { id: "subject", title: "Subject Report", period: "all", description: "All subjects breakdown" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-2">Generate and download your study reports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {report.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </div>
              <Button 
                className="w-full"
                onClick={() => generateReport(report.id, report.period)}
                disabled={isGenerating === report.id}
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating === report.id ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Export all your study data in various formats</p>
          <div className="grid gap-2 md:grid-cols-3">
            <Button variant="outline" onClick={() => exportData('json')}>
              <Download className="w-4 h-4 mr-2" />
              Export as JSON
            </Button>
            <Button variant="outline" onClick={() => exportData('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
            <Button variant="outline" disabled>
              <Download className="w-4 h-4 mr-2" />
              Export as Excel (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
