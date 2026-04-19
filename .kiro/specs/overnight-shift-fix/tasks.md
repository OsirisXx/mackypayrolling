# Implementation Plan: Overnight Shift Fix

## Overview

The fix is a single-function change in `attendanceStore.ts`: modify `fetchTodayAttendance()` to also fetch open shifts from previous days and merge them into `todayRecords`. All downstream functions (`getActiveAttendance`, `clockIn`, `clockOut`, `otClockIn`, `otClockOut`) and the ScanPage sidebar already work correctly once the overnight records are present in `todayRecords`. A helper function for deduplication will be extracted for testability.

## Tasks

- [x] 1. Extract merge/deduplication helper and update fetchTodayAttendance
  - [x] 1.1 Create a `mergeAttendanceRecords` helper function in `src/stores/attendanceStore.ts`
    - The function takes two arrays of `AttendanceWithWorker` and returns a merged array with no duplicate `id` values
    - Today's records take priority (are listed first); open shifts from previous days are appended
    - Export the function for testing
    - _Requirements: 1.2_

  - [x] 1.2 Modify `fetchTodayAttendance()` to fetch open shifts from previous days
    - Add a second Supabase query: `supabase.from('attendance').select('*, worker:workers(*)').eq('status', 'clocked_in').order('clock_in', { ascending: false })`
    - Use `mergeAttendanceRecords` to combine today's records with open shift records
    - Set the merged result as `todayRecords`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 6.1, 6.2_

  - [x] 1.3 Write property test: No duplicate IDs after merge
    - **Property 2: Merged records contain no duplicates**
    - **Validates: Requirements 1.2**

  - [x] 1.4 Write property test: Open shifts always included
    - **Property 1: Open shifts are always included in fetched records**
    - **Validates: Requirements 1.1**

- [x] 2. Set up test infrastructure
  - [x] 2.1 Install Vitest and fast-check as dev dependencies
    - Run `npm install -D vitest fast-check`
    - Add `"test": "vitest --run"` script to `package.json`
    - _Requirements: Testing infrastructure_

  - [x] 2.2 Create `vitest.config.ts` at project root
    - Configure with `globals: true` and `environment: 'node'`
    - _Requirements: Testing infrastructure_

- [x] 3. Checkpoint - Verify the fix works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Write remaining property tests
  - [x] 4.1 Write property test: No simultaneous active shifts
    - **Property 3: No worker has simultaneous active shifts**
    - Generate a `todayRecords` array containing an active shift for a random worker, verify that the `clockIn` duplicate-check logic rejects the new clock-in
    - **Validates: Requirements 3.1**

  - [x] 4.2 Write property test: Hours worked calculation is correct and capped
    - **Property 4: Hours worked calculation is correct and capped**
    - Generate random `clock_in`/`clock_out` timestamp pairs (including cross-midnight), verify `hours_worked = min(differenceInMinutes(out, in) / 60, 8)` rounded to 2 decimal places
    - **Validates: Requirements 4.2**

- [x] 5. Write unit tests for edge cases
  - [x] 5.1 Write unit tests for overnight shift scenarios
    - Test: worker clocks in at 3 PM, fetch at 1 AM next day — record is in todayRecords
    - Test: clock-out at 2 AM for 3 PM clock-in — hours_worked is 8 (capped)
    - Test: clock-out at 6 PM for 10 AM clock-in — hours_worked is 8 (exactly at cap)
    - Test: clock-out at 5 PM for 2 PM clock-in — hours_worked is 3
    - Test: merging empty arrays returns empty
    - Test: merging with no overlap returns union
    - _Requirements: 1.1, 4.2_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required — system is in a live dry run with real data
- The core fix is task 1 (just two sub-tasks: extract helper + modify query)
- No changes needed to ScanPage, clockIn, clockOut, getActiveAttendance, otClockIn, or otClockOut — they all work automatically once todayRecords contains overnight shifts
- No database schema changes required
