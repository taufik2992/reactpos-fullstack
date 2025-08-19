import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  FileText, 
  Users, 
  Coffee, 
  BarChart3,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuth();

  const adminRoutes = [
    { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/admin/menu', icon: Coffee, label: 'Menu Management' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const cashierRoutes = [
    { path: '/user/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/user/orders', icon: ShoppingCart, label: 'Create Order' },
    { path: '/user/history', icon: FileText, label: 'Order History' },
  ];

  const routes = user?.role === 'admin' ? adminRoutes : cashierRoutes;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        bg-white dark:bg-gray-800 
        w-64 min-h-screen 
        shadow-md border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-4 lg:mt-8">
          <div className="px-4 space-y-2">
            {routes.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border-r-4 border-amber-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`
                }
              >
                <route.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="truncate">{route.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
};