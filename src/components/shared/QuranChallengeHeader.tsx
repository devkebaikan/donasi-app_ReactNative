import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon} from '@/components/ui/Icon';
import {
  AltArrowLeft,
  UsersGroupRounded,
  Calendar,
} from '@solar-icons/react-native/Linear';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

const FALLBACK_IMAGE = require('@/assets/images/mosque_illustration_teal.png');

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

// Tanggal dipecah manual: string date-only diparse sebagai UTC oleh JS,
// sehingga di timezone negatif tanggalnya mundur satu hari saat diformat.
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) {
    return '-';
  }
  return new Date(year, month - 1, day).toLocaleDateString('id-ID', DATE_FORMAT);
}

interface QuranChallengeHeaderProps {
  name: string;
  imageUrl: string;
  participantCount: number;
  startDate: string;
  endDate: string;
  isEnded: boolean;
  onBack: () => void;
}

export function QuranChallengeHeader({
  name,
  imageUrl,
  participantCount,
  startDate,
  endDate,
  isEnded,
  onBack,
}: QuranChallengeHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View>
      <View style={styles.imageWrapper}>
        <Image
          source={imageUrl ? {uri: imageUrl} : FALLBACK_IMAGE}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={[styles.backButton, {top: insets.top + spacing.sm}]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>CHALLENGE</Text>
          {isEnded ? (
            <View style={styles.endedBadge}>
              <Text style={styles.endedLabel}>Berakhir</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.name}>{name}</Text>

        <View style={styles.metaRow}>
          <Icon icon={UsersGroupRounded} size={16} color={colors.neutral[500]} />
          <Text style={styles.meta}>
            {participantCount.toLocaleString('id-ID')} peserta
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Icon icon={Calendar} size={16} color={colors.neutral[500]} />
          <Text style={styles.meta}>
            {formatDate(startDate)} – {formatDate(endDate)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    width: '100%',
    height: 200,
    backgroundColor: colors.primary[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.neutral[0],
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary[600],
    letterSpacing: 1,
  },
  endedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
  },
  endedLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[700],
  },
  name: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.neutral[600],
  },
});
