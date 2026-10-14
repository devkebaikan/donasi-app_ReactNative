import {getDonationCategories, getDonationList} from './donationService';
import type {ApiResponse} from '@/types/api';
import type {Program} from '@/types/program';
import type {GoldPrice} from '@/types/zakat';

const SIMULATED_DELAY_MS = 400;
const ZAKAT_CATEGORY_SLUG = 'zakat';

const GOLD_PRICE: GoldPrice = {
  pricePerGram: 1_078_609,
  nisabGrams: 85,
};

function delay<T>(value: T): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), SIMULATED_DELAY_MS);
  });
}

export async function getZakatCategoryId(): Promise<number | null> {
  const categoriesResponse = await getDonationCategories();
  if (!categoriesResponse.success) {
    return null;
  }
  const zakatCategory = categoriesResponse.data.find(
    category => category.slug === ZAKAT_CATEGORY_SLUG,
  );
  return zakatCategory?.id ?? null;
}

export async function getZakatPrograms(): Promise<ApiResponse<Program[]>> {
  const zakatCategoryId = await getZakatCategoryId();
  if (zakatCategoryId === null) {
    return {success: true, message: 'OK', data: []};
  }

  const listResponse = await getDonationList({
    page: 1,
    categoryId: zakatCategoryId,
    sortOption: 'terbaru',
    sortDirection: 'desc',
    search: '',
  });
  if (!listResponse.success) {
    return {success: false, message: listResponse.message, data: []};
  }

  return {success: true, message: 'OK', data: listResponse.data.items};
}

export async function getGoldPrice(): Promise<ApiResponse<GoldPrice>> {
  const data = await delay(GOLD_PRICE);
  return {success: true, message: 'OK', data};
}
