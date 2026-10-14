import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {Button} from '@/components/ui/Button';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

const SNAP_POINTS = ['40%'];

interface DonasiBersamaBatchFormSheetProps {
  isOpen: boolean;
  /** Judul + isi field berbeda antara membuat dan mengubah nama. */
  mode: 'create' | 'rename';
  initialLabel: string;
  isSubmitting: boolean;
  error?: string;
  onSubmit: (label: string) => void;
  onClose: () => void;
}

// Satu-satunya sheet berisi SATU field teks di project ini. AmalanFormSheet
// tidak bisa dipakai ulang karena isinya terikat empat field amalan.
export function DonasiBersamaBatchFormSheet({
  isOpen,
  mode,
  initialLabel,
  isSubmitting,
  error,
  onSubmit,
  onClose,
}: DonasiBersamaBatchFormSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheetModal>(null);
  // Menahan dismiss() sebelum sheet pernah present — alasan yang sama dengan
  // PrayerOptionSheet, lihat catatan panjang di file itu.
  const hasPresentedRef = useRef(false);
  const [label, setLabel] = useState(initialLabel);

  const handleDismissed = useCallback(() => {
    hasPresentedRef.current = false;
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setLabel(initialLabel);
      hasPresentedRef.current = true;
      sheetRef.current?.present();
      return;
    }
    if (hasPresentedRef.current) {
      sheetRef.current?.dismiss();
    }
    // initialLabel sengaja tidak jadi dependency: mengubahnya saat sheet
    // terbuka akan menimpa ketikan pengguna.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      enableDynamicSizing={false}
      enablePanDownToClose={!isSubmitting}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onDismiss={handleDismissed}
      backdropComponent={renderBackdrop}>
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>
          {mode === 'create' ? 'Buat Batch Baru' : 'Ubah Nama Batch'}
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nama Batch</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={label}
            onChangeText={setLabel}
            placeholder="Misal: Batch Ramadan"
            placeholderTextColor={colors.neutral[400]}
            accessibilityLabel="Nama batch"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        {mode === 'create' ? (
          <Text style={styles.helper}>
            Batch baru dibuat sebagai draf. Urunan baru masuk ke sana setelah
            kamu menekan "Mulai".
          </Text>
        ) : null}

        {/* Tidak pernah disabled karena field kosong — validasi jalan saat
            tombol ditekan, sesuai standar form aplikasi. */}
        <Button
          label={mode === 'create' ? 'Buat Batch' : 'Simpan'}
          isLoading={isSubmitting}
          onPress={() => onSubmit(label.trim())}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  input: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  helper: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
});
