import React from 'react';
import {
  ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View, ViewStyle,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { colors, statusColors } from '../theme/colors';
import { theme, titleCase } from '../theme/theme';
import { optimizeImageUrl } from '../lib/cloudinary';

export function LoadingIndicator({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.center, style]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={[styles.center, { padding: 32 }]}>
      <Text style={{ color: theme.colors.onSurfaceMuted, textAlign: 'center' }}>{message}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const { bg, fg } = statusColors(status);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{titleCase(status)}</Text>
    </View>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/** expo-image with a neutral placeholder box when the url is missing (FallbackImage). */
export function FallbackImage({
  url,
  style,
  widthHint = 400,
}: {
  url?: string | null;
  style?: ViewStyle;
  widthHint?: number;
}) {
  const optimized = optimizeImageUrl(url, widthHint);
  if (!optimized || optimized.trim().length === 0) {
    return <View style={[{ backgroundColor: theme.colors.surfaceVariant }, style]} />;
  }
  return (
    <ExpoImage
      source={{ uri: optimized }}
      style={style as any}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={120}
    />
  );
}

export function ConfirmDialog({
  visible, title, message, confirmLabel = 'Confirm', onConfirm, onDismiss,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogMessage}>{message}</Text>
          <View style={styles.dialogActions}>
            <Pressable onPress={onDismiss} style={styles.dialogBtn}>
              <Text style={styles.dialogBtnText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={styles.dialogBtn}>
              <Text style={[styles.dialogBtnText, { color: theme.colors.error }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Fallback for legacy react-native Image imports (kept to avoid unused warning suppression)
export const _RNImage = Image;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { borderRadius: theme.radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '500' },
  statCard: {
    flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 16,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: theme.colors.primary },
  statLabel: { fontSize: 13, color: theme.colors.onSurfaceMuted, marginTop: 4 },
  dialogOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialogCard: { width: '100%', backgroundColor: colors.white, borderRadius: theme.radius.lg, padding: 20 },
  dialogTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.onSurface },
  dialogMessage: { fontSize: 14, color: theme.colors.onSurface, marginTop: 8 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 8 },
  dialogBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  dialogBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary },
});
