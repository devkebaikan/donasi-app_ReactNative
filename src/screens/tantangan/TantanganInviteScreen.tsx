import React, {useRef} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Share as ShareIcon, Flag2} from '@solar-icons/react-native/Bold';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {DonasiBersamaQrCard} from '@/components/shared/DonasiBersamaQrCard';
import {DonasiBersamaInviteLinkCard} from '@/components/shared/DonasiBersamaInviteLinkCard';
import {
  ShareBottomSheet,
  type ShareOption,
} from '@/components/shared/ShareBottomSheet';
import {Button} from '@/components/ui/Button';
import {EmptyState} from '@/components/ui/EmptyState';
import {useTantanganInvite} from '@/hooks/useTantanganInvite';
import {showToast} from '@/utils/toast';
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  lineHeight,
} from '@/theme';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';

const SHARE_OPTION_LABEL: Record<ShareOption, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  whatsapp: 'Whatsapp',
  'copy-url': 'Salin URL',
};

export default function TantanganInviteScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'TantanganInvite'>>();
  const {challengeId, challengeName} = route.params;

  const shareSheetRef = useRef<BottomSheetModal>(null);
  const {invite, isLoading, isError, retry} = useTantanganInvite(challengeId);

  function handleBack(): void {
    navigation.goBack();
  }

  // Teks ajakan dirakit di screen, bukan di dalam sheet: cuma di sini nama
  // tantangan dan tautannya sama-sama tersedia.
  function buildShareText(): string {
    return `Ikut tantangan "${challengeName}" bareng aku yuk. Gabung lewat tautan ini: ${invite?.inviteUrl ?? ''}`;
  }

  function handleSelectShareOption(option: ShareOption): void {
    shareSheetRef.current?.dismiss();
    // "Salin URL" bisa benar-benar dikerjakan sekarang; opsi lain mengikuti
    // perilaku yang sudah ada di DonasiBersamaInviteScreen.
    if (option === 'copy-url' && invite) {
      Clipboard.setString(buildShareText());
      showToast('Ajakan disalin');
      return;
    }
    showToast(
      `Fitur berbagi ke ${SHARE_OPTION_LABEL[option]} akan segera hadir.`,
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Ajak Teman" onBack={handleBack} />
        <View style={styles.centered}>
          <EmptyState
            icon={Flag2}
            title="Undangan Tidak Tersedia"
            description="Tautan undangan tantangan ini belum bisa dimuat."
          />
          <Button label="Coba Lagi" variant="ghost" onPress={retry} />
        </View>
      </View>
    );
  }

  // inviteUrl null selama memuat — kedua kartu menampilkan skeleton sendiri,
  // jadi tata letaknya tidak melompat saat data datang.
  const inviteUrl = isLoading ? null : (invite?.inviteUrl ?? null);

  return (
    <View style={styles.container}>
      <HeaderLight title="Ajak Teman" onBack={handleBack} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.title}>Tumbuh Bersama dalam Cahaya</Text>
          <Text style={styles.subtitle}>
            Ajak temanmu ikut tantangan ini dan mulai perjalanan kebaikan
            bersama.
          </Text>
        </View>

        {/* QR didahulukan, kebalikan dari DonasiBersamaInviteScreen: saat
            orangnya ada di depan mata, memindai jauh lebih cepat daripada
            menyalin tautan. */}
        <Text style={styles.sectionLabel}>PINDAI UNTUK BERGABUNG</Text>
        <DonasiBersamaQrCard inviteUrl={inviteUrl} groupName={challengeName} />

        {/* Berfungsi sebagai penghubung antara kedua kartu, bukan judul kartu
            tautan — kartunya sudah punya label "TAUTAN UNDANGAN UNIK" sendiri
            di dalam. */}
        <Text style={styles.connectorLabel}>ATAU BAGIKAN TAUTAN INI</Text>
        <DonasiBersamaInviteLinkCard inviteUrl={inviteUrl} />

        <View style={styles.shareSection}>
          <Text style={styles.shareTitle}>Bagikan Lewat</Text>
          <Button
            label="Pilih Aplikasi"
            variant="secondary"
            icon={ShareIcon}
            onPress={() => shareSheetRef.current?.present()}
          />
        </View>

        <Text style={styles.quote}>
          "Setiap teman yang bergabung akan menambah cahaya di lingkaran
          kebaikanmu."
        </Text>
      </ScrollView>

      <ShareBottomSheet
        ref={shareSheetRef}
        title="Ajak Teman"
        onSelectOption={handleSelectShareOption}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary[800],
    textAlign: 'center',
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    letterSpacing: 1,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  connectorLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    letterSpacing: 1,
    color: colors.neutral[500],
    textAlign: 'center',
    paddingTop: spacing.sm,
  },
  shareSection: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  shareTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  quote: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    color: colors.primary[600],
    textAlign: 'center',
    paddingTop: spacing.md,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
});
