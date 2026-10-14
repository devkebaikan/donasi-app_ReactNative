import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useToastStore} from '@/stores/toastStore';
import {colors, spacing, radius, fontSize} from '@/theme';

export function ToastContainer(): React.JSX.Element | null {
  const message = useToastStore(s => s.message);
  const hide = useToastStore(s => s.hide);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(hide, 3000);
    return () => clearTimeout(timer);
  }, [message, hide]);

  if (!message) {
    return null;
  }

  return (
    <View
      style={[styles.toast, {bottom: insets.bottom + spacing['2xl']}]}
      accessibilityLiveRegion="polite"
      pointerEvents="none">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.neutral[800],
    borderRadius: radius.md,
    padding: spacing.md,
    zIndex: 999,
  },
  text: {
    color: colors.neutral[0],
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
