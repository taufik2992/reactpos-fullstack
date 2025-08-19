import React, { useState, useEffect } from "react";
import { Search, Eye, FileText } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/Table";
import { useAuth } from "../../context/AuthContext";
import { orderAPI, formatIDR } from "../../services/api";
import toast from "react-hot-toast";

export const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    loadOrders();
  }, [pagination.page, statusFilter]);

  const loadOrders = async () => {
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (user?.role === "cashier") {
        params.cashierId = user.id;
      }

      const response = await orderAPI.getAll(params);
      if (response.data.success) {
        setOrders(response.data.orders);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages,
        }));
      }
    } catch (error) {
      toast.error("Gagal memuat riwayat pesanan");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (order: any) =>
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewOrderDetails = async (order: any) => {
    try {
      const response = await orderAPI.getById(order._id);
      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setIsDetailOpen(true);
      }
    } catch (error) {
      toast.error("Gagal memuat detail pesanan");
    }
  };

  const printReceipt = (order: any) => {
    const receipt = `
      Restaurant POS Receipt
      =====================
      Order ID: #${order._id.slice(-6)}
      Date: ${new Date(order.createdAt).toLocaleString("id-ID")}
      Customer: ${order.customerName || "Walk-in Customer"}
      ${order.customerPhone ? `Phone: ${order.customerPhone}` : ""}
      Cashier: ${order.cashierId?.nama || user?.nama}
      
      Items:
      ${order.items
        .map(
          (item: any) =>
            `${item.menuItemId?.name || "Item"} x${item.quantity} - ${formatIDR(
              item.subtotal
            )}`
        )
        .join("\n")}
      
      Total: ${formatIDR(order.total)}
      Payment: ${order.paymentMethod === "cash" ? "TUNAI" : "DIGITAL"}
      Status: ${order.status.toUpperCase()}
      
      Terima kasih atas kunjungan Anda!
    `;

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt #${order._id.slice(-6)}</title>
            <style>
              body { font-family: monospace; white-space: pre-line; }
            </style>
          </head>
          <body>${receipt}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    toast.success("Struk siap dicetak!");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: {
        label: "Selesai",
        class:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
      pending: {
        label: "Pending",
        class:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      },
      processing: {
        label: "Proses",
        class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      },
      cancelled: {
        label: "Batal",
        class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}
      >
        {config.label}
      </span>
    );
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
          Riwayat Pesanan
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          Lihat semua pesanan yang telah diproses
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
          <div className="sm:col-span-2">
            <Input
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Cari pesanan berdasarkan ID atau nama pelanggan..."
              icon={Search}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Proses</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Batal</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>ID Pesanan</TableCell>
              <TableCell header className="hidden sm:table-cell">
                Pelanggan
              </TableCell>
              <TableCell header>Total</TableCell>
              <TableCell header className="hidden md:table-cell">
                Pembayaran
              </TableCell>
              <TableCell header className="hidden lg:table-cell">
                Tanggal
              </TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header className="text-right">
                Aksi
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order: any) => (
              <TableRow key={order._id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      #{order._id.slice(-6)}
                    </div>
                    <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400">
                      {order.customerName || "Walk-in Customer"}
                    </div>
                    <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400">
                      {order.items.length} item
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    <div>{order.customerName || "Walk-in Customer"}</div>
                    <div className="text-xs">{order.items.length} item</div>
                    {order.customerPhone && (
                      <div className="text-xs">{order.customerPhone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatIDR(order.total)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.paymentMethod === "cash"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    }`}
                  >
                    {order.paymentMethod === "cash" ? "TUNAI" : "DIGITAL"}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    <div>
                      {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </div>
                    <div className="text-xs">
                      {new Date(order.createdAt).toLocaleTimeString("id-ID")}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1 sm:space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => viewOrderDetails(order)}
                      icon={Eye}
                      className="text-xs"
                    >
                      <span className="hidden sm:inline">Lihat</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => printReceipt(order)}
                      icon={FileText}
                      className="text-xs"
                    >
                      <span className="hidden sm:inline">Cetak</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Tidak ada pesanan ditemukan
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Halaman {pagination.page} dari {pagination.pages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.pages}
            >
              Selanjutnya
            </Button>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Detail Pesanan - #${selectedOrder?._id.slice(-6)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Informasi Pesanan
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">ID Pesanan:</span> #
                    {selectedOrder._id.slice(-6)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Tanggal:</span>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString("id-ID")}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Pelanggan:</span>{" "}
                    {selectedOrder.customerName || "Walk-in Customer"}
                  </p>
                  {selectedOrder.customerPhone && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Telepon:</span>{" "}
                      {selectedOrder.customerPhone}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Kasir:</span>{" "}
                    {selectedOrder.cashierId?.nama || "N/A"}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Pembayaran:</span>{" "}
                    {selectedOrder.paymentMethod === "cash"
                      ? "TUNAI"
                      : "DIGITAL"}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Ringkasan Pesanan
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Item:</span>{" "}
                    {selectedOrder.items.length}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Total:</span>{" "}
                    {formatIDR(selectedOrder.total)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Status:</span>{" "}
                    {getStatusBadge(selectedOrder.status)}
                  </p>
                  {selectedOrder.notes && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Catatan:</span>{" "}
                      {selectedOrder.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Item Pesanan
              </h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {item.menuItemId?.image && (
                        <img
                          src={item.menuItemId.image}
                          alt={item.menuItemId.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                          {item.menuItemId?.name || "Item tidak ditemukan"}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {formatIDR(item.price)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base ml-4">
                      {formatIDR(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => printReceipt(selectedOrder)}
                icon={FileText}
                className="w-full sm:w-auto"
              >
                Cetak Struk
              </Button>
              <Button
                onClick={() => setIsDetailOpen(false)}
                className="w-full sm:w-auto"
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
