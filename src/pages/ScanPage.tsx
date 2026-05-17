import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { differenceInMinutes } from 'date-fns';
import { QRScanner } from '../components/qr/QRScanner';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useWorkerStore } from '../stores/workerStore';
import { useAttendanceStore } from '../stores/attendanceStore';
import { useAuthStore } from '../stores/authStore';
import { isScanAllowed } from '../lib/attendanceHelpers';
import { formatTime, formatCurrency } from '../lib/utils';
import { CheckCircle, Clock, Package, AlertCircle, Timer, Zap } from 'lucide-react';
import type { Worker, AttendanceWithWorker } from '../types/database';

export const ScanPage: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const { workers, fetchWorkers, getWorkerByQR } = useWorkerStore();
  const {
    todayRecords,
    fetchTodayAttendance,
    clockIn,
    clockOut,
    markCompletedByQuota,
    otClockIn,
    otClockOut,
    getActiveAttendance,
    isLoading,
    error,
    clearError,
  } = useAttendanceStore();

  const [scannedWorker, setScannedWorker] = useState<Worker | null>(null);
  const [activeAttendance, setActiveAttendance] = useState<AttendanceWithWorker | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [bagsCompleted, setBagsCompleted] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCustomBreakInput, setShowCustomBreakInput] = useState(false);
  const [customBreakMins, setCustomBreakMins] = useState('');
  
  // OT Mode state
  const [isOTMode, setIsOTMode] = useState(false);
  const isOTModeRef = React.useRef(false);
  
  // Keep ref in sync with state
  React.useEffect(() => {
    isOTModeRef.current = isOTMode;
  }, [isOTMode]);
  
  // Global cooldown: timestamp of last successful action
  const lastActionTimeRef = React.useRef<number>(0);
  // Per-worker cooldown: maps worker_id → timestamp of last successful action
  const workerCooldownMap = React.useRef<Map<string, number>>(new Map());
  
  const ACTION_COOLDOWN_MS = 10_000;
  
  const isManager = user?.role === 'manager' || user?.role === 'admin';
  
  // Live time counter - updates every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Calculate duration from clock_in time
  const getWorkDuration = useCallback((clockIn: string) => {
    const start = new Date(clockIn);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  useEffect(() => {
    fetchWorkers();
    fetchTodayAttendance();
  }, [fetchWorkers, fetchTodayAttendance]);

  const handleScan = async (qrCode: string) => {
    if (isProcessing) return;
    
    const now = Date.now();

    // Global cooldown: block all scans for 10 seconds after any successful action
    if (!isScanAllowed(now, lastActionTimeRef.current, ACTION_COOLDOWN_MS)) {
      return;
    }
    
    setIsProcessing(true);
    clearError();
    setMessage(null);

    const worker = getWorkerByQR(qrCode);
    
    if (!worker) {
      setMessage({ type: 'error', text: 'Worker not found. Invalid QR code.' });
      setIsProcessing(false);
      return;
    }

    // Per-worker cooldown
    const workerLastAction = workerCooldownMap.current.get(worker.id) || 0;
    if (!isScanAllowed(now, workerLastAction, ACTION_COOLDOWN_MS)) {
      setIsProcessing(false);
      return;
    }

    // If in OT mode, handle OT clock in/out (use ref to avoid stale closure)
    const currentOTMode = isOTModeRef.current;
    if (currentOTMode) {
      // Check if worker has active OT session (ot_clock_in but no ot_clock_out)
      const todayRecord = todayRecords.find(
        (r) => r.worker_id === worker.id && (r.status === 'clocked_in' || r.status === 'clocked_out')
      );

      if (!todayRecord) {
        setMessage({ type: 'error', text: `${worker.full_name} must clock in for regular hours first.` });
        setIsProcessing(false);
        setIsOTMode(false);
        return;
      }

      // Check if already in OT session
      if (todayRecord.ot_clock_in && !todayRecord.ot_clock_out) {
        // Instead of immediate clock out, show the modal to ask for break deduction
        setScannedWorker(worker);
        setActiveAttendance(todayRecord);
        setShowQuotaModal(true);
        setIsProcessing(false);
        return;
      } else {
        // OT Clock In
        const success = await otClockIn(worker.id);
        if (success) {
          setMessage({ type: 'success', text: `${worker.full_name} OT clocked in!` });
          lastActionTimeRef.current = Date.now();
          workerCooldownMap.current.set(worker.id, Date.now());
          fetchTodayAttendance();
        } else {
          // Get the error from the store and show it
          const storeError = useAttendanceStore.getState().error;
          setMessage({ type: 'error', text: storeError || `Failed to clock in OT for ${worker.full_name}.` });
        }
      }

      setIsOTMode(false);
      setIsProcessing(false);
      return;
    }

    setScannedWorker(worker);
    const active = getActiveAttendance(worker.id);
    setActiveAttendance(active || null);

    if (active) {
      // Prevent double-scan clock-out: only show clock-out modal if shift has been active for 15+ minutes
      const clockInTime = new Date(active.clock_in).getTime();
      const elapsedMinutes = (Date.now() - clockInTime) / 60000;
      if (elapsedMinutes < 15) {
        const remainingMinutes = Math.ceil(15 - elapsedMinutes);
        setMessage({ type: 'error', text: `${worker.full_name} just clocked in. Cannot clock out for ${remainingMinutes} more minute(s).` });
        setIsProcessing(false);
        return;
      }
      setShowQuotaModal(true);
    } else {
      const result = await clockIn(worker.id, user?.id || '');
      if (result) {
        setMessage({ type: 'success', text: `${worker.full_name} clocked in successfully!` });
        lastActionTimeRef.current = Date.now();
        workerCooldownMap.current.set(worker.id, Date.now());
      }
    }

    setIsProcessing(false);
  };


  const handleClockOut = async () => {
    if (!activeAttendance) return;
    
    await clockOut(activeAttendance.id);
    setMessage({ type: 'success', text: `${scannedWorker?.full_name} clocked out successfully!` });
    lastActionTimeRef.current = Date.now();
    if (scannedWorker) {
      workerCooldownMap.current.set(scannedWorker.id, Date.now());
    }
    setShowQuotaModal(false);
    setScannedWorker(null);
    setActiveAttendance(null);
    fetchTodayAttendance();
  };

  const handleQuotaComplete = async () => {
    if (!activeAttendance || !bagsCompleted) return;
    
    await markCompletedByQuota(activeAttendance.id, parseInt(bagsCompleted), notes);
    setMessage({ type: 'success', text: `${scannedWorker?.full_name} marked as quota completed!` });
    lastActionTimeRef.current = Date.now();
    if (scannedWorker) {
      workerCooldownMap.current.set(scannedWorker.id, Date.now());
    }
    setShowQuotaModal(false);
    setScannedWorker(null);
    setActiveAttendance(null);
    setBagsCompleted('');
    setNotes('');
    fetchTodayAttendance();
  };

  const handleOTClockOut = async (breakMinutes: number = 0) => {
    if (!scannedWorker) return;
    
    const success = await otClockOut(scannedWorker.id, breakMinutes);
    if (success) {
      setMessage({ type: 'success', text: `${scannedWorker.full_name} OT clocked out!${breakMinutes > 0 ? ` (${breakMinutes}m break deducted)` : ''}` });
      lastActionTimeRef.current = Date.now();
      workerCooldownMap.current.set(scannedWorker.id, Date.now());
    } else {
      const storeError = useAttendanceStore.getState().error;
      setMessage({ type: 'error', text: storeError || `Failed to clock out OT for ${scannedWorker.full_name}.` });
    }
    setShowCustomBreakInput(false);
    setCustomBreakMins('');
    setShowQuotaModal(false);
    setScannedWorker(null);
    setActiveAttendance(null);
    setIsOTMode(false);
    fetchTodayAttendance();
  };

  // Check if worker is currently in OT session
  const isWorkerInOT = activeAttendance?.ot_clock_in && !activeAttendance?.ot_clock_out;

  return (
    <div className={`-m-8 p-8 min-h-screen space-y-6 transition-colors duration-500 ease-in-out ${isOTMode ? 'bg-orange-50/80' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scan QR Code</h1>
          <p className="text-gray-500">Scan worker QR codes to clock in/out</p>
        </div>
        {isManager && (
          <Button
            variant={isOTMode ? 'danger' : 'secondary'}
            onClick={() => setIsOTMode(!isOTMode)}
            className="flex items-center gap-2"
          >
            <Timer className="w-5 h-5" />
            {isOTMode ? 'Cancel OT Mode' : 'Add Overtime'}
          </Button>
        )}
      </div>

      {isOTMode && (
        <div className="p-4 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 flex items-center gap-3">
          <Timer className="w-5 h-5" />
          <span className="font-medium">OT Mode Active:</span> Scan worker QR code to add overtime hours
        </div>
      )}

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QRScanner key={location.pathname} onScan={handleScan} isProcessing={isProcessing} />
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Currently Working</h2>
          </CardHeader>
          <CardContent className="p-0">
            {todayRecords.filter((r) => r.status === 'clocked_in').length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No workers currently clocked in
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {todayRecords
                  .filter((r) => r.status === 'clocked_in')
                  .map((record) => (
                    <div
                      key={record.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {record.worker?.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Clocked in at {formatTime(record.clock_in)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.ot_clock_in && !record.ot_clock_out && (
                          <Badge variant="warning">
                            <Zap className="w-3 h-3 mr-1" />
                            OT since {formatTime(record.ot_clock_in)}
                          </Badge>
                        )}
                        {differenceInMinutes(new Date(), new Date(record.clock_in)) >= 480 && (
                          <Badge variant="danger">
                            Overdue
                          </Badge>
                        )}
                        <Badge variant="success">
                          <Timer className="w-3 h-3 mr-1" />
                          {getWorkDuration(record.clock_in)}
                        </Badge>
                        <Badge variant="info">
                          <Clock className="w-3 h-3 mr-1" />
                          Working
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            
            {/* Clocked Out Section */}
            {todayRecords.filter((r) => r.status === 'clocked_out' || r.status === 'completed_quota').length > 0 && (
              <>
                <div className="bg-gray-100 px-4 py-2 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-600">Clocked Out Today</h3>
                </div>
                <div className="divide-y divide-gray-200 max-h-48 overflow-y-auto">
                  {todayRecords
                    .filter((r) => r.status === 'clocked_out' || r.status === 'completed_quota')
                    .map((record) => (
                      <div
                        key={record.id}
                        className="p-3 flex items-center justify-between hover:bg-gray-50 bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-700 text-sm">
                            {record.worker?.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(record.clock_in)} - {record.clock_out ? formatTime(record.clock_out) : 'N/A'}
                          </p>
                          {record.ot_clock_in && (
                            <p className="text-xs text-orange-600 mt-0.5">
                              OT: {formatTime(record.ot_clock_in)} - {record.ot_clock_out ? formatTime(record.ot_clock_out) : 'N/A'}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {record.hours_worked && (
                            <Badge variant="default">
                              <Clock className="w-3 h-3 mr-1" />
                              {record.hours_worked.toFixed(1)}h
                            </Badge>
                          )}
                          {record.overtime_hours && record.overtime_hours > 0 && (
                            <Badge variant="warning">
                              <Zap className="w-3 h-3 mr-1" />
                              +{record.overtime_hours.toFixed(1)}h OT
                            </Badge>
                          )}
                          <Badge variant={record.status === 'completed_quota' ? 'success' : 'default'}>
                            {record.status === 'completed_quota' ? 'Quota' : 'Out'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={showQuotaModal}
        onClose={() => {
          setShowQuotaModal(false);
          setScannedWorker(null);
          setActiveAttendance(null);
          setShowCustomBreakInput(false);
          setCustomBreakMins('');
        }}
        title={isWorkerInOT ? "OT Clock Out" : "Clock Out Options"}
        size="md"
      >
        {scannedWorker && activeAttendance && (
          <div className="space-y-6">
            <div className={`rounded-lg p-4 ${isWorkerInOT ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{scannedWorker.full_name}</h3>
                {isWorkerInOT && (
                  <Badge variant="warning">
                    <Zap className="w-3 h-3 mr-1" />
                    In OT
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">ID: {scannedWorker.employee_id}</p>
              <p className="text-sm text-gray-500">
                Clocked in at: {formatTime(activeAttendance.clock_in)}
              </p>
              {isWorkerInOT && activeAttendance.ot_clock_in && (
                <p className="text-sm text-orange-600 font-medium">
                  OT started at: {formatTime(activeAttendance.ot_clock_in)}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Daily Rate: {formatCurrency(scannedWorker.daily_rate)}
              </p>
            </div>

            {isWorkerInOT ? (
              /* OT Clock Out UI */
              <div className="space-y-4">
                <p className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
                  This worker is currently in an <strong>overtime session</strong>. Did they take a break?
                </p>
                
                {!showCustomBreakInput ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="w-full py-4 border-gray-300 hover:bg-gray-50"
                      onClick={() => handleOTClockOut(0)}
                      isLoading={isLoading}
                    >
                      No Break
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full py-4 border-gray-300 hover:bg-gray-50"
                      onClick={() => handleOTClockOut(30)}
                      isLoading={isLoading}
                    >
                      30 Mins
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full py-4 border-gray-300 hover:bg-gray-50 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      onClick={() => handleOTClockOut(60)}
                      isLoading={isLoading}
                    >
                      1 Hour
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full py-4"
                      onClick={() => setShowCustomBreakInput(true)}
                      disabled={isLoading}
                    >
                      Custom
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-700">Enter custom break minutes:</p>
                    <Input
                      type="number"
                      value={customBreakMins}
                      onChange={(e) => setCustomBreakMins(e.target.value)}
                      placeholder="e.g. 45"
                      min="0"
                    />
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowCustomBreakInput(false);
                          setCustomBreakMins('');
                        }}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={() => handleOTClockOut(parseInt(customBreakMins) || 0)}
                        isLoading={isLoading}
                        disabled={!customBreakMins}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Regular Clock Out UI */
              <div className="space-y-4">
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  onClick={handleClockOut}
                  isLoading={isLoading}
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Regular Clock Out
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Mark as Quota Completed (Early finish)
                  </p>
                  <Input
                    label="Bags Completed"
                    type="number"
                    value={bagsCompleted}
                    onChange={(e) => setBagsCompleted(e.target.value)}
                    placeholder="Enter number of bags"
                  />
                  <Input
                    label="Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes"
                  />
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleQuotaComplete}
                    disabled={!bagsCompleted}
                    isLoading={isLoading}
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Complete by Quota
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};
