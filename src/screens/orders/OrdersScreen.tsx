import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OrderRepository } from '../../data/OrderRepository';
import { OrderRow } from '../../types/models';
import { EmptyState, LoadingIndicator, StatusBadge } from '../../components/CommonComponents';
import { money, theme, titleCase } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/types';

const statusOptions = ['all', 'pending', 'confirmed', 'processing', 'delivered', 'cancelled'];

export default function OrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');

  const refresh = useCallback(async (status: string, q: string) => {
    setIsLoading(true);
    try {
      setOrders(await OrderRepository.getOrders(status, q));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(statusFilter, query); }, [statusFilter, query, refresh]);

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search order number"
        placeholderTextColor={theme.colors.onSurfaceMuted}
        style={styles.search}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {statusOptions.map((s) => {
          const selected = statusFilter === s;
          return (
            <Pressable
              key={s}
              onPress={() => setStatusFilter(s)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{titleCase(s)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <LoadingIndicator />
      ) : orders.length === 0 ? (
        <EmptyState message="No orders found." />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{item.order_number ?? item.id.slice(0, 8)}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.cardSub}>{`${money(item.total)} \u2022 ${item.payment_method ?? 'N/A'}`}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  search: {
    margin: 16, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: theme.colors.surface, color: theme.colors.onSurface,
  },
  chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  chipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.onSurface },
  chipTextSelected: { color: '#fff' },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, marginVertical: 4, borderWidth: 1, borderColor: theme.colors.border },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  cardSub: { fontSize: 14, color: theme.colors.onSurface, marginTop: 4 },
});
