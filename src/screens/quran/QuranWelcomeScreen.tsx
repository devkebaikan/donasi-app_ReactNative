import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '@/components/ui/Button';
import {QuranWelcomeBackground} from '@/components/shared/QuranWelcomeBackground';
import type {RootStackNavigationProp} from '@/types/navigation';
import {colors, fontFamily, spacing, fontSize, fontWeight} from '@/theme';

// Ditulis sebagai rangkaian huruf arab, bukan glyph ligatur U+FDFD, supaya
// rendering-nya konsisten dengan font mushaf yang dipakai di reader.
const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

const TITLE = 'Mulai Perjalanan Quranmu';
const SUBTITLE =
  'Baca setiap hari, ikuti challenge, dan atur jadwalmu agar istiqamah.';

function QuranWelcomeScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const insets = useSafeAreaInsets();

  // replace, bukan navigate — supaya back hardware dari QuranTabs langsung
  // keluar ke screen asal dan tidak mampir lagi ke welcome.
  function handleStart(): void {
    navigation.replace('QuranTabs');
  }

  function handleBack(): void {
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <QuranWelcomeBackground />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.spacer} />

        <Text style={styles.bismillah} accessibilityLabel="Bismillahirrahmanirrahim">
          {BISMILLAH}
        </Text>

        <Text style={styles.title}>{TITLE}</Text>
        <Text style={styles.subtitle}>{SUBTITLE}</Text>

        <View style={styles.actions}>
          <Button label="Mulai Membaca" onPress={handleStart} />

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Nanti Saja">
            <Text style={styles.backLabel}>Nanti Saja</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export default QuranWelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[800],
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  // Mendorong konten ke paruh bawah, tempat gradient sudah pekat. Pakai flex
  // supaya di layar pendek konten naik sendiri sebelum ScrollView aktif.
  spacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
  bismillah: {
    // Belum ada font arab terpasang — lihat ADR-005. Sampai font di-link,
    // teks jatuh ke font sistem. lineHeight tetap dua kali fontSize supaya
    // harakat tidak terpotong, apa pun font yang dipakai.
    fontFamily: fontFamily.arabic,
    fontSize: 26,
    lineHeight: 52,
    color: colors.neutral[0],
    textAlign: 'center',
    writingDirection: 'rtl',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[0],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    color: colors.primary[100],
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  actions: {
    marginTop: spacing.xl,
  },
  backButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  backLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[0],
  },
});
