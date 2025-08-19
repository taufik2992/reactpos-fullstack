import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, FileText } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const routes = [
    { path: '/user/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/user/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/user/history', icon: FileText, label: 'History' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-pb">
      <div className="flex justify-around items-center h-14 md:16 px-2">
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-amber-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`
            }
          >
            <route.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium truncate">{route.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};