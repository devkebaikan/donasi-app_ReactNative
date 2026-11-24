import React, {forwardRef, useCallback, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  Share as ShareIconLinear,
  CheckCircle,
  Copy,
  CloseCircle,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight, shadows} from '@/theme';

export type ShareOption = 'facebook' | 'twitter' | 'whatsapp' | 'copy-url';

interface ShareBottomSheetProps {
  title?: string;
  subtitle?: string;
  programTitle?: string;
  programImageUrl?: string;
  shareUrl?: string;
  onSelectOption?: (option: ShareOption) => void;
}

export const ShareBottomSheet = forwardRef<
  BottomSheetModal,
  ShareBottomSheetProps
>(function ShareBottomSheetComponent(
  {
    title = 'Bagikan Kebaikan',
    subtitle = 'Ajak kerabat dan teman untuk berbuat kebaikan bersama',
    programTitle = 'Program Kebaikan',
    programImageUrl,
    shareUrl = 'https://beramalbersama.com',
    onSelectOption,
  },
  ref,
): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [isCopied, setIsCopied] = useState(false);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  function handleClose(): void {
    if (typeof ref === 'function' || !ref?.current) {
      return;
    }
    ref.current.dismiss();
  }

  async function handleCopy(): Promise<void> {
    Clipboard.setString(shareUrl);
    setIsCopied(true);
    showToast('Tautan berhasil disalin ke clipboard');
    onSelectOption?.('copy-url');

    setTimeout(() => {
      setIsCopied(false);
    }, 2500);
  }

  function handleShareWhatsapp(): void {
    const message = `*${programTitle}*\nMari bantu dan berdonasi bersama melalui link kebaikan berikut:\n${shareUrl}`;
    const waUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(waUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(waUrl);
        }
        return Linking.openURL(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
        );
      })
      .catch(() => {
        Linking.openURL(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
        );
      });
    onSelectOption?.('whatsapp');
  }

  function handleShareFacebook(): void {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl,
    )}`;
    Linking.openURL(fbUrl).catch(() => {
      showToast('Tidak dapat membuka Facebook');
    });
    onSelectOption?.('facebook');
  }

  function handleShareInstagram(): void {
    Clipboard.setString(shareUrl);
    showToast('Link disalin! Buka Instagram untuk berbagi di Story atau DM');
    Linking.openURL('instagram://app').catch(() => {
      Linking.openURL('https://www.instagram.com/');
    });
    onSelectOption?.('copy-url');
  }

  function handleShareX(): void {
    const xMsg = `${programTitle} - Mari bersama bantu sesama:`;
    const xUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(
      shareUrl,
    )}&text=${encodeURIComponent(xMsg)}`;
    Linking.openURL(xUrl).catch(() => {
      showToast('Tidak dapat membuka X');
    });
    onSelectOption?.('twitter');
  }

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['58%']}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}>
      <BottomSheetView
        style={[styles.container, {paddingBottom: insets.bottom + spacing.md}]}>
        {/* Header Modal */}
        <View style={styles.header}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <TouchableOpacity
            testID="share-sheet-close-button"
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Tutup">
            <Icon icon={CloseCircle} size={22} color={colors.neutral[400]} />
          </TouchableOpacity>
        </View>

        {/* Preview Ringkas Konten yang Dibagikan */}
        <View style={styles.previewCard}>
          {programImageUrl ? (
            <Image
              source={{uri: programImageUrl}}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.previewIconBox}>
              <Icon
                icon={ShareIconLinear}
                size={20}
                color={colors.primary[600]}
              />
            </View>
          )}
          <View style={styles.previewTextGroup}>
            <Text style={styles.previewTitle} numberOfLines={1}>
              {programTitle}
            </Text>
            <Text style={styles.previewUrl} numberOfLines={1}>
              {shareUrl}
            </Text>
          </View>
        </View>

        {/* Pilihan Platform Bagikan */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionLabel}>BAGIKAN KE</Text>

          <View style={styles.platformsRow}>
            {/* WhatsApp */}
            <TouchableOpacity
              testID="share-sheet-item-whatsapp"
              style={styles.platformItem}
              onPress={handleShareWhatsapp}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="WhatsApp">
              <View style={[styles.platformIconCircle, styles.bgWhatsapp]}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="#FFFFFF">
                  <Path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </Svg>
              </View>
              <Text style={styles.platformLabel}>WhatsApp</Text>
            </TouchableOpacity>

            {/* Facebook */}
            <TouchableOpacity
              testID="share-sheet-item-facebook"
              style={styles.platformItem}
              onPress={handleShareFacebook}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Facebook">
              <View style={[styles.platformIconCircle, styles.bgFacebook]}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="#FFFFFF">
                  <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </Svg>
              </View>
              <Text style={styles.platformLabel}>Facebook</Text>
            </TouchableOpacity>

            {/* Instagram */}
            <TouchableOpacity
              testID="share-sheet-item-instagram"
              style={styles.platformItem}
              onPress={handleShareInstagram}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Instagram">
              <LinearGradient
                colors={['#f09433', '#dc2743', '#bc1888']}
                start={{x: 0, y: 1}}
                end={{x: 1, y: 0}}
                style={styles.platformIconCircle}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="#FFFFFF">
                  <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </Svg>
              </LinearGradient>
              <Text style={styles.platformLabel}>Instagram</Text>
            </TouchableOpacity>

            {/* X (Twitter) */}
            <TouchableOpacity
              testID="share-sheet-item-twitter"
              style={styles.platformItem}
              onPress={handleShareX}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="X">
              <View style={[styles.platformIconCircle, styles.bgX]}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="#FFFFFF">
                  <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </Svg>
              </View>
              <Text style={styles.platformLabel}>X</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Salin Tautan */}
        <View style={styles.copySection}>
          <Text style={styles.copyLabel}>Salin Tautan</Text>
          <View style={styles.copyInputContainer}>
            <Text style={styles.copyInputText} numberOfLines={1}>
              {shareUrl}
            </Text>
            <TouchableOpacity
              testID="share-sheet-item-copy-url"
              style={[
                styles.copyButton,
                isCopied ? styles.copyButtonSuccess : styles.copyButtonDefault,
              ]}
              onPress={handleCopy}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Salin link">
              <Icon
                icon={isCopied ? CheckCircle : Copy}
                size={14}
                color={colors.neutral[0]}
              />
              <Text style={styles.copyButtonText}>
                {isCopied ? 'Tersalin!' : 'Salin'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius['2xl'],
  },
  handleIndicator: {
    backgroundColor: colors.neutral[300],
    width: 44,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    padding: spacing.sm,
    backgroundColor: colors.neutral[50],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  previewImage: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  previewIconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTextGroup: {
    flex: 1,
    minWidth: 0,
  },
  previewTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[800],
  },
  previewUrl: {
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 2,
  },
  sectionGroup: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[400],
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  platformsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  platformItem: {
    alignItems: 'center',
    gap: 6,
    width: 68,
  },
  platformIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  bgWhatsapp: {
    backgroundColor: '#25D366',
  },
  bgFacebook: {
    backgroundColor: '#1877F2',
  },
  bgX: {
    backgroundColor: '#111827',
  },
  platformLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  copySection: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  copyLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
    marginBottom: 6,
  },
  copyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.lg,
    padding: 4,
    paddingLeft: spacing.md,
  },
  copyInputText: {
    flex: 1,
    fontSize: 11,
    color: colors.neutral[700],
    fontFamily: 'Courier',
    marginRight: spacing.sm,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
  },
  copyButtonDefault: {
    backgroundColor: colors.primary[500],
  },
  copyButtonSuccess: {
    backgroundColor: colors.semantic.success,
  },
  copyButtonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
});
