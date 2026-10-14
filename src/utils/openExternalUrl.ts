import {Linking} from 'react-native';
import {showToast} from '@/utils/toast';

// Satu pintu untuk semua tautan keluar aplikasi — error handling-nya ditulis
// sekali di sini, bukan diulang di tiap screen yang memanggil Linking.
// Sejalan dengan openWhatsappCs di @/utils/whatsapp yang punya pesan sendiri.
export async function openExternalUrl(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    showToast('Tidak dapat membuka tautan.');
  }
}
