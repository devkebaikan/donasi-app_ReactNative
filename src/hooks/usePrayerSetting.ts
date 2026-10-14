import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {
  getNearestLocation,
  getPrayerOptions,
  searchLocations,
} from '@/services/prayerService';
import {usePrayerSettingStore} from '@/stores/prayerSettingStore';
import {useDebouncedValue} from '@/hooks/useDebouncedValue';
import {getCurrentCoordinate} from '@/utils/geolocation';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import {showToast} from '@/utils/toast';
import {
  FALLBACK_PRAYER_OPTIONS,
  IHTIYAT_FIELDS,
  IHTIYAT_MAX_MINUTES,
  IHTIYAT_MIN_MINUTES,
} from '@/utils/prayerOptions';
import type {
  IhtiyatCorrection,
  PrayerLocation,
  PrayerOptions,
} from '@/types/prayerTime';

const LOCATION_SEARCH_DEBOUNCE_MS = 400;

export type PrayerSettingSheet =
  | 'location'
  | 'method'
  | 'ihtiyat'
  | 'juristic'
  | 'highLat'
  | 'imsak'
  | 'hijri'
  | 'muadzin';

// Draft ihtiyat disimpan sebagai teks: input menit boleh kosong sementara
// sambil diketik, dan tanda minus perlu bisa diketik lebih dulu.
type IhtiyatDraftText = Record<keyof IhtiyatCorrection, string>;

type State = {
  options: PrayerOptions;
  openSheet: PrayerSettingSheet | null;
  locationQuery: string;
  locationResults: PrayerLocation[];
  isSearchingLocation: boolean;
  isResolvingDeviceLocation: boolean;
  ihtiyatDraft: IhtiyatDraftText;
  ihtiyatErrors: Partial<Record<keyof IhtiyatCorrection, string>>;
};

type Actions = {
  showSheet: (sheet: PrayerSettingSheet) => void;
  closeSheet: () => void;
  changeLocationQuery: (keyword: string) => void;
  selectLocation: (location: PrayerLocation) => void;
  applyDeviceLocation: () => Promise<void>;
  changeIhtiyatDraft: (field: keyof IhtiyatCorrection, value: string) => void;
  saveIhtiyat: () => void;
  testAdzan: () => void;
};

function toDraftText(ihtiyat: IhtiyatCorrection): IhtiyatDraftText {
  return {
    subuh: String(ihtiyat.subuh),
    dzuhur: String(ihtiyat.dzuhur),
    ashar: String(ihtiyat.ashar),
    maghrib: String(ihtiyat.maghrib),
    isya: String(ihtiyat.isya),
  };
}

export function usePrayerSetting(): State & Actions {
  const ihtiyat = usePrayerSettingStore(s => s.ihtiyat);
  const setIhtiyat = usePrayerSettingStore(s => s.setIhtiyat);
  const setLocation = usePrayerSettingStore(s => s.setLocation);

  const [openSheet, setOpenSheet] = useState<PrayerSettingSheet | null>(null);
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [isResolvingDeviceLocation, setIsResolvingDeviceLocation] =
    useState<boolean>(false);
  const [ihtiyatDraft, setIhtiyatDraft] = useState<IhtiyatDraftText>(() =>
    toDraftText(ihtiyat),
  );
  const [ihtiyatErrors, setIhtiyatErrors] = useState<
    Partial<Record<keyof IhtiyatCorrection, string>>
  >({});

  const optionsQuery = useQuery({
    queryKey: queryKeys.prayer.options,
    queryFn: () => getPrayerOptions().then(unwrapResponse),
  });

  // Kegagalan mengambil opsi tidak mengunci layar: daftar bawaan dipakai
  // supaya pengaturan tetap bisa diubah. Toast-nya tidak dipasang di sini —
  // QueryCache di `queryClient` sudah menampilkan `message` dari response,
  // dan toast di aplikasi ini satu slot: toast kedua menimpa yang pertama.
  const debouncedKeyword = useDebouncedValue(
    locationQuery,
    LOCATION_SEARCH_DEBOUNCE_MS,
  );

  const locationSearchQuery = useQuery({
    queryKey: queryKeys.prayer.locationSearch(debouncedKeyword),
    queryFn: () => searchLocations(debouncedKeyword).then(unwrapResponse),
    enabled: openSheet === 'location',
  });

  function showSheet(sheet: PrayerSettingSheet): void {
    if (sheet === 'ihtiyat') {
      setIhtiyatDraft(toDraftText(ihtiyat));
      setIhtiyatErrors({});
    }
    setOpenSheet(sheet);
  }

  function closeSheet(): void {
    setOpenSheet(null);
  }

  function selectLocation(location: PrayerLocation): void {
    setLocation(location, false);
    closeSheet();
  }

  async function applyDeviceLocation(): Promise<void> {
    setIsResolvingDeviceLocation(true);
    try {
      const coordinate = await getCurrentCoordinate();
      if (!coordinate) {
        showToast('Lokasi perangkat tidak tersedia. Pilih kota secara manual.');
        return;
      }
      const response = await getNearestLocation(
        coordinate.latitude,
        coordinate.longitude,
      );
      if (!response.success) {
        showToast(response.message);
        return;
      }
      setLocation(response.data, true);
      closeSheet();
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsResolvingDeviceLocation(false);
    }
  }

  function changeIhtiyatDraft(
    field: keyof IhtiyatCorrection,
    value: string,
  ): void {
    setIhtiyatDraft(draft => ({...draft, [field]: value}));
    setIhtiyatErrors(errors => ({...errors, [field]: undefined}));
  }

  // Validasi dijalankan saat tombol simpan ditekan, bukan saat mengetik —
  // lihat aturan form di CLAUDE.md.
  function saveIhtiyat(): void {
    const errors: Partial<Record<keyof IhtiyatCorrection, string>> = {};
    const parsed = {} as IhtiyatCorrection;

    IHTIYAT_FIELDS.forEach(({key}) => {
      const raw = ihtiyatDraft[key].trim();
      const value = Number(raw);
      if (raw === '' || !Number.isInteger(value)) {
        errors[key] = 'Isi dengan angka menit';
        return;
      }
      if (value < IHTIYAT_MIN_MINUTES || value > IHTIYAT_MAX_MINUTES) {
        errors[key] = `Maksimal ${IHTIYAT_MAX_MINUTES} menit`;
        return;
      }
      parsed[key] = value;
    });

    if (Object.keys(errors).length > 0) {
      setIhtiyatErrors(errors);
      return;
    }

    setIhtiyat(parsed);
    closeSheet();
  }

  function testAdzan(): void {
    showToast('Segera hadir');
  }

  return {
    options: optionsQuery.data ?? FALLBACK_PRAYER_OPTIONS,
    openSheet,
    locationQuery,
    locationResults: locationSearchQuery.data ?? [],
    isSearchingLocation: locationSearchQuery.isFetching,
    isResolvingDeviceLocation,
    ihtiyatDraft,
    ihtiyatErrors,
    showSheet,
    closeSheet,
    changeLocationQuery: setLocationQuery,
    selectLocation,
    applyDeviceLocation,
    changeIhtiyatDraft,
    saveIhtiyat,
    testAdzan,
  };
}
