"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pause, Square } from "lucide-react"

interface SessionTimerProps {
  onEnd: (duration: number) => void
}

export function SessionTimer({ onEnd }: SessionTimerProps) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning])

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const formatTime = (num: number) => String(num).padStart(2, "0")

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Study Session Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-bold font-mono tracking-wider">
            {formatTime(hours)}:{formatTime(minutes)}:{formatTime(secs)}
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <Button size="lg" onClick={() => setIsRunning(!isRunning)} variant={isRunning ? "destructive" : "default"}>
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setIsRunning(false)
              onEnd(seconds)
              setSeconds(0)
            }}
          >
            <Square className="w-4 h-4 mr-2" />
            End Session
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
