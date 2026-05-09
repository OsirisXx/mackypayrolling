/**
 * Data Repair Script: Fix Missing Overtime Hours
 * 
 * PURPOSE:
 * This script recalculates and updates overtime_hours for attendance records where
 * workers scanned for OT (ot_clock_in and ot_clock_out are set) but overtime_hours
 * was not calculated correctly (is 0 or NULL).
 * 
 * ROOT CAUSE:
 * The clockOut() function in attendanceStore.ts was overwriting overtime_hours with 0
 * when workers clocked out after completing their OT session. The OT scan data exists
 * in the database, but the overtime_hours field was not calculated.
 * 
 * IMPACT:
 * - Workers underpaid for overtime hours worked
 * - Financial liability for the company
 * - Labor law compliance issues
 * 
 * SAFETY:
 * - This script only UPDATES records, it does not DELETE anything
 * - It only affects records where OT scans exist but overtime_hours is 0
 * - Records without OT scans are not affected
 * - RECOMMENDATION: Create a database backup before running this script
 * 
 * USAGE:
 * 1. Run the DRY RUN query first to see what will be affected
 * 2. Review the results and verify the calculations are correct
 * 3. Create a database backup
 * 4. Run the UPDATE query to fix the records
 * 5. Run the VALIDATION query to verify the fix
 */

-- ============================================================================
-- STEP 1: DRY RUN - Preview affected records BEFORE making changes
-- ============================================================================

SELECT 
  a.id,
  w.full_name as worker_name,
  w.employee_id,
  a.clock_in::date as work_date,
  a.ot_clock_in::time as ot_start_time,
  a.ot_clock_out::time as ot_end_time,
  a.overtime_hours as current_overtime_hours,
  ROUND(
    EXTRACT(EPOCH FROM (a.ot_clock_out::timestamp - a.ot_clock_in::timestamp)) / 3600.0,
    2
  ) as calculated_overtime_hours,
  ROUND(
    EXTRACT(EPOCH FROM (a.ot_clock_out::timestamp - a.ot_clock_in::timestamp)) / 3600.0,
    2
  ) * w.hourly_rate as missing_pay
FROM attendance a
JOIN workers w ON a.worker_id = w.id
WHERE 
  a.ot_clock_in IS NOT NULL
  AND a.ot_clock_out IS NOT NULL
  AND (a.overtime_hours IS NULL OR a.overtime_hours = 0)
  AND a.deleted_at IS NULL
ORDER BY a.clock_in DESC;

-- Count of affected records
SELECT 
  COUNT(*) as total_affected_records,
  COUNT(DISTINCT a.worker_id) as affected_workers,
  SUM(
    ROUND(
      EXTRACT(EPOCH FROM (a.ot_clock_out::timestamp - a.ot_clock_in::timestamp)) / 3600.0,
      2
    )
  ) as total_missing_hours,
  SUM(
    ROUND(
      EXTRACT(EPOCH FROM (a.ot_clock_out::timestamp - a.ot_clock_in::timestamp)) / 3600.0,
      2
    ) * w.hourly_rate
  ) as total_missing_pay
FROM attendance a
JOIN workers w ON a.worker_id = w.id
WHERE 
  a.ot_clock_in IS NOT NULL
  AND a.ot_clock_out IS NOT NULL
  AND (a.overtime_hours IS NULL OR a.overtime_hours = 0)
  AND a.deleted_at IS NULL;

-- ============================================================================
-- STEP 2: BACKUP RECOMMENDATION
-- ============================================================================
-- IMPORTANT: Create a backup of the attendance table before proceeding
-- 
-- Example backup command (run in psql or your database tool):
-- CREATE TABLE attendance_backup_YYYYMMDD AS SELECT * FROM attendance;
-- 
-- Or use your database backup tool to create a full backup
-- ============================================================================

-- ============================================================================
-- STEP 3: UPDATE - Fix missing overtime hours
-- ============================================================================
-- CAUTION: This will UPDATE records in the database
-- Make sure you have reviewed the DRY RUN results and created a backup
-- ============================================================================

UPDATE attendance
SET 
  overtime_hours = ROUND(
    EXTRACT(EPOCH FROM (ot_clock_out::timestamp - ot_clock_in::timestamp)) / 3600.0,
    2
  ),
  updated_at = NOW()
WHERE 
  ot_clock_in IS NOT NULL
  AND ot_clock_out IS NOT NULL
  AND (overtime_hours IS NULL OR overtime_hours = 0)
  AND deleted_at IS NULL;

-- ============================================================================
-- STEP 4: VALIDATION - Verify the fix worked
-- ============================================================================

-- Show recently fixed records (updated in the last 5 minutes)
SELECT 
  a.id,
  w.full_name as worker_name,
  w.employee_id,
  a.clock_in::date as work_date,
  a.ot_clock_in::time as ot_start_time,
  a.ot_clock_out::time as ot_end_time,
  a.overtime_hours as fixed_overtime_hours,
  a.overtime_hours * w.hourly_rate as overtime_pay,
  a.updated_at
FROM attendance a
JOIN workers w ON a.worker_id = w.id
WHERE 
  a.ot_clock_in IS NOT NULL
  AND a.ot_clock_out IS NOT NULL
  AND a.overtime_hours > 0
  AND a.updated_at >= NOW() - INTERVAL '5 minutes'
  AND a.deleted_at IS NULL
ORDER BY a.clock_in DESC;

-- Summary of fixed records
SELECT 
  COUNT(*) as records_fixed,
  COUNT(DISTINCT a.worker_id) as workers_affected,
  SUM(a.overtime_hours) as total_hours_recovered,
  SUM(a.overtime_hours * w.hourly_rate) as total_pay_recovered
FROM attendance a
JOIN workers w ON a.worker_id = w.id
WHERE 
  a.ot_clock_in IS NOT NULL
  AND a.ot_clock_out IS NOT NULL
  AND a.overtime_hours > 0
  AND a.updated_at >= NOW() - INTERVAL '5 minutes'
  AND a.deleted_at IS NULL;

-- Verify no records remain with missing overtime hours
SELECT 
  COUNT(*) as remaining_broken_records
FROM attendance
WHERE 
  ot_clock_in IS NOT NULL
  AND ot_clock_out IS NOT NULL
  AND (overtime_hours IS NULL OR overtime_hours = 0)
  AND deleted_at IS NULL;

-- If remaining_broken_records > 0, investigate those records manually

-- ============================================================================
-- STEP 5: PAYROLL IMPACT ANALYSIS
-- ============================================================================
-- Check which payroll periods are affected and may need recalculation

SELECT 
  DATE_TRUNC('week', a.clock_in) as week_start,
  COUNT(*) as affected_records,
  COUNT(DISTINCT a.worker_id) as affected_workers,
  SUM(a.overtime_hours) as total_ot_hours_added
FROM attendance a
WHERE 
  a.ot_clock_in IS NOT NULL
  AND a.ot_clock_out IS NOT NULL
  AND a.overtime_hours > 0
  AND a.updated_at >= NOW() - INTERVAL '5 minutes'
  AND a.deleted_at IS NULL
GROUP BY DATE_TRUNC('week', a.clock_in)
ORDER BY week_start DESC;

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- If you need to rollback, restore from your backup:
-- 
-- DROP TABLE attendance;
-- ALTER TABLE attendance_backup_YYYYMMDD RENAME TO attendance;
-- 
-- Or use your database backup tool to restore
-- ============================================================================

/**
 * NOTES:
 * 
 * 1. This script uses EXTRACT(EPOCH FROM ...) to calculate the time difference
 *    in seconds, then divides by 3600 to get hours, and rounds to 2 decimal places.
 * 
 * 2. The calculation matches the formula used in the attendanceStore.ts code:
 *    Math.round((differenceInMinutes(ot_clock_out, ot_clock_in) / 60) * 100) / 100
 * 
 * 3. Records with deleted_at IS NOT NULL are excluded (soft-deleted records).
 * 
 * 4. The script only affects records where BOTH ot_clock_in and ot_clock_out are set,
 *    ensuring we only fix completed OT sessions.
 * 
 * 5. Records where overtime_hours is already > 0 are not affected.
 * 
 * 6. The updated_at timestamp is set to NOW() to track when the fix was applied.
 * 
 * 7. After running this script, you may need to regenerate payroll for affected
 *    periods to ensure workers are paid correctly.
 */
