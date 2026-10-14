import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {getImpactMap} from '@/services/impactService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import mapGeometry from '@/assets/json/indonesia-map.json';
import type {
  ImpactMapData,
  ImpactMapGeometry,
  ImpactProvince,
  ImpactProvinceShape,
} from '@/types/impact';

// Geometri di-IMPORT, bukan di-fetch: ia aset build yang di-commit
// (npm run map:data), bukan data yang berubah.
const geometry = mapGeometry as ImpactMapGeometry;

type State = {
  data: ImpactMapData | null;
  // Provinsi siap render: geometri + angkanya kalau ada di response.
  shapes: ImpactProvinceShape[];
  // Daftar teks untuk "Rincian per Provinsi" — urut peserta terbanyak.
  // Provinsi yang ada di response tapi TIDAK ada di geometri tetap masuk sini
  // supaya angkanya tidak hilang dari halaman.
  provinceRows: ImpactProvince[];
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
};

type Actions = {
  refresh: () => void;
};

export function useImpactMap(): State & Actions {
  const mapQuery = useQuery({
    queryKey: queryKeys.impact.map(),
    queryFn: () => getImpactMap().then(unwrapResponse),
  });

  const data = mapQuery.data ?? null;

  const statsByCode = useMemo(() => {
    const result = new Map<string, ImpactProvince>();
    for (const province of data?.provinces ?? []) {
      result.set(province.code, province);
    }
    return result;
  }, [data]);

  const shapes = useMemo<ImpactProvinceShape[]>(
    () =>
      geometry.provinces.map(province => ({
        geometry: province,
        stats: statsByCode.get(province.code) ?? null,
      })),
    [statsByCode],
  );

  const provinceRows = useMemo<ImpactProvince[]>(
    () =>
      [...(data?.provinces ?? [])].sort(
        (a, b) => b.participantCount - a.participantCount,
      ),
    [data],
  );

  // Toast sudah ditangani terpusat di queryCache onError
  // (src/services/queryClient.ts) — jangan panggil showToast lagi di sini.
  return {
    data,
    shapes,
    provinceRows,
    isLoading: mapQuery.isPending,
    isRefreshing: mapQuery.isRefetching,
    isError: mapQuery.isError,
    refresh: () => {
      mapQuery.refetch();
    },
  };
}
