import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {getTantanganCategoryIconBySlug} from '@/utils/tantanganIcons';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TantanganCategory} from '@/types/tantangan';

interface TantanganCategoryChipsProps {
  categories: TantanganCategory[];
  selectedSlug: string | null;
  isLoading: boolean;
  isError: boolean;
  onSelect: (slug: string) => void;
  onRetry: () => void;
}

// Pilihan kategori berbentuk pill horizontal. Bukan CategoryBottomSheet atau
// DonationCategoryGrid — keduanya untuk kategori PROGRAM DONASI, isinya beda
// dan tipenya terikat domain donasi.
export function TantanganCategoryChips({
  categories,
  selectedSlug,
  isLoading,
  isError,
  onSelect,
  onRetry,
}: TantanganCategoryChipsProps): React.JSX.Element {
  if (isLoading) {
    return (
      <View style={styles.stateRow}>
        <ActivityIndicator color={colors.primary[500]} />
      </View>
    );
  }

  // Gagal memuat tidak menonaktifkan tombol simpan — validasi kategori yang
  // akan menahan submit, dan pengguna tetap bisa mengisi field lain dulu.
  if (isError) {
    return (
      <View style={styles.stateRow}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Muat ulang daftar kategori">
          <Text style={styles.retryLabel}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled">
      {categories.map(category => {
        const isSelected = category.slug === selectedSlug;
        return (
          <TouchableOpacity
            key={category.slug}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(category.slug)}
            accessibilityRole="button"
            accessibilityState={{selected: isSelected}}
            accessibilityLabel={`Kategori ${category.label}`}>
            <Icon
              icon={getTantanganCategoryIconBySlug(category.iconSlug)}
              size={16}
              color={isSelected ? colors.neutral[0] : colors.neutral[600]}
            />
            <Text
              style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}
              numberOfLines={1}>
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
  },
  chipSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  chipLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  chipLabelSelected: {
    color: colors.neutral[0],
    fontWeight: fontWeight.semiBold,
  },
  stateRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
  retryButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary[600],
  },
  retryLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
