import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {KiblatCompass} from '@/components/shared/KiblatCompass';
import {KiblatNeedle} from '@/components/shared/KiblatNeedle';
import {KaabaMark} from '@/components/shared/KaabaMark';
import {KiblatCalibrationSheet} from '@/components/shared/KiblatCalibrationSheet';
import {useKiblat} from '@/hooks/useKiblat';
import {colors, fontWeight, fontSize, radius, spacing} from '@/theme';

const COMPASS_SIZE = 280;

export default function KiblatScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const {
    location,
    isDefaultLocation,
    bearing,
    heading,
    compassStatus,
    isCalibrationOpen,
    openCalibration,
    closeCalibration,
  } = useKiblat();

  // Piringan diputar berlawanan arah hadap perangkat, sehingga Utara di
  // piringan selalu menunjuk utara sungguhan. Penunjuk kiblat memakai selisih
  // bearing dengan arah hadap, jadi ia tetap mengunci ke Ka'bah.
  //
  // Keduanya membaca shared value langsung di UI thread — tanpa withTiming,
  // karena nilainya sudah dihaluskan di sumbernya dan animasi bertahap di atas
  // aliran sensor justru membuat piringan tertinggal.
  const dialStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${-heading.value}deg`}],
  }));
  const needleStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${bearing - heading.value}deg`}],
  }));

  const roundedBearing = Math.round(bearing);

  return (
    <View style={styles.root}>
      <HeaderLight title="Arah Kiblat" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.locationGroup}>
          <Text style={styles.locationCaption}>Arah kiblat untuk</Text>
          <Text style={styles.locationName}>{location.name}</Text>
          {isDefaultLocation ? (
            <Text style={styles.defaultNote}>
              Dihitung dari lokasi default. Atur lokasi di Pengaturan.
            </Text>
          ) : null}
        </View>

        <View
          style={styles.compassArea}
          accessibilityRole="image"
          accessibilityLabel={`Arah kiblat ${roundedBearing} derajat dari utara`}>
          <Animated.View style={dialStyle}>
            <KiblatCompass size={COMPASS_SIZE} />
          </Animated.View>

          <Animated.View
            style={[StyleSheet.absoluteFill, needleStyle]}
            pointerEvents="none">
            <KiblatNeedle size={COMPASS_SIZE} />
          </Animated.View>

          <View style={styles.centerMark} pointerEvents="none">
            <KaabaMark size={40} />
          </View>
        </View>

        <View style={styles.bearingGroup}>
          <Text style={styles.bearing}>{roundedBearing}°</Text>
          <Text style={styles.bearingCaption}>Dari arah Utara</Text>
        </View>

        {compassStatus === 'unavailable' ? (
          <Text style={styles.sensorNote}>
            Kompas tidak tersedia di perangkat ini. Arah kiblat{' '}
            {roundedBearing}° dari utara.
          </Text>
        ) : null}

        <View style={styles.helpGroup}>
          <Text style={styles.helpText}>
            Pastikan smartphone anda dalam posisi horizontal
          </Text>
          <TouchableOpacity
            style={styles.calibrationButton}
            onPress={openCalibration}
            accessibilityRole="button"
            accessibilityLabel="Kompas tidak akurat? Sentuh untuk mengkalibrasi">
            <Text style={styles.helpText}>
              Kompas tidak akurat? sentuh untuk mengkalibrasi
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <KiblatCalibrationSheet
        isOpen={isCalibrationOpen}
        onClose={closeCalibration}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    gap: spacing.xl,
  },
  locationGroup: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationCaption: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.md,
    color: colors.neutral[500],
  },
  locationName: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.xl,
    textAlign: 'center',
    color: colors.neutral[900],
  },
  defaultNote: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
    color: colors.neutral[500],
  },
  compassArea: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMark: {
    position: 'absolute',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
  },
  bearingGroup: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  bearing: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize['3xl'],
    color: colors.primary[700],
  },
  bearingCaption: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.lg,
    color: colors.neutral[600],
  },
  sensorNote: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
    color: colors.neutral[500],
  },
  helpGroup: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 'auto',
  },
  helpText: {
    fontWeight: fontWeight.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
    color: colors.neutral[400],
  },
  calibrationButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
});
