import { Suspense } from "react"
import { SearchForm } from "@/components/search-form"
import { AvailabilityResults } from "@/components/availability-results"
import { Skeleton } from "@/components/ui/skeleton"
import { FilterBar } from "@/components/filter-bar"

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-3xl font-bold">Find a Therapist</h1>
          <p className="mb-8 text-muted-foreground">
            Select your insurance provider to see available therapy appointments.
          </p>

          <SearchForm />

          {/* Compact date/time filter bar */}
          <FilterBar />

          <Suspense fallback={<ResultsSkeleton />}>
            <div className="h-[calc(100vh-3rem)] overflow-y-auto">
              <AvailabilityResults />
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="mt-8 space-y-4">
      <Skeleton className="h-8 w-full max-w-sm" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-md" />
          ))}
      </div>
    </div>
  )
}
