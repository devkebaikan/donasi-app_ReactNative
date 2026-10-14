import React, {useRef} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {UsersGroupTwoRounded} from '@solar-icons/react-native/Bold';
import {Share as ShareIcon} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {
  ShareBottomSheet,
  type ShareOption,
} from '@/components/shared/ShareBottomSheet';
import {DonasiBersamaInviteLinkCard} from '@/components/shared/DonasiBersamaInviteLinkCard';
import {DonasiBersamaQrCard} from '@/components/shared/DonasiBersamaQrCard';
import {Button} from '@/components/ui/Button';
import {EmptyState} from '@/components/ui/EmptyState';
import {Icon} from '@/components/ui/Icon';
import {useDonasiBersamaInvite} from '@/hooks/useDonasiBersamaInvite';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight, lineHeight} from '@/theme';
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

export default function DonasiBersamaInviteScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DonasiBersamaInvite'>>();
  const {groupId, groupName} = route.params;

  const shareSheetRef = useRef<BottomSheetModal>(null);
  const {invite, isLoading, isError, retry} = useDonasiBersamaInvite(groupId);

  function handleBack(): void {
    navigation.goBack();
  }

  function handleSelectShareOption(option: ShareOption): void {
    shareSheetRef.current?.dismiss();
    // "Salin URL" bisa benar-benar dikerjakan sekarang; opsi lain mengikuti
    // perilaku yang sudah ada di DetailProgramScreen.
    if (option === 'copy-url' && invite) {
      Clipboard.setString(invite.inviteUrl);
      showToast('Tautan undangan disalin');
      return;
    }
    showToast(
      `Fitur berbagi ke ${SHARE_OPTION_LABEL[option]} akan segera hadir.`,
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Undang Teman" onBack={handleBack} />
        <View style={styles.centered}>
          <EmptyState
            icon={UsersGroupTwoRounded}
            title="Undangan Tidak Tersedia"
            description="Tautan undangan grup ini belum bisa dimuat."
          />
          <Button label="Coba Lagi" variant="ghost" onPress={retry} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight title="Undang Teman" onBack={handleBack} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Icon
              icon={UsersGroupTwoRounded}
              size={40}
              color={colors.primary[600]}
            />
          </View>
          <Text style={styles.title}>Undang Teman & Perluas Kebaikan</Text>
          <Text style={styles.subtitle}>
            Satu undangan dapat membuka jalan bagi ribuan doa dan kebaikan yang
            mengalir tiada henti.
          </Text>
        </View>

        {/* inviteUrl null selama memuat — kedua kartu menampilkan skeleton
            sendiri, jadi tata letaknya tidak melompat saat data datang. */}
        <DonasiBersamaInviteLinkCard
          inviteUrl={isLoading ? null : (invite?.inviteUrl ?? null)}
        />

        <DonasiBersamaQrCard
          inviteUrl={isLoading ? null : (invite?.inviteUrl ?? null)}
          groupName={groupName}
        />

        <View style={styles.shareSection}>
          <Text style={styles.shareTitle}>Bagikan Lewat</Text>
          <Button
            label="Pilih Aplikasi"
            variant="secondary"
            icon={ShareIcon}
            onPress={() => shareSheetRef.current?.present()}
          />
        </View>
      </ScrollView>

      <ShareBottomSheet
        ref={shareSheetRef}
        title="Undang Teman"
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
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
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
  shareSection: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  shareTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[700],
    textAlign: 'center',
  },
});
