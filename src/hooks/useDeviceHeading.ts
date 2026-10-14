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

// Seberapa jauh piringan mengejar pembacaan baru tiap sampel. Nilai kecil
// meredam getaran magnetometer; nilai besar membuat piringan gelisah saat
// perangkat diam. 0,2 pada interval 60 ms memberi tetapan waktu ~300 ms.
const SMOOTHING = 0.2;

// Jeda sebelum menyimpulkan perangkat tidak punya kompas. Sensor yang sehat
// mengirim sampel pertama dalam puluhan milidetik, jadi satu detik sudah
// longgar — sekaligus mencegah pesan "tidak tersedia" berkedip di awal.
const AVAILABILITY_GRACE_MS = 1000;

export type CompassStatus = 'checking' | 'available' | 'unavailable';

interface DeviceHeading {
  // Sudut MENERUS, boleh melewati 360 dan boleh negatif. Disimpan begitu supaya
  // putaran melewati batas 0°/360° tidak membuat piringan berputar balik
  // hampir satu lingkaran penuh.
  heading: SharedValue<number>;
  status: CompassStatus;
}

// Arah hadap perangkat dari sensor rotasi bawaan react-native-reanimated —
// lihat docs/05-architecture/adr/ADR-007-compass-library.md. Tidak ada
// dependency native tambahan dan tidak ada permission yang diminta.
//
// Seluruh perhitungan tinggal di UI thread: pembacaan sensor tidak pernah
// menyeberang ke JS thread, jadi piringan tetap halus walaupun JS sedang sibuk.
// Satu-satunya yang menyeberang adalah kabar "sampel pertama sudah masuk".
export function useDeviceHeading(): DeviceHeading {
  const rotation = useAnimatedSensor(SensorType.ROTATION, {
    interval: SENSOR_INTERVAL_MS,
    adjustToInterfaceOrientation: true,
    // Magnetic north dipakai di kedua platform supaya perilakunya sama. True
    // north di iOS butuh layanan lokasi aktif, sedangkan menu ini justru
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
