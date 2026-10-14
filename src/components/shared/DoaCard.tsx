import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from 'react-native';
import {DangerCircle, Heart, Star} from '@solar-icons/react-native/Linear';
import {
  Heart as HeartBold,
  Star as StarBold,
} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {Avatar} from '@/components/ui/Avatar';
import {formatDoaTimestamp} from '@/utils/formatDate';
import {
  colors,
  spacing,
  radius,
  shadows,
  fontSize,
  fontWeight,
  lineHeight,
} from '@/theme';
import type {Doa} from '@/types/doa';

const COLLAPSED_LINES = 3;
const AVATAR_SIZE = 40;

interface DoaCardProps {
  doa: Doa;
  isExpanded: boolean;
  onToggleExpand: (doaId: string) => void;
  onPressAmiin: (doa: Doa) => void;
  onPressFavorite: (doa: Doa) => void;
  onPressReport: (doa: Doa) => void;
}

// Kartu tidak memanggil API dan tidak tahu status login — keputusan itu milik
// screen. Semua aksi hanya melaporkan ke atas lewat props.
export function DoaCard({
  doa,
  isExpanded,
  onToggleExpand,
  onPressAmiin,
  onPressFavorite,
  onPressReport,
}: DoaCardProps): React.JSX.Element {
  const [measuredLines, setMeasuredLines] = useState<number | null>(null);

  // Jumlah baris sebenarnya cuma diketahui setelah layout. Menebak dari
  // content.length salah di dua arah: teks pendek dengan banyak baris baru
  // ikut terpotong, teks panjang di layar lebar ternyata tidak terpotong.
  //
  // Pengukurannya TIDAK bisa dilakukan pada Text yang tampil, karena Text yang
  // sudah dibatasi numberOfLines hanya melaporkan baris yang terlihat — nilainya
  // mentok di COLLAPSED_LINES dan perbandingannya tidak akan pernah benar.
  // Jadi salinan tak terlihat tanpa numberOfLines yang diukur, sekali saja,
  // lalu dilepas.
  function handleMeasureLayout(
    event: NativeSyntheticEvent<TextLayoutEventData>,
  ): void {
    setMeasuredLines(event.nativeEvent.lines.length);
  }

  const isTruncated = measuredLines != null && measuredLines > COLLAPSED_LINES;

  return (
    <View style={styles.card}>
      <View style={styles.authorRow}>
        <Avatar
          uri={doa.author.avatarUrl}
          name={doa.author.name}
          size={AVATAR_SIZE}
        />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName} numberOfLines={1}>
            {doa.author.name}
          </Text>
          <Text style={styles.timestamp}>
            {formatDoaTimestamp(doa.createdAt)}
          </Text>
        </View>

        {doa.isMine ? null : (
          <TouchableOpacity
            style={[styles.reportButton, doa.isReported && styles.reportedButton]}
            onPress={() => onPressReport(doa)}
            disabled={doa.isReported}
            accessibilityRole="button"
            accessibilityLabel={
              doa.isReported
                ? `Doa dari ${doa.author.name} sudah dilaporkan`
                : `Laporkan doa dari ${doa.author.name}`
            }
            accessibilityState={{disabled: doa.isReported}}>
            <Icon icon={DangerCircle} size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>

      <View>
        <Text
          style={styles.content}
          numberOfLines={isExpanded ? undefined : COLLAPSED_LINES}>
          {doa.content}
        </Text>

        {measuredLines == null ? (
          <Text
            style={[styles.content, styles.measure]}
            onTextLayout={handleMeasureLayout}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants">
            {doa.content}
          </Text>
        ) : null}
      </View>

      {isTruncated && !isExpanded ? (
        <TouchableOpacity
          onPress={() => onToggleExpand(doa.id)}
          accessibilityRole="button"
          accessibilityLabel={`Baca doa selengkapnya dari ${doa.author.name}`}>
          <Text style={styles.readMore}>Baca Selengkapnya</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.amiinButton}
          onPress={() => onPressAmiin(doa)}
          accessibilityRole="button"
          accessibilityLabel={
            doa.isAmiin
              ? `Batal mengaamiinkan doa dari ${doa.author.name}`
              : `Aamiinkan doa dari ${doa.author.name}`
          }
          accessibilityState={{selected: doa.isAmiin}}>
          <Icon
            icon={doa.isAmiin ? HeartBold : Heart}
            size={20}
            color={doa.isAmiin ? colors.primary[500] : colors.neutral[500]}
          />
          <Text style={[styles.amiinLabel, doa.isAmiin && styles.amiinLabelActive]}>
            Aamiinkan doa ini
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onPressFavorite(doa)}
          accessibilityRole="button"
          accessibilityLabel={
            doa.isFavorite
              ? `Hapus doa dari ${doa.author.name} dari favorit`
              : `Simpan doa dari ${doa.author.name} ke favorit`
          }
          accessibilityState={{selected: doa.isFavorite}}>
          <Icon
            icon={doa.isFavorite ? StarBold : Star}
            size={20}
            color={doa.isFavorite ? colors.secondary[500] : colors.neutral[400]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  authorInfo: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  timestamp: {
    fontSize: fontSize.sm,
    color: colors.neutral[400],
  },
  reportButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportedButton: {
    opacity: 0.4,
  },
  content: {
    fontSize: fontSize.md,
    color: colors.neutral[700],
    lineHeight: fontSize.md * lineHeight.normal,
  },
  // Salinan pengukur: selebar kartu, tidak terlihat, dan tidak mempengaruhi
  // tinggi kartu karena absolute.
  measure: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    opacity: 0,
  },
  readMore: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    borderStyle: 'dashed',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amiinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingRight: spacing.md,
  },
  amiinLabel: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
  },
  amiinLabelActive: {
    color: colors.primary[500],
    fontWeight: fontWeight.medium,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
