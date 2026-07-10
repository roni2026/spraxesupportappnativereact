import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { OrderRepository } from '../../data/OrderRepository';
import { OrderItemRow, OrderRow } from '../../types/models';
import { LoadingIndicator, StatusBadge } from '../../components/CommonComponents';
import { money, theme, titleCase } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/types';

const orderStatuses = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];
const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

function Dropdown({
  label, current, options, onSelect,
}: { label: string; current: string; options: string[]; onSelect: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginTop: 8 }}>
      <Pressable style={styles.outlinedBtn} onPress={() => setOpen((o) => !o)}>
        <Text style={styles.outlinedBtnText}>{titleCase(current)}</Text>
      </Pressable>
      {open && (
        <View style={styles.menu}>
          {options.map((o) => (
            <Pressable key={o} style={styles.menuItem} onPress={() => { setOpen(false); onSelect(o); }}>
              <Text style={styles.menuItemText}>{titleCase(o)}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function OrderDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'OrderDetail'>>();
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const [o, its] = await Promise.all([
        OrderRepository.getOrder(orderId),
        OrderRepository.getOrderItems(orderId),
      ]);
      setOrder(o);
      setItems(its);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [orderId]);

  const updateStatus = async (status: string) => {
    await OrderRepository.updateStatus(orderId, status);
    setOrder((prev) => (prev ? { ...prev, status } : prev));
  };
  const updatePayment = async (paymentStatus: string) => {
    await OrderRepository.updatePaymentStatus(orderId, paymentStatus);
    setOrder((prev) => (prev ? { ...prev, payment_status: paymentStatus } : prev));
  };

  if (isLoading || !order) return <LoadingIndicator />;

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
      data={items}
      keyExtractor={(it, idx) => it.id ?? String(idx)}
      ListHeaderComponent={
        <View>
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.title}>{order.order_number ?? order.id}</Text>
              <StatusBadge status={order.status} />
            </View>
            <Text style={styles.line}>Total: {money(order.total)}</Text>
            {order.contact_number ? <Text style={styles.line}>Phone: {order.contact_number}</Text> : null}
            {order.shipping_address ? <Text style={styles.line}>Address: {order.shipping_address}</Text> : null}
            <Text style={styles.line}>
              Payment: {order.payment_method ?? 'N/A'} ({order.payment_status ?? 'pending'})
            </Text>
            {order.payment_transaction_id ? (
              <Text style={[styles.line, { fontWeight: '700' }]}>Transaction ID: {order.payment_transaction_id}</Text>
            ) : null}
          </View>

          <View style={[styles.card, { marginTop: 12 }]}>
            <Text style={styles.sectionTitle}>Update order status</Text>
            <Dropdown label="status" current={order.status} options={orderStatuses} onSelect={updateStatus} />
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Update payment status</Text>
            <Dropdown
              label="payment"
              current={order.payment_status ?? 'pending'}
              options={paymentStatuses}
              onSelect={updatePayment}
            />
          </View>

          <Text style={[styles.title, { marginTop: 16, marginBottom: 8 }]}>Items</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.card, { marginVertical: 4 }]}>
          <Text style={styles.itemName}>{item.product_name}</Text>
          <Text style={styles.line}>
            {`Qty ${item.quantity} \u00d7 ${money(item.unit_price)} = ${money(item.total_price)}`}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.border },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: theme.colors.onSurface },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  line: { fontSize: 14, color: theme.colors.onSurface, marginTop: 4 },
  itemName: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 12 },
  outlinedBtn: { alignSelf: 'flex-start', borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  outlinedBtnText: { color: theme.colors.primary, fontWeight: '600' },
  menu: { marginTop: 4, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, backgroundColor: theme.colors.surface, alignSelf: 'flex-start', minWidth: 180 },
  menuItem: { paddingHorizontal: 16, paddingVertical: 10 },
  menuItemText: { fontSize: 14, color: theme.colors.onSurface },
});
