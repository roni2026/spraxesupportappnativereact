import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { InvoiceRepository } from '../../data/InvoiceRepository';
import { Invoice } from '../../types/models';
import { EmptyState, LoadingIndicator } from '../../components/CommonComponents';
import { money, theme } from '../../theme/theme';

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try { setInvoices(await InvoiceRepository.getInvoices()); } finally { setIsLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (isLoading) return <LoadingIndicator />;
  if (invoices.length === 0) return <EmptyState message="No invoices generated yet." />;

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      data={invoices}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.number}>{item.invoice_number ?? item.id.slice(0, 8)}</Text>
          <Text style={styles.sub}>{`Total: ${money(item.total)} \u2022 Status: ${item.status ?? 'N/A'}`}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, marginVertical: 4, borderWidth: 1, borderColor: theme.colors.border },
  number: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  sub: { fontSize: 14, color: theme.colors.onSurface, marginTop: 2 },
});
