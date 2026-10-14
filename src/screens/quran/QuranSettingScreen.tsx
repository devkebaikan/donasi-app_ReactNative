import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from '@/components/ui/Icon';
import {Home, TrashBinMinimalistic} from '@solar-icons/react-native/Linear';
import {AccountMenuSection} from '@/components/shared/AccountMenuSection';
import {AccountMenuItem} from '@/components/shared/AccountMenuItem';
import {QuranFontSizeSlider} from '@/components/shared/QuranFontSizeSlider';
import {QuranSettingToggleRow} from '@/components/shared/QuranSettingToggleRow';
import {QuranQariSelector} from '@/components/shared/QuranQariSelector';
import {QuranConfirmDialog} from '@/components/shared/QuranConfirmDialog';
import {useQuranSetting} from '@/hooks/useQuranSetting';
import type {
  QuranTabNavigationProp,
  RootStackNavigationProp,
} from '@/types/navigation';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

function QuranSettingScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<QuranTabNavigationProp>();

  const {
    arabicFontSize,
    showLatin,
    showTranslation,
    qari,
    isResetDialogOpen,
    isResetting,
    setArabicFontSize,
    setShowLatin,
    setShowTranslation,
    setQari,
    openResetDialog,
    closeResetDialog,
    confirmReset,
  } = useQuranSetting();

  // Tab Pengaturan tidak punya tombol back seperti screen stack, jadi ini
  // satu-satunya jalan keluar dari menu Quran selain back hardware.
  // `navigate` (bukan push) memulangkan ke instance Home yang sudah ada di
  // stack, sehingga state menu utama tidak ikut ter-reset.
  function handleBackToApp(): void {
    navigation.getParent<RootStackNavigationProp>()?.navigate('Home');
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {paddingTop: insets.top + spacing.lg},
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Pengaturan</Text>

        {/* Tidak ada tombol simpan — tiap perubahan langsung berlaku dan
            langsung tersimpan di perangkat. */}
        <AccountMenuSection title="Tampilan Bacaan">
          <QuranFontSizeSlider
            value={arabicFontSize}
            onChange={setArabicFontSize}
          />
          <QuranSettingToggleRow
            label="Tampilkan Lafal Latin"
            value={showLatin}
            onChange={setShowLatin}
          />
          <QuranSettingToggleRow
            label="Tampilkan Terjemahan"
            value={showTranslation}
            onChange={setShowTranslation}
          />
        </AccountMenuSection>

        <AccountMenuSection title="Murottal">
          <View style={styles.qariBlock}>
            <Text style={styles.qariLabel}>Qari</Text>
            <QuranQariSelector value={qari} onChange={setQari} />
          </View>
        </AccountMenuSection>

        <AccountMenuSection title="Data">
          <TouchableOpacity
            style={styles.dangerRow}
            onPress={openResetDialog}
            accessibilityRole="button"
            accessibilityLabel="Reset progres bacaan">
            <Icon
              icon={TrashBinMinimalistic}
              size={22}
              color={colors.semantic.error}
            />
            <Text style={styles.dangerLabel}>Reset Progres Bacaan</Text>
          </TouchableOpacity>
        </AccountMenuSection>

        <AccountMenuSection title="Lainnya">
          <AccountMenuItem
            icon={Home}
            label="Kembali ke Halaman Utama"
            onPress={handleBackToApp}
          />
        </AccountMenuSection>
      </ScrollView>

      <QuranConfirmDialog
        visible={isResetDialogOpen}
        title="Reset semua progres bacaan?"
        description="Riwayat bacaan, surah selesai, dan progres challenge akan dihapus. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Reset"
        isLoading={isResetting}
        onConfirm={confirmReset}
        onCancel={closeResetDialog}
      />
    </View>
  );
}

export default QuranSettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  qariBlock: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  qariLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[800],
  },
  dangerRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  dangerLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.semantic.error,
  },
});
