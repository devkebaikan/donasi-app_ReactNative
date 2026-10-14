import {normalizeDegrees} from '@/utils/kiblatDirection';

// Konversi yaw sensor rotasi menjadi arah hadap kompas dalam derajat.
//
// Reanimated menyelaraskan sumbu kedua platform: di Android yaw diisi
// `-azimuth` dari SensorManager.getOrientation (azimuth 0 = utara, +90 = timur),
// dan di iOS yaw datang dari CMAttitude dengan bingkai acuan magnetic north.
// Keduanya berputar berlawanan arah dengan pembacaan kompas, jadi tandanya
// dibalik.
//
// Ditandai worklet karena dipanggil dari UI thread — pembacaan sensor tidak
// pernah menyeberang ke JS thread.
export function yawToHeadingDegrees(yaw: number): number {
  'worklet';
  return normalizeDegrees((-yaw * 180) / Math.PI);
}
