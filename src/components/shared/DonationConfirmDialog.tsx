import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import {formatCurrency} from '@/utils/formatCurrency';

// Do'a saat bersedekah (HR. Bukhari No. 1442, Muslim No. 1010) — dibaca tetap,
// bukan input pengguna (beda dari field "Do'a atau Pesan" opsional di Step 3).
const CHARITY_DOA_ARABIC = 'اللَّهُمَّ أَعْطِ مُنْفِقًا خَلَفًا';
const CHARITY_DOA_TRANSLITERATION = 'Allahumma aʻthi munfiqan khalafa';
const CHARITY_DOA_MEANING = 'Ya Allah, berikanlah ganti kepada orang yang berinfak.';

interface DonationConfirmDialogProps {
  visible: boolean;
  isLoading: boolean;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DonationConfirmDialog({
  visible,
  isLoading,
  amount,
  onConfirm,
  onCancel,
}: DonationConfirmDialogProps): React.JSX.Element {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Konfirmasi Donasi</Text>
          <Text style={styles.description}>
            Anda akan berdonasi sebesar {formatCurrency(amount)}. Lanjutkan?
          </Text>
          <View style={styles.doaContainer}>
            <Text style={styles.doaArabic} accessibilityLabel={CHARITY_DOA_MEANING}>
              {CHARITY_DOA_ARABIC}
            </Text>
            <Text style={styles.doaTransliteration}>{CHARITY_DOA_TRANSLITERATION}</Text>
            <Text style={styles.doaMeaning}>{CHARITY_DOA_MEANING}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Batal">
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Ya, Lanjutkan"
              accessibilityState={{disabled: isLoading}}>
              {isLoading ? (
                <ActivityIndicator color={colors.neutral[0]} />
              ) : (
                <Text style={styles.confirmText}>Ya, Lanjutkan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  doaContainer: {
    backgroundColor: colors.primary[50],
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  doaArabic: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: fontSize.xl * 1.8,
  },
  doaTransliteration: {
    fontSize: fontSize.xs,
    fontStyle: 'italic',
    color: colors.neutral[600],
    textAlign: 'center',
  },
  doaMeaning: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.neutral[100],
  },
  cancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[700],
  },
  confirmButton: {
    backgroundColor: colors.primary[500],
  },
  confirmText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
});
