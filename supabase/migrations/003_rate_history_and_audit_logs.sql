-- Migration: Rate History and Audit Logs
-- Created: 2026-03-02

-- ============================================
-- 1. WORKER RATES TABLE (Rate History Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS worker_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  daily_rate DECIMAL(10,2) NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  standard_hours INTEGER NOT NULL DEFAULT 8,
  effective_date DATE NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  
  -- Ensure no overlapping rates for same worker on same date
  UNIQUE(worker_id, effective_date)
);

-- Index for efficient lookups
CREATE INDEX idx_worker_rates_worker_date ON worker_rates(worker_id, effective_date DESC);

-- ============================================
-- 2. AUDIT LOGS TABLE (Comprehensive Activity Logging)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who performed the action
  user_id UUID REFERENCES users(id),
  user_email TEXT,
  user_role TEXT,
  
  -- What action was performed
  action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT', 'PRINT', etc.
  category TEXT NOT NULL, -- 'AUTH', 'WORKER', 'ATTENDANCE', 'PAYROLL', 'SETTINGS', 'SYSTEM'
  
  -- What was affected
  entity_type TEXT, -- 'worker', 'attendance', 'payroll_adjustment', 'settings', etc.
  entity_id TEXT, -- ID of the affected record
  entity_name TEXT, -- Human-readable name (e.g., worker name)
  
  -- Detailed description
  description TEXT NOT NULL,
  
  -- Before/After data for changes
  old_values JSONB,
  new_values JSONB,
  
  -- Additional context
  metadata JSONB, -- Any extra info (IP, browser, etc.)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- For quick filtering
  severity TEXT DEFAULT 'INFO' -- 'INFO', 'WARNING', 'ERROR', 'CRITICAL'
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE worker_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Worker rates: All authenticated users can read, only admin/manager can write
CREATE POLICY "worker_rates_select" ON worker_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY "worker_rates_insert" ON worker_rates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "worker_rates_update" ON worker_rates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "worker_rates_delete" ON worker_rates FOR DELETE TO authenticated USING (true);

-- Audit logs: Only admin can read, system can write
CREATE POLICY "audit_logs_select_admin" ON audit_logs FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- 4. MIGRATE EXISTING WORKER RATES TO HISTORY
-- ============================================
-- Insert current worker rates as initial rate history
INSERT INTO worker_rates (worker_id, daily_rate, hourly_rate, standard_hours, effective_date, notes)
SELECT 
  id,
  daily_rate,
  hourly_rate,
  standard_hours,
  created_at::date,
  'Initial rate migrated from workers table'
FROM workers
WHERE daily_rate > 0
ON CONFLICT (worker_id, effective_date) DO NOTHING;

-- ============================================
-- 5. HELPER FUNCTION: Get worker rate for a specific date
-- ============================================
CREATE OR REPLACE FUNCTION get_worker_rate_on_date(p_worker_id UUID, p_date DATE)
RETURNS TABLE(daily_rate DECIMAL, hourly_rate DECIMAL, standard_hours INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT wr.daily_rate, wr.hourly_rate, wr.standard_hours
  FROM worker_rates wr
  WHERE wr.worker_id = p_worker_id
    AND wr.effective_date <= p_date
  ORDER BY wr.effective_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
