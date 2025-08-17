"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { addWeeks, endOfWeek, format, parse, startOfDay, startOfWeek } from "date-fns"
import { Calendar as CalendarIcon, Clock, Globe2 } from "lucide-react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { searchAvailabilities, type Availability } from "@/lib/api"

type DatePreset = "today" | "tomorrow" | "this_week" | "next_week" | "pick"

const TIME_SEGMENTS = [
  { id: "morning", label: "Morning (6–12)", startHour: 6, endHour: 12 },
  { id: "afternoon", label: "Afternoon (12–4)", startHour: 12, endHour: 16 },
  { id: "evening", label: "Evening (4–8)", startHour: 16, endHour: 20 },
]

export function FilterBar() {
  const router = useRouter()
  const params = useSearchParams()

  const insurance = params.get("insurance") || ""
  const datePreset = (params.get("datePreset") as DatePreset) || "today"
  const pickedDateParam = params.get("date")
  const timesParam = params.get("times") || ""
  const soonestParam = params.get("soonest") === "true"

  const [calendarOpen, setCalendarOpen] = useState(false)
  const [availabilities, setAvailabilities] = useState<Availability[]>([])

  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  )

  // Fetch availabilities for calendar dots/disabled days when insurance selected
  useEffect(() => {
    let active = true
    if (!insurance) {
      setAvailabilities([])
      return
    }
    ;(async () => {
      const { success, data } = await searchAvailabilities(insurance)
      if (success && active) setAvailabilities(data || [])
    })()
    return () => {
      active = false
    }
  }, [insurance])

  const availableDates = useMemo(() => {
    const set = new Set<string>()
    for (const a of availabilities) {
      const d = new Date(a.startTime)
      const key = format(d, "yyyy-MM-dd")
      set.add(key)
    }
    return set
  }, [availabilities])

  const selectedTimes = useMemo(
    () => timesParam.split(",").filter(Boolean),
    [timesParam]
  )

  const pickedDate = pickedDateParam ? parse(pickedDateParam, "yyyy-MM-dd", new Date()) : new Date()

  const updateParams = (next: Record<string, string | null>) => {
    const np = new URLSearchParams(params.toString())
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === "") np.delete(k)
      else np.set(k, v)
    })
    router.push(`/?${np.toString()}`)
  }

  const handlePresetChange = (value: DatePreset | "pick") => {
    if (!value) return
    if (value === "pick") {
      setCalendarOpen(true)
      updateParams({ datePreset: "pick" })
      return
    }
    updateParams({ datePreset: value, date: "" })
  }

  const handlePickDate = (date?: Date) => {
    if (!date) return
    setCalendarOpen(false)
    updateParams({ datePreset: "pick", date: format(date, "yyyy-MM-dd") })
  }

  const toggleTime = (values: string[]) => {
    updateParams({ times: values.join(",") })
  }

  const handleSoonestToggle = (checked: boolean) => {
    // If enabling, compute the soonest availability (respecting time segments if any)
    if (checked && availabilities.length > 0) {
      const filtered = availabilities
        .filter((a) => {
          if (selectedTimes.length === 0) return true
          const hour = new Date(a.startTime).getHours()
          return selectedTimes.some((id) => {
            const seg = TIME_SEGMENTS.find((s) => s.id === id)
            if (!seg) return false
            return hour >= seg.startHour && hour < seg.endHour
          })
        })
        .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime))

      if (filtered.length > 0) {
        const d = startOfDay(new Date(filtered[0].startTime))
        updateParams({ soonest: "true", datePreset: "pick", date: format(d, "yyyy-MM-dd") })
        return
      }
    }
    // Otherwise, just set/unset soonest
    updateParams({ soonest: checked ? "true" : "false" })
  }

  // Calendar two-week window based on today
  const twoWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 })
  const twoWeekEnd = endOfWeek(addWeeks(twoWeekStart, 1), { weekStartsOn: 0 })

  return (
    <div className="mt-3 rounded-md border bg-muted/20 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Date</span>
        <ToggleGroup
          type="single"
          value={datePreset}
          onValueChange={(v) => handlePresetChange((v as DatePreset) || datePreset)}
          className="flex-1"
        >
          <ToggleGroupItem value="today" aria-label="Today">Today</ToggleGroupItem>
          <ToggleGroupItem value="tomorrow" aria-label="Tomorrow">Tomorrow</ToggleGroupItem>
          <ToggleGroupItem value="this_week" aria-label="This Week">This Week</ToggleGroupItem>
          <ToggleGroupItem value="next_week" aria-label="Next Week">Next Week</ToggleGroupItem>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <ToggleGroupItem value="pick" aria-label="Pick date">
                <CalendarIcon className="h-4 w-4" /> {datePreset === "pick" && pickedDateParam ? format(pickedDate, "EEE, MMM d") : "Pick Date"}
              </ToggleGroupItem>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <div className="p-2">
                <Calendar
                  mode="single"
                  selected={pickedDate}
                  onSelect={(d) => handlePickDate(d)}
                  fromDate={twoWeekStart}
                  toDate={twoWeekEnd}
                  modifiers={{
                    available: (date) => availableDates.has(format(date, "yyyy-MM-dd")),
                  }}
                  modifiersClassNames={{
                    available:
                      "after:content-[''] after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-primary",
                  }}
                  disabled={(date) => {
                    const key = format(date, "yyyy-MM-dd")
                    return !availableDates.has(key)
                  }}
                />
                <div className="px-3 pb-3 text-xs text-muted-foreground">
                  Showing next 2 weeks; days without availability are disabled.
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </ToggleGroup>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="whitespace-nowrap"><Globe2 className="h-3.5 w-3.5 mr-1" />{timezone}</Badge>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Time of day</span>
        <ToggleGroup
          type="multiple"
          value={selectedTimes}
          onValueChange={toggleTime}
          className="flex-1"
        >
          {TIME_SEGMENTS.map((seg) => (
            <ToggleGroupItem key={seg.id} value={seg.id} aria-label={seg.label}>
              <Clock className="h-4 w-4" /> {seg.label.split(" ")[0]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="flex items-center gap-2 whitespace-nowrap">
          <Switch checked={soonestParam} onCheckedChange={handleSoonestToggle} id="soonest" />
          <label htmlFor="soonest" className="text-sm">Next available</label>
        </div>
      </div>

      {!insurance && (
        <div className="text-xs text-muted-foreground">Select insurance to enable date calendar with availability.</div>
      )}
    </div>
  )
}

export default FilterBar


