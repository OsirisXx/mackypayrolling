import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { buildAutoTimeoutPayload } from '../../lib/attendanceHelpers';

describe('buildAutoTimeoutPayload - Property Tests', () => {
  /**
   * **Validates: Requirements 4.5, 4.6**
   *
   * Property 6: Auto-timeout payload correctness
   *
   * The returned payload has:
   * - clock_out = clockIn + 8 hours (as ISO string)
   * - hours_worked = 8
   * - overtime_hours = 0
   * - status = 'clocked_out'
   * - notes contains "Auto-timed out (forgot to clock out)"
   * - If hasOpenOT, ot_clock_out equals clock_out
   * - If !hasOpenOT, ot_clock_out is not in payload
   */
  it('should produce correct auto-timeout payload for any inputs', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2000-01-01T00:00:00Z'), max: new Date('2100-01-01T00:00:00Z') }),
        fc.option(fc.string(), { nil: null }),
        fc.boolean(),
        (clockIn, existingNotes, hasOpenOT) => {
          const payload = buildAutoTimeoutPayload(clockIn, existingNotes, hasOpenOT);

          const expectedClockOut = new Date(clockIn.getTime() + 8 * 60 * 60 * 1000).toISOString();

          // clock_out = clockIn + 8 hours
          expect(payload.clock_out).toBe(expectedClockOut);

          // hours_worked = 8
          expect(payload.hours_worked).toBe(8);

          // overtime_hours = 0
          expect(payload.overtime_hours).toBe(0);

          // status = 'clocked_out'
          expect(payload.status).toBe('clocked_out');

          // notes contains the auto-timeout message
          expect(payload.notes).toContain('Auto-timed out (forgot to clock out)');

          // OT handling
          if (hasOpenOT) {
            expect(payload.ot_clock_out).toBe(expectedClockOut);
          } else {
            expect(payload).not.toHaveProperty('ot_clock_out');
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
