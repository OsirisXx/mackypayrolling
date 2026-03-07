import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import {
  LoginPage,
  DashboardPage,
  ScanPage,
  WorkersPage,
  AttendancePage,
  QRCodesPage,
  PayrollPage,
  SettingsPage,
  AuditLogPage,
} from './pages';
import { useAuthStore } from './stores/authStore';

function App() {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="scan" element={<ScanPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="workers" element={<WorkersPage />} />
          <Route path="qr-codes" element={<QRCodesPage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audit-logs" element={<AuditLogPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
