import {useCallback, useEffect, useState} from 'react';
import {
  getOrganizationProfile,
  getOrganizationPrograms,
  getOrganizationReports,
} from '@/services/donationService';
import {showToast} from '@/utils/toast';
import type {Program} from '@/types/program';
import type {OrganizationProfile, OrganizationReport} from '@/types/organization';

export type LembagaTab = 'program' | 'about' | 'report';

type State = {
  organization: OrganizationProfile | null;
  isLoading: boolean;
  isNotFound: boolean;
  activeTab: LembagaTab;
  programs: Program[];
  isProgramsLoading: boolean;
  reports: OrganizationReport[];
  isReportsLoading: boolean;
};

type Actions = {
  setActiveTab: (tab: LembagaTab) => void;
};

export function useLembagaProfile(lembagaId: string): State & Actions {
  const [organization, setOrganization] = useState<OrganizationProfile | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [activeTab, setActiveTabState] = useState<LembagaTab>('program');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [isProgramsLoading, setIsProgramsLoading] = useState(false);
  const [hasLoadedPrograms, setHasLoadedPrograms] = useState(false);

  const [reports, setReports] = useState<OrganizationReport[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState(false);
  const [hasLoadedReports, setHasLoadedReports] = useState(false);

  useEffect(() => {
    async function loadProfile(): Promise<void> {
      setIsLoading(true);
      try {
        const response = await getOrganizationProfile(lembagaId);
        if (!response.success) {
          setIsNotFound(true);
          showToast(response.message);
          return;
        }
        setOrganization(response.data);
      } catch {
        setIsNotFound(true);
        showToast('Tidak dapat terhubung.');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [lembagaId]);

  const loadPrograms = useCallback(async (): Promise<void> => {
    setIsProgramsLoading(true);
    try {
      const response = await getOrganizationPrograms(lembagaId);
      if (!response.success) {
        showToast(response.message);
        return;
      }
      setPrograms(response.data);
      setHasLoadedPrograms(true);
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsProgramsLoading(false);
    }
  }, [lembagaId]);

  const loadReports = useCallback(async (): Promise<void> => {
    setIsReportsLoading(true);
    try {
      const response = await getOrganizationReports(lembagaId);
      if (!response.success) {
        showToast(response.message);
        return;
      }
      setReports(response.data);
      setHasLoadedReports(true);
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsReportsLoading(false);
    }
  }, [lembagaId]);

  // Tab Program aktif secara default begitu profil lembaga selesai dimuat,
  // jadi programnya langsung diambil tanpa perlu tap tab.
  useEffect(() => {
    if (!organization || hasLoadedPrograms) {
      return;
    }
    loadPrograms();
  }, [organization, hasLoadedPrograms, loadPrograms]);

  function setActiveTab(tab: LembagaTab): void {
    setActiveTabState(tab);
    if (tab === 'report' && !hasLoadedReports) {
      loadReports();
    }
  }

  return {
    organization,
    isLoading,
    isNotFound,
    activeTab,
    programs,
    isProgramsLoading,
    reports,
    isReportsLoading,
    setActiveTab,
  };
}
