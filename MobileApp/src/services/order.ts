import { apiService } from './api';
import { Order, PaginationResponse, CreateOrderForm } from '@/types';

export class OrderService {
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentMethod?: string;
    cashierId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginationResponse<{ orders: Order[] }>> {
    const response = await apiService.get<{ orders: Order[] }>('/orders', { params });
    return response.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await apiService.get<{ order: Order }>(`/orders/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data.order;
    }
    
    throw new Error(response.data.message || 'Failed to get order');
  }

  async createOrder(data: CreateOrderForm): Promise<Order> {
    const response = await apiService.post<{ order: Order }>('/orders', data);
    
    if (response.data.success && response.data.data) {
      return response.data.data.order;
    }
    
    throw new Error(response.data.message || 'Failed to create order');
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const response = await apiService.patch<{ order: Order }>(`/orders/${id}/status`, { status });
    
    if (response.data.success && response.data.data) {
      return response.data.data.order;
    }
    
    throw new Error(response.data.message || 'Failed to update order status');
  }

  async getOrderStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusBreakdown: Array<{
      _id: string;
      count: number;
      totalValue: number;
    }>;
  }> {
    const response = await apiService.get<{
      stats: {
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
      };
      statusBreakdown: Array<{
        _id: string;
        count: number;
        totalValue: number;
      }>;
    }>('/orders/stats', { params });
    
    if (response.data.success && response.data.data) {
      return {
        ...response.data.data.stats,
        statusBreakdown: response.data.data.statusBreakdown,
      };
    }
    
    throw new Error(response.data.message || 'Failed to get order stats');
  }
}

export const orderService = new OrderService();