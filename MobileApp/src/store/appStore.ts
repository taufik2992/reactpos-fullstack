import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from '@/types';
import { STORAGE_KEYS } from '@/constants';

interface AppStore extends AppState {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setOnlineStatus: (isOnline: boolean) => void;
  updateLastSync: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'system',
      isOnline: true,
      lastSync: null,

      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
      },

      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
      },

      updateLastSync: () => {
        set({ lastSync: new Date().toISOString() });
      },
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);