import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AltArrowLeft} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {PrayerCountdown} from '@/components/shared/PrayerCountdown';
import {PrayerLocationChip} from '@/components/shared/PrayerLocationChip';
import {colors, fontWeight, fontSize, spacing} from '@/theme';
import type {PrayerTimeItem} from '@/types/prayerTime';

interface PrayerScheduleHeaderProps {
  nextPrayerName: string;
  nextPrayerTime: string;
  upcomingPrayers: PrayerTimeItem[];
  countdown: string;
  location: string;
  onPressBack: () => void;
  onPressLocation: () => void;
}

// Gradient dipasang sebagai lapisan absolut DI DALAM header, bukan sebagai
// kotak layout yang membungkus isi. Bedanya penting: tinggi header jadi
// ditentukan isinya sendiri, jadi teks tidak pernah terpotong dan latarnya
// tidak pernah kependekan — termasuk saat ukuran font sistem diperbesar.
export function PrayerScheduleHeader({
  nextPrayerName,
  nextPrayerTime,
  upcomingPrayers,
  countdown,
  location,
  onPressBack,
  onPressLocation,
}: PrayerScheduleHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, {paddingTop: insets.top + spacing.sm}]}>
        <LinearGradient
          colors={[colors.primary[600], colors.primary[800]]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={StyleSheet.absoluteFill}>
          <Image
            source={require('@/assets/images/mosque_illustration.png')}
            style={styles.mosqueImage}
            resizeMode="contain"
          />
        </LinearGradient>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onPressBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={24} color={colors.neutral[0]} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.nextName}>{nextPrayerName}</Text>

          <View style={styles.timeRow}>
            <Text style={styles.nextTime} numberOfLines={1}>
              {nextPrayerTime}
            </Text>

            <View style={styles.upcomingRow}>
              {upcomingPrayers.map(item => (
                <View key={item.key} style={styles.upcomingItem}>
                  <Text style={styles.upcomingName} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={styles.upcomingTime}>{item.time}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Hitung mundur di kiri, chip lokasi di kanan — satu baris, seperti
              di design. Keduanya boleh melar tanpa saling memotong. */}
          <View style={styles.footerRow}>
            <PrayerCountdown countdown={countdown} />
            <PrayerLocationChip location={location} onPress={onPressLocation} />
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    // Ruang bawah sengaja dilebihkan: panel putih ditarik naik sedikit agar
    // sudut membulatnya jatuh di atas gradient, dan yang tertutup hanya ruang
    // kosong ini — tidak pernah teksnya.
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  mosqueImage: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 180,
    height: 140,
    opacity: 0.18,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  content: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  nextName: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.lg,
    color: colors.neutral[0],
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.lg,
  },
  nextTime: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize['4xl'],
    // lineHeight eksplisit: tanpa ini huruf berukuran besar terpotong di
    // sebagian perangkat Android.
    lineHeight: fontSize['4xl'] * 1.2,
    color: colors.neutral[0],
  },
  upcomingRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  upcomingItem: {
    gap: 2,
  },
  upcomingName: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    color: colors.primary[100],
  },
  upcomingTime: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.md,
    color: colors.neutral[0],
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
