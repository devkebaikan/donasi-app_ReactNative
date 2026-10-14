import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SadCircle, SmileCircle } from '@solar-icons/react-native/Linear';
import { Icon } from '@/components/ui/Icon';
import { colors, spacing, radius, fontSize, fontWeight } from '@/theme';

interface DaySchedule {
  day_name: string;
  has_donation: boolean;
  day_of_week: number;
}

interface DonasiRutinCalendarProps {
  streakDays: number;
  subtitle: string;
  weeklySchedule: DaySchedule[];
  onPressMore?: () => void;
}

export function DonasiRutinCalendar({
  streakDays,
  subtitle,
  weeklySchedule,
  onPressMore,
}: DonasiRutinCalendarProps): React.JSX.Element {
  const today = new Date().getDay();

  const getBorderDayColor = (dayOfWeek: number): string => {
    if (dayOfWeek === today) {
      return colors.secondary[300];
    }
    if (dayOfWeek < today) {
      return colors.primary[300];
    }
    return colors.neutral[300];
  };

  const getDayColor = (dayOfWeek: number): string => {
    if (dayOfWeek === today) {
      return colors.secondary[500];
    }
    if (dayOfWeek < today) {
      return colors.primary[500];
    }
    return colors.neutral[400];
  };

  const getDayBackgroundColor = (dayOfWeek: number): string => {
    if (dayOfWeek === today) {
      return colors.secondary[50];
    }
    if (dayOfWeek < today) {
      return colors.primary[50];
    }
    return colors.neutral[50];
  };

  return (
    <View style={styles.outerWrapper}>
      <LinearGradient
        colors={[colors.primary[50], colors.primary[300]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Donasi Rutin</Text>
            <TouchableOpacity
              onPress={onPressMore}
              accessibilityRole="button"
              accessibilityLabel="Jadwal dan Runtutan">
              <Text style={styles.moreLink}>Jadwal & Runtutan →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.streakSection}>
            <ImageBackground
              source={require('@/assets/images/badge_blank.png')}
              style={styles.medalIcon}
              resizeMode="contain">
              <Text style={styles.medalText}>{streakDays}</Text>
            </ImageBackground>
            <View style={styles.streakContent}>
              <Text style={styles.streakNumber}>
                {streakDays} Hari Donasi Tanpa Putus
              </Text>
              <Text style={styles.streakSubtitle}>{subtitle}</Text>
            </View>
          </View>

          <View style={styles.weeklyGrid}>
            {weeklySchedule.map((day, index) => {
              const borderDayColor = getBorderDayColor(day.day_of_week);
              const dayColor = getDayColor(day.day_of_week);
              const dayBg = getDayBackgroundColor(day.day_of_week);
              const isToday = day.day_of_week === today;

              return (
                <View
                  key={index}
                  style={[
                    styles.dayItem,
                    { backgroundColor: dayBg, borderColor: borderDayColor },
                    isToday && { borderStyle: 'dashed' },
                  ]}>
                  <View
                    style={[
                      styles.iconCircle,
                      { borderColor: dayColor },
                      isToday && styles.iconCircleToday,
                    ]}>
                    <Icon
                      icon={day.has_donation ? SmileCircle : SadCircle}
                      size={32}
                      color={dayColor}
                      accessibilityLabel={day.has_donation ? 'Donasi hari ini' : 'Belum donasi'}
                    />
                  </View>
                  <Text style={[styles.dayName, { color: isToday ? colors.neutral[900] : dayColor }]}>
                    {day.day_name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primary[200],
    overflow: 'hidden',
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  moreLink: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[700],
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    // gap: spacing.md,
  },
  medalIcon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    paddingTop: 18,
    // justifyContent: 'center',
    // left: -spacing.lg
  },
  medalText: {
    fontSize: 18,
    fontWeight: fontWeight.regular,
    color: colors.neutral[0],
  },
  streakContent: {
    flex: 1,
  },
  streakNumber: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  streakSubtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    fontWeight: fontWeight.regular,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  dayItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  iconCircle: {
    // width: 56,
    // height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 2,
    // borderStyle: 'dashed',
    backgroundColor: colors.neutral[0],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  iconCircleToday: {
    // borderWidth: 2,
  },
  dayName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
  },
});
