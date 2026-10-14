import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Alarm} from '@solar-icons/react-native/Linear';
import {Button} from '@/components/ui/Button';
import {colors, spacing} from '@/theme';

interface FloatingDonationFooterProps {
  isRutin: boolean;
  donationLabel: string;
  /** Warna tombol donasi dari `program.ctaColor` — undefined = pakai default
   * (secondary/coral). Dipakai dua kali: background tombol "{type} Sekarang"
   * dan border + teks tombol "Donasi Rutin" di sebelahnya. */
  donateButtonColor?: string;
  onPressSecondary: () => void;
  onPressDonate: () => void;
}

export function FloatingDonationFooter({
  isRutin,
  donationLabel,
  donateButtonColor,
  onPressSecondary,
  onPressDonate,
}: FloatingDonationFooterProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, {paddingBottom: insets.bottom + spacing.sm}]}>
      <View style={styles.secondaryButton}>
        {/* Tombol "Donasi Rutin" outlined dengan warna yang sama dengan tombol
            donasi di sebelahnya — dua-duanya aksi donasi, cuma beda tekanan.
            Tombol "Bagikan" (program non-rutin) sengaja TIDAK ikut: bagikan
            bukan aksi donasi, jadi tetap abu-abu netral seperti sebelumnya. */}
        {isRutin ? (
          <Button
            label="Donasi Rutin"
            variant="outline"
            // Fallback-nya harus sama dengan default tombol donasi
            // (Button variant="primary" = secondary[500]), bukan default
            // outline (primary[500]) — supaya dua tombol ini tidak pernah
            // beda warna saat API tidak mengirim cta_color.
            color={donateButtonColor ?? colors.secondary[500]}
            icon={Alarm}
            onPress={onPressSecondary}
          />
        ) : (
          <Button
            label="Bagikan"
            variant="secondary"
            onPress={onPressSecondary}
          />
        )}
      </View>
      <View style={[styles.primaryButton, isRutin && styles.primaryButtonRutin]}>
        <Button
          label={`${donationLabel} Sekarang`}
          variant="primary"
          color={donateButtonColor}
          onPress={onPressDonate}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.neutral[0],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral[200],
  },
  secondaryButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1.4,
  },
  // Tombol kiri butuh ruang lebih saat isinya "Donasi Rutin" + icon, supaya
  // labelnya tidak pecah ke dua baris di layar kecil.
  primaryButtonRutin: {
    flex: 1.15,
  },
});
