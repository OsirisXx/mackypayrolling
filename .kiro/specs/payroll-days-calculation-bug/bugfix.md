# Bugfix Requirements Document

## Introduction

The payroll calculation system incorrectly calculates days worked by dividing total hours (including overtime) by 8, resulting in impossible values exceeding 7 days in a single pay period (Friday-Thursday). Additionally, the scan page needs to re-implement the 8-hour-15-minute auto clock-out feature that was previously removed due to issues with overnight shifts. This bug causes payroll reports to show inflated days worked when workers have overtime hours, leading to confusion and potential payment errors.

**Impact**: Workers with overtime hours show incorrect days worked (e.g., 9 days in a 7-day period), making payroll reports unreliable and difficult to reconcile with actual attendance. Workers who forget to clock out are not automatically clocked out after 8h15m, requiring manual intervention.

**Root Cause**: 
1. The `calculatePayroll` function in `src/pages/PayrollPage.tsx` (lines 190-195) uses `Math.floor(totalHoursWorked / 8)` where `totalHoursWorked` includes both regular hours AND overtime hours, instead of counting unique calendar days from attendance records.
2. The 8h15m auto clock-out feature was removed in the shift-aware-attendance fix to prevent issues with overnight shifts, but the client still needs this feature for same-day shifts.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a worker has attendance records with overtime hours THEN the system calculates days worked as `Math.floor(totalHoursWorked / 8)` where `totalHoursWorked` includes overtime hours

1.2 WHEN a worker works 6 actual days with 24 overtime hours (48 regular + 24 OT = 72 total hours) THEN the system displays 9 days worked (72 ÷ 8 = 9)

1.3 WHEN a worker works 6 actual days with 12 overtime hours (48 regular + 12 OT = 60 total hours) THEN the system displays 7 days worked (60 ÷ 8 = 7.5, floored to 7)

1.4 WHEN the calculated days worked exceeds 7 in a single pay period (Friday-Thursday) THEN the system displays this impossible value without validation

### Expected Behavior (Correct)

2.1 WHEN a worker has attendance records THEN the system SHALL count unique calendar days by extracting distinct dates from `clock_in` timestamps

2.2 WHEN a worker works 6 actual days with 24 overtime hours THEN the system SHALL display 6 days worked (counting unique dates only)

2.3 WHEN a worker works 6 actual days with 12 overtime hours THEN the system SHALL display 6 days worked (counting unique dates only)

2.4 WHEN calculating days worked in a single pay period (Friday-Thursday) THEN the system SHALL ensure the value never exceeds 7 days

2.5 WHEN calculating gross pay THEN the system SHALL use the formula: `(days_worked × daily_rate) + (overtime_hours × hourly_rate)` where days_worked is the count of unique calendar days

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a worker has no overtime hours THEN the system SHALL CONTINUE TO calculate gross pay correctly using the existing payment formula

3.2 WHEN calculating overtime hours THEN the system SHALL CONTINUE TO sum the `overtime_hours` field from attendance records without modification

3.3 WHEN using historical rates from the rate history THEN the system SHALL CONTINUE TO apply the correct daily_rate and hourly_rate for the pay period

3.4 WHEN calculating total hours worked THEN the system SHALL CONTINUE TO sum all `hours_worked` values for display purposes (even though this should not be used for days calculation)

3.5 WHEN a worker has no attendance records in the pay period THEN the system SHALL CONTINUE TO exclude them from the payroll calculation

3.6 WHEN displaying payroll data in the table THEN the system SHALL CONTINUE TO show all existing columns (worker name, days, overtime, rates, gross pay, deductions, net pay)

### Requirement 4: Re-implement Smart Auto Clock-Out with Tiered Thresholds

**User Story:** As a manager, I want the system to automatically clock out workers who forget to clock out, using different time thresholds for same-day shifts (8h15m) and overnight shifts (10h) to balance automation with safety for legitimate overnight workers.

#### Acceptance Criteria

1. WHEN a worker has been clocked in on the current calendar day AND 8 hours and 15 minutes (495 minutes) have elapsed, THE Attendance_Store SHALL automatically clock them out
2. WHEN a worker has been clocked in on a previous calendar day (overnight shift) AND 10 hours (600 minutes) have elapsed, THE Attendance_Store SHALL automatically clock them out
3. WHEN auto-clocking out a worker, THE Attendance_Store SHALL set `clock_out` to exactly 8 hours after `clock_in`, set `hours_worked` to 8, set `overtime_hours` to 0, and set `status` to `clocked_out`
4. WHEN auto-clocking out a same-day worker, THE Attendance_Store SHALL append "Auto-clocked out at 8h15m (same-day shift)" to the `notes` field
5. WHEN auto-clocking out an overnight worker, THE Attendance_Store SHALL append "Auto-clocked out at 10h (overnight shift)" to the `notes` field
6. WHEN a worker has an open OT session (`ot_clock_in` is set but `ot_clock_out` is not), THE Attendance_Store SHALL NOT apply auto clock-out rules
7. WHEN the auto clock-out is triggered, THE Attendance_Store SHALL execute it once per browser session per worker to avoid repeated auto-closures

---

## Bug Condition Derivation

### Bug Condition Function

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type PayrollCalculationInput
         where X = {workerAttendance: AttendanceRecord[], worker: Worker}
  OUTPUT: boolean
  
  // Returns true when the bug condition is met
  // Bug occurs when overtime hours exist, causing inflated days calculation
  totalOvertimeHours ← SUM(X.workerAttendance.overtime_hours)
  
  RETURN totalOvertimeHours > 0
END FUNCTION
```

**Explanation**: The bug manifests when a worker has overtime hours, because the current calculation includes those overtime hours in the total hours used to derive days worked.

### Property Specification: Fix Checking

```pascal
// Property: Fix Checking - Correct Days Calculation
FOR ALL X WHERE isBugCondition(X) DO
  // F'(X) is the fixed calculation function
  result ← calculatePayroll'(X)
  
  // Extract unique calendar days from attendance records
  uniqueDays ← DISTINCT(MAP(X.workerAttendance, a => DATE(a.clock_in)))
  expectedDays ← COUNT(uniqueDays)
  
  ASSERT result.days_worked = expectedDays
  ASSERT result.days_worked ≤ 7
  ASSERT result.gross_pay = (expectedDays × X.worker.daily_rate) + 
                             (SUM(X.workerAttendance.overtime_hours) × X.worker.hourly_rate)
END FOR
```

### Property Specification: Preservation Checking

```pascal
// Property: Preservation Checking - Non-OT Cases Unchanged
FOR ALL X WHERE NOT isBugCondition(X) DO
  // F(X) is the original (unfixed) function
  // F'(X) is the fixed function
  
  originalResult ← calculatePayroll(X)
  fixedResult ← calculatePayroll'(X)
  
  // When no overtime exists, both calculations should produce same result
  // (because hours_worked = days × 8 in this case)
  ASSERT originalResult.days_worked = fixedResult.days_worked
  ASSERT originalResult.gross_pay = fixedResult.gross_pay
END FOR
```

### Counterexample

**Concrete example demonstrating the bug:**

```typescript
// Input
worker = { id: 1, daily_rate: 500, hourly_rate: 62.5 }
workerAttendance = [
  { clock_in: '2025-01-03T08:00:00Z', hours_worked: 12, overtime_hours: 4 },  // FRI
  { clock_in: '2025-01-04T08:00:00Z', hours_worked: 12, overtime_hours: 4 },  // SAT
  { clock_in: '2025-01-05T08:00:00Z', hours_worked: 12, overtime_hours: 4 },  // SUN
  { clock_in: '2025-01-06T08:00:00Z', hours_worked: 12, overtime_hours: 4 },  // MON
  { clock_in: '2025-01-07T08:00:00Z', hours_worked: 12, overtime_hours: 4 },  // TUE
  { clock_in: '2025-01-08T08:00:00Z', hours_worked: 12, overtime_hours: 4 },  // WED
]

// Current (Buggy) Calculation - F(X)
totalHoursWorked = 6 × 12 = 72 hours
days = Math.floor(72 / 8) = 9 days  // WRONG! Shows 9 days in a 7-day period
grossPay = (9 × 500) + (24 × 62.5) = 4500 + 1500 = 6000

// Expected (Fixed) Calculation - F'(X)
uniqueDays = 6 (count distinct dates from clock_in)
days = 6  // CORRECT!
grossPay = (6 × 500) + (24 × 62.5) = 3000 + 1500 = 4500

// Bug Impact: Overstates days by 3, overstates gross pay by 1500
```

---

## Key Definitions

| Concept | Definition | Example |
|---------|------------|---------|
| **C(X)** | Bug Condition - identifies buggy inputs | `SUM(overtime_hours) > 0` |
| **P(result)** | Property - desired behavior for C(X) | `days_worked = COUNT(DISTINCT(DATE(clock_in)))` AND `days_worked ≤ 7` |
| **¬C(X)** | Non-buggy inputs - should be preserved | `SUM(overtime_hours) = 0` (no overtime) |
| **F** | Original (unfixed) function | `Math.floor(totalHoursWorked / 8)` |
| **F'** | Fixed function | `COUNT(DISTINCT(DATE(clock_in)))` |
| **Counterexample** | Concrete example demonstrating the bug | Worker with 6 days + 24 OT hours shows 9 days |
