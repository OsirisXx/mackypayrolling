-- Grant permissions for anon key to access all tables
-- This allows JavaScript client to read/write data directly

-- Grant SELECT on workers table
GRANT SELECT ON public.workers TO anon;
GRANT SELECT ON public.workers TO authenticated;

-- Grant INSERT, UPDATE, DELETE on attendance table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;

-- Grant INSERT, UPDATE, DELETE on payroll_adjustments table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_adjustments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_adjustments TO authenticated;

-- Grant SELECT on users table (needed for scanned_by)
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.users TO authenticated;

-- Enable RLS but allow all operations
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_adjustments ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all operations on workers" ON public.workers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payroll_adjustments" ON public.payroll_adjustments FOR ALL USING (true) WITH CHECK (true);

-- Verify permissions
SELECT 
  schemaname,
  tablename,
  has_table_privilege('anon', schemaname || '.' || tablename, 'SELECT') as can_select,
  has_table_privilege('anon', schemaname || '.' || tablename, 'INSERT') as can_insert
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('workers', 'attendance', 'payroll_adjustments');
