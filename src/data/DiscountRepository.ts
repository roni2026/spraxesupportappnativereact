import { supabase } from '../lib/supabase';
import { DiscountCode } from '../types/models';

export const DiscountRepository = {
  async getCodes(): Promise<DiscountCode[]> {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('id, code, discount_type, discount_value, min_purchase, max_uses, current_uses, valid_until, is_active')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as DiscountCode[]) ?? [];
  },

  async createCode(params: {
    code: string;
    discountType: string;
    discountValue: number;
    minPurchase: number;
    maxUses: number | null;
    validUntil: string | null;
    isActive: boolean;
  }): Promise<DiscountCode> {
    const payload: Record<string, unknown> = {
      code: params.code.toUpperCase(),
      discount_type: params.discountType,
      discount_value: params.discountValue,
      min_purchase: params.minPurchase,
      is_active: params.isActive,
    };
    if (params.maxUses != null) payload.max_uses = params.maxUses;
    if (params.validUntil != null) payload.valid_until = params.validUntil;
    const { data, error } = await supabase.from('discount_codes').insert(payload).select().single();
    if (error) throw error;
    return data as DiscountCode;
  },

  async setActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase.from('discount_codes').update({ is_active: isActive }).eq('id', id);
    if (error) throw error;
  },

  async deleteCode(id: string): Promise<void> {
    const { error } = await supabase.from('discount_codes').delete().eq('id', id);
    if (error) throw error;
  },
};
