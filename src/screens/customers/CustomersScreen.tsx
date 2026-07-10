import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerRepository } from '../../data/CustomerRepository';
import { Profile, displayName } from '../../types/models';
import { EmptyState, LoadingIndicator } from '../../components/CommonComponents';
import { theme } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/types';

export default function CustomersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');

  const refresh = useCallback(async (q: string) => {
    setIsLoading(true);
    try { setCustomers(await CustomerRepository.getCustomers(q)); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { refresh(query); }, [query, refresh]);

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search name, email, or phone"
        placeholderTextColor={theme.colors.onSurfaceMuted}
        style={styles.search}
      />
      {isLoading ? (
        <LoadingIndicator />
      ) : customers.length === 0 ? (
        <EmptyState message="No customers found." />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}>
              <Text style={styles.name}>{displayName(item)}</Text>
              {item.email ? <Text style={styles.sub}>{item.email}</Text> : null}
              {item.phone ? <Text style={styles.sub}>{item.phone}</Text> : null}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  search: { margin: 16, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: theme.colors.surface, color: theme.colors.onSurface },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, marginVertical: 4, borderWidth: 1, borderColor: theme.colors.border },
  name: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  sub: { fontSize: 14, color: theme.colors.onSurfaceMuted },
});
