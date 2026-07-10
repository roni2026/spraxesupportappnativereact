import { supabase } from '../lib/supabase';
import { SellerApplication } from '../types/models';

export const SellerApplicationRepository = {
  async getApplications(statusFilter?: string | null): Promise<SellerApplication[]> {
    let q = supabase.from('seller_applications').select('*');
    if (statusFilter && statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return (data as SellerApplication[]) ?? [];
  },

  async approve(id: string): Promise<void> {
    const { error } = await supabase
      .from('seller_applications')
      .update({ status: 'approved', rejection_reason: null })
      .eq('id', id);
    if (error) throw error;
  },

  async reject(id: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('seller_applications')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id);
    if (error) throw error;
  },
};
