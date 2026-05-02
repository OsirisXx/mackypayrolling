# Payroll Days Calculation Bug - Design Document

## Overview

The payroll calculation system incorrectly calculates days worked by dividing total hours (including overtime) by 8, resulting in impossible values exceeding 7 days in a single pay period (Friday-Thursday). This design document outlines the technical approach to fix this bug by counting unique calendar days from attendance records instead of deriving days from total hours.

**Fix Strategy**: Replace the flawed `Math.floor(totalHoursWorked / 8)` calculation with a count of unique calendar days extracted from `clock_in` timestamps. Additionally, enhance the UI with a daily breakdown view showing which specific days (FRI-THU) were worked, providing transparency and validation for the corrected calculation.

**Scope**: This fix affects the `calculatePayroll` function in `src/pages/PayrollPage.tsx` (lines 190-195) and adds a new daily breakdown visualization component. The payment formula `(days × daily_rate) + (OT_hours × hourly_rate)` remains unchanged.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a worker has overtime hours, causing the calculation to inflate days worked by including OT hours in the total
- **Property (P)**: The desired behavior - days worked should equal the count of unique calendar days from attendance records, never exceeding 7 in a weekly period
- **Preservation**: Existing payment formula, overtime calculation, rate history lookup, and all other payroll logic must remain unchanged
- **calculatePayroll**: The function in `src/pages/PayrollPage.tsx` (lines 145-240) that computes payroll data for all active workers
- **workerAttendance**: Array of attendance records filtered for a specific worker within the pay period
- **totalHoursWorked**: Sum of `hours_worked` field from all attendance records (currently includes both regular and overtime hours)
- **uniqueDays**: Set of distinct calendar dates extracted from `clock_in` timestamps
- **Daily Breakdown View**: New UI component showing FRI-THU columns with visual indicators for which days were worked

## Bug Details

### Bug Condition

The bug manifests when a worker has attendance records with overtime hours. The `calculatePayroll` function uses `Math.floor(totalHoursWorked / 8)` where `totalHoursWorked` includes both regular hours AND overtime hours, instead of counting unique calendar days from attendance records.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { workerAttendance: AttendanceRecord[], worker: Worker }
  OUTPUT: boolean
  
  totalOvertimeHours ← SUM(input.workerAttendance.overtime_hours)
  
  RETURN totalOvertimeHours > 0
         AND input.workerAttendance.length > 0
END FUNCTION
```

### Examples

**Example 1: Worker with 6 days + 24 OT hours**
- Actual days worked: 6 (FRI, SAT, SUN, MON, TUE, WED)
- Regular hours: 48 (6 days × 8 hours)
- Overtime hours: 24 (4 hours per day × 6 days)
- Total hours: 72
- **Current (buggy) calculation**: `Math.floor(72 / 8) = 9 days` ❌
- **Expected (fixed) calculation**: `6 days` ✓

**Example 2: Worker with 5 days + 10 OT hours**
- Actual days worked: 5 (FRI, SAT, SUN, MON, TUE)
- Regular hours: 40 (5 days × 8 hours)
- Overtime hours: 10 (2 hours per day × 5 days)
- Total hours: 50
- **Current (buggy) calculation**: `Math.floor(50 / 8) = 6 days` ❌
- **Expected (fixed) calculation**: `5 days` ✓

**Example 3: Worker with 7 days + 14 OT hours**
- Actual days worked: 7 (FRI, SAT, SUN, MON, TUE, WED, THU)
- Regular hours: 56 (7 days × 8 hours)
- Overtime hours: 14 (2 hours per day × 7 days)
- Total hours: 70
- **Current (buggy) calculation**: `Math.floor(70 / 8) = 8 days` ❌ (impossible in 7-day period!)
- **Expected (fixed) calculation**: `7 days` ✓

**Edge Case: Worker with no overtime**
- Actual days worked: 6
- Regular hours: 48 (6 days × 8 hours)
- Overtime hours: 0
- Total hours: 48
- **Current calculation**: `Math.floor(48 / 8) = 6 days` ✓
- **Expected calculation**: `6 days` ✓
- **Note**: When there's no overtime, both calculations produce the same result (preservation requirement)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Payment formula `(days × daily_rate) + (OT_hours × hourly_rate)` must continue to work exactly as before
- Overtime hours calculation (summing `overtime_hours` field) must remain unchanged
- Historical rate lookup from `worker_rates` table must continue to work
- All other payroll calculations (bonus, SSS, deductions, subtotal, total) must remain unchanged
- Workers with no attendance records must continue to be excluded from payroll
- Payroll table display with all existing columns must remain unchanged
- Print and export functionality must continue to work
- Manual adjustments (days_override, ot_override, daily_rate_override) must continue to work

**Scope:**
All inputs that do NOT involve overtime hours (workers with zero overtime) should produce identical results before and after the fix. This includes:
- Days worked calculation for non-OT workers
- Gross pay calculation for non-OT workers
- All display and formatting logic

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is:

1. **Incorrect Days Calculation Logic**: The function uses `Math.floor(totalHoursWorked / 8)` which assumes that dividing total hours by 8 gives the number of days worked. This assumption is ONLY valid when workers have exactly 8 hours per day with no overtime.

2. **Overtime Hours Included in Total**: The `totalHoursWorked` variable sums ALL `hours_worked` values, which includes both regular hours AND overtime hours. When a worker has 12-hour shifts (8 regular + 4 OT), the calculation treats this as 1.5 days instead of 1 day.

3. **Missing Calendar Day Logic**: The code never extracts or counts unique calendar dates from the `clock_in` timestamps, which is the correct way to determine days worked.

4. **No Validation**: The code doesn't validate that days worked cannot exceed 7 in a weekly (FRI-THU) pay period, allowing impossible values like 9 days to be displayed.

## Correctness Properties

Property 1: Bug Condition - Correct Days Calculation with Overtime

_For any_ payroll calculation input where a worker has overtime hours (isBugCondition returns true), the fixed calculatePayroll function SHALL count unique calendar days by extracting distinct dates from clock_in timestamps, ensuring days_worked equals the count of unique dates and never exceeds 7 in a weekly period.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Non-Overtime Calculation Unchanged

_For any_ payroll calculation input where a worker has NO overtime hours (isBugCondition returns false), the fixed calculatePayroll function SHALL produce exactly the same days_worked and gross_pay values as the original function, preserving all existing behavior for workers without overtime.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

**File**: `src/pages/PayrollPage.tsx`

**Function**: `calculatePayroll` (lines 145-240)

**Specific Changes**:

1. **Replace Days Calculation Logic** (lines 190-195):
   ```typescript
   // BEFORE (Buggy):
   const totalHoursWorked = workerAttendance.reduce(
     (sum, a) => sum + (a.hours_worked || 0),
     0
   );
   const days = Math.floor(totalHoursWorked / 8);
   
   // AFTER (Fixed):
   // Count unique calendar days from clock_in timestamps
   const uniqueDays = new Set(
     workerAttendance.map((a) => {
       const date = new Date(a.clock_in);
       return format(date, 'yyyy-MM-dd'); // Use date-fns format for consistency
     })
   );
   const days = uniqueDays.size;
   
   // Keep totalHoursWorked for display purposes (if needed elsewhere)
   const totalHoursWorked = workerAttendance.reduce(
     (sum, a) => sum + (a.hours_worked || 0),
     0
   );
   ```

2. **Add Daily Breakdown Data Structure**:
   ```typescript
   // Add to PayrollData interface (lines 47-55):
   interface PayrollData {
     worker: Worker;
     days: number;
     overtime: number;
     overtimePay: number;
     dailyRate: number;
     bonus: number;
     sssDeduction: number;
     total: number;
     dailyBreakdown?: DailyBreakdown; // NEW: Optional daily breakdown
   }
   
   interface DailyBreakdown {
     fri: boolean;
     sat: boolean;
     sun: boolean;
     mon: boolean;
     tue: boolean;
     wed: boolean;
     thu: boolean;
   }
   ```

3. **Calculate Daily Breakdown** (add after days calculation):
   ```typescript
   // Calculate which days of the week were worked
   const dailyBreakdown: DailyBreakdown = {
     fri: false,
     sat: false,
     sun: false,
     mon: false,
     tue: false,
     wed: false,
     thu: false
   };
   
   workerAttendance.forEach((a) => {
     const date = new Date(a.clock_in);
     const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
     
     switch (dayOfWeek) {
       case 5: dailyBreakdown.fri = true; break; // Friday
       case 6: dailyBreakdown.sat = true; break; // Saturday
       case 0: dailyBreakdown.sun = true; break; // Sunday
       case 1: dailyBreakdown.mon = true; break; // Monday
       case 2: dailyBreakdown.tue = true; break; // Tuesday
       case 3: dailyBreakdown.wed = true; break; // Wednesday
       case 4: dailyBreakdown.thu = true; break; // Thursday
     }
   });
   ```

4. **Add Daily Breakdown to Return Object**:
   ```typescript
   return {
     worker,
     days,
     overtime,
     overtimePay,
     dailyRate,
     bonus,
     sssDeduction,
     total,
     dailyBreakdown // NEW: Include breakdown data
   };
   ```

5. **Add Daily Breakdown Column to Table** (after "DAYS" column):
   ```typescript
   // In table header (around line 820):
   <th className="relative px-1 py-2 text-center text-sm font-bold text-gray-700 border-r border-gray-300 select-none">
     DAYS
     <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400" onMouseDown={(e) => handleMouseDown(e, 'days')} />
   </th>
   <th className="px-1 py-2 text-center text-xs font-bold text-gray-700 border-r border-gray-300">
     <div className="flex justify-center gap-0.5">
       <span className="w-6">F</span>
       <span className="w-6">S</span>
       <span className="w-6">S</span>
       <span className="w-6">M</span>
       <span className="w-6">T</span>
       <span className="w-6">W</span>
       <span className="w-6">T</span>
     </div>
   </th>
   
   // In table body (around line 890):
   <td className="px-1 py-1.5 text-sm text-center text-gray-900 border-r border-gray-200">
     {isAdmin ? (
       <input
         type="number"
         value={edited.days !== null ? edited.days : item.days}
         onChange={(e) => updateWorkerValue(item.worker.id, 'days', parseFloat(e.target.value) || 0)}
         className="w-full px-1 py-0.5 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 print:border-0"
         min="0"
       />
     ) : (
       <span>{edited.days !== null ? edited.days : item.days}</span>
     )}
   </td>
   <td className="px-1 py-1.5 text-xs text-center border-r border-gray-200">
     <div className="flex justify-center gap-0.5">
       <span className={`w-6 h-6 flex items-center justify-center rounded ${item.dailyBreakdown?.fri ? 'bg-green-500 text-white font-bold' : 'bg-gray-100 text-gray-300'}`}>
         {item.dailyBreakdown?.fri ? '✓' : '·'}
       </span>
       <span className={`w-6 h-6 flex items-center justify-center rounded ${item.dailyBreakdown?.sat ? 'bg-green-500 text-white font-bold' : 'bg-gray-100 text-gray-300'}`}>
         {item.dailyBreakdown?.sat ? '✓' : '·'}
       </span>
       <span className={`w-6 h-6 flex items-center justify-center rounded ${item.dailyBreakdown?.sun ? 'bg-green-500 text-white font-bold' : 'bg-gray-100 text-gray-300'}`}>
         {item.dailyBreakdown?.sun ? '✓' : '·'}
       </span>
       <span className={`w-6 h-6 flex items-center justify-center rounded ${item.dailyBreakdown?.mon ? 'bg-green-500 text-white font-bold' : 'bg-gray-100 text-gray-300'}`}>
         {item.dailyBreakdown?.mon ? '✓' : '·'}
       </span>
       <span className={`w-6 h-6 flex items-center justify-center rounded ${item.dailyBreakdown?.tue ? 'bg-green-500 text-white font-bold' : 'bg-gray-100 text-gray-300'}`}>
         {item.dailyBreakdown?.tue ? '✓' : '·'}
       </span>
       <span className={`w-6 h-6 flex items-center justify-center rounded ${item.dailyBreakdown?.wed ? 'bg-green-500 text-white font-bold' : 'bg-gray-100 text-gray-300'}`}>
         {item.dailyBreakdown?.wed ? '✓' : '·'}
       </span>
       <span className={`w-6 h-6 flex items-center justify-center rounded ${item.dailyBreakdown?.thu ? 'bg-green-500 text-white font-bold' : 'bg-gray-100 text-gray-300'}`}>
         {item.dailyBreakdown?.thu ? '✓' : '·'}
       </span>
     </div>
   </td>
   ```

6. **Update Column Width Configuration** (lines 13-26):
   ```typescript
   const COL_RATIOS = {
     name: 18,
     days: 8,
     breakdown: 12, // NEW: Daily breakdown column
     ot: 8,
     rate: 8,
     bonus: 8,
     sss: 8,
     ded: 8,
     subtotal: 12,
     total: 12,
     signature: 0,
     actions: 10
   };
   ```

7. **Update Print Function** (add daily breakdown to print output):
   ```typescript
   // In handlePrint function (around line 320):
   printWindow.document.write('<th>DAYS</th>');
   printWindow.document.write('<th style="font-size: 9px;">F S S M T W T</th>');
   
   // In print loop (around line 350):
   printWindow.document.write(`<td>${days}</td>`);
   const breakdown = item.dailyBreakdown;
   const breakdownStr = [
     breakdown?.fri ? '✓' : '·',
     breakdown?.sat ? '✓' : '·',
     breakdown?.sun ? '✓' : '·',
     breakdown?.mon ? '✓' : '·',
     breakdown?.tue ? '✓' : '·',
     breakdown?.wed ? '✓' : '·',
     breakdown?.thu ? '✓' : '·'
   ].join(' ');
   printWindow.document.write(`<td style="font-size: 9px;">${breakdownStr}</td>`);
   ```

### Backward Compatibility

The fix maintains complete backward compatibility:

1. **Payment Formula Unchanged**: The formula `(days × daily_rate) + (OT_hours × hourly_rate)` remains exactly the same. Only the source of the `days` value changes (from flawed calculation to correct calendar day count).

2. **Manual Overrides Preserved**: The `days_override` field in `payroll_adjustments` table continues to work. When an admin manually edits days, that override takes precedence over the calculated value.

3. **Historical Data Unaffected**: Existing payroll records in the database are not modified. Only future payroll calculations use the new logic.

4. **Rate History Preserved**: The lookup of historical rates from `worker_rates` table continues to work exactly as before.

5. **Display Logic Unchanged**: All existing columns, formatting, sorting, and filtering logic remains unchanged. The daily breakdown is an additional column, not a replacement.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that calculate payroll for workers with overtime hours using the UNFIXED code. Run these tests to observe failures and understand the root cause. Tests should use real attendance data patterns from the system.

**Test Cases**:
1. **High Overtime Worker Test**: Worker with 6 actual days + 24 OT hours (will show 9 days on unfixed code)
   - Input: 6 attendance records, each with 12 hours_worked (8 regular + 4 OT)
   - Expected failure: days = 9 instead of 6
   - Validates: Bug manifests when OT hours are high

2. **Moderate Overtime Worker Test**: Worker with 5 actual days + 10 OT hours (will show 6 days on unfixed code)
   - Input: 5 attendance records, each with 10 hours_worked (8 regular + 2 OT)
   - Expected failure: days = 6 instead of 5
   - Validates: Bug manifests even with moderate OT

3. **Full Week with Overtime Test**: Worker with 7 actual days + 14 OT hours (will show 8 days on unfixed code)
   - Input: 7 attendance records (FRI-THU), each with 10 hours_worked
   - Expected failure: days = 8 (impossible!) instead of 7
   - Validates: Bug can produce impossible values exceeding 7 days

4. **No Overtime Worker Test**: Worker with 6 actual days + 0 OT hours (should show 6 days on unfixed code)
   - Input: 6 attendance records, each with 8 hours_worked (no OT)
   - Expected: days = 6 (correct even on unfixed code)
   - Validates: Bug does NOT manifest when there's no overtime

**Expected Counterexamples**:
- Days worked values exceeding actual calendar days worked
- Days worked values exceeding 7 in a weekly period
- Gross pay calculations inflated due to incorrect days count
- Possible causes: OT hours included in totalHoursWorked, division by 8 assumes no OT

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (workers with overtime), the fixed function produces the expected behavior (correct days count).

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  // input = { workerAttendance: AttendanceRecord[], worker: Worker }
  result ← calculatePayroll_fixed(input)
  
  // Extract unique calendar days
  uniqueDays ← DISTINCT(MAP(input.workerAttendance, a => DATE(a.clock_in)))
  expectedDays ← COUNT(uniqueDays)
  
  // Verify days calculation
  ASSERT result.days = expectedDays
  ASSERT result.days ≤ 7
  
  // Verify payment formula still works
  expectedGrossPay ← (expectedDays × input.worker.daily_rate) + 
                     (SUM(input.workerAttendance.overtime_hours) × input.worker.hourly_rate)
  ASSERT result.gross_pay = expectedGrossPay
  
  // Verify daily breakdown matches attendance
  FOR EACH day IN ['fri', 'sat', 'sun', 'mon', 'tue', 'wed', 'thu'] DO
    hasAttendanceOnDay ← EXISTS(input.workerAttendance, a => DAY_OF_WEEK(a.clock_in) = day)
    ASSERT result.dailyBreakdown[day] = hasAttendanceOnDay
  END FOR
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (workers with no overtime), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  // input = { workerAttendance: AttendanceRecord[], worker: Worker }
  
  originalResult ← calculatePayroll_original(input)
  fixedResult ← calculatePayroll_fixed(input)
  
  // When no overtime exists, both calculations should produce same result
  // (because hours_worked = days × 8 in this case)
  ASSERT originalResult.days = fixedResult.days
  ASSERT originalResult.gross_pay = fixedResult.gross_pay
  ASSERT originalResult.overtime = fixedResult.overtime
  ASSERT originalResult.total = fixedResult.total
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for workers without overtime, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Zero Overtime Preservation**: Verify workers with 0 OT hours get same days/pay before and after fix
2. **Partial Week Preservation**: Verify workers with 3-4 days and no OT get same results
3. **Full Week Preservation**: Verify workers with 7 days and no OT get same results
4. **Empty Attendance Preservation**: Verify workers with no attendance records are excluded

### Unit Tests

**Test File**: `src/pages/__tests__/PayrollPage.unit.test.ts`

**Test Cases**:
1. **Unique Days Calculation**:
   - Test that days are counted from unique calendar dates
   - Test with attendance records on same day (should count as 1 day)
   - Test with attendance records spanning multiple days

2. **Daily Breakdown Calculation**:
   - Test that each day of week (FRI-THU) is correctly identified
   - Test with attendance on all 7 days
   - Test with attendance on partial week (e.g., FRI-MON only)

3. **Edge Cases**:
   - Worker with no attendance records (should be excluded)
   - Worker with 1 day worked
   - Worker with 7 days worked (maximum)
   - Worker with attendance at midnight (boundary case)

4. **Payment Formula Verification**:
   - Test that gross pay = (days × daily_rate) + (OT_hours × hourly_rate)
   - Test with various combinations of days and OT hours
   - Test with manual overrides (days_override, ot_override)

5. **Historical Rate Integration**:
   - Test that historical rates are used when available
   - Test fallback to current worker rate when no history exists

### Property-Based Tests

**Test File**: `src/pages/__tests__/PayrollPage.property.test.ts`

**Property 1: Days Never Exceed Calendar Days**
```typescript
// Generate random attendance records for a worker
// Verify that calculated days ≤ number of unique calendar days in attendance
fc.assert(
  fc.property(
    fc.array(attendanceRecordArbitrary, { minLength: 1, maxLength: 20 }),
    (attendance) => {
      const result = calculatePayroll({ workerAttendance: attendance, worker: testWorker });
      const uniqueDays = new Set(attendance.map(a => format(new Date(a.clock_in), 'yyyy-MM-dd')));
      return result.days <= uniqueDays.size;
    }
  )
);
```

**Property 2: Days Never Exceed 7 in Weekly Period**
```typescript
// Generate random attendance records within a FRI-THU period
// Verify that calculated days ≤ 7
fc.assert(
  fc.property(
    fc.array(attendanceInWeeklyPeriodArbitrary, { minLength: 1, maxLength: 30 }),
    (attendance) => {
      const result = calculatePayroll({ workerAttendance: attendance, worker: testWorker });
      return result.days <= 7;
    }
  )
);
```

**Property 3: Preservation for Zero Overtime**
```typescript
// Generate random attendance records with NO overtime
// Verify that fixed calculation matches original calculation
fc.assert(
  fc.property(
    fc.array(attendanceWithoutOvertimeArbitrary, { minLength: 1, maxLength: 10 }),
    (attendance) => {
      const originalResult = calculatePayroll_original({ workerAttendance: attendance, worker: testWorker });
      const fixedResult = calculatePayroll_fixed({ workerAttendance: attendance, worker: testWorker });
      return originalResult.days === fixedResult.days &&
             originalResult.gross_pay === fixedResult.gross_pay;
    }
  )
);
```

**Property 4: Daily Breakdown Consistency**
```typescript
// Generate random attendance records
// Verify that daily breakdown matches actual attendance days
fc.assert(
  fc.property(
    fc.array(attendanceRecordArbitrary, { minLength: 1, maxLength: 20 }),
    (attendance) => {
      const result = calculatePayroll({ workerAttendance: attendance, worker: testWorker });
      const daysWorked = new Set(attendance.map(a => new Date(a.clock_in).getDay()));
      
      return (
        (result.dailyBreakdown.fri === daysWorked.has(5)) &&
        (result.dailyBreakdown.sat === daysWorked.has(6)) &&
        (result.dailyBreakdown.sun === daysWorked.has(0)) &&
        (result.dailyBreakdown.mon === daysWorked.has(1)) &&
        (result.dailyBreakdown.tue === daysWorked.has(2)) &&
        (result.dailyBreakdown.wed === daysWorked.has(3)) &&
        (result.dailyBreakdown.thu === daysWorked.has(4))
      );
    }
  )
);
```

### Integration Tests

**Test File**: `src/pages/__tests__/PayrollPage.integration.test.ts`

**Test Cases**:
1. **Full Payroll Generation Flow**:
   - Create test workers and attendance records in test database
   - Generate payroll for a weekly period
   - Verify days calculation is correct for all workers
   - Verify daily breakdown is displayed correctly in UI

2. **Manual Override Integration**:
   - Generate payroll with calculated days
   - Apply manual days_override
   - Verify override takes precedence
   - Verify daily breakdown still shows actual attendance

3. **Print Function Integration**:
   - Generate payroll with daily breakdown
   - Trigger print function
   - Verify print output includes daily breakdown column
   - Verify formatting is correct

4. **Historical Rate Integration**:
   - Create worker with rate history
   - Generate payroll for period with historical rate
   - Verify correct rate is used
   - Verify days calculation uses historical rate for payment

5. **Multi-Worker Scenario**:
   - Create multiple workers with varying attendance patterns
   - Some with overtime, some without
   - Generate payroll for all workers
   - Verify each worker's days are calculated correctly
   - Verify preservation for workers without overtime
