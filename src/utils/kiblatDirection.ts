import type {Coordinate} from '@/utils/geolocation';

// Ka'bah, Masjidil Haram.
export const KAABA: Coordinate = {latitude: 21.4225, longitude: 39.8262};

const EARTH_RADIUS_KM = 6371;

export function normalizeDegrees(value: number): number {
  'worklet';
  return ((value % 360) + 360) % 360;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Bearing awal great-circle dari posisi pengguna ke Ka'bah, diukur searah
// jarum jam dari utara sejati. Murni geometri: tidak butuh sensor maupun
// jaringan, jadi arah kiblat tetap bisa ditampilkan dalam kondisi apa pun.
export function getKiblatBearing(from: Coordinate): number {
  const fromLatitude = toRadians(from.latitude);
  const kaabaLatitude = toRadians(KAABA.latitude);
  const deltaLongitude = toRadians(KAABA.longitude - from.longitude);

  const y = Math.sin(deltaLongitude) * Math.cos(kaabaLatitude);
  const x =
    Math.cos(fromLatitude) * Math.sin(kaabaLatitude) -
    Math.sin(fromLatitude) * Math.cos(kaabaLatitude) * Math.cos(deltaLongitude);

  return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI);
}

export function getKaabaDistanceKm(from: Coordinate): number {
  const fromLatitude = toRadians(from.latitude);
  const kaabaLatitude = toRadians(KAABA.latitude);
  const deltaLatitude = kaabaLatitude - fromLatitude;
  const deltaLongitude = toRadians(KAABA.longitude - from.longitude);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(kaabaLatitude) *
      Math.sin(deltaLongitude / 2) ** 2;

  return Math.round(2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a)));
}

// Selisih sudut terpendek, hasilnya selalu di rentang -180..180. Dipakai saat
// menganimasikan putaran: tanpa ini piringan berputar hampir satu lingkaran
// penuh setiap kali melewati 0°/360°.
export function shortestAngleDelta(from: number, to: number): number {
  'worklet';
  return ((to - from + 540) % 360) - 180;
}
