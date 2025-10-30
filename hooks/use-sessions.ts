import useSWR from "swr"
import { api } from "@/lib/api-client"
import type { StudySession } from "@/lib/types"

export function useSessions() {
  const { data, error, isLoading, mutate } = useSWR<{ sessions: StudySession[] }>("/api/v1/sessions", () =>
    api.getSessions(),
  )

  return {
    sessions: data?.sessions || [],
    isLoading,
    error,
    mutate,
  }
}
