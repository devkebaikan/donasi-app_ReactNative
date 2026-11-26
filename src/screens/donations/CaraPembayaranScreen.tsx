import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  Copy,
  DangerCircle,
  Card2,
  Wallet2,
  ShieldCheck,
} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {Icon} from '@/components/ui/Icon';
import {getInvoiceDetail} from '@/services/donationService';
import {formatCurrency} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';
import {colors} from '@/theme';
import type {CaraPembayaranScreenProps} from '@/types/navigation';

export default function CaraPembayaranScreen({
  route,
  navigation,
}: CaraPembayaranScreenProps): React.JSX.Element {
  const params = route.params || {};

  const [loading, setLoading] = useState(false);
  const [bankName, setBankName] = useState(params.bankName || '');
  const [accountNumber, setAccountNumber] = useState(params.accountNumber || '');
  const [accountHolderName, setAccountHolderName] = useState(
    params.accountHolderName || 'Yayasan Sahabat Beramal Bersama',
  );
  const [amount, setAmount] = useState<number>(params.amount || 0);
  const [paymentLogo, setPaymentLogo] = useState(params.paymentMethodLogoUrl || '');
  const [paymentType, setPaymentType] = useState(params.paymentMethodType || '');

  const effectiveId = params.invoiceId || params.slug;

  // Jika params belum lengkap tapi ada invoiceId / slug, fetch data invoice
  useEffect(() => {
    let isMounted = true;
    if (effectiveId && (!accountNumber || !amount)) {
      setLoading(true);
      getInvoiceDetail(effectiveId)
        .then(res => {
          if (!isMounted || !res) return;
          const invoice = res.data;
          const payment = invoice?.payment_method ?? {};
          if (payment.name) setBankName(payment.name);
          if (payment.account_number) setAccountNumber(String(payment.account_number));
          if (payment.account_behalf) setAccountHolderName(payment.account_behalf);
          if (invoice?.nominal) setAmount(invoice.nominal);
          if (payment.image_url) setPaymentLogo(payment.image_url);
          if (payment.type) setPaymentType(payment.type);
        })
        .catch(() => {
          // ignore error, fallback to passed params
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [effectiveId, accountNumber, amount]);

  function handleCopy(text: string | number, label: string): void {
    if (!text) return;
    Clipboard.setString(String(text));
    showToast(`${label} disalin`);
  }

  const hasAccountNumber = !!accountNumber && accountNumber !== '0';

  // Pisahkan 3 digit terakhir untuk transfer bank
  const formattedAmount = formatCurrency(amount);
  let mainPart = formattedAmount;
  let uniqueDigits = '';
  if (formattedAmount.length > 3) {
    mainPart = formattedAmount.slice(0, -3);
    uniqueDigits = formattedAmount.slice(-3);
  }

  const methodCategory =
    paymentType === 'virtual_account'
      ? 'Virtual Account'
      : paymentType === 'qris'
        ? 'QRIS'
        : 'Transfer Bank';

  return (
    <View className="flex-1 bg-neutral-50">
      <HeaderLight
        title="Panduan Pembayaran"
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center p-6">
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text className="text-xs text-neutral-400 mt-3 font-medium">
            Memuat panduan pembayaran...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* ── 1. Info Pembayaran Card ── */}
          <View className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden mb-4">
            {/* Header Bank / Metode */}
            <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <Text className="text-xs font-medium text-slate-500">
                {methodCategory}
              </Text>
              {paymentLogo ? (
                <Image
                  source={{uri: paymentLogo}}
                  className="h-7 w-20"
                  resizeMode="contain"
                />
              ) : bankName ? (
                <Text className="text-xs font-bold text-slate-700">
                  {bankName}
                </Text>
              ) : null}
            </View>

            {/* Nomor Rekening */}
            {hasAccountNumber && (
              <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-slate-100">
                <View className="flex-1 pr-3">
                  <Text className="text-xs text-slate-500 mb-0.5">
                    Nama Rekening
                  </Text>
                  <Text className="text-sm font-semibold text-slate-800">
                    {accountHolderName}
                  </Text>
                  <Text className="text-base font-mono font-bold text-slate-900 mt-0.5 tracking-wider">
                    {accountNumber}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCopy(accountNumber, 'Nomor rekening')}
                  activeOpacity={0.7}
                  className="py-1.5 px-4 rounded-full bg-primary-500 active:bg-primary-600 flex-row items-center gap-1.5 shadow-2xs"
                  accessibilityRole="button"
                  accessibilityLabel="Salin nomor rekening">
                  <Icon icon={Copy} size={13} color="#FFFFFF" />
                  <Text className="text-xs font-semibold text-white">
                    Salin
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Jumlah Donasi */}
            {amount > 0 && (
              <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-slate-100">
                <View className="flex-1 pr-3">
                  <Text className="text-xs text-slate-500 mb-0.5">
                    Jumlah Donasi
                  </Text>
                  <Text className="text-xl font-bold text-slate-900">
                    {mainPart}
                    <Text className="text-primary-600 font-extrabold">
                      {uniqueDigits}
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCopy(amount, 'Nominal donasi')}
                  activeOpacity={0.7}
                  className="py-1.5 px-4 rounded-full bg-primary-500 active:bg-primary-600 flex-row items-center gap-1.5 shadow-2xs"
                  accessibilityRole="button"
                  accessibilityLabel="Salin jumlah donasi">
                  <Icon icon={Copy} size={13} color="#FFFFFF" />
                  <Text className="text-xs font-semibold text-white">
                    Salin
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Peringatan Penting */}
            <View className="p-3.5 bg-amber-50/70 border-l-4 border-amber-400 m-3 rounded-r-xl flex-row items-start gap-2.5">
              <Icon
                icon={DangerCircle}
                size={16}
                color="#d97706"
              />
              <Text className="flex-1 text-xs text-amber-900 leading-relaxed">
                <Text className="font-bold">PENTING!</Text> Mohon transfer tepat sampai 3 angka terakhir agar donasi terverifikasi otomatis oleh sistem.
              </Text>
            </View>
          </View>

          {/* ── 2. Panduan Pembayaran Steps ── */}
          <View className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden mb-4">
            <View className="flex-row items-center gap-2.5 px-4 py-3.5 border-b border-slate-100">
              
              <Text className="text-sm font-bold text-slate-800">
                Panduan Pembayaran
              </Text>
            </View>

            <View className="p-4 space-y-3.5">
              {[
                'Lakukan pembayaran melalui ATM / mobile banking / internet banking / SMS banking / kantor bank terdekat.',
                `Isi nomor rekening tujuan sesuai yang tertera di atas (a.n ${accountHolderName}).`,
                'Masukan nominal donasi sesuai jumlah donasimu, termasuk 3 digit terakhir.',
                'Pembayaran akan diverifikasi otomatis oleh Beramalbersama.com. Waktu verifikasi paling lambat 1×24 jam untuk sesama bank, dan 2×24 jam di hari kerja jika antar bank berbeda.',
              ].map((stepText, idx) => (
                <View key={idx} className="flex-row items-start gap-3">
                  <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center shrink-0 mt-0.5">
                    <Text className="text-xs font-bold text-white leading-none">
                      {idx + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-xs text-slate-600 leading-relaxed">
                    {stepText}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── 3. Info Cards ── */}
          <View className="space-y-3">
            {/* Promo Virtual Account */}
            <View className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4">
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 rounded-xl items-center justify-center shrink-0 border border-neutral-100">
                  <Icon icon={Card2} size={20} color={colors.neutral[500]} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-800 mb-2.5 leading-snug">
                    Bayar pakai Virtual Account untuk transaksi selanjutnya ya! Kenapa?
                  </Text>
                  <View className="space-y-2">
                    <View>
                      <Text className="text-xs font-bold text-primary-600">
                        Bebas biaya transfer
                      </Text>
                      <Text className="text-xs text-slate-500 mt-0.5">
                        Tidak ada tambahan kode unik ke jumlah donasi
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-primary-600">
                        Verifikasi lebih cepat
                      </Text>
                      <Text className="text-xs text-slate-500 mt-0.5">
                        Pembayaran terverifikasi otomatis
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs font-bold text-primary-600">
                        Pembayaran lebih mudah
                      </Text>
                      <Text className="text-xs text-slate-500 mt-0.5">
                        Tidak perlu upload bukti transfer
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Pembayaran Terjamin */}
            <View className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4">
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 rounded-xl items-center justify-center shrink-0 border border-neutral-100">
                  <Icon icon={Wallet2} size={20} color={colors.neutral[500]} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-800">
                    Pembayaran terjamin
                  </Text>
                  <Text className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Beramalbersama menjamin keamanan dana yang kamu bayarkan di tiap transaksi.
                  </Text>
                </View>
              </View>
            </View>

            {/* Keamanan Data */}
            <View className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4">
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 rounded-xl items-center justify-center shrink-0 border border-neutral-100">
                  <Icon icon={ShieldCheck} size={20} color={colors.neutral[500]} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-800">
                    Jaga keamanan datamu
                  </Text>
                  <Text className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Jangan menyebarkan bukti & data pembayaran ke pihak manapun kecuali Beramalbersama.com.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
});
