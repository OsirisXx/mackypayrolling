import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { buildAutoTimeoutPayload } from '../../lib/attendanceHelpers';

describe('buildAutoTimeoutPayload - Property Tests', () => {
  /**
   * **Validates: Requirements 4.5, 4.6**
   *
   * Property 6: Auto-timeout payload correctness (no OT session)
   *
   * The returned payload has:
   * - clock_out = clockIn + 8 hours (as ISO string)
   * - hours_worked = 8
   * - overtime_hours = 0 (when no otClockIn provided)
   * - status = 'clocked_out'
   * - notes contains "Auto-timed out (forgot to clock out)"
   * - If hasOpenOT but no otClockIn, ot_clock_out equals clock_out, overtime_hours = 0
   * - If !hasOpenOT, ot_clock_out is not in payload
   */
  it('should produce correct auto-timeout payload without OT session', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2000-01-01T00:00:00Z'), max: new Date('2100-01-01T00:00:00Z') }),
        fc.option(fc.string(), { nil: null }),
        fc.boolean(),
        (clockIn, existingNotes, hasOpenOT) => {
          // Call without otClockIn — OT should be 0
          const payload = buildAutoTimeoutPayload(clockIn, existingNotes, hasOpenOT);

          const expectedClockOut = new Date(clockIn.getTime() + 8 * 60 * 60 * 1000).toISOString();

          // clock_out = clockIn + 8 hours
          expect(payload.clock_out).toBe(expectedClockOut);

          // hours_worked = 8
          expect(payload.hours_worked).toBe(8);

          // overtime_hours = 0 (no otClockIn provided)
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

  /**
   * Property 7: Auto-timeout with open OT session calculates OT hours correctly
   *
   * When hasOpenOT=true and otClockIn is provided:
   * - overtime_hours = (clockIn + 8h - otClockIn) in hours, rounded to 2 decimals
   * - ot_clock_out = clockIn + 8h
   */
  it('should calculate OT hours when otClockIn is provided', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2000-01-01T00:00:00Z'), max: new Date('2100-01-01T00:00:00Z') }),
        fc.option(fc.string(), { nil: null }),
        // OT clock-in offset in minutes (0 to 480 minutes = 0 to 8 hours into the shift)
        fc.integer({ min: 0, max: 480 }),
        (clockIn, existingNotes, otOffsetMinutes) => {
          // otClockIn is set to clockIn + offset (simulating OT starting during the shift)
          const otClockIn = new Date(clockIn.getTime() + otOffsetMinutes * 60 * 1000);
          const payload = buildAutoTimeoutPayload(clockIn, existingNotes, true, otClockIn);

          const clockOut = new Date(clockIn.getTime() + 8 * 60 * 60 * 1000);
          const expectedOtMinutes = Math.floor((clockOut.getTime() - otClockIn.getTime()) / 60000);
          const expectedOtHours = Math.max(0, Math.round((expectedOtMinutes / 60) * 100) / 100);

          expect(payload.overtime_hours).toBe(expectedOtHours);
          expect(payload.ot_clock_out).toBe(clockOut.toISOString());
          expect(payload.hours_worked).toBe(8);
        },
      ),
      { numRuns: 100 },
    );
  });
});
