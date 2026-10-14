import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {Widget} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

export interface MenuItem {
  id: number;
  name: string;
  image_url: string;
  screen: string;
  is_new?: boolean;
}

// Baris ini SELALU 4 sel, tidak pernah lebih. Kalau API mengirim lebih dari 4
// menu, sel keempat berubah jadi "Lainnya" (jadi cuma 3 menu yang tampil) dan
// sisanya dibuka lewat bottom sheet — pola yang sama dengan kategori program
// di DonationCategoryGrid.
const MAX_TILES = 4;

interface MenuUtamaGridProps {
  items?: MenuItem[];
  onPressItem: (screen: string) => void;
  onPressMore?: () => void;
}

export function MenuUtamaGrid({
  items = [],
  onPressItem,
  onPressMore,
}: MenuUtamaGridProps): React.JSX.Element {
  if (!items || items.length === 0) {
    return <View />;
  }

  const hasMore = items.length > MAX_TILES;
  const displayItems = items.slice(0, hasMore ? MAX_TILES - 1 : MAX_TILES);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {displayItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => onPressItem(item.screen)}
            accessibilityRole="button"
            accessibilityLabel={item.name}>
            <View style={styles.iconContainer}>
              <Image
                source={{uri: item.image_url}}
                style={styles.icon}
                resizeMode="contain"
              />
              {item.is_new && <View style={styles.badge}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>}
            </View>
            <Text style={styles.label}>{item.name}</Text>
          </TouchableOpacity>
        ))}
        {hasMore && (
          <TouchableOpacity
            style={styles.item}
            onPress={onPressMore}
            accessibilityRole="button"
            accessibilityLabel="Lainnya">
            <View style={[styles.iconContainer, styles.moreContainer]}>
              <Icon icon={Widget} size={28} color={colors.primary[600]} />
            </View>
            <Text style={styles.label}>Lainnya</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    width: 48,
    height: 48,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.secondary[500],
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.neutral[0],
  },
  moreContainer: {
    backgroundColor: colors.primary[100],
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
    textAlign: 'center',
  },
});
