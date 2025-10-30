import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function usePredictiveAnalytics(userId: string) {
  const { data, error, isLoading } = useSWR(userId ? `/api/v1/analytics/predictive?userId=${userId}` : null, fetcher)

  return {
    predictions: data,
    isLoading,
    error,
  }
}

export function useMethodCorrelations(userId: string) {
  const { data, error, isLoading } = useSWR(userId ? `/api/v1/analytics/correlations?userId=${userId}` : null, fetcher)

  return {
    methodCorrelations: data?.methodCorrelations || [],
    timeCorrelations: data?.timeCorrelations || [],
    isLoading,
    error,
  }
}
