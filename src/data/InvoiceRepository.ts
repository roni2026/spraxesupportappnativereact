import { supabase } from '../lib/supabase';
import { Invoice } from '../types/models';

/** Read-only view of generated invoices for staff reference/lookup. */
export const InvoiceRepository = {
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, order_id, invoice_number, total, status, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Invoice[]) ?? [];
  },
};
