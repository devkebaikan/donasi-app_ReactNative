import {useEffect, useState} from 'react';
import {getFaqs} from '@/services/appService';
import {showToast} from '@/utils/toast';
import type {Faq} from '@/types/faq';

type State = {
  faqs: Faq[];
  isLoading: boolean;
  expandedFaqs: string[];
};

type Actions = {
  toggleFaq: (id: string) => void;
};

export function useFaqs(): State & Actions {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFaqs, setExpandedFaqs] = useState<string[]>([]);

  useEffect(() => {
    async function fetchFaqs(): Promise<void> {
      try {
        const response = await getFaqs();
        if (!response.success) {
          showToast(response.message);
          return;
        }
        setFaqs(response.data);
      } catch {
        showToast('Tidak dapat terhubung.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  function toggleFaq(id: string): void {
    setExpandedFaqs(previous =>
      previous.includes(id)
        ? previous.filter(faqId => faqId !== id)
        : [...previous, id],
    );
  }

  return {
    faqs,
    isLoading,
    expandedFaqs,
    toggleFaq,
  };
}
