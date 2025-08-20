import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { dashboardService } from '@/services/dashboard';
import { formatIDR } from '@/services/api';
import { DashboardStats } from '@/types';
import { SPACING, FONT_SIZE, FONT_WEIGHT } from '@/constants';

export default function DashboardScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async (): Promise<void> => {
    try {
      setError(null);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data dashboard';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = (): void => {
    setRefreshing(true);
    loadDashboardData();
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

  const headerStyle: ViewStyle = {
    padding: SPACING.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const greetingStyle: TextStyle = {
    fontSize: FONT_SIZE.lg,
    color: colors.textSecondary,
  };

  const nameStyle: TextStyle = {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: FONT_WEIGHT.bold,
    color: colors.text,
    marginTop: SPACING.xs,
  };

  const scrollViewStyle: ViewStyle = {
    flex: 1,
    padding: SPACING.lg,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: colors.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  };

  const statsGridStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  };

  const statCardStyle: ViewStyle = {
    width: '48%',
    marginBottom: SPACING.md,
  };

  const statIconStyle: ViewStyle = {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  };

  const statValueStyle: TextStyle = {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: FONT_WEIGHT.bold,
    color: colors.text,
    marginBottom: SPACING.xs,
  };

  const statLabelStyle: TextStyle = {
    fontSize: FONT_SIZE.sm,
    color: colors.textSecondary,
  };

  const topItemStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  };

  const topItemImageStyle: ViewStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  };

  const topItemInfoStyle: ViewStyle = {
    flex: 1,
  };

  const topItemNameStyle: TextStyle = {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: colors.text,
  };

  const topItemStatsStyle: TextStyle = {
    fontSize: FONT_SIZE.sm,
    color: colors.textSecondary,
    marginTop: SPACING.xs,
  };

  if (loading) {
    return <LoadingSpinner text="Memuat dashboard..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={containerStyle}>
        <View style={{ flex: 1, padding: SPACING.lg }}>
          <ErrorMessage message={error} onRetry={loadDashboardData} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <Text style={greetingStyle}>Selamat datang kembali,</Text>
        <Text style={nameStyle}>{user?.nama}</Text>
      </View>

      <ScrollView
        style={scrollViewStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Stats Overview */}
        <Text style={sectionTitleStyle}>Ringkasan Hari Ini</Text>
        <View style={statsGridStyle}>
          <Card style={statCardStyle}>
            <View style={[statIconStyle, { backgroundColor: `${colors.success}20` }]}>
              <Ionicons name="cash" size={24} color={colors.success} />
            </View>
            <Text style={statValueStyle}>
              {formatIDR(stats?.revenue.today || 0)}
            </Text>
            <Text style={statLabelStyle}>Pendapatan Hari Ini</Text>
          </Card>

          <Card style={statCardStyle}>
            <View style={[statIconStyle, { backgroundColor: `${colors.info}20` }]}>
              <Ionicons name="receipt" size={24} color={colors.info} />
            </View>
            <Text style={statValueStyle}>{stats?.orders.today || 0}</Text>
            <Text style={statLabelStyle}>Pesanan Hari Ini</Text>
          </Card>

          <Card style={statCardStyle}>
            <View style={[statIconStyle, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="people" size={24} color={colors.warning} />
            </View>
            <Text style={statValueStyle}>{stats?.overview.activeUsers || 0}</Text>
            <Text style={statLabelStyle}>Pengguna Aktif</Text>
          </Card>

          <Card style={statCardStyle}>
            <View style={[statIconStyle, { backgroundColor: `${colors.primary}20` }]}>
              <Ionicons name="restaurant" size={24} color={colors.primary} />
            </View>
            <Text style={statValueStyle}>{stats?.overview.totalMenuItems || 0}</Text>
            <Text style={statLabelStyle}>Total Menu</Text>
          </Card>
        </View>

        {/* Monthly Stats */}
        <Text style={sectionTitleStyle}>Statistik Bulanan</Text>
        <Card style={{ marginBottom: SPACING.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={statValueStyle}>{stats?.orders.month || 0}</Text>
              <Text style={statLabelStyle}>Pesanan</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={statValueStyle}>
                {formatIDR(stats?.revenue.month || 0)}
              </Text>
              <Text style={statLabelStyle}>Pendapatan</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={statValueStyle}>
                {formatIDR(stats?.overview.avgOrderValue || 0)}
              </Text>
              <Text style={statLabelStyle}>Rata-rata</Text>
            </View>
          </View>
        </Card>

        {/* Top Selling Items */}
        {stats?.topSellingItems && stats.topSellingItems.length > 0 && (
          <>
            <Text style={sectionTitleStyle}>Menu Terlaris</Text>
            <Card>
              {stats.topSellingItems.slice(0, 5).map((item, index) => (
                <View key={item._id} style={topItemStyle}>
                  <View style={topItemImageStyle}>
                    <Text style={{ color: '#ffffff', fontWeight: FONT_WEIGHT.bold }}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={topItemInfoStyle}>
                    <Text style={topItemNameStyle}>{item.menuItem.name}</Text>
                    <Text style={topItemStatsStyle}>
                      {item.totalQuantity} terjual • {formatIDR(item.totalRevenue)}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}