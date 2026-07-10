import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { CustomerRepository } from '../../data/CustomerRepository';
import { OrderRow, Profile, displayName } from '../../types/models';
import { LoadingIndicator, StatusBadge } from '../../components/CommonComponents';
import { money, theme } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/types';

export default function CustomerDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'CustomerDetail'>>();
  const { customerId } = route.params;
  const [customer, setCustomer] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [c, o] = await Promise.all([
          CustomerRepository.getCustomer(customerId),
          CustomerRepository.getCustomerOrders(customerId),
        ]);
        setCustomer(c);
        setOrders(o);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [customerId]);

  if (isLoading || !customer) return <LoadingIndicator />;

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
      data={orders}
      keyExtractor={(o) => o.id}
      ListHeaderComponent={
        <View>
          <View style={styles.card}>
            <Text style={styles.title}>{displayName(customer)}</Text>
            {customer.email ? <Text style={styles.line}>Email: {customer.email}</Text> : null}
            {customer.phone ? <Text style={styles.line}>Phone: {customer.phone}</Text> : null}
            {customer.address ? <Text style={styles.line}>Address: {customer.address}</Text> : null}
          </View>
          <Text style={[styles.title, { marginTop: 16, marginBottom: 8 }]}>Order history</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.card, { marginVertical: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={styles.orderTitle}>{item.order_number ?? item.id.slice(0, 8)}</Text>
            <Text style={styles.line}>{money(item.total)}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.border },
  title: { fontSize: 20, fontWeight: '700', color: theme.colors.onSurface },
  orderTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  line: { fontSize: 14, color: theme.colors.onSurface, marginTop: 4 },
});
