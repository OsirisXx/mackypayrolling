-- Add standard_hours column to workers table
-- This allows each worker to have their own standard work hours (8, 10, etc.)
-- Run this in Supabase SQL Editor

ALTER TABLE public.workers 
ADD COLUMN IF NOT EXISTS standard_hours DECIMAL(4,2) NOT NULL DEFAULT 8.00;

-- Update existing workers to have 8 hours as default
UPDATE public.workers 
SET standard_hours = 8.00 
WHERE standard_hours IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.workers.standard_hours IS 'Standard work hours per day for this worker (e.g., 8, 10, 12)';
