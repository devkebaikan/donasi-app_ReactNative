import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Button} from '@/components/ui/Button';
import {colors, spacing, fontSize, fontWeight} from '@/theme';

interface InfoTerkiniCardProps {
  organizationName: string;
  onPressSelengkapnya: () => void;
}

export function InfoTerkiniCard({
  organizationName,
  onPressSelengkapnya,
}: InfoTerkiniCardProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.textWrapper}>
        <Text style={styles.label}>Dapatkan Info Terkini dari</Text>
        <Text style={styles.organizationName} numberOfLines={1}>
          {organizationName}
        </Text>
      </View>
      <Button label="Selengkapnya" size="xs" onPress={onPressSelengkapnya} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[1000],
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.neutral[300],
  },
  organizationName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
});
