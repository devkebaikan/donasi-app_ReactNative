import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  AltArrowLeft,
  Sun2,
  CheckCircle,
  Card,
  ShieldCheck,
  ClockCircle,
  HandHeart,
  Heart,
  Star,
} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {MetodePembayaranBottomSheet} from '@/components/shared/MetodePembayaranBottomSheet';
import {
  ROUTINE_PACKAGES,
  storeCampaignRoutine,
  type CampaignRoutinePackage,
} from '@/services/campaignRoutineService';
import {getInfakPaymentMethods} from '@/services/infakService';
import {useAuthStore} from '@/stores/authStore';
import {formatRupiah} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';
import type {SedekahSubuhScreenProps} from '@/types/navigation';
import type {PaymentMethod} from '@/types/payment';

export default function SedekahSubuhScreen({
  navigation,
}: SedekahSubuhScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const methodSheetRef = useRef<BottomSheetModal>(null);

  const authUser = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => Boolean(s.accessToken));
  const walletBalance = authUser?.dompet_kebaikan?.saldo ?? 0;
  const isLoadingWallet = false;

  const [selectedPackage, setSelectedPackage] = useState<CampaignRoutinePackage>(
    (ROUTINE_PACKAGES.find(p => p.isPopular) || ROUTINE_PACKAGES[3])!,
  );

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [doa, setDoa] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const methods = await getInfakPaymentMethods();
        setPaymentMethods(methods);
        if (methods.length > 0) {
          const defaultM =
            methods.find(
              m =>
                m.name.toLowerCase().includes('bsi') ||
                m.name.toLowerCase().includes('syariah') ||
                m.name.toLowerCase().includes('qris'),
            ) || methods[0];
          setSelectedMethod(defaultM || null);
        }
      } catch {
        // safe fallback
      } finally {
        setIsLoadingMethods(false);
      }
    }
    init();
  }, []);

  async function handleSubmit() {
    if (isSubmitting) return;

    if (!selectedMethod) {
      showToast('Silakan pilih metode pembayaran');
      return;
    }

    const name = isAuthenticated
      ? authUser?.name || 'Sahabat Kebaikan'
      : isAnonymous
        ? 'Hamba Allah'
        : guestName.trim();

    const phone = isAuthenticated
      ? authUser?.phone || ''
      : guestPhone.trim();

    if (!isAuthenticated && (!name || !phone)) {
      showToast('Nama dan nomor WhatsApp wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await storeCampaignRoutine({
        programId: '3',
        nominal: selectedPackage.nominal,
        total: selectedPackage.total,
        days: selectedPackage.days,
        paymentMethodId: selectedMethod.id,
        name,
        phone,
        doa: doa.trim() || undefined,
        is_anonymous: isAnonymous ? 1 : 0,
      });

      navigation.replace('PaymentInvoice', {
        donationId: res.donationId,
        invoiceId: res.invoice,
        paymentMethod: selectedMethod.name,
        bankName: res.bankName || selectedMethod.name,
        accountNumber: res.accountNumber || selectedMethod.account_number,
        amount: selectedPackage.total,
        adminFee: 0,
        totalAmount: res.totalAmount || selectedPackage.total,
        expiredAt: '',
      });
    } catch (err: any) {
      showToast(err?.message || 'Gagal mendaftarkan sedekah subuh, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50">
      {/* Header */}
      <View
        style={{paddingTop: Math.max(insets.top, 12)}}
        className="bg-white px-4 pb-3 flex-row items-center border-b border-gray-100 shadow-xs z-10">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full items-center justify-center bg-gray-50 active:bg-gray-100 mr-2"
          accessibilityLabel="Kembali">
          <Icon icon={AltArrowLeft} size={22} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">Sedekah Subuh</Text>
          <Text className="text-[11px] text-gray-400">
            Mulai Rp1.000 sehari terjaga selama 30 hari
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{paddingBottom: insets.bottom + 100}}
        keyboardShouldPersistTaps="handled">
        {/* Hero Section */}
        <View className="bg-emerald-800 px-5 pt-6 pb-8">
          <View className="bg-emerald-700/80 self-start px-3 py-1 rounded-full flex-row items-center gap-1.5 mb-3">
            <Icon icon={Sun2} size={14} color="#FDE047" />
            <Text className="text-xs font-bold text-emerald-100">
              Gerakan Istiqamah Subuh
            </Text>
          </View>

          <Text className="text-2xl font-black text-white leading-tight">
            Sedekah Mulai Rp1.000 Sehari
          </Text>
          <Text className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
            Cukup sekali transfer untuk 30 subuh terjaga. Sedekah Anda disalurkan
            bertahap oleh amil resmi setiap fajar menjelang.
          </Text>

          {/* 3 Keunggulan */}
          <View className="flex-row items-center gap-2 mt-4 flex-wrap">
            <View className="flex-row items-center gap-1 bg-emerald-900/60 px-2.5 py-1 rounded-lg">
              <Icon icon={ShieldCheck} size={13} color="#A7F3D0" />
              <Text className="text-[10px] text-emerald-200 font-medium">
                Resmi & Terverifikasi
              </Text>
            </View>
            <View className="flex-row items-center gap-1 bg-emerald-900/60 px-2.5 py-1 rounded-lg">
              <Icon icon={ClockCircle} size={13} color="#A7F3D0" />
              <Text className="text-[10px] text-emerald-200 font-medium">
                Tanpa Autodebet
              </Text>
            </View>
            <View className="flex-row items-center gap-1 bg-emerald-900/60 px-2.5 py-1 rounded-lg">
              <Icon icon={HandHeart} size={13} color="#A7F3D0" />
              <Text className="text-[10px] text-emerald-200 font-medium">
                Penyaluran Tiap Subuh
              </Text>
            </View>
          </View>
        </View>

        <View className="p-4 space-y-4">
          {/* Pilihan Paket Sedekah Rutin 30 Hari */}
          <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-bold text-gray-800">
                Pilih Paket Sedekah 30 Hari
              </Text>
              <Text className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                30 Hari Penuh
              </Text>
            </View>

            <View className="space-y-2.5">
              {ROUTINE_PACKAGES.map(pkg => {
                const isSelected = selectedPackage.nominal === pkg.nominal;
                return (
                  <TouchableOpacity
                    key={pkg.nominal}
                    onPress={() => setSelectedPackage(pkg)}
                    activeOpacity={0.7}
                    className={`p-3.5 rounded-xl border flex-row items-center justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-gray-200 bg-white'
                    }`}>
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`w-5 h-5 rounded-full border items-center justify-center ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-gray-300'
                        }`}>
                        {isSelected && (
                          <View className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </View>
                      <View>
                        <View className="flex-row items-center gap-1.5">
                          <Text className="text-sm font-extrabold text-gray-900">
                            {formatRupiah(pkg.total)}
                          </Text>
                          {pkg.isPopular && (
                            <View className="bg-amber-100 px-1.5 py-0.5 rounded flex-row items-center gap-0.5">
                              <Icon icon={Star} size={10} color="#D97706" />
                              <Text className="text-[9px] font-bold text-amber-800">
                                Favorit
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-gray-500 mt-0.5">
                          {pkg.dailyText} • {pkg.monthlyText}
                        </Text>
                      </View>
                    </View>

                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? 'text-emerald-700' : 'text-gray-400'
                      }`}>
                      {pkg.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Metode Pembayaran */}
          <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <Text className="text-sm font-bold text-gray-800 mb-3">
              Metode Pembayaran
            </Text>

            <TouchableOpacity
              onPress={() => methodSheetRef.current?.present()}
              activeOpacity={0.7}
              className="w-full flex-row items-center justify-between border border-gray-200 rounded-xl p-3.5 bg-gray-50/50">
              <View className="flex-row items-center gap-3 flex-1 mr-2">
                {selectedMethod?.image_url ? (
                  <Image
                    source={{uri: selectedMethod.image_url}}
                    className="w-10 h-7 rounded"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="w-10 h-7 rounded bg-gray-100 items-center justify-center">
                    <Icon icon={Card} size={18} color="#9CA3AF" />
                  </View>
                )}
                <Text
                  numberOfLines={1}
                  className="text-sm font-bold text-gray-800 flex-1">
                  {selectedMethod?.name || 'Pilih metode pembayaran'}
                </Text>
              </View>

              <View className="bg-emerald-500 rounded-lg px-3 py-1.5">
                <Text className="text-xs font-bold text-white">Ganti</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Data Donatur */}
          <View className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
            <Text className="text-sm font-bold text-gray-800 mb-3">
              Data Donatur
            </Text>

            {isAuthenticated ? (
              <View className="flex-row items-center gap-3 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
                  <Text className="text-base font-bold text-emerald-700">
                    {(authUser?.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-800">
                    {authUser?.name || 'Donatur'}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {authUser?.phone || '-'}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="space-y-3">
                <View>
                  <Text className="text-xs text-gray-500 font-medium mb-1.5">
                    Nama Lengkap
                  </Text>
                  <TextInput
                    editable={!isAnonymous}
                    placeholder={isAnonymous ? 'Hamba Allah' : 'Masukkan nama lengkap'}
                    placeholderTextColor="#9CA3AF"
                    value={isAnonymous ? 'Hamba Allah' : guestName}
                    onChangeText={setGuestName}
                    className={`border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 ${
                      isAnonymous ? 'bg-gray-100 opacity-60' : 'bg-white'
                    }`}
                  />
                  <TouchableOpacity
                    onPress={() => setIsAnonymous(prev => !prev)}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-2 mt-2">
                    <View
                      className={`w-4 h-4 rounded border items-center justify-center ${
                        isAnonymous
                          ? 'bg-emerald-600 border-emerald-600'
                          : 'border-gray-300'
                      }`}>
                      {isAnonymous && <Text className="text-white text-[10px]">✓</Text>}
                    </View>
                    <Text className="text-xs text-gray-500">
                      Sembunyikan nama{' '}
                      <Text className="text-gray-400 italic">(Hamba Allah)</Text>
                    </Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <Text className="text-xs text-gray-500 font-medium mb-1.5">
                    Nomor WhatsApp
                  </Text>
                  <TextInput
                    keyboardType="phone-pad"
                    placeholder="08xxxxxxxxxx"
                    placeholderTextColor="#9CA3AF"
                    value={guestPhone}
                    onChangeText={setGuestPhone}
                    className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-800 bg-white"
                  />
                </View>
              </View>
            )}

            {/* Doa */}
            <View className="pt-3 border-t border-gray-100 mt-4">
              <Text className="text-xs text-gray-500 font-medium mb-1.5">
                Doa atau Niat Kebaikan{' '}
                <Text className="text-gray-400 font-normal">(opsional)</Text>
              </Text>
              <TextInput
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Tuliskan doa untuk diri, keluarga, atau orang tua..."
                placeholderTextColor="#9CA3AF"
                value={doa}
                onChangeText={setDoa}
                className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-white min-h-[72px]"
              />
            </View>
          </View>

          {/* Cara Kerja Ringkas */}
          <View className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 space-y-2">
            <Text className="text-xs font-bold text-emerald-900">
              Bagaimana Sedekah Subuh Berjalan?
            </Text>
            <Text className="text-[11px] text-emerald-800 leading-relaxed">
              1. Anda transfer sekali sesuai paket pilihan (30 hari).{'\n'}
              2. Dana amanah dipegang dan dicatat yayasan resmi.{'\n'}
              3. Amil menyalurkan sedekah Anda ke mustahik dan program kebaikan
              setiap waktu subuh selama 30 hari berturut-turut.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View
        style={{paddingBottom: Math.max(insets.bottom, 12)}}
        className="bg-white border-t border-gray-100 px-5 pt-3 flex-row items-center justify-between shadow-lg">
        <View className="flex-1 mr-3">
          <Text className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Total (30 Hari)
          </Text>
          <Text className="text-base font-extrabold text-gray-900 mt-0.5">
            {formatRupiah(selectedPackage.total)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
          className={`py-3.5 px-6 rounded-xl flex-row items-center justify-center shadow-xs ${
            isSubmitting
              ? 'bg-gray-300 opacity-70'
              : 'bg-emerald-600 active:bg-emerald-700'
          }`}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text className="text-sm font-bold text-white">
              Mulai Sedekah Subuh
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Payment Methods */}
      <MetodePembayaranBottomSheet
        ref={methodSheetRef}
        paymentMethods={paymentMethods}
        isLoadingMethods={isLoadingMethods}
        selectedMethod={selectedMethod}
        isAuthenticated={isAuthenticated}
        walletBalance={walletBalance}
        isLoadingWalletBalance={isLoadingWallet}
        amount={selectedPackage.total}
        onSelectMethod={m => {
          setSelectedMethod(m);
          methodSheetRef.current?.dismiss();
        }}
        onConfirm={() => methodSheetRef.current?.dismiss()}
      />
    </KeyboardAvoidingView>
  );
}
