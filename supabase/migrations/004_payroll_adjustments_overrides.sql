-- Migration: Add override columns to payroll_adjustments
-- Created: 2026-03-02

-- Add new columns for admin-editable overrides
ALTER TABLE payroll_adjustments 
ADD COLUMN IF NOT EXISTS days_override DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ot_override DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS daily_rate_override DECIMAL(10,2) DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN payroll_adjustments.days_override IS 'Admin override for days worked';
COMMENT ON COLUMN payroll_adjustments.ot_override IS 'Admin override for overtime pay';
COMMENT ON COLUMN payroll_adjustments.daily_rate_override IS 'Admin override for daily rate';
