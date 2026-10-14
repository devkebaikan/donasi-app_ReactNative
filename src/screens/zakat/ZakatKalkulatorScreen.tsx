import React from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {Button} from '@/components/ui/Button';
import {ZakatKalkulatorTabBar} from '@/components/shared/ZakatKalkulatorTabBar';
import {ZakatKalkulatorForm} from '@/components/shared/ZakatKalkulatorForm';
import {ZakatInfoNote} from '@/components/shared/ZakatInfoNote';
import {ZakatHasilCard} from '@/components/shared/ZakatHasilCard';
import {useZakatKalkulator} from '@/hooks/useZakatKalkulator';
import {colors, spacing} from '@/theme';
import type {ZakatKalkulatorScreenProps} from '@/types/navigation';

export default function ZakatKalkulatorScreen({
  navigation,
}: ZakatKalkulatorScreenProps): React.JSX.Element {
  const {
    activeTab,
    deposito,
    properti,
    emas,
    saham,
    hutang,
    penghasilanBulanan,
    pendapatanLain,
    periodePerhitungan,
    goldPrice,
    isLoadingGoldPrice,
    zakatCategoryId,
    nisab,
    hasilZakat,
    isWajibZakat,
    setActiveTab,
    setDeposito,
    setProperti,
    setEmas,
    setSaham,
    setHutang,
    setPenghasilanBulanan,
    setPendapatanLain,
    setPeriodePerhitungan,
    calculate,
  } = useZakatKalkulator();

  function handlePressPilihProgram(): void {
    navigation.navigate('Home', {
      screen: 'Donations',
      params: zakatCategoryId ? {categoryId: zakatCategoryId} : undefined,
    });
  }

  const nisabLabel =
    activeTab === 'maal'
      ? 'Nisab 85 gram'
      : periodePerhitungan === 'pertahun'
        ? 'Nisab 85 gram/tahun'
        : 'Nisab 85 gram/bulan';

  return (
    <View style={styles.container}>
      <HeaderLight
        title="Kalkulator Zakat"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <ZakatKalkulatorTabBar activeTab={activeTab} onChange={setActiveTab} />

        <ZakatKalkulatorForm
          activeTab={activeTab}
          deposito={deposito}
          properti={properti}
          emas={emas}
          saham={saham}
          hutang={hutang}
          onChangeDeposito={setDeposito}
          onChangeProperti={setProperti}
          onChangeEmas={setEmas}
          onChangeSaham={setSaham}
          onChangeHutang={setHutang}
          penghasilanBulanan={penghasilanBulanan}
          pendapatanLain={pendapatanLain}
          periodePerhitungan={periodePerhitungan}
          onChangePenghasilanBulanan={setPenghasilanBulanan}
          onChangePendapatanLain={setPendapatanLain}
          onChangePeriodePerhitungan={setPeriodePerhitungan}
        />

        <ZakatInfoNote
          pricePerGram={goldPrice?.pricePerGram ?? null}
          nisab={nisab}
          nisabLabel={nisabLabel}
          isLoading={isLoadingGoldPrice}
        />

        <Button
          label="Hitung Zakat"
          onPress={calculate}
          isDisabled={isLoadingGoldPrice}
          size="lg"
        />

        {hasilZakat !== null && isWajibZakat !== null ? (
          <ZakatHasilCard
            amount={hasilZakat}
            isWajib={isWajibZakat}
            onPressPilihProgram={handlePressPilihProgram}
          />
        ) : null}
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
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
});
