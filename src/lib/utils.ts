import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

/**
 * Validation result for deletion reason
 */
export interface DeletionReasonValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a deletion reason for attendance records
 * 
 * Requirements:
 * - Minimum length: 10 characters (after trimming)
 * - Maximum length: 500 characters (after trimming)
 * - Whitespace is trimmed before validation
 * 
 * @param reason - The deletion reason to validate
 * @returns Validation result with error message if invalid
 */
export function validateDeletionReason(reason: string): DeletionReasonValidationResult {
  const trimmed = reason.trim();
  
  if (trimmed.length < 10) {
    return {
      valid: false,
      error: 'Deletion reason must be at least 10 characters'
    };
  }
  
  if (trimmed.length > 500) {
    return {
      valid: false,
      error: 'Deletion reason must not exceed 500 characters'
    };
  }
  
  return { valid: true };
}
