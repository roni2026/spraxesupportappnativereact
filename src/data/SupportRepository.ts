import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { SupportMessage, SupportTicket } from '../types/models';

/**
 * Support tickets + the live chat thread hanging off each one.
 *
 * `support_messages` is a companion table to `support_tickets`. Realtime is used so staff see new
 * customer messages the instant they arrive, without polling: we subscribe to postgres_changes
 * (INSERT) on `support_messages`, filtered by ticket_id.
 */
export const SupportRepository = {
  async getTickets(statusFilter?: string | null): Promise<SupportTicket[]> {
    let q = supabase.from('support_tickets').select('*');
    if (statusFilter && statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data, error } = await q.order('updated_at', { ascending: false });
    if (error) throw error;
    return (data as SupportTicket[]) ?? [];
  },

  async getTicket(id: string): Promise<SupportTicket | null> {
    const { data, error } = await supabase.from('support_tickets').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return (data as SupportTicket) ?? null;
  },

  async updateTicketStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id);
    if (error) throw error;
  },

  async updateTicketPriority(id: string, priority: string): Promise<void> {
    const { error } = await supabase.from('support_tickets').update({ priority }).eq('id', id);
    if (error) throw error;
  },

  async assignTicket(id: string, staffId: string): Promise<void> {
    const { error } = await supabase.from('support_tickets').update({ assigned_to: staffId }).eq('id', id);
    if (error) throw error;
  },

  // ---- Live chat messages ----

  async getMessages(ticketId: string): Promise<SupportMessage[]> {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as SupportMessage[]) ?? [];
  },

  async sendMessage(ticketId: string, senderId: string | null, message: string): Promise<SupportMessage> {
    const payload: Record<string, unknown> = {
      ticket_id: ticketId,
      sender_role: 'staff',
      message,
      is_read: true,
    };
    if (senderId != null) payload.sender_id = senderId;
    const { data, error } = await supabase.from('support_messages').insert(payload).select().single();
    if (error) throw error;

    // Replying moves a ticket out of "open" into "in_progress" automatically,
    // mirroring how a human moderator would triage it.
    await supabase
      .from('support_tickets')
      .update({ status: 'in_progress' })
      .eq('id', ticketId)
      .neq('status', 'resolved')
      .neq('status', 'closed');

    return data as SupportMessage;
  },

  async markMessagesRead(ticketId: string): Promise<void> {
    await supabase
      .from('support_messages')
      .update({ is_read: true })
      .eq('ticket_id', ticketId)
      .eq('sender_role', 'customer');
  },

  /** Realtime channel of newly-inserted messages for a single ticket's conversation. */
  observeNewMessages(ticketId: string, onInsert: (m: SupportMessage) => void): RealtimeChannel {
    const channel = supabase.channel(`support-messages-${ticketId}`);
    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${ticketId}` },
        (payload) => onInsert(payload.new as SupportMessage)
      )
      .subscribe();
    return channel;
  },

  /** Realtime channel of inserted/updated tickets, used to live-refresh the chat list. */
  observeTicketChanges(onChange: (t: SupportTicket) => void): RealtimeChannel {
    const channel = supabase.channel('support-tickets-all');
    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            onChange(payload.new as SupportTicket);
          }
        }
      )
      .subscribe();
    return channel;
  },

  removeChannel(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
  },
};
