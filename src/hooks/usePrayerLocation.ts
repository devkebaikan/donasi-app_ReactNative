import {useEffect, useState} from 'react';
import {getNearestLocation} from '@/services/prayerService';
import {usePrayerSettingStore} from '@/stores/prayerSettingStore';
import {getCurrentCoordinate} from '@/utils/geolocation';
import {DEFAULT_PRAYER_LOCATION} from '@/utils/prayerTime';
import type {PrayerLocation} from '@/types/prayerTime';

// Lokasi hasil GPS di-cache per sesi aplikasi, bukan per mount: dialog izin
// tidak boleh muncul lagi tiap kali screen jadwal dibuka.
let sessionLocation: PrayerLocation | null = null;

interface PrayerLocationState {
  location: PrayerLocation;
  isResolving: boolean;
  // true saat pengguna belum pernah memilih kota DAN GPS tidak memberi apa pun,
  // sehingga yang dipakai kota default. Screen kiblat memakainya untuk memberi
  // catatan bahwa arah dihitung dari lokasi default.
  isDefaultLocation: boolean;
}

// Urutan sumber lokasi, dari yang paling dipercaya:
//   1. kota yang dipilih sendiri di Pengaturan
//   2. lokasi perangkat lewat GPS
//   3. kota default
// Semua kegagalan GPS — ditolak, timeout, mati, lookup gagal — jatuh ke
// langkah 3 tanpa memunculkan error ke pengguna.
export function usePrayerLocation(): PrayerLocationState {
  const savedLocation = usePrayerSettingStore(s => s.location);
  const useDeviceLocation = usePrayerSettingStore(s => s.useDeviceLocation);

  const shouldResolveDevice = useDeviceLocation && savedLocation == null;
  const [deviceLocation, setDeviceLocation] = useState<PrayerLocation | null>(
    sessionLocation,
  );
  const [isResolving, setIsResolving] = useState<boolean>(
    shouldResolveDevice && sessionLocation == null,
  );

  useEffect(() => {
    if (!shouldResolveDevice || sessionLocation != null) {
      return;
    }
    let isActive = true;

    async function resolveLocation(): Promise<void> {
      try {
        const coordinate = await getCurrentCoordinate();
        if (coordinate) {
          const response = await getNearestLocation(
            coordinate.latitude,
            coordinate.longitude,
          );
          if (response.success) {
            sessionLocation = response.data;
          }
        }
      } catch {
        // Diamkan: jatuh ke kota default, sama seperti izin lokasi ditolak.
      }
      if (isActive) {
        setDeviceLocation(sessionLocation);
        setIsResolving(false);
      }
    }

    resolveLocation();
    return () => {
      isActive = false;
    };
  }, [shouldResolveDevice]);

  return {
    location: savedLocation ?? deviceLocation ?? DEFAULT_PRAYER_LOCATION,
    isResolving,
    isDefaultLocation: savedLocation == null && deviceLocation == null,
  };
}
