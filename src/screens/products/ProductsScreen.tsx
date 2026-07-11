import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { ProductRepository } from '../../data/ProductRepository';
import { Product, displayPrice, thumbnailUrl } from '../../types/models';
import { ConfirmDialog, EmptyState, FallbackImage, LoadingIndicator } from '../../components/CommonComponents';
import { money, theme } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/types';

export default function ProductsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const refresh = useCallback(async (q: string) => {
    setIsLoading(true);
    try {
      setProducts(await ProductRepository.getProducts(q));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { refresh(query); }, [query, refresh]));

  const toggleActive = async (p: Product) => { await ProductRepository.setActive(p.id, !p.is_active); refresh(query); };
  const toggleFeatured = async (p: Product) => { await ProductRepository.setFeatured(p.id, !p.is_featured); refresh(query); };
  const doDelete = async (p: Product) => { await ProductRepository.deleteProduct(p.id); setPendingDelete(null); refresh(query); };

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search products"
        placeholderTextColor={theme.colors.onSurfaceMuted}
        style={styles.search}
      />
      {isLoading ? (
        <LoadingIndicator />
      ) : products.length === 0 ? (
        <EmptyState message="No products yet. Tap + to add one." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={10}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => navigation.navigate('ProductEdit', { productId: item.id })}>
              <FallbackImage url={thumbnailUrl(item)} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{`${money(displayPrice(item))} \u2022 Stock ${item.stock_quantity ?? 0}`}</Text>
              </View>
              <Pressable onPress={() => toggleFeatured(item)} style={styles.iconBtn}>
                <MaterialIcons name={item.is_featured ? 'star' : 'star-border'} size={22} color={theme.colors.accent} />
              </Pressable>
              <Switch value={item.is_active} onValueChange={() => toggleActive(item)} />
              <Pressable onPress={() => setPendingDelete(item)} style={styles.iconBtn}>
                <MaterialIcons name="delete" size={22} color={theme.colors.error} />
              </Pressable>
            </Pressable>
          )}
        />
      )}

      <Pressable style={styles.fab} onPress={() => navigation.navigate('ProductEdit', {})}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </Pressable>

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Delete product?"
        message={pendingDelete ? `"${pendingDelete.name}" will be permanently removed from the catalog.` : ''}
        confirmLabel="Delete"
        onConfirm={() => pendingDelete && doDelete(pendingDelete)}
        onDismiss={() => setPendingDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  search: { margin: 16, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: theme.colors.surface, color: theme.colors.onSurface },
  card: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 12, marginVertical: 4, borderWidth: 1, borderColor: theme.colors.border },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  sub: { fontSize: 13, color: theme.colors.onSurfaceMuted, marginTop: 2 },
  iconBtn: { padding: 4 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});
