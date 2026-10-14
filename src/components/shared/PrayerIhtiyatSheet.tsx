import React, {useCallback, useEffect, useRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {Button} from '@/components/ui/Button';
import {IHTIYAT_FIELDS} from '@/utils/prayerOptions';
import {colors, fontWeight, fontSize, radius, spacing} from '@/theme';
import type {IhtiyatCorrection} from '@/types/prayerTime';

interface PrayerIhtiyatSheetProps {
  isOpen: boolean;
  draft: Record<keyof IhtiyatCorrection, string>;
  errors: Partial<Record<keyof IhtiyatCorrection, string>>;
  onChange: (field: keyof IhtiyatCorrection, value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

// Satu-satunya bentuk di layar pengaturan yang punya tombol simpan: isinya
// lima angka yang baru masuk akal setelah lengkap.
export function PrayerIhtiyatSheet({
  isOpen,
  draft,
  errors,
  onChange,
  onSave,
  onClose,
}: PrayerIhtiyatSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
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
      snapPoints={['70%']}
      enableDynamicSizing={false}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}>
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Koreksi Manual (Ihtiyat)</Text>
        <Text style={styles.helper}>
          Nilai positif memundurkan waktu, nilai negatif memajukan. Satuannya
          menit.
        </Text>

        {IHTIYAT_FIELDS.map(field => (
          <View key={field.key} style={styles.field}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={[styles.input, errors[field.key] && styles.inputError]}
              value={draft[field.key]}
              onChangeText={value => onChange(field.key, value)}
              placeholder="0"
              placeholderTextColor={colors.neutral[400]}
              keyboardType="numbers-and-punctuation"
              accessibilityLabel={`Koreksi menit ${field.label}`}
            />
            {errors[field.key] ? (
              <Text style={styles.error}>{errors[field.key]}</Text>
            ) : null}
          </View>
        ))}

        <Button label="Simpan" onPress={onSave} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  title: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
    color: colors.neutral[900],
  },
  helper: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  input: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    fontWeight: fontWeight.regular,
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  error: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
});
