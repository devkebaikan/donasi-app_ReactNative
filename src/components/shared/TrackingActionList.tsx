import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {AltArrowRight, ChatRoundLine, HandHeart} from '@solar-icons/react-native/Linear';
import {Icon, type SolarIconComponent} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

// Action — bukan sticky bottom, dirender langsung di bawah Detail
// Pembayaran (bukan floating footer).
interface TrackingActionListProps {
  onPressButuhBantuan: () => void;
  onPressDonasiKeProgramLain: () => void;
}

export function TrackingActionList({
  onPressButuhBantuan,
  onPressDonasiKeProgramLain,
}: TrackingActionListProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ActionRow
        icon={ChatRoundLine}
        label="Butuh Bantuan"
        accentColor={colors.semantic.error}
        accentBackground={colors.semantic.errorLight}
        onPress={onPressButuhBantuan}
      />
      <ActionRow
        icon={HandHeart}
        label="Donasi ke Program Lain"
        accentColor={colors.semantic.success}
        accentBackground={colors.semantic.successLight}
        onPress={onPressDonasiKeProgramLain}
      />
    </View>
  );
}

function ActionRow({
  icon,
  label,
  accentColor,
  accentBackground,
  onPress,
}: {
  icon: SolarIconComponent;
  label: string;
  accentColor: string;
  accentBackground: string;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.row, {borderColor: accentColor}]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconWrapper, {backgroundColor: accentBackground}]}>
          <Icon icon={icon} size={18} color={accentColor} />
        </View>
        <Text style={[styles.label, {color: accentColor}]}>{label}</Text>
      </View>
      <Icon icon={AltArrowRight} size={18} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    padding: spacing.md,
    borderRadius: radius.lg,
    // Ketebalan border disamakan dengan standar app (ProjectSalurTerdekatSection),
    // warnanya (border, icon, teks) di-override per baris lewat prop
    // `accentColor` — merah untuk "Butuh Bantuan", hijau untuk "Donasi ke
    // Program Lain".
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[0],
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
  },
});
