import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isShiftDurationValid } from '../../lib/attendanceHelpers';

describe('isShiftDurationValid - Property Tests', () => {
  /**
   * **Validates: Requirements 3.1, 3.2, 3.3**
   *
   * Property 4: Minimum shift duration guards clock-out
   *
   * For any clock-in time, a duration in ms, and a minimum duration in seconds,
   * isShiftDurationValid returns true if and only if
   * (nowTime - clockInTime) / 1000 >= minDurationSeconds.
   */
  it('should return true iff elapsed seconds >= minDurationSeconds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0 }),
        fc.integer({ min: 0, max: 86400000 }),
        fc.integer({ min: 1, max: 3600 }),
        (clockInTime, durationMs, minDurationSeconds) => {
          const nowTime = clockInTime + durationMs;
          const result = isShiftDurationValid(clockInTime, nowTime, minDurationSeconds);
          const expected = (nowTime - clockInTime) / 1000 >= minDurationSeconds;
          expect(result).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });
});
