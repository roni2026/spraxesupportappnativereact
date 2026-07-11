import { supabase } from '../lib/supabase';
import { Category } from '../types/models';

export const CategoryRepository = {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, image_url, sort_order, is_active')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data as Category[]) ?? [];
  },

  async createCategory(
    name: string, description: string, imageUrl: string, sortOrder: number, isActive: boolean
  ): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, description, image_url: imageUrl, sort_order: sortOrder, is_active: isActive })
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },

  async updateCategory(
    id: string, name: string, description: string, imageUrl: string, sortOrder: number, isActive: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update({ name, description, image_url: imageUrl, sort_order: sortOrder, is_active: isActive })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
};
