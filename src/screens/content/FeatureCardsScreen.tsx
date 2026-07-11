import React, { useCallback, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { ContentRepository } from '../../data/ContentRepository';
import { FeatureCard } from '../../types/models';
import { EmptyState, LoadingIndicator } from '../../components/CommonComponents';
import { FormInput } from '../categories/CategoriesScreen';
import { theme } from '../../theme/theme';

export default function FeatureCardsScreen() {
  const [cards, setCards] = useState<FeatureCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FeatureCard | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Sparkles');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try { setCards(await ContentRepository.getFeatureCards()); } finally { setIsLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const startCreate = () => {
    setEditing(null); setTitle(''); setDescription(''); setIcon('Sparkles'); setSortOrder('0'); setIsActive(true); setShowForm(true);
  };
  const startEdit = (c: FeatureCard) => {
    setEditing(c); setTitle(c.title); setDescription(c.description); setIcon(c.icon);
    setSortOrder(String(c.sort_order)); setIsActive(c.is_active); setShowForm(true);
  };
  const save = async () => {
    if (!title.trim()) return;
    const order = parseInt(sortOrder, 10) || 0;
    if (editing?.id == null) await ContentRepository.createFeatureCard(title, description, icon, null, order, isActive);
    else await ContentRepository.updateFeatureCard(editing.id, title, description, icon, null, order, isActive);
    setShowForm(false); refresh();
  };
  const remove = async (c: FeatureCard) => { if (c.id == null) return; await ContentRepository.deleteFeatureCard(c.id); refresh(); };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <LoadingIndicator />
      ) : cards.length === 0 ? (
        <EmptyState message="No feature cards yet. Tap + to add one." />
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(c, idx) => String(c.id ?? idx)}
          contentContainerStyle={{ padding: 16 }}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={10}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.sub}>{item.description}</Text>
              </View>
              <Pressable onPress={() => startEdit(item)} style={styles.iconBtn}><MaterialIcons name="edit" size={22} color={theme.colors.primary} /></Pressable>
              <Pressable onPress={() => remove(item)} style={styles.iconBtn}><MaterialIcons name="delete" size={22} color={theme.colors.error} /></Pressable>
            </View>
          )}
        />
      )}
      <Pressable style={styles.fab} onPress={startCreate}><MaterialIcons name="add" size={28} color="#fff" /></Pressable>

      <Modal visible={showForm} transparent animationType="fade" onRequestClose={() => setShowForm(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>{editing ? 'Edit feature card' : 'New feature card'}</Text>
            <FormInput label="Title" value={title} onChange={setTitle} />
            <FormInput label="Description" value={description} onChange={setDescription} />
            <FormInput label="Icon name (lucide-react)" value={icon} onChange={setIcon} />
            <FormInput label="Sort order" value={sortOrder} onChange={setSortOrder} keyboardType="numeric" />
            <View style={styles.switchRow}><Text style={styles.switchLabel}>Active</Text><Switch value={isActive} onValueChange={setIsActive} /></View>
            <View style={styles.actions}>
              <Pressable onPress={() => setShowForm(false)} style={styles.btn}><Text style={styles.btnGhost}>Cancel</Text></Pressable>
              <Pressable onPress={save} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Save</Text></Pressable>
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
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  switchLabel: { fontSize: 14, color: theme.colors.onSurface },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
  btn: { paddingHorizontal: 12, paddingVertical: 10 },
  btnGhost: { color: theme.colors.primary, fontWeight: '600' },
  btnPrimary: { backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
});
