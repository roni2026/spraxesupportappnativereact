import { supabase } from '../lib/supabase';
import { OrderRow, Profile } from '../types/models';

/** Read-mostly view of customers for staff: search, view profile + order history. */
export const CustomerRepository = {
  async getCustomers(query?: string | null): Promise<Profile[]> {
    let q = supabase.from('profiles').select('*').eq('role', 'customer');
    if (query && query.trim().length > 0) {
      const like = `%${query}%`;
      q = q.or(`full_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`);
    }
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Profile[]) ?? [];
  },

  async getCustomer(id: string): Promise<Profile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return (data as Profile) ?? null;
  },

  async getCustomerOrders(userId: string): Promise<OrderRow[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as OrderRow[]) ?? [];
  },

  /** Admins + moderators (for a future "manage staff" screen). */
  async getStaff(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or('role.eq.admin,role.eq.moderator');
    if (error) throw error;
    return (data as Profile[]) ?? [];
  },
};
