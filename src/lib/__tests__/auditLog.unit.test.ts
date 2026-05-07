import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditLog } from '../auditLog';
import { supabase } from '../supabase';

// Mock the supabase module
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn()
  }
}));

describe('auditLog.logAttendanceDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log attendance deletion with correct parameters', async () => {
    // Mock authenticated user
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com'
    };

    const mockUserData = {
      email: 'admin@example.com',
      role: 'admin'
    };

    // Mock supabase responses
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null
    } as any);

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: mockUserData,
      error: null
    });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
      insert: mockInsert
    } as any);

    // Test data
    const workerId = 'worker-456';
    const workerName = 'John Doe';
    const clockIn = '2024-01-15T08:00:00Z';
    const clockOut = '2024-01-15T17:00:00Z';
    const reason = 'Accidental scan - worker was not present';

    // Call the method
    await auditLog.logAttendanceDelete(workerId, workerName, clockIn, clockOut, reason);

    // Verify the audit log entry was created with correct parameters
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: mockUser.id,
      user_email: mockUserData.email,
      user_role: mockUserData.role,
      action: 'DELETE',
      category: 'ATTENDANCE',
      entity_type: 'attendance',
      entity_id: workerId,
      entity_name: workerName,
      description: `Deleted attendance record for ${workerName}: ${reason}`,
      old_values: {
        clock_in: clockIn,
        clock_out: clockOut
      },
      new_values: null,
      metadata: {
        deletion_reason: reason
      },
      severity: 'WARNING'
    });
  });

  it('should handle null clock_out value', async () => {
    // Mock authenticated user
    const mockUser = {
      id: 'user-123',
      email: 'admin@example.com'
    };

    const mockUserData = {
      email: 'admin@example.com',
      role: 'admin'
    };

    // Mock supabase responses
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null
    } as any);

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: mockUserData,
      error: null
    });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
      insert: mockInsert
    } as any);

    // Test data with null clock_out (still clocked in)
    const workerId = 'worker-456';
    const workerName = 'Jane Smith';
    const clockIn = '2024-01-15T08:00:00Z';
    const clockOut = null;
    const reason = 'Duplicate scan entry';

    // Call the method
    await auditLog.logAttendanceDelete(workerId, workerName, clockIn, clockOut, reason);

    // Verify the audit log entry includes null clock_out
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        old_values: {
          clock_in: clockIn,
          clock_out: null
        }
      })
    );
  });
});
