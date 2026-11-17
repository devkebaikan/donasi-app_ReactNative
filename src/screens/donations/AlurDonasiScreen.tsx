import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  Wallet,
  InfoCircle,
  ArrowLeft,
  CheckCircle,
} from '@solar-icons/react-native/Linear';
import { Icon } from '@/components/ui/Icon';
import { MetodePembayaranBottomSheet } from '@/components/shared/MetodePembayaranBottomSheet';
import { DonationConfirmDialog } from '@/components/shared/DonationConfirmDialog';
import { useAlurDonasi, MIN_DONATION_AMOUNT } from '@/hooks/useAlurDonasi';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/utils/formatCurrency';
import { colors } from '@/theme';
import type { AlurDonasiScreenProps } from '@/types/navigation';
import type { PaymentMethod } from '@/types/payment';

export default function AlurDonasiScreen({
  route,
  navigation,
}: AlurDonasiScreenProps): React.JSX.Element {
  const {
    programId,
    programTitle,
    programImageUrl,
    programLink,
    nominalType,
    presets,
    packages,
    reopenMetodePembayaran,
    preservedAmount,
    preservedNominalLabel,
    preservedMethod,
    projectSalurId,
  } = route.params;

  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const user = useAuthStore(s => s.user);

  const metodeSheetRef = useRef<BottomSheetModal>(null);
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);

  const {
    selectedAmount,
    nominalLabel,
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    methodError,
    walletBalance,
    isLoadingWalletBalance,
    isWalletInsufficient,
    donaturName,
    donaturNameError,
    donaturPhone,
    donaturPhoneError,
    isAnonymous,
    isOnBehalfEnabled,
    onBehalfOf,
    prayer,
    isSubmitting,
    confirmAmount,
    loadPaymentMethods,
    loadWalletBalance,
    selectMethod,
    presetMethod,
    setDonaturName,
    setDonaturPhone,
    setIsAnonymous,
    setIsOnBehalfEnabled,
    setOnBehalfOf,
    setPrayer,
    validateDonaturFields,
    submitDonation,
  } = useAlurDonasi({
    programId,
    initialAmount: preservedAmount ?? 0,
    initialNominalLabel: preservedNominalLabel,
    projectSalurId,
    programLink,
  });

  function openMetodeSheet(): void {
    loadPaymentMethods();
    loadWalletBalance();
    metodeSheetRef.current?.present();
  }

  // Set preserved payment method jika sudah dipilih sebelumnya
  useEffect(() => {
    if (preservedMethod) {
      presetMethod(preservedMethod);
    }
  }, [preservedMethod, presetMethod]);

  // Handle buka kembali metode jika kembali dari login
  const hasHandledReopenRef = useRef(false);
  useEffect(() => {
    if (hasHandledReopenRef.current || !reopenMetodePembayaran) {
      return;
    }
    hasHandledReopenRef.current = true;
    openMetodeSheet();
  }, [reopenMetodePembayaran]);

  // Muat ulang saldo saat autentikasi berubah
  const prevIsAuthenticatedRef = useRef(isAuthenticated);
  useEffect(() => {
    const wasUnauthenticated = !prevIsAuthenticatedRef.current;
    prevIsAuthenticatedRef.current = isAuthenticated;
    if (
      wasUnauthenticated &&
      isAuthenticated &&
      (selectedMethod?.type === 'wallet' || selectedMethod?.type === 'dompet_kebaikan')
    ) {
      loadWalletBalance();
    }
  }, [isAuthenticated, selectedMethod?.type, loadWalletBalance]);

  function handleSelectMethod(method: PaymentMethod): void {
    selectMethod(method);
    metodeSheetRef.current?.dismiss();
  }

  function handleConfirmMethod(): void {
    metodeSheetRef.current?.dismiss();
  }

  function handlePressLoginForWallet(): void {
    metodeSheetRef.current?.dismiss();
    navigation.navigate('Login', {
      redirectTo: {
        screen: 'AlurDonasi',
        params: {
          programId,
          programTitle,
          programImageUrl,
          programLink,
          nominalType,
          presets,
          packages,
          reopenMetodePembayaran: true,
          preservedAmount: selectedAmount,
          preservedNominalLabel: nominalLabel,
        },
      },
    });
  }

  function handlePressTopupForWallet(): void {
    metodeSheetRef.current?.dismiss();
    navigation.navigate('Topup');
  }

  function handleOpenConfirmDialog(): void {
    if (!validateDonaturFields()) {
      return;
    }
    if (!selectedMethod) {
      openMetodeSheet();
      return;
    }
    setIsConfirmDialogVisible(true);
  }

  function handleCloseConfirmDialog(): void {
    setIsConfirmDialogVisible(false);
  }

  async function handleConfirmSubmit(): Promise<void> {
    const result = await submitDonation();
    setIsConfirmDialogVisible(false);
    if (result) {
      navigation.replace('PaymentInvoice', {
        ...result,
        programId,
        programTitle,
        programImageUrl,
        isNewTransaction: true,
      });
    }
  }

  const isWalletType =
    selectedMethod?.type === 'wallet' ||
    selectedMethod?.type === 'dompet_kebaikan';

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      {/* Header Bar */}
      <View className="h-14 flex-row items-center px-4 border-b border-gray-100 bg-white">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center -ml-2"
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon icon={ArrowLeft} size={22} color={colors.neutral[800]} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-center font-bold text-base text-gray-800 -ml-2"
          numberOfLines={1}>
          Konfirmasi Donasi
        </Text>
        <View className="w-8" />
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerClassName="px-4 py-4 gap-3.5 pb-32"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Card 1: Nominal & Metode Pembayaran */}
          <View className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 gap-3">
            <Text className="text-sm font-bold text-gray-800">
              Nominal Donasi
            </Text>

            {/* Input Nominal */}
            <View className="relative flex-row items-center border border-gray-200 rounded-lg h-13 px-4 bg-white focus:border-primary-400">
              <Text className="text-gray-500 text-sm font-bold mr-2 pointer-events-none select-none">
                Rp
              </Text>
              <TextInput
                className="flex-1 text-base font-bold text-gray-900 p-0"
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.neutral[300]}
                value={
                  selectedAmount > 0
                    ? selectedAmount.toLocaleString('id-ID')
                    : ''
                }
                onChangeText={val => {
                  const digits = val.replace(/\D/g, '');
                  const num = digits ? parseInt(digits, 10) : 0;
                  confirmAmount(num);
                }}
                accessibilityLabel="Input nominal donasi"
              />
            </View>

            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Icon icon={InfoCircle} size={14} color="#9CA3AF" />
              <Text className="text-[11px] text-gray-400">
                Minimal donasi {formatCurrency(MIN_DONATION_AMOUNT)}
              </Text>
            </View>

            {/* Metode Pembayaran */}
            <View className="mt-2">
              <Text className="text-xs text-gray-500 font-medium mb-2">
                Metode Pembayaran
              </Text>
              <TouchableOpacity
                className="w-full flex-row items-center justify-between border border-gray-200 rounded-lg p-3.5 bg-white active:bg-gray-50"
                onPress={openMetodeSheet}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Pilih metode pembayaran">
                <View className="flex-row items-center gap-3 flex-1 min-w-0 mr-2">
                  {isWalletType ? (
                    <View className="w-7 h-7 rounded bg-primary-50 items-center justify-center">
                      <Icon
                        icon={Wallet}
                        size={18}
                        color={colors.primary[500]}
                      />
                    </View>
                  ) : selectedMethod?.image_url || selectedMethod?.logoUrl ? (
                    <Image
                      source={{
                        uri: selectedMethod.image_url || selectedMethod.logoUrl,
                      }}
                      className="w-7 h-7 rounded"
                      resizeMode="contain"
                    />
                  ) : null}
                  <Text
                    className={`text-sm truncate ${
                      selectedMethod
                        ? 'font-bold text-gray-800'
                        : 'text-gray-400'
                    }`}
                    numberOfLines={1}>
                    {selectedMethod?.name ?? 'Pilih metode pembayaran'}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1.5 rounded-lg ${
                    selectedMethod
                      ? 'bg-primary-50 border border-primary-200'
                      : 'bg-primary-500'
                  }`}>
                  <Text
                    className={`text-xs font-semibold ${
                      selectedMethod ? 'text-primary-600' : 'text-white'
                    }`}>
                    {selectedMethod ? 'Ganti' : 'Pilih'}
                  </Text>
                </View>
              </TouchableOpacity>
              {methodError ? (
                <Text className="text-xs text-red-500 mt-1">
                  {methodError}
                </Text>
              ) : null}
            </View>

            {/* Box Saldo jika Wallet */}
            {isWalletType && (
              <View className="flex-row items-center justify-between bg-primary-50 rounded-lg px-4 py-3 border border-primary-100 mt-1">
                <View className="flex-row items-center gap-2">
                  <Icon icon={Wallet} size={16} color={colors.primary[600]} />
                  <Text className="text-xs text-primary-700 font-medium">
                    Saldo Saku Kebaikan
                  </Text>
                </View>
                <Text className="text-sm font-bold text-primary-700">
                  {formatCurrency(walletBalance ?? 0)}
                </Text>
              </View>
            )}
          </View>

          {/* Card 2: Data Donatur */}
          <View className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 gap-3.5">
            <Text className="text-sm font-bold text-gray-800">
              Data Donatur
            </Text>

            {isAuthenticated ? (
              <View className="flex-row items-center gap-3 bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
                  <Text className="text-sm font-bold text-primary-700">
                    {(user?.name || 'D').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-semibold text-gray-900 truncate">
                    {user?.name || 'Donatur'}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {user?.phone || user?.email || ''}
                  </Text>
                </View>
                <View className="bg-primary-50 border border-primary-200 px-2.5 py-1 rounded-lg">
                  <Text className="text-[11px] font-semibold text-primary-600">
                    Akun
                  </Text>
                </View>
              </View>
            ) : (
              <View className="gap-3">
                <TouchableOpacity
                  className="items-center py-1"
                  onPress={() => navigation.navigate('Login')}
                  accessibilityRole="button"
                  accessibilityLabel="Login">
                  <Text className="text-xs text-gray-400">
                    Sudah punya akun?{' '}
                    <Text className="text-primary-600 font-semibold">
                      Login
                    </Text>
                  </Text>
                </TouchableOpacity>

                <View>
                  <Text className="text-xs text-gray-500 font-medium mb-1.5">
                    Nama Lengkap
                  </Text>
                  <TextInput
                    className={`w-full border rounded-lg py-3 px-4 text-sm text-gray-800 bg-white ${
                      isAnonymous
                        ? 'opacity-40 bg-gray-50 border-gray-200'
                        : donaturNameError
                        ? 'border-red-400'
                        : 'border-gray-200'
                    }`}
                    placeholder="Masukkan nama lengkap"
                    placeholderTextColor={colors.neutral[300]}
                    value={isAnonymous ? 'Hamba Allah' : donaturName}
                    onChangeText={setDonaturName}
                    editable={!isAnonymous}
                    accessibilityLabel="Input nama lengkap"
                  />
                  {donaturNameError && !isAnonymous ? (
                    <Text className="text-xs text-red-500 mt-1">
                      {donaturNameError}
                    </Text>
                  ) : null}

                  {/* Checkbox Sembunyikan Nama */}
                  <TouchableOpacity
                    className="flex-row items-center gap-2 mt-2"
                    onPress={() => setIsAnonymous(!isAnonymous)}
                    activeOpacity={0.8}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isAnonymous }}>
                    {isAnonymous ? (
                      <Icon
                        icon={CheckCircle}
                        size={18}
                        color={colors.primary[500]}
                      />
                    ) : (
                      <View className="w-4.5 h-4.5 rounded border border-gray-300 bg-white" />
                    )}
                    <Text className="text-xs text-gray-500">
                      Sembunyikan nama{' '}
                      <Text className="text-gray-400">
                        (sebagai Hamba Allah)
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <Text className="text-xs text-gray-500 font-medium mb-1.5">
                    Nomor WhatsApp
                  </Text>
                  <TextInput
                    className={`w-full border rounded-lg py-3 px-4 text-sm text-gray-800 bg-white ${
                      donaturPhoneError ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="08xx-xxxx-xxxx"
                    placeholderTextColor={colors.neutral[300]}
                    keyboardType="phone-pad"
                    value={donaturPhone}
                    onChangeText={setDonaturPhone}
                    accessibilityLabel="Input nomor WhatsApp"
                  />
                  {donaturPhoneError ? (
                    <Text className="text-xs text-red-500 mt-1">
                      {donaturPhoneError}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}

            {/* Doa & Pesan */}
            <View className="mt-1">
              <Text className="text-xs text-gray-500 font-medium mb-1.5">
                Doa & Pesan{' '}
                <Text className="text-gray-300 font-normal">(opsional)</Text>
              </Text>
              <TextInput
                className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-800 bg-white min-h-[80px]"
                placeholder="Tuliskan doa atau pesan Anda..."
                placeholderTextColor={colors.neutral[300]}
                multiline
                textAlignVertical="top"
                value={prayer}
                onChangeText={setPrayer}
                accessibilityLabel="Input doa dan pesan"
              />
            </View>
          </View>

          {/* Card 3: Donasi untuk Orang Lain */}
          <View className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold text-gray-800">
                  Donasi untuk Orang Lain
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  Niatkan donasi ini atas nama seseorang
                </Text>
              </View>
              <Switch
                value={isOnBehalfEnabled}
                onValueChange={setIsOnBehalfEnabled}
                trackColor={{ false: '#E5E7EB', true: colors.primary[500] }}
                thumbColor="#FFFFFF"
              />
            </View>

            {isOnBehalfEnabled && (
              <View className="mt-3.5 pt-3 border-t border-gray-100 gap-2.5">
                <Text className="text-xs text-gray-500 font-medium">
                  Nama Penerima / Atas Nama
                </Text>
                <TextInput
                  className="w-full border border-gray-200 rounded-lg py-3 px-4 text-sm text-gray-800 bg-white"
                  placeholder="cth. Almarhum Bapak Ahmad, Ibu Siti..."
                  placeholderTextColor={colors.neutral[300]}
                  value={onBehalfOf}
                  onChangeText={setOnBehalfOf}
                  accessibilityLabel="Input nama penerima donasi"
                />
                <View className="flex-row items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-100 mt-1">
                  <Icon icon={InfoCircle} size={15} color="#D97706" />
                  <Text className="text-xs text-amber-700 leading-relaxed flex-1">
                    Nama ini akan dicantumkan sebagai penerima manfaat donasi ini.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3 shadow-lg"
        style={{ paddingBottom: insets.bottom + 12 }}>
        <TouchableOpacity
          className={`w-full bg-secondary-500 rounded-lg py-3.5 items-center justify-center ${
            isSubmitting ? 'opacity-60' : 'active:bg-secondary-600'
          }`}
          onPress={handleOpenConfirmDialog}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Konfirmasi Donasi"
          accessibilityState={{ disabled: isSubmitting }}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text className="text-white font-semibold text-sm">
              Konfirmasi Donasi
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Method Bottom Sheet */}
      <MetodePembayaranBottomSheet
        ref={metodeSheetRef}
        paymentMethods={paymentMethods}
        isLoadingMethods={isLoadingMethods}
        selectedMethod={selectedMethod}
        isAuthenticated={isAuthenticated}
        walletBalance={walletBalance}
        isLoadingWalletBalance={isLoadingWalletBalance}
        isWalletInsufficient={isWalletInsufficient}
        amount={selectedAmount}
        onSelectMethod={handleSelectMethod}
        onPressLoginForWallet={handlePressLoginForWallet}
        onPressTopupForWallet={handlePressTopupForWallet}
        onConfirm={handleConfirmMethod}
      />

      {/* Confirmation Dialog */}
      <DonationConfirmDialog
        visible={isConfirmDialogVisible}
        isLoading={isSubmitting}
        amount={selectedAmount}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCloseConfirmDialog}
      />
    </View>
  );
}
