import { create } from 'zustand';
import { OrderState, Order, MenuItem } from '@/types';
import { orderService } from '@/services/order';

interface OrderStore extends OrderState {
  fetchOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentMethod?: string;
    cashierId?: string;
  }) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  createOrder: (orderData: {
    items: Array<{ menuItemId: string; quantity: number }>;
    customerName: string;
    customerPhone?: string;
    paymentMethod: 'cash' | 'card' | 'digital' | 'midtrans';
    notes?: string;
  }) => Promise<Order>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  addToCart: (menuItem: MenuItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  clearError: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  currentOrder: null,
  cart: [],
  isLoading: false,
  error: null,

  fetchOrders: async (params) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await orderService.getOrders(params);
      
      if (response.success && response.data) {
        set({
          orders: response.data.orders,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const order = await orderService.getOrderById(id);
      set({
        currentOrder: order,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    
    try {
      const order = await orderService.createOrder(orderData);
      
      // Add to orders list
      const orders = [order, ...get().orders];
      
      set({
        orders,
        currentOrder: order,
        cart: [], // Clear cart after successful order
        isLoading: false,
        error: null,
      });
      
      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedOrder = await orderService.updateOrderStatus(id, status);
      
      // Update in orders list
      const orders = get().orders.map(order =>
        order._id === id ? updatedOrder : order
      );
      
      // Update current order if it's the same
      const currentOrder = get().currentOrder?._id === id ? updatedOrder : get().currentOrder;
      
      set({
        orders,
        currentOrder,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  addToCart: (menuItem: MenuItem) => {
    const cart = get().cart;
    const existingItem = cart.find(item => item.menuItem._id === menuItem._id);
    
    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.menuItem._id === menuItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      set({ cart: updatedCart });
    } else {
      set({ cart: [...cart, { menuItem, quantity: 1 }] });
    }
  },

  removeFromCart: (menuItemId: string) => {
    const cart = get().cart.filter(item => item.menuItem._id !== menuItemId);
    set({ cart });
  },

  updateCartQuantity: (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(menuItemId);
      return;
    }
    
    const cart = get().cart.map(item =>
      item.menuItem._id === menuItemId
        ? { ...item, quantity }
        : item
    );
    set({ cart });
  },

  clearCart: () => {
    set({ cart: [] });
  },

  getCartTotal: () => {
    return get().cart.reduce((total, item) => {
      return total + (item.menuItem.price * item.quantity);
    }, 0);
  },

  getCartItemCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },

  clearError: () => {
    set({ error: null });
  },
}));