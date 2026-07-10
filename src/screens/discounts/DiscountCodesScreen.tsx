import React, { useCallback, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { DiscountRepository } from '../../data/DiscountRepository';
import { DiscountCode } from '../../types/models';
import { EmptyState, LoadingIndicator } from '../../components/CommonComponents';
import { FormInput } from '../categories/CategoriesScreen';
import { CURRENCY, theme, titleCase } from '../../theme/theme';

export default function DiscountCodesScreen() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('0');
  const [maxUses, setMaxUses] = useState('');

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try { setCodes(await DiscountRepository.getCodes()); } finally { setIsLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const startCreate = () => {
    setCode(''); setDiscountType('percentage'); setDiscountValue(''); setMinPurchase('0'); setMaxUses(''); setShowForm(true);
  };
  const save = async () => {
    const value = Number(discountValue);
    if (Number.isNaN(value) || !code.trim()) return;
    await DiscountRepository.createCode({
      code, discountType, discountValue: value,
      minPurchase: Number(minPurchase) || 0,
      maxUses: maxUses.trim() ? parseInt(maxUses, 10) : null,
      validUntil: null, isActive: true,
    });
    setShowForm(false); refresh();
  };
  const toggle = async (c: DiscountCode) => { if (c.id == null) return; await DiscountRepository.setActive(c.id, !c.is_active); refresh(); };
  const remove = async (c: DiscountCode) => { if (c.id == null) return; await DiscountRepository.deleteCode(c.id); refresh(); };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <LoadingIndicator />
      ) : codes.length === 0 ? (
        <EmptyState message="No discount codes yet. Tap + to add one." />
      ) : (
        <FlatList
          data={codes}
          keyExtractor={(c, idx) => String(c.id ?? idx)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const suffix = item.discount_type === 'percentage' ? '%' : CURRENCY;
            const usesMax = item.max_uses != null ? `/${item.max_uses}` : '';
            return (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.code}</Text>
                  <Text style={styles.sub}>{`${item.discount_value}${suffix} off \u2022 used ${item.current_uses ?? 0}${usesMax}`}</Text>
                </View>
                <Switch value={item.is_active} onValueChange={() => toggle(item)} />
                <Pressable onPress={() => remove(item)} style={styles.iconBtn}><MaterialIcons name="delete" size={22} color={theme.colors.error} /></Pressable>
              </View>
            );
          }}
        />
      )}
      <Pressable style={styles.fab} onPress={startCreate}><MaterialIcons name="add" size={28} color="#fff" /></Pressable>

      <Modal visible={showForm} transparent animationType="fade" onRequestClose={() => setShowForm(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>New discount code</Text>
            <FormInput label="Code" value={code} onChange={setCode} />
            <View style={styles.typeRow}>
              {['percentage', 'fixed'].map((t) => (
                <Pressable
                  key={t}
                  disabled={discountType === t}
                  onPress={() => setDiscountType(t)}
                  style={[styles.typeBtn, discountType === t ? styles.typeBtnActive : null]}
                >
                  <Text style={discountType === t ? styles.typeBtnActiveText : styles.typeBtnText}>{titleCase(t)}</Text>
                </Pressable>
              ))}
            </View>
            <FormInput label="Discount value" value={discountValue} onChange={setDiscountValue} keyboardType="numeric" />
            <FormInput label="Minimum purchase" value={minPurchase} onChange={setMinPurchase} keyboardType="numeric" />
            <FormInput label="Max uses (optional)" value={maxUses} onChange={setMaxUses} keyboardType="numeric" />
            <View style={styles.actions}>
              <Pressable onPress={() => setShowForm(false)} style={styles.btn}><Text style={styles.btnGhost}>Cancel</Text></Pressable>
              <Pressable onPress={save} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Create</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, marginVertical: 4, borderWidth: 1, borderColor: theme.colors.border },
  name: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  sub: { fontSize: 14, color: theme.colors.onSurfaceMuted, marginTop: 2 },
  iconBtn: { padding: 6 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 20 },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.onSurface },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  typeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.colors.surfaceVariant },
  typeBtnActive: { backgroundColor: theme.colors.primary },
  typeBtnText: { color: theme.colors.onSurface },
  typeBtnActiveText: { color: '#fff', fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
  btn: { paddingHorizontal: 12, paddingVertical: 10 },
  btnGhost: { color: theme.colors.primary, fontWeight: '600' },
  btnPrimary: { backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
});
