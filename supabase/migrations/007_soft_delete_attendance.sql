-- Migration: Add soft delete fields to attendance table
-- Description: Adds deleted_at, deleted_by, and deletion_reason columns to support soft delete functionality
-- This allows administrators to mark accidental attendance scans as deleted without permanently removing them

-- Add soft delete columns
ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT DEFAULT NULL;

-- Add foreign key constraint for deleted_by
-- ON DELETE SET NULL ensures that if a user is deleted, the deletion record is preserved
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_attendance_deleted_by'
    ) THEN
        ALTER TABLE attendance
        ADD CONSTRAINT fk_attendance_deleted_by
        FOREIGN KEY (deleted_by) REFERENCES users(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add index for query performance
-- This optimizes the common query pattern: WHERE deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_attendance_deleted_at ON attendance(deleted_at);

-- Add comments for documentation
COMMENT ON COLUMN attendance.deleted_at IS 'Timestamp when record was soft deleted. NULL indicates active record.';
COMMENT ON COLUMN attendance.deleted_by IS 'User ID who performed the deletion';
COMMENT ON COLUMN attendance.deletion_reason IS 'Reason provided for deletion (10-500 characters)';
