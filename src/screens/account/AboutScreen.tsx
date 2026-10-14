import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@/components/ui/Icon';
import {HandHeart} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {version as appVersion} from '../../../package.json';
import type {RootStackNavigationProp} from '@/types/navigation';
import {colors, spacing, radius, fontSize, lineHeight} from '@/theme';

export default function AboutScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <View style={styles.root}>
      <HeaderLight
        title="Tentang Aplikasi"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Icon icon={HandHeart} size={64} color={colors.primary[500]} />
        </View>
        <Text style={styles.version}>Versi {appVersion}</Text>
        <Text style={styles.description}>
          Aplikasi ini adalah platform donasi digital yang menghubungkan
          kebaikan para donatur dengan mereka yang membutuhkan. Kami
          berkomitmen menghadirkan pengalaman berdonasi yang mudah, aman, dan
          transparan bagi setiap pengguna.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  scroll: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  version: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.relaxed,
    color: colors.neutral[700],
    textAlign: 'center',
  },
});
