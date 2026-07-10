import React, { useCallback, useState } from 'react';
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

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const [s, o] = await Promise.all([
          DashboardRepository.getStats(),
          DashboardRepository.getRecentOrders(),
        ]);
        if (active) { setStats(s); setRecentOrders(o); }
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useFocusEffect(refresh);

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
