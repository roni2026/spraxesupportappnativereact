import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/CommonComponents';
import { displayName } from '../../types/models';
import { theme } from '../../theme/theme';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  if (!profile) return null;

  return (
    <View style={styles.container}>
      <View style={{ height: 24 }} />
      <Text style={styles.name}>{displayName(profile)}</Text>
      <View style={{ height: 8 }} />
      <StatusBadge status={profile.role ?? 'staff'} />
      <View style={{ height: 24 }} />

      <View style={styles.card}>
        {profile.email ? <Text style={styles.row}>Email: {profile.email}</Text> : null}
        {profile.phone ? <Text style={styles.row}>Phone: {profile.phone}</Text> : null}
      </View>

      <View style={{ height: 32 }} />
      <Pressable style={styles.signOut} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', backgroundColor: theme.colors.background },
  name: { fontSize: 22, fontWeight: '700', color: theme.colors.onSurface },
  card: {
    width: '100%', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  row: { fontSize: 14, color: theme.colors.onSurface, paddingVertical: 4 },
  signOut: {
    width: '100%', borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
  },
  signOutText: { color: theme.colors.primary, fontSize: 16, fontWeight: '600' },
});
