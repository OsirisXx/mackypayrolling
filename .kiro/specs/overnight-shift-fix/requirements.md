# Requirements Document

## Introduction

The attendance management system has a bug where overnight shifts (clock-in during the afternoon, clock-out after midnight) are not handled correctly. The system's `fetchTodayAttendance()` filters records by the current day's date range on the `clock_in` field, so once midnight passes, open shifts from the previous day disappear from `todayRecords`. This causes `getActiveAttendance()`, `clockIn()`, `clockOut()`, `otClockIn()`, and `otClockOut()` to fail for cross-midnight scenarios — creating duplicate clock-ins instead of properly clocking workers out.

## Glossary

- **Attendance_Store**: The Zustand store (`attendanceStore.ts`) that manages attendance state and provides clock-in/clock-out operations.
- **Today_Records**: The in-memory array of attendance records used by the Attendance_Store for the current working view.
- **Active_Shift**: An attendance record with `status = 'clocked_in'` and no `clock_out` value, regardless of which calendar day the `clock_in` occurred.
- **Overnight_Shift**: A shift where `clock_in` occurs on one calendar day and `clock_out` occurs on the following calendar day (after midnight).
- **Scan_Page**: The React page (`ScanPage.tsx`) that handles QR code scanning and determines whether to clock a worker in or out.
- **OT_Session**: An overtime period tracked by `ot_clock_in` and `ot_clock_out` fields on an attendance record, requiring manager approval.

## Requirements

### Requirement 1: Fetch Open Shifts Across Day Boundaries

**User Story:** As a manager, I want the system to load all open (unclosed) shifts alongside today's records, so that workers who clocked in yesterday can still be clocked out after midnight.

#### Acceptance Criteria

1. WHEN the Attendance_Store fetches today's attendance, THE Attendance_Store SHALL also retrieve all attendance records with `status = 'clocked_in'` regardless of the `clock_in` date.
2. WHEN open shifts from previous days are fetched, THE Attendance_Store SHALL merge those records into Today_Records without creating duplicates.
3. WHEN a previously open shift is closed (clocked out), THE Attendance_Store SHALL update the record in Today_Records to reflect the new status.

### Requirement 2: Detect Active Shifts Across Day Boundaries

**User Story:** As a manager, I want the system to find a worker's active shift even if it started on a previous day, so that scanning their QR code after midnight triggers a clock-out instead of a new clock-in.

#### Acceptance Criteria

1. WHEN `getActiveAttendance` is called for a worker, THE Attendance_Store SHALL search all records in Today_Records including open shifts from previous days.
2. WHEN a worker has an Active_Shift from a previous day, THE Attendance_Store SHALL return that record as the active attendance.

### Requirement 3: Prevent Duplicate Clock-Ins for Open Shifts

**User Story:** As a manager, I want the system to prevent creating a new clock-in when a worker already has an open shift from a previous day, so that duplicate records are not created.

#### Acceptance Criteria

1. WHEN a worker with an existing Active_Shift scans their QR code, THE Attendance_Store SHALL detect the open shift and prevent a new clock-in.
2. WHEN a duplicate clock-in is prevented, THE Scan_Page SHALL present the clock-out options for the existing Active_Shift instead.

### Requirement 4: Clock Out Overnight Shifts

**User Story:** As a manager, I want to clock out a worker whose shift started on a previous day, so that overnight shifts are properly closed with correct hours.

#### Acceptance Criteria

1. WHEN `clockOut` is called for an attendance record from a previous day, THE Attendance_Store SHALL locate the record in Today_Records and close the shift.
2. WHEN an Overnight_Shift is clocked out, THE Attendance_Store SHALL calculate `hours_worked` using the difference between `clock_in` and `clock_out` timestamps, capping regular hours at 8.
3. WHEN an Overnight_Shift is clocked out, THE Attendance_Store SHALL update the record status to `clocked_out` in both the local state and the database.

### Requirement 5: Handle OT Across Day Boundaries

**User Story:** As a manager, I want overtime clock-in and clock-out to work for shifts that span midnight, so that OT tracking is accurate for overnight workers.

#### Acceptance Criteria

1. WHEN `otClockIn` is called for a worker with an Active_Shift from a previous day, THE Attendance_Store SHALL find the record and start the OT session.
2. WHEN `otClockOut` is called for a worker with an active OT session on a previous day's record, THE Attendance_Store SHALL find the record and close the OT session with correct overtime hours.

### Requirement 6: Display Overnight Workers in Currently Working Sidebar

**User Story:** As a manager, I want the "Currently Working" sidebar to show all workers with open shifts including those from previous days, so that I have an accurate view of who is still on the clock.

#### Acceptance Criteria

1. WHEN the Scan_Page renders the "Currently Working" list, THE Scan_Page SHALL display all workers with `status = 'clocked_in'` from Today_Records, including those whose shifts started on a previous day.
2. WHEN an overnight worker's shift is displayed, THE Scan_Page SHALL show the correct clock-in time from the previous day.
