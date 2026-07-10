import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductRepository } from '../../data/ProductRepository';
import { CategoryRepository } from '../../data/CategoryRepository';
import { Category, displayPrice } from '../../types/models';
import { theme } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/types';

export default function ProductEditScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ProductEdit'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const productId = route.params?.productId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [imagesCsv, setImagesCsv] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    (async () => setCategories(await CategoryRepository.getCategories()))();
  }, []);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      const p = await ProductRepository.getProduct(productId);
      if (!p) return;
      setName(p.name);
      setSlug(p.slug ?? '');
      setDescription(p.description ?? '');
      setPrice(String(displayPrice(p)));
      setStockQuantity(String(p.stock_quantity ?? 0));
      setImagesCsv((p.images ?? []).join(', '));
      setCategoryId(p.category_id ?? null);
      setIsActive(p.is_active);
      setIsFeatured(p.is_featured);
    })();
  }, [productId]);

  const save = async () => {
    const priceValue = Number(price);
    if (!name.trim() || !slug.trim() || Number.isNaN(priceValue)) {
      setErrorMessage('Name, slug, and a valid price are required.');
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const images = imagesCsv.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      const stockValue = parseInt(stockQuantity, 10) || 0;
      const params = { name, slug, description, price: priceValue, categoryId, stockQuantity: stockValue, images, isActive, isFeatured };
      if (!productId) await ProductRepository.createProduct(params);
      else await ProductRepository.updateProduct(productId, params);
      navigation.goBack();
    } catch (e: any) {
      setErrorMessage(e?.message ?? 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name ?? 'No category';

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{productId ? 'Edit product' : 'New product'}</Text>
      <View style={{ height: 16 }} />

      <Field label="Name" value={name} onChange={setName} />
      <Field label="Slug" value={slug} onChange={setSlug} />
      <Field label="Description" value={description} onChange={setDescription} multiline />
      <Field label="Price" value={price} onChange={setPrice} keyboardType="numeric" />
      <Field label="Stock quantity" value={stockQuantity} onChange={setStockQuantity} keyboardType="numeric" />
      <Field label="Image URLs (comma separated)" value={imagesCsv} onChange={setImagesCsv} />

      <Pressable style={styles.dropdownBtn} onPress={() => setCategoryOpen((o) => !o)}>
        <Text style={styles.dropdownText}>{selectedCategoryName}</Text>
      </Pressable>
      {categoryOpen && (
        <View style={styles.menu}>
          <Pressable style={styles.menuItem} onPress={() => { setCategoryId(null); setCategoryOpen(false); }}>
            <Text style={styles.menuItemText}>No category</Text>
          </Pressable>
          {categories.map((c) => (
            <Pressable key={c.id} style={styles.menuItem} onPress={() => { setCategoryId(c.id); setCategoryOpen(false); }}>
              <Text style={styles.menuItemText}>{c.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Active (visible in store)</Text>
        <Switch value={isActive} onValueChange={setIsActive} />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Featured on homepage</Text>
        <Switch value={isFeatured} onValueChange={setIsFeatured} />
      </View>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <View style={{ height: 16 }} />
      <Pressable style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} disabled={isSaving} onPress={save}>
        <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save product'}</Text>
      </Pressable>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function Field({
  label, value, onChange, multiline, keyboardType,
}: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View style={{ marginBottom: 8 }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={label}
        placeholderTextColor={theme.colors.onSurfaceMuted}
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        style={[styles.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', color: theme.colors.onSurface },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: theme.colors.surface, color: theme.colors.onSurface },
  dropdownBtn: { borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  dropdownText: { color: theme.colors.primary, fontWeight: '600' },
  menu: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, backgroundColor: theme.colors.surface, marginTop: 4 },
  menuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  menuItemText: { fontSize: 14, color: theme.colors.onSurface },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  switchLabel: { fontSize: 14, color: theme.colors.onSurface },
  error: { color: theme.colors.error, marginTop: 8 },
  saveBtn: { backgroundColor: theme.colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
