import useSWR from "swr"
import { api } from "@/lib/api-client"
import type { StudySession } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useSessions() {
  const { data, error, isLoading, mutate } = useSWR<{ sessions: StudySession[] }>("/api/v1/sessions", fetcher)

  return {
    sessions: data?.sessions || [],
    isLoading,
    error,
    mutate,
  }
}
