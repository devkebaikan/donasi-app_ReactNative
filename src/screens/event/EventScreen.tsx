import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Confetti, GalleryRemove, Share} from '@solar-icons/react-native/Linear';
import {HeaderTransparent} from '@/components/shared/HeaderTransparent';
import {
  ShareBottomSheet,
  type ShareOption,
} from '@/components/shared/ShareBottomSheet';
import {Button} from '@/components/ui/Button';
import {EmptyState} from '@/components/ui/EmptyState';
import {Icon} from '@/components/ui/Icon';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {useEvent} from '@/hooks/useEvent';
import {openExternalUrl} from '@/utils/openExternalUrl';
import {showToast} from '@/utils/toast';
import {colors, spacing, fontSize} from '@/theme';
import type {RootStackNavigationProp} from '@/types/navigation';

const SHARE_OPTION_LABEL: Record<ShareOption, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  whatsapp: 'Whatsapp',
  'copy-url': 'Salin URL',
};

const DEFAULT_CTA_LABEL = 'Daftar Sekarang';

export default function EventScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();

  const shareSheetRef = useRef<BottomSheetModal>(null);
  const [hasImageError, setHasImageError] = useState(false);

  const {event, isLoading, isConnectionError, retry} = useEvent();

  function handleBack(): void {
    navigation.goBack();
  }

  function handleShare(): void {
    shareSheetRef.current?.present();
  }

  // Seluruh opsi ShareBottomSheet masih placeholder di codebase ini — cara
  // berbagi yang sebenarnya diputuskan lewat ADR-009 di menu Renungan,
  // lihat docs/08-features/event/event.md.
  function handleSelectShareOption(option: ShareOption): void {
    shareSheetRef.current?.dismiss();
    showToast(
      `Fitur berbagi ke ${SHARE_OPTION_LABEL[option]} akan segera hadir.`,
    );
  }

  async function handleRegister(): Promise<void> {
    if (!event) {
      return;
    }
    await openExternalUrl(event.registrationUrl);
  }

  const ctaLabel = event?.ctaLabel ? event.ctaLabel : DEFAULT_CTA_LABEL;

  // Tombol daftar tidak dirender kalau tautannya kosong — tombol mati tanpa
  // penjelasan lebih membingungkan daripada tidak ada tombol sama sekali.
  const hasRegistrationUrl = Boolean(event?.registrationUrl);

  // Poster benar-benar menutupi layar hanya saat datanya ada dan gambarnya
  // tidak gagal dimuat — dipakai menentukan tone header dan warna ikonnya.
  const hasPoster = Boolean(event) && !hasImageError;

  const shareButton = (
    <TouchableOpacity
      style={styles.headerIconButton}
      onPress={handleShare}
      accessibilityRole="button"
      accessibilityLabel="Bagikan event">
      <Icon
        icon={Share}
        size={22}
        // Ikut tone header: putih di atas poster, gelap di atas latar terang.
        color={hasPoster ? colors.neutral[0] : colors.primary[700]}
      />
    </TouchableOpacity>
  );

  // Poster mengisi SELURUH layar sebagai latar (absoluteFill + cover), bukan
  // elemen dalam aliran layout — header dan tombol daftar mengambang di
  // atasnya, persis seperti design.
  function renderBackground(): React.JSX.Element | null {
    if (isConnectionError) {
      return (
        <View style={styles.stateContainer}>
          <EmptyState
            icon={Confetti}
            title="Event gagal dimuat"
            description="Periksa koneksi internet kamu, lalu coba lagi."
          />
          <Button label="Coba Lagi" variant="secondary" onPress={retry} />
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={[StyleSheet.absoluteFill, styles.centered]}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      );
    }

    if (!event) {
      return (
        <View style={styles.stateContainer}>
          <EmptyState
            icon={Confetti}
            title="Belum Ada Event"
            description="Event baru akan muncul di sini."
          />
        </View>
      );
    }

    if (hasImageError) {
      return (
        <View style={[StyleSheet.absoluteFill, styles.centered]}>
          <Icon icon={GalleryRemove} size={32} color={colors.neutral[400]} />
          <Text style={styles.fallbackText}>Gambar tidak dapat dimuat</Text>
        </View>
      );
    }

    return (
      <Image
        source={{uri: event.posterUrl}}
        style={StyleSheet.absoluteFill}
        // cover, bukan contain: poster menutupi layar penuh tanpa bidang
        // kosong di sisi mana pun. Bagian yang terpotong hanya tepi gambar.
        resizeMode="cover"
        onError={() => setHasImageError(true)}
        // Seluruh teks event ada di dalam poster dan tidak terbaca screen
        // reader — judul dari API yang menggantikannya di sini.
        accessibilityLabel={event.title}
      />
    );
  }

  return (
    <View style={styles.container}>
      {renderBackground()}

      {/* Header dan footer mengambang di atas poster — poster tetap utuh dari
          ujung atas sampai ujung bawah layar. */}
      <View style={styles.headerOverlay}>
        {/* Poster bisa terang atau gelap di bagian atas — scrim tipis ini yang
            menjaga tombol back dan bagikan tetap terbaca di keduanya. */}
        {hasPoster ? <View style={styles.headerScrim} /> : null}
        <HeaderTransparent
          onBack={handleBack}
          tone={hasPoster ? 'light' : 'dark'}
          rightSlot={event ? shareButton : undefined}
        />
      </View>

      <View style={styles.spacer} />

      {event && hasRegistrationUrl ? (
        <SafeAreaFooter withBorder={false} style={styles.footer}>
          <Button
            label={ctaLabel}
            onPress={handleRegister}
            accessibilityLabel={`${ctaLabel} — ${event.title}`}
          />
        </SafeAreaFooter>
      ) : null}

      <ShareBottomSheet
        ref={shareSheetRef}
        title="Bagikan Event"
        onSelectOption={handleSelectShareOption}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.neutral[1000],
    opacity: 0.25,
  },
  // Mendorong footer ke bawah tanpa menutupi poster di belakangnya.
  spacer: {
    flex: 1,
  },
  footer: {
    backgroundColor: 'transparent',
  },
  stateContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.neutral[100],
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral[100],
  },
  fallbackText: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
