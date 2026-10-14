import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SearchField} from '@/components/ui/SearchField';
import {colors, spacing} from '@/theme';

interface ReflectionSearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

// Pembungkus tipis di atas SearchField — isinya tinggal wadah berlatar putih
// di bawah header plus placeholder khusus menu Renungan. Style field-nya
// sendiri sudah pindah ke @/components/ui/SearchField sejak menu Donasi Rutin
// jadi pemakai berikutnya, sesuai catatan refactor di
// docs/08-features/renungan/renungan-list.md.
export function ReflectionSearchField({
  value,
  onChangeText,
  onSubmit,
  onClear,
}: ReflectionSearchFieldProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <SearchField
        value={value}
        onChangeText={onChangeText}
        onSubmit={onSubmit}
        onClear={onClear}
        placeholder="Cari renungan"
        accessibilityLabel="Cari renungan"
        iconColor={colors.secondary[500]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
