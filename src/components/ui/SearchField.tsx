import React from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import {Magnifer, CloseCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize} from '@/theme';

const FIELD_ICON_HIT_SLOP = {top: 8, bottom: 8, left: 8, right: 8};

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  placeholder: string;
  accessibilityLabel: string;
  /** Warna icon kaca pembesar. Default mengikuti SearchBar di header Home. */
  iconColor?: string;
}

// Field pencarian yang SELALU terlihat — bukan mode yang harus dibuka dulu
// seperti di NewsHeader, karena di sana judul dan field saling menggantikan
// dalam satu baris. Style-nya diangkat dari ReflectionSearchField, yang
// sendiri menyalinnya dari NewsHeader; sejak file ini ada, dua pemakai itu
// tidak perlu lagi memelihara salinan sendiri.
// Lihat docs/08-features/donasi-rutin/donasi-rutin-list.md.
export function SearchField({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder,
  accessibilityLabel,
  iconColor = colors.neutral[400],
}: SearchFieldProps): React.JSX.Element {
  return (
    <View style={styles.field}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[400]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        accessibilityLabel={accessibilityLabel}
      />
      {value ? (
        <TouchableOpacity
          style={styles.iconButton}
          hitSlop={FIELD_ICON_HIT_SLOP}
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="Hapus pencarian">
          <Icon icon={CloseCircle} size={18} color={colors.neutral[400]} />
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={styles.iconButton}
        hitSlop={FIELD_ICON_HIT_SLOP}
        onPress={onSubmit}
        accessibilityRole="button"
        accessibilityLabel="Cari">
        <Icon icon={Magnifer} size={20} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[900],
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
