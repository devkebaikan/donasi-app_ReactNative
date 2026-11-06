import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppLogo} from '@/components/ui/AppLogo';
import {SearchBar} from '@/components/ui/SearchBar';
import {colors, spacing} from '@/theme';

interface MyDonationsTopBarProps {
  onPressSearch: () => void;
  isScrolled?: boolean;
}

export function MyDonationsTopBar({
  onPressSearch,
  isScrolled = false,
}: MyDonationsTopBarProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.wrapper}>
      {isScrolled ? (
        <View style={[StyleSheet.absoluteFill, styles.solidBackground]} />
      ) : (
        <View style={[StyleSheet.absoluteFill]} />
        // <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={16} />
      )}

      <View style={[styles.content, {paddingTop: insets.top + spacing.md}]}>
        <AppLogo size={36} />
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Cari Program Kebaikan.."
            onPress={onPressSearch}
            // backgroundColor={isScrolled ? colors.neutral[0] : glass.tint}
            backgroundColor={isScrolled ? colors.neutral[100] : colors.neutral[0]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  solidBackground: {
    backgroundColor: colors.neutral[0],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchWrapper: {
    flex: 1,
  },
});
