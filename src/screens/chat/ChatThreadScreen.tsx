import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupportRepository } from '../../data/SupportRepository';
import { AuthRepository } from '../../data/AuthRepository';
import { SupportMessage, SupportTicket, displayName } from '../../types/models';
import { LoadingIndicator, StatusBadge } from '../../components/CommonComponents';
import { theme, titleCase } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/types';

const ticketStatuses = ['open', 'in_progress', 'resolved', 'closed'];
const priorities = ['low', 'medium', 'high'];

function isStaffMsg(role: string) {
  return role === 'staff' || role === 'admin' || role === 'moderator';
}

export default function ChatThreadScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ChatThread'>>();
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList<SupportMessage>>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const [t, msgs] = await Promise.all([
          SupportRepository.getTicket(ticketId),
          SupportRepository.getMessages(ticketId),
        ]);
        if (!active) return;
        setTicket(t);
        setMessages(msgs);
        await SupportRepository.markMessagesRead(ticketId);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    // Realtime: new customer messages appear instantly.
    const channel = SupportRepository.observeNewMessages(ticketId, (incoming) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) return prev;
        if (incoming.sender_role === 'customer') SupportRepository.markMessagesRead(ticketId);
        return [...prev, incoming];
      });
    });
    channelRef.current = channel;

    return () => {
      active = false;
      if (channelRef.current) SupportRepository.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [ticketId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setIsSending(true);
    try {
      const staffId = await AuthRepository.getCurrentUserId();
      const sent = await SupportRepository.sendMessage(ticketId, staffId, text);
      setMessages((prev) => (prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]));
      setDraft('');
      setTicket((prev) => (prev ? { ...prev, status: 'in_progress' } : prev));
    } finally {
      setIsSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    await SupportRepository.updateTicketStatus(ticketId, status);
    setTicket((prev) => (prev ? { ...prev, status } : prev));
  };
  const updatePriority = async (priority: string) => {
    await SupportRepository.updateTicketPriority(ticketId, priority);
    setTicket((prev) => (prev ? { ...prev, priority } : prev));
  };

  if (isLoading && !ticket) return <LoadingIndicator />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {ticket && <TicketHeader ticket={ticket} onStatus={updateStatus} onPriority={updatePriority} />}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m, idx) => m.id ?? String(idx)}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => {
          const fromStaff = isStaffMsg(item.sender_role);
          return (
            <View style={{ flexDirection: 'row', justifyContent: fromStaff ? 'flex-end' : 'flex-start' }}>
              <View style={[styles.bubble, fromStaff ? styles.bubbleStaff : styles.bubbleCustomer]}>
                <Text style={fromStaff ? styles.bubbleTextStaff : styles.bubbleTextCustomer}>{item.message}</Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a reply..."
          placeholderTextColor={theme.colors.onSurfaceMuted}
          style={styles.input}
          multiline
        />
        <Pressable
          style={[styles.sendBtn, (isSending || !draft.trim()) && { opacity: 0.4 }]}
          disabled={isSending || !draft.trim()}
          onPress={send}
        >
          <MaterialIcons name="send" size={22} color={theme.colors.primary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Selector({
  labelPrefix, current, options, onSelect, renderBadge,
}: {
  labelPrefix?: string;
  current: string;
  options: string[];
  onSelect: (v: string) => void;
  renderBadge?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable style={styles.outlinedBtn} onPress={() => setOpen((o) => !o)}>
        {renderBadge ? <StatusBadge status={current} /> : <Text style={styles.outlinedBtnText}>{labelPrefix}{titleCase(current)}</Text>}
      </Pressable>
      {open && (
        <View style={styles.menu}>
          {options.map((o) => (
            <Pressable key={o} style={styles.menuItem} onPress={() => { setOpen(false); onSelect(o); }}>
              <Text style={styles.menuItemText}>{titleCase(o)}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function TicketHeader({
  ticket, onStatus, onPriority,
}: { ticket: SupportTicket; onStatus: (s: string) => void; onPriority: (p: string) => void }) {
  return (
    <View style={styles.headerCard}>
      <Text style={styles.headerSubject}>{ticket.subject}</Text>
      <Text style={styles.headerWho}>{displayName(ticket.profiles ?? null) || ticket.ticket_number || ''}</Text>
      <View style={styles.headerActions}>
        <Selector current={ticket.status} options={ticketStatuses} onSelect={onStatus} renderBadge />
        <Selector labelPrefix="Priority: " current={ticket.priority} options={priorities} onSelect={onPriority} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerCard: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 12, margin: 12, borderWidth: 1, borderColor: theme.colors.border },
  headerSubject: { fontSize: 16, fontWeight: '600', color: theme.colors.onSurface },
  headerWho: { fontSize: 14, color: theme.colors.onSurfaceMuted, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  bubble: { maxWidth: '80%', borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleStaff: { backgroundColor: theme.colors.primary },
  bubbleCustomer: { backgroundColor: theme.colors.surfaceVariant },
  bubbleTextStaff: { color: '#fff', fontSize: 14 },
  bubbleTextCustomer: { color: theme.colors.onSurface, fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface },
  input: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 120, color: theme.colors.onSurface },
  sendBtn: { padding: 8 },
  outlinedBtn: { borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  outlinedBtnText: { color: theme.colors.primary, fontWeight: '600' },
  menu: { marginTop: 4, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, backgroundColor: theme.colors.surface, minWidth: 150, position: 'absolute', top: 40, zIndex: 10 },
  menuItem: { paddingHorizontal: 16, paddingVertical: 10 },
  menuItemText: { fontSize: 14, color: theme.colors.onSurface },
});
