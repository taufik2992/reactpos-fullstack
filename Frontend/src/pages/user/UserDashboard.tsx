import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Clock,
  DollarSign,
  Coffee,
  AlertTriangle,
} from "lucide-react";
import { StatsCard } from "../../components/dashboard/StatsCard";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { WorkShiftTimer } from "../../components/ui/WorkShiftTimer";
import { useAuth } from "../../context/AuthContext";
import { orderAPI, menuAPI, formatIDR } from "../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    totalItems: 0,
    lowStockItems: [],
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load recent orders
      const recentOrdersResponse = await orderAPI.getAll({ limit: 5 });
      if (recentOrdersResponse.data.success) {
        // Filter orders by current user if cashier
        const userOrders =
          user?.role === "cashier"
            ? recentOrdersResponse.data.orders.filter(
                (order: any) => order.cashierId._id === user.id
              )
            : recentOrdersResponse.data.orders;
        setRecentOrders(userOrders);

        // Calculate today's stats from orders
        const today = new Date().toISOString().split("T")[0];
        const todayOrders = userOrders.filter(
          (order: any) =>
            new Date(order.createdAt).toISOString().split("T")[0] === today
        );

        const todaySales = todayOrders.reduce(
          (sum: number, order: any) => sum + order.total,
          0
        );

        setStats((prev) => ({
          ...prev,
          todaySales,
          todayOrders: todayOrders.length,
        }));
      }

      // Load menu items for low stock check
      const menuResponse = await menuAPI.getAll();
      if (menuResponse.data.success) {
        const lowStock = menuResponse.data.menuItems.filter(
          (item: any) => item.stock < 10
        );
        const totalStock = menuResponse.data.menuItems.reduce(
          (sum: number, item: any) => sum + item.stock,
          0
        );

        setStats((prev) => ({
          ...prev,
          totalItems: totalStock,
          lowStockItems: lowStock,
        }));
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Selamat Bekerja, {user?.nama}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          Semua kemajuan terjadi di luar zona nyaman.
        </p>
      </div>

      {/* Work Shift Timer - Only for cashiers */}
      {user?.role === "cashier" && <WorkShiftTimer />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Penjualan Hari Ini"
          value={formatIDR(stats.todaySales)}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Pesanan Hari Ini"
          value={stats.todayOrders}
          icon={ShoppingCart}
          color="blue"
        />
        <StatsCard
          title="Item Stok Rendah"
          value={stats.lowStockItems.length}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title="Total Stok"
          value={stats.totalItems}
          icon={Coffee}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Aksi Cepat
            </h3>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/user/orders")}
              className="w-full justify-start"
              icon={ShoppingCart}
            >
              Buat Pesanan Baru
            </Button>
            <Button
              onClick={() => navigate("/user/history")}
              variant="outline"
              className="w-full justify-start"
              icon={Clock}
            >
              Lihat Riwayat Pesanan
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pesanan Terbaru
          </h3>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order: any) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      Pesanan #{order._id.slice(-6)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {order.customerName || "Walk-in Customer"}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        }`}
                      >
                        {order.status === "completed"
                          ? "Selesai"
                          : order.status === "pending"
                          ? "Pending"
                          : order.status === "processing"
                          ? "Proses"
                          : order.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {order.items.length} item
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      {formatIDR(order.total)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                Belum ada pesanan terbaru
              </p>
            )}
          </div>
        </Card>
      </div>

      {stats.lowStockItems.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            Peringatan Stok Rendah
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.lowStockItems.map((item: any) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {item.name}
                    </p>
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                      Tersisa {item.stock} item
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
