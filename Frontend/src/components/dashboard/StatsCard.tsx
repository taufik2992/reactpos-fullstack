import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "yellow" | "red";
  change?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  change,
}) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow duration-200"
      padding="sm"
    >
      <div className="flex items-center">
        <div
          className={`p-2 sm:p-3 rounded-full ${colorClasses[color]} text-white flex-shrink-0`}
        >
          <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
            {value}
          </p>
          {change && (
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
              {change}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
