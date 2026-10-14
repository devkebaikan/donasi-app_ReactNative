import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {getDonationTracking} from '@/services/donationService';
import {unwrapResponse} from '@/utils/apiError';
import {queryKeys} from '@/utils/queryKeys';
import type {DonationTracking} from '@/types/tracking';

type State = {
  tracking: DonationTracking | null;
  isLoading: boolean;
  isNotFound: boolean;
  isPaymentExpanded: boolean;
};

type Actions = {
  togglePaymentExpanded: () => void;
};

export function useTrackingDetail(donationId: string): State & Actions {
  // Default terbuka — beda dari akordion lain di app yang default tertutup,
  // sesuai ketentuan "Detail Pembayaran: accordion (default terbuka)".
  const [isPaymentExpanded, setIsPaymentExpanded] = useState(true);

  const trackingQuery = useQuery({
    queryKey: queryKeys.tracking.detail(donationId),
    queryFn: () => getDonationTracking(donationId).then(unwrapResponse),
  });

  function togglePaymentExpanded(): void {
    setIsPaymentExpanded(value => !value);
  }

  return {
    tracking: trackingQuery.data ?? null,
    isLoading: trackingQuery.isPending,
    isNotFound: trackingQuery.isError,
    isPaymentExpanded,
    togglePaymentExpanded,
  };
}
