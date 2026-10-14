import {useToastStore} from '@/stores/toastStore';

export function showToast(message: string): void {
  useToastStore.getState().show(message);
}
