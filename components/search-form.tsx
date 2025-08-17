"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentInsurance = searchParams.get("insurance") || "medicaid"

  const [selectedInsurance, setSelectedInsurance] = useState(currentInsurance)

  const handleSearch = () => {
    if (!selectedInsurance) return
    const np = new URLSearchParams(searchParams.toString())
    np.set("insurance", selectedInsurance)
    router.push(`/?${np.toString()}`)
  }

  const handleReset = () => {
    const np = new URLSearchParams(searchParams.toString())
    // Keep insurance, reset date/time filters
    np.set("datePreset", "today")
    np.delete("date")
    np.delete("times")
    np.delete("soonest")
    router.push(`/?${np.toString()}`)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Select value={selectedInsurance} onValueChange={setSelectedInsurance}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Select your insurance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bluecross">Blue Cross Blue Shield</SelectItem>
              <SelectItem value="aetna">Aetna</SelectItem>
              <SelectItem value="cigna">Cigna</SelectItem>
              <SelectItem value="medicaid">Medicaid</SelectItem>
              <SelectItem value="united">United Healthcare</SelectItem>
              <SelectItem value="kaiser">Kaiser Permanente</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button onClick={handleSearch} className="gap-2" disabled={!selectedInsurance}>
              <Search className="h-4 w-4" />
              Find Appointments
            </Button>
            <Button variant="ghost" className="gap-2" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Reset filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
