import { apiService } from './api';
import { DashboardStats } from '@/types';

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const response = await apiService.get<{ stats: DashboardStats }>('/dashboard/stats');
    
    if (response.data.success && response.data.data) {
      return response.data.data.stats;
    }
    
    throw new Error(response.data.message || 'Failed to get dashboard stats');
  }

  async getRevenueReport(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'hour' | 'day' | 'week' | 'month' | 'year';
  }): Promise<{
    data: Array<{
      _id: string;
      totalOrders: number;
      totalRevenue: number;
      avgOrderValue: number;
    }>;
    summary: {
      totalOrders: number;
      totalRevenue: number;
      avgOrderValue: number;
      minOrderValue: number;
      maxOrderValue: number;
    };
  }> {
    const response = await apiService.get<{
      report: {
        data: Array<{
          _id: string;
          totalOrders: number;
          totalRevenue: number;
          avgOrderValue: number;
        }>;
        summary: {
          totalOrders: number;
          totalRevenue: number;
          avgOrderValue: number;
          minOrderValue: number;
          maxOrderValue: number;
        };
      };
    }>('/dashboard/reports/revenue', { params });
    
    if (response.data.success && response.data.data) {
      return response.data.data.report;
    }
    
    throw new Error(response.data.message || 'Failed to get revenue report');
  }

  async getProductReport(params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<{
    products: Array<{
      _id: string;
      name: string;
      category: string;
      price: number;
      totalQuantitySold: number;
      totalRevenue: number;
      orderCount: number;
      avgQuantityPerOrder: number;
    }>;
    categoryBreakdown: Array<{
      _id: string;
      totalQuantity: number;
      totalRevenue: number;
      uniqueProductCount: number;
      orderCount: number;
    }>;
  }> {
    const response = await apiService.get<{
      report: {
        products: Array<{
          _id: string;
          name: string;
          category: string;
          price: number;
          totalQuantitySold: number;
          totalRevenue: number;
          orderCount: number;
          avgQuantityPerOrder: number;
        }>;
        categoryBreakdown: Array<{
          _id: string;
          totalQuantity: number;
          totalRevenue: number;
          uniqueProductCount: number;
          orderCount: number;
        }>;
      };
    }>('/dashboard/reports/products', { params });
    
    if (response.data.success && response.data.data) {
      return response.data.data.report;
    }
    
    throw new Error(response.data.message || 'Failed to get product report');
  }
}

export const dashboardService = new DashboardService();