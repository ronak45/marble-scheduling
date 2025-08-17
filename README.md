
# Therapist Scheduling Service

## Implementation Summary (Enhancements)

### Compact filtering to minimize time-to-valid-slot
- Added a high-affordance filter bar (`components/filter-bar.tsx`) with sensible defaults and left-aligned chips.
- Date presets: Today, Tomorrow, This Week, Next Week, and a "Pick Date" calendar popover.
- Time-of-day chips: Morning (6–12), Afternoon (12–4), Evening (4–8). Multi-select supported.
- Auto-detected timezone pill (e.g., America/New_York).

### Calendar behavior
- Two-week calendar with availability dots derived from live data and non-available days disabled to reduce dead-ends.
- Picked date is rendered inline in the "Pick Date" chip (e.g., "Fri, Aug 29").
- Fixed off-by-one bug by parsing picked dates as local dates using `date-fns/parse`.

### Results and sorting
- Results always sort by earliest start time ascending after all filters.
- If no results match the selected day/week, show the earliest matching day’s appointment cards with a "Next available" subheading.

### Insurance safety filtering
- Client safeguards ensure only appointments that accept the selected insurance are displayed, in addition to backend filtering.

### URL param persistence and reset
- Filters persist when changing insurance. `Find Appointments` updates just the `insurance` query param, preserving others.
- Added a `Reset filters` button that keeps `insurance` but resets: `datePreset` → `today`, clears `date`, `times`, and soonest-related params.

### Key files touched
- `components/filter-bar.tsx`: new compact filter bar, calendar popover, chips, timezone pill, URL param management.
- `components/availability-results.tsx`: filtering (date/time/insurance), earliest-day fallback, stable sort.
- `components/search-form.tsx`: preserve filters on insurer change and add Reset filters.

### How to use
1. Select an insurance provider and click "Find Appointments" (or use defaults).
2. Narrow results via date presets or "Pick Date"; use Morning/Afternoon/Evening chips for time-of-day.
3. If no slots match, the earliest available day’s options are shown automatically.

---

## Additions with more time (future work)
1. Duration filters (30m • 45m • 60m).
2. Therapist metadata and additional facets (virtual/in‑person, specialties).
3. Location-based search and distance filtering.
4. Time of day and time-zone selector
