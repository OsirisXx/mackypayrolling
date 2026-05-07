import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { validateDeletionReason } from '../lib/utils';
import type { AttendanceWithWorker } from '../types/database';
import { formatDateTime } from '../lib/utils';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  record: AttendanceWithWorker | null;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  record,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
      setTouched(false);
    }
  }, [isOpen]);

  // Real-time validation after first interaction
  useEffect(() => {
    if (!touched) return;
    const trimmed = reason.trim();
    if (trimmed.length === 0) {
      setError('Please provide a reason for deletion');
    } else {
      const result = validateDeletionReason(trimmed);
      setError(result.valid ? '' : (result.error || ''));
    }
  }, [reason, touched]);

  const handleConfirm = () => {
    setTouched(true);
    const trimmed = reason.trim();
    const result = validateDeletionReason(trimmed);
    if (!result.valid) {
      setError(result.error || 'Invalid reason');
      return;
    }
    onConfirm(trimmed);
  };

  const charCount = reason.trim().length;
  const isValid = charCount >= 10 && charCount <= 500;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Delete Attendance Record" size="md">
      {record && (
        <div className="space-y-5">
          {/* Warning banner */}
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                This action will remove this attendance record from all reports and payroll calculations.
              </p>
              <p className="text-sm text-red-600 mt-1">
                The record will be kept in audit logs only.
              </p>
            </div>
          </div>

          {/* Record details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-gray-900">{record.worker?.full_name}</p>
            <p className="text-sm text-gray-500">Employee ID: {record.worker?.employee_id}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div>
                <span className="text-gray-500">Clock In:</span>
                <span className="ml-1 text-gray-900">{formatDateTime(record.clock_in)}</span>
              </div>
              <div>
                <span className="text-gray-500">Clock Out:</span>
                <span className="ml-1 text-gray-900">
                  {record.clock_out ? formatDateTime(record.clock_out) : 'Still working'}
                </span>
              </div>
            </div>
          </div>

          {/* Deletion reason */}
          <div>
            <label
              htmlFor="deletion-reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason for deletion <span className="text-red-500">*</span>
            </label>
            <textarea
              id="deletion-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (!touched) setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              placeholder="e.g. Accidental scan — worker was not present at the site"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                error && touched
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              disabled={isDeleting}
              maxLength={550}
            />
            <div className="flex items-center justify-between mt-1">
              <div className="min-h-[20px]">
                {error && touched && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>
              <p
                className={`text-xs ${
                  charCount > 500
                    ? 'text-red-500'
                    : charCount >= 10
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                {charCount}/500
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleConfirm}
              isLoading={isDeleting}
              disabled={!isValid || isDeleting}
            >
              Delete Record
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
