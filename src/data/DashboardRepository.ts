import { supabase } from '../lib/supabase';
import { DashboardStats, OrderRow } from '../types/models';

/** Aggregate counts + recent activity for the Dashboard home screen. */
async function countRows(
  table: string,
  filter?: { column: string; value: string }
): Promise<number> {
  let q = supabase.from(table).select('id', { count: 'exact', head: true });
  if (filter) q = q.eq(filter.column, filter.value);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

export const DashboardRepository = {
  async getStats(): Promise<DashboardStats> {
    const [
      products, orders, customers, pendingOrders, openTickets, inProgressTickets, pendingSellerApps,
    ] = await Promise.all([
      countRows('products'),
      countRows('orders'),
      countRows('profiles', { column: 'role', value: 'customer' }),
      countRows('orders', { column: 'status', value: 'pending' }),
      countRows('support_tickets', { column: 'status', value: 'open' }),
      countRows('support_tickets', { column: 'status', value: 'in_progress' }),
      countRows('seller_applications', { column: 'status', value: 'pending' }),
    ]);
    return { products, orders, customers, pendingOrders, openTickets, inProgressTickets, pendingSellerApps };
  },

  async getRecentOrders(limitCount = 10): Promise<OrderRow[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, user_id, total, status, payment_status, payment_method, created_at')
      .order('created_at', { ascending: false })
      .limit(limitCount);
    if (error) throw error;
    return (data as OrderRow[]) ?? [];
  },
};
