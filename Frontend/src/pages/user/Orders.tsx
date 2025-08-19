import React, { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  ShoppingCart,
  Search,
  CreditCard,
  Banknote,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { MenuItem, OrderItem } from "../../types";
import { menuAPI, orderAPI, paymentAPI, formatIDR } from "../../services/api";
import toast from "react-hot-toast";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}
export const Orders: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "midtrans">(
    "cash"
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMenuItems();
    loadCategories();
  }, []);

  const loadMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      if (response.data.success) {
        setMenuItems(response.data.menuItems);
      }
    } catch (error) {
      toast.error("Gagal memuat item menu");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await menuAPI.getCategories();
      if (response.data.success) {
        setCategories(["All", ...response.data.categories]);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.isAvailable;
  });

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find((item) => item.menuItemId === menuItem.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.menuItemId === menuItem.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        menuItemId: menuItem.id,
        quantity: 1,
        price: menuItem.price,
        subtotal: menuItem.price,
      };
      setCart([...cart, newItem]);
    }
    toast.success(`${menuItem.name} ditambahkan ke keranjang`);
  };

  const removeFromCart = (menuItemId: string) => {
    const existingItem = cart.find((item) => item.menuItemId === menuItemId);

    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.menuItemId === menuItemId
            ? {
                ...item,
                quantity: item.quantity - 1,
                subtotal: (item.quantity - 1) * item.price,
              }
            : item
        )
      );
    } else {
      setCart(cart.filter((item) => item.menuItemId !== menuItemId));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const getMenuItemById = (id: string) => {
    return menuItems.find((item) => item.id === id);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Keranjang kosong");
      return;
    }

    setIsCheckoutOpen(true);
  };

  const completeOrder = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        customerName: customerName || "Walk-in Customer",
        customerPhone,
        paymentMethod,
        notes: "",
      };

      const response = await orderAPI.create(orderData);

      if (response.data.success) {
        const order = response.data.order;

        if (paymentMethod === "midtrans") {
          try {
            const paymentResponse = await paymentAPI.create(order._id);
            if (paymentResponse.data.success) {
              // 🔥 Snap popup muncul di halaman ini
              window.snap.pay(paymentResponse.data.token, {
                onSuccess: function (result) {
                  toast.success("Pembayaran berhasil!");
                  console.log("Success:", result);

                  setCart([]);
                  setCustomerName("");
                  setCustomerPhone("");
                  setIsCheckoutOpen(false);
                  loadMenuItems();
                },
                onPending: function (result) {
                  toast("Pembayaran pending, menunggu konfirmasi.");
                  console.log("Pending:", result);
                },
                onError: function (result) {
                  toast.error("Terjadi kesalahan pembayaran");
                  console.error("Error:", result);
                },
                onClose: function () {
                  toast(
                    "Popup pembayaran ditutup tanpa menyelesaikan transaksi."
                  );
                  console.log("Customer closed the popup");
                },
              });

              return; // 🔴 stop di sini, biar nggak eksekusi toast order berhasil di bawah
            }
          } catch (paymentError) {
            toast.error("Gagal membuat link pembayaran");
          }
        }

        // Kalau metode cash
        toast.success(`Pesanan #${order._id.slice(-6)} berhasil dibuat!`);

        setCart([]);
        setCustomerName("");
        setCustomerPhone("");
        setIsCheckoutOpen(false);

        // Reload menu items untuk update stock
        loadMenuItems();
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Gagal membuat pesanan";
      toast.error(message);
    } finally {
      setSubmitting(false);
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
          Buat Pesanan
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          Pilih item dan buat pesanan pelanggan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-3 order-2 lg:order-1">
          <Card>
            <div className="space-y-4 mb-4 sm:mb-6">
              <Input
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Cari item menu..."
                icon={Search}
              />

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-amber-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {category === "All" ? "Semua" : category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-56 sm:h-72 object-cover rounded-lg mb-3"
                  />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold text-amber-600">
                        {formatIDR(item.price)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        icon={Plus}
                        disabled={item.stock === 0}
                        className="text-xs"
                      >
                        Tambah
                      </Button>
                    </div>
                    {item.stock < 10 && (
                      <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                        Tersisa {item.stock}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Tidak ada item ditemukan
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1 order-1 lg:order-2">
          <Card className="lg:sticky lg:top-20" padding="sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Keranjang</span> (
                {cart.length})
              </h3>
              {cart.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearCart}
                  className="text-xs"
                >
                  Kosongkan
                </Button>
              )}
            </div>

            <div className="space-y-2 sm:space-y-3 mb-4 max-h-48 sm:max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                  Keranjang kosong
                </p>
              ) : (
                cart.map((item) => {
                  const menuItem = getMenuItemById(item.menuItemId);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                          {menuItem?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatIDR(item.price)} each
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => removeFromCart(item.menuItemId)}
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const menuItem = getMenuItemById(item.menuItemId);
                            if (menuItem) addToCart(menuItem);
                          }}
                          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      <div className="ml-2 text-right">
                        <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                          {formatIDR(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-amber-600">
                      {formatIDR(getCartTotal())}
                    </span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                    size="lg"
                    icon={CreditCard}
                  >
                    Checkout
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Checkout"
        size="lg"
      >
        <div className="space-y-4 sm:space-y-6">
          <Input
            label="Nama Pelanggan"
            value={customerName}
            onChange={setCustomerName}
            placeholder="Masukkan nama pelanggan (opsional)"
          />

          <Input
            label="Nomor Telepon"
            value={customerPhone}
            onChange={setCustomerPhone}
            placeholder="Masukkan nomor telepon (opsional)"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`p-3 sm:p-4 border rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                  paymentMethod === "cash"
                    ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Tunai</span>
              </button>
              <button
                onClick={() => setPaymentMethod("midtrans")}
                className={`p-3 sm:p-4 border rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                  paymentMethod === "midtrans"
                    ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Digital</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="space-y-2">
              {cart.map((item) => {
                const menuItem = getMenuItemById(item.menuItemId);
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 truncate mr-2">
                      {menuItem?.name} x {item.quantity}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatIDR(item.subtotal)}
                    </span>
                  </div>
                );
              })}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-semibold">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-amber-600 text-lg">
                  {formatIDR(getCartTotal())}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsCheckoutOpen(false)}
              className="w-full sm:flex-1"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={completeOrder}
              className="w-full sm:flex-1"
              disabled={submitting}
            >
              {submitting ? "Memproses..." : "Selesaikan Pesanan"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
