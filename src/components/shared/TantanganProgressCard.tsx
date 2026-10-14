import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {AltArrowRight} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {ProgramProgressBar} from '@/components/shared/ProgramProgressBar';
import {DonasiBersamaAvatarStack} from '@/components/shared/DonasiBersamaAvatarStack';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {TantanganDetail} from '@/types/tantangan';

interface TantanganProgressCardProps {
  challenge: TantanganDetail;
  onPressParticipants: () => void;
}

export function TantanganProgressCard({
  challenge,
  onPressParticipants,
}: TantanganProgressCardProps): React.JSX.Element {
  const isGroup = challenge.mode === 'group';
  // Dibulatkan ke bawah supaya 99,7% tidak tampil 100% sebelum target
  // benar-benar tercapai. Persentasenya sendiri dihitung server.
  const percentage = Math.floor(Math.min(100, challenge.progressPercentage));
  // Target nol tidak pernah jadi pembagi di sini — persentase datang jadi dari
  // server — tapi baris nilainya tetap disembunyikan supaya tidak ada
  // "0 dari 0" yang tidak berarti apa-apa.
  const hasValueRow = challenge.targetValue > 0;
  // Tanpa satuan, progres dihitung dalam hari: "12 hari dari 40 hari".
  const unitLabel = challenge.unit ?? 'hari';
  const isQuranAction = challenge.action.type === 'quran';

  return (
    <View style={styles.card}>
      <Text style={styles.label}>
        {isGroup ? 'PROGRES GRUP' : 'PROGRES SAYA'}
      </Text>

      <View style={styles.headlineRow}>
        <Text style={styles.percentage}>{`${percentage}% Selesai`}</Text>
        {hasValueRow ? (
          <View style={styles.valueColumn}>
            <Text style={styles.doneValue}>
              {`${challenge.doneValue} ${unitLabel}`}
            </Text>
            <Text style={styles.targetValue}>
              {`dari ${challenge.targetValue} ${unitLabel}`}
            </Text>
          </View>
        ) : null}
      </View>

      <ProgramProgressBar progress={percentage} />

      {/* Progres tantangan bacaan dibaca dari domain Quran, jadi bisa tampil 0
          selama pengguna belum pernah membuka menu itu. Tanpa keterangan ini
          pengguna menyangka catatannya hilang. */}
      {isQuranAction ? (
        <Text style={styles.note}>
          Progres dicatat dari menu Quran, bukan dari halaman ini.
        </Text>
      ) : null}

      {/* Tantangan personal tidak punya peserta lain — barisnya tidak dirender
          sama sekali, bukan dirender kosong. */}
      {isGroup ? (
        <TouchableOpacity
          style={styles.participantRow}
          activeOpacity={0.8}
          onPress={onPressParticipants}
          accessibilityRole="button"
          accessibilityLabel={`Diikuti ${challenge.participantCount} orang, lihat papan kebaikan`}>
          <DonasiBersamaAvatarStack
            members={challenge.participantPreviews}
            memberCount={challenge.participantCount}
          />
          <Text style={styles.participantLabel} numberOfLines={1}>
            {`Diikuti ${challenge.participantCount} orang`}
          </Text>
          <Icon icon={AltArrowRight} size={20} color={colors.primary[600]} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  percentage: {
    flex: 1,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  valueColumn: {
    alignItems: 'flex-end',
  },
  doneValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  targetValue: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  note: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary[50],
  },
  participantLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
});
