import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Share, GalleryRemove} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {
  ShareBottomSheet,
  type ShareOption,
} from '@/components/shared/ShareBottomSheet';
import {REFLECTION_CARD_ASPECT_RATIO} from '@/components/shared/ReflectionCard';
import {Button} from '@/components/ui/Button';
import {EmptyState} from '@/components/ui/EmptyState';
import {Icon} from '@/components/ui/Icon';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {useReflectionDetail} from '@/hooks/useReflectionDetail';
import {showToast} from '@/utils/toast';
import {colors, spacing, fontSize, lineHeight} from '@/theme';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';

const SHARE_OPTION_LABEL: Record<ShareOption, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  whatsapp: 'Whatsapp',
  'copy-url': 'Salin URL',
};

export default function ReflectionDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'RenunganDetail'>>();
  const {reflectionId} = route.params;

  const shareSheetRef = useRef<BottomSheetModal>(null);
  const [hasImageError, setHasImageError] = useState(false);

  const {reflection, isLoading, isNotFound, isConnectionError, retry} =
    useReflectionDetail(reflectionId);

  // Toast-nya sudah keluar dari queryCache onError; yang tersisa cuma keluar
  // dari screen yang isinya tidak akan pernah ada.
  useEffect(() => {
    if (isNotFound) {
      navigation.goBack();
    }
  }, [isNotFound, navigation]);

  function handleBack(): void {
    navigation.goBack();
  }

  function handleShare(): void {
    shareSheetRef.current?.present();
  }

  // Seluruh opsi ShareBottomSheet masih placeholder di codebase ini — cara
  // berbagi yang sebenarnya (share file gambar vs share link) diputuskan lewat
  // ADR-009, lihat docs/08-features/renungan/README.md.
  function handleSelectShareOption(option: ShareOption): void {
    shareSheetRef.current?.dismiss();
    showToast(
      `Fitur berbagi ke ${SHARE_OPTION_LABEL[option]} akan segera hadir.`,
    );
  }

  // Rasio asli dari API supaya tidak ada pergeseran layout setelah gambar
  // termuat; fallback ke rasio kartu di daftar kalau dimensinya tidak dikirim.
  const posterAspectRatio =
    reflection && reflection.imageWidth > 0 && reflection.imageHeight > 0
      ? reflection.imageWidth / reflection.imageHeight
      : REFLECTION_CARD_ASPECT_RATIO;

  function renderContent(): React.JSX.Element {
    if (isConnectionError) {
      return (
        <View style={styles.errorContainer}>
          <EmptyState
            icon={GalleryRemove}
            title="Renungan gagal dimuat"
            description="Periksa koneksi internet kamu, lalu coba lagi."
          />
          <Button label="Coba lagi" variant="secondary" onPress={retry} />
        </View>
      );
    }

    if (isLoading || !reflection) {
      return (
        <View style={styles.scrollContent}>
          <View style={[styles.poster, styles.posterPlaceholder]}>
            <ActivityIndicator color={colors.primary[500]} />
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {hasImageError ? (
          <View style={[styles.poster, styles.posterFallback]}>
            <Icon icon={GalleryRemove} size={32} color={colors.neutral[400]} />
            <Text style={styles.fallbackText}>Gambar tidak dapat dimuat</Text>
          </View>
        ) : (
          <Image
            source={{uri: reflection.imageUrl}}
            style={[styles.poster, {aspectRatio: posterAspectRatio}]}
            resizeMode="contain"
            onError={() => setHasImageError(true)}
            accessibilityLabel={reflection.title}
          />
        )}

        {reflection.title ? (
          <Text style={styles.title}>{reflection.title}</Text>
        ) : null}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight title="Bagikan Renungan" onBack={handleBack} />

      {renderContent()}

      {isConnectionError ? null : (
        <SafeAreaFooter>
          <Button
            label="Bagikan renungan"
            icon={Share}
            onPress={handleShare}
            isDisabled={isLoading || !reflection}
          />
        </SafeAreaFooter>
      )}

      <ShareBottomSheet
        ref={shareSheetRef}
        title="Bagikan Renungan"
        onSelectOption={handleSelectShareOption}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    gap: spacing.lg,
  },
  poster: {
    width: '100%',
    backgroundColor: colors.neutral[0],
  },
  posterPlaceholder: {
    aspectRatio: REFLECTION_CARD_ASPECT_RATIO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterFallback: {
    aspectRatio: REFLECTION_CARD_ASPECT_RATIO,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral[200],
  },
  fallbackText: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  title: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
    color: colors.neutral[700],
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
});
