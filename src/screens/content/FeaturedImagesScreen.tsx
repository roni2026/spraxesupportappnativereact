import React, { useCallback, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { ContentRepository } from '../../data/ContentRepository';
import { FeaturedImage } from '../../types/models';
import { EmptyState, LoadingIndicator } from '../../components/CommonComponents';
import { FormInput } from '../categories/CategoriesScreen';
import { theme } from '../../theme/theme';

export default function FeaturedImagesScreen() {
  const [images, setImages] = useState<FeaturedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FeaturedImage | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try { setImages(await ContentRepository.getFeaturedImages()); } finally { setIsLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const startCreate = () => {
    setEditing(null); setTitle(''); setDescription(''); setImageUrl(''); setSortOrder('0'); setIsActive(true); setShowForm(true);
  };
  const startEdit = (i: FeaturedImage) => {
    setEditing(i); setTitle(i.title ?? ''); setDescription(i.description ?? ''); setImageUrl(i.image_url);
    setSortOrder(String(i.sort_order)); setIsActive(i.is_active); setShowForm(true);
  };
  const save = async () => {
    if (!imageUrl.trim()) return;
    const order = parseInt(sortOrder, 10) || 0;
    if (editing?.id == null) await ContentRepository.createFeaturedImage(title, description, imageUrl, order, isActive);
    else await ContentRepository.updateFeaturedImage(editing.id, title, description, imageUrl, order, isActive);
    setShowForm(false); refresh();
  };
  const remove = async (i: FeaturedImage) => { if (i.id == null) return; await ContentRepository.deleteFeaturedImage(i.id); refresh(); };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <LoadingIndicator />
      ) : images.length === 0 ? (
        <EmptyState message="No hero banners yet. Tap + to add one." />
      ) : (
        <FlatList
          data={images}
          keyExtractor={(i, idx) => String(i.id ?? idx)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.title || 'Untitled banner'}</Text>
                <Text style={styles.sub}>{item.description ?? ''}</Text>
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
            <Text style={styles.dialogTitle}>{editing ? 'Edit hero banner' : 'New hero banner'}</Text>
            <FormInput label="Title" value={title} onChange={setTitle} />
            <FormInput label="Description" value={description} onChange={setDescription} />
            <FormInput label="Image URL" value={imageUrl} onChange={setImageUrl} />
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
