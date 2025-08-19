import React from "react";
import { Moon, Sun, LogOut, User, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useWorkShift } from "../../context/WorkShiftContext";
import { Button } from "../ui/Button";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isShiftActive, remainingTime, formatTime } = useWorkShift();

  const isWarningTime = remainingTime <= 30 * 60; // Last 30 minutes
  const isCriticalTime = remainingTime <= 5 * 60; // Last 5 minutes

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button - Only show for admin */}
            {user?.role === "admin" && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <h1 className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-500">
              RestaurantPOS
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Work shift timer for cashiers */}
            {user?.role === "cashier" && isShiftActive && (
              <div
                className={`hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                  isCriticalTime
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    : isWarningTime
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCriticalTime
                      ? "bg-red-500"
                      : isWarningTime
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  } animate-pulse`}
                ></div>
                <span>Shift: {formatTime(Math.max(0, remainingTime))}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              icon={isDark ? Sun : Moon}
              className="hidden sm:inline-flex"
            >
              {isDark ? "Light" : "Dark"}
            </Button>

            {/* Mobile theme toggle */}
            <button
              onClick={toggleTheme}
              className="sm:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.nama}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                )}
                <div className="hidden sm:block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.nama}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full ml-2">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              icon={LogOut}
              className="hidden sm:inline-flex"
            >
              Logout
            </Button>

            {/* Mobile logout */}
            <button
              onClick={logout}
              className="sm:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
