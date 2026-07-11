import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardRepository } from '../../data/DashboardRepository';
import { DashboardStats, OrderRow } from '../../types/models';
import { LoadingIndicator, StatCard, StatusBadge } from '../../components/CommonComponents';
import { money, theme } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/types';

const emptyStats: DashboardStats = {
  products: 0, orders: 0, customers: 0, pendingOrders: 0, openTickets: 0, inProgressTickets: 0, pendingSellerApps: 0,
};

// Module-level cache so re-focusing the Dashboard tab doesn't re-fetch every time.
interface DashboardCacheData {
  stats: DashboardStats;
  recentOrders: OrderRow[];
}
let dashboardCache: { data: DashboardCacheData; timestamp: number } | null = null;
const CACHE_TTL = 30_000; // 30 seconds

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const refresh = useCallback((force = false) => {
    // Use cache if fresh and not forcing a refresh
    if (!force && dashboardCache && Date.now() - dashboardCache.timestamp < CACHE_TTL) {
      setStats(dashboardCache.data.stats);
      setRecentOrders(dashboardCache.data.recentOrders);
      setIsLoading(false);
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const [s, o] = await Promise.all([
          DashboardRepository.getStats(),
          DashboardRepository.getRecentOrders(),
        ]);
        if (active) {
          setStats(s);
          setRecentOrders(o);
          dashboardCache = { data: { stats: s, recentOrders: o }, timestamp: Date.now() };
        }
      } finally {
        if (active) setIsLoading(false);
        isFetchingRef.current = false;
      }
    })();
    return () => { active = false; };
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (isLoading && recentOrders.length === 0) return <LoadingIndicator />;

  const cards: { label: string; value: string }[] = [
    { label: 'Products', value: String(stats.products) },
    { label: 'Total orders', value: String(stats.orders) },
    { label: 'Customers', value: String(stats.customers) },
    { label: 'Pending orders', value: String(stats.pendingOrders) },
    { label: 'Open tickets', value: String(stats.openTickets) },
    { label: 'In-progress chats', value: String(stats.inProgressTickets) },
  ];

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
      data={recentOrders}
      keyExtractor={(o) => o.id}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={10}
      ListHeaderComponent={
        <View>
          <Text style={styles.h1}>Overview</Text>
          <View style={styles.grid}>
            {cards.map((c) => (
              <View key={c.label} style={styles.gridItem}>
                <StatCard label={c.label} value={c.value} />
              </View>
            ))}
          </View>
          <Text style={[styles.h1, { marginTop: 12 }]}>Recent orders</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{item.order_number ?? item.id.slice(0, 8)}</Text>
            <StatusBadge status={item.status} />
          </View>
          <Text style={styles.cardSub}>{money(item.total)}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 20, fontWeight: '700', color: theme.colors.onSurface },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 12 },
  gridItem: { width: '47.5%' },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, marginVertical: 4,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  cardSub: { fontSize: 14, color: theme.colors.onSurface, marginTop: 4 },
});
