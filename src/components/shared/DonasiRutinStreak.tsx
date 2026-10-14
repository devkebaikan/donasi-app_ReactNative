import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Button} from '@/components/ui/Button';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface DonasiRutinStreakProps {
  streakDays: number;
  onPressSetup: () => void;
}

const WEEKDAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function getTodayWeekdayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

export function DonasiRutinStreak({
  streakDays,
  onPressSetup,
}: DonasiRutinStreakProps): React.JSX.Element {
  const todayIndex = getTodayWeekdayIndex();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Donasi Rutin — Jadwal & Runtutan</Text>
      <Text style={styles.streak}>{streakDays} Hari Tanpa Putus</Text>

      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((label, index) => {
          const isToday = index === todayIndex;
          return (
            <View key={label} style={styles.dayColumn}>
              <View style={[styles.dayCircle, isToday && styles.dayCircleActive]}>
                <Text
                  style={[styles.dayText, isToday && styles.dayTextActive]}>
                  {label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.setupButtonWrapper}>
        <Button label="Atur Donasi Rutin" onPress={onPressSetup} variant="ghost" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[0],
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  streak: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: colors.primary[500],
  },
  dayText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  dayTextActive: {
    color: colors.neutral[0],
  },
  setupButtonWrapper: {
    marginTop: spacing.sm,
  },
});
