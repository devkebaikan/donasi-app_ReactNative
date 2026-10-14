import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {CheckCircle} from '@solar-icons/react-native/Bold';
import {MenuDotsCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {getAmalanIconBySlug} from '@/utils/amalanIcons';
import {formatAmalanTime} from '@/utils/formatDate';
import {colors, spacing, radius, fontWeight, fontSize, lineHeight} from '@/theme';
import type {Amalan, AmalanPreset} from '@/types/amalan';

const HIT_SLOP = {top: 10, bottom: 10, left: 10, right: 10};

interface AmalanRowProps {
  amalan: Amalan;
  presets: AmalanPreset[];
  isLast: boolean;
  onToggle: (amalan: Amalan) => void;
  onPressActions: (amalan: Amalan) => void;
}

// Baris dengan lingkaran icon + waktu mengikuti pola PrayerTimeRow; kolom garis
// vertikal + prop isLast mengikuti SalurTimelineItem.
export function AmalanRow({
  amalan,
  presets,
  isLast,
  onToggle,
  onPressActions,
}: AmalanRowProps): React.JSX.Element {
  const preset = presets.find(item => item.slug === amalan.presetSlug);
  const presetIcon = getAmalanIconBySlug(preset?.iconSlug ?? '');
  const timeLabel = formatAmalanTime(amalan.time);

  return (
    <View style={styles.container}>
      <View style={styles.timelineColumn}>
        <View
          style={[
            styles.iconCircle,
            amalan.isCompleted && styles.iconCircleCompleted,
          ]}>
          <Icon
            // Status ditandai bentuk icon DAN warna, bukan warna saja.
            icon={amalan.isCompleted ? CheckCircle : presetIcon}
            size={20}
            color={
              amalan.isCompleted ? colors.neutral[0] : colors.neutral[500]
            }
          />
        </View>
        {isLast ? null : <View style={styles.timelineLine} />}
      </View>

      <TouchableOpacity
        style={styles.body}
        onPress={() => onToggle(amalan)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${amalan.title}, ${timeLabel}, ${
          amalan.isCompleted ? 'selesai' : 'belum'
        }`}>
        <Text style={styles.time}>{timeLabel}</Text>
        {/* Judul yang selesai sengaja TIDAK dicoret — ini catatan amalan yang
            sudah dikerjakan, bukan daftar tugas yang dibatalkan. */}
        <Text style={styles.title}>{amalan.title}</Text>
        {amalan.note ? (
          <Text style={styles.note} numberOfLines={2}>
            {amalan.note}
          </Text>
        ) : null}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onPressActions(amalan)}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={`Aksi lain untuk ${amalan.title}`}>
        <Icon icon={MenuDotsCircle} size={22} color={colors.neutral[400]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 40,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
  },
  iconCircleCompleted: {
    backgroundColor: colors.primary[500],
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: spacing.xs,
    backgroundColor: colors.neutral[200],
  },
  body: {
    flex: 1,
    gap: 2,
    paddingBottom: spacing.md,
    // Badan baris sendiri sudah lebih tinggi dari 44, tapi dikunci supaya baris
    // tanpa catatan tetap memenuhi touch target minimum.
    minHeight: 44,
  },
  time: {
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  title: {
    fontWeight: fontWeight.semiBold,
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  note: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[600],
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
