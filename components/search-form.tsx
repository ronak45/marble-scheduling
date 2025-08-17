"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
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

    router.push(`/?insurance=${selectedInsurance}`)
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
          <Button onClick={handleSearch} className="gap-2" disabled={!selectedInsurance}>
            <Search className="h-4 w-4" />
            Find Appointments
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
