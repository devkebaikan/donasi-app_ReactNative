import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {
  Buildings,
  CalculatorMinimalistic,
  ChatRoundDots,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {ProgramCard} from '@/components/shared/ProgramCard';
import {EmptyState} from '@/components/ui/EmptyState';
import {useZakat} from '@/hooks/useZakat';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {ZakatScreenProps} from '@/types/navigation';
import type {Program} from '@/types/program';

export default function ZakatScreen({
  navigation,
}: ZakatScreenProps): React.JSX.Element {
  const {programs, isLoading, isRefreshing, refresh} = useZakat();

  function handleBack(): void {
    navigation.goBack();
  }

  function handlePressKalkulator(): void {
    navigation.navigate('ZakatKalkulator');
  }

  function handlePressAmilZakat(): void {
    showToast('Segera hadir');
  }

  function handlePressProgram(program: Program): void {
    navigation.navigate('DetailProgram', {link: program.link || String(program.id)});
  }

  return (
    <View style={styles.container}>
      <HeaderLight
        title="Zakat"
        onBack={handleBack}
        // rightSlot={
        //   <TouchableOpacity
        //     style={styles.konsultasiButton}
        //     onPress={handlePressKonsultasi}
        //     accessibilityRole="button"
        //     accessibilityLabel="Konsultasi zakat">
        //     <Icon icon={ChatRoundDots} size={18} color={colors.primary[600]} />
        //     <Text style={styles.konsultasiText}>Konsultasi</Text>
        //   </TouchableOpacity>
        // }
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={colors.primary[500]}
              colors={[colors.primary[500]]}
            />
          }>
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>Sudah siap bayar Zakat?</Text>
            <Text style={styles.introSubtitle}>
              Yuk mulai hitung dan salurkan
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePressKalkulator}
              accessibilityRole="button"
              accessibilityLabel="Kalkulator zakat">
              <Icon
                icon={CalculatorMinimalistic}
                size={22}
                color={colors.primary[600]}
              />
              <Text style={styles.actionButtonLabel}>Kalkulator</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePressAmilZakat}
              accessibilityRole="button"
              accessibilityLabel="Konsultasi">
              <Icon icon={ChatRoundDots} size={22} color={colors.primary[600]} />
              <Text style={styles.actionButtonLabel}>Konsultasi</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Pilih Program Zakat</Text>
          <View style={styles.programList}>
            {programs.length === 0 ? (
              <EmptyState
                icon={Buildings}
                title="Program zakat tidak tersedia"
              />
            ) : (
              programs.map(program => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onPress={handlePressProgram}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  konsultasiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  konsultasiText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  introSection: {
    gap: spacing.xs,
  },
  introTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  introSubtitle: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  actionButtonLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  programList: {
    gap: spacing.sm,
  },
});
