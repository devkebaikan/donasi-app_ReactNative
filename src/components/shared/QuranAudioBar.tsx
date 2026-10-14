import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {
  Play,
  Pause,
  AltArrowLeft,
  AltArrowRight,
  DoubleAltArrowLeft,
  DoubleAltArrowRight,
  RepeatOne,
  VolumeLoud,
  VolumeCross,
} from '@solar-icons/react-native/Bold';
import {QuranProgressBar} from '@/components/shared/QuranProgressBar';
import {colors, spacing, radius, shadows, fontSize, fontWeight} from '@/theme';

const PLAY_BUTTON_SIZE = 44;
const PLAY_ICON_SIZE = 20;
const CONTROL_ICON_SIZE = 18;
// Tombol pengubah dibuat ringkas; area sentuh 44x44 dijaga lewat hitSlop.
const TOGGLE_SIZE = 28;
const TOGGLE_HIT_SLOP = {top: 8, bottom: 8, left: 8, right: 8};

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

interface QuranAudioBarProps {
  mode: 'ayah' | 'surah';
  elapsedSeconds: number;
  durationSeconds: number;
  activeAyah: number;
  totalAyah: number;
  isPlaying: boolean;
  isMuted: boolean;
  isRepeatingAyah: boolean;
  hasPreviousAyah: boolean;
  hasNextAyah: boolean;
  hasPreviousSurah: boolean;
  hasNextSurah: boolean;
  onToggle: () => void;
  onToggleMute: () => void;
  onToggleRepeatAyah: () => void;
  onPressProgress: () => void;
  onPreviousAyah: () => void;
  onNextAyah: () => void;
  onPreviousSurah: () => void;
  onNextSurah: () => void;
}

interface ControlProps {
  icon: SolarIconComponent;
  label: string;
  disabled: boolean;
  onPress: () => void;
}

function Control({
  icon,
  label,
  disabled,
  onPress,
}: ControlProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.control}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled}}>
      <Icon
        icon={icon}
        size={CONTROL_ICON_SIZE}
        color={disabled ? colors.neutral[300] : colors.neutral[600]}
      />
    </TouchableOpacity>
  );
}

interface ToggleProps {
  icon: SolarIconComponent;
  label: string;
  isActive: boolean;
  /**
   * Warnai ikon saat aktif. Dimatikan untuk tombol yang ikonnya sendiri sudah
   * berubah bentuk antar-status — warna tambahan cuma jadi sinyal ganda.
   */
  tintWhenActive?: boolean;
  onPress: () => void;
}

function Toggle({
  icon,
  label,
  isActive,
  tintWhenActive = true,
  onPress,
}: ToggleProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.toggle}
      onPress={onPress}
      hitSlop={TOGGLE_HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{selected: isActive}}>
      <Icon
        icon={icon}
        size={CONTROL_ICON_SIZE}
        color={
          isActive && tintWhenActive ? colors.primary[600] : colors.neutral[400]
        }
      />
    </TouchableOpacity>
  );
}

export function QuranAudioBar({
  mode,
  elapsedSeconds,
  durationSeconds,
  activeAyah,
  totalAyah,
  isPlaying,
  isMuted,
  isRepeatingAyah,
  hasPreviousAyah,
  hasNextAyah,
  hasPreviousSurah,
  hasNextSurah,
  onToggle,
  onToggleMute,
  onToggleRepeatAyah,
  onPressProgress,
  onPreviousAyah,
  onNextAyah,
  onPreviousSurah,
  onNextSurah,
}: QuranAudioBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const isFullSurah = mode === 'surah';

  // Mode satu surah: satu berkas panjang, jadi kemajuannya diukur waktu.
  // Mode per-ayat: kemajuannya diukur nomor ayat.
  const percentage = isFullSurah
    ? Math.round((elapsedSeconds / Math.max(1, durationSeconds)) * 100)
    : Math.round((activeAyah / Math.max(1, totalAyah)) * 100);

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom + spacing.sm}]}>
      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          {/* Label progres sekaligus pintu ke daftar lompat ayat — tempat
              yang paling masuk akal, karena di situlah posisi ayat dibaca. */}
          {isFullSurah ? (
            <Text style={styles.progressLabel}>
              Satu surah · {formatDuration(elapsedSeconds)} /{' '}
              {formatDuration(durationSeconds)}
            </Text>
          ) : (
            <TouchableOpacity
              onPress={onPressProgress}
              accessibilityRole="button"
              accessibilityLabel={`Ayat ${activeAyah} dari ${totalAyah}. Ketuk untuk pergi ke ayat lain`}>
              <Text style={styles.progressLabel}>
                Ayat {activeAyah} dari {totalAyah}
              </Text>
            </TouchableOpacity>
          )}

          {/* Dua pengubah cara memutar ditaruh di baris info, bukan berjajar
              dengan tombol navigasi — supaya deretan bawah tetap murni
              kontrol pindah ayat/surah dan tidak berdesakan. */}
          <View style={styles.modifiers}>
            <Text style={styles.progressPercentage}>{percentage}%</Text>

            <Toggle
              icon={RepeatOne}
              label="Ulangi ayat ini"
              isActive={isRepeatingAyah}
              onPress={onToggleRepeatAyah}
            />
            <Toggle
              icon={isMuted ? VolumeCross : VolumeLoud}
              label={isMuted ? 'Bunyikan suara' : 'Bisukan suara'}
              isActive={isMuted}
              tintWhenActive={false}
              onPress={onToggleMute}
            />
          </View>
        </View>
        <QuranProgressBar percentage={percentage} />
      </View>

      <View style={styles.controls}>
        <Control
          icon={DoubleAltArrowLeft}
          label="Surah sebelumnya"
          disabled={!hasPreviousSurah}
          onPress={onPreviousSurah}
        />
        <Control
          icon={AltArrowLeft}
          label="Ayat sebelumnya"
          disabled={isFullSurah || !hasPreviousAyah}
          onPress={onPreviousAyah}
        />

        {/* Tombol utama sedikit lebih besar dari tombol panah — cukup untuk
            menandai bahwa ini kontrol pokok, tanpa mendominasi bilah. */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={
            isPlaying ? 'Berhenti dengarkan' : 'Dengarkan ayat'
          }
          accessibilityState={{selected: isPlaying}}>
          <Icon
            icon={isPlaying ? Pause : Play}
            size={PLAY_ICON_SIZE}
            color={colors.neutral[0]}
          />
        </TouchableOpacity>

        <Control
          icon={AltArrowRight}
          label="Ayat berikutnya"
          disabled={isFullSurah || !hasNextAyah}
          onPress={onNextAyah}
        />
        <Control
          icon={DoubleAltArrowRight}
          label="Surah berikutnya"
          disabled={!hasNextSurah}
          onPress={onNextSurah}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    ...shadows.md,
  },
  progressBlock: {
    gap: spacing.xs,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  modifiers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggle: {
    width: TOGGLE_SIZE,
    height: TOGGLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  control: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: PLAY_BUTTON_SIZE,
    height: PLAY_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[500],
  },
});
