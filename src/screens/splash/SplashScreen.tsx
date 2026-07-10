import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/theme';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spraxe Support</Text>
      <ActivityIndicator style={{ marginTop: 16 }} color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  title: { fontSize: 22, fontWeight: '700', color: theme.colors.primary },
});
