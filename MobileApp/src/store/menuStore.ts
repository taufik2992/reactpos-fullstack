import { create } from 'zustand';
import { MenuState, MenuItem } from '@/types';
import { menuService } from '@/services/menu';

interface MenuStore extends MenuState {
  fetchMenuItems: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    isAvailable?: boolean;
    search?: string;
  }) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  removeMenuItem: (id: string) => void;
  addMenuItem: (item: MenuItem) => void;
  clearError: () => void;
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  items: [],
  categories: [],
  isLoading: false,
  error: null,
  selectedCategory: 'All',
  searchQuery: '',

  fetchMenuItems: async (params) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await menuService.getMenuItems(params);
      
      if (response.success && response.data) {
        set({
          items: response.data.menuItems,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Failed to fetch menu items');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch menu items';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await menuService.getCategories();
      set({ categories: ['All', ...categories] });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  updateMenuItem: (id: string, updates: Partial<MenuItem>) => {
    const items = get().items.map(item =>
      item._id === id ? { ...item, ...updates } : item
    );
    set({ items });
  },

  removeMenuItem: (id: string) => {
    const items = get().items.filter(item => item._id !== id);
    set({ items });
  },

  addMenuItem: (item: MenuItem) => {
    const items = [item, ...get().items];
    set({ items });
  },

  clearError: () => {
    set({ error: null });
  },
}));