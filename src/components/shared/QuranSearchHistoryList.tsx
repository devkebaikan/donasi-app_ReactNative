import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {ClockCircle, CloseCircle} from '@solar-icons/react-native/Linear';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

interface QuranSearchHistoryListProps {
  recentSearches: string[];
  onPressItem: (query: string) => void;
  onRemoveItem: (query: string) => void;
  onClearAll: () => void;
}

export function QuranSearchHistoryList({
  recentSearches,
  onPressItem,
  onRemoveItem,
  onClearAll,
}: QuranSearchHistoryListProps): React.JSX.Element | null {
  // Section disembunyikan seluruhnya saat riwayat kosong — bukan menampilkan
  // empty state, karena ini bukan konten utama screen.
  if (recentSearches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pencarian Terakhir</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClearAll}
          accessibilityRole="button"
          accessibilityLabel="Hapus semua pencarian terakhir">
          <Text style={styles.clearLabel}>Hapus Semua</Text>
        </TouchableOpacity>
      </View>

      {recentSearches.map(query => (
        <View key={query} style={styles.row}>
          <TouchableOpacity
            style={styles.queryButton}
            onPress={() => onPressItem(query)}
            accessibilityRole="button"
            accessibilityLabel={`Cari lagi ${query}`}>
            <Icon icon={ClockCircle} size={20} color={colors.neutral[400]} />
            <Text style={styles.query} numberOfLines={1}>
              {query}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemoveItem(query)}
            accessibilityRole="button"
            accessibilityLabel={`Hapus ${query} dari riwayat`}>
            <Icon icon={CloseCircle} size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  clearButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  clearLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queryButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  query: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.neutral[700],
  },
  removeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
