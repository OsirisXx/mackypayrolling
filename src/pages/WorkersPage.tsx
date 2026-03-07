import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useWorkerStore } from '../stores/workerStore';
import { formatCurrency } from '../lib/utils';
import type { Worker } from '../types/database';

export const WorkersPage: React.FC = () => {
  const { workers, fetchWorkers, addWorker, updateWorker, deleteWorker, isLoading } = useWorkerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    daily_rate: '',
    standard_hours: '8',
  });

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const filteredWorkers = workers.filter(
    (w) =>
      w.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingWorker) {
      await updateWorker(editingWorker.id, {
        employee_id: formData.employee_id,
        full_name: formData.full_name,
        daily_rate: parseFloat(formData.daily_rate),
        standard_hours: parseFloat(formData.standard_hours),
      });
    } else {
      await addWorker({
        employee_id: formData.employee_id,
        full_name: formData.full_name,
        daily_rate: parseFloat(formData.daily_rate),
        standard_hours: parseFloat(formData.standard_hours),
        is_active: true,
      });
    }

    setShowModal(false);
    setEditingWorker(null);
    setFormData({ employee_id: '', full_name: '', daily_rate: '', standard_hours: '8' });
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      employee_id: worker.employee_id,
      full_name: worker.full_name,
      daily_rate: worker.daily_rate.toString(),
      standard_hours: worker.standard_hours.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (worker: Worker) => {
    if (confirm(`Are you sure you want to deactivate ${worker.full_name}?`)) {
      await deleteWorker(worker.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
          <p className="text-gray-500">Manage worker profiles and rates</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Worker
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Badge variant="info">{filteredWorkers.length} workers</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Daily Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Std Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hourly Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {worker.employee_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {worker.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(worker.daily_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {worker.standard_hours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(worker.hourly_rate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={worker.is_active ? 'success' : 'danger'}>
                        {worker.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(worker)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(worker)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingWorker(null);
          setFormData({ employee_id: '', full_name: '', daily_rate: '', standard_hours: '8' });
        }}
        title={editingWorker ? 'Edit Worker' : 'Add New Worker'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Employee ID"
            value={formData.employee_id}
            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
            placeholder="e.g., EMP001"
            required
          />
          <Input
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Enter full name"
            required
          />
          <Input
            label="Daily Rate (PHP)"
            type="number"
            value={formData.daily_rate}
            onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
            placeholder="e.g., 400"
            required
          />
          <Input
            label="Standard Work Hours per Day"
            type="number"
            step="0.5"
            min="1"
            max="24"
            value={formData.standard_hours}
            onChange={(e) => setFormData({ ...formData, standard_hours: e.target.value })}
            placeholder="e.g., 8, 10, 12"
            required
          />
          <p className="text-sm text-gray-500">
            Hourly rate will be calculated as: Daily Rate ÷ Standard Hours
            {formData.daily_rate && formData.standard_hours && (
              <span className="font-semibold">
                {' '}= {formatCurrency(parseFloat(formData.daily_rate) / parseFloat(formData.standard_hours))}/hour
              </span>
            )}
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowModal(false);
                setEditingWorker(null);
                setFormData({ employee_id: '', full_name: '', daily_rate: '', standard_hours: '8' });
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isLoading}>
              {editingWorker ? 'Update' : 'Add'} Worker
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
