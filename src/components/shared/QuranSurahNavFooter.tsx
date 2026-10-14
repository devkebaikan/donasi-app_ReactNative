import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {AltArrowLeft, AltArrowRight} from '@solar-icons/react-native/Linear';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface QuranSurahNavFooterProps {
  previousName: string | null;
  nextName: string | null;
  onPressPrevious: () => void;
  onPressNext: () => void;
}

export function QuranSurahNavFooter({
  previousName,
  nextName,
  onPressPrevious,
  onPressNext,
}: QuranSurahNavFooterProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {/* Tombol disembunyikan di ujung mushaf: tidak ada surah sebelum
          Al-Fatihah dan tidak ada sesudah An-Nas. */}
      {previousName ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onPressPrevious}
          accessibilityRole="button"
          accessibilityLabel={`Surah sebelumnya, ${previousName}`}>
          <Icon icon={AltArrowLeft} size={20} color={colors.primary[600]} />
          <Text style={styles.label} numberOfLines={1}>
            {previousName}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      {nextName ? (
        <TouchableOpacity
          style={[styles.button, styles.buttonRight]}
          onPress={onPressNext}
          accessibilityRole="button"
          accessibilityLabel={`Surah berikutnya, ${nextName}`}>
          <Text style={styles.label} numberOfLines={1}>
            {nextName}
          </Text>
          <Icon icon={AltArrowRight} size={20} color={colors.primary[600]} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
  },
  button: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[50],
  },
  buttonRight: {
    justifyContent: 'flex-end',
  },
  spacer: {
    flex: 1,
  },
  label: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[700],
  },
});
