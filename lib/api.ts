export interface InsurancePayer {
  id: string
  name: string
}

export interface Therapist {
  id: string
  name: string
  insurancePayers: InsurancePayer[]
}

export interface Availability {
  id: string
  therapistId: string
  startTime: string
  endTime: string
  therapist: Therapist
}

export async function searchAvailabilities(
  insurance: string,
  opts?: { date?: string; datePreset?: string; times?: string; soonest?: string }
): Promise<{ success: boolean; data?: Availability[]; error?: string }> {
  try {
    const params = new URLSearchParams({ insurance })
    if (opts?.date) params.set("date", opts.date)
    if (opts?.datePreset) params.set("datePreset", opts.datePreset)
    if (opts?.times) params.set("times", opts.times)
    if (opts?.soonest) params.set("soonest", opts.soonest)

    const url = `/api/availabilities?${params}`
    console.log("Fetching from URL:", url)

    const response = await fetch(url)

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json()
        return { success: false, error: errorData.detail || "Failed to fetch availabilities" }
      } else {
        // If we get HTML instead of JSON, it means the API server isn't responding correctly
        const text = await response.text()
        console.error("Received HTML response instead of JSON:", text.substring(0, 200))
        return {
          success: false,
          error: "API server is not responding correctly. Please ensure the FastAPI server is running on port 8000.",
        }
      }
    }

    const data = await response.json()
    console.log("Received data:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching availabilities:", error)
    return { success: false, error: "Network error occurred. Please check if the FastAPI server is running." }
  }
}

export async function getInsurancePayers(): Promise<InsurancePayer[]> {
  try {
    const response = await fetch("/api/insurance-payers")

    if (!response.ok) {
      console.error("Failed to fetch insurance payers:", response.status)
      return []
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching insurance payers:", error)
    return []
  }
}

// Add a health check function
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch("/api/health")
    if (response.ok) {
      const data = await response.json()
      console.log("API Health Check:", data)
      return true
    }
    return false
  } catch (error) {
    console.error("API health check failed:", error)
    return false
  }
}
