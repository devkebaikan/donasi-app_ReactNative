import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  HandHeart,
  CardSearch,
  Sunrise,
  MoonStars,
  Heart,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {HeaderTransparent} from '@/components/shared/HeaderTransparent';
import {FloatingOrbs} from '@/components/shared/FloatingOrbs';
import {AccountMenuSection} from '@/components/shared/AccountMenuSection';
import {AccountMenuItem} from '@/components/shared/AccountMenuItem';
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
} from '@/theme';
import type {DonasiRutinJenisScreenProps} from '@/types/navigation';

// Pintu masuk donasi rutin. TIDAK ada gerbang login di sini — memilih jenis
// donasi boleh dilakukan siapa saja; login baru diminta di form
// (DonasiRutinSetupScreen). Lihat docs/08-features/donasi-rutin/README.md.
//
// Hero-nya memakai resep yang sama dengan daftar donasi rutin: gradient
// primary + FloatingOrbs, bukan gambar.
export default function DonasiRutinJenisScreen({
  navigation,
}: DonasiRutinJenisScreenProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroBlock}>
          <LinearGradient
            colors={[colors.primary[200], colors.primary[50], colors.neutral[50]]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.heroGradient}
          />
          <FloatingOrbs />

          <HeaderTransparent tone="dark" onBack={() => navigation.goBack()} />

          <View style={styles.hero}>
            <View style={styles.badge}>
              <Icon icon={Heart} size={14} color={colors.secondary[500]} />
              <Text style={styles.badgeText}>DONASI RUTIN</Text>
            </View>
            <Text style={styles.heroTitle}>
              Berbagi Kebaikan{'\n'}
              <Text style={styles.heroTitleAccent}>
                Setiap Hari, Tanpa Putus
              </Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Wujudkan pahala yang mengalir terus menerus dengan donasi rutin
              otomatis dari Saku Berbagimu
            </Text>
          </View>
        </View>

        <View style={styles.sections}>
          <AccountMenuSection title="PILIH UNTUK SAYA">
            <AccountMenuItem
              icon={HandHeart}
              iconTone="circle"
              label="Pilih Tujuan Donasi Rutin"
              description="Donasi rutin ke program yang dipilihkan Aksiberbagi.com untuk Anda"
              onPress={() =>
                navigation.navigate('DonasiRutinSetup', {intent: 'pilihan'})
              }
            />
            <AccountMenuItem
              icon={CardSearch}
              iconTone="circle"
              label="Pilih Program Sendiri"
              description="Cari program kebaikan yang akan ditambahkan ke dalam donasi rutin"
              onPress={() => navigation.navigate('DonasiRutinProgram')}
            />
          </AccountMenuSection>

          <AccountMenuSection title="KATEGORI PILIHAN">
            <AccountMenuItem
              icon={Sunrise}
              iconTone="circle"
              label="Donasi Tiap Subuh"
              description="Awali hari anda dengan keberkahan donasi rutin tiap Subuh"
              onPress={() =>
                navigation.navigate('DonasiRutinSetup', {intent: 'subuh'})
              }
            />
            <AccountMenuItem
              icon={MoonStars}
              iconTone="circle"
              label="Donasi Tiap Jum'at"
              description="Jangan sampai ketinggalan keberkahan donasi di hari terbaik"
              onPress={() =>
                navigation.navigate('DonasiRutinSetup', {intent: 'jumat'})
              }
            />
          </AccountMenuSection>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    paddingBottom: spacing['2xl'],
  },
  heroBlock: {
    overflow: 'hidden',
    paddingBottom: spacing.xl,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[0],
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.neutral[700],
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  },
  heroTitleAccent: {
    color: colors.primary[700],
  },
  heroSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[600],
  },
  sections: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
});
