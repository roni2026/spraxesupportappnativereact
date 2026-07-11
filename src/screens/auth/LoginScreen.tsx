import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme/theme';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn, isSubmitting, errorMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={{ height: 64 }} />
      <Text style={styles.title}>{t('auth.spraxeSupport')}</Text>
      <Text style={styles.subtitle}>{t('auth.adminSignIn')}</Text>
      <View style={{ height: 40 }} />

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.workEmail')}
        placeholderTextColor={theme.colors.onSurfaceMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <View style={{ height: 12 }} />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.password')}
        placeholderTextColor={theme.colors.onSurfaceMuted}
        secureTextEntry
        style={styles.input}
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <View style={{ height: 20 }} />
      <Pressable
        style={[styles.button, isSubmitting && { opacity: 0.7 }]}
        disabled={isSubmitting}
        onPress={() => signIn(email, password)}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('auth.signIn')}</Text>
        )}
      </Pressable>

      <View style={{ height: 24 }} />
      <Text style={styles.note}>
        {t('auth.adminModeratorNote')}
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: theme.colors.background, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: theme.colors.primary },
  subtitle: { fontSize: 14, color: theme.colors.onSurfaceMuted, marginTop: 4 },
  input: {
    width: '100%', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: theme.colors.surface,
    color: theme.colors.onSurface,
  },
  error: { color: theme.colors.error, marginTop: 12, fontSize: 14, alignSelf: 'flex-start' },
  button: {
    width: '100%', backgroundColor: theme.colors.primary, borderRadius: 10, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center', minHeight: 48,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  note: { fontSize: 12, color: theme.colors.onSurfaceMuted, textAlign: 'center' },
});
