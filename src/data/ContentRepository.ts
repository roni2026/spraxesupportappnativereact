import { supabase } from '../lib/supabase';
import { FeatureCard, FeaturedImage } from '../types/models';

/** Manages the storefront's hero banners (featured_images) and feature cards. */
export const ContentRepository = {
  async getFeaturedImages(): Promise<FeaturedImage[]> {
    const { data, error } = await supabase
      .from('featured_images')
      .select('id, title, description, image_url, sort_order, is_active')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data as FeaturedImage[]) ?? [];
  },

  async createFeaturedImage(
    title: string, description: string, imageUrl: string, sortOrder: number, isActive: boolean
  ): Promise<FeaturedImage> {
    const { data, error } = await supabase
      .from('featured_images')
      .insert({ title, description, image_url: imageUrl, sort_order: sortOrder, is_active: isActive })
      .select()
      .single();
    if (error) throw error;
    return data as FeaturedImage;
  },

  async updateFeaturedImage(
    id: number, title: string, description: string, imageUrl: string, sortOrder: number, isActive: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from('featured_images')
      .update({ title, description, image_url: imageUrl, sort_order: sortOrder, is_active: isActive })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteFeaturedImage(id: number): Promise<void> {
    const { error } = await supabase.from('featured_images').delete().eq('id', id);
    if (error) throw error;
  },

  async getFeatureCards(): Promise<FeatureCard[]> {
    const { data, error } = await supabase
      .from('feature_cards')
      .select('id, title, description, icon, image_url, sort_order, is_active')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data as FeatureCard[]) ?? [];
  },

  async createFeatureCard(
    title: string, description: string, icon: string, imageUrl: string | null, sortOrder: number, isActive: boolean
  ): Promise<FeatureCard> {
    const payload: Record<string, unknown> = {
      title, description, icon, sort_order: sortOrder, is_active: isActive,
    };
    if (imageUrl != null) payload.image_url = imageUrl;
    const { data, error } = await supabase.from('feature_cards').insert(payload).select().single();
    if (error) throw error;
    return data as FeatureCard;
  },

  async updateFeatureCard(
    id: number, title: string, description: string, icon: string, imageUrl: string | null, sortOrder: number, isActive: boolean
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      title, description, icon, sort_order: sortOrder, is_active: isActive,
    };
    if (imageUrl != null) payload.image_url = imageUrl;
    const { error } = await supabase.from('feature_cards').update(payload).eq('id', id);
    if (error) throw error;
  },

  async deleteFeatureCard(id: number): Promise<void> {
    const { error } = await supabase.from('feature_cards').delete().eq('id', id);
    if (error) throw error;
  },
};
