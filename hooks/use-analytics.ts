import useSWR from "swr"
import { api } from "@/lib/api-client"
import type { DashboardStats } from "@/lib/types"

export function useAnalytics() {
  const { data, error, isLoading, mutate } = useSWR<{ stats: DashboardStats }>("/api/v1/analytics/dashboard", () =>
    api.getDashboardStats(),
  )

  return {
    stats: data?.stats,
    isLoading,
    error,
    mutate,
  }
}

export function useAnalyticsStats(userId: string) {
  const { data, error, isLoading } = useSWR(userId ? `/api/v1/analytics/stats?userId=${userId}` : null, (url) =>
    fetch(url, { headers: { "x-user-id": userId } }).then((r) => r.json()),
  )

  return {
    stats: data,
    isLoading,
    error,
  }
}

export function useAnalyticsTrends(userId: string, days = 30) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/v1/analytics/trends?userId=${userId}&days=${days}` : null,
    (url) => fetch(url, { headers: { "x-user-id": userId } }).then((r) => r.json()),
  )

  return {
    trends: data || [],
    isLoading,
    error,
  }
}

export function useSubjectBreakdown(userId: string) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/v1/analytics/subject-breakdown?userId=${userId}` : null,
    (url) => fetch(url, { headers: { "x-user-id": userId } }).then((r) => r.json()),
  )

  return {
    subjects: data || [],
    isLoading,
    error,
  }
}
