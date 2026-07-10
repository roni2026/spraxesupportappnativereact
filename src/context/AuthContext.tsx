import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthRepository, StaffAccessDeniedError } from '../data/AuthRepository';
import { Profile } from '../types/models';
import { syncPushToken } from '../lib/push';

type AuthStatus = 'checking' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  status: AuthStatus;
  profile: Profile | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const restoreSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setStatus('signedOut');
        return;
      }
      const staff = await AuthRepository.requireStaffProfile();
      setProfile(staff);
      setStatus('signedIn');
      void syncPushToken();
    } catch {
      setStatus('signedOut');
    }
  };

  useEffect(() => {
    restoreSession();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setStatus('signedOut');
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Enter your email and password.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const staff = await AuthRepository.signInWithEmail(email.trim(), password);
      setProfile(staff);
      setStatus('signedIn');
      void syncPushToken();
    } catch (e: any) {
      if (e instanceof StaffAccessDeniedError) setErrorMessage(e.message);
      else setErrorMessage(e?.message ?? 'Sign in failed. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const signOut = async () => {
    await AuthRepository.signOut();
    setProfile(null);
    setStatus('signedOut');
  };

  const value = useMemo(
    () => ({ status, profile, isSubmitting, errorMessage, signIn, signOut }),
    [status, profile, isSubmitting, errorMessage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
