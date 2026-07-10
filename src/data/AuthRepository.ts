import { supabase } from '../lib/supabase';
import { Profile, isStaff } from '../types/models';

/** Thrown when a signed-in account is not an admin/moderator. */
export class StaffAccessDeniedError extends Error {}

export const AuthRepository = {
  async getCurrentUserId(): Promise<string | null> {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  },

  async signInWithEmail(email: string, password: string): Promise<Profile> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return this.requireStaffProfile();
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  /** Fetch current profile and verify it is staff, signing out otherwise. */
  async requireStaffProfile(): Promise<Profile> {
    const userId = await this.getCurrentUserId();
    if (!userId) throw new StaffAccessDeniedError('Not signed in.');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new StaffAccessDeniedError('No profile found for this account.');

    if (!isStaff(data as Profile)) {
      await supabase.auth.signOut();
      throw new StaffAccessDeniedError(
        'This account is a customer account. Spraxe Support is for admins and moderators only.'
      );
    }
    return data as Profile;
  },

  async getCurrentProfile(): Promise<Profile | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    return (data as Profile) ?? null;
  },

  async updateProfile(profile: Profile): Promise<void> {
    await supabase.from('profiles').update(profile).eq('id', profile.id);
  },
};
