import React, { useEffect } from 'react';
import { Users, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { useWorkerStore } from '../stores/workerStore';
import { useAttendanceStore } from '../stores/attendanceStore';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency, formatTime } from '../lib/utils';
import { Badge } from '../components/ui/Badge';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { workers, fetchWorkers } = useWorkerStore();
  const { todayRecords, fetchTodayAttendance } = useAttendanceStore();

  useEffect(() => {
    fetchWorkers();
    fetchTodayAttendance();
  }, [fetchWorkers, fetchTodayAttendance]);

  // Seamlessly deduplicate historical "Dual IN" and "Phantom" shifts
  // caused by past network lag. If a worker has multiple records with
  // clock_in times within 15 minutes of each other, we only count/display one.
  const displayRecords = React.useMemo(() => {
    const unique = new Map<string, typeof todayRecords[0]>();
    
    // Sort to prioritize keeping completed shifts over open phantom shifts
    const sorted = [...todayRecords].sort((a, b) => {
      if (a.status !== 'clocked_in' && b.status === 'clocked_in') return -1;
      if (a.status === 'clocked_in' && b.status !== 'clocked_in') return 1;
      return new Date(a.clock_in).getTime() - new Date(b.clock_in).getTime();
    });

    sorted.forEach(record => {
      let isDuplicate = false;
      for (const existing of unique.values()) {
        if (existing.worker_id === record.worker_id) {
          const timeDiff = Math.abs(new Date(existing.clock_in).getTime() - new Date(record.clock_in).getTime());
          if (timeDiff < 15 * 60 * 1000) {
            isDuplicate = true;
            break;
          }
        }
      }
      if (!isDuplicate) {
        unique.set(record.id, record);
      }
    });
    
    // Restore chronological order for the table
    return Array.from(unique.values()).sort((a, b) => 
      new Date(b.clock_in).getTime() - new Date(a.clock_in).getTime()
    );
  }, [todayRecords]);

  const activeWorkers = workers.filter((w) => w.is_active).length;
  const clockedInToday = displayRecords.filter((r) => r.status === 'clocked_in').length;
  const completedToday = displayRecords.filter(
    (r) => r.status === 'clocked_out' || r.status === 'completed_quota'
  ).length;

  const totalHoursToday = displayRecords.reduce(
    (sum, r) => sum + (r.hours_worked || 0),
    0
  );

  const stats = [
    {
      label: 'Total Workers',
      value: activeWorkers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Currently Working',
      value: clockedInToday,
      icon: Clock,
      color: 'bg-green-500',
    },
    {
      label: 'Completed Today',
      value: completedToday,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
    {
      label: 'Total Hours Today',
      value: totalHoursToday.toFixed(1),
      icon: DollarSign,
      color: 'bg-orange-500',
    },
  ];

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.full_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Today's Attendance</h2>
        </CardHeader>
        <CardContent className="p-0">
          {displayRecords.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No attendance records for today
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayRecords.map((record) => (
                    <tr key={record.id}>
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
                        {record.hours_worked?.toFixed(2) || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(record.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
