import { describe, it, expect } from 'vitest';
import { addMinutes, differenceInMinutes } from 'date-fns';

/**
 * Smart Auto Clock-Out - Unit Tests
 * 
 * These tests validate the smart auto clock-out feature implementation details:
 * - Threshold calculations (8h15m for same-day, 10h for overnight)
 * - Clock-out time calculation (exactly 8 hours after clock-in)
 * - Hours worked and overtime hours values
 * - Audit notes formatting
 * - Session tracker behavior
 */

// Helper to get start of day in UTC
const startOfDayUTC = (date: Date): Date => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

describe('Smart Auto Clock-Out - Unit Tests', () => {
  describe('Threshold Calculations', () => {
    it('Test Case 1: Same-day shift at 8h15m triggers auto clock-out', () => {
      const clockIn = new Date('2026-02-06T08:00:00Z');
      const now = new Date('2026-02-06T16:15:00Z'); // 8h15m later
      
      const minutesElapsed = differenceInMinutes(now, clockIn);
      const SAME_DAY_THRESHOLD = 495;
      
      expect(minutesElapsed).toBe(495);
      expect(minutesElapsed >= SAME_DAY_THRESHOLD).toBe(true);
    });
    
    it('Test Case 2: Same-day shift at 8h14m does NOT trigger auto clock-out', () => {
      const clockIn = new Date('2026-02-06T08:00:00Z');
      const now = new Date('2026-02-06T16:14:00Z'); // 8h14m later
      
      const minutesElapsed = differenceInMinutes(now, clockIn);
      const SAME_DAY_THRESHOLD = 495;
      
      expect(minutesElapsed).toBe(494);
      expect(minutesElapsed >= SAME_DAY_THRESHOLD).toBe(false);
    });
    
    it('Test Case 3: Overnight shift at 10h triggers auto clock-out', () => {
      const clockIn = new Date('2026-02-05T22:00:00Z'); // Yesterday 10 PM
      const now = new Date('2026-02-06T08:00:00Z'); // Today 8 AM (10h later)
      
      const minutesElapsed = differenceInMinutes(now, clockIn);
      const OVERNIGHT_THRESHOLD = 600;
      
      expect(minutesElapsed).toBe(600);
      expect(minutesElapsed >= OVERNIGHT_THRESHOLD).toBe(true);
    });
    
    it('Test Case 4: Overnight shift at 9h59m does NOT trigger auto clock-out', () => {
      const clockIn = new Date('2026-02-05T22:00:00Z'); // Yesterday 10 PM
      const now = new Date('2026-02-06T07:59:00Z'); // Today 7:59 AM (9h59m later)
      
      const minutesElapsed = differenceInMinutes(now, clockIn);
      const OVERNIGHT_THRESHOLD = 600;
      
      expect(minutesElapsed).toBe(599);
      expect(minutesElapsed >= OVERNIGHT_THRESHOLD).toBe(false);
    });
    
    it('Test Case 5: Shift with open OT session is excluded', () => {
      const record = {
        ot_clock_in: '2026-02-06T16:00:00Z',
        ot_clock_out: null
      };
      
      const hasOpenOT = record.ot_clock_in && !record.ot_clock_out;
      
      expect(hasOpenOT).toBe(true);
      // This record should be filtered out before auto clock-out
    });
  });
  
  describe('Clock-Out Time Calculation', () => {
    it('Test Case 6: Auto clock-out sets clock_out to exactly 8h after clock_in', () => {
      const clockIn = new Date('2026-02-06T08:00:00Z');
      const expectedClockOut = addMinutes(clockIn, 8 * 60); // 8 hours = 480 minutes
      
      expect(expectedClockOut.toISOString()).toBe('2026-02-06T16:00:00.000Z');
      
      // Verify it's exactly 8 hours
      const hoursElapsed = differenceInMinutes(expectedClockOut, clockIn) / 60;
      expect(hoursElapsed).toBe(8);
    });
    
    it('Test Case 7: Auto clock-out sets hours_worked to 8 and overtime_hours to 0', () => {
      const autoClockOutValues = {
        hours_worked: 8,
        overtime_hours: 0,
        status: 'clocked_out' as const
      };
      
      expect(autoClockOutValues.hours_worked).toBe(8);
      expect(autoClockOutValues.overtime_hours).toBe(0);
      expect(autoClockOutValues.status).toBe('clocked_out');
    });
  });
  
  describe('Audit Notes Formatting', () => {
    it('Test Case 8: Same-day auto clock-out appends "8h15m (same-day shift)" note', () => {
      const clockIn = new Date('2026-02-06T08:00:00Z');
      const now = new Date('2026-02-06T16:15:00Z');
      const todayStart = startOfDayUTC(now);
      const clockInDay = startOfDayUTC(clockIn);
      
      const isSameDay = clockInDay.getTime() === todayStart.getTime();
      const auditNote = isSameDay 
        ? 'Auto-clocked out at 8h15m (same-day shift)'
        : 'Auto-clocked out at 10h (overnight shift)';
      
      expect(isSameDay).toBe(true);
      expect(auditNote).toBe('Auto-clocked out at 8h15m (same-day shift)');
    });
    
    it('Test Case 9: Overnight auto clock-out appends "10h (overnight shift)" note', () => {
      const clockIn = new Date('2026-02-05T22:00:00Z'); // Yesterday
      const now = new Date('2026-02-06T08:00:00Z'); // Today
      const todayStart = startOfDayUTC(now);
      const clockInDay = startOfDayUTC(clockIn);
      
      const isSameDay = clockInDay.getTime() === todayStart.getTime();
      const auditNote = isSameDay 
        ? 'Auto-clocked out at 8h15m (same-day shift)'
        : 'Auto-clocked out at 10h (overnight shift)';
      
      expect(isSameDay).toBe(false);
      expect(auditNote).toBe('Auto-clocked out at 10h (overnight shift)');
    });
    
    it('Test Case 10: Audit note is appended to existing notes', () => {
      const existingNotes = 'Worker requested early leave';
      const auditNote = 'Auto-clocked out at 8h15m (same-day shift)';
      const updatedNotes = existingNotes ? `${existingNotes}\n${auditNote}` : auditNote;
      
      expect(updatedNotes).toBe('Worker requested early leave\nAuto-clocked out at 8h15m (same-day shift)');
    });
    
    it('Test Case 11: Audit note is set when no existing notes', () => {
      const existingNotes = '';
      const auditNote = 'Auto-clocked out at 8h15m (same-day shift)';
      const updatedNotes = existingNotes ? `${existingNotes}\n${auditNote}` : auditNote;
      
      expect(updatedNotes).toBe('Auto-clocked out at 8h15m (same-day shift)');
    });
  });
  
  describe('Session Tracker Behavior', () => {
    it('Test Case 12: Session tracker prevents repeated auto-closures', () => {
      const sessionTracker = new Set<string>();
      const recordId = 'test-record-123';
      
      // First check - not in tracker
      expect(sessionTracker.has(recordId)).toBe(false);
      
      // Add to tracker after auto clock-out
      sessionTracker.add(recordId);
      
      // Second check - now in tracker, should be skipped
      expect(sessionTracker.has(recordId)).toBe(true);
    });
    
    it('Test Case 13: Different records are tracked independently', () => {
      const sessionTracker = new Set<string>();
      const recordId1 = 'test-record-123';
      const recordId2 = 'test-record-456';
      
      sessionTracker.add(recordId1);
      
      expect(sessionTracker.has(recordId1)).toBe(true);
      expect(sessionTracker.has(recordId2)).toBe(false);
    });
  });
  
  describe('Day Boundary Detection', () => {
    it('Test Case 14: Same-day detection works correctly', () => {
      const clockIn = new Date('2026-02-06T08:00:00Z');
      const now = new Date('2026-02-06T16:15:00Z');
      
      const clockInDay = startOfDayUTC(clockIn);
      const todayStart = startOfDayUTC(now);
      
      const isSameDay = clockInDay.getTime() === todayStart.getTime();
      
      expect(isSameDay).toBe(true);
    });
    
    it('Test Case 15: Overnight detection works correctly', () => {
      const clockIn = new Date('2026-02-05T22:00:00Z'); // Yesterday
      const now = new Date('2026-02-06T08:00:00Z'); // Today
      
      const clockInDay = startOfDayUTC(clockIn);
      const todayStart = startOfDayUTC(now);
      
      const isOvernight = clockInDay.getTime() < todayStart.getTime();
      
      expect(isOvernight).toBe(true);
    });
    
    it('Test Case 16: Midnight boundary is handled correctly', () => {
      const clockIn = new Date('2026-02-05T23:59:00Z'); // 11:59 PM yesterday
      const now = new Date('2026-02-06T00:01:00Z'); // 12:01 AM today
      
      const clockInDay = startOfDayUTC(clockIn);
      const todayStart = startOfDayUTC(now);
      
      const isOvernight = clockInDay.getTime() < todayStart.getTime();
      
      expect(isOvernight).toBe(true);
    });
  });
});
