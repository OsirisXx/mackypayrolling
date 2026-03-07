-- Add deduction and deduction_remarks fields to payroll_adjustments table
-- This allows for any kind of deductions with remarks explaining the reason

ALTER TABLE payroll_adjustments
ADD COLUMN IF NOT EXISTS deduction DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS deduction_remarks TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN payroll_adjustments.deduction IS 'General deduction amount';
COMMENT ON COLUMN payroll_adjustments.deduction_remarks IS 'Remarks/reason for the deduction';
