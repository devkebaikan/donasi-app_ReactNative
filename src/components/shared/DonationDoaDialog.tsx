import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Heart} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

// Do'a untuk donatur (HR. Muslim No. 1078) — dibaca tetap, ditampilkan sekali
// saat donatur mendarat di PaymentInvoiceScreen setelah donasi berhasil dibuat.
const DOA_ARABIC =
  'أَجَرَكَ اللَّهُ فِي مَآ أَعْطَيْتَ، وَبَارَكَ لَكَ فِي مَآ أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُورًا';
const DOA_MEANING =
  'Semoga Allah memberi pahala atas apa yang telah diberikan, memberi berkah atas apa yang masih dimiliki, serta menjadikannya pembersih bagimu.';

interface DonationDoaDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

export function DonationDoaDialog({
  visible,
  onDismiss,
}: DonationDoaDialogProps): React.JSX.Element {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Do'a Kami Untuk Donatur</Text>
          <Text style={styles.arabic} accessibilityLabel={DOA_MEANING}>
            {DOA_ARABIC}
          </Text>
          <Text style={styles.meaning}>{DOA_MEANING}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Aamiin Ya Rabbal'alamin">
            <Text style={styles.buttonText}>Aamiin Ya Rabbal'alamin</Text>
            <Icon icon={Heart} size={18} color={colors.neutral[0]} />
          </TouchableOpacity>
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
    gap: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  arabic: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: fontSize.xl * 1.8,
  },
  meaning: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[500],
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
});
