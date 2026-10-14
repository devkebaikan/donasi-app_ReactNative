import React, {useRef} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Heart} from '@solar-icons/react-native/Bold';
import {Heart as HeartLinear, FileText, Share} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {Avatar} from '@/components/ui/Avatar';
import {EmptyState} from '@/components/ui/EmptyState';
import {HeaderTransparent} from '@/components/shared/HeaderTransparent';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {HtmlContent} from '@/components/shared/HtmlContent';
import {ShareBottomSheet, type ShareOption} from '@/components/shared/ShareBottomSheet';
import {useNewsDetail, NEWS_DETAIL_IMAGE_HEIGHT} from '@/hooks/useNewsDetail';
import {useAuthStore} from '@/stores/authStore';
import {showToast} from '@/utils/toast';
import {formatRelativeTime} from '@/utils/formatRelativeTime';
import {colors, spacing, radius, fontSize, fontWeight, lineHeight} from '@/theme';
import type {NewsDetailScreenProps, RootStackNavigationProp} from '@/types/navigation';

const SHARE_OPTION_LABEL: Record<ShareOption, string> = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  whatsapp: 'Whatsapp',
  'copy-url': 'Salin URL',
};

export default function NewsDetailScreen({
  route,
}: NewsDetailScreenProps): React.JSX.Element {
  const {articleId} = route.params;
  const navigation = useNavigation<RootStackNavigationProp>();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const shareSheetRef = useRef<BottomSheetModal>(null);

  const {
    article,
    isLoading,
    isNotFound,
    isHeaderCollapsed,
    isLiking,
    handleScroll,
    toggleLike,
  } = useNewsDetail(articleId, isAuthenticated);

  function handleBack(): void {
    navigation.goBack();
  }

  function handlePressShare(): void {
    shareSheetRef.current?.present();
  }

  function handleSelectShareOption(option: ShareOption): void {
    shareSheetRef.current?.dismiss();
    showToast(`Fitur berbagi ke ${SHARE_OPTION_LABEL[option]} akan segera hadir.`);
  }

  function handlePressLike(): void {
    if (!isAuthenticated) {
      navigation.navigate('Login', {
        redirectTo: {screen: 'NewsDetail', params: {articleId}},
      });
      return;
    }
    toggleLike();
  }

  const shareButton = (
    <TouchableOpacity
      style={styles.headerIconButton}
      onPress={handlePressShare}
      accessibilityRole="button"
      accessibilityLabel="Bagikan berita">
      <Icon
        icon={Share}
        size={22}
        color={isHeaderCollapsed ? colors.neutral[900] : colors.neutral[0]}
      />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator color={colors.primary[500]} />
      </View>
    );
  }

  if (isNotFound || !article) {
    return (
      <View style={styles.container}>
        <HeaderLight title="Detail Berita" onBack={handleBack} />
        <EmptyState
          icon={FileText}
          title="Berita tidak tersedia"
          description="Berita yang kamu cari tidak ditemukan atau sudah tidak tersedia."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerOverlay}>
        {isHeaderCollapsed ? (
          <HeaderLight
            title={article.title}
            onBack={handleBack}
            rightSlot={shareButton}
          />
        ) : (
          <HeaderTransparent onBack={handleBack} rightSlot={shareButton} />
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}>
        <Image
          source={{uri: article.coverImageUrl}}
          style={styles.coverImage}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={article.title}
        />

        <View style={styles.content}>
          {article.partner ? (
            <View style={styles.partnerRow}>
              <Avatar uri={article.partner.logoUrl} name={article.partner.name} size={32} />
              <Text style={styles.partnerName}>{article.partner.name}</Text>
            </View>
          ) : null}

          <Text style={styles.title}>{article.title}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {formatRelativeTime(article.publishedAt)}
            </Text>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={handlePressLike}
              disabled={isLiking}
              accessibilityRole="button"
              accessibilityLabel={
                article.isLiked ? 'Batal sukai berita ini' : 'Sukai berita ini'
              }
              accessibilityState={{selected: article.isLiked}}>
              <Icon
                icon={article.isLiked ? Heart : HeartLinear}
                size={18}
                color={article.isLiked ? colors.secondary[500] : colors.neutral[400]}
              />
              <Text style={[styles.metaText, article.isLiked && styles.likeTextActive]}>
                {article.likeCount} suka
              </Text>
            </TouchableOpacity>
          </View>

          {article.content ? (
            <HtmlContent html={article.content} />
          ) : (
            <Text style={styles.fallbackText}>Konten tidak tersedia.</Text>
          )}
        </View>
      </ScrollView>

      {/* Fade dekoratif — indikasi isi berita masih berlanjut di bawah */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0)', colors.neutral[0]]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={styles.bottomFade}
        pointerEvents="none"
      />

      <ShareBottomSheet
        ref={shareSheetRef}
        title="Bagikan Berita"
        onSelectOption={handleSelectShareOption}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing['2xl'],
  },
  coverImage: {
    width: '100%',
    height: NEWS_DETAIL_IMAGE_HEIGHT,
    backgroundColor: colors.neutral[200],
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    backgroundColor: colors.neutral[0],
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  partnerName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[700],
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  likeTextActive: {
    color: colors.secondary[500],
    fontWeight: fontWeight.semiBold,
  },
  fallbackText: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
  },
});
