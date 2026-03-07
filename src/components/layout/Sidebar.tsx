import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  QrCode,
  Clock,
  DollarSign,
  Settings,
  LogOut,
  ScanLine,
  Menu,
  X,
  ScrollText,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isCollapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center px-4 py-3 rounded-lg transition-colors',
          isActive
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100'
        )
      }
      title={isCollapsed ? label : undefined}
    >
      <span className="w-5 h-5 flex-shrink-0">{icon}</span>
      <span className={cn(
        'ml-3 whitespace-nowrap overflow-hidden transition-all duration-300',
        isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
      )}>
        {label}
      </span>
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <aside className={cn(
      "print:hidden",
      'bg-white border-r border-gray-200 h-screen flex flex-col transition-[width] duration-300 sticky top-0 overflow-y-auto',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">Macrock Limestone</h1>
              <p className="text-sm text-gray-500 mt-1">Attendance System</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <NavItem
          to="/dashboard"
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />
        
        <NavItem
          to="/scan"
          icon={<ScanLine className="w-5 h-5" />}
          label="Scan QR"
          isCollapsed={isCollapsed}
        />

        <NavItem
          to="/attendance"
          icon={<Clock className="w-5 h-5" />}
          label="Attendance"
          isCollapsed={isCollapsed}
        />

        {isAdmin && (
          <>
            <NavItem
              to="/workers"
              icon={<Users className="w-5 h-5" />}
              label="Workers"
              isCollapsed={isCollapsed}
            />

            <NavItem
              to="/qr-codes"
              icon={<QrCode className="w-5 h-5" />}
              label="QR Codes"
              isCollapsed={isCollapsed}
            />

            <NavItem
              to="/payroll"
              icon={<DollarSign className="w-5 h-5" />}
              label="Payroll"
              isCollapsed={isCollapsed}
            />

            <NavItem
              to="/settings"
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
              isCollapsed={isCollapsed}
            />

            <NavItem
              to="/audit-logs"
              icon={<ScrollText className="w-5 h-5" />}
              label="Audit Logs"
              isCollapsed={isCollapsed}
            />
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-medium text-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-medium text-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center px-4 py-3 w-full text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className={cn(
            'ml-3 whitespace-nowrap overflow-hidden transition-all duration-300',
            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}>
            Sign Out
          </span>
        </button>
        
        {/* Powered by Raijin Tech */}
        <div className={cn(
          'mt-4 pt-4 border-t border-gray-200',
          isCollapsed ? 'text-center' : ''
        )}>
          {!isCollapsed ? (
            <p className="text-xs text-gray-400 text-center">
              Powered by <span className="font-semibold text-gray-600">Raijin Tech</span>
            </p>
          ) : (
            <p className="text-xs text-gray-400 font-semibold" title="Powered by Raijin Tech">
              RT
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};
