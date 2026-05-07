import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAttendanceStore } from '../attendanceStore';
import type { AttendanceWithWorker } from '../../types/database';

/**
 * Unit tests for fetchAttendance method.
 * Validates: Requirements 3.1, 3.3
 * 
 * Tests that fetchAttendance excludes soft-deleted records from query results.
 */

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Mock audit log
vi.mock('../../lib/auditLog', () => ({
  auditLog: {
    logAttendanceDelete: vi.fn(),
    logClockIn: vi.fn(),
    logClockOut: vi.fn(),
  },
}));

function makeRecord(overrides: Partial<AttendanceWithWorker> = {}): AttendanceWithWorker {
  return {
    id: crypto.randomUUID(),
    worker_id: crypto.randomUUID(),
    clock_in: new Date().toISOString(),
    clock_out: null,
    hours_worked: null,
    overtime_hours: null,
    ot_clock_in: null,
    ot_clock_out: null,
    status: 'clocked_in',
    completed_by_quota: false,
    bags_completed: null,
    notes: null,
    scanned_by: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    deleted_by: null,
    deletion_reason: null,
    worker: {
      id: crypto.randomUUID(),
      employee_id: 'EMP001',
      full_name: 'Test Worker',
      daily_rate: 400,
      hourly_rate: 50,
      standard_hours: 8,
      qr_code: 'QR-TEST',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

/**
 * Helper to build a Supabase-style chainable mock that resolves as a thenable.
 * The key insight: Supabase query builders are "thenable" — calling `await query`
 * triggers .then() on the builder object itself.
 */
function createQueryMock(resolveWith: { data: any; error: any }) {
  const mockQuery: any = {
    select: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    // Make the mock thenable so `await query` works
    then: (resolve: any) => resolve(resolveWith),
  };
  return mockQuery;
}

describe('fetchAttendance - Soft Delete Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAttendanceStore.setState({
      attendanceRecords: [],
      todayRecords: [],
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call query with .is("deleted_at", null) filter', async () => {
    const { supabase } = await import('../../lib/supabase');
    
    const mockQuery = createQueryMock({ data: [], error: null });
    vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
    
    const store = useAttendanceStore.getState();
    await store.fetchAttendance();
    
    // Verify the query chain
    expect(supabase.from).toHaveBeenCalledWith('attendance');
    expect(mockQuery.select).toHaveBeenCalled();
    expect(mockQuery.is).toHaveBeenCalledWith('deleted_at', null);
    expect(mockQuery.order).toHaveBeenCalledWith('clock_in', { ascending: false });
  });

  it('should apply deleted_at filter before ordering', async () => {
    const { supabase } = await import('../../lib/supabase');
    
    const callOrder: string[] = [];
    
    const mockQuery: any = {
      select: vi.fn(function(this: any) {
        callOrder.push('select');
        return this;
      }),
      is: vi.fn(function(this: any) {
        callOrder.push('is');
        return this;
      }),
      order: vi.fn(function(this: any) {
        callOrder.push('order');
        return this;
      }),
      then: (resolve: any) => resolve({ data: [], error: null }),
    };
    
    vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
    
    const store = useAttendanceStore.getState();
    await store.fetchAttendance();
    
    // Verify order: select -> is -> order
    expect(callOrder).toEqual(['select', 'is', 'order']);
  });

  it('should apply deleted_at filter with date range filters', async () => {
    const { supabase } = await import('../../lib/supabase');
    
    const mockQuery = createQueryMock({ data: [], error: null });
    vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
    
    const store = useAttendanceStore.getState();
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    await store.fetchAttendance(startDate, endDate);
    
    // Verify all filters are applied
    expect(mockQuery.is).toHaveBeenCalledWith('deleted_at', null);
    expect(mockQuery.gte).toHaveBeenCalled();
    expect(mockQuery.lte).toHaveBeenCalled();
  });

  it('should only return active records (deleted_at is null)', async () => {
    const { supabase } = await import('../../lib/supabase');
    
    const activeRecord1 = makeRecord({ 
      id: 'active-1',
      deleted_at: null 
    });
    const activeRecord2 = makeRecord({ 
      id: 'active-2',
      deleted_at: null 
    });
    
    // Simulate that the query correctly filters out deleted records
    const mockQuery = createQueryMock({
      data: [activeRecord1, activeRecord2],
      error: null,
    });
    
    vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
    
    const store = useAttendanceStore.getState();
    await store.fetchAttendance();
    
    // Verify only active records are in state
    const state = useAttendanceStore.getState();
    expect(state.attendanceRecords).toHaveLength(2);
    expect(state.attendanceRecords.every(r => r.deleted_at === null)).toBe(true);
    expect(state.attendanceRecords.find(r => r.id === 'active-1')).toBeDefined();
    expect(state.attendanceRecords.find(r => r.id === 'active-2')).toBeDefined();
  });

  it('should handle empty result set', async () => {
    const { supabase } = await import('../../lib/supabase');
    
    const mockQuery = createQueryMock({ data: [], error: null });
    vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
    
    const store = useAttendanceStore.getState();
    await store.fetchAttendance();
    
    const state = useAttendanceStore.getState();
    expect(state.attendanceRecords).toEqual([]);
    expect(state.error).toBeNull();
  });

  it('should handle query errors gracefully', async () => {
    const { supabase } = await import('../../lib/supabase');
    
    const dbError = new Error('Database connection failed');
    const mockQuery = createQueryMock({
      data: null,
      error: dbError,
    });
    
    vi.mocked(supabase.from).mockReturnValue(mockQuery as any);
    
    const store = useAttendanceStore.getState();
    await store.fetchAttendance();
    
    const state = useAttendanceStore.getState();
    expect(state.error).toBe('Database connection failed');
    expect(state.isLoading).toBe(false);
  });
});
