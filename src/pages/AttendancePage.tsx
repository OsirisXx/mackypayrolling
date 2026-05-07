import React, { useEffect, useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download, Edit2, Search, Trash2, User, X, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { useAttendanceStore } from '../stores/attendanceStore';
import { useAuthStore } from '../stores/authStore';
import { useWorkerStore } from '../stores/workerStore';
import { supabase } from '../lib/supabase';
import { formatDate, formatDateTime, formatTime, formatHours } from '../lib/utils';
import type { AttendanceWithWorker } from '../types/database';

export const AttendancePage: React.FC = () => {
  const { user } = useAuthStore();
  const { attendanceRecords, fetchAttendance, softDeleteAttendance, isLoading } = useAttendanceStore();
  const { workers, fetchWorkers } = useWorkerStore();
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });
  const [editingRecord, setEditingRecord] = useState<AttendanceWithWorker | null>(null);
  const [editForm, setEditForm] = useState({
    clockIn: '',
    clockOut: '',
    hoursWorked: '',
    overtimeHours: '',
    status: '',
    bagsCompleted: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [workerAttendance, setWorkerAttendance] = useState<AttendanceWithWorker[]>([]);
  const [isLoadingWorkerAttendance, setIsLoadingWorkerAttendance] = useState(false);

  // Soft delete state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<AttendanceWithWorker | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageSizeOptions = [10, 25, 50, 100];

  const isAdmin = user?.role === 'admin';
  
  // Use worker-specific attendance if a worker is selected, otherwise use date-filtered records
  const displayRecords = selectedWorkerId ? workerAttendance : attendanceRecords;
  
  // Filter attendance records based on search query
  const filteredRecords = displayRecords.filter((record) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      record.worker?.full_name?.toLowerCase().includes(query) ||
      record.worker?.employee_id?.toLowerCase().includes(query)
    );
  });
  
  const selectedWorker = workers.find(w => w.id === selectedWorkerId);

  // Pagination logic
  const totalRecords = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safeCurrentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedWorkerId, dateRange, pageSize]);

  useEffect(() => {
    fetchWorkers();
    if (!selectedWorkerId) {
      fetchAttendance(dateRange.start, dateRange.end);
    }
  }, [fetchWorkers, fetchAttendance, dateRange, selectedWorkerId]);

  // Fetch all attendance records for selected worker
  const handleWorkerSelect = async (workerId: string) => {
    setSelectedWorkerId(workerId);
    setSearchQuery(''); // Clear search when selecting worker
    setIsLoadingWorkerAttendance(true);
    
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          worker:workers(*)
        `)
        .eq('worker_id', workerId)
        .is('deleted_at', null)
        .order('clock_in', { ascending: false });
      
      if (error) throw error;
      setWorkerAttendance(data || []);
    } catch (error) {
      console.error('Error fetching worker attendance:', error);
      setWorkerAttendance([]);
    } finally {
      setIsLoadingWorkerAttendance(false);
    }
  };

  const handleClearWorkerSelection = () => {
    setSelectedWorkerId(null);
    setWorkerAttendance([]);
    fetchAttendance(dateRange.start, dateRange.end);
  };

  // --- Soft delete handlers ---
  const handleDeleteRecord = (record: AttendanceWithWorker) => {
    setRecordToDelete(record);
    setShowDeleteDialog(true);
    setErrorMessage('');
  };

  const handleDeleteConfirm = async (reason: string) => {
    if (!recordToDelete) return;
    try {
      setIsDeleting(true);
      await softDeleteAttendance(recordToDelete.id, reason);

      // Success feedback
      setSuccessMessage(`Attendance record for ${recordToDelete.worker?.full_name || 'worker'} deleted successfully`);
      setRecordToDelete(null);
      setShowDeleteDialog(false);

      // Also refresh worker-specific view if active
      if (selectedWorkerId) {
        handleWorkerSelect(selectedWorkerId);
      }

      // Auto-dismiss after 4s
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete record';
      setErrorMessage(message);
      // Keep dialog open for retry
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setRecordToDelete(null);
    setErrorMessage('');
  };

  const handleEditRecord = (record: AttendanceWithWorker) => {
    setEditingRecord(record);
    setEditForm({
      clockIn: record.clock_in ? format(new Date(record.clock_in), "yyyy-MM-dd'T'HH:mm") : '',
      clockOut: record.clock_out ? format(new Date(record.clock_out), "yyyy-MM-dd'T'HH:mm") : '',
      hoursWorked: record.hours_worked?.toString() || '',
      overtimeHours: record.overtime_hours?.toString() || '',
      status: record.status,
      bagsCompleted: record.bags_completed?.toString() || ''
    });
  };

  const handleSaveRecord = async () => {
    if (!editingRecord) return;
    
    setIsSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        status: editForm.status
      };
      
      if (editForm.clockIn) {
        updateData.clock_in = new Date(editForm.clockIn).toISOString();
      }
      if (editForm.clockOut) {
        updateData.clock_out = new Date(editForm.clockOut).toISOString();
      }
      if (editForm.hoursWorked) {
        updateData.hours_worked = parseFloat(editForm.hoursWorked);
      }
      if (editForm.overtimeHours) {
        updateData.overtime_hours = parseFloat(editForm.overtimeHours);
      }
      if (editForm.bagsCompleted) {
        updateData.bags_completed = parseInt(editForm.bagsCompleted);
      }
      
      const { error } = await supabase
        .from('attendance')
        .update(updateData)
        .eq('id', editingRecord.id);
      
      if (error) throw error;
      
      fetchAttendance(dateRange.start, dateRange.end);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating attendance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviousWeek = () => {
    setDateRange({
      start: subWeeks(dateRange.start, 1),
      end: subWeeks(dateRange.end, 1),
    });
  };

  const handleCurrentWeek = () => {
    setDateRange({
      start: startOfWeek(new Date(), { weekStartsOn: 1 }),
      end: endOfWeek(new Date(), { weekStartsOn: 1 }),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'clocked_in':
        return <Badge variant="info">Working</Badge>;
      case 'clocked_out':
        return <Badge variant="success">Completed</Badge>;
      case 'completed_quota':
        return <Badge variant="warning">Quota Done</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Worker', 'Employee ID', 'Clock In', 'Clock Out', 'Hours', 'OT Hours', 'Status', 'Bags'];
    const rows = filteredRecords.map((r) => [
      formatDate(r.clock_in),
      r.worker?.full_name || '',
      r.worker?.employee_id || '',
      formatDateTime(r.clock_in),
      r.clock_out ? formatDateTime(r.clock_out) : '',
      r.hours_worked?.toFixed(2) || '',
      r.overtime_hours?.toFixed(2) || '',
      r.status,
      r.bags_completed || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${format(dateRange.start, 'yyyy-MM-dd')}_${format(dateRange.end, 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Success / Error Messages */}
      {successMessage && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-800 flex-1">{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="text-green-400 hover:text-green-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorMessage && !showDeleteDialog && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-800 flex-1">{errorMessage}</p>
          <button onClick={() => setErrorMessage('')} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
          <p className="text-gray-500">
            {selectedWorker ? `Viewing all attendance for ${selectedWorker.full_name}` : 'View and manage attendance history'}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedWorkerId && (
            <Button variant="outline" onClick={handleClearWorkerSelection}>
              <X className="w-4 h-4 mr-2" />
              Clear Selection
            </Button>
          )}
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="font-medium">
                  {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                  Previous Week
                </Button>
                <Button variant="outline" size="sm" onClick={handleCurrentWeek}>
                  Current Week
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedWorkerId || ''}
                  onChange={(e) => e.target.value ? handleWorkerSelect(e.target.value) : handleClearWorkerSelection()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  disabled={isLoadingWorkerAttendance}
                >
                  <option value="">Select a worker to view all attendance...</option>
                  {workers
                    .filter(w => w.is_active)
                    .sort((a, b) => a.full_name.localeCompare(b.full_name))
                    .map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.full_name} ({worker.employee_id})
                      </option>
                    ))}
                </select>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {(isLoading || isLoadingWorkerAttendance) ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? `No attendance records found for "${searchQuery}"` : 'No attendance records for this period'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Clock In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Clock Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      OT Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Bags
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.clock_in)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {record.worker?.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.worker?.employee_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(record.clock_in)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.clock_out ? formatDateTime(record.clock_out) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.hours_worked ? formatHours(record.hours_worked) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.overtime_hours ? formatHours(record.overtime_hours) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.bags_completed || '-'}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEditRecord(record)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record)}
                              className="text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                              title="Soft delete this attendance record"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredRecords.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>per page</span>
            <span className="mx-2 text-gray-400">|</span>
            <span>
              {((safeCurrentPage - 1) * pageSize) + 1}–{Math.min(safeCurrentPage * pageSize, totalRecords)} of {totalRecords} records
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {(() => {
              const pages: (number | string)[] = [];
              const maxVisible = 5;
              let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
              const end = Math.min(totalPages, start + maxVisible - 1);
              start = Math.max(1, end - maxVisible + 1);

              if (start > 1) {
                pages.push(1);
                if (start > 2) pages.push('...');
              }
              for (let i = start; i <= end; i++) pages.push(i);
              if (end < totalPages) {
                if (end < totalPages - 1) pages.push('...');
                pages.push(totalPages);
              }

              return pages.map((page, idx) =>
                typeof page === 'string' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] h-8 rounded-md text-sm font-medium transition-colors ${
                      page === safeCurrentPage
                        ? 'bg-blue-600 text-white border border-blue-600'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              );
            })()}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Attendance Modal */}
      <Modal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title="Edit Attendance Record"
        size="md"
      >
        {editingRecord && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-gray-900">{editingRecord.worker?.full_name}</p>
              <p className="text-sm text-gray-500">Employee ID: {editingRecord.worker?.employee_id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clock In</label>
                <input
                  type="datetime-local"
                  value={editForm.clockIn}
                  onChange={(e) => setEditForm({ ...editForm, clockIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clock Out</label>
                <input
                  type="datetime-local"
                  value={editForm.clockOut}
                  onChange={(e) => setEditForm({ ...editForm, clockOut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.hoursWorked}
                  onChange={(e) => setEditForm({ ...editForm, hoursWorked: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OT Hours</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.overtimeHours}
                  onChange={(e) => setEditForm({ ...editForm, overtimeHours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="clocked_in">Working</option>
                  <option value="clocked_out">Completed</option>
                  <option value="completed_quota">Quota Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bags Completed</label>
                <input
                  type="number"
                  value={editForm.bagsCompleted}
                  onChange={(e) => setEditForm({ ...editForm, bagsCompleted: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditingRecord(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSaveRecord}
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        record={recordToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </div>
  );
};
