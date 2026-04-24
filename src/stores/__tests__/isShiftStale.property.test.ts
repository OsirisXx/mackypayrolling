import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isShiftStale } from '../../lib/attendanceHelpers';
import { differenceInHours } from 'date-fns';

describe('isShiftStale - Property Tests', () => {
  /**
   * **Validates: Requirements 4.3, 4.4, 5.1, 5.2**
   *
   * Property 5: Stale shift identification
   *
   * isShiftStale returns true iff clockIn < todayStart AND
   * differenceInHours(now, clockIn) >= thresholdHours.
   *
   * Sub-property A: Today's records are NEVER stale
   * (clockIn >= todayStart → always false)
   */
  it("today's records are NEVER stale", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 365 }),
        fc.integer({ min: 0, max: 86400000 - 1 }),
        fc.integer({ min: 1, max: 48 }),
        (dayOffset, msIntoDay, thresholdHours) => {
          // Create a todayStart at a fixed day boundary
          const todayStartMs = dayOffset * 86400000;
          const todayStart = new Date(todayStartMs);

          // clockIn is within today (>= todayStart)
          const clockIn = new Date(todayStartMs + msIntoDay);

          // now is some time after clockIn (up to 2 days later)
          const now = new Date(clockIn.getTime() + thresholdHours * 3600000 + 1000);

          const result = isShiftStale(clockIn, now, todayStart, thresholdHours);
          expect(result).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Sub-property B: Previous day records are stale iff elapsed >= threshold
   */
  it('previous day records are stale iff elapsed >= thresholdHours', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 365 }),
        fc.integer({ min: 0, max: 86400000 - 1 }),
        fc.integer({ min: 0, max: 72 }),
        fc.integer({ min: 1, max: 48 }),
        (dayOffset, msIntoDay, elapsedHours, thresholdHours) => {
          // todayStart is at a day boundary offset from epoch
          const todayStartMs = dayOffset * 86400000;
          const todayStart = new Date(todayStartMs);

          // clockIn is before todayStart (previous day)
          // Place it msIntoDay before todayStart (at least 1ms before)
          const clockIn = new Date(todayStartMs - msIntoDay - 1);

          // now is elapsedHours after clockIn
          const now = new Date(clockIn.getTime() + elapsedHours * 3600000);

          const result = isShiftStale(clockIn, now, todayStart, thresholdHours);
          const expected = differenceInHours(now, clockIn) >= thresholdHours;
          expect(result).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });
});
