import { supabase } from '../lib/supabase';
import { Product } from '../types/models';

/** Full product catalog management: create, edit, delete, toggle active/featured. */
export const ProductRepository = {
  async getProducts(query?: string | null, categoryId?: string | null): Promise<Product[]> {
    let q = supabase.from('products').select('*');
    if (query && query.trim().length > 0) q = q.ilike('name', `%${query}%`);
    if (categoryId && categoryId.trim().length > 0) q = q.eq('category_id', categoryId);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Product[]) ?? [];
  },

  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return (data as Product) ?? null;
  },

  async createProduct(params: {
    name: string; slug: string; description: string; price: number;
    categoryId: string | null; stockQuantity: number; images: string[];
    isActive: boolean; isFeatured: boolean;
  }): Promise<Product> {
    const payload: Record<string, unknown> = {
      name: params.name,
      slug: params.slug,
      description: params.description,
      price: params.price,
      base_price: params.price,
      stock_quantity: params.stockQuantity,
      images: params.images,
      is_active: params.isActive,
      is_featured: params.isFeatured,
    };
    if (params.categoryId != null) payload.category_id = params.categoryId;
    const { data, error } = await supabase.from('products').insert(payload).select().single();
    if (error) throw error;
    return data as Product;
  },

  async updateProduct(id: string, params: {
    name: string; slug: string; description: string; price: number;
    categoryId: string | null; stockQuantity: number; images: string[];
    isActive: boolean; isFeatured: boolean;
  }): Promise<void> {
    const payload: Record<string, unknown> = {
      name: params.name,
      slug: params.slug,
      description: params.description,
      price: params.price,
      base_price: params.price,
      stock_quantity: params.stockQuantity,
      images: params.images,
      is_active: params.isActive,
      is_featured: params.isFeatured,
    };
    if (params.categoryId != null) payload.category_id = params.categoryId;
    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) throw error;
  },

  async setActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id);
    if (error) throw error;
  },

  async setFeatured(id: string, isFeatured: boolean): Promise<void> {
    const { error } = await supabase.from('products').update({ is_featured: isFeatured }).eq('id', id);
    if (error) throw error;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },
};
