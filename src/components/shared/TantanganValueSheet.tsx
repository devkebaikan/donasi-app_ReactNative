import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {Button} from '@/components/ui/Button';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TantanganJurnalItem} from '@/types/tantangan';

const MAX_VALUE_DIGITS = 4;

interface TantanganValueSheetProps {
  /** null → sheet tertutup. Terisi → sheet terbuka untuk baris itu. */
  item: TantanganJurnalItem | null;
  isSaving: boolean;
  onSave: (value: number) => void;
  onClose: () => void;
}

// Struktur ref/backdrop/present/dismiss lewat prop mengikuti PrayerOptionSheet
// — termasuk penanda hasPresentedRef yang menahan dismiss() sebelum sheet
// pernah present. Baca komentar panjang di file itu soal status INITIAL di
// gorhom 5.2 sebelum mengubah bagian ini.
export function TantanganValueSheet({
  item,
  isSaving,
  onSave,
  onClose,
}: TantanganValueSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheetModal>(null);
  const hasPresentedRef = useRef(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  // Isi awal diambil dari nilai hari ini kalau barisnya sudah pernah dicatat,
  // supaya mengubah angka tidak berarti mengetik ulang dari nol.
  if (item && hydratedId !== item.challengeId) {
    setHydratedId(item.challengeId);
    setValue(item.todayValue != null ? String(item.todayValue) : '');
    setError(null);
  }
  if (!item && hydratedId !== null) {
    setHydratedId(null);
  }

  const handleDismissed = useCallback(() => {
    hasPresentedRef.current = false;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (item) {
      hasPresentedRef.current = true;
      sheetRef.current?.present();
      return;
    }
    if (hasPresentedRef.current) {
      sheetRef.current?.dismiss();
    }
  }, [item]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  // Validasi dijalankan saat tombol ditekan, bukan saat mengetik — standar
  // form di CLAUDE.md.
  function handleSave(): void {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Isi nilainya dulu');
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      setError('Isi nilainya dulu');
      return;
    }
    if (parsed < 0) {
      setError('Nilai tidak boleh negatif');
      return;
    }
    setError(null);
    onSave(parsed);
  }

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={['40%']}
      enableDynamicSizing={false}
      onDismiss={handleDismissed}
      backdropComponent={renderBackdrop}>
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>{item?.name ?? ''}</Text>
        <Text style={styles.subtitle}>
          {item?.unit
            ? `Berapa ${item.unit.toLowerCase()} hari ini?`
            : 'Berapa hari ini?'}
        </Text>

        <View style={styles.fieldRow}>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            maxLength={MAX_VALUE_DIGITS}
            placeholder="0"
            placeholderTextColor={colors.neutral[400]}
            accessibilityLabel={`Nilai ${item?.unit ?? ''} hari ini`}
          />
          <Text style={styles.unit}>{item?.unit ?? ''}</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Tidak disabled saat kosong — hanya saat proses simpan berjalan. */}
        <Button
          label="Simpan"
          onPress={handleSave}
          isLoading={isSaving}
          isDisabled={isSaving}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.semantic.error,
  },
  unit: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
});
