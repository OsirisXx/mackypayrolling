import { differenceInHours, differenceInMinutes } from 'date-fns';

/**
 * Determines whether a QR scan decode event should fire the onScan callback.
 *
 * Returns true (fire) when:
 *  - isProcessing is false, AND one of:
 *    - previous is null (first scan ever)
 *    - current.value differs from previous.value (different QR code)
 *    - current.time - previous.time >= debounceMs (debounce window expired)
 *
 * Returns false otherwise.
 */
export function shouldFireOnScan(
  current: { value: string; time: number },
  previous: { value: string; time: number } | null,
  debounceMs: number,
  isProcessing: boolean,
): boolean {
  if (isProcessing) return false;
  if (previous === null) return true;
  if (current.value !== previous.value) return true;
  if (current.time - previous.time >= debounceMs) return true;
  return false;
}

/**
 * Determines whether a scan action is allowed based on a global cooldown.
 *
 * Returns true when enough time has elapsed since the last action.
 */
export function isScanAllowed(
  now: number,
  lastActionTime: number,
  cooldownMs: number,
): boolean {
  return now - lastActionTime >= cooldownMs;
}

/**
 * Determines whether the elapsed shift duration meets the minimum threshold.
 *
 * Returns true when (nowTime - clockInTime) / 1000 >= minDurationSeconds.
 */
export function isShiftDurationValid(
  clockInTime: number,
  nowTime: number,
  minDurationSeconds: number,
): boolean {
  return (nowTime - clockInTime) / 1000 >= minDurationSeconds;
}

/**
 * Determines whether an open shift is stale and eligible for auto-timeout.
 *
 * A shift is stale when:
 *  - clockIn is before todayStart (i.e. from a previous calendar day), AND
 *  - the elapsed time from clockIn to now >= thresholdHours
 *
 * Today's records are never stale.
 */
export function isShiftStale(
  clockIn: Date,
  now: Date,
  todayStart: Date,
  thresholdHours: number,
): boolean {
  if (clockIn >= todayStart) return false;
  return differenceInHours(now, clockIn) >= thresholdHours;
}

/**
 * Builds the Supabase update payload for auto-timing-out a stale shift.
 *
 * - clock_out is set to clockIn + 8 hours
 * - hours_worked is 8
 * - overtime_hours is calculated from otClockIn if an OT session was open, otherwise 0
 * - status is 'clocked_out'
 * - notes contains "Auto-timed out (forgot to clock out)" with existing notes appended
 * - ot_clock_out is set (same as clock_out) only when hasOpenOT is true
 */
export function buildAutoTimeoutPayload(
  clockIn: Date,
  existingNotes: string | null,
  hasOpenOT: boolean,
  otClockIn?: Date | null,
): Record<string, unknown> {
  const clockOut = new Date(clockIn.getTime() + 8 * 60 * 60 * 1000);

  // Calculate OT hours if an OT session was open
  let overtimeHours = 0;
  if (hasOpenOT && otClockIn) {
    const otMinutes = differenceInMinutes(clockOut, otClockIn);
    overtimeHours = Math.max(0, Math.round((otMinutes / 60) * 100) / 100);
  }

  const payload: Record<string, unknown> = {
    clock_out: clockOut.toISOString(),
    hours_worked: 8,
    overtime_hours: overtimeHours,
    status: 'clocked_out',
    notes: `Auto-timed out (forgot to clock out)${existingNotes ? ' | ' + existingNotes : ''}`,
  };

  if (hasOpenOT) {
    payload.ot_clock_out = clockOut.toISOString();
  }

  return payload;
}
