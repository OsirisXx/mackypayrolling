# Requirements Document

## Introduction

The Macrock Limestone attendance system uses a QR-code scanner to clock workers in and out across three 8-hour shifts: Day (6 AM–2 PM), Afternoon (2 PM–10 PM), and Night (10 PM–6 AM). Several reliability issues have been reported in production — most critically, the QR scanner fires on every video frame, causing a single scan to trigger both a clock-in and an immediate clock-out. Additionally, the auto-timeout logic for forgotten clock-outs is too aggressive and has caused data loss for legitimate overnight shifts. This spec hardens the scan pipeline and auto-timeout logic to be robust for continuous 24-hour, 3-shift operations without breaking existing payroll calculations or database schema.

All changes described here are backward-compatible with the existing scan page, attendance records, payroll calculations, and database schema.

## Glossary

- **QR_Scanner**: The React component (`QRScanner.tsx`) that uses the ZXing library to continuously decode QR codes from a video stream and invoke an `onScan` callback.
- **Scan_Page**: The React page (`ScanPage.tsx`) that receives decoded QR codes from the QR_Scanner and orchestrates clock-in, clock-out, and OT operations.
- **Attendance_Store**: The Zustand store (`attendanceStore.ts`) that manages attendance state, provides clock-in/clock-out operations, and communicates with Supabase.
- **Scan_Debounce_Window**: A configurable time window (in milliseconds) during which the QR_Scanner suppresses repeated `onScan` callbacks for the same QR code value. Default: 3000 ms.
- **Action_Cooldown**: A configurable time window (in milliseconds) during which the Scan_Page ignores all incoming scans after a successful clock-in, clock-out, or OT action. Default: 10000 ms (10 seconds).
- **Minimum_Shift_Duration**: A configurable minimum elapsed time (in seconds) between clock-in and clock-out, below which the Attendance_Store rejects the clock-out. Default: 60 seconds.
- **Stale_Shift_Threshold**: The number of hours after `clock_in` beyond which an open shift is considered stale and eligible for auto-timeout. Default: 16 hours.
- **Auto_Timeout**: The process of automatically closing a stale open shift by setting `clock_out` to 8 hours after `clock_in`, marking it `clocked_out`, and appending an audit note.
- **Active_Shift**: An attendance record with `status = 'clocked_in'` and no `clock_out` value.
- **Session_Flag**: A module-level boolean that tracks whether Auto_Timeout has already executed in the current browser session.

## Requirements

### Requirement 1: QR Scanner Frame-Level Debounce

**User Story:** As a worker, I want to hold my QR code in front of the camera without triggering multiple scan events, so that my attendance is recorded exactly once per scan gesture.

#### Acceptance Criteria

1. WHEN the QR_Scanner decodes a QR code value that is identical to the previously decoded value, AND the time elapsed since the previous decode is less than the Scan_Debounce_Window, THE QR_Scanner SHALL suppress the `onScan` callback and not invoke it.
2. WHEN the QR_Scanner decodes a QR code value that differs from the previously decoded value, THE QR_Scanner SHALL invoke the `onScan` callback immediately regardless of the Scan_Debounce_Window.
3. WHEN the QR_Scanner decodes a QR code value and the time elapsed since the previous decode of the same value exceeds the Scan_Debounce_Window, THE QR_Scanner SHALL invoke the `onScan` callback.
4. WHILE the `isProcessing` prop is true, THE QR_Scanner SHALL suppress all `onScan` callbacks regardless of debounce state.

### Requirement 2: Post-Action Global Scan Cooldown

**User Story:** As a manager, I want the scan page to block all scans for a reasonable period after any successful action, so that a worker's QR code cannot accidentally trigger a second action while the success message is still showing.

#### Acceptance Criteria

1. WHEN a clock-in, clock-out, quota completion, OT clock-in, or OT clock-out action completes successfully, THE Scan_Page SHALL record the current timestamp as the last successful action time.
2. WHILE the time elapsed since the last successful action is less than the Action_Cooldown, THE Scan_Page SHALL ignore all incoming scan events from the QR_Scanner.
3. WHEN the Action_Cooldown period expires, THE Scan_Page SHALL resume accepting scan events from the QR_Scanner.

### Requirement 3: Minimum Shift Duration Guard

**User Story:** As a manager, I want the system to reject clock-outs that happen within seconds of a clock-in, so that accidental double-fires at the store level cannot create zero-duration shifts.

#### Acceptance Criteria

1. WHEN `clockOut` is called for an attendance record, AND the elapsed time between `clock_in` and the current time is less than the Minimum_Shift_Duration, THE Attendance_Store SHALL reject the clock-out with a descriptive error message.
2. WHEN `clockOut` is called for an attendance record, AND the elapsed time between `clock_in` and the current time is greater than or equal to the Minimum_Shift_Duration, THE Attendance_Store SHALL proceed with the clock-out normally.
3. THE Attendance_Store SHALL use the Minimum_Shift_Duration value of 60 seconds as the default threshold.

### Requirement 4: Smart Auto-Timeout for Stale Shifts

**User Story:** As a manager, I want the system to automatically close only genuinely forgotten shifts without touching legitimate overnight or recent shifts, so that data is not lost for workers on the Night shift.

#### Acceptance Criteria

1. WHEN the Attendance_Store fetches today's attendance and the Session_Flag is false, THE Attendance_Store SHALL execute the Auto_Timeout process exactly once and set the Session_Flag to true.
2. WHEN the Session_Flag is true, THE Attendance_Store SHALL skip the Auto_Timeout process on subsequent fetches within the same browser session.
3. WHEN evaluating open shifts for Auto_Timeout, THE Attendance_Store SHALL only close shifts where the elapsed time since `clock_in` exceeds the Stale_Shift_Threshold of 16 hours. This ensures a Night shift worker who clocked in at 10 PM is safe until at least 2 PM the next day, giving managers ample time to manually close the shift.
4. WHEN evaluating open shifts for Auto_Timeout, THE Attendance_Store SHALL not close any shift where `clock_in` occurred within the current calendar day, regardless of elapsed time.
5. WHEN a shift is closed by Auto_Timeout, THE Attendance_Store SHALL set `clock_out` to exactly 8 hours after `clock_in`, set `hours_worked` to 8, set `status` to `clocked_out`, and append the text "Auto-timed out (forgot to clock out)" to the `notes` field.
6. WHEN a shift is closed by Auto_Timeout and the shift has an open OT session (`ot_clock_in` is set but `ot_clock_out` is not), THE Attendance_Store SHALL also set `ot_clock_out` to the same auto-generated `clock_out` timestamp.
7. IF the Auto_Timeout process encounters a database error while closing a stale shift, THEN THE Attendance_Store SHALL log the error and continue processing remaining stale shifts without interrupting the fetch operation.

### Requirement 5: Replace Aggressive 8h15m Auto-Close with Visual Warning

**User Story:** As a manager, I want the system to stop automatically closing shifts that are 8 hours and 15 minutes old on the current day, and instead show me a visual warning so I can decide whether to clock the worker out manually or approve OT.

#### Acceptance Criteria

1. THE Attendance_Store SHALL not automatically close attendance records based solely on the elapsed time since `clock_in` for records where `clock_in` falls within the current calendar day.
2. WHEN a shift exceeds 8 hours of elapsed time on the current day, THE Attendance_Store SHALL leave the record in `clocked_in` status until a manual clock-out or the next-session Auto_Timeout process handles it.
3. WHEN a worker's Active_Shift has been open for more than 8 hours, THE Scan_Page SHALL display a visual "Overdue" indicator next to that worker in the "Currently Working" sidebar.
4. WHEN a shift that was not manually clocked out persists into the next browser session, THE Attendance_Store SHALL evaluate it under the Smart Auto-Timeout rules (Requirement 4) and close it if it exceeds the Stale_Shift_Threshold.

### Requirement 6: Per-Worker Scan Cooldown in Scan Page

**User Story:** As a manager, I want the system to prevent the same worker from being clocked out immediately after being clocked in by a rapid re-scan, so that the double-fire problem is eliminated at the page level as a defense-in-depth measure.

#### Acceptance Criteria

1. WHEN a worker is successfully clocked in via QR scan, THE Scan_Page SHALL record that worker's ID and the current timestamp in a per-worker cooldown map.
2. WHILE a worker's entry exists in the per-worker cooldown map AND the elapsed time since their last successful action is less than the Action_Cooldown, THE Scan_Page SHALL ignore scan events for that specific worker.
3. WHEN the Action_Cooldown period expires for a worker, THE Scan_Page SHALL allow scan events for that worker to be processed again.

### Requirement 7: Backward Compatibility

**User Story:** As a system administrator, I want all scan hardening changes to be backward-compatible with the existing database schema, payroll calculations, and attendance records, so that the production system continues to operate without data migration or downtime.

#### Acceptance Criteria

1. THE Attendance_Store SHALL not require any changes to the existing database schema (tables, columns, indexes, or constraints).
2. THE Attendance_Store SHALL preserve the existing `hours_worked` calculation logic: regular hours capped at 8, with a 15-minute grace period rounding 7.75+ hours up to 8.
3. THE Attendance_Store SHALL preserve the existing overtime calculation logic: OT hours are tracked separately via `ot_clock_in`/`ot_clock_out` fields and require manager approval.
4. WHEN the Scan_Page or Attendance_Store is updated, THE PayrollPage SHALL continue to compute payroll from attendance records without any code changes.
