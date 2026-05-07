# Requirements Document

## Introduction

This document specifies the requirements for adding soft-delete functionality to the attendance management system. The feature allows administrators to mark accidental attendance scans as deleted without permanently removing them from the database. Soft-deleted records are excluded from attendance calculations and payroll processing while remaining available in audit logs for tracking and compliance purposes.

## Glossary

- **Attendance_System**: The attendance management system that tracks worker clock-in and clock-out records
- **Attendance_Record**: A database record representing a single clock-in/clock-out event for a worker
- **Soft_Delete**: A deletion operation that marks a record as deleted without physically removing it from the database
- **Payroll_Calculator**: The system component that calculates payroll based on attendance records
- **Audit_Log**: A system log that records all actions performed in the system for compliance and tracking
- **Admin_User**: A user with administrative privileges who can perform delete operations
- **Accidental_Scan**: An unintended attendance scan that needs to be disregarded from calculations

## Requirements

### Requirement 1: Soft Delete Attendance Records

**User Story:** As an administrator, I want to soft delete accidental attendance scans, so that they are excluded from calculations while remaining in the system for audit purposes.

#### Acceptance Criteria

1. THE Attendance_System SHALL add a `deleted_at` timestamp field to the Attendance_Record table
2. THE Attendance_System SHALL add a `deleted_by` user identifier field to the Attendance_Record table
3. THE Attendance_System SHALL add a `deletion_reason` text field to the Attendance_Record table
4. WHEN an Admin_User deletes an Attendance_Record, THE Attendance_System SHALL set the `deleted_at` field to the current timestamp
5. WHEN an Admin_User deletes an Attendance_Record, THE Attendance_System SHALL set the `deleted_by` field to the Admin_User identifier
6. WHEN an Admin_User deletes an Attendance_Record, THE Attendance_System SHALL store the provided deletion reason in the `deletion_reason` field

### Requirement 2: Delete Button in Attendance Page

**User Story:** As an administrator, I want to see a delete button for each attendance record, so that I can remove accidental scans.

#### Acceptance Criteria

1. WHERE the user is an Admin_User, THE Attendance_System SHALL display a delete button for each Attendance_Record in the attendance table
2. WHERE the user is not an Admin_User, THE Attendance_System SHALL NOT display delete buttons
3. WHEN an Admin_User clicks the delete button, THE Attendance_System SHALL display a confirmation dialog
4. THE confirmation dialog SHALL require the Admin_User to provide a deletion reason
5. WHEN the Admin_User confirms deletion with a reason, THE Attendance_System SHALL soft delete the Attendance_Record
6. WHEN the Admin_User cancels the deletion, THE Attendance_System SHALL close the dialog without modifying the Attendance_Record

### Requirement 3: Exclude Deleted Records from Attendance Queries

**User Story:** As a system administrator, I want deleted attendance records to be excluded from normal queries, so that they do not appear in the attendance page or reports.

#### Acceptance Criteria

1. WHEN the Attendance_System fetches attendance records for display, THE Attendance_System SHALL exclude records where `deleted_at` is not null
2. WHEN the Attendance_System fetches today's attendance, THE Attendance_System SHALL exclude records where `deleted_at` is not null
3. WHEN the Attendance_System fetches attendance for a date range, THE Attendance_System SHALL exclude records where `deleted_at` is not null
4. WHEN the Attendance_System fetches worker-specific attendance, THE Attendance_System SHALL exclude records where `deleted_at` is not null

### Requirement 4: Exclude Deleted Records from Payroll Calculations

**User Story:** As a payroll administrator, I want deleted attendance records to be excluded from payroll calculations, so that accidental scans do not affect worker compensation.

#### Acceptance Criteria

1. WHEN the Payroll_Calculator generates payroll for a period, THE Payroll_Calculator SHALL exclude Attendance_Records where `deleted_at` is not null
2. WHEN the Payroll_Calculator calculates days worked, THE Payroll_Calculator SHALL NOT count days with only deleted Attendance_Records
3. WHEN the Payroll_Calculator calculates total hours, THE Payroll_Calculator SHALL NOT include hours from deleted Attendance_Records
4. WHEN the Payroll_Calculator calculates overtime hours, THE Payroll_Calculator SHALL NOT include overtime from deleted Attendance_Records

### Requirement 5: Audit Log for Deletion Operations

**User Story:** As a compliance officer, I want all deletion operations to be logged in the audit system, so that I can track who deleted records and why.

#### Acceptance Criteria

1. WHEN an Admin_User soft deletes an Attendance_Record, THE Attendance_System SHALL create an audit log entry
2. THE audit log entry SHALL include the Admin_User identifier
3. THE audit log entry SHALL include the worker name from the deleted Attendance_Record
4. THE audit log entry SHALL include the deletion reason
5. THE audit log entry SHALL include the original clock-in and clock-out timestamps
6. THE audit log entry SHALL have action type DELETE and category ATTENDANCE

### Requirement 6: Preserve Deleted Records in Database

**User Story:** As a database administrator, I want deleted records to remain in the database, so that they can be recovered if needed and maintain data integrity.

#### Acceptance Criteria

1. WHEN an Attendance_Record is soft deleted, THE Attendance_System SHALL NOT remove the record from the database
2. THE Attendance_System SHALL preserve all original field values of the deleted Attendance_Record
3. WHEN querying the database directly, THE deleted Attendance_Record SHALL remain visible with `deleted_at` populated
4. THE Attendance_System SHALL maintain referential integrity between deleted Attendance_Records and Worker records

### Requirement 7: Visual Feedback for Deletion

**User Story:** As an administrator, I want to see immediate feedback when I delete a record, so that I know the operation was successful.

#### Acceptance Criteria

1. WHEN an Admin_User successfully deletes an Attendance_Record, THE Attendance_System SHALL display a success message
2. WHEN deletion fails, THE Attendance_System SHALL display an error message with the failure reason
3. WHEN an Attendance_Record is deleted, THE Attendance_System SHALL remove it from the displayed table immediately
4. WHEN an Attendance_Record is deleted, THE Attendance_System SHALL update the record count in the pagination display

### Requirement 8: Database Migration for Soft Delete Fields

**User Story:** As a database administrator, I want a migration script to add soft delete fields, so that the database schema supports the new functionality.

#### Acceptance Criteria

1. THE Attendance_System SHALL provide a database migration script
2. THE migration script SHALL add a `deleted_at` column of type timestamp with null default
3. THE migration script SHALL add a `deleted_by` column of type UUID with null default
4. THE migration script SHALL add a `deletion_reason` column of type text with null default
5. THE migration script SHALL add a foreign key constraint from `deleted_by` to the users table
6. THE migration script SHALL be idempotent and safe to run multiple times

### Requirement 9: Prevent Deletion of Already Deleted Records

**User Story:** As a system administrator, I want to prevent deletion of already deleted records, so that the system maintains data consistency.

#### Acceptance Criteria

1. WHEN an Admin_User attempts to delete an Attendance_Record where `deleted_at` is not null, THE Attendance_System SHALL prevent the operation
2. THE Attendance_System SHALL display an error message indicating the record is already deleted
3. THE Attendance_System SHALL NOT create duplicate audit log entries for already deleted records

### Requirement 10: Deletion Reason Validation

**User Story:** As a compliance officer, I want deletion reasons to be mandatory and meaningful, so that all deletions are properly documented.

#### Acceptance Criteria

1. WHEN an Admin_User attempts to delete an Attendance_Record, THE Attendance_System SHALL require a deletion reason
2. THE Attendance_System SHALL reject deletion reasons shorter than 10 characters
3. THE Attendance_System SHALL reject deletion reasons longer than 500 characters
4. WHEN the deletion reason is invalid, THE Attendance_System SHALL display a validation error message
5. THE Attendance_System SHALL trim whitespace from deletion reasons before storing
