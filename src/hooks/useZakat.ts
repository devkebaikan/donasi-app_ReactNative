import {useCallback, useEffect, useState} from 'react';
import {getZakatPrograms} from '@/services/zakatService';
import {showToast} from '@/utils/toast';
import type {Program} from '@/types/program';

type State = {
  programs: Program[];
  isLoading: boolean;
  isRefreshing: boolean;
};

type Actions = {
  refresh: () => Promise<void>;
};

export function useZakat(): State & Actions {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    try {
      const response = await getZakatPrograms();
      if (!response.success) {
        showToast(response.message);
        return;
      }
      setPrograms(response.data);
    } catch {
      showToast('Tidak dapat terhubung.');
    }
  }, []);

  useEffect(() => {
    async function init(): Promise<void> {
      setIsLoading(true);
      await load();
      setIsLoading(false);
    }
    init();
  }, [load]);

  async function refresh(): Promise<void> {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }

  return {programs, isLoading, isRefreshing, refresh};
}
