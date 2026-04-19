import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { mergeAttendanceRecords } from '../attendanceStore';
import type { AttendanceWithWorker } from '../../types/database';

// Generate valid ISO date strings from integer timestamps
const isoDateArb = fc.integer({
  min: new Date('2020-01-01').getTime(),
  max: new Date('2030-12-31').getTime(),
}).map(ts => new Date(ts).toISOString());

/**
 * Arbitrary for generating AttendanceWithWorker records.
 */
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
    worker: fc.record({
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
    }),
  }) as fc.Arbitrary<AttendanceWithWorker>;

describe('mergeAttendanceRecords - Property Tests', () => {
  /**
   * **Validates: Requirements 1.2**
   *
   * Property 2: Merged records contain no duplicates
   * For any two arrays of attendance records (today's records and open shift records)
   * that may share common records, the merge operation SHALL produce an array where
   * every record `id` appears exactly once.
   */
  it('should produce no duplicate IDs after merge, even with overlapping inputs', () => {
    // Generate an array of unique IDs, then assign each to a record.
    // Split the records into two groups that may share IDs (simulating overlap).
    const uniqueRecordsArb = fc
      .uniqueArray(fc.uuid(), { minLength: 1, maxLength: 20 })
      .chain(ids =>
        fc.tuple(
          ...ids.map(id =>
            attendanceRecordArb().map(r => ({ ...r, id })),
          ),
        ).map(records => records as AttendanceWithWorker[]),
      );

    fc.assert(
      fc.property(
        uniqueRecordsArb.chain(allRecords => {
          // For each record, randomly decide: today-only, open-only, or both
          return fc
            .array(fc.constantFrom('today', 'open', 'both'), {
              minLength: allRecords.length,
              maxLength: allRecords.length,
            })
            .map(assignments => {
              const todayRecords: AttendanceWithWorker[] = [];
              const openRecords: AttendanceWithWorker[] = [];
              allRecords.forEach((rec, i) => {
                const assignment = assignments[i];
                if (assignment === 'today' || assignment === 'both') todayRecords.push(rec);
                if (assignment === 'open' || assignment === 'both') openRecords.push(rec);
              });
              return [todayRecords, openRecords] as const;
            });
        }),
        ([todayRecords, openRecords]) => {
          const merged = mergeAttendanceRecords(todayRecords, openRecords);

          const ids = merged.map(r => r.id);
          const uniqueIds = new Set(ids);

          // Every ID in the merged result must appear exactly once
          expect(ids.length).toBe(uniqueIds.size);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 1.1**
   *
   * Property 1: Open shifts are always included in fetched records
   * For any set of attendance records, after the merge operation, the result
   * SHALL contain every record with `status = 'clocked_in'`, regardless of
   * the `clock_in` date.
   */
  it('should include every clocked_in record from either input array in the merged result', () => {
    fc.assert(
      fc.property(
        fc.array(attendanceRecordArb(), { minLength: 0, maxLength: 15 }),
        fc.array(attendanceRecordArb(), { minLength: 0, maxLength: 15 }),
        (todayRecords, openRecords) => {
          const merged = mergeAttendanceRecords(todayRecords, openRecords);

          // Collect all clocked_in records from both input arrays
          const allClockedIn = [
            ...todayRecords.filter(r => r.status === 'clocked_in'),
            ...openRecords.filter(r => r.status === 'clocked_in'),
          ];

          const mergedIds = new Set(merged.map(r => r.id));

          // Every clocked_in record from either input must be present in the merged result
          for (const record of allClockedIn) {
            expect(mergedIds.has(record.id)).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
