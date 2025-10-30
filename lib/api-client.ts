const API_BASE = "/api/v1"

export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "API request failed")
  }

  return response.json()
}

export const api = {
  // Sessions
  getSessions: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/sessions${query ? `?${query}` : ""}`)
  },
  createSession: (data: any) => apiCall("/sessions", { method: "POST", body: JSON.stringify(data) }),
  getSession: (id: string) => apiCall(`/sessions/${id}`),
  endSession: (id: string, data: any) => apiCall(`/sessions/${id}/end`, { method: "POST", body: JSON.stringify(data) }),
  deleteSession: (id: string) => apiCall(`/sessions/${id}`, { method: "DELETE" }),

  // Performance
  getPerformance: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/performance${query ? `?${query}` : ""}`)
  },
  createPerformance: (data: any) => apiCall("/performance", { method: "POST", body: JSON.stringify(data) }),
  getPerformanceAnalytics: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/performance/analytics${query ? `?${query}` : ""}`)
  },

  // Subjects
  getSubjects: () => apiCall("/subjects"),
  createSubject: (data: any) => apiCall("/subjects", { method: "POST", body: JSON.stringify(data) }),
  getSubject: (id: string) => apiCall(`/subjects/${id}`),
  updateSubject: (id: string, data: any) => apiCall(`/subjects/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Analytics
  getDashboardStats: () => apiCall("/analytics/dashboard"),
  getTimeAnalysis: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString()
    return apiCall(`/analytics/time-analysis${query ? `?${query}` : ""}`)
  },
}
