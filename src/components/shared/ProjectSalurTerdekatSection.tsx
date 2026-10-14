import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {AltArrowRight} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {formatDate} from '@/utils/formatDate';
import {
  PROJECT_SALUR_STATUS_LABEL,
  PROJECT_SALUR_STATUS_COLOR,
} from '@/utils/projectSalurStatus';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {ProjectSalurTerdekat} from '@/types/programDetail';

interface ProjectSalurTerdekatSectionProps {
  items: ProjectSalurTerdekat[];
  // Tombol panah kanan tiap item — navigasi ke DetailProjectSalurScreen.
  // Item di section ini SENGAJA tidak punya link teks "Lihat Detail Project
  // Salur" seperti kartu project salur lain (tab Project Salur/
  // AllProjectSalurScreen) — tombol panah ini yang jadi satu-satunya entry
  // point, lihat detail-project-salur.md § "Perubahan Perilaku — Tombol
  // Panah 'Project Salur Terdekat'".
  onPressNext: (projectSalurId: string) => void;
}

export function ProjectSalurTerdekatSection({
  items,
  onPressNext,
}: ProjectSalurTerdekatSectionProps): React.JSX.Element | null {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Salur Terdekat</Text>
      <View style={styles.list}>
        {items.map(item => {
          const statusColor = PROJECT_SALUR_STATUS_COLOR[item.status];
          return (
            <View key={item.id} style={styles.item}>
              <Image
                source={{uri: item.mitra.photoUrl}}
                style={styles.avatar}
                resizeMode="cover"
                accessibilityRole="image"
                accessibilityLabel={`Logo ${item.mitra.name}`}
              />
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.date}>{formatDate(item.distributedAt)}</Text>
                  <View style={[styles.badge, {backgroundColor: statusColor.bg}]}>
                    <Text style={[styles.badgeText, {color: statusColor.text}]}>
                      {PROJECT_SALUR_STATUS_LABEL[item.status]}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => onPressNext(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Lihat detail project salur ${item.title}`}>
                <Icon icon={AltArrowRight} size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.neutral[200],
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  nextButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
