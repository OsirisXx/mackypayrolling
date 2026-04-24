# Implementation Plan: Shift-Aware Attendance

## Overview

Harden the Macrock Limestone attendance scan pipeline against double-fire bugs and fix the overly aggressive auto-timeout logic. All changes are frontend-only (React + Zustand) — no DB schema changes. Implementation proceeds bottom-up: pure utility functions first, then store changes, then component changes, with property tests validating each layer before moving to the next.

## Tasks

- [x] 1. Extract pure utility functions for testable scan logic
  - [x] 1.1 Create `src/lib/attendanceHelpers.ts` with the 5 pure functions specified in the design
    - `shouldFireOnScan(current, previous, debounceMs, isProcessing): boolean`
    - `isScanAllowed(now, lastActionTime, cooldownMs): boolean`
    - `isShiftDurationValid(clockInTime, nowTime, minDurationSeconds): boolean`
    - `isShiftStale(clockIn, now, todayStart, thresholdHours): boolean`
    - `buildAutoTimeoutPayload(clockIn, existingNotes, hasOpenOT): object`
    - _Requirements: 1.1–1.4, 2.2–2.3, 3.1–3.3, 4.3–4.6_

  - [x] 1.2 Write property test: Debounce fires iff value changed or window expired (Property 1)
    - Create `src/stores/__tests__/shouldFireOnScan.property.test.ts`
    - **Property 1: Debounce fires if and only if value changed or window expired**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [x] 1.3 Write property test: isProcessing suppresses all callbacks (Property 2)
    - Add to `src/stores/__tests__/shouldFireOnScan.property.test.ts`
    - **Property 2: isProcessing suppresses all callbacks**
    - **Validates: Requirements 1.4**

  - [x] 1.4 Write property test: Global cooldown gates scan acceptance (Property 3)
    - Create `src/stores/__tests__/isScanAllowed.property.test.ts`
    - **Property 3: Global cooldown gates scan acceptance**
    - **Validates: Requirements 2.2, 2.3**

  - [x] 1.5 Write property test: Minimum shift duration guards clock-out (Property 4)
    - Create `src/stores/__tests__/isShiftDurationValid.property.test.ts`
    - **Property 4: Minimum shift duration guards clock-out**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [x] 1.6 Write property test: Stale shift identification (Property 5)
    - Create `src/stores/__tests__/isShiftStale.property.test.ts`
    - **Property 5: Stale shift identification**
    - **Validates: Requirements 4.3, 4.4, 5.1, 5.2**

  - [x] 1.7 Write property test: Auto-timeout payload correctness (Property 6)
    - Create `src/stores/__tests__/buildAutoTimeoutPayload.property.test.ts`
    - **Property 6: Auto-timeout payload correctness**
    - **Validates: Requirements 4.5, 4.6**

- [x] 2. Checkpoint - Verify pure functions and property tests
  - Ensure all property tests pass (`vitest --run`), ask the user if questions arise.

- [x] 3. Update attendanceStore with hardened auto-timeout and minimum shift guard
  - [x] 3.1 Rewrite auto-timeout logic in `fetchTodayAttendance` to use `isShiftStale` and `buildAutoTimeoutPayload`
    - Replace the current stale-shift block to only close shifts where `clock_in < startOfDay(today)` AND elapsed > 16 hours
    - Use `isShiftStale()` for the filter and `buildAutoTimeoutPayload()` for the update payload
    - Wrap each Supabase update in try/catch — log errors, continue with remaining shifts
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 3.2 Remove the 8h15m auto-close block from `fetchTodayAttendance`
    - Delete the entire `autoCloseThresholdMinutes = 8 * 60 + 15` block and its re-fetch logic
    - _Requirements: 5.1, 5.2_

  - [x] 3.3 Update `clockOut` to use seconds-based minimum shift duration guard
    - Replace the `minutesWorked < 1` check with `elapsedSeconds < 60` using `isShiftDurationValid()`
    - Update error message to: "Cannot clock out within 60 seconds of clocking in. Please try again later."
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Checkpoint - Verify store changes and backward compatibility
  - Run all tests (`vitest --run`) including existing `hoursWorkedCapped`, `mergeAttendanceRecords`, `noSimultaneousShifts`, and `overnightShift` tests to confirm no regressions.
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 5. Add frame-level debounce to QRScanner component
  - [x] 5.1 Update `QRScanner.tsx` to add debounce using `shouldFireOnScan`
    - Add `debounceMs` prop (default 3000) to `QRScannerProps`
    - Add `lastDecodeRef` as a ref (`{ value: string; time: number } | null`)
    - In the ZXing decode callback, use `shouldFireOnScan()` to gate `onScan` invocation
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 6. Update ScanPage with global + per-worker cooldown and overdue badge
  - [x] 6.1 Replace existing scan guards with global + per-worker cooldown
    - Replace `lastScanRef` / `lastActionRef` with `lastActionTimeRef` (number) and `workerCooldownMap` (Map<string, number>)
    - Set `ACTION_COOLDOWN_MS = 10_000`
    - Update `handleScan` to check global cooldown, then per-worker cooldown before processing
    - On success: record both global and per-worker cooldown timestamps
    - _Requirements: 2.1, 2.2, 2.3, 6.1, 6.2, 6.3_

  - [x] 6.2 Add "Overdue" badge to the Currently Working sidebar
    - For each `clocked_in` record, compute elapsed minutes using `differenceInMinutes(now, clock_in)`
    - If ≥ 480 minutes (8 hours), render `<Badge variant="danger">Overdue</Badge>`
    - _Requirements: 5.3_

- [x] 7. Final checkpoint - Full test suite and manual verification
  - Run the complete test suite (`vitest --run`) to ensure all property tests, unit tests, and existing tests pass.
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All 5 pure functions are extracted into `src/lib/attendanceHelpers.ts` for direct property testing without React or Supabase mocking
- Property tests use `fast-check` with ≥ 100 iterations per property
- Each property test maps 1:1 to a correctness property in the design document
- Existing tests in `src/stores/__tests__/` must continue to pass throughout (Requirement 7.2)
- No database schema changes — all new state is ephemeral (React refs, module-level flags)
