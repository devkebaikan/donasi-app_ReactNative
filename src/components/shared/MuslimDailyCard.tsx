import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowRight } from '@solar-icons/react-native/Linear';
import { Icon } from '@/components/ui/Icon';
import { colors, spacing, radius, fontSize, fontWeight } from '@/theme';

interface MuslimDailyCardProps {
  location: string;
  nextPrayerName: string;
  nextPrayerTime: string;
  quote: string;
  onPressDetail?: () => void;
}

export function MuslimDailyCard({
  location,
  nextPrayerName,
  nextPrayerTime,
  quote,
  onPressDetail,
}: MuslimDailyCardProps): React.JSX.Element {
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    const updateCountdown = (): void => {
      const now = new Date();
      const timeParts = nextPrayerTime.split(':');
      const hours = parseInt(timeParts[0] || '0', 10);
      const minutes = parseInt(timeParts[1] || '0', 10);
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);

      // Jika waktu sudah lewat hari ini, hitung ke besok
      if (prayerDate <= now) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      const diff = prayerDate.getTime() - now.getTime();
      const totalMinutes = Math.floor(diff / 60000);
      const countdownHours = Math.floor(totalMinutes / 60);
      const countdownMinutes = totalMinutes % 60;

      setCountdown(`${countdownHours} jam ${countdownMinutes} menit lagi`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update setiap 1 menit

    return () => clearInterval(interval);
  }, [nextPrayerTime]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary[50], colors.primary[100]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.linearContainer}>
        {/* Mosque Illustration - Bottom Right */}
        <Image
          source={require('@/assets/images/mosque_illustration_teal.png')}
          style={styles.mosqueImage}
          resizeMode="contain"
        />

        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.location}>{location}</Text>
            <TouchableOpacity
              onPress={onPressDetail}
              accessibilityRole="button"
              accessibilityLabel="Lihat detail">
              <View style={styles.detailLink}>
                <Text style={styles.detailText}>Lihat detail</Text>
                <Icon icon={ArrowRight} size={16} color={colors.primary[600]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Prayer Time Section */}
          <View style={styles.prayerSection}>
            <Text style={styles.prayerLabel}>Waktu berikutnya</Text>
            <Text style={styles.prayerTime}>{nextPrayerName} {nextPrayerTime}</Text>
            <Text style={styles.countdown}>{countdown}</Text>
          </View>

          {/* Quote Section */}
          <Text style={styles.quote}>{quote}</Text>
        </View>
      </LinearGradient>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  linearContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  mosqueImage: {
    position: 'absolute',
    bottom: -32,
    right: -24,
    width: 200,
    height: 200,
    opacity: 0.6,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
  prayerSection: {
    gap: spacing.xs,
  },
  prayerLabel: {
    fontSize: fontSize.xs,
    color: colors.neutral[600],
    fontWeight: fontWeight.medium,
  },
  prayerTime: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  countdown: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    fontWeight: fontWeight.regular,
  },
  quote: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[700],
    lineHeight: 20,
    fontStyle: 'italic',
    marginRight: 128
  },
});
