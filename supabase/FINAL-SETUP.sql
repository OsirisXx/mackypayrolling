-- ============================================================================
-- Macrock Limestone Attendance & Payroll System
-- FINAL COMPLETE SETUP
-- ============================================================================
-- Run this ENTIRE file in Supabase SQL Editor
-- ============================================================================

-- Drop tables first (CASCADE will drop triggers and constraints)
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.payroll CASCADE;
DROP TABLE IF EXISTS public.workers CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop the auth trigger separately
DO $$ 
BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager')),
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workers table
CREATE TABLE public.workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL DEFAULT 400.00,
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    qr_code TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ NOT NULL,
    clock_out TIMESTAMPTZ,
    hours_worked DECIMAL(5,2),
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'clocked_in' CHECK (status IN ('clocked_in', 'clocked_out', 'completed_quota')),
    completed_by_quota BOOLEAN DEFAULT FALSE,
    bags_completed INTEGER,
    notes TEXT,
    scanned_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payroll table
CREATE TABLE public.payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    days_worked INTEGER NOT NULL DEFAULT 0,
    total_hours DECIMAL(6,2) NOT NULL DEFAULT 0,
    overtime_hours DECIMAL(6,2) DEFAULT 0,
    daily_rate DECIMAL(10,2) NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    gross_pay DECIMAL(12,2) NOT NULL,
    sss_deduction DECIMAL(10,2) DEFAULT 0,
    other_deductions DECIMAL(10,2) DEFAULT 0,
    net_pay DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_attendance_worker_id ON public.attendance(worker_id);
CREATE INDEX idx_attendance_clock_in ON public.attendance(clock_in);
CREATE INDEX idx_attendance_status ON public.attendance(status);
CREATE INDEX idx_payroll_worker_id ON public.payroll(worker_id);
CREATE INDEX idx_payroll_period ON public.payroll(period_start, period_end);
CREATE INDEX idx_workers_qr_code ON public.workers(qr_code);
CREATE INDEX idx_workers_employee_id ON public.workers(employee_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all users" 
    ON public.users FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- Workers table policies
CREATE POLICY "Authenticated users can view workers" 
    ON public.workers FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert workers" 
    ON public.workers FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update workers" 
    ON public.workers FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete workers" 
    ON public.workers FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Attendance table policies
CREATE POLICY "Authenticated users can view attendance" 
    ON public.attendance FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert attendance" 
    ON public.attendance FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update attendance" 
    ON public.attendance FOR UPDATE 
    USING (auth.role() = 'authenticated');

-- Payroll table policies
CREATE POLICY "Authenticated users can view payroll" 
    ON public.payroll FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert payroll" 
    ON public.payroll FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update payroll" 
    ON public.payroll FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete payroll" 
    ON public.payroll FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Settings table policies
CREATE POLICY "Authenticated users can view settings" 
    ON public.settings FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert settings" 
    ON public.settings FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update settings" 
    ON public.settings FOR UPDATE 
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'manager'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at 
    BEFORE UPDATE ON public.workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at 
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_updated_at 
    BEFORE UPDATE ON public.payroll
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
    ('rate_settings', 
     '{"defaultDailyRate": 400, "defaultHourlyRate": 50, "overtimeMultiplier": 1.25, "standardWorkHours": 8}', 
     'Default rate settings for payroll calculations');

-- Insert sample workers
INSERT INTO public.workers (employee_id, full_name, daily_rate, hourly_rate, qr_code, is_active) VALUES
    ('EMP001', 'Juan Dela Cruz', 450.00, 56.25, 'WORKER-EMP001-' || gen_random_uuid(), true),
    ('EMP002', 'Maria Santos', 400.00, 50.00, 'WORKER-EMP002-' || gen_random_uuid(), true),
    ('EMP003', 'Pedro Reyes', 420.00, 52.50, 'WORKER-EMP003-' || gen_random_uuid(), true),
    ('EMP004', 'Ana Garcia', 400.00, 50.00, 'WORKER-EMP004-' || gen_random_uuid(), true),
    ('EMP005', 'Jose Mendoza', 380.00, 47.50, 'WORKER-EMP005-' || gen_random_uuid(), true);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT 
    '✓ Database setup complete!' as status,
    'Next: Create users in Authentication > Users' as next_step,
    'mackypayroll@admin.com / macky@manager.com' as accounts_to_create;
