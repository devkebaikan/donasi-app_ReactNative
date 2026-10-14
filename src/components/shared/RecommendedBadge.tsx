import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Bookmark, Star} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {colors, radius, spacing, shadows} from '@/theme';

const BOOKMARK_SIZE = 18;
const STAR_SIZE = 8;

// Solar tidak punya satu icon "bookmark berbintang", jadi disusun tiga lapis:
// pita bookmark (Bold) -> kotak hijau penutup garis putih bawaan icon-nya ->
// bintang putih di paling atas.
export function RecommendedBadge(): React.JSX.Element {
  return (
    <View style={styles.badge} accessibilityLabel="Rekomendasi">
      <View style={styles.iconStack}>
        <Icon icon={Bookmark} size={BOOKMARK_SIZE} color={colors.primary[500]} />
        {/* Icon Bookmark bawaan Solar punya garis putih melintang di badan
            pita. Kotak sewarna pita ini menutupnya, lalu bintang ditaruh di
            atasnya. paddingBottom di overlay mendorong keduanya ke badan pita
            — bagian bawah pita adalah takik, bukan bidang isi. */}
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.lineCover} />
        </View>
        <View style={styles.overlay} pointerEvents="none">
          <Icon icon={Star} size={STAR_SIZE} color={colors.neutral[0]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  iconStack: {
    width: BOOKMARK_SIZE,
    height: BOOKMARK_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  lineCover: {
    width: 11,
    height: 7,
    borderRadius: 1,
    backgroundColor: colors.primary[500],
  },
});
