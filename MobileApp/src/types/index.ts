// User Types
export interface User {
  _id: string;
  nama: string;
  email: string;
  role: 'admin' | 'cashier';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Menu Types
export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'Coffee' | 'Tea' | 'Food' | 'Dessert' | 'Beverage';
  image: string;
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  cashierId: User;
  items: OrderItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital' | 'midtrans';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  customerName: string;
  customerPhone?: string;
  notes?: string;
  midtransToken?: string;
  midtransOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

// Shift Types
export interface Shift {
  _id: string;
  userId: string;
  clockIn: string;
  clockOut?: string;
  duration: number; // in minutes
  status: 'active' | 'completed' | 'overtime';
  date: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
  shift?: {
    clockIn: string;
    hoursWorked: number;
    maxHours: number;
  };
}

// Dashboard Types
export interface DashboardStats {
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
  topSellingItems: Array<{
    _id: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
    menuItem: MenuItem;
  }>;
  dailySales: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

// Form Types
export interface CreateOrderForm {
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
  customerName: string;
  customerPhone?: string;
  paymentMethod: 'cash' | 'card' | 'digital' | 'midtrans';
  notes?: string;
}

export interface CreateMenuItemForm {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  image?: string;
}

export interface CreateUserForm {
  nama: string;
  email: string;
  password: string;
  role: 'admin' | 'cashier';
  avatar?: string;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  OrderDetail: { orderId: string };
  MenuDetail: { menuId: string };
  CreateOrder: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Menu: undefined;
  History: undefined;
  Profile: undefined;
};

// Store Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface MenuState {
  items: MenuItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string;
  searchQuery: string;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  cart: Array<{
    menuItem: MenuItem;
    quantity: number;
  }>;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  theme: 'light' | 'dark' | 'system';
  isOnline: boolean;
  lastSync: string | null;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

// Component Props Types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
  shadow?: boolean;
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: Record<string, number>;
  borderRadius: Record<string, number>;
  fontSize: Record<string, number>;
  fontWeight: Record<string, string>;
}