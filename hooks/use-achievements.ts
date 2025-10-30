import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAchievements(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(userId ? `/api/v1/achievements?userId=${userId}` : null, fetcher)

  const checkAchievements = async () => {
    const response = await fetch("/api/v1/achievements/check", {
      method: "POST",
      headers: { "x-user-id": userId },
    })
    if (!response.ok) throw new Error("Failed to check achievements")
    const newAchievements = await response.json()
    if (newAchievements.length > 0) {
      mutate([...(data || []), ...newAchievements])
    }
    return newAchievements
  }

  return {
    achievements: data || [],
    isLoading,
    error,
    checkAchievements,
    mutate,
  }
}
