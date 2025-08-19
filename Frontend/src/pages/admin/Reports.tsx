import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Download,
  Calendar,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/Table";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { dashboardAPI, formatIDR } from "../../services/api";
import toast from "react-hot-toast";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState("revenue");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
    groupBy: "day",
  });
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    setDateRange({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      groupBy: "day",
    });
  }, []);

  const loadReport = async (type: string) => {
    setLoading(true);
    try {
      let response;
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        groupBy: dateRange.groupBy,
      };

      switch (type) {
        case "revenue":
          response = await dashboardAPI.getRevenueReport(params);
          break;
        case "products":
          response = await dashboardAPI.getProductReport(params);
          break;
        case "staff":
          response = await dashboardAPI.getStaffReport(params);
          break;
        case "customers":
          response = await dashboardAPI.getCustomerReport(params);
          break;
        default:
          return;
      }

      if (response.data.success) {
        setReportData(response.data.report);
      }
    } catch (error) {
      toast.error("Gagal memuat laporan");
      console.error("Report error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    loadReport(tab);
  };

  const exportReport = async () => {
    if (!reportData) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan");

      if (activeTab === "revenue") {
        worksheet.columns = [
          { header: "Periode", key: "_id", width: 20 },
          { header: "Pesanan", key: "totalOrders", width: 15 },
          { header: "Pendapatan", key: "totalRevenue", width: 20 },
          { header: "Rata-rata", key: "avgOrderValue", width: 20 },
        ];
        (reportData.data || []).forEach((item: any) => {
          worksheet.addRow({
            _id: item._id,
            totalOrders: item.totalOrders,
            totalRevenue: item.totalRevenue,
            avgOrderValue: item.avgOrderValue,
          });
        });
      }

      if (activeTab === "products") {
        worksheet.columns = [
          { header: "Produk", key: "name", width: 25 },
          { header: "Kategori", key: "category", width: 20 },
          { header: "Terjual", key: "totalQuantitySold", width: 15 },
          { header: "Pendapatan", key: "totalRevenue", width: 20 },
          { header: "Pesanan", key: "orderCount", width: 15 },
        ];
        (reportData.products || []).forEach((item: any) => {
          worksheet.addRow(item);
        });
      }

      if (activeTab === "staff") {
        worksheet.columns = [
          { header: "Nama", key: "name", width: 25 },
          { header: "Peran", key: "role", width: 20 },
          { header: "Pesanan", key: "totalOrders", width: 15 },
          { header: "Pendapatan", key: "totalRevenue", width: 20 },
        ];
        (reportData.staffPerformance || []).forEach((staff: any) => {
          worksheet.addRow(staff);
        });
      }

      if (activeTab === "customers") {
        worksheet.columns = [
          { header: "Nama", key: "_id", width: 25 },
          { header: "Pesanan", key: "totalOrders", width: 15 },
          { header: "Total Belanja", key: "totalSpent", width: 20 },
          { header: "Rata-rata", key: "avgOrderValue", width: 20 },
          { header: "Terakhir", key: "lastOrderDate", width: 20 },
        ];
        (reportData.topCustomers || []).forEach((c: any) => {
          worksheet.addRow({
            ...c,
            lastOrderDate: new Date(c.lastOrderDate).toLocaleDateString(
              "id-ID"
            ),
          });
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `${activeTab}_report_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      toast.success("Laporan berhasil diekspor ke Excel!");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Gagal mengekspor laporan");
    }
  };

  const renderRevenueReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="sm">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatIDR(reportData.summary?.totalRevenue || 0)}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Pendapatan
              </p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {reportData.summary?.totalOrders || 0}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Pesanan
              </p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatIDR(reportData.summary?.avgOrderValue || 0)}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rata-rata Pesanan
              </p>
            </div>
          </Card>
          <Card padding="sm">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatIDR(reportData.summary?.maxOrderValue || 0)}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pesanan Tertinggi
              </p>
            </div>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tren Pendapatan
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value: any) => [formatIDR(value), "Pendapatan"]}
                  contentStyle={{
                    backgroundColor: "rgb(55 65 81)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="#F59E0B"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Detailed Table */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detail Pendapatan
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Periode</TableCell>
                <TableCell header>Pesanan</TableCell>
                <TableCell header>Pendapatan</TableCell>
                <TableCell header>Rata-rata</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(reportData.data || []).map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{item._id}</TableCell>
                  <TableCell>{item.totalOrders}</TableCell>
                  <TableCell>{formatIDR(item.totalRevenue)}</TableCell>
                  <TableCell>{formatIDR(item.avgOrderValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  };

  const renderProductReport = () => {
    if (!reportData) return null;

    const COLORS = ["#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6"];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performa Kategori
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.categoryBreakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, percent }: any) =>
                      `${_id} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalRevenue"
                  >
                    {(reportData.categoryBreakdown || []).map(
                      (_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatIDR(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Products */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Produk Terlaris
            </h3>
            <div className="space-y-3">
              {(reportData.products || [])
                .slice(0, 5)
                .map((product: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Terjual: {product.totalQuantitySold}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatIDR(product.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Product Details Table */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detail Produk
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Produk</TableCell>
                <TableCell header>Kategori</TableCell>
                <TableCell header>Terjual</TableCell>
                <TableCell header>Pendapatan</TableCell>
                <TableCell header>Pesanan</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(reportData.products || []).map(
                (product: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell>{product.totalQuantitySold}</TableCell>
                    <TableCell>{formatIDR(product.totalRevenue)}</TableCell>
                    <TableCell>{product.orderCount}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  };

  const renderStaffReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Staff Performance */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performa Staff
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell header>Nama</TableCell>
                  <TableCell header>Pesanan</TableCell>
                  <TableCell header>Pendapatan</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(reportData.staffPerformance || []).map(
                  (staff: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-xs text-gray-500">{staff.role}</p>
                        </div>
                      </TableCell>
                      <TableCell>{staff.totalOrders}</TableCell>
                      <TableCell>{formatIDR(staff.totalRevenue)}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Shift Statistics */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Statistik Shift
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell header>Nama</TableCell>
                  <TableCell header>Shift</TableCell>
                  <TableCell header>Jam</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(reportData.shiftStatistics || []).map(
                  (shift: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{shift.name}</TableCell>
                      <TableCell>{shift.totalShifts}</TableCell>
                      <TableCell>{shift.totalHours}h</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    );
  };

  const renderCustomerReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {/* Top Customers */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pelanggan Teratas
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Nama</TableCell>
                <TableCell header>Pesanan</TableCell>
                <TableCell header>Total Belanja</TableCell>
                <TableCell header>Rata-rata</TableCell>
                <TableCell header>Terakhir</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(reportData.topCustomers || [])
                .slice(0, 10)
                .map((customer: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer._id}</p>
                        {customer.phone && (
                          <p className="text-xs text-gray-500">
                            {customer.phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell>{formatIDR(customer.totalSpent)}</TableCell>
                    <TableCell>{formatIDR(customer.avgOrderValue)}</TableCell>
                    <TableCell>
                      {new Date(customer.lastOrderDate).toLocaleDateString(
                        "id-ID"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>

        {/* Customer Segments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Segmen Pelanggan
            </h3>
            <div className="space-y-3">
              {(reportData.customerSegments || []).map(
                (segment: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="font-medium">
                      {formatIDR(
                        segment._id === "1000+" ? 1000000 : segment._id
                      )}
                      {segment._id === "1000+" ? "+" : ""}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {segment.count} pelanggan
                    </span>
                  </div>
                )
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Frekuensi Pesanan
            </h3>
            <div className="space-y-3">
              {(reportData.orderFrequency || []).map(
                (freq: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="font-medium">
                      {freq._id === "20+" ? "20+" : freq._id} pesanan
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {freq.customerCount} pelanggan
                    </span>
                  </div>
                )
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Laporan & Analitik
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          Wawasan mendalam tentang performa restoran Anda
        </p>
      </div>

      {/* Report Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <Input
            label="Tanggal Mulai"
            type="date"
            value={dateRange.startDate}
            onChange={(value) =>
              setDateRange({ ...dateRange, startDate: value })
            }
            icon={Calendar}
          />
          <Input
            label="Tanggal Akhir"
            type="date"
            value={dateRange.endDate}
            onChange={(value) => setDateRange({ ...dateRange, endDate: value })}
            icon={Calendar}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kelompokkan
            </label>
            <select
              value={dateRange.groupBy}
              onChange={(e) =>
                setDateRange({ ...dateRange, groupBy: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="day">Hari</option>
              <option value="week">Minggu</option>
              <option value="month">Bulan</option>
              <option value="year">Tahun</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => loadReport(activeTab)}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Memuat..." : "Generate Laporan"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Tabs */}
      <Card>
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "revenue", label: "Pendapatan", icon: DollarSign },
            { id: "products", label: "Produk", icon: ShoppingBag },
            { id: "staff", label: "Staff", icon: Users },
            { id: "customers", label: "Pelanggan", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {reportData && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={exportReport}
              variant="outline"
              icon={Download}
              size="sm"
            >
              Ekspor Laporan
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : reportData ? (
          <div>
            {activeTab === "revenue" && renderRevenueReport()}
            {activeTab === "products" && renderProductReport()}
            {activeTab === "staff" && renderStaffReport()}
            {activeTab === "customers" && renderCustomerReport()}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Klik "Generate Laporan" untuk melihat data
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
