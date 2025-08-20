import { useColorScheme } from 'react-native';
import { useAppStore } from '@/store/appStore';
import { COLORS } from '@/constants';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const { theme, setTheme } = useAppStore();

  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');

  const colors = {
    primary: COLORS.amber[500],
    primaryDark: COLORS.amber[600],
    secondary: COLORS.gray[500],
    background: isDark ? COLORS.gray[900] : '#ffffff',
    surface: isDark ? COLORS.gray[800] : '#ffffff',
    card: isDark ? COLORS.gray[800] : '#ffffff',
    text: isDark ? '#ffffff' : COLORS.gray[900],
    textSecondary: isDark ? COLORS.gray[300] : COLORS.gray[600],
    border: isDark ? COLORS.gray[700] : COLORS.gray[200],
    error: COLORS.error,
    success: COLORS.success,
    warning: COLORS.warning,
    info: COLORS.info,
  };

  return {
    isDark,
    theme,
    colors,
    setTheme,
  };
};