import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useReports(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(userId ? `/api/v1/reports?userId=${userId}` : null, fetcher)

  const generateReport = async (reportData: any) => {
    const response = await fetch("/api/v1/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify(reportData),
    })
    if (!response.ok) throw new Error("Failed to generate report")
    const newReport = await response.json()
    mutate([...(data || []), newReport])
    return newReport
  }

  return {
    reports: data || [],
    isLoading,
    error,
    generateReport,
    mutate,
  }
}
