import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function usePreferences(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(userId ? `/api/v1/preferences?userId=${userId}` : null, fetcher)

  const updatePreferences = async (updates: any) => {
    const response = await fetch("/api/v1/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error("Failed to update preferences")
    const updated = await response.json()
    mutate(updated)
    return updated
  }

  return {
    preferences: data,
    isLoading,
    error,
    updatePreferences,
    mutate,
  }
}
