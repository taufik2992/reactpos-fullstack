import { apiService } from './api';
import { MenuItem, PaginationResponse, CreateMenuItemForm } from '@/types';

export class MenuService {
  async getMenuItems(params?: {
    page?: number;
    limit?: number;
    category?: string;
    isAvailable?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginationResponse<{ menuItems: MenuItem[] }>> {
    const response = await apiService.get<{ menuItems: MenuItem[] }>('/menu', { params });
    return response.data;
  }

  async getMenuItemById(id: string): Promise<MenuItem> {
    const response = await apiService.get<{ menuItem: MenuItem }>(`/menu/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data.menuItem;
    }
    
    throw new Error(response.data.message || 'Failed to get menu item');
  }

  async createMenuItem(data: CreateMenuItemForm): Promise<MenuItem> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('stock', data.stock);
    
    if (data.image) {
      formData.append('image', {
        uri: data.image,
        type: 'image/jpeg',
        name: 'menu-image.jpg',
      } as any);
    }

    const response = await apiService.upload<{ menuItem: MenuItem }>('/menu', formData);
    
    if (response.data.success && response.data.data) {
      return response.data.data.menuItem;
    }
    
    throw new Error(response.data.message || 'Failed to create menu item');
  }

  async updateMenuItem(id: string, data: Partial<CreateMenuItemForm>): Promise<MenuItem> {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.price) formData.append('price', data.price);
    if (data.category) formData.append('category', data.category);
    if (data.stock) formData.append('stock', data.stock);
    
    if (data.image) {
      formData.append('image', {
        uri: data.image,
        type: 'image/jpeg',
        name: 'menu-image.jpg',
      } as any);
    }

    const response = await apiService.upload<{ menuItem: MenuItem }>(`/menu/${id}`, formData);
    
    if (response.data.success && response.data.data) {
      return response.data.data.menuItem;
    }
    
    throw new Error(response.data.message || 'Failed to update menu item');
  }

  async deleteMenuItem(id: string): Promise<void> {
    const response = await apiService.delete(`/menu/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete menu item');
    }
  }

  async updateStock(id: string, stock: number): Promise<MenuItem> {
    const response = await apiService.patch<{ menuItem: MenuItem }>(`/menu/${id}/stock`, { stock });
    
    if (response.data.success && response.data.data) {
      return response.data.data.menuItem;
    }
    
    throw new Error(response.data.message || 'Failed to update stock');
  }

  async getCategories(): Promise<string[]> {
    const response = await apiService.get<{ categories: string[] }>('/menu/categories');
    
    if (response.data.success && response.data.data) {
      return response.data.data.categories;
    }
    
    throw new Error(response.data.message || 'Failed to get categories');
  }
}

export const menuService = new MenuService();