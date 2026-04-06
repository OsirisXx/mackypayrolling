import React, { useEffect, useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { auditLog } from '../lib/auditLog';
import { Download, Printer, ChevronLeft, ChevronRight, MessageSquare, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import type { Worker } from '../types/database';
import { formatCurrency } from '../lib/utils';

// Column width ratios (will be converted to pixels based on container)
const COL_RATIOS = {
  name: 18,
  days: 8,
  ot: 8,
  rate: 8,
  bonus: 8,
  sss: 8,
  ded: 8,
  subtotal: 12,
  total: 12,
  signature: 0,  // Hidden on screen
  actions: 10
};

// Calculate initial pixel widths from ratios
const getInitialWidths = (containerWidth: number) => {
  const total = Object.values(COL_RATIOS).reduce((a, b) => a + b, 0);
  return {
    name: Math.floor((COL_RATIOS.name / total) * containerWidth),
    days: Math.floor((COL_RATIOS.days / total) * containerWidth),
    ot: Math.floor((COL_RATIOS.ot / total) * containerWidth),
    rate: Math.floor((COL_RATIOS.rate / total) * containerWidth),
    bonus: Math.floor((COL_RATIOS.bonus / total) * containerWidth),
    sss: Math.floor((COL_RATIOS.sss / total) * containerWidth),
    ded: Math.floor((COL_RATIOS.ded / total) * containerWidth),
    subtotal: Math.floor((COL_RATIOS.subtotal / total) * containerWidth),
    total: Math.floor((COL_RATIOS.total / total) * containerWidth),
    signature: Math.floor((COL_RATIOS.signature / total) * containerWidth),
    actions: Math.floor((COL_RATIOS.actions / total) * containerWidth),
  };
};

interface PayrollData {
  worker: Worker;
  days: number;
  overtime: number;
  overtimePay: number;
  dailyRate: number;
  bonus: number;
  sssDeduction: number;
  total: number;
}

export const PayrollPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  // Load saved period from localStorage or default to Feb 6-12, 2026
  const getInitialPeriod = () => {
    const saved = localStorage.getItem('payrollPeriod');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        start: new Date(parsed.start),
        end: new Date(parsed.end)
      };
    }
    // Default to Feb 6-12, 2026 period
    return {
      start: new Date('2026-02-06'),
      end: new Date('2026-02-12')
    };
  };
  
  const [dateRange, setDateRange] = useState(getInitialPeriod());
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, { days: number | null; ot: number | null; dailyRate: number | null; bonus: number; sss: number; deduction: number; deductionRemarks: string }>>({});
  const [remarksModal, setRemarksModal] = useState<{ isOpen: boolean; workerName: string; remarks: string; workerId: string }>({ isOpen: false, workerName: '', remarks: '', workerId: '' });
  const [periodSelectionModal, setPeriodSelectionModal] = useState<{ isOpen: boolean; workerId: string; workerName: string }>({ isOpen: false, workerId: '', workerName: '' });
  const [availablePeriods, setAvailablePeriods] = useState<Array<{ start: Date; end: Date; label: string }>>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<Set<string>>(new Set());
  
  // Resizable columns state (pixel widths)
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const [colWidths, setColWidths] = useState<typeof COL_RATIOS | null>(null);
  const [initialized, setInitialized] = useState(false);
  const resizingCol = useRef<string | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  // Initialize column widths based on container width
  useEffect(() => {
    if (containerRef.current && !initialized) {
      const containerWidth = containerRef.current.offsetWidth;
      setColWidths(getInitialWidths(containerWidth));
      setInitialized(true);
    }
  }, [initialized, payrollData]);

  const handleMouseDown = useCallback((e: React.MouseEvent, colKey: string) => {
    if (!colWidths) return;
    e.preventDefault();
    resizingCol.current = colKey;
    startX.current = e.clientX;
    startWidth.current = colWidths[colKey as keyof typeof colWidths];
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [colWidths]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingCol.current) return;
    const diff = e.clientX - startX.current;
    const newWidth = Math.max(40, startWidth.current + diff);
    setColWidths(prev => prev ? ({
      ...prev,
      [resizingCol.current!]: newWidth
    }) : prev);
  }, []);

  const handleMouseUp = useCallback(() => {
    resizingCol.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const calculatePayroll = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all active workers ordered alphabetically by name (matching Excel format)
      const { data: workers, error: workersError } = await supabase
        .from('workers')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (workersError) throw workersError;

      // Fetch attendance for exact period using date strings (avoids timezone issues)
      const startStr = format(dateRange.start, 'yyyy-MM-dd');
      const endDate = new Date(dateRange.end);
      endDate.setDate(endDate.getDate() + 1);
      const endStr = format(endDate, 'yyyy-MM-dd');
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .gte('clock_in', startStr)
        .lt('clock_in', endStr)
        .in('status', ['clocked_out', 'completed_quota']);

      if (attendanceError) throw attendanceError;

      // Fetch rate history for all workers effective on or before the period start
      // This gets the most recent rate for each worker that was active at period start
      const { data: rateHistory, error: rateError } = await supabase
        .from('worker_rates')
        .select('*')
        .lte('effective_date', startStr)
        .order('effective_date', { ascending: false });

      if (rateError) {
        console.warn('Rate history not available, using current worker rates:', rateError);
      }

      // Build a map of worker_id -> most recent rate effective at period start
      const workerRateMap = new Map<string, { daily_rate: number; hourly_rate: number }>();
      if (rateHistory) {
        for (const rate of rateHistory) {
          // Only keep the first (most recent) rate for each worker
          if (!workerRateMap.has(rate.worker_id)) {
            workerRateMap.set(rate.worker_id, {
              daily_rate: rate.daily_rate,
              hourly_rate: rate.hourly_rate
            });
          }
        }
      }

      // Calculate payroll for each worker
      const payroll: PayrollData[] = (workers || []).map((worker) => {
        const workerAttendance = (attendance || []).filter(
          (a) => a.worker_id === worker.id
        );

        // Calculate days based on total hours worked (8 hours = 1 day)
        // Sum all hours_worked and divide by 8 to get equivalent days
        const totalHoursWorked = workerAttendance.reduce(
          (sum, a) => sum + (a.hours_worked || 0),
          0
        );
        const days = Math.floor(totalHoursWorked / 8);

        // Sum overtime hours
        const overtime = workerAttendance.reduce(
          (sum, a) => sum + (a.overtime_hours || 0),
          0
        );

        // Use historical rate if available, otherwise fall back to current worker rate
        const historicalRate = workerRateMap.get(worker.id);
        const dailyRate = historicalRate?.daily_rate ?? worker.daily_rate;
        const hourlyRate = historicalRate?.hourly_rate ?? worker.hourly_rate;

        // Calculate total: (days × daily_rate) + (overtime × hourly_rate)
        // Bonus and SSS will be manually input by client
        const basePay = days * dailyRate;
        const overtimePay = overtime * hourlyRate;
        
        // Initialize with 0 - client will input these manually
        const bonus = 0;
        const sssDeduction = 0;
        
        const grossPay = basePay + overtimePay + bonus;
        const total = grossPay - sssDeduction;

        return {
          worker,
          days,
          overtime,
          overtimePay,
          dailyRate,
          bonus,
          sssDeduction,
          total,
        };
      });

      // Show ALL active workers (not just those with attendance)
      // This is a factory system where all workers should be listed
      setPayrollData(payroll);
    } catch (error) {
      console.error('Error calculating payroll:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  const loadSavedAdjustments = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('payroll_adjustments')
        .select('*')
        .eq('period_start', format(dateRange.start, 'yyyy-MM-dd'))
        .eq('period_end', format(dateRange.end, 'yyyy-MM-dd'));

      if (error) throw error;

      const adjustments: Record<string, { days: number | null; ot: number | null; dailyRate: number | null; bonus: number; sss: number; deduction: number; deductionRemarks: string }> = {};
      (data || []).forEach(adj => {
        adjustments[adj.worker_id] = {
          days: adj.days_override ?? null,
          ot: adj.ot_override ?? null,
          dailyRate: adj.daily_rate_override ?? null,
          bonus: adj.bonus || 0,
          sss: adj.sss_deduction || 0,
          deduction: adj.deduction || 0,
          deductionRemarks: adj.deduction_remarks || ''
        };
      });
      setEditedValues(adjustments);
    } catch (error) {
      console.error('Error loading adjustments:', error);
    }
  }, [dateRange]);

  useEffect(() => {
    calculatePayroll();
    loadSavedAdjustments();
  }, [calculatePayroll, loadSavedAdjustments]);

  const saveAdjustment = async (workerId: string, values: { days: number | null; ot: number | null; dailyRate: number | null; bonus: number; sss: number; deduction: number; deductionRemarks: string }) => {
    try {
      const periodStart = format(dateRange.start, 'yyyy-MM-dd');
      const periodEnd = format(dateRange.end, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('payroll_adjustments')
        .upsert({
          worker_id: workerId,
          period_start: periodStart,
          period_end: periodEnd,
          days_override: values.days || null,
          ot_override: values.ot || null,
          daily_rate_override: values.dailyRate || null,
          bonus: values.bonus,
          sss_deduction: values.sss,
          deduction: values.deduction,
          deduction_remarks: values.deductionRemarks || null
        }, {
          onConflict: 'worker_id,period_start,period_end'
        });

      if (error) throw error;
      
      // Log payroll adjustment
      const worker = payrollData.find(p => p.worker.id === workerId)?.worker;
      if (worker) {
        await auditLog.logPayrollAdjustment(workerId, worker.full_name, periodStart, periodEnd, values.bonus, values.sss);
      }
    } catch (error) {
      console.error('Error saving adjustment:', error);
    }
  };

  const handlePrint = () => {
    // Create print window with formatted payroll table
    const printWindow = window.open('', '', 'height=800,width=1200');
    if (!printWindow) return;
    
    printWindow.document.write('<html><head><title>Payroll - Macrock Limestone</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('@page { size: landscape; margin: 0.5cm; }');
    printWindow.document.write('body { font-family: Arial, sans-serif; padding: 10px; margin: 0; }');
    printWindow.document.write('h1 { text-align: center; color: #1e40af; margin-bottom: 5px; font-size: 18px; }');
    printWindow.document.write('.period { text-align: center; color: #6b7280; margin-bottom: 10px; font-size: 12px; }');
    printWindow.document.write('h2 { text-align: center; background: #dbeafe; padding: 5px; margin: 10px 0; font-size: 14px; }');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin: 10px 0; table-layout: fixed; }');
    printWindow.document.write('th, td { border: 1px solid #ddd; padding: 4px 2px; text-align: center; font-size: 9px; word-wrap: break-word; }');
    printWindow.document.write('th { background-color: #1e40af; color: white; font-weight: bold; font-size: 10px; }');
    printWindow.document.write('tr:nth-child(even) { background-color: #f9fafb; }');
    printWindow.document.write('.total-row { background-color: #dbeafe !important; font-weight: bold; font-size: 10px; }');
    printWindow.document.write('.text-right { text-align: right; padding-right: 4px; }');
    printWindow.document.write('.text-left { text-align: left; padding-left: 4px; }');
    printWindow.document.write('th:nth-child(1), td:nth-child(1) { width: 15%; }');
    printWindow.document.write('th:nth-child(2), td:nth-child(2) { width: 6%; }');
    printWindow.document.write('th:nth-child(3), td:nth-child(3) { width: 6%; }');
    printWindow.document.write('th:nth-child(4), td:nth-child(4) { width: 7%; }');
    printWindow.document.write('th:nth-child(5), td:nth-child(5) { width: 8%; }');
    printWindow.document.write('th:nth-child(6), td:nth-child(6) { width: 6%; }');
    printWindow.document.write('th:nth-child(7), td:nth-child(7) { width: 6%; }');
    printWindow.document.write('th:nth-child(8), td:nth-child(8) { width: 12%; }');
    printWindow.document.write('th:nth-child(9), td:nth-child(9) { width: 12%; }');
    printWindow.document.write('th:nth-child(10), td:nth-child(10) { width: 12%; }');
    printWindow.document.write('@media print { body { padding: 5px; } table { page-break-inside: auto; } tr { page-break-inside: avoid; page-break-after: auto; } }');
    printWindow.document.write('</style></head><body>');
    
    printWindow.document.write('<h1>Macrock Limestone</h1>');
    printWindow.document.write(`<p class="period">Period Covered: ${format(dateRange.start, 'MMM dd')} - ${format(dateRange.end, 'dd, yyyy')}</p>`);
    printWindow.document.write('<h2>COMMISSION SCHEDULE</h2>');
    
    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr>');
    printWindow.document.write('<th class="text-left">Name</th>');
    printWindow.document.write('<th>DAYS</th>');
    printWindow.document.write('<th>O.T</th>');
    printWindow.document.write('<th>Rate</th>');
    printWindow.document.write('<th>Bonus</th>');
    printWindow.document.write('<th>SSS</th>');
    printWindow.document.write('<th>Ded.</th>');
    printWindow.document.write('<th>Subtotal</th>');
    printWindow.document.write('<th>Total</th>');
    printWindow.document.write('<th>Signature</th>');
    printWindow.document.write('</tr></thead><tbody>');
    
    let subtotalSum = 0;
    let sssSum = 0;
    let dedSum = 0;
    
    payrollData.forEach(item => {
      const edited = editedValues[item.worker.id] || { days: null, ot: null, dailyRate: null, bonus: 0, sss: 0, deduction: 0, deductionRemarks: '' };
      const days = edited.days !== null ? edited.days : item.days;
      const dailyRate = edited.dailyRate !== null ? edited.dailyRate : item.dailyRate;
      const otHours = edited.ot !== null ? edited.ot : item.overtime;
      const hourlyRate = dailyRate / 8;
      const overtimePay = otHours * hourlyRate;
      const basePay = days * dailyRate;
      const subtotal = basePay + overtimePay + edited.bonus;
      const total = subtotal - edited.sss - edited.deduction;
      
      subtotalSum += subtotal;
      sssSum += edited.sss;
      dedSum += edited.deduction;
      
      printWindow.document.write('<tr>');
      printWindow.document.write(`<td class="text-left">${item.worker.full_name}</td>`);
      printWindow.document.write(`<td>${days}</td>`);
      printWindow.document.write(`<td>${otHours > 0 ? otHours.toFixed(0) : '0'}</td>`);
      printWindow.document.write(`<td>${dailyRate.toFixed(0)}</td>`);
      printWindow.document.write(`<td>${edited.bonus > 0 ? edited.bonus.toFixed(0) : '0'}</td>`);
      printWindow.document.write(`<td>${edited.sss > 0 ? edited.sss.toFixed(0) : '0'}</td>`);
      printWindow.document.write(`<td>${edited.deduction > 0 ? edited.deduction.toFixed(0) : '0'}</td>`);
      printWindow.document.write(`<td class="text-right">₱${subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`);
      printWindow.document.write(`<td class="text-right">₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`);
      printWindow.document.write('<td>________</td>');
      printWindow.document.write('</tr>');
    });
    
    const grandTotal = subtotalSum - sssSum - dedSum;
    
    printWindow.document.write('<tr class="total-row">');
    printWindow.document.write('<td colspan="7" class="text-right">SUBTOTAL</td>');
    printWindow.document.write(`<td class="text-right">₱${subtotalSum.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`);
    printWindow.document.write('<td colspan="2"></td>');
    printWindow.document.write('</tr>');
    
    printWindow.document.write('<tr class="total-row">');
    printWindow.document.write('<td colspan="7" class="text-right">TOTAL SSS</td>');
    printWindow.document.write(`<td class="text-right">-₱${sssSum.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`);
    printWindow.document.write('<td colspan="2"></td>');
    printWindow.document.write('</tr>');
    
    printWindow.document.write('<tr class="total-row">');
    printWindow.document.write('<td colspan="7" class="text-right">TOTAL DEDUCTIONS</td>');
    printWindow.document.write(`<td class="text-right">-₱${dedSum.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`);
    printWindow.document.write('<td colspan="2"></td>');
    printWindow.document.write('</tr>');
    
    printWindow.document.write('<tr class="total-row">');
    printWindow.document.write('<td colspan="7" class="text-right">GRAND TOTAL</td>');
    printWindow.document.write(`<td class="text-right">₱${grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>`);
    printWindow.document.write('<td colspan="2"></td>');
    printWindow.document.write('</tr>');
    
    printWindow.document.write('</tbody></table>');
    printWindow.document.write(`<p style="margin-top: 30px; text-align: center; color: #6b7280;">Printed on ${format(new Date(), 'MMMM dd, yyyy')}</p>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const openPeriodSelection = async (workerId: string, workerName: string) => {
    // Fetch all attendance records for this worker to determine available periods
    try {
      const { data: attendance } = await supabase
        .from('attendance')
        .select('clock_in')
        .eq('worker_id', workerId)
        .in('status', ['clocked_out', 'completed_quota'])
        .order('clock_in', { ascending: false });
      
      if (!attendance || attendance.length === 0) {
        setAvailablePeriods([]);
        setSelectedPeriods(new Set());
        setPeriodSelectionModal({ isOpen: true, workerId, workerName });
        return;
      }
      
      // Group attendance into 7-day periods starting from Feb 6, 2026
      const baseDate = new Date('2026-02-06');
      const periodMap = new Map<string, { start: Date; end: Date }>();
      
      attendance.forEach(att => {
        const date = new Date(att.clock_in);
        const daysSinceBase = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
        const periodIndex = Math.floor(daysSinceBase / 7);
        
        const periodStart = new Date(baseDate);
        periodStart.setDate(baseDate.getDate() + (periodIndex * 7));
        
        const periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + 6);
        
        const periodKey = `${format(periodStart, 'MMM dd')} - ${format(periodEnd, 'dd, yyyy')}`;
        
        if (!periodMap.has(periodKey)) {
          periodMap.set(periodKey, { start: periodStart, end: periodEnd });
        }
      });
      
      // Convert to array and sort by date (most recent first)
      const periods = Array.from(periodMap.entries())
        .map(([label, { start, end }]) => ({ label, start, end }))
        .sort((a, b) => b.start.getTime() - a.start.getTime());
      
      setAvailablePeriods(periods);
      setSelectedPeriods(new Set(periods.slice(0, 4).map(p => p.label))); // Select last 4 weeks by default
      setPeriodSelectionModal({ isOpen: true, workerId, workerName });
    } catch (error) {
      console.error('Error fetching periods:', error);
    }
  };

  const togglePeriodSelection = (periodLabel: string) => {
    setSelectedPeriods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(periodLabel)) {
        newSet.delete(periodLabel);
      } else {
        newSet.add(periodLabel);
      }
      return newSet;
    });
  };

  const handlePrintWorkerWithPeriods = async () => {
    const { workerId } = periodSelectionModal;
    setPeriodSelectionModal({ isOpen: false, workerId: '', workerName: '' });
    
    try {
      // Fetch worker details
      const worker = payrollData.find(p => p.worker.id === workerId)?.worker;
      if (!worker) return;

      // Fetch all attendance history for this worker (only for selected periods)
      const selectedPeriodObjs = availablePeriods.filter(p => selectedPeriods.has(p.label));
      if (selectedPeriodObjs.length === 0) {
        alert('Please select at least one period to print');
        return;
      }
      
      const { data: allAttendance, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('worker_id', workerId)
        .in('status', ['clocked_out', 'completed_quota'])
        .order('clock_in', { ascending: false });

      if (error) throw error;

      // Fetch all payroll adjustments for this worker
      const { data: adjustments } = await supabase
        .from('payroll_adjustments')
        .select('*')
        .eq('worker_id', workerId);

      // Create a map of adjustments by period
      const adjustmentMap: Record<string, {
        days_override: number | null;
        ot_override: number | null;
        daily_rate_override: number | null;
        bonus: number;
        sss_deduction: number;
        deduction: number;
        deduction_remarks: string | null;
      }> = {};
      
      (adjustments || []).forEach(adj => {
        const periodKey = `${format(new Date(adj.period_start), 'MMM dd')} - ${format(new Date(adj.period_end), 'dd, yyyy')}`;
        adjustmentMap[periodKey] = {
          days_override: adj.days_override,
          ot_override: adj.ot_override,
          daily_rate_override: adj.daily_rate_override,
          bonus: adj.bonus || 0,
          sss_deduction: adj.sss_deduction || 0,
          deduction: adj.deduction || 0,
          deduction_remarks: adj.deduction_remarks
        };
      });

      // Group attendance by 7-day periods (Thursday to Wednesday) starting from Feb 6, 2026
      // Calculate days based on total hours worked (8 hours = 1 day) to match main payroll
      const weeklyData: Record<string, { totalHours: number; otHours: number; periodStart: Date; periodEnd: Date }> = {};
      const baseDate = new Date('2026-02-06');
      
      (allAttendance || []).forEach(att => {
        const date = new Date(att.clock_in);
        
        // Calculate which 7-day period this date belongs to
        const daysSinceBase = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
        const periodIndex = Math.floor(daysSinceBase / 7);
        
        const periodStart = new Date(baseDate);
        periodStart.setDate(baseDate.getDate() + (periodIndex * 7));
        
        const periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + 6);
        
        const weekKey = `${format(periodStart, 'MMM dd')} - ${format(periodEnd, 'dd, yyyy')}`;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { totalHours: 0, otHours: 0, periodStart, periodEnd };
        }
        
        // Sum hours worked and overtime hours
        weeklyData[weekKey].totalHours += att.hours_worked || 0;
        weeklyData[weekKey].otHours += att.overtime_hours || 0;
      });

      // Create print window
      const printWindow = window.open('', '', 'height=800,width=1000');
      if (!printWindow) return;
      
      printWindow.document.write('<html><head><title>Worker Payroll History</title>');
      printWindow.document.write('<style>');
      printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }');
      printWindow.document.write('h1 { text-align: center; color: #1e40af; }');
      printWindow.document.write('h2 { margin-top: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }');
      printWindow.document.write('.worker-info { margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px; }');
      printWindow.document.write('.worker-info p { margin: 5px 0; }');
      printWindow.document.write('table { width: 100%; border-collapse: collapse; margin: 20px 0; }');
      printWindow.document.write('th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }');
      printWindow.document.write('th { background-color: #1e40af; color: white; font-weight: bold; }');
      printWindow.document.write('tr:nth-child(even) { background-color: #f9fafb; }');
      printWindow.document.write('.total-row { background-color: #dbeafe !important; font-weight: bold; }');
      printWindow.document.write('.text-right { text-align: right; }');
      printWindow.document.write('</style></head><body>');
      
      printWindow.document.write('<h1>Macrock Limestone - Worker Payroll History</h1>');
      
      printWindow.document.write('<div class="worker-info">');
      printWindow.document.write(`<p><strong>Name:</strong> ${worker.full_name}</p>`);
      printWindow.document.write(`<p><strong>Employee ID:</strong> ${worker.employee_id}</p>`);
      printWindow.document.write(`<p><strong>Daily Rate:</strong> ₱${worker.daily_rate.toFixed(2)}</p>`);
      printWindow.document.write(`<p><strong>Hourly Rate:</strong> ₱${worker.hourly_rate.toFixed(2)}</p>`);
      printWindow.document.write('</div>');
      
      printWindow.document.write('<h2>Payroll History by Week</h2>');
      printWindow.document.write('<table>');
      printWindow.document.write('<thead><tr>');
      printWindow.document.write('<th>Name</th>');
      printWindow.document.write('<th class="text-right">Days</th>');
      printWindow.document.write('<th class="text-right">O.T</th>');
      printWindow.document.write('<th class="text-right">Rate</th>');
      printWindow.document.write('<th class="text-right">Bonus</th>');
      printWindow.document.write('<th class="text-right">SSS</th>');
      printWindow.document.write('<th class="text-right">Ded.</th>');
      printWindow.document.write('<th class="text-right">Total</th>');
      printWindow.document.write('<th>Signature</th>');
      printWindow.document.write('</tr></thead><tbody>');
      
      let grandTotal = 0;
      Object.entries(weeklyData)
        .filter(([period]) => selectedPeriods.has(period)) // Only include selected periods
        .forEach(([period, data]) => {
        // Get adjustments for this period if they exist
        const adj = adjustmentMap[period];
        
        // Use override values if available, otherwise calculate from attendance
        const calculatedDays = Math.floor(data.totalHours / 8);
        const days = adj?.days_override ?? calculatedDays;
        const dailyRate = adj?.daily_rate_override ?? worker.daily_rate;
        const basePay = days * dailyRate;
        
        // OT Pay - use override if available
        const otHourlyRate = dailyRate / 8;
        const calculatedOtHours = data.otHours;
        const otHours = adj?.ot_override !== null && adj?.ot_override !== undefined ? adj.ot_override : calculatedOtHours;
        
        // Get bonus, SSS, and deductions from adjustments
        const bonus = adj?.bonus ?? 0;
        const sss = adj?.sss_deduction ?? 0;
        const deduction = adj?.deduction ?? 0;
        
        // Total = Base Pay + OT Pay + Bonus - SSS - Deduction
        const total = basePay + (otHours * otHourlyRate) + bonus - sss - deduction;
        grandTotal += total;
        
        printWindow.document.write('<tr>');
        printWindow.document.write(`<td>${worker.full_name}</td>`);
        printWindow.document.write(`<td class="text-right">${days}</td>`);
        printWindow.document.write(`<td class="text-right">${otHours > 0 ? otHours.toFixed(0) : '-'}</td>`);
        printWindow.document.write(`<td class="text-right">${dailyRate.toFixed(0)}</td>`);
        printWindow.document.write(`<td class="text-right">${bonus > 0 ? bonus.toFixed(0) : '-'}</td>`);
        printWindow.document.write(`<td class="text-right">${sss > 0 ? sss.toFixed(0) : '-'}</td>`);
        printWindow.document.write(`<td class="text-right">${deduction > 0 ? deduction.toFixed(0) : '-'}</td>`);
        printWindow.document.write(`<td class="text-right">₱${total.toFixed(2)}</td>`);
        printWindow.document.write(`<td>________</td>`);
        printWindow.document.write('</tr>');
      });
      
      printWindow.document.write('<tr class="total-row">');
      printWindow.document.write('<td colspan="7" class="text-right">GRAND TOTAL</td>');
      printWindow.document.write(`<td class="text-right">₱${grandTotal.toFixed(2)}</td>`);
      printWindow.document.write('<td></td>');
      printWindow.document.write('</tr>');
      
      printWindow.document.write('</tbody></table>');
      printWindow.document.write(`<p style="margin-top: 30px; text-align: center; color: #6b7280;">Printed on ${format(new Date(), 'MMMM dd, yyyy')}</p>`);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('Error printing worker payroll:', error);
      alert('Failed to load worker payroll history');
    }
  };

  const updateWorkerValue = async (workerId: string, field: 'days' | 'ot' | 'dailyRate' | 'bonus' | 'sss' | 'deduction' | 'deductionRemarks', value: number | string) => {
    const current = editedValues[workerId] || { days: null, ot: null, dailyRate: null, bonus: 0, sss: 0, deduction: 0, deductionRemarks: '' };
    const updated = {
      ...current,
      [field]: value
    };
    
    setEditedValues(prev => ({
      ...prev,
      [workerId]: updated
    }));

    await saveAdjustment(workerId, updated);
  };

  const goToPreviousWeek = () => {
    const newStart = new Date(dateRange.start);
    newStart.setDate(newStart.getDate() - 7);
    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + 6);
    const newRange = { start: newStart, end: newEnd };
    setDateRange(newRange);
    localStorage.setItem('payrollPeriod', JSON.stringify(newRange));
  };

  const goToNextWeek = () => {
    const newStart = new Date(dateRange.start);
    newStart.setDate(newStart.getDate() + 7);
    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + 6);
    const newRange = { start: newStart, end: newEnd };
    setDateRange(newRange);
    localStorage.setItem('payrollPeriod', JSON.stringify(newRange));
  };

  // Calculate subtotal (before SSS/deductions) for a worker
  const getWorkerSubtotal = (item: PayrollData) => {
    const edited = editedValues[item.worker.id] || { days: null, ot: null, dailyRate: null, bonus: 0, sss: 0, deduction: 0, deductionRemarks: '' };
    const days = edited.days !== null ? edited.days : item.days;
    const dailyRate = edited.dailyRate !== null ? edited.dailyRate : item.dailyRate;
    // OT is stored as HOURS, calculate pay using hourly rate (daily_rate / 8)
    const otHours = edited.ot !== null ? edited.ot : item.overtime;
    const hourlyRate = dailyRate / 8;
    const overtimePay = otHours * hourlyRate;
    const basePay = days * dailyRate;
    
    // Subtotal = Base Pay + OT Pay + Bonus (before SSS and deductions)
    return basePay + overtimePay + edited.bonus;
  };

  // Calculate total (after SSS/deductions) for a worker
  const getWorkerTotal = (item: PayrollData) => {
    const edited = editedValues[item.worker.id] || { days: null, ot: null, dailyRate: null, bonus: 0, sss: 0, deduction: 0, deductionRemarks: '' };
    const subtotal = getWorkerSubtotal(item);
    // Total = Subtotal - SSS - Deduction (same for all workers)
    return subtotal - edited.sss - edited.deduction;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Days', 'O.T', 'Daily Rate', 'SSS NOV', 'Total'];
    const rows = payrollData.map((p) => [
      p.worker.full_name,
      p.days,
      p.overtime.toFixed(1),
      p.dailyRate,
      p.sssDeduction.toFixed(2),
      p.total.toFixed(2),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission_schedule_${format(dateRange.start, 'MMM-dd')}_${format(dateRange.end, 'MMM-dd')}.csv`;
    a.click();
  };

  // Calculate totals using the helper functions
  const subtotal = payrollData.reduce((sum, p) => sum + getWorkerSubtotal(p), 0);
  
  const totalSSS = payrollData.reduce((sum, p) => {
    const edited = editedValues[p.worker.id] || { days: null, ot: null, dailyRate: null, bonus: 0, sss: 0, deduction: 0, deductionRemarks: '' };
    return sum + edited.sss;
  }, 0);

  const totalDeductions = payrollData.reduce((sum, p) => {
    const edited = editedValues[p.worker.id] || { days: null, ot: null, dailyRate: null, bonus: 0, sss: 0, deduction: 0, deductionRemarks: '' };
    return sum + edited.deduction;
  }, 0);
  
  const grandTotal = payrollData.reduce((sum, p) => sum + getWorkerTotal(p), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 rounded-lg print:bg-blue-500">
        <h1 className="text-3xl font-bold text-center">Macrock Limestone</h1>
        <p className="text-center text-blue-100 mt-2">
          Period Covered: {format(dateRange.start, 'MMM dd')} - {format(dateRange.end, dateRange.start.getMonth() !== dateRange.end.getMonth() ? 'MMM dd, yyyy' : 'dd, yyyy')}
        </p>
      </div>

      {/* Weekly Period Selector */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center w-56">
              <h3 className="text-lg font-semibold text-gray-900">
                {format(dateRange.start, 'MMM dd').toUpperCase()} - {format(dateRange.end, dateRange.start.getMonth() !== dateRange.end.getMonth() ? 'MMM dd, yyyy' : 'dd, yyyy').toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500">Period of {format(dateRange.start, 'MMMM dd, yyyy')}</p>
            </div>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Commission Schedule Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 px-6 py-3 border-b border-blue-200">
          <h2 className="text-lg font-bold text-gray-900 text-center">COMMISSION SCHEDULE</h2>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-500">Calculating payroll...</p>
          </div>
        ) : payrollData.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No attendance records found for the selected period.
          </div>
        ) : (
          <div ref={containerRef} className="overflow-x-auto">
            {colWidths && (
            <table ref={tableRef} className="border-collapse" style={{ tableLayout: 'fixed', width: `${colWidths.name + colWidths.days + colWidths.ot + colWidths.rate + colWidths.bonus + colWidths.sss + colWidths.ded + colWidths.subtotal + colWidths.total + colWidths.signature + colWidths.actions}px` }}>
              <colgroup>
                <col style={{ width: `${colWidths.name}px`, minWidth: `${colWidths.name}px`, maxWidth: `${colWidths.name}px` }} />
                <col style={{ width: `${colWidths.days}px`, minWidth: `${colWidths.days}px`, maxWidth: `${colWidths.days}px` }} />
                <col style={{ width: `${colWidths.ot}px`, minWidth: `${colWidths.ot}px`, maxWidth: `${colWidths.ot}px` }} />
                <col style={{ width: `${colWidths.rate}px`, minWidth: `${colWidths.rate}px`, maxWidth: `${colWidths.rate}px` }} />
                <col style={{ width: `${colWidths.bonus}px`, minWidth: `${colWidths.bonus}px`, maxWidth: `${colWidths.bonus}px` }} />
                <col style={{ width: `${colWidths.sss}px`, minWidth: `${colWidths.sss}px`, maxWidth: `${colWidths.sss}px` }} />
                <col style={{ width: `${colWidths.ded}px`, minWidth: `${colWidths.ded}px`, maxWidth: `${colWidths.ded}px` }} />
                <col style={{ width: `${colWidths.subtotal}px`, minWidth: `${colWidths.subtotal}px`, maxWidth: `${colWidths.subtotal}px` }} />
                <col style={{ width: `${colWidths.total}px`, minWidth: `${colWidths.total}px`, maxWidth: `${colWidths.total}px` }} />
                <col style={{ width: `${colWidths.signature}px`, minWidth: `${colWidths.signature}px`, maxWidth: `${colWidths.signature}px` }} />
                <col style={{ width: `${colWidths.actions}px`, minWidth: `${colWidths.actions}px`, maxWidth: `${colWidths.actions}px` }} className="print:hidden" />
              </colgroup>
              <thead className="bg-gray-50 border-b-2 border-gray-300">
                <tr>
                  <th className="relative px-2 py-2 text-left text-sm font-bold text-gray-700 border-r border-gray-300 select-none">
                    Name
                    <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400" onMouseDown={(e) => handleMouseDown(e, 'name')} />
                  </th>
                  <th className="relative px-1 py-2 text-center text-sm font-bold text-gray-700 border-r border-gray-300 select-none">
                    DAYS
                    <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400" onMouseDown={(e) => handleMouseDown(e, 'days')} />
                  </th>
                  <th className="relative px-1 py-2 text-center text-sm font-bold text-gray-700 border-r border-gray-300 select-none">
                    O.T
                    <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400" onMouseDown={(e) => handleMouseDown(e, 'ot')} />
                  </th>
                  <th className="relative px-1 py-2 text-center text-sm font-bold text-gray-700 border-r border-gray-300 select-none">
                    Rate
                    <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400" onMouseDown={(e) => handleMouseDown(e, 'rate')} />
                  </th>
                  <th className="relative px-1 py-2 text-center text-sm font-bold text-gray-700 border-r border-gray-300 select-none">
                    Bonus
                    <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400" onMouseDown={(e) => handleMouseDown(e, 'bonus')} />
                  </th>
                  <th className="relative px-1 py-2 text-center text-sm font-bold text-gray-700 border-r border-gray-300 select-none">
                    SSS
                    <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400" onMouseDown={(e) => handleMouseDown(e, 'sss')} />
                  </th>
                  <th className="relative px-1 py-2 text-center text-sm font-bold text-gray-700 border-r border-gray-300 select-none">
                    Ded.
                    <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400" onMouseDown={(e) => handleMouseDown(e, 'ded')} />
                  </th>
                  <th className="relative px-1 py-2 text-right text-sm font-bold text-gray-700 border-r border-gray-300 select-none">
                    Subtotal
                    <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400" onMouseDown={(e) => handleMouseDown(e, 'subtotal')} />
                  </th>
                  <th className="relative px-1 py-2 text-right text-sm font-bold text-gray-700 border-r border-gray-300 select-none">
                    Total
                    <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400" onMouseDown={(e) => handleMouseDown(e, 'total')} />
                  </th>
                  <th className="relative px-1 py-2 text-center text-sm font-bold text-gray-700 border-r border-gray-300 select-none hidden print:table-cell">
                    Signature
                    <div className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-400" onMouseDown={(e) => handleMouseDown(e, 'signature')} />
                  </th>
                  <th className="px-1 py-2 text-center text-sm font-bold text-gray-700 print:hidden">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrollData
                  .sort((a, b) => {
                    // Sort Bacol and Ylagan to the top
                    const aName = a.worker.full_name.toLowerCase();
                    const bName = b.worker.full_name.toLowerCase();
                    const aIsBacol = aName.includes('bacol') && aName.includes('vivian');
                    const bIsBacol = bName.includes('bacol') && bName.includes('vivian');
                    const aIsYlagan = aName.includes('ylagan') && aName.includes('robert');
                    const bIsYlagan = bName.includes('ylagan') && bName.includes('robert');
                    
                    if (aIsBacol) return -1;
                    if (bIsBacol) return 1;
                    if (aIsYlagan) return -1;
                    if (bIsYlagan) return 1;
                    
                    // Otherwise keep alphabetical order
                    return a.worker.full_name.localeCompare(b.worker.full_name);
                  })
                  .map((item) => {
                  const edited = editedValues[item.worker.id] || { days: null, ot: null, dailyRate: null, bonus: 0, sss: 0, deduction: 0, deductionRemarks: '' };
                  const workerTotal = getWorkerTotal(item);
                  
                  return (
                    <tr key={item.worker.id} className="hover:bg-gray-50">
                      <td className="px-2 py-1.5 text-sm text-gray-900 border-r border-gray-200 truncate">
                        {item.worker.full_name}
                      </td>
                      <td className="px-1 py-1.5 text-sm text-center text-gray-900 border-r border-gray-200">
                        {isAdmin ? (
                          <input
                            type="number"
                            value={edited.days !== null ? edited.days : item.days}
                            onChange={(e) => updateWorkerValue(item.worker.id, 'days', parseFloat(e.target.value) || 0)}
                            className="w-full px-1 py-0.5 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 print:border-0"
                            min="0"
                          />
                        ) : (
                          <span>{edited.days !== null ? edited.days : item.days}</span>
                        )}
                      </td>
                      <td className="px-1 py-1.5 text-sm text-center text-gray-900 border-r border-gray-200">
                        {isAdmin ? (
                          <input
                            type="number"
                            value={edited.ot !== null ? edited.ot : item.overtime}
                            onChange={(e) => updateWorkerValue(item.worker.id, 'ot', parseFloat(e.target.value) || 0)}
                            className="w-full px-1 py-0.5 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 print:border-0"
                            min="0"
                          />
                        ) : (
                          <span>{(edited.ot !== null ? edited.ot : item.overtime) > 0 ? (edited.ot !== null ? edited.ot : item.overtime).toFixed(0) : '-'}</span>
                        )}
                      </td>
                      <td className="px-1 py-1.5 text-sm text-center text-gray-900 border-r border-gray-200">
                        {isAdmin ? (
                          <input
                            type="number"
                            value={edited.dailyRate !== null ? edited.dailyRate : item.dailyRate}
                            onChange={(e) => updateWorkerValue(item.worker.id, 'dailyRate', parseFloat(e.target.value) || 0)}
                            className="w-full px-1 py-0.5 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 print:border-0"
                            min="0"
                          />
                        ) : (
                          <span>{(edited.dailyRate !== null ? edited.dailyRate : item.dailyRate).toFixed(0)}</span>
                        )}
                      </td>
                      <td className="px-1 py-1.5 text-sm text-center text-gray-900 border-r border-gray-200">
                        {isAdmin ? (
                          <input
                            type="number"
                            value={edited.bonus || ''}
                            onChange={(e) => updateWorkerValue(item.worker.id, 'bonus', parseFloat(e.target.value) || 0)}
                            className="w-full px-1 py-0.5 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 print:border-0"
                            placeholder="0"
                          />
                        ) : (
                          <span>{edited.bonus || '-'}</span>
                        )}
                      </td>
                      <td className="px-1 py-1.5 text-sm text-center text-gray-900 border-r border-gray-200">
                        {isAdmin ? (
                          <input
                            type="number"
                            value={edited.sss || ''}
                            onChange={(e) => updateWorkerValue(item.worker.id, 'sss', parseFloat(e.target.value) || 0)}
                            className="w-full px-1 py-0.5 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 print:border-0"
                            placeholder="0"
                          />
                        ) : (
                          <span>{edited.sss || '-'}</span>
                        )}
                      </td>
                      <td className="px-1 py-1.5 text-sm text-center text-gray-900 border-r border-gray-200">
                        {isAdmin ? (
                          <div className="flex items-center justify-center gap-0.5">
                            <input
                              type="number"
                              value={edited.deduction || ''}
                              onChange={(e) => updateWorkerValue(item.worker.id, 'deduction', parseFloat(e.target.value) || 0)}
                              className="w-full px-1 py-0.5 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 print:border-0"
                              placeholder="0"
                            />
                            {edited.deduction > 0 && (
                              <button
                                onClick={() => setRemarksModal({ isOpen: true, workerName: item.worker.full_name, remarks: edited.deductionRemarks || '', workerId: item.worker.id })}
                                className={`p-0.5 rounded ${edited.deductionRemarks ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
                                title={edited.deductionRemarks || 'Add remarks'}
                              >
                                <MessageSquare className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-0.5">
                            <span>{edited.deduction || '-'}</span>
                            {edited.deduction > 0 && edited.deductionRemarks && (
                              <button
                                onClick={() => setRemarksModal({ isOpen: true, workerName: item.worker.full_name, remarks: edited.deductionRemarks, workerId: item.worker.id })}
                                className="p-0.5 text-blue-600 hover:text-blue-800"
                                title="View remarks"
                              >
                                <MessageSquare className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1.5 text-sm text-right text-gray-900 border-r border-gray-200">
                        {formatCurrency(getWorkerSubtotal(item))}
                      </td>
                      <td className="px-1 py-1.5 text-sm text-right font-semibold text-gray-900 border-r border-gray-200">
                        {formatCurrency(workerTotal)}
                      </td>
                      <td className="px-1 py-1.5 text-sm text-center text-gray-400 border-r border-gray-200 hidden print:table-cell">
                        ________
                      </td>
                      <td className="px-1 py-1.5 text-sm text-center print:hidden">
                        <button
                          onClick={() => openPeriodSelection(item.worker.id, item.worker.full_name)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="Print payroll history"
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {/* Subtotal Row (before SSS) */}
                <tr className="bg-gray-50 border-t border-gray-300">
                  <td colSpan={7} className="px-2 py-1.5 text-sm font-semibold text-gray-700 text-right border-r border-gray-300">
                    SUBTOTAL
                  </td>
                  <td className="px-1 py-1.5 text-sm font-semibold text-right text-gray-700 border-r border-gray-300">
                    {formatCurrency(subtotal)}
                  </td>
                  <td colSpan={3} className="px-1 py-1.5"></td>
                </tr>
                {/* SSS Deduction Row */}
                <tr className="bg-gray-50">
                  <td colSpan={7} className="px-2 py-1.5 text-sm font-semibold text-red-600 text-right border-r border-gray-300">
                    TOTAL SSS
                  </td>
                  <td className="px-1 py-1.5 text-sm font-semibold text-right text-red-600 border-r border-gray-300">
                    -{formatCurrency(totalSSS)}
                  </td>
                  <td colSpan={3} className="px-1 py-1.5"></td>
                </tr>
                {/* Deductions Row */}
                <tr className="bg-gray-50">
                  <td colSpan={7} className="px-2 py-1.5 text-sm font-semibold text-red-600 text-right border-r border-gray-300">
                    TOTAL DEDUCTIONS
                  </td>
                  <td className="px-1 py-1.5 text-sm font-semibold text-right text-red-600 border-r border-gray-300">
                    -{formatCurrency(totalDeductions)}
                  </td>
                  <td colSpan={3} className="px-1 py-1.5"></td>
                </tr>
                {/* Grand Total Row (after SSS) */}
                <tr className="bg-blue-50 border-t-2 border-blue-300">
                  <td colSpan={8} className="px-2 py-2 text-sm font-bold text-gray-900 text-right border-r border-gray-300">
                    GRAND TOTAL
                  </td>
                  <td className="px-1 py-2 text-sm font-bold text-right text-gray-900 border-r border-gray-300">
                    {formatCurrency(grandTotal)}
                  </td>
                  <td colSpan={2} className="px-1 py-2"></td>
                </tr>
              </tbody>
            </table>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 print:block">
        <p className="mt-8">Prepared by:</p>
        <p className="mt-2 font-semibold text-gray-700">_______________________</p>
        <p className="text-xs text-gray-400 mt-8">Powered by Raijin Tech</p>
      </div>

      {/* Deduction Remarks Modal */}
      {remarksModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Deduction Remarks</h3>
              <p className="text-sm text-gray-500">{remarksModal.workerName}</p>
            </div>
            <div className="px-6 py-4">
              {isAdmin ? (
                <textarea
                  value={remarksModal.remarks}
                  onChange={(e) => setRemarksModal(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter deduction remarks..."
                />
              ) : (
                <p className="text-gray-700">{remarksModal.remarks || 'No remarks'}</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setRemarksModal({ isOpen: false, workerName: '', remarks: '', workerId: '' })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {isAdmin ? 'Cancel' : 'Close'}
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    updateWorkerValue(remarksModal.workerId, 'deductionRemarks', remarksModal.remarks);
                    setRemarksModal({ isOpen: false, workerName: '', remarks: '', workerId: '' });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Period Selection Modal */}
      <Modal
        isOpen={periodSelectionModal.isOpen}
        onClose={() => setPeriodSelectionModal({ isOpen: false, workerId: '', workerName: '' })}
        title={`Select Periods for ${periodSelectionModal.workerName}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select the weeks you want to include in the payroll history printout:
          </p>
          
          <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-4">
            {availablePeriods.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No payroll periods found for this worker</p>
            ) : (
              availablePeriods.map((period) => (
                <label
                  key={period.label}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedPeriods.has(period.label)}
                    onChange={() => togglePeriodSelection(period.label)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{period.label}</span>
                </label>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {selectedPeriods.size} period{selectedPeriods.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setPeriodSelectionModal({ isOpen: false, workerId: '', workerName: '' })}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handlePrintWorkerWithPeriods}
                disabled={selectedPeriods.size === 0}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Selected
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
