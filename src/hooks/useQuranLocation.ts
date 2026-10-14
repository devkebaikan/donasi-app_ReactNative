import {useEffect, useState} from 'react';
import {getCityByCoordinate} from '@/services/quranService';
import {getCurrentCoordinate} from '@/utils/geolocation';

// Kota default saat izin lokasi ditolak, GPS mati, timeout, atau lookup kota
// gagal — semuanya diperlakukan sama dan tidak memunculkan error ke user.
const FALLBACK_CITY = 'Jakarta';

// Izin lokasi hanya diminta sekali per sesi aplikasi, bukan tiap screen
// mount, supaya dialog permission tidak muncul berulang saat pindah tab.
let sessionCity: string | null = null;

export function useQuranLocation(): string {
  const [city, setCity] = useState<string>(sessionCity ?? FALLBACK_CITY);

  useEffect(() => {
    if (sessionCity != null) {
      return;
    }
    let isActive = true;

    async function resolveCity(): Promise<void> {
      try {
        const coordinate = await getCurrentCoordinate();
        if (!coordinate) {
          sessionCity = FALLBACK_CITY;
          return;
        }
        const response = await getCityByCoordinate(
          coordinate.latitude,
          coordinate.longitude,
        );
        sessionCity = response.success ? response.data.city : FALLBACK_CITY;
      } catch {
        sessionCity = FALLBACK_CITY;
      }
      if (isActive) {
        setCity(sessionCity ?? FALLBACK_CITY);
      }
    }

    resolveCity();
    return () => {
      isActive = false;
    };
  }, []);

  return city;
}
