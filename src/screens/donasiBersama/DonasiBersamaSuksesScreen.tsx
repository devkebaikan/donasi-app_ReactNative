import React, {useCallback} from 'react';
import {View, Text, Image, BackHandler, StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CheckCircle} from '@solar-icons/react-native/Linear';
import {
  Flag,
  UsersGroupTwoRounded,
  Share as ShareIcon,
} from '@solar-icons/react-native/Bold';
import {Icon} from '@/components/ui/Icon';
import {Button} from '@/components/ui/Button';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {DonasiBersamaSuksesScreenProps} from '@/types/navigation';

const COVER_SIZE = 160;

export default function DonasiBersamaSuksesScreen({
  route,
  navigation,
}: DonasiBersamaSuksesScreenProps): React.JSX.Element {
  const {groupId, groupName, targetAmount, coverImageUrl} = route.params;
  const insets = useSafeAreaInsets();

  function goToDetail(): void {
    navigation.replace('DonasiBersamaDetail', {groupId});
  }

  // Screen ini tidak punya tombol back di header, jadi tombol back perangkat
  // keras ditangani eksplisit — mengarah ke detail, bukan kembali ke form yang
  // sudah tidak relevan.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          navigation.replace('DonasiBersamaDetail', {groupId});
          return true;
        },
      );
      return () => subscription.remove();
    }, [navigation, groupId]),
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.content}>
        {coverImageUrl ? (
          <Image
            source={{uri: coverImageUrl}}
            style={styles.cover}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={`Foto grup ${groupName}`}
          />
        ) : (
          <View style={[styles.cover, styles.coverFallback]}>
            <Icon
              icon={UsersGroupTwoRounded}
              size={56}
              color={colors.primary[600]}
            />
          </View>
        )}

        <View style={styles.checkWrapper}>
          <Icon icon={CheckCircle} size={32} color={colors.semantic.success} />
        </View>

        <Text style={styles.title}>Alhamdulillah!</Text>
        <Text style={styles.title}>Grup Berhasil Dibuat</Text>
        <Text style={styles.subtitle}>
          Semoga langkah kecil ini menjadi wasilah kebaikan bagi sesama.
        </Text>

        <View style={styles.card}>
          {coverImageUrl ? (
            <Image
              source={{uri: coverImageUrl}}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.coverFallback]}>
              <Icon
                icon={UsersGroupTwoRounded}
                size={20}
                color={colors.primary[600]}
              />
            </View>
          )}
          <View style={styles.cardText}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {groupName}
            </Text>
            <View style={styles.targetRow}>
              <Icon icon={Flag} size={14} color={colors.primary[600]} />
              <Text style={styles.targetText}>
                {`Target: ${formatCurrency(targetAmount)}`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
        <Button
          label="Bagikan & Undang Teman"
          icon={ShareIcon}
          size="lg"
          onPress={() =>
            navigation.navigate('DonasiBersamaInvite', {groupId, groupName})
          }
        />
        <Button
          label="Lihat Detail Grup"
          variant="ghost"
          onPress={goToDetail}
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
    gap: spacing.xs,
  },
  cover: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
  },
  coverFallback: {
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkWrapper: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.xl,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary[800],
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  targetText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary[600],
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
