import React, {useEffect, useRef} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {PrayerSettingRow} from '@/components/shared/PrayerSettingRow';
import {PrayerSettingToggleRow} from '@/components/shared/PrayerSettingToggleRow';
import {PrayerSettingSelectRow} from '@/components/shared/PrayerSettingSelectRow';
import {PrayerOptionSheet} from '@/components/shared/PrayerOptionSheet';
import {PrayerLocationSheet} from '@/components/shared/PrayerLocationSheet';
import {PrayerIhtiyatSheet} from '@/components/shared/PrayerIhtiyatSheet';
import {usePrayerSetting} from '@/hooks/usePrayerSetting';
import {usePrayerSettingStore} from '@/stores/prayerSettingStore';
import {
  HIJRI_OFFSET_OPTIONS,
  IMSAK_OFFSET_OPTIONS,
  findOptionLabel,
  formatHijriOffsetDescription,
  formatHijriOffsetValue,
  formatIhtiyat,
  formatImsakDescription,
  formatImsakValue,
} from '@/utils/prayerOptions';
import {DEFAULT_PRAYER_LOCATION} from '@/utils/prayerTime';
import {colors, spacing} from '@/theme';
import type {RootStackParamList} from '@/types/navigation';

export default function PrayerSettingScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'PrayerSetting'>>();
  const focus = route.params?.focus;

  const showOnHome = usePrayerSettingStore(s => s.showOnHome);
  const setShowOnHome = usePrayerSettingStore(s => s.setShowOnHome);
  const location = usePrayerSettingStore(s => s.location);
  const calculationMethod = usePrayerSettingStore(s => s.calculationMethod);
  const setCalculationMethod = usePrayerSettingStore(
    s => s.setCalculationMethod,
  );
  const ihtiyat = usePrayerSettingStore(s => s.ihtiyat);
  const juristicMethod = usePrayerSettingStore(s => s.juristicMethod);
  const setJuristicMethod = usePrayerSettingStore(s => s.setJuristicMethod);
  const highLatitudeRule = usePrayerSettingStore(s => s.highLatitudeRule);
  const setHighLatitudeRule = usePrayerSettingStore(s => s.setHighLatitudeRule);
  const imsakOffsetMinutes = usePrayerSettingStore(s => s.imsakOffsetMinutes);
  const setImsakOffsetMinutes = usePrayerSettingStore(
    s => s.setImsakOffsetMinutes,
  );
  const hijriOffsetDays = usePrayerSettingStore(s => s.hijriOffsetDays);
  const setHijriOffsetDays = usePrayerSettingStore(s => s.setHijriOffsetDays);
  const muadzinId = usePrayerSettingStore(s => s.muadzinId);
  const setMuadzinId = usePrayerSettingStore(s => s.setMuadzinId);
  const fridayDzuhurAdzan = usePrayerSettingStore(s => s.fridayDzuhurAdzan);
  const setFridayDzuhurAdzan = usePrayerSettingStore(
    s => s.setFridayDzuhurAdzan,
  );

  const {
    options,
    openSheet,
    locationQuery,
    locationResults,
    isSearchingLocation,
    isResolvingDeviceLocation,
    ihtiyatDraft,
    ihtiyatErrors,
    showSheet,
    closeSheet,
    changeLocationQuery,
    selectLocation,
    applyDeviceLocation,
    changeIhtiyatDraft,
    saveIhtiyat,
    testAdzan,
  } = usePrayerSetting();

  // Masuk lewat chip lokasi di layar jadwal: sheet lokasi dibuka sekali,
  // bukan tiap kali screen dirender ulang.
  const hasHandledFocus = useRef<boolean>(false);
  useEffect(() => {
    if (focus === 'location' && !hasHandledFocus.current) {
      hasHandledFocus.current = true;
      showSheet('location');
    }
  }, [focus, showSheet]);

  const locationLabel = location
    ? location.name
    : `${DEFAULT_PRAYER_LOCATION.name} (default)`;
  const muadzinName =
    options.muadzins.find(item => item.id === muadzinId)?.name ??
    'Pilih Suara Muadzin';

  return (
    <View style={styles.root}>
      <HeaderLight
        title="Pengaturan Jadwal Sholat & Adzan"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <PrayerSettingToggleRow
          label="Tampilkan waktu sholat di halaman beranda aplikasi"
          value={showOnHome}
          onChange={setShowOnHome}
        />

        <PrayerSettingSelectRow
          label="Lokasi"
          description={locationLabel}
          onPress={() => showSheet('location')}
        />

        <PrayerSettingSelectRow
          label="Metode Perhitungan"
          description={findOptionLabel(
            options.calculationMethods,
            calculationMethod,
          )}
          onPress={() => showSheet('method')}
        />

        <PrayerSettingSelectRow
          label="Koreksi Manual (Ihtiyat)"
          description={formatIhtiyat(ihtiyat)}
          onPress={() => showSheet('ihtiyat')}
        />

        <PrayerSettingSelectRow
          label="Metode Hukum Perhitungan"
          description={findOptionLabel(options.juristicMethods, juristicMethod)}
          onPress={() => showSheet('juristic')}
        />

        <PrayerSettingSelectRow
          label="Penyesuaian Tinggi Garis Lintang"
          description={findOptionLabel(
            options.highLatitudeRules,
            highLatitudeRule,
          )}
          onPress={() => showSheet('highLat')}
        />

        <PrayerSettingSelectRow
          label="Waktu Imsak"
          description={formatImsakDescription(imsakOffsetMinutes)}
          value={formatImsakValue(imsakOffsetMinutes)}
          onPress={() => showSheet('imsak')}
        />

        <PrayerSettingSelectRow
          label="Tanggal Hijriah"
          description={formatHijriOffsetDescription(hijriOffsetDays)}
          value={formatHijriOffsetValue(hijriOffsetDays)}
          onPress={() => showSheet('hijri')}
        />

        <PrayerSettingSelectRow
          label="Muadzin"
          description="Pilih Suara Muadzin"
          value={muadzinName}
          onPress={() => showSheet('muadzin')}
        />

        <PrayerSettingToggleRow
          label="Adzan Dzuhur Jum'at"
          description="Aktifkan Adzan Dzuhur di hari Jum'at?"
          value={fridayDzuhurAdzan}
          onChange={setFridayDzuhurAdzan}
        />

        <PrayerSettingRow
          label="Test Adzan"
          description="Uji coba notifikasi adzan"
          onPress={testAdzan}
        />
      </ScrollView>

      <PrayerLocationSheet
        isOpen={openSheet === 'location'}
        keyword={locationQuery}
        results={locationResults}
        selectedLocationId={location?.id ?? null}
        isSearching={isSearchingLocation}
        isResolvingDevice={isResolvingDeviceLocation}
        onChangeKeyword={changeLocationQuery}
        onSelect={selectLocation}
        onUseDeviceLocation={applyDeviceLocation}
        onClose={closeSheet}
      />

      <PrayerOptionSheet
        title="Metode Perhitungan"
        isOpen={openSheet === 'method'}
        options={options.calculationMethods}
        selectedValue={calculationMethod}
        onSelect={value => {
          setCalculationMethod(value);
          closeSheet();
        }}
        onClose={closeSheet}
      />

      <PrayerOptionSheet
        title="Metode Hukum Perhitungan"
        isOpen={openSheet === 'juristic'}
        options={options.juristicMethods}
        selectedValue={juristicMethod}
        onSelect={value => {
          setJuristicMethod(value);
          closeSheet();
        }}
        onClose={closeSheet}
      />

      <PrayerOptionSheet
        title="Penyesuaian Tinggi Garis Lintang"
        isOpen={openSheet === 'highLat'}
        options={options.highLatitudeRules}
        selectedValue={highLatitudeRule}
        onSelect={value => {
          setHighLatitudeRule(value);
          closeSheet();
        }}
        onClose={closeSheet}
      />

      <PrayerOptionSheet
        title="Waktu Imsak"
        isOpen={openSheet === 'imsak'}
        options={IMSAK_OFFSET_OPTIONS.map(minutes => ({
          value: minutes,
          label: formatImsakValue(minutes),
          description: formatImsakDescription(minutes),
        }))}
        selectedValue={imsakOffsetMinutes}
        onSelect={value => {
          setImsakOffsetMinutes(value);
          closeSheet();
        }}
        onClose={closeSheet}
      />

      <PrayerOptionSheet
        title="Tanggal Hijriah"
        isOpen={openSheet === 'hijri'}
        options={HIJRI_OFFSET_OPTIONS.map(days => ({
          value: days,
          label: formatHijriOffsetValue(days),
          description: formatHijriOffsetDescription(days),
        }))}
        selectedValue={hijriOffsetDays}
        onSelect={value => {
          setHijriOffsetDays(value);
          closeSheet();
        }}
        onClose={closeSheet}
      />

      <PrayerOptionSheet
        title="Muadzin"
        isOpen={openSheet === 'muadzin'}
        options={options.muadzins.map(muadzin => ({
          value: muadzin.id,
          label: muadzin.name,
          description: null,
        }))}
        selectedValue={muadzinId}
        onSelect={value => {
          setMuadzinId(value);
          closeSheet();
        }}
        onClose={closeSheet}
      />

      <PrayerIhtiyatSheet
        isOpen={openSheet === 'ihtiyat'}
        draft={ihtiyatDraft}
        errors={ihtiyatErrors}
        onChange={changeIhtiyatDraft}
        onSave={saveIhtiyat}
        onClose={closeSheet}
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
    paddingBottom: spacing['2xl'],
  },
});
