// Mengubah GeoJSON batas provinsi Indonesia menjadi path SVG siap render.
//
// Dijalankan manual lewat `npm run map:data`. Hasilnya
// (src/assets/json/indonesia-map.json) DI-COMMIT — build aplikasi tidak boleh
// bergantung pada script ini pernah dijalankan. Pola yang sama dipakai
// build-quran-data.mjs.
//
// Sumber: Natural Earth 1:50m admin-1 states/provinces (public domain).
// File sumbernya TIDAK di-commit. Unduh dulu, lalu tunjuk lewat NE_GEOJSON.
// Lihat docs/05-architecture/adr/ADR-009-svg-geojson-map.md.

import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

const SOURCE_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson';
const SOURCE_PATH =
  process.env.NE_GEOJSON ?? resolve(SCRIPT_DIR, '../tmp/ne_50m_admin_1_states_provinces.geojson');
const OUTPUT_PATH = resolve(SCRIPT_DIR, '../src/assets/json/indonesia-map.json');

// Lebar kanvas dalam satuan viewBox. Tingginya dihitung dari rasio bbox.
const VIEWBOX_WIDTH = 1000;
// Toleransi Douglas-Peucker dalam satuan viewBox. Pada lebar 1000 yang
// membentang ~46 derajat bujur, 1 satuan ≈ 5 km — cukup halus untuk peta
// setinggi ~300px di layar ponsel.
const SIMPLIFY_TOLERANCE = 0.45;
// Ring yang lebih kecil dari ini dibuang. Pulau sekecil itu tidak terlihat di
// lebar layar ponsel, tapi jumlahnya ribuan dan membengkakkan file.
const MIN_RING_AREA = 0.6;
const COORD_DECIMALS = 1;

// Natural Earth memakai nama versi Inggris/lama untuk beberapa provinsi.
// Yang tampil di UI harus nama resmi Bahasa Indonesia.
const NAME_OVERRIDES = {
  'ID-JK': 'DKI Jakarta',
  'ID-YO': 'DI Yogyakarta',
  'ID-BB': 'Kepulauan Bangka Belitung',
  'ID-SA': 'Sulawesi Utara',
  'ID-NB': 'Nusa Tenggara Barat',
  'ID-NT': 'Nusa Tenggara Timur',
};

function readSource() {
  try {
    return JSON.parse(readFileSync(SOURCE_PATH, 'utf8'));
  } catch {
    console.error(`GeoJSON sumber tidak ditemukan di:\n  ${SOURCE_PATH}\n`);
    console.error('Unduh dulu, lalu jalankan ulang:');
    console.error(`  mkdir -p mobile/tmp && curl -L -o mobile/tmp/ne_50m_admin_1_states_provinces.geojson \\\n    ${SOURCE_URL}\n`);
    console.error('Atau tunjuk file lain lewat NE_GEOJSON=/path/ke/file.geojson');
    process.exit(1);
  }
}

function eachRing(geometry, visit) {
  const polygons =
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      visit(ring);
    }
  }
}

function ringArea(ring) {
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return area / 2;
}

// Centroid berbobot luas. BUKAN titik tengah bounding box — untuk provinsi
// berbentuk aneh (Sulawesi Selatan, Halmahera) titik tengah bbox mendarat di
// laut, dan penanda angkanya ikut mendarat di sana.
function ringCentroid(ring) {
  const area = ringArea(ring);
  if (area === 0) {
    return ring[0];
  }
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const cross = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    cx += (ring[j][0] + ring[i][0]) * cross;
    cy += (ring[j][1] + ring[i][1]) * cross;
  }
  return [cx / (6 * area), cy / (6 * area)];
}

function perpendicularDistance(point, start, end) {
  const [x, y] = point;
  const [x1, y1] = start;
  const [x2, y2] = end;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  if (length === 0) {
    return Math.hypot(x - x1, y - y1);
  }
  return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / length;
}

function simplify(points, tolerance) {
  if (points.length < 3) {
    return points;
  }
  let maxDistance = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }
  if (maxDistance <= tolerance) {
    return [points[0], points[points.length - 1]];
  }
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ];
}

const round = value => Number(value.toFixed(COORD_DECIMALS));

function main() {
  const geojson = readSource();
  const features = geojson.features.filter(
    feature => feature.properties.adm0_a3 === 'IDN',
  );

  if (features.length === 0) {
    console.error('Tidak ada fitur Indonesia di GeoJSON sumber. Salah file?');
    process.exit(1);
  }

  // 1. Bounding box bersama — proyeksi harus sama untuk semua provinsi.
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const feature of features) {
    eachRing(feature.geometry, ring => {
      for (const [lon, lat] of ring) {
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
    });
  }

  // 2. Equirectangular dengan koreksi cos(lintang tengah). Tanpa koreksi ini
  //    pulau-pulau tampak gepeng melebar.
  const midLatRad = (((minLat + maxLat) / 2) * Math.PI) / 180;
  const lonScale = Math.cos(midLatRad);
  const scale = VIEWBOX_WIDTH / ((maxLon - minLon) * lonScale);
  const viewBoxHeight = (maxLat - minLat) * scale;

  const project = ([lon, lat]) => [
    (lon - minLon) * lonScale * scale,
    (maxLat - lat) * scale, // sumbu y SVG tumbuh ke bawah
  ];

  let pointsBefore = 0;
  let pointsAfter = 0;
  let droppedRings = 0;
  const missingCode = [];

  const provinces = features
    .map(feature => {
      const isoCode = feature.properties.iso_3166_2;
      const code =
        isoCode && isoCode !== '-99'
          ? isoCode
          : `ID-X${feature.properties.name.slice(0, 2).toUpperCase()}`;
      if (!isoCode || isoCode === '-99') {
        missingCode.push(`${code} ${feature.properties.name}`);
      }

      const projectedRings = [];
      eachRing(feature.geometry, ring => {
        pointsBefore += ring.length;
        projectedRings.push(ring.map(project));
      });

      // 3. Sederhanakan, buang pulau yang terlalu kecil untuk terlihat.
      const keptRings = [];
      for (const ring of projectedRings) {
        if (Math.abs(ringArea(ring)) < MIN_RING_AREA) {
          droppedRings++;
          continue;
        }
        const simplified = simplify(ring, SIMPLIFY_TOLERANCE);
        if (simplified.length < 3) {
          droppedRings++;
          continue;
        }
        pointsAfter += simplified.length;
        keptRings.push(simplified);
      }

      if (keptRings.length === 0) {
        return null;
      }

      // 4. MultiPolygon jadi SATU atribut `d` bersubpath — supaya satu
      //    provinsi tetap satu <Path> yang bisa ditekan sekali.
      const path = keptRings
        .map(
          ring =>
            ring
              .map((point, i) => `${i === 0 ? 'M' : 'L'}${round(point[0])} ${round(point[1])}`)
              .join('') + 'Z',
        )
        .join('');

      const largestRing = keptRings.reduce((a, b) =>
        Math.abs(ringArea(b)) > Math.abs(ringArea(a)) ? b : a,
      );
      const [centroidX, centroidY] = ringCentroid(largestRing);

      return {
        code,
        name: NAME_OVERRIDES[code] ?? feature.properties.name,
        path,
        centroidX: round(centroidX),
        centroidY: round(centroidY),
      };
    })
    .filter(province => province !== null)
    .sort((a, b) => a.code.localeCompare(b.code));

  const output = {
    viewBox: `0 0 ${VIEWBOX_WIDTH} ${Math.round(viewBoxHeight)}`,
    provinces,
  };

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(output)}\n`);

  const sizeKb = (Buffer.byteLength(JSON.stringify(output)) / 1024).toFixed(1);
  console.log(`Sumber      : ${SOURCE_PATH}`);
  console.log(`viewBox     : ${output.viewBox}`);
  console.log(`Provinsi    : ${provinces.length}`);
  console.log(`Titik       : ${pointsBefore} -> ${pointsAfter}`);
  console.log(`Ring dibuang: ${droppedRings} (lebih kecil dari ${MIN_RING_AREA} satuan viewBox)`);
  console.log(`Kode kosong : ${missingCode.length === 0 ? 'tidak ada' : missingCode.join(', ')}`);
  console.log(`Output      : ${OUTPUT_PATH} (${sizeKb} KB)`);
}

main();
