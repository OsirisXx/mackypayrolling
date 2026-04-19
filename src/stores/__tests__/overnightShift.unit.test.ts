import { describe, it, expect } from 'vitest';
import { differenceInMinutes, subDays, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { mergeAttendanceRecords } from '../attendanceStore';
import type { AttendanceWithWorker } from '../../types/database';

/**
 * Unit tests for overnight shift scenarios.
 * Validates: Requirements 1.1, 4.2
 */

function makeRecord(overrides: Partial<AttendanceWithWorker> = {}): AttendanceWithWorker {
  return {
    id: crypto.randomUUID(),
    worker_id: crypto.randomUUID(),
    clock_in: new Date().toISOString(),
    clock_out: null,
    hours_worked: null,
    overtime_hours: null,
    ot_clock_in: null,
    ot_clock_out: null,
    status: 'clocked_in',
    completed_by_quota: false,
    bags_completed: null,
    notes: null,
    scanned_by: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    worker: {
      id: crypto.randomUUID(),
      employee_id: 'EMP001',
      full_name: 'Test Worker',
      daily_rate: 400,
      hourly_rate: 50,
      standard_hours: 8,
      qr_code: 'QR-TEST',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

function computeHoursWorked(clockIn: Date, clockOut: Date): number {
  const minutesWorked = differenceInMinutes(clockOut, clockIn);
  const actualHoursWorked = Math.round((minutesWorked / 60) * 100) / 100;
  return Math.min(actualHoursWorked, 8);
}


/** Helper to create a Date at a specific hour on a given day */
function dateAtHour(base: Date, hour: number): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(base, hour), 0), 0), 0);
}

describe('Overnight Shift Unit Tests', () => {
  describe('mergeAttendanceRecords — open shift inclusion', () => {
    it('should include open shifts from previous day in merged result', () => {
      const yesterday = subDays(new Date(), 1);
      const openShift = makeRecord({
        clock_in: dateAtHour(yesterday, 15).toISOString(), // 3 PM yesterday
        status: 'clocked_in',
      });

      const todayRecord = makeRecord({
        clock_in: dateAtHour(new Date(), 9).toISOString(),
        status: 'clocked_out',
        clock_out: dateAtHour(new Date(), 17).toISOString(),
      });

      // Today's records don't include the open shift; open query does
      const todayRecords = [todayRecord];
      const openRecords = [openShift];

      const merged = mergeAttendanceRecords(todayRecords, openRecords);

      expect(merged).toHaveLength(2);
      expect(merged.find(r => r.id === openShift.id)).toBeDefined();
      expect(merged.find(r => r.id === todayRecord.id)).toBeDefined();
    });

    it('should return empty when merging two empty arrays', () => {
      const merged = mergeAttendanceRecords([], []);
      expect(merged).toEqual([]);
    });

    it('should return union when merging arrays with no overlap', () => {
      const a = makeRecord({ id: 'aaa-111' });
      const b = makeRecord({ id: 'bbb-222' });
      const c = makeRecord({ id: 'ccc-333' });

      const merged = mergeAttendanceRecords([a], [b, c]);

      expect(merged).toHaveLength(3);
      expect(merged.map(r => r.id).sort()).toEqual(['aaa-111', 'bbb-222', 'ccc-333'].sort());
    });
  });

  describe('computeHoursWorked — hours calculation and cap', () => {
    it('should cap at 8 hours for a 3 PM to 2 AM overnight shift (11 hours)', () => {
      const yesterday = subDays(new Date(), 1);
      const clockIn = dateAtHour(yesterday, 15);  // 3 PM yesterday
      const clockOut = dateAtHour(new Date(), 2);  // 2 AM today

      const hours = computeHoursWorked(clockIn, clockOut);

      expect(hours).toBe(8);
    });

    it('should return exactly 8 for a 10 AM to 6 PM shift (8 hours)', () => {
      const today = new Date();
      const clockIn = dateAtHour(today, 10);  // 10 AM
      const clockOut = dateAtHour(today, 18); // 6 PM

      const hours = computeHoursWorked(clockIn, clockOut);

      expect(hours).toBe(8);
    });

    it('should return 3 for a 2 PM to 5 PM shift (under cap)', () => {
      const today = new Date();
      const clockIn = dateAtHour(today, 14);  // 2 PM
      const clockOut = dateAtHour(today, 17); // 5 PM

      const hours = computeHoursWorked(clockIn, clockOut);

      expect(hours).toBe(3);
    });
  });
});
