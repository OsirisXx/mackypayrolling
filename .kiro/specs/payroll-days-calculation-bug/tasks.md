# Implementation Plan

## Overview

This implementation plan fixes the payroll days calculation bug using the bug condition methodology. The plan follows a test-first approach: write exploration tests to understand the bug, write preservation tests to protect existing behavior, then implement the fix.

**Bug Summary**: The payroll system incorrectly calculates days worked by dividing total hours (including overtime) by 8, resulting in impossible values exceeding 7 days in a weekly period.

**Fix Strategy**: Replace `Math.floor(totalHoursWorked / 8)` with unique calendar day counting from `clock_in` timestamps.

---

## Phase 1: Exploratory Testing (BEFORE Fix)

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Days Calculation with Overtime
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Create test file: `src/pages/__tests__/payrollDaysCalculation.property.test.ts`
  - Test implementation details from Bug Condition in design (section: Bug Condition)
  - Generate test cases with workers who have overtime hours (isBugCondition returns true)
  - Test Case 1: Worker with 6 actual days + 24 OT hours (48 regular + 24 OT = 72 total)
    - Expected on unfixed code: days = 9 (WRONG - this is the bug!)
    - Expected after fix: days = 6 (CORRECT)
  - Test Case 2: Worker with 5 actual days + 10 OT hours (40 regular + 10 OT = 50 total)
    - Expected on unfixed code: days = 6 (WRONG)
    - Expected after fix: days = 5 (CORRECT)
  - Test Case 3: Worker with 7 actual days + 14 OT hours (56 regular + 14 OT = 70 total)
    - Expected on unfixed code: days = 8 (IMPOSSIBLE - exceeds 7-day period!)
    - Expected after fix: days = 7 (CORRECT)
  - The test assertions should match the Expected Behavior Properties from design
  - Property: `days_worked = COUNT(DISTINCT(DATE(clock_in)))` AND `days_worked ≤ 7`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Overtime Calculation Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (workers with NO overtime)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Create test file: `src/pages/__tests__/payrollPreservation.property.test.ts`
  - Test Case 1: Workers with 0 OT hours should get same days/pay before and after fix
    - Generate workers with various days worked (1-7) but NO overtime
    - Verify: `calculatePayroll_original.days = calculatePayroll_fixed.days`
    - Verify: `calculatePayroll_original.gross_pay = calculatePayroll_fixed.gross_pay`
  - Test Case 2: Workers with no attendance records should be excluded
    - Verify: Empty attendance array results in 0 days worked
  - Test Case 3: Payment formula preservation
    - Verify: `gross_pay = (days × daily_rate) + (OT_hours × hourly_rate)` for all cases
  - Test Case 4: Historical rate lookup preservation
    - Verify: Historical rates from `worker_rates` table are used correctly
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

---

## Phase 2: Implementation

- [-] 3. Fix payroll days calculation bug

  - [x] 3.1 Replace days calculation logic in PayrollPage.tsx
    - Open file: `src/pages/PayrollPage.tsx`
    - Locate the buggy calculation (lines 190-195):
      ```typescript
      const totalHoursWorked = workerAttendance.reduce(
        (sum, a) => sum + (a.hours_worked || 0),
        0
      );
      const days = Math.floor(totalHoursWorked / 8);
      ```
    - Replace with unique calendar day counting:
      ```typescript
      // Count unique calendar days from clock_in timestamps
      const uniqueDays = new Set(
        workerAttendance.map((a) => {
          const date = new Date(a.clock_in);
          return format(date, 'yyyy-MM-dd'); // Use date-fns format
        })
      );
      const days = uniqueDays.size;
      
      // Keep totalHoursWorked for display purposes (if needed)
      const totalHoursWorked = workerAttendance.reduce(
        (sum, a) => sum + (a.hours_worked || 0),
        0
      );
      ```
    - Import `format` from `date-fns` if not already imported
    - _Bug_Condition: isBugCondition(input) where SUM(input.workerAttendance.overtime_hours) > 0_
    - _Expected_Behavior: days_worked = COUNT(DISTINCT(DATE(clock_in))) AND days_worked ≤ 7_
    - _Preservation: Payment formula, OT calculation, rate history, all other payroll logic unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.2 Add DailyBreakdown interface to PayrollData
    - Locate the `PayrollData` interface (around lines 47-55)
    - Add new interface definition:
      ```typescript
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
    - Add optional field to `PayrollData`:
      ```typescript
      interface PayrollData {
        worker: Worker;
        days: number;
        overtime: number;
        overtimePay: number;
        dailyRate: number;
        bonus: number;
        sssDeduction: number;
        total: number;
        dailyBreakdown?: DailyBreakdown; // NEW
      }
      ```
    - _Requirements: 2.5_

  - [x] 3.3 Calculate daily breakdown data
    - Add calculation after the days calculation (around line 195):
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
    - Add `dailyBreakdown` to the return object:
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
        dailyBreakdown // NEW
      };
      ```
    - _Requirements: 2.5_

  - [x] 3.4 Add daily breakdown column to payroll table header
    - Locate table header section (around line 820)
    - Add new column header after "DAYS" column:
      ```typescript
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
      ```
    - _Requirements: 2.5_

  - [x] 3.5 Add daily breakdown column to payroll table body
    - Locate table body section (around line 890)
    - Add new column after "DAYS" cell:
      ```typescript
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
    - _Requirements: 2.5_

  - [x] 3.6 Update column width configuration
    - Locate `COL_RATIOS` constant (lines 13-26)
    - Add new column ratio:
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
    - _Requirements: 2.5_

  - [x] 3.7 Update print function to include daily breakdown
    - Locate `handlePrint` function (around line 320)
    - Add daily breakdown header to print output:
      ```typescript
      printWindow.document.write('<th>DAYS</th>');
      printWindow.document.write('<th style="font-size: 9px;">F S S M T W T</th>');
      ```
    - Add daily breakdown data to print loop (around line 350):
      ```typescript
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
    - _Requirements: 2.5_

  - [x] 3.8 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Days Calculation with Overtime
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify all test cases pass:
      - Worker with 6 days + 24 OT hours now shows 6 days (not 9)
      - Worker with 5 days + 10 OT hours now shows 5 days (not 6)
      - Worker with 7 days + 14 OT hours now shows 7 days (not 8)
    - _Requirements: Expected Behavior Properties from design (2.1, 2.2, 2.3, 2.4, 2.5)_

  - [ ] 3.9 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Overtime Calculation Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Verify all preservation test cases pass:
      - Workers with 0 OT hours get same days/pay before and after fix
      - Workers with no attendance are excluded
      - Payment formula works correctly
      - Historical rate lookup works correctly
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: Preservation Requirements from design (3.1, 3.2, 3.3, 3.4, 3.5, 3.6)_

---

## Phase 3: Smart Auto Clock-Out Feature (Tiered Thresholds)

- [x] 4. Implement smart auto clock-out with tiered thresholds

  - [x] 4.1 Write exploration test for smart auto clock-out
    - **Property 1: Bug Condition** - Missing Auto Clock-Out Feature
    - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the feature is missing
    - Create test file: `src/stores/__tests__/smartAutoClockOut.property.test.ts`
    - Test Case 1: Same-day shift at 8h15m should auto clock-out
      - Input: Worker clocked in at 8:00 AM today, current time is 4:15 PM today
      - Expected on unfixed code: Worker still clocked in (WRONG - feature missing!)
      - Expected after fix: Worker auto-clocked out at 4:00 PM (8h after clock-in)
    - Test Case 2: Same-day shift at 8h14m should NOT auto clock-out
      - Input: Worker clocked in at 8:00 AM today, current time is 4:14 PM today
      - Expected: Worker still clocked in (CORRECT - threshold not reached)
    - Test Case 3: Overnight shift at 10h should auto clock-out
      - Input: Worker clocked in yesterday at 10:00 PM, current time is 8:00 AM today (10h elapsed)
      - Expected on unfixed code: Worker still clocked in (WRONG - feature missing!)
      - Expected after fix: Worker auto-clocked out at 6:00 AM (8h after clock-in)
    - Test Case 4: Overnight shift at 9h59m should NOT auto clock-out
      - Input: Worker clocked in yesterday at 10:00 PM, current time is 7:59 AM today
      - Expected: Worker still clocked in (CORRECT - threshold not reached)
    - Test Case 5: Worker with open OT session should NOT auto clock-out
      - Input: Worker clocked in at 8:00 AM, OT started at 4:00 PM, current time is 4:15 PM
      - Expected: Worker still clocked in (CORRECT - OT sessions excluded)
    - Run test on UNFIXED code
    - **EXPECTED OUTCOME**: Test FAILS for cases 1 and 3 (confirms feature is missing)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 4.2 Implement smart auto clock-out logic in attendanceStore.ts
    - Open file: `src/stores/attendanceStore.ts`
    - Locate `fetchTodayAttendance` function
    - Add auto clock-out check after fetching today's records
    - Implementation details:
      ```typescript
      // Smart auto clock-out with tiered thresholds
      const SAME_DAY_THRESHOLD_MINUTES = 495; // 8h15m for same-day shifts
      const OVERNIGHT_THRESHOLD_MINUTES = 600; // 10h for overnight shifts
      const now = new Date();
      const todayStart = startOfDay(now);
      
      const recordsToAutoClockOut = (todayData || []).filter((r) => {
        if (r.status !== 'clocked_in') return false;
        
        const clockIn = new Date(r.clock_in);
        const clockInDay = startOfDay(clockIn);
        const minutesElapsed = differenceInMinutes(now, clockIn);
        
        // Exclude shifts with open OT sessions
        if (r.ot_clock_in && !r.ot_clock_out) return false;
        
        // Same-day shift: 8h15m threshold
        if (clockInDay.getTime() === todayStart.getTime()) {
          return minutesElapsed >= SAME_DAY_THRESHOLD_MINUTES;
        }
        
        // Overnight shift (previous day): 10h threshold
        if (clockInDay.getTime() < todayStart.getTime()) {
          return minutesElapsed >= OVERNIGHT_THRESHOLD_MINUTES;
        }
        
        return false;
      });
      
      // Auto clock-out eligible records
      for (const record of recordsToAutoClockOut) {
        const clockIn = new Date(record.clock_in);
        const clockInDay = startOfDay(clockIn);
        const autoClockOut = new Date(clockIn.getTime() + 8 * 60 * 60 * 1000); // 8h after clock-in
        
        const currentNotes = record.notes || '';
        const isSameDay = clockInDay.getTime() === todayStart.getTime();
        const auditNote = isSameDay 
          ? 'Auto-clocked out at 8h15m (same-day shift)'
          : 'Auto-clocked out at 10h (overnight shift)';
        const updatedNotes = currentNotes ? `${currentNotes}\n${auditNote}` : auditNote;
        
        await supabase
          .from('attendance')
          .update({
            clock_out: autoClockOut.toISOString(),
            hours_worked: 8,
            overtime_hours: 0,
            status: 'clocked_out',
            notes: updatedNotes
          })
          .eq('id', record.id);
      }
      ```
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 4.3 Add session tracking to prevent repeated auto-closures
    - Add session tracking variable at module level:
      ```typescript
      // Track which workers have been auto-clocked out this session
      const autoClockOutSessionTracker = new Set<string>();
      ```
    - Update auto clock-out logic to check session tracker:
      ```typescript
      const recordsToAutoClockOut = (todayData || []).filter((r) => {
        // ... existing checks ...
        
        // Skip if already auto-clocked out this session
        if (autoClockOutSessionTracker.has(r.id)) return false;
        
        // ... threshold checks ...
      });
      
      // After auto clock-out, add to tracker
      for (const record of recordsToAutoClockOut) {
        // ... auto clock-out logic ...
        autoClockOutSessionTracker.add(record.id);
      }
      ```
    - _Requirements: 4.7_

  - [x] 4.4 Write unit tests for smart auto clock-out
    - Create test file: `src/stores/__tests__/smartAutoClockOut.unit.test.ts`
    - Test Case 1: Same-day shift at 8h15m triggers auto clock-out
    - Test Case 2: Same-day shift at 8h14m does NOT trigger auto clock-out
    - Test Case 3: Overnight shift at 10h triggers auto clock-out
    - Test Case 4: Overnight shift at 9h59m does NOT trigger auto clock-out
    - Test Case 5: Shift with open OT session does NOT trigger auto clock-out
    - Test Case 6: Auto clock-out sets clock_out to exactly 8h after clock_in
    - Test Case 7: Auto clock-out sets hours_worked to 8 and overtime_hours to 0
    - Test Case 8: Same-day auto clock-out appends "8h15m (same-day shift)" note
    - Test Case 9: Overnight auto clock-out appends "10h (overnight shift)" note
    - Test Case 10: Session tracker prevents repeated auto-closures
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 4.5 Verify smart auto clock-out exploration test now passes
    - **Property 1: Expected Behavior** - Smart Auto Clock-Out with Tiered Thresholds
    - **IMPORTANT**: Re-run the SAME test from task 4.1 - do NOT write a new test
    - Run exploration test from step 4.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms feature is implemented)
    - Verify all test cases pass:
      - Same-day shift at 8h15m auto-clocks out
      - Same-day shift at 8h14m does NOT auto clock-out
      - Overnight shift at 10h auto-clocks out
      - Overnight shift at 9h59m does NOT auto clock-out
      - Shift with open OT does NOT auto clock-out
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

---

## Phase 4: Additional Testing

- [ ] 5. Write unit tests for unique days calculation
  - Create test file: `src/pages/__tests__/uniqueDaysCalculation.unit.test.ts`
  - Test Case 1: Multiple attendance records on same day count as 1 day
  - Test Case 2: Attendance records on different days count correctly
  - Test Case 3: Attendance at midnight boundary is handled correctly
  - Test Case 4: Empty attendance array results in 0 days
  - Test Case 5: Single attendance record results in 1 day
  - Test Case 6: 7 attendance records on 7 different days results in 7 days
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Write unit tests for daily breakdown calculation
  - Create test file: `src/pages/__tests__/dailyBreakdown.unit.test.ts`
  - Test Case 1: Attendance on Friday sets fri=true
  - Test Case 2: Attendance on all 7 days sets all flags to true
  - Test Case 3: Attendance on partial week (FRI-MON) sets correct flags
  - Test Case 4: Empty attendance results in all flags false
  - Test Case 5: Multiple attendance on same day sets flag once
  - _Requirements: 2.5_

- [ ] 7. Write integration tests for payroll calculation
  - Create test file: `src/pages/__tests__/PayrollPage.integration.test.ts`
  - Test Case 1: Full payroll generation with multiple workers
    - Create test workers with varying attendance patterns
    - Some with overtime, some without
    - Verify days calculation is correct for all workers
    - Verify daily breakdown matches attendance
  - Test Case 2: Manual override integration
    - Generate payroll with calculated days
    - Apply manual days_override
    - Verify override takes precedence
  - Test Case 3: Historical rate integration
    - Create worker with rate history
    - Generate payroll for period with historical rate
    - Verify correct rate is used
  - Test Case 4: Print function integration
    - Generate payroll with daily breakdown
    - Trigger print function
    - Verify print output includes daily breakdown
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

---

## Phase 5: Checkpoint

- [ ] 8. Checkpoint - Ensure all tests pass
  - Run all property-based tests: `npm test payrollDaysCalculation.property.test.ts`
  - Run all preservation tests: `npm test payrollPreservation.property.test.ts`
  - Run all unit tests: `npm test uniqueDaysCalculation.unit.test.ts dailyBreakdown.unit.test.ts`
  - Run all integration tests: `npm test PayrollPage.integration.test.ts`
  - Run all 8h15m auto clock-out tests: `npm test autoClockOut8h15m`
  - Verify no regressions in existing tests
  - If any tests fail, investigate and fix before proceeding
  - Ask the user if questions arise or if manual testing is needed

---

## Notes

- **Test-First Approach**: Tasks 1-2 write tests BEFORE the fix to understand the bug and establish baseline behavior
- **Property-Based Testing**: Used for stronger guarantees across the input domain
- **Observation-First**: Preservation tests observe unfixed code behavior first, then encode it
- **Bug Condition Methodology**: Uses C(X), P(result), ¬C(X), F, F' notation from design document
- **Backward Compatibility**: All existing payroll logic, manual overrides, and display features are preserved
- **Daily Breakdown**: New UI feature provides transparency and validation for corrected calculation
- **8h15m Auto Clock-Out**: Re-implements feature with proper safeguards for overnight shifts and OT sessions
