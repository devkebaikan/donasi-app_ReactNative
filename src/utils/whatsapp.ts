import {Linking} from 'react-native';
import {ENV} from '@/config/env';
import {showToast} from '@/utils/toast';

// Dipakai di mana pun butuh tombol "Butuh Bantuan"/"Hubungi kami" ke CS —
// satu sumber kebenaran nomor & error handling, bukan diduplikasi per screen
// (sebelumnya cuma ada di PaymentInvoiceScreen).
export async function openWhatsappCs(): Promise<void> {
  const url = `https://wa.me/${ENV.WHATSAPP_CS_NUMBER}`;
  try {
    await Linking.openURL(url);
  } catch {
    showToast('Tidak dapat membuka WhatsApp.');
  }
}
