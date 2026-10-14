import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {InfoCircle, AltArrowRight} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

interface ProjectSalurInfoAlertProps {
  programTitle: string;
  onPress: () => void;
}

// Alert "Proyek ini bagian dari program {namaProgram}" — tap masuk ke
// DetailProgramScreen. Lihat detail-project-salur.md § "UI Layout".
export function ProjectSalurInfoAlert({
  programTitle,
  onPress,
}: ProjectSalurInfoAlertProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Proyek ini bagian dari program ${programTitle}, lihat detail program`}>
      <Icon icon={InfoCircle} size={18} color={colors.semantic.info} />
      <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
        Proyek ini bagian dari program{' '}
        <Text style={styles.programTitle}>{programTitle}</Text>
      </Text>
      <Icon icon={AltArrowRight} size={18} color={colors.semantic.info} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.semantic.infoLight,
  },
  text: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.neutral[700],
  },
  programTitle: {
    fontWeight: fontWeight.semiBold,
    color: colors.semantic.info,
  },
});
