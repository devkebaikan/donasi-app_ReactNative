import {useEffect, useState} from 'react';
import {
  IOSReferenceFrame,
  SensorType,
  runOnJS,
  useAnimatedReaction,
  useAnimatedSensor,
  useSharedValue,
} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import {yawToHeadingDegrees} from '@/utils/compass';
import {normalizeDegrees, shortestAngleDelta} from '@/utils/kiblatDirection';

const SENSOR_INTERVAL_MS = 60;
const SMOOTHING = 0.2;
const AVAILABILITY_GRACE_MS = 1000;

export type CompassStatus = 'checking' | 'available' | 'unavailable';

interface DeviceHeading {
  heading: SharedValue<number>;
  status: CompassStatus;
}

export function useDeviceHeading(): DeviceHeading {
  const rotation = useAnimatedSensor(SensorType.ROTATION, {
    interval: SENSOR_INTERVAL_MS,
    adjustToInterfaceOrientation: true,
    // dirancang tetap jalan tanpa izin lokasi.
    iosReferenceFrame: IOSReferenceFrame.XMagneticNorthZVertical,
  });

  const heading = useSharedValue(0);
  const hasSample = useSharedValue(false);
  const [status, setStatus] = useState<CompassStatus>('checking');

  // Ketersediaan disimpulkan dari sampel yang benar-benar masuk, BUKAN dari
  // `rotation.isAvailable`. Flag itu tidak bisa dipakai: reanimated
  // mengembalikan `ref.current`, lalu mengganti isi ref-nya dengan objek baru
  // di dalam effect — objek yang tertangkap di render pertama selamanya
  // bernilai false, dan karena nilainya tidak berubah, tidak ada render ulang
  // yang memperbaikinya. Sampel yang masuk juga jawaban yang lebih jujur:
  // yang ditanya layar adalah "kompasnya mengirim data atau tidak".
  useAnimatedReaction(
    () => rotation.sensor.value.yaw,
    yaw => {
      const target = yawToHeadingDegrees(yaw);
      const delta = shortestAngleDelta(normalizeDegrees(heading.value), target);
      heading.value += delta * SMOOTHING;

      if (!hasSample.value) {
        hasSample.value = true;
        runOnJS(setStatus)('available');
      }
    },
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus(current => (current === 'checking' ? 'unavailable' : current));
    }, AVAILABILITY_GRACE_MS);
    return () => clearTimeout(timer);
  }, []);

  return {heading, status};
}
