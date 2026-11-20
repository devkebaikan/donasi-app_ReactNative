import {useCallback, useEffect, useState} from 'react';
import {
  getInvoiceDetail,
  getReportByLink,
  type InvoiceData,
  type ApiReportItem,
} from '@/services/donationService';

export function useTrackingDetail(slug: string) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [reportsMap, setReportsMap] = useState<Record<string, ApiReportItem | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchTracking = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getInvoiceDetail(slug);
      if (res.success && res.data) {
        setInvoice(res.data);
        const items = res.data.items ?? [];
        const reports: Record<string, ApiReportItem | null> = {};
        for (const item of items) {
          if (item.project?.id) {
            const link = item.program?.link || slug;
            const repRes = await getReportByLink(link);
            reports[String(item.project.id)] = repRes?.data ?? null;
          }
        }
        setReportsMap(reports);
      } else {
        setIsError(true);
      }
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  return {
    invoice,
    reportsMap,
    isLoading,
    isError,
    refetch: fetchTracking,
  };
}
