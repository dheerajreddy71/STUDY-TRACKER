import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useInsights(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(userId ? `/api/v1/insights?userId=${userId}` : null, fetcher)

  const generateInsights = async () => {
    const response = await fetch("/api/v1/insights/generate", {
      method: "POST",
      headers: { "x-user-id": userId },
    })
    if (!response.ok) throw new Error("Failed to generate insights")
    const newInsights = await response.json()
    mutate([...(data || []), ...newInsights])
    return newInsights
  }

  return {
    insights: data || [],
    isLoading,
    error,
    generateInsights,
    mutate,
  }
}
