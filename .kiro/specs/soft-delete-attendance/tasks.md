# Implementation Plan: Soft Delete Attendance Records

## Overview

This implementation plan breaks down the soft-delete feature for attendance records into discrete, implementable tasks. The feature allows administrators to mark accidental attendance scans as deleted without permanently removing them from the database. Each task builds incrementally on previous work, with testing integrated throughout to ensure correctness.

## Tasks

- [x] 1. Create database migration for soft delete fields
  - Create migration file `supabase/migrations/007_soft_delete_attendance.sql`
  - Add `deleted_at` TIMESTAMPTZ column with NULL default
  - Add `deleted_by` UUID column with NULL default and foreign key to users table
  - Add `deletion_reason` TEXT column with NULL default
  - Create index on `deleted_at` for query performance
  - Add column comments for documentation
  - Make migration idempotent with IF NOT EXISTS checks
  - _Requirements: 1.1, 1.2, 1.3, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 2. Update TypeScript type definitions
  - Update `src/types/database.ts` to include new soft delete fields
  - Add `deleted_at: string | null` to Attendance Row type
  - Add `deleted_by: string | null` to Attendance Row type
  - Add `deletion_reason: string | null` to Attendance Row type
  - Update Insert and Update types to include optional soft delete fields
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Implement deletion reason validation utility
  - Create validation function for deletion reasons
  - Validate minimum length (10 characters)
  - Validate maximum length (500 characters)
  - Trim whitespace before validation
  - Return clear error messages for validation failures
  - _Requirements: 10.2, 10.3, 10.5_

- [ ]* 3.1 Write unit tests for deletion reason validation
  - Test rejection of reasons shorter than 10 characters
  - Test rejection of reasons longer than 500 characters
  - Test acceptance of valid reasons (10-500 characters)
  - Test whitespace trimming behavior
  - Test empty string handling
  - _Requirements: 10.2, 10.3, 10.5_

- [x] 4. Add audit log method for attendance deletion
  - Add `logAttendanceDelete` method to `src/lib/auditLog.ts`
  - Accept parameters: workerId, workerName, clockIn, clockOut, reason
  - Set action to 'DELETE' and category to 'ATTENDANCE'
  - Set severity to 'WARNING'
  - Include original timestamps in oldValues
  - Include deletion reason in metadata
  - Create human-readable description
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 5. Implement softDeleteAttendance method in AttendanceStore
  - [x] 5.1 Add softDeleteAttendance method to `src/stores/attendanceStore.ts`
    - Accept attendanceId and reason parameters
    - Get current authenticated user
    - Fetch existing attendance record with worker details
    - Check if record exists, throw error if not found
    - Check if record is already deleted, throw error if deleted_at is not null
    - Update record with deleted_at (current timestamp), deleted_by (user ID), deletion_reason (trimmed)
    - Call audit log method after successful deletion
    - Remove deleted record from todayRecords and attendanceRecords state
    - Handle errors and update loading/error state appropriately
    - _Requirements: 1.4, 1.5, 1.6, 5.1, 6.1, 6.2, 9.1_

  - [ ]* 5.2 Write unit tests for softDeleteAttendance
    - Test successful deletion with valid reason
    - Test error when record not found
    - Test error when record already deleted
    - Test error when user not authenticated
    - Test state updates after successful deletion
    - Test audit log is called with correct parameters
    - _Requirements: 1.4, 1.5, 1.6, 9.1, 9.2_

- [ ] 6. Update attendance queries to exclude deleted records
  - [ ] 6.1 Update fetchAttendance method in AttendanceStore
    - Add `.is('deleted_at', null)` filter to main query
    - Ensure filter is applied before ordering
    - Test query returns only active records
    - _Requirements: 3.1, 3.3_

  - [ ] 6.2 Update fetchTodayAttendance method in AttendanceStore
    - Add `.is('deleted_at', null)` filter to today's records query
    - Add `.is('deleted_at', null)` filter to open shifts query
    - Ensure both queries exclude deleted records
    - Test queries return only active records
    - _Requirements: 3.2_

  - [ ] 6.3 Update worker-specific attendance queries
    - Locate worker-specific queries in AttendancePage.tsx or related components
    - Add `.is('deleted_at', null)` filter to worker attendance queries
    - Ensure deleted records are excluded from worker views
    - _Requirements: 3.4_

  - [ ]* 6.4 Write integration tests for query filtering
    - Create test with mix of active and deleted records
    - Verify fetchAttendance excludes deleted records
    - Verify fetchTodayAttendance excludes deleted records
    - Verify worker-specific queries exclude deleted records
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 7. Update payroll calculations to exclude deleted records
  - [ ] 7.1 Update generatePayroll method in PayrollStore
    - Add `.is('deleted_at', null)` filter to attendance query in payroll generation
    - Ensure deleted records are excluded from days worked calculation
    - Ensure deleted records are excluded from total hours calculation
    - Ensure deleted records are excluded from overtime calculation
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 7.2 Write integration tests for payroll exclusion
    - Create attendance records for a worker
    - Soft delete one record
    - Generate payroll for the period
    - Verify deleted record is not included in days worked
    - Verify deleted record is not included in total hours
    - Verify deleted record is not included in overtime hours
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Checkpoint - Ensure backend logic is complete
  - Run all tests to verify backend functionality
  - Manually test softDeleteAttendance method
  - Verify queries exclude deleted records
  - Verify payroll calculations exclude deleted records
  - Verify audit logs are created correctly
  - Ask the user if questions arise

- [ ] 9. Create DeleteConfirmationDialog component
  - [ ] 9.1 Create new component in AttendancePage.tsx or separate file
    - Accept props: isOpen, record, onConfirm, onCancel, isDeleting
    - Display worker name and attendance details (clock-in, clock-out)
    - Add textarea for deletion reason input
    - Add character counter showing current length and limits (10-500)
    - Implement real-time validation with error messages
    - Add Confirm and Cancel buttons
    - Disable Confirm button while deleting or if validation fails
    - Show loading state on Confirm button during deletion
    - Call onConfirm with trimmed reason when confirmed
    - Call onCancel when cancelled or dialog closed
    - _Requirements: 2.3, 2.4, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 9.2 Write unit tests for DeleteConfirmationDialog
    - Test dialog displays correct record details
    - Test validation error for short reasons (< 10 chars)
    - Test validation error for long reasons (> 500 chars)
    - Test Confirm button is disabled during validation errors
    - Test onConfirm is called with trimmed reason
    - Test onCancel is called when cancelled
    - _Requirements: 2.3, 2.4, 10.2, 10.3, 10.4_

- [ ] 10. Add delete button to AttendancePage
  - [ ] 10.1 Add delete button column to attendance table
    - Check if user is admin (user.role === 'admin')
    - Display delete button only for admin users
    - Use red color scheme for destructive action
    - Add trash icon and "Delete" text
    - Disable button if record is already deleted (deleted_at is not null)
    - Add onClick handler to open confirmation dialog
    - _Requirements: 2.1, 2.2_

  - [ ] 10.2 Implement deletion workflow in AttendancePage
    - Add state for showDeleteDialog, recordToDelete, isDeleting
    - Add state for successMessage and errorMessage
    - Implement handleDeleteRecord to set recordToDelete and open dialog
    - Implement handleDeleteConfirm to call softDeleteAttendance
    - Show success message on successful deletion
    - Show error message on deletion failure
    - Auto-dismiss success message after 3 seconds
    - Close dialog after successful deletion
    - Keep dialog open on error to allow retry
    - _Requirements: 2.5, 2.6, 7.1, 7.2, 7.3, 7.4_

  - [ ]* 10.3 Write integration tests for delete workflow
    - Test admin can see delete button
    - Test non-admin cannot see delete button
    - Test delete button is disabled for already deleted records
    - Test clicking delete opens confirmation dialog
    - Test confirming deletion removes record from table
    - Test success message is displayed after deletion
    - Test error message is displayed on failure
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 7.1, 7.2_

- [ ] 11. Implement visual feedback and error handling
  - Add success toast/message component for successful deletions
  - Add error toast/message component for deletion failures
  - Ensure record disappears from table immediately after deletion
  - Update pagination count after deletion
  - Handle all error scenarios with clear messages (not found, already deleted, validation, auth, database)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 9.2_

- [ ] 12. Final checkpoint - End-to-end testing
  - Test complete deletion flow as admin user
  - Test delete button is hidden for non-admin users
  - Test validation prevents invalid deletion reasons
  - Test deleted records are excluded from attendance page
  - Test deleted records are excluded from payroll calculations
  - Test audit logs are created with correct details
  - Test cannot delete already deleted records
  - Test error messages are clear and actionable
  - Verify database migration can be run safely
  - Ensure all tests pass
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses TypeScript throughout, matching the existing codebase
- Database migration should be tested on staging before production deployment
- All queries have been updated to exclude soft-deleted records using `.is('deleted_at', null)`
- Audit logging ensures compliance and accountability for all deletions
- The feature is non-destructive and maintains full data integrity
