import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupportRepository } from '../../data/SupportRepository';
import { SupportTicket, displayName } from '../../types/models';
import { EmptyState, LoadingIndicator, StatusBadge } from '../../components/CommonComponents';
import { theme, titleCase } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/types';

const ticketStatuses = ['all', 'open', 'in_progress', 'resolved', 'closed'];

export default function ChatListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const channelRef = useRef<RealtimeChannel | null>(null);

  const refresh = useCallback(async (status: string) => {
    setIsLoading(true);
    try {
      setTickets(await SupportRepository.getTickets(status));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(statusFilter); }, [statusFilter, refresh]);

  // Live-refresh the chat list as tickets are inserted/updated.
  useFocusEffect(
    useCallback(() => {
      const channel = SupportRepository.observeTicketChanges((updated) => {
        setTickets((prev) => {
          const idx = prev.findIndex((t) => t.id === updated.id);
          const next = idx >= 0 ? prev.map((t) => (t.id === updated.id ? updated : t)) : [updated, ...prev];
          return [...next].sort((a, b) =>
            (b.updated_at ?? b.created_at ?? '').localeCompare(a.updated_at ?? a.created_at ?? '')
          );
        });
      });
      channelRef.current = channel;
      return () => {
        if (channelRef.current) SupportRepository.removeChannel(channelRef.current);
        channelRef.current = null;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Live Chat & Support</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {ticketStatuses.map((s) => {
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
      ) : tickets.length === 0 ? (
        <EmptyState message="No conversations yet." />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ padding: 16 }}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={10}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => navigation.navigate('ChatThread', { ticketId: item.id })}>
              <View style={styles.rowBetween}>
                <Text style={styles.title} numberOfLines={1}>{item.subject}</Text>
                <StatusBadge status={item.status} />
              </View>
              <Text style={styles.who}>
                {displayName(item.profiles ?? null) || item.ticket_number || item.id.slice(0, 8)}
              </Text>
              <Text style={styles.preview} numberOfLines={2}>{item.message}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { fontSize: 20, fontWeight: '700', color: theme.colors.onSurface, padding: 16, paddingBottom: 8 },
  chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
  chipSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.onSurface },
  chipTextSelected: { color: '#fff' },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16, marginVertical: 4, borderWidth: 1, borderColor: theme.colors.border },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  who: { fontSize: 14, color: theme.colors.onSurface, marginTop: 2 },
  preview: { fontSize: 14, color: theme.colors.onSurfaceMuted, marginTop: 4 },
});
