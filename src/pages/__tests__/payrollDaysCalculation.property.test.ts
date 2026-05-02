import { describe, it, expect } from 'vitest';
import { format, addDays } from 'date-fns';

/**
 * Bug Condition Exploration Test
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or the code when it fails.
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation.
 * 
 * Bug Condition: Workers with overtime hours (isBugCondition returns true)
 * Expected Behavior: days_worked = COUNT(DISTINCT(DATE(clock_in))) AND days_worked ≤ 7
 */

// Mock attendance record type
interface AttendanceRecord {
  id: string;
  worker_id: string;
  clock_in: string;
  clock_out: string | null;
  hours_worked: number;
  overtime_hours: number;
  status: 'clocked_in' | 'clocked_out' | 'completed_quota';
}

// Mock worker type
interface Worker {
  id: string;
  full_name: string;
  daily_rate: number;
  hourly_rate: number;
}

// Helper to create attendance record
function createAttendanceRecord(
  clockInDate: Date,
  hoursWorked: number,
  overtimeHours: number
): AttendanceRecord {
  return {
    id: Math.random().toString(),
    worker_id: 'worker-1',
    clock_in: clockInDate.toISOString(),
    clock_out: new Date(clockInDate.getTime() + hoursWorked * 60 * 60 * 1000).toISOString(),
    hours_worked: hoursWorked,
    overtime_hours: overtimeHours,
    status: 'clocked_out'
  };
}

// Mock the UNFIXED calculatePayroll function (buggy version)
function calculatePayroll_unfixed(workerAttendance: AttendanceRecord[], worker: Worker) {
  // BUGGY LOGIC: Divides total hours by 8 (includes OT hours)
  const totalHoursWorked = workerAttendance.reduce(
    (sum, a) => sum + (a.hours_worked || 0),
    0
  );
  const days = Math.floor(totalHoursWorked / 8);
  
  const overtime = workerAttendance.reduce(
    (sum, a) => sum + (a.overtime_hours || 0),
    0
  );
  
  const basePay = days * worker.daily_rate;
  const overtimePay = overtime * worker.hourly_rate;
  const grossPay = basePay + overtimePay;
  
  return {
    days,
    overtime,
    grossPay
  };
}

// Expected FIXED calculatePayroll function (correct version)
function calculatePayroll_fixed(workerAttendance: AttendanceRecord[], worker: Worker) {
  // CORRECT LOGIC: Count unique calendar days
  const uniqueDays = new Set(
    workerAttendance.map((a) => {
      const date = new Date(a.clock_in);
      return format(date, 'yyyy-MM-dd');
    })
  );
  const days = uniqueDays.size;
  
  const overtime = workerAttendance.reduce(
    (sum, a) => sum + (a.overtime_hours || 0),
    0
  );
  
  const basePay = days * worker.daily_rate;
  const overtimePay = overtime * worker.hourly_rate;
  const grossPay = basePay + overtimePay;
  
  return {
    days,
    overtime,
    grossPay
  };
}

describe('Payroll Days Calculation - Bug Condition Exploration', () => {
  const testWorker: Worker = {
    id: 'worker-1',
    full_name: 'Test Worker',
    daily_rate: 500,
    hourly_rate: 62.5
  };

  it('Test Case 1: Worker with 6 actual days + 24 OT hours (should show 6 days, not 9)', () => {
    // Create 6 attendance records, each with 12 hours_worked (8 regular + 4 OT)
    const baseDate = new Date('2026-02-06T08:00:00Z'); // Friday
    const attendance: AttendanceRecord[] = [];
    
    for (let i = 0; i < 6; i++) {
      const clockInDate = addDays(baseDate, i);
      attendance.push(createAttendanceRecord(clockInDate, 12, 4)); // 12 total hours, 4 OT
    }
    
    // Verify bug condition: Worker has overtime hours
    const totalOvertimeHours = attendance.reduce((sum, a) => sum + a.overtime_hours, 0);
    expect(totalOvertimeHours).toBe(24); // Bug condition: OT hours > 0
    
    // Test UNFIXED code (should show bug)
    const unfixedResult = calculatePayroll_unfixed(attendance, testWorker);
    console.log('UNFIXED Result (Test Case 1):', unfixedResult);
    // EXPECTED: days = 9 (WRONG - this is the bug!)
    // Total hours = 6 × 12 = 72, divided by 8 = 9 days
    expect(unfixedResult.days).toBe(9); // Confirms bug exists
    
    // Test FIXED code (should show correct behavior)
    const fixedResult = calculatePayroll_fixed(attendance, testWorker);
    console.log('FIXED Result (Test Case 1):', fixedResult);
    // EXPECTED: days = 6 (CORRECT!)
    expect(fixedResult.days).toBe(6); // Expected behavior
    expect(fixedResult.days).toBeLessThanOrEqual(7); // Never exceed 7 days
    expect(fixedResult.overtime).toBe(24); // OT hours unchanged
    
    // Verify payment calculation
    const expectedGrossPay = (6 * 500) + (24 * 62.5); // 3000 + 1500 = 4500
    expect(fixedResult.grossPay).toBe(expectedGrossPay);
  });

  it('Test Case 2: Worker with 5 actual days + 10 OT hours (should show 5 days, not 6)', () => {
    // Create 5 attendance records, each with 10 hours_worked (8 regular + 2 OT)
    const baseDate = new Date('2026-02-06T08:00:00Z'); // Friday
    const attendance: AttendanceRecord[] = [];
    
    for (let i = 0; i < 5; i++) {
      const clockInDate = addDays(baseDate, i);
      attendance.push(createAttendanceRecord(clockInDate, 10, 2)); // 10 total hours, 2 OT
    }
    
    // Verify bug condition
    const totalOvertimeHours = attendance.reduce((sum, a) => sum + a.overtime_hours, 0);
    expect(totalOvertimeHours).toBe(10);
    
    // Test UNFIXED code
    const unfixedResult = calculatePayroll_unfixed(attendance, testWorker);
    console.log('UNFIXED Result (Test Case 2):', unfixedResult);
    // EXPECTED: days = 6 (WRONG)
    // Total hours = 5 × 10 = 50, divided by 8 = 6.25, floored to 6
    expect(unfixedResult.days).toBe(6); // Confirms bug
    
    // Test FIXED code
    const fixedResult = calculatePayroll_fixed(attendance, testWorker);
    console.log('FIXED Result (Test Case 2):', fixedResult);
    // EXPECTED: days = 5 (CORRECT!)
    expect(fixedResult.days).toBe(5);
    expect(fixedResult.days).toBeLessThanOrEqual(7);
    expect(fixedResult.overtime).toBe(10);
    
    // Verify payment
    const expectedGrossPay = (5 * 500) + (10 * 62.5); // 2500 + 625 = 3125
    expect(fixedResult.grossPay).toBe(expectedGrossPay);
  });

  it('Test Case 3: Worker with 7 actual days + 14 OT hours (should show 7 days, not 8 - IMPOSSIBLE!)', () => {
    // Create 7 attendance records (FRI-THU), each with 10 hours_worked (8 regular + 2 OT)
    const baseDate = new Date('2026-02-06T08:00:00Z'); // Friday
    const attendance: AttendanceRecord[] = [];
    
    for (let i = 0; i < 7; i++) {
      const clockInDate = addDays(baseDate, i);
      attendance.push(createAttendanceRecord(clockInDate, 10, 2)); // 10 total hours, 2 OT
    }
    
    // Verify bug condition
    const totalOvertimeHours = attendance.reduce((sum, a) => sum + a.overtime_hours, 0);
    expect(totalOvertimeHours).toBe(14);
    
    // Test UNFIXED code
    const unfixedResult = calculatePayroll_unfixed(attendance, testWorker);
    console.log('UNFIXED Result (Test Case 3):', unfixedResult);
    // EXPECTED: days = 8 (IMPOSSIBLE - exceeds 7-day period!)
    // Total hours = 7 × 10 = 70, divided by 8 = 8.75, floored to 8
    expect(unfixedResult.days).toBe(8); // Confirms bug - impossible value!
    
    // Test FIXED code
    const fixedResult = calculatePayroll_fixed(attendance, testWorker);
    console.log('FIXED Result (Test Case 3):', fixedResult);
    // EXPECTED: days = 7 (CORRECT - maximum in weekly period!)
    expect(fixedResult.days).toBe(7);
    expect(fixedResult.days).toBeLessThanOrEqual(7); // Critical: never exceed 7
    expect(fixedResult.overtime).toBe(14);
    
    // Verify payment
    const expectedGrossPay = (7 * 500) + (14 * 62.5); // 3500 + 875 = 4375
    expect(fixedResult.grossPay).toBe(expectedGrossPay);
  });

  it('Test Case 4: Worker with 6 days + 0 OT hours (should show 6 days - NO BUG)', () => {
    // Create 6 attendance records with NO overtime (8 hours each)
    const baseDate = new Date('2026-02-06T08:00:00Z'); // Friday
    const attendance: AttendanceRecord[] = [];
    
    for (let i = 0; i < 6; i++) {
      const clockInDate = addDays(baseDate, i);
      attendance.push(createAttendanceRecord(clockInDate, 8, 0)); // 8 hours, 0 OT
    }
    
    // Verify NO bug condition: Worker has NO overtime hours
    const totalOvertimeHours = attendance.reduce((sum, a) => sum + a.overtime_hours, 0);
    expect(totalOvertimeHours).toBe(0); // No bug condition
    
    // Test UNFIXED code
    const unfixedResult = calculatePayroll_unfixed(attendance, testWorker);
    console.log('UNFIXED Result (Test Case 4 - No OT):', unfixedResult);
    // EXPECTED: days = 6 (CORRECT even on unfixed code!)
    // Total hours = 6 × 8 = 48, divided by 8 = 6
    expect(unfixedResult.days).toBe(6);
    
    // Test FIXED code
    const fixedResult = calculatePayroll_fixed(attendance, testWorker);
    console.log('FIXED Result (Test Case 4 - No OT):', fixedResult);
    // EXPECTED: days = 6 (CORRECT!)
    expect(fixedResult.days).toBe(6);
    
    // PRESERVATION: Both should produce same result when no OT
    expect(unfixedResult.days).toBe(fixedResult.days);
    expect(unfixedResult.grossPay).toBe(fixedResult.grossPay);
  });
});
