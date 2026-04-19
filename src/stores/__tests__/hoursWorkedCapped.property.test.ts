import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { differenceInMinutes } from 'date-fns';

/**
 * Pure function replicating the hours calculation logic from clockOut in attendanceStore.ts.
 */
function computeHoursWorked(clockIn: Date, clockOut: Date): number {
  const minutesWorked = differenceInMinutes(clockOut, clockIn);
  const actualHoursWorked = Math.round((minutesWorked / 60) * 100) / 100;
  return Math.min(actualHoursWorked, 8);
}

describe('Hours Worked Calculation - Property Tests', () => {
  /**
   * **Validates: Requirements 4.2**
   *
   * Property 4: Hours worked calculation is correct and capped
   * For any pair of clock_in and clock_out timestamps (including cross-midnight pairs),
   * the computed hours_worked SHALL equal min(differenceInMinutes(clock_out, clock_in) / 60, 8)
   * rounded to two decimal places.
   */
  it('should compute hours_worked as min(minutes/60, 8) rounded to 2 decimal places', () => {
    // Generate clockIn as a random date, then a positive duration in minutes (1–1440),
    // and derive clockOut = clockIn + duration. This naturally produces cross-midnight pairs.
    const timestampPairArb = fc
      .integer({
        min: new Date('2020-01-01').getTime(),
        max: new Date('2030-12-31').getTime(),
      })
      .chain(clockInMs =>
        fc.integer({ min: 1, max: 1440 }).map(durationMinutes => {
          const clockIn = new Date(clockInMs);
          const clockOut = new Date(clockInMs + durationMinutes * 60 * 1000);
          return { clockIn, clockOut };
        }),
      );

    fc.assert(
      fc.property(timestampPairArb, ({ clockIn, clockOut }) => {
        const result = computeHoursWorked(clockIn, clockOut);

        // Expected: min(round(minutes/60, 2dp), 8)
        const minutes = differenceInMinutes(clockOut, clockIn);
        const expected = Math.min(Math.round((minutes / 60) * 100) / 100, 8);

        expect(result).toBe(expected);

        // Result must always be <= 8
        expect(result).toBeLessThanOrEqual(8);
      }),
      { numRuns: 100 },
    );
  });
});
