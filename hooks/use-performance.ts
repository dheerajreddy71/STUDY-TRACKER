import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function usePerformance(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(userId ? `/api/v1/performance?userId=${userId}` : null, fetcher)

  const createPerformance = async (entry: any) => {
    const response = await fetch("/api/v1/performance", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify(entry),
    })
    if (!response.ok) throw new Error("Failed to create performance entry")
    const newEntry = await response.json()
    mutate([...(data || []), newEntry])
    return newEntry
  }

  const updatePerformance = async (id: string, updates: any) => {
    const response = await fetch(`/api/v1/performance/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error("Failed to update performance entry")
    const updated = await response.json()
    mutate(data?.map((p: any) => (p.id === id ? updated : p)))
    return updated
  }

  return {
    performance: data || [],
    isLoading,
    error,
    createPerformance,
    updatePerformance,
    mutate,
  }
}

export function usePerformanceBySubject(userId: string, subjectId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId && subjectId ? `/api/v1/performance/by-subject?userId=${userId}&subjectId=${subjectId}` : null,
    fetcher,
  )

  return {
    performance: data || [],
    isLoading,
    error,
    mutate,
  }
}
