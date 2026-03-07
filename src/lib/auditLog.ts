import { supabase } from './supabase';

export type AuditAction = 
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'PRINT'
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED'
  | 'CLOCK_IN' | 'CLOCK_OUT'
  | 'RATE_CHANGE' | 'ADJUSTMENT_SAVE'
  | 'PERIOD_CHANGE' | 'SETTINGS_UPDATE';

export type AuditCategory = 
  | 'AUTH' | 'WORKER' | 'ATTENDANCE' | 'PAYROLL' | 'SETTINGS' | 'SYSTEM';

export type AuditSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

interface AuditLogEntry {
  action: AuditAction;
  category: AuditCategory;
  description: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  severity?: AuditSeverity;
}

class AuditLogger {
  private async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userData } = await supabase
      .from('users')
      .select('email, role')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: userData?.email || user.email || 'unknown',
      role: userData?.role || 'unknown'
    };
  }

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const user = await this.getCurrentUser();

      const logEntry = {
        user_id: user?.id || null,
        user_email: user?.email || 'system',
        user_role: user?.role || 'system',
        action: entry.action,
        category: entry.category,
        entity_type: entry.entityType || null,
        entity_id: entry.entityId || null,
        entity_name: entry.entityName || null,
        description: entry.description,
        old_values: entry.oldValues || null,
        new_values: entry.newValues || null,
        metadata: entry.metadata || null,
        severity: entry.severity || 'INFO'
      };

      const { error } = await supabase.from('audit_logs').insert(logEntry);

      if (error) {
        console.error('Failed to write audit log:', error);
      }
    } catch (err) {
      console.error('Audit logging error:', err);
    }
  }

  // Convenience methods for common actions

  async logLogin(email: string, success: boolean): Promise<void> {
    await this.log({
      action: success ? 'LOGIN' : 'LOGIN_FAILED',
      category: 'AUTH',
      description: success 
        ? `User ${email} logged in successfully`
        : `Failed login attempt for ${email}`,
      entityType: 'user',
      entityName: email,
      severity: success ? 'INFO' : 'WARNING'
    });
  }

  async logLogout(email: string): Promise<void> {
    await this.log({
      action: 'LOGOUT',
      category: 'AUTH',
      description: `User ${email} logged out`,
      entityType: 'user',
      entityName: email
    });
  }

  async logWorkerCreate(worker: { id: string; full_name: string; employee_id: string; daily_rate: number }): Promise<void> {
    await this.log({
      action: 'CREATE',
      category: 'WORKER',
      description: `Created new worker: ${worker.full_name} (${worker.employee_id})`,
      entityType: 'worker',
      entityId: worker.id,
      entityName: worker.full_name,
      newValues: worker
    });
  }

  async logWorkerUpdate(
    workerId: string, 
    workerName: string, 
    oldValues: Record<string, unknown>, 
    newValues: Record<string, unknown>
  ): Promise<void> {
    const changes = Object.keys(newValues)
      .filter(key => oldValues[key] !== newValues[key])
      .map(key => `${key}: ${oldValues[key]} → ${newValues[key]}`)
      .join(', ');

    await this.log({
      action: 'UPDATE',
      category: 'WORKER',
      description: `Updated worker ${workerName}: ${changes}`,
      entityType: 'worker',
      entityId: workerId,
      entityName: workerName,
      oldValues,
      newValues
    });
  }

  async logWorkerDelete(workerId: string, workerName: string): Promise<void> {
    await this.log({
      action: 'DELETE',
      category: 'WORKER',
      description: `Deactivated worker: ${workerName}`,
      entityType: 'worker',
      entityId: workerId,
      entityName: workerName,
      severity: 'WARNING'
    });
  }

  async logRateChange(
    workerId: string, 
    workerName: string, 
    oldRate: number, 
    newRate: number, 
    effectiveDate: string
  ): Promise<void> {
    await this.log({
      action: 'RATE_CHANGE',
      category: 'WORKER',
      description: `Rate changed for ${workerName}: ₱${oldRate} → ₱${newRate} (effective ${effectiveDate})`,
      entityType: 'worker_rate',
      entityId: workerId,
      entityName: workerName,
      oldValues: { daily_rate: oldRate },
      newValues: { daily_rate: newRate, effective_date: effectiveDate }
    });
  }

  async logClockIn(workerId: string, workerName: string, scannedBy: string): Promise<void> {
    await this.log({
      action: 'CLOCK_IN',
      category: 'ATTENDANCE',
      description: `${workerName} clocked in (scanned by ${scannedBy})`,
      entityType: 'attendance',
      entityId: workerId,
      entityName: workerName,
      metadata: { scanned_by: scannedBy }
    });
  }

  async logClockOut(
    workerId: string, 
    workerName: string, 
    hoursWorked: number, 
    overtimeHours: number
  ): Promise<void> {
    await this.log({
      action: 'CLOCK_OUT',
      category: 'ATTENDANCE',
      description: `${workerName} clocked out (${hoursWorked}h worked, ${overtimeHours}h OT)`,
      entityType: 'attendance',
      entityId: workerId,
      entityName: workerName,
      newValues: { hours_worked: hoursWorked, overtime_hours: overtimeHours }
    });
  }

  async logPayrollAdjustment(
    workerId: string, 
    workerName: string, 
    periodStart: string, 
    periodEnd: string,
    bonus: number, 
    sss: number
  ): Promise<void> {
    await this.log({
      action: 'ADJUSTMENT_SAVE',
      category: 'PAYROLL',
      description: `Payroll adjustment for ${workerName} (${periodStart} to ${periodEnd}): Bonus ₱${bonus}, SSS ₱${sss}`,
      entityType: 'payroll_adjustment',
      entityId: workerId,
      entityName: workerName,
      newValues: { bonus, sss_deduction: sss, period_start: periodStart, period_end: periodEnd }
    });
  }

  async logPayrollExport(periodStart: string, periodEnd: string, workerCount: number): Promise<void> {
    await this.log({
      action: 'EXPORT',
      category: 'PAYROLL',
      description: `Exported payroll CSV for ${periodStart} to ${periodEnd} (${workerCount} workers)`,
      entityType: 'payroll',
      metadata: { period_start: periodStart, period_end: periodEnd, worker_count: workerCount }
    });
  }

  async logPayrollPrint(periodStart: string, periodEnd: string): Promise<void> {
    await this.log({
      action: 'PRINT',
      category: 'PAYROLL',
      description: `Printed payroll for ${periodStart} to ${periodEnd}`,
      entityType: 'payroll',
      metadata: { period_start: periodStart, period_end: periodEnd }
    });
  }

  async logSettingsUpdate(key: string, oldValue: unknown, newValue: unknown): Promise<void> {
    await this.log({
      action: 'SETTINGS_UPDATE',
      category: 'SETTINGS',
      description: `Updated setting: ${key}`,
      entityType: 'settings',
      entityId: key,
      oldValues: { value: oldValue },
      newValues: { value: newValue }
    });
  }

  async logPageView(pageName: string): Promise<void> {
    await this.log({
      action: 'VIEW',
      category: 'SYSTEM',
      description: `Viewed ${pageName} page`,
      entityType: 'page',
      entityName: pageName
    });
  }
}

export const auditLog = new AuditLogger();
