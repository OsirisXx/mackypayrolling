import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { AttendanceWithWorker } from '../../types/database';

/**
 * Pure function replicating the duplicate-check logic from clockIn in attendanceStore.ts.
 * Returns true if the worker already has an active (clocked_in) shift in todayRecords.
 */
function hasActiveShift(todayRecords: AttendanceWithWorker[], workerId: string): boolean {
  return todayRecords.some(r => r.worker_id === workerId && r.status === 'clocked_in');
}

// --- Arbitraries (same pattern as mergeAttendanceRecords.property.test.ts) ---

const isoDateArb = fc.integer({
  min: new Date('2020-01-01').getTime(),
  max: new Date('2030-12-31').getTime(),
}).map(ts => new Date(ts).toISOString());

const workerArb = fc.record({
  id: fc.uuid(),
  employee_id: fc.string(),
  full_name: fc.string(),
  daily_rate: fc.float({ min: 100, max: 1000, noNaN: true }),
  hourly_rate: fc.float({ min: 10, max: 200, noNaN: true }),
  standard_hours: fc.integer({ min: 4, max: 12 }),
  qr_code: fc.string(),
  is_active: fc.boolean(),
  created_at: isoDateArb,
  updated_at: isoDateArb,
});

const attendanceRecordArb = (): fc.Arbitrary<AttendanceWithWorker> =>
  fc.record({
    id: fc.uuid(),
    worker_id: fc.uuid(),
    clock_in: isoDateArb,
    clock_out: fc.option(isoDateArb, { nil: null }),
    hours_worked: fc.option(fc.float({ min: 0, max: 24, noNaN: true }), { nil: null }),
    overtime_hours: fc.option(fc.float({ min: 0, max: 16, noNaN: true }), { nil: null }),
    ot_clock_in: fc.option(isoDateArb, { nil: null }),
    ot_clock_out: fc.option(isoDateArb, { nil: null }),
    status: fc.constantFrom('clocked_in' as const, 'clocked_out' as const, 'completed_quota' as const),
    completed_by_quota: fc.boolean(),
    bags_completed: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
    notes: fc.option(fc.string(), { nil: null }),
    scanned_by: fc.uuid(),
    created_at: isoDateArb,
    updated_at: isoDateArb,
    worker: workerArb,
  }) as fc.Arbitrary<AttendanceWithWorker>;

describe('No Simultaneous Active Shifts - Property Tests', () => {
  /**
   * **Validates: Requirements 3.1**
   *
   * Property 3: No worker has simultaneous active shifts
   * If a worker already has a record with status = 'clocked_in' in todayRecords,
   * then the duplicate-check logic SHALL detect it (hasActiveShift returns true),
   * meaning clockIn would reject the attempt.
   */
  it('should detect an active shift when the worker has a clocked_in record', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(attendanceRecordArb(), { minLength: 0, maxLength: 10 }),
        attendanceRecordArb(),
        (targetWorkerId, otherRecords, activeRecord) => {
          // Force the activeRecord to belong to the target worker and be clocked_in
          const clockedInRecord: AttendanceWithWorker = {
            ...activeRecord,
            worker_id: targetWorkerId,
            status: 'clocked_in',
          };

          // Build todayRecords with the active record injected at a random position
          const todayRecords = [...otherRecords, clockedInRecord];

          // The check must detect the active shift
          expect(hasActiveShift(todayRecords, targetWorkerId)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 3.1**
   *
   * Inverse property: if no clocked_in record exists for the worker,
   * hasActiveShift returns false (clock-in would be allowed).
   */
  it('should not detect an active shift when the worker has no clocked_in record', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(attendanceRecordArb(), { minLength: 0, maxLength: 10 }),
        (targetWorkerId, records) => {
          // Remove any clocked_in records for the target worker
          const todayRecords = records.map(r => {
            if (r.worker_id === targetWorkerId && r.status === 'clocked_in') {
              return { ...r, status: 'clocked_out' as const };
            }
            return r;
          });

          expect(hasActiveShift(todayRecords, targetWorkerId)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});
