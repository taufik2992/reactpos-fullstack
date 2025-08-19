// AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  PieChart,
  Box,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { SalesChart } from "../../components/dashboard/SalesChart";
import { Card } from "../../components/ui/Card";
import { dashboardAPI } from "../../services/api";
import { formatIDR } from "../../services/api";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";

interface DashboardData {
  overview: {
    totalMenuItems: number;
    totalUsers: number;
    activeUsers: number;
    activeShifts: number;
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
  };
  orders: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  revenue: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  topSellingItems: any[];
  dailySales: any[];
}

export const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await dashboardAPI.getStats();
        if (response.data.success) {
          setDashboardData(response.data.stats);
        }
      } catch (error) {
        toast.error("Gagal memuat data dashboard");
        console.error("Error dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Ringkasan Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Selamat datang kembali! Berikut adalah ringkasan aktivitas restoran
          Anda.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-xl bg-gray-100 dark:bg-gray-800"
              >
                <Skeleton height={144} borderRadius={12} />
              </div>
            ))
        ) : (
          <>
            <StatsCard
              title="Pendapatan Hari Ini"
              value={
                dashboardData ? formatIDR(dashboardData.revenue.today) : "0"
              }
              icon={DollarSign}
              color="green"
              change={`${
                dashboardData ? formatIDR(dashboardData.revenue.week) : "0"
              } minggu ini`}
            />
            <StatsCard
              title="Pesanan Hari Ini"
              value={dashboardData ? dashboardData.orders.today : "0"}
              icon={ShoppingBag}
              color="blue"
              change={`${
                dashboardData ? dashboardData.orders.week : "0"
              } minggu ini`}
            />
            <StatsCard
              title="Pengguna Aktif"
              value={dashboardData ? dashboardData.overview.activeUsers : "0"}
              icon={Users}
              color="yellow"
              change={`${
                dashboardData ? dashboardData.overview.totalUsers : "0"
              } total pengguna`}
            />
            <StatsCard
              title="Shift Aktif"
              value={dashboardData ? dashboardData.overview.activeShifts : "0"}
              icon={Clock}
              color="red"
              change="Sedang berjalan"
            />
          </>
        )}
      </div>

      {/* Charts and Top Items Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          {loading ? (
            <div className="h-96 rounded-xl bg-gray-100 dark:bg-gray-800">
              <Skeleton height={384} borderRadius={12} />
            </div>
          ) : (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Performa Penjualan
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>30 hari terakhir</span>
                </div>
              </div>
              <div className="h-80">
                <SalesChart data={dashboardData?.dailySales || []} />
              </div>
            </Card>
          )}
        </div>

        {loading ? (
          <div className="h-96 rounded-xl bg-gray-100 dark:bg-gray-800">
            <Skeleton height={384} borderRadius={12} />
          </div>
        ) : (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Menu Terlaris
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <TrendingUp className="w-4 h-4" />
                <span>Paling laku</span>
              </div>
            </div>
            <div className="space-y-4">
              {dashboardData?.topSellingItems.slice(0, 5).map((item, index) => (
                <div
                  key={item._id}
                  className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.menuItem.image || "/placeholder-food.jpg"}
                      alt={item.menuItem.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {item.menuItem.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatIDR(item.menuItem.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.totalQuantity} terjual
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      +{formatIDR(item.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800"
              >
                <Skeleton height={128} borderRadius={12} />
              </div>
            ))
        ) : (
          <>
            <Card className="p-5 flex flex-col items-center justify-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-3">
                <PieChart className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatIDR(dashboardData?.overview.avgOrderValue || 0)}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rata-rata Pesanan
              </p>
            </Card>

            <Card className="p-5 flex flex-col items-center justify-center">
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full mb-3">
                <Box className="w-6 h-6 text-amber-600 dark:text-amber-300" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {dashboardData?.overview.totalMenuItems || 0}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Menu
              </p>
            </Card>

            <Card className="p-5 flex flex-col items-center justify-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-3">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatIDR(dashboardData?.revenue.week || 0)}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pendapatan Mingguan
              </p>
            </Card>

            <Card className="p-5 flex flex-col items-center justify-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mb-3">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatIDR(dashboardData?.revenue.month || 0)}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pendapatan Bulanan
              </p>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
