import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isScanAllowed } from '../../lib/attendanceHelpers';

describe('isScanAllowed - Property Tests', () => {
  /**
   * **Validates: Requirements 2.2, 2.3**
   *
   * Property 3: Global cooldown gates scan acceptance
   *
   * For any scan event at time `now`, with a last successful action at time
   * `lastActionTime`, and a cooldown of `cooldownMs`, isScanAllowed returns
   * true if and only if now - lastActionTime >= cooldownMs.
   */
  it('should return true iff now - lastActionTime >= cooldownMs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0 }),
        fc.integer({ min: 0 }),
        fc.integer({ min: 1, max: 60000 }),
        (now, lastActionTime, cooldownMs) => {
          const result = isScanAllowed(now, lastActionTime, cooldownMs);
          const expected = now - lastActionTime >= cooldownMs;
          expect(result).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });
});
