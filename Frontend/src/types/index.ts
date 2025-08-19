export interface User {
  id: string;
  nama: string;
  email: string;
  role: "admin" | "cashier";
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // In IDR
  category: string;
  image: string;
  stock: number;
  isAvailable: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number; // In IDR
  subtotal: number; // In IDR
}

export interface Order {
  id: string;
  cashierId: string;

  items: OrderItem[];
  total: number; // In IDR
  paymentMethod: "cash" | "midtrans";
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface DashboardStats {
  todaySales: number; // In IDR
  todayOrders: number;
  lowStock: number;
  totalUsers: number;
}

export interface SalesData {
  date: string;
  sales: number; // In IDR
  orders: number;
}

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  clockIn: string;
  clockOut?: string;
  status: "active" | "completed";
  totalSales: number;
  totalOrders: number;
}

export interface ShiftStats {
  date: string;
  totalShifts: number;
  totalSales: number;
  totalOrders: number;
}
