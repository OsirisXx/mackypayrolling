-- Create table to store payroll adjustments (bonuses and SSS deductions)
-- This allows bonuses/SSS to persist across page refreshes

BEGIN;

-- Create payroll_adjustments table
CREATE TABLE IF NOT EXISTS public.payroll_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  bonus NUMERIC(10, 2) DEFAULT 0,
  sss_deduction NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(worker_id, period_start, period_end)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payroll_adjustments_worker_period 
ON public.payroll_adjustments(worker_id, period_start, period_end);

-- Add RLS policies
ALTER TABLE public.payroll_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read payroll adjustments"
ON public.payroll_adjustments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admins to insert payroll adjustments"
ON public.payroll_adjustments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Allow admins to update payroll adjustments"
ON public.payroll_adjustments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Allow admins to delete payroll adjustments"
ON public.payroll_adjustments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payroll_adjustments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payroll_adjustments_updated_at
BEFORE UPDATE ON public.payroll_adjustments
FOR EACH ROW
EXECUTE FUNCTION update_payroll_adjustments_updated_at();

COMMIT;

-- Verify table was created
SELECT 'Payroll adjustments table created successfully' as status;
