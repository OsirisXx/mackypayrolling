-- Add OT clock in/out fields to attendance table
-- OT works like a separate clock in/out session
-- OT hourly rate = daily_rate / 8

ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS ot_clock_in TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ot_clock_out TIMESTAMPTZ DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN attendance.ot_clock_in IS 'Overtime clock in time - set by manager';
COMMENT ON COLUMN attendance.ot_clock_out IS 'Overtime clock out time - set by manager';
