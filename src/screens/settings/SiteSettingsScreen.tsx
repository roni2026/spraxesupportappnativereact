import React, { useCallback, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SettingsRepository } from '../../data/SettingsRepository';
import { SiteSetting } from '../../types/models';
import { EmptyState, LoadingIndicator } from '../../components/CommonComponents';
import { theme } from '../../theme/theme';

function stringify(value: any): string {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

export default function SiteSettingsScreen() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<SiteSetting | null>(null);
  const [editValue, setEditValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try { setSettings(await SettingsRepository.getSettings()); } finally { setIsLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const startEdit = (s: SiteSetting) => { setEditing(s); setEditValue(stringify(s.value)); setErrorMessage(null); };
  const save = async () => {
    if (!editing) return;
    try {
      await SettingsRepository.updateSetting(editing.key, editValue);
      setEditing(null); refresh();
    } catch (e: any) {
      setErrorMessage(`Invalid JSON value: ${e?.message ?? ''}`);
    }
  };

  if (isLoading) return <LoadingIndicator />;
  if (settings.length === 0) return <EmptyState message="No site settings configured yet." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={settings}
        keyExtractor={(s, idx) => String(s.id ?? s.key ?? idx)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => startEdit(item)}>
            <Text style={styles.key}>{item.key}</Text>
            <Text style={styles.value}>{stringify(item.value)}</Text>
          </Pressable>
        )}
      />

      <Modal visible={editing !== null} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Edit {editing?.key}</Text>
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              placeholder="Value (raw JSON)"
              placeholderTextColor={theme.colors.onSurfaceMuted}
              style={styles.input}
              multiline
            />
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            <View style={styles.actions}>
              <Pressable onPress={() => setEditing(null)} style={styles.btn}><Text style={styles.btnGhost}>Cancel</Text></Pressable>
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
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, marginVertical: 4, borderWidth: 1, borderColor: theme.colors.border },
  key: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  value: { fontSize: 14, color: theme.colors.onSurfaceMuted, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 20 },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.onSurface },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginTop: 12, minHeight: 60, textAlignVertical: 'top', color: theme.colors.onSurface },
  error: { color: theme.colors.error, marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
  btn: { paddingHorizontal: 12, paddingVertical: 10 },
  btnGhost: { color: theme.colors.primary, fontWeight: '600' },
  btnPrimary: { backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
});
