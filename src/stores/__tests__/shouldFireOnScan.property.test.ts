import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { shouldFireOnScan } from '../../lib/attendanceHelpers';

describe('shouldFireOnScan - Property Tests', () => {
  /**
   * **Validates: Requirements 1.1, 1.2, 1.3**
   *
   * Property 1: Debounce fires if and only if value changed or window expired
   *
   * For any current decode event and previous decode event, shouldFireOnScan
   * returns true iff:
   *  - previous is null, OR
   *  - current.value !== previous.value, OR
   *  - current.time - previous.time >= debounceMs
   * AND isProcessing is false.
   */
  it('should fire iff value changed or debounce window expired (isProcessing=false)', () => {
    const decodeEventArb = fc.record({
      value: fc.string(),
      time: fc.integer(),
    });

    const previousArb = fc.option(decodeEventArb, { nil: null });

    const debounceArb = fc.integer({ min: 1, max: 10000 });

    fc.assert(
      fc.property(decodeEventArb, previousArb, debounceArb, (current, previous, debounceMs) => {
        const result = shouldFireOnScan(current, previous, debounceMs, false);

        const expected =
          previous === null ||
          current.value !== previous.value ||
          current.time - previous.time >= debounceMs;

        expect(result).toBe(expected);
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Validates: Requirements 1.4**
   *
   * Property 2: isProcessing suppresses all callbacks
   *
   * For any decode event (any value, any timing), when isProcessing is true,
   * shouldFireOnScan returns false.
   */
  it('should always return false when isProcessing is true', () => {
    const decodeEventArb = fc.record({
      value: fc.string(),
      time: fc.integer(),
    });

    const previousArb = fc.option(decodeEventArb, { nil: null });

    const debounceArb = fc.integer({ min: 1, max: 10000 });

    fc.assert(
      fc.property(decodeEventArb, previousArb, debounceArb, (current, previous, debounceMs) => {
        const result = shouldFireOnScan(current, previous, debounceMs, true);

        expect(result).toBe(false);
      }),
      { numRuns: 100 },
    );
  });
});
