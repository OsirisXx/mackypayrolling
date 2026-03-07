import React, { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { Calendar, Download, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAttendanceStore } from '../stores/attendanceStore';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { formatDate, formatTime, formatHours } from '../lib/utils';
import type { AttendanceWithWorker } from '../types/database';

export const AttendancePage: React.FC = () => {
  const { user } = useAuthStore();
  const { attendanceRecords, fetchAttendance, isLoading } = useAttendanceStore();
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

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchAttendance(dateRange.start, dateRange.end);
  }, [fetchAttendance, dateRange]);

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
    const rows = attendanceRecords.map((r) => [
      formatDate(r.clock_in),
      r.worker?.full_name || '',
      r.worker?.employee_id || '',
      formatTime(r.clock_in),
      r.clock_out ? formatTime(r.clock_out) : '',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
          <p className="text-gray-500">View and manage attendance history</p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
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
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No attendance records for this period
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
                  {attendanceRecords.map((record) => (
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
                        {formatTime(record.clock_in)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.clock_out ? formatTime(record.clock_out) : '-'}
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
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
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
    </div>
  );
};
