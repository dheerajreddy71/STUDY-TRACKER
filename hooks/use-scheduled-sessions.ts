import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useScheduledSessions(userId: string, date?: string) {
  const queryString = date ? `?userId=${userId}&date=${date}` : `?userId=${userId}`
  const { data, error, isLoading, mutate } = useSWR(userId ? `/api/v1/scheduled-sessions${queryString}` : null, fetcher)

  const scheduleSession = async (session: any) => {
    const response = await fetch("/api/v1/scheduled-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify(session),
    })
    if (!response.ok) throw new Error("Failed to schedule session")
    const newSession = await response.json()
    mutate([...(data || []), newSession])
    return newSession
  }

  const updateScheduledSession = async (id: string, updates: any) => {
    const response = await fetch(`/api/v1/scheduled-sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error("Failed to update session")
    const updated = await response.json()
    mutate(data?.map((s: any) => (s.id === id ? updated : s)))
    return updated
  }

  const deleteScheduledSession = async (id: string) => {
    const response = await fetch(`/api/v1/scheduled-sessions/${id}`, {
      method: "DELETE",
      headers: { "x-user-id": userId },
    })
    if (!response.ok) throw new Error("Failed to delete session")
    mutate(data?.filter((s: any) => s.id !== id))
  }

  return {
    sessions: data || [],
    isLoading,
    error,
    scheduleSession,
    updateScheduledSession,
    deleteScheduledSession,
    mutate,
  }
}
