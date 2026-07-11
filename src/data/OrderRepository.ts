import { supabase } from '../lib/supabase';
import { OrderItemRow, OrderRow } from '../types/models';

/** Admin/moderator order management: browse, filter, and update status/payment. */
export const OrderRepository = {
  async getOrders(statusFilter?: string | null, query?: string | null): Promise<OrderRow[]> {
    let q = supabase.from('orders').select('id, order_number, user_id, total, status, payment_status, payment_method, created_at');
    if (statusFilter && statusFilter !== 'all') q = q.eq('status', statusFilter);
    if (query && query.trim().length > 0) q = q.ilike('order_number', `%${query}%`);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return (data as OrderRow[]) ?? [];
  },

  async getOrder(orderId: string): Promise<OrderRow | null> {
    const { data, error } = await supabase.from('orders').select('id, order_number, user_id, total, subtotal, status, payment_status, payment_method, payment_transaction_id, shipping_address, delivery_location, shipping_cost, contact_number, created_at').eq('id', orderId).maybeSingle();
    if (error) throw error;
    return (data as OrderRow) ?? null;
  },

  async getOrderItems(orderId: string): Promise<OrderItemRow[]> {
    const { data, error } = await supabase.from('order_items').select('id, order_id, product_id, product_name, product_sku, quantity, unit_price, total_price').eq('order_id', orderId);
    if (error) throw error;
    return (data as OrderItemRow[]) ?? [];
  },

  /** Order status changes here are what trigger customer push notifications. */
  async updateStatus(orderId: string, status: string): Promise<void> {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) throw error;
  },

  async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<void> {
    const { error } = await supabase.from('orders').update({ payment_status: paymentStatus }).eq('id', orderId);
    if (error) throw error;
  },
};
