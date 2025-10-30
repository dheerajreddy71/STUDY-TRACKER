import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useSubjects(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(userId ? `/api/v1/subjects?userId=${userId}` : null, fetcher)

  const createSubject = async (subject: any) => {
    const response = await fetch("/api/v1/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify(subject),
    })
    if (!response.ok) throw new Error("Failed to create subject")
    const newSubject = await response.json()
    mutate([...(data || []), newSubject])
    return newSubject
  }

  const updateSubject = async (id: string, updates: any) => {
    const response = await fetch(`/api/v1/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error("Failed to update subject")
    const updated = await response.json()
    mutate(data?.map((s: any) => (s.id === id ? updated : s)))
    return updated
  }

  const deleteSubject = async (id: string) => {
    const response = await fetch(`/api/v1/subjects/${id}`, {
      method: "DELETE",
      headers: { "x-user-id": userId },
    })
    if (!response.ok) throw new Error("Failed to delete subject")
    mutate(data?.filter((s: any) => s.id !== id))
  }

  return {
    subjects: data || [],
    isLoading,
    error,
    createSubject,
    updateSubject,
    deleteSubject,
    mutate,
  }
}
