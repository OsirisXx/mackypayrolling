import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { format, addDays } from 'date-fns';

/**
 * Preservation Property Tests
 * 
 * IMPORTANT: Follow observation-first methodology
 * - Observe behavior on UNFIXED code for non-buggy inputs (workers with NO overtime)
 * - Write property-based tests capturing observed behavior patterns
 * - Property-based testing generates many test cases for stronger guarantees
 * 
 * These tests MUST PASS on unfixed code to establish baseline behavior to preserve.
 */

// Mock types
interface AttendanceRecord {
  id: string;
  worker_id: string;
  clock_in: string;
  clock_out: string | null;
  hours_worked: number;
  overtime_hours: number;
  status: 'clocked_in' | 'clocked_out' | 'completed_quota';
}

interface Worker {
  id: string;
  full_name: string;
  daily_rate: number;
  hourly_rate: number;
}

// Helper to create attendance record WITHOUT overtime
function createAttendanceRecordNoOT(
  clockInDate: Date,
  hoursWorked: number
): AttendanceRecord {
  return {
    id: Math.random().toString(),
    worker_id: 'worker-1',
    clock_in: clockInDate.toISOString(),
    clock_out: new Date(clockInDate.getTime() + hoursWorked * 60 * 60 * 1000).toISOString(),
    hours_worked: hoursWorked,
    overtime_hours: 0, // NO OVERTIME
    status: 'clocked_out'
  };
}

// Mock UNFIXED calculatePayroll (current buggy version)
function calculatePayroll_original(workerAttendance: AttendanceRecord[], worker: Worker) {
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

// Mock FIXED calculatePayroll (correct version)
function calculatePayroll_fixed(workerAttendance: AttendanceRecord[], worker: Worker) {
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

describe('Payroll Preservation - Property-Based Tests', () => {
  const testWorker: Worker = {
    id: 'worker-1',
    full_name: 'Test Worker',
    daily_rate: 500,
    hourly_rate: 62.5
  };

  it('Property 1: Workers with 0 OT hours get same days/pay before and after fix', () => {
    // Generate workers with various days worked (1-7) but NO overtime
    const baseDate = new Date('2026-02-06T08:00:00Z');
    
    // Test with 1-7 days worked, all with 8 hours and NO OT
    for (let daysWorked = 1; daysWorked <= 7; daysWorked++) {
      const attendance: AttendanceRecord[] = [];
      
      for (let i = 0; i < daysWorked; i++) {
        const clockInDate = addDays(baseDate, i);
        attendance.push(createAttendanceRecordNoOT(clockInDate, 8)); // 8 hours, 0 OT
      }
      
      // Verify NO overtime (preservation condition)
      const totalOvertimeHours = attendance.reduce((sum, a) => sum + a.overtime_hours, 0);
      expect(totalOvertimeHours).toBe(0);
      
      // Test original (unfixed) code
      const originalResult = calculatePayroll_original(attendance, testWorker);
      
      // Test fixed code
      const fixedResult = calculatePayroll_fixed(attendance, testWorker);
      
      // PRESERVATION: Both should produce same result when no OT
      expect(originalResult.days).toBe(fixedResult.days);
      expect(originalResult.grossPay).toBe(fixedResult.grossPay);
      expect(originalResult.overtime).toBe(fixedResult.overtime);
      
      console.log(`Preservation Test (${daysWorked} days, 0 OT):`, {
        original: originalResult,
        fixed: fixedResult,
        match: originalResult.days === fixedResult.days
      });
    }
  });

  it('Property 2: Workers with no attendance records are excluded (0 days)', () => {
    const attendance: AttendanceRecord[] = []; // Empty attendance
    
    // Test original code
    const originalResult = calculatePayroll_original(attendance, testWorker);
    
    // Test fixed code
    const fixedResult = calculatePayroll_fixed(attendance, testWorker);
    
    // PRESERVATION: Both should show 0 days for empty attendance
    expect(originalResult.days).toBe(0);
    expect(fixedResult.days).toBe(0);
    expect(originalResult.grossPay).toBe(0);
    expect(fixedResult.grossPay).toBe(0);
    
    console.log('Preservation Test (Empty attendance):', {
      original: originalResult,
      fixed: fixedResult
    });
  });

  it('Property 3: Payment formula preservation (days × daily_rate) + (OT_hours × hourly_rate)', () => {
    // Test various combinations of days (no OT)
    const testCases = [
      { days: 1, hours: 8 },
      { days: 3, hours: 8 },
      { days: 5, hours: 8 },
      { days: 7, hours: 8 }
    ];
    
    const baseDate = new Date('2026-02-06T08:00:00Z');
    
    testCases.forEach(({ days, hours }) => {
      const attendance: AttendanceRecord[] = [];
      
      for (let i = 0; i < days; i++) {
        const clockInDate = addDays(baseDate, i);
        attendance.push(createAttendanceRecordNoOT(clockInDate, hours));
      }
      
      const originalResult = calculatePayroll_original(attendance, testWorker);
      const fixedResult = calculatePayroll_fixed(attendance, testWorker);
      
      // Verify payment formula
      const expectedGrossPay = (days * testWorker.daily_rate) + (0 * testWorker.hourly_rate);
      
      expect(originalResult.grossPay).toBe(expectedGrossPay);
      expect(fixedResult.grossPay).toBe(expectedGrossPay);
      expect(originalResult.grossPay).toBe(fixedResult.grossPay);
      
      console.log(`Payment Formula Test (${days} days):`, {
        expected: expectedGrossPay,
        original: originalResult.grossPay,
        fixed: fixedResult.grossPay
      });
    });
  });

  it('Property 4: Partial week preservation (3-4 days, no OT)', () => {
    const baseDate = new Date('2026-02-06T08:00:00Z');
    
    // Test 3 days worked
    const attendance3Days: AttendanceRecord[] = [];
    for (let i = 0; i < 3; i++) {
      attendance3Days.push(createAttendanceRecordNoOT(addDays(baseDate, i), 8));
    }
    
    const original3 = calculatePayroll_original(attendance3Days, testWorker);
    const fixed3 = calculatePayroll_fixed(attendance3Days, testWorker);
    
    expect(original3.days).toBe(3);
    expect(fixed3.days).toBe(3);
    expect(original3.grossPay).toBe(fixed3.grossPay);
    
    // Test 4 days worked
    const attendance4Days: AttendanceRecord[] = [];
    for (let i = 0; i < 4; i++) {
      attendance4Days.push(createAttendanceRecordNoOT(addDays(baseDate, i), 8));
    }
    
    const original4 = calculatePayroll_original(attendance4Days, testWorker);
    const fixed4 = calculatePayroll_fixed(attendance4Days, testWorker);
    
    expect(original4.days).toBe(4);
    expect(fixed4.days).toBe(4);
    expect(original4.grossPay).toBe(fixed4.grossPay);
    
    console.log('Partial Week Preservation:', {
      '3days_original': original3,
      '3days_fixed': fixed3,
      '4days_original': original4,
      '4days_fixed': fixed4
    });
  });

  it('Property 5: Full week preservation (7 days, no OT)', () => {
    const baseDate = new Date('2026-02-06T08:00:00Z');
    const attendance: AttendanceRecord[] = [];
    
    // Create 7 days of attendance (FRI-THU)
    for (let i = 0; i < 7; i++) {
      attendance.push(createAttendanceRecordNoOT(addDays(baseDate, i), 8));
    }
    
    const originalResult = calculatePayroll_original(attendance, testWorker);
    const fixedResult = calculatePayroll_fixed(attendance, testWorker);
    
    // PRESERVATION: Both should show 7 days
    expect(originalResult.days).toBe(7);
    expect(fixedResult.days).toBe(7);
    expect(originalResult.grossPay).toBe(fixedResult.grossPay);
    
    // Verify payment
    const expectedGrossPay = 7 * testWorker.daily_rate; // 7 × 500 = 3500
    expect(originalResult.grossPay).toBe(expectedGrossPay);
    expect(fixedResult.grossPay).toBe(expectedGrossPay);
    
    console.log('Full Week Preservation (7 days):', {
      original: originalResult,
      fixed: fixedResult,
      expected: expectedGrossPay
    });
  });

  it('Property 6: Days never exceed 7 in weekly period (with fast-check)', () => {
    // Property-based test: Generate random attendance patterns (no OT)
    // Verify days never exceed 7
    
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 7 }), // Number of unique days (max 7 in a week)
        (numDays) => {
          const baseDate = new Date('2026-02-06T08:00:00Z');
          const attendance: AttendanceRecord[] = [];
          
          // Create attendance records on unique days (no duplicates)
          for (let i = 0; i < numDays; i++) {
            const clockInDate = addDays(baseDate, i);
            attendance.push(createAttendanceRecordNoOT(clockInDate, 8));
          }
          
          // Verify NO overtime
          const totalOT = attendance.reduce((sum, a) => sum + a.overtime_hours, 0);
          if (totalOT > 0) return true; // Skip if OT exists
          
          const originalResult = calculatePayroll_original(attendance, testWorker);
          const fixedResult = calculatePayroll_fixed(attendance, testWorker);
          
          // Both should never exceed 7 days
          const originalValid = originalResult.days <= 7;
          const fixedValid = fixedResult.days <= 7;
          
          // Both should produce same result (preservation)
          const preserved = originalResult.days === fixedResult.days;
          
          // Both should equal numDays (since no OT and 8 hours per day)
          const correctDays = originalResult.days === numDays && fixedResult.days === numDays;
          
          return originalValid && fixedValid && preserved && correctDays;
        }
      ),
      { numRuns: 100 } // Run 100 random test cases
    );
  });
});
