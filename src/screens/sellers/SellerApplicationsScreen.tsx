import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SellerApplicationRepository } from '../../data/SellerApplicationRepository';
import { SellerApplication } from '../../types/models';
import { EmptyState, LoadingIndicator, StatusBadge } from '../../components/CommonComponents';
import { theme, titleCase } from '../../theme/theme';

const statuses = ['pending', 'approved', 'rejected', 'all'];

export default function SellerApplicationsScreen() {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [rejecting, setRejecting] = useState<SellerApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const refresh = useCallback(async (status: string) => {
    setIsLoading(true);
    try { setApplications(await SellerApplicationRepository.getApplications(status)); } finally { setIsLoading(false); }
  }, []);
  useEffect(() => { refresh(statusFilter); }, [statusFilter, refresh]);

  const approve = async (a: SellerApplication) => { await SellerApplicationRepository.approve(a.id); refresh(statusFilter); };
  const reject = async () => {
    if (!rejecting) return;
    await SellerApplicationRepository.reject(rejecting.id, rejectionReason);
    setRejecting(null); refresh(statusFilter);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {statuses.map((s) => {
          const selected = statusFilter === s;
          return (
            <Pressable key={s} onPress={() => setStatusFilter(s)} style={[styles.chip, selected && styles.chipSelected]}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{titleCase(s)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <LoadingIndicator />
      ) : applications.length === 0 ? (
        <EmptyState message="No seller applications here." />
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={10}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.name}>{item.shop_name}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.sub}>{item.business_address}</Text>
              <Text style={styles.sub}>{`${item.phone} \u2022 ${item.email}`}</Text>
              {item.status === 'pending' ? (
                <View style={styles.btnRow}>
                  <Pressable style={styles.approveBtn} onPress={() => approve(item)}><Text style={styles.approveText}>Approve</Text></Pressable>
                  <Pressable style={styles.rejectBtn} onPress={() => { setRejecting(item); setRejectionReason(''); }}><Text style={styles.rejectText}>Reject</Text></Pressable>
                </View>
              ) : null}
            </View>
          )}
        />
      )}

      <Modal visible={rejecting !== null} transparent animationType="fade" onRequestClose={() => setRejecting(null)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Reject application</Text>
            <TextInput
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Reason"
              placeholderTextColor={theme.colors.onSurfaceMuted}
              style={styles.input}
              multiline
            />
            <View style={styles.actions}>
              <Pressable onPress={() => setRejecting(null)} style={styles.btn}><Text style={styles.btnGhost}>Cancel</Text></Pressable>
              <Pressable onPress={reject} style={styles.btnPrimary}><Text style={styles.btnPrimaryText}>Reject</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  chips: { padding: 16, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  chipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.onSurface },
  chipTextSelected: { color: '#fff' },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, marginVertical: 4, borderWidth: 1, borderColor: theme.colors.border },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  sub: { fontSize: 14, color: theme.colors.onSurface, marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  approveBtn: { backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  approveText: { color: '#fff', fontWeight: '600' },
  rejectBtn: { borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  rejectText: { color: theme.colors.primary, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 20 },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.onSurface },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginTop: 12, minHeight: 60, textAlignVertical: 'top', color: theme.colors.onSurface },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 16 },
  btn: { paddingHorizontal: 12, paddingVertical: 10 },
  btnGhost: { color: theme.colors.primary, fontWeight: '600' },
  btnPrimary: { backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
});
