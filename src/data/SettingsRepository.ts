import { supabase } from '../lib/supabase';
import { SiteSetting } from '../types/models';

export const SettingsRepository = {
  async getSettings(): Promise<SiteSetting[]> {
    const { data, error } = await supabase.from('site_settings').select('id, key, value, updated_at');
    if (error) throw error;
    return (data as SiteSetting[]) ?? [];
  },

  /** Value is stored as JSON (e.g. `60`, `true`, `{"a":1}`) and parsed here. */
  async updateSetting(key: string, rawJsonValue: string): Promise<void> {
    const parsed = JSON.parse(rawJsonValue);
    const { error } = await supabase.from('site_settings').update({ value: parsed }).eq('key', key);
    if (error) throw error;
  },

  async createSetting(key: string, rawJsonValue: string): Promise<void> {
    const parsed = JSON.parse(rawJsonValue);
    const { error } = await supabase.from('site_settings').insert({ key, value: parsed });
    if (error) throw error;
  },
};
