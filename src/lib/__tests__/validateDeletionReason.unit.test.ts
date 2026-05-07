import { describe, it, expect } from 'vitest';
import { validateDeletionReason } from '../utils';

/**
 * Deletion Reason Validation - Unit Tests
 * 
 * These tests validate the deletion reason validation utility:
 * - Minimum length validation (10 characters)
 * - Maximum length validation (500 characters)
 * - Whitespace trimming behavior
 * - Empty string handling
 * - Valid reason acceptance
 * 
 * Requirements: 10.2, 10.3, 10.5
 */

describe('validateDeletionReason', () => {
  describe('Minimum Length Validation', () => {
    it('should reject reasons shorter than 10 characters', () => {
      const result = validateDeletionReason('short');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Deletion reason must be at least 10 characters');
    });
    
    it('should reject empty string', () => {
      const result = validateDeletionReason('');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Deletion reason must be at least 10 characters');
    });
    
    it('should reject reason with exactly 9 characters', () => {
      const result = validateDeletionReason('123456789'); // 9 chars
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Deletion reason must be at least 10 characters');
    });
    
    it('should accept reason with exactly 10 characters', () => {
      const result = validateDeletionReason('1234567890'); // 10 chars
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
  
  describe('Maximum Length Validation', () => {
    it('should reject reasons longer than 500 characters', () => {
      const longReason = 'a'.repeat(501); // 501 chars
      const result = validateDeletionReason(longReason);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Deletion reason must not exceed 500 characters');
    });
    
    it('should accept reason with exactly 500 characters', () => {
      const maxReason = 'a'.repeat(500); // 500 chars
      const result = validateDeletionReason(maxReason);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should accept reason with 499 characters', () => {
      const reason = 'a'.repeat(499); // 499 chars
      const result = validateDeletionReason(reason);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
  
  describe('Whitespace Trimming', () => {
    it('should trim leading whitespace before validation', () => {
      const result = validateDeletionReason('   Valid reason with enough characters');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should trim trailing whitespace before validation', () => {
      const result = validateDeletionReason('Valid reason with enough characters   ');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should trim both leading and trailing whitespace', () => {
      const result = validateDeletionReason('   Valid reason with enough characters   ');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should reject reason that becomes too short after trimming', () => {
      const result = validateDeletionReason('   short   '); // "short" is only 5 chars after trim
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Deletion reason must be at least 10 characters');
    });
    
    it('should reject whitespace-only string', () => {
      const result = validateDeletionReason('          '); // Only spaces
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Deletion reason must be at least 10 characters');
    });
    
    it('should handle tabs and newlines in whitespace', () => {
      const result = validateDeletionReason('\t\n  Valid reason with enough characters  \n\t');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
  
  describe('Valid Reasons', () => {
    it('should accept valid reason with minimum length', () => {
      const result = validateDeletionReason('Ten chars!'); // Exactly 10 chars
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should accept typical deletion reason', () => {
      const result = validateDeletionReason('Accidental scan - worker was not present');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should accept reason with special characters', () => {
      const result = validateDeletionReason('Worker scanned wrong QR code (ID: 12345) - correcting record');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should accept reason with numbers', () => {
      const result = validateDeletionReason('Duplicate scan at 14:30 on 2024-01-15');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should accept reason in middle of valid range', () => {
      const result = validateDeletionReason('This is a moderately long deletion reason that explains the situation clearly and provides adequate context for the audit trail.');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle reason with internal multiple spaces', () => {
      const result = validateDeletionReason('Valid    reason    with    multiple    spaces');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should handle reason with line breaks', () => {
      const result = validateDeletionReason('Valid reason\nwith line breaks\nfor formatting');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should handle Unicode characters', () => {
      const result = validateDeletionReason('Razón válida con caracteres especiales: ñ, é, ü');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
    
    it('should handle emoji in reason', () => {
      const result = validateDeletionReason('Accidental scan 🚫 - worker was not present');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
