"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { addDays, endOfWeek, format, isAfter, isBefore, isSameDay, startOfDay, startOfWeek } from "date-fns"
import { Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { searchAvailabilities, checkApiHealth } from "@/lib/api"
import type { Availability } from "@/lib/api"

export function AvailabilityResults() {
  const searchParams = useSearchParams()
  const insurance = searchParams.get("insurance")
  const datePreset = (searchParams.get("datePreset") as
    | "today"
    | "tomorrow"
    | "this_week"
    | "next_week"
    | "pick"
    | null) || "today"
  const pickedDateParam = searchParams.get("date")
  const timesParam = searchParams.get("times") || ""
  const soonest = searchParams.get("soonest") === "true"
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!insurance) {
      setAvailabilities([])
      return
    }

    const fetchAvailabilities = async () => {
      setLoading(true)
      setError("")

      try {
        // First check if API is healthy
        const isHealthy = await checkApiHealth()
        if (!isHealthy) {
          setError("FastAPI server is not running. Please start the backend server on port 8000.")
          return
        }

        const result = await searchAvailabilities(insurance)

        if (result.success) {
          setAvailabilities(result.data || [])
        } else {
          setError(result.error || "An error occurred while fetching availabilities")
        }
      } catch (err) {
        console.error(err)
        setError("An error occurred while fetching availabilities")
      } finally {
        setLoading(false)
      }
    }

    fetchAvailabilities()
  }, [insurance])

  const selectedTimes = useMemo(() => timesParam.split(",").filter(Boolean), [timesParam])

  const filterByDateRange = (items: Availability[]) => {
    const today = startOfDay(new Date())
    if (datePreset === "pick" && pickedDateParam) {
      const d = new Date(pickedDateParam)
      return items.filter((a) => isSameDay(new Date(a.startTime), d))
    }
    if (datePreset === "tomorrow") {
      const d = startOfDay(addDays(today, 1))
      return items.filter((a) => isSameDay(new Date(a.startTime), d))
    }
    if (datePreset === "this_week") {
      const start = startOfWeek(today, { weekStartsOn: 0 })
      const end = endOfWeek(today, { weekStartsOn: 0 })
      return items.filter((a) => {
        const t = new Date(a.startTime)
        return !isBefore(t, start) && !isAfter(t, end)
      })
    }
    if (datePreset === "next_week") {
      const start = startOfWeek(addDays(today, 7), { weekStartsOn: 0 })
      const end = endOfWeek(addDays(today, 7), { weekStartsOn: 0 })
      return items.filter((a) => {
        const t = new Date(a.startTime)
        return !isBefore(t, start) && !isAfter(t, end)
      })
    }
    // default today
    return items.filter((a) => isSameDay(new Date(a.startTime), today))
  }

  const filterByTimeSegments = (items: Availability[]) => {
    if (selectedTimes.length === 0) return items
    const ranges = [
      { id: "early", startHour: 6, endHour: 9 },
      { id: "morning", startHour: 9, endHour: 12 },
      { id: "afternoon", startHour: 12, endHour: 16 },
      { id: "evening", startHour: 16, endHour: 20 },
    ]
    return items.filter((a) => {
      const hour = new Date(a.startTime).getHours()
      return selectedTimes.some((id) => {
        const r = ranges.find((x) => x.id === id)
        return r ? hour >= r.startHour && hour < r.endHour : false
      })
    })
  }

  const filteredAvailabilities = useMemo(() => {
    let items = [...availabilities]
    items = filterByDateRange(items)
    items = filterByTimeSegments(items)

    if (soonest && items.length > 0) {
      items.sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))
      const firstDate = startOfDay(new Date(items[0].startTime))
      items = items.filter((a) => isSameDay(new Date(a.startTime), firstDate))
    }
    return items
  }, [availabilities, datePreset, pickedDateParam, timesParam, soonest])

  if (!insurance) {
    return (
      <div className="mt-8 text-center text-muted-foreground">
        Select an insurance provider to see available appointments
      </div>
    )
  }

  if (loading) {
    return <div className="mt-8 text-center text-muted-foreground">Loading availabilities...</div>
  }

  if (error) {
    return <div className="mt-8 text-center text-muted-foreground">{error}</div>
  }

  if (filteredAvailabilities.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground">No availabilities match your filters</div>
    )
  }

  // Display all insurance payers the therapist accepts
  const displayInsuranceBadges = (therapist: Availability["therapist"]) => {
    return (
      <div className="flex flex-wrap gap-1">
        {therapist.insurancePayers.map((payer) => (
          <Badge key={payer.id} variant={payer.id === insurance ? "default" : "secondary"} className="text-xs">
            {payer.name}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold">Available Appointments</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredAvailabilities.map((availability) => (
          <Card key={availability.id} className="overflow-hidden flex flex-col shadow-sm border-muted">
            <CardHeader className="pb-3 bg-muted/10">
              <div className="flex items-center gap-3">
                <Avatar className="border-2 border-background">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {availability.therapist.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base truncate">{availability.therapist.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-4 flex-1">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {format(new Date(availability.startTime), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">
                    {format(new Date(availability.startTime), "h:mm a")} -{" "}
                    {format(new Date(availability.endTime), "h:mm a")}
                  </span>
                </div>
                <div className="mt-2">{displayInsuranceBadges(availability.therapist)}</div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs p-2.5">
                Book Appointment
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
