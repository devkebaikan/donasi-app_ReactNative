import {useMemo, useState} from 'react';
import type {SharedValue} from 'react-native-reanimated';
import {usePrayerLocation} from '@/hooks/usePrayerLocation';
import {useDeviceHeading} from '@/hooks/useDeviceHeading';
import type {CompassStatus} from '@/hooks/useDeviceHeading';
import {getKaabaDistanceKm, getKiblatBearing} from '@/utils/kiblatDirection';
import type {PrayerLocation} from '@/types/prayerTime';

type State = {
  location: PrayerLocation;
  isDefaultLocation: boolean;
  bearing: number; // 0..360 dari utara sejati
  distanceKm: number;
  // Sudut hadap perangkat di UI thread. Diam di 0 saat sensor tidak tersedia,
  // sehingga piringan berhenti dengan Utara di atas — jalur statis yang sama
  // seperti sebelum kompas hidup.
  heading: SharedValue<number>;
  // 'checking' selama sampel pertama belum masuk — selama itu layar tidak
  // menuduh apa pun. 'unavailable' baru muncul kalau sensor benar-benar diam.
  compassStatus: CompassStatus;
  isCalibrationOpen: boolean;
};

type Actions = {
  openCalibration: () => void;
  closeCalibration: () => void;
};

export function useKiblat(): State & Actions {
  const {location, isDefaultLocation} = usePrayerLocation();
  const {heading, status} = useDeviceHeading();
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);

  // Bearing kiblat murni turunan koordinat: tidak butuh sensor, tidak butuh
  // jaringan, dan tidak perlu disimpan di state.
  const bearing = useMemo(
    () =>
      getKiblatBearing({
        latitude: location.latitude,
        longitude: location.longitude,
      }),
    [location.latitude, location.longitude],
  );

  const distanceKm = useMemo(
    () =>
      getKaabaDistanceKm({
        latitude: location.latitude,
        longitude: location.longitude,
      }),
    [location.latitude, location.longitude],
  );

  return {
    location,
    isDefaultLocation,
    bearing,
    distanceKm,
    heading,
    compassStatus: status,
    isCalibrationOpen,
    openCalibration: () => setIsCalibrationOpen(true),
    closeCalibration: () => setIsCalibrationOpen(false),
  };
}
