import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CheckCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {Button} from '@/components/ui/Button';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DonasiRutinSuksesScreenProps} from '@/types/navigation';
import type {RecurringFrequency} from '@/types/recurringDonation';

const FREQUENCY_LABEL: Record<RecurringFrequency, string> = {
  harian: 'Harian',
  mingguan: 'Mingguan',
  bulanan: 'Bulanan',
};

export default function DonasiRutinSuksesScreen({
  route,
  navigation,
}: DonasiRutinSuksesScreenProps): React.JSX.Element {
  const {programTitle, amount, frequency} = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Icon icon={CheckCircle} size={56} color={colors.semantic.success} />
        </View>
        <Text style={styles.title}>Donasi Rutin Berhasil Diatur</Text>
        <Text style={styles.subtitle}>
          Donasi otomatis untuk program "{programTitle}" telah aktif
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Nominal</Text>
            <Text style={styles.value}>{formatCurrency(amount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Frekuensi</Text>
            <Text style={styles.value}>{FREQUENCY_LABEL[frequency]}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
        <Button
          label="Kembali ke Beranda"
          onPress={() => navigation.reset({index: 0, routes: [{name: 'Home'}]})}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconWrapper: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  card: {
    width: '100%',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  value: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  footer: {
    padding: spacing.lg,
  },
});
