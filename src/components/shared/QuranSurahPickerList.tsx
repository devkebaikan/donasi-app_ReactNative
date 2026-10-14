import React, {useMemo, useState} from 'react';
import {View, Text, TouchableOpacity, TextInput, StyleSheet} from 'react-native';
import {Icon} from '@/components/ui/Icon';
import {Magnifer} from '@solar-icons/react-native/Linear';
import {
  getSurahs,
  normalizeSurahKeyword,
} from '@/services/quranContentService';
import {colors, spacing, fontSize, fontWeight} from '@/theme';
import type {Surah} from '@/types/quran';

interface QuranSurahPickerListProps {
  selectedSurahNumber: number | null;
  onSelect: (surah: Surah) => void;
}

// Daftar surah + pencarian, dipakai bersama oleh bottom sheet "Pergi ke" di
// reader dan pemilih surah di form jadwal.
export function QuranSurahPickerList({
  selectedSurahNumber,
  onSelect,
}: QuranSurahPickerListProps): React.JSX.Element {
  const surahs = getSurahs();
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    const normalized = normalizeSurahKeyword(keyword);
    if (!normalized) {
      return surahs;
    }
    if (/^\d+$/.test(normalized)) {
      return surahs.filter(surah => surah.number === Number(normalized));
    }
    return surahs.filter(surah =>
      normalizeSurahKeyword(surah.nameLatin).includes(normalized),
    );
  }, [keyword, surahs]);

  return (
    <View>
      <View style={styles.searchRow}>
        <Icon icon={Magnifer} size={18} color={colors.neutral[400]} />
        <TextInput
          style={styles.searchInput}
          value={keyword}
          onChangeText={setKeyword}
          placeholder="Cari surah..."
          placeholderTextColor={colors.neutral[400]}
          autoCorrect={false}
          accessibilityLabel="Cari surah"
        />
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.empty}>Surah tidak ditemukan</Text>
      ) : (
        filtered.map(surah => {
          const isSelected = surah.number === selectedSurahNumber;
          return (
            <TouchableOpacity
              key={surah.number}
              style={styles.option}
              onPress={() => onSelect(surah)}
              accessibilityRole="button"
              accessibilityLabel={`${surah.number}. ${surah.nameLatin}, ${surah.totalAyah} ayat`}
              accessibilityState={{selected: isSelected}}>
              <Text style={styles.number}>{surah.number}</Text>
              <Text
                style={[styles.label, isSelected && styles.labelSelected]}
                numberOfLines={1}>
                {surah.nameLatin}
              </Text>
              <Text style={styles.meta}>{surah.totalAyah} ayat</Text>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    padding: 0,
  },
  option: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  number: {
    minWidth: 28,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[700],
  },
  label: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[800],
  },
  labelSelected: {
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  empty: {
    padding: spacing.lg,
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});
