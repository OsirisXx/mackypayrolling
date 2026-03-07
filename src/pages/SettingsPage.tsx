import React, { useEffect, useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useSettingsStore } from '../stores/settingsStore';
import { formatCurrency } from '../lib/utils';

export const SettingsPage: React.FC = () => {
  const { rateSettings, fetchSettings, updateSetting, isLoading } = useSettingsStore();
  const [formData, setFormData] = useState({
    defaultDailyRate: '400',
    defaultHourlyRate: '50',
    overtimeMultiplier: '1.25',
    standardWorkHours: '8',
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setFormData({
      defaultDailyRate: rateSettings.defaultDailyRate.toString(),
      defaultHourlyRate: rateSettings.defaultHourlyRate.toString(),
      overtimeMultiplier: rateSettings.overtimeMultiplier.toString(),
      standardWorkHours: rateSettings.standardWorkHours.toString(),
    });
  }, [rateSettings]);

  const handleSave = async () => {
    await updateSetting(
      'rate_settings',
      {
        defaultDailyRate: parseFloat(formData.defaultDailyRate),
        defaultHourlyRate: parseFloat(formData.defaultHourlyRate),
        overtimeMultiplier: parseFloat(formData.overtimeMultiplier),
        standardWorkHours: parseFloat(formData.standardWorkHours),
      },
      'Default rate settings for payroll calculations'
    );
  };

  const handleReset = () => {
    setFormData({
      defaultDailyRate: '400',
      defaultHourlyRate: '50',
      overtimeMultiplier: '1.25',
      standardWorkHours: '8',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Configure system settings and rates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Rate Settings</h2>
            <p className="text-sm text-gray-500">
              Configure default rates for payroll calculations
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Default Daily Rate (PHP)"
              type="number"
              value={formData.defaultDailyRate}
              onChange={(e) =>
                setFormData({ ...formData, defaultDailyRate: e.target.value })
              }
              placeholder="e.g., 400"
            />
            <Input
              label="Default Hourly Rate (PHP)"
              type="number"
              value={formData.defaultHourlyRate}
              onChange={(e) =>
                setFormData({ ...formData, defaultHourlyRate: e.target.value })
              }
              placeholder="e.g., 50"
            />
            <Input
              label="Overtime Multiplier"
              type="number"
              step="0.01"
              value={formData.overtimeMultiplier}
              onChange={(e) =>
                setFormData({ ...formData, overtimeMultiplier: e.target.value })
              }
              placeholder="e.g., 1.25"
            />
            <Input
              label="Standard Work Hours"
              type="number"
              value={formData.standardWorkHours}
              onChange={(e) =>
                setFormData({ ...formData, standardWorkHours: e.target.value })
              }
              placeholder="e.g., 8"
            />
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
              <Button onClick={handleSave} isLoading={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Payroll Calculation</h2>
            <p className="text-sm text-gray-500">How payroll is calculated</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Formula</h3>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <strong>Gross Pay</strong> = (Days Worked × Daily Rate) + (OT Hours × Hourly Rate × OT Multiplier)
                  </p>
                  <p>
                    <strong>Hourly Rate</strong> = Daily Rate ÷ Standard Work Hours
                  </p>
                  <p>
                    <strong>Net Pay</strong> = Gross Pay - SSS - Other Deductions
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Current Settings</h3>
                <div className="space-y-1 text-blue-800">
                  <p>Default Daily Rate: {formatCurrency(rateSettings.defaultDailyRate)}</p>
                  <p>Default Hourly Rate: {formatCurrency(rateSettings.defaultHourlyRate)}</p>
                  <p>OT Multiplier: {rateSettings.overtimeMultiplier}x</p>
                  <p>Standard Hours: {rateSettings.standardWorkHours} hours</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Example Calculation</h3>
                <div className="space-y-1 text-green-800">
                  <p>Worker: 7 days, 2 OT hours</p>
                  <p>Gross = (7 × ₱400) + (2 × ₱50 × 1.25)</p>
                  <p>Gross = ₱2,800 + ₱125 = ₱2,925</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
