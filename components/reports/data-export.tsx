"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"

interface DataExportProps {
  onExport: () => Promise<void>
  isLoading?: boolean
}

export function DataExport({ onExport, isLoading }: DataExportProps) {
  const handleExport = async () => {
    try {
      await onExport()
      const response = await fetch("/api/v1/export", {
        headers: { "x-user-id": localStorage.getItem("userId") || "" },
      })
      const data = await response.json()

      const element = document.createElement("a")
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2)))
      element.setAttribute("download", `study-tracker-export-${new Date().toISOString().split("T")[0]}.json`)
      element.style.display = "none"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>Export or backup your study data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Export Data</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Download all your study data, sessions, and performance records as JSON
          </p>
          <Button onClick={handleExport} disabled={isLoading} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? "Exporting..." : "Export Data"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
