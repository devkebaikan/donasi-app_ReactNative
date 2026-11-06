import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Wallet} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {Button} from '@/components/ui/Button';
import {NominalBottomSheet} from '@/components/shared/NominalBottomSheet';
import {MetodePembayaranBottomSheet} from '@/components/shared/MetodePembayaranBottomSheet';
import {DonationOptionToggle} from '@/components/shared/DonationOptionToggle';
import {DonationConfirmDialog} from '@/components/shared/DonationConfirmDialog';
import {useAlurDonasi} from '@/hooks/useAlurDonasi';
import {useAuthStore} from '@/stores/authStore';
import {formatCurrency} from '@/utils/formatCurrency';
import {colors} from '@/theme';
import type {AlurDonasiScreenProps} from '@/types/navigation';
import type {PaymentMethod} from '@/types/payment';

export default function AlurDonasiScreen({
  route,
  navigation,
}: AlurDonasiScreenProps): React.JSX.Element {
  const {
    programId,
    programTitle,
    programImageUrl,
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

  const nominalSheetRef = useRef<BottomSheetModal>(null);
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
  });

  function openMetodeSheet(): void {
    loadPaymentMethods();
    loadWalletBalance();
    metodeSheetRef.current?.present();
  }

  // Jika dipanggil dari DetailProgramScreen dengan metode yang sudah
  // dipilih (alur baru, Step 1 & 2 dipilih di sana), langsung pakai metode itu.
  useEffect(() => {
    if (preservedMethod) {
      presetMethod(preservedMethod);
    }
  }, [preservedMethod, presetMethod]);

  // Handle pembukaan kembali MetodePembayaranBottomSheet jika user
  // baru saja kembali dari alur login/register (kasus: user anonim pilih
  // Saku Kebaikan di step 2, lalu diminta login dulu).
  const hasHandledReopenRef = useRef(false);
  useEffect(() => {
    if (hasHandledReopenRef.current || !reopenMetodePembayaran) {
      return;
    }
    hasHandledReopenRef.current = true;
    openMetodeSheet();
  }, [reopenMetodePembayaran]);

  // Jika user tadinya guest lalu berhasil login (mis. lewat header profil
  // atau navigasi lain) saat metode Saku Kebaikan sedang aktif, muat ulang
  // saldo saku agar status "saldo tidak cukup" langsung ter-update.
  const prevIsAuthenticatedRef = useRef(isAuthenticated);
  useEffect(() => {
    const wasUnauthenticated = !prevIsAuthenticatedRef.current;
    prevIsAuthenticatedRef.current = isAuthenticated;
    if (wasUnauthenticated && isAuthenticated && selectedMethod?.type === 'wallet') {
      loadWalletBalance();
    }
  }, [isAuthenticated, selectedMethod?.type, loadWalletBalance]);

  function handleConfirmAmount(amount: number, label: string): void {
    confirmAmount(amount, label);
    nominalSheetRef.current?.dismiss();
    openMetodeSheet();
  }

  function handleSelectMethod(method: PaymentMethod): void {
    selectMethod(method);
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

  function handleChangeProgram(): void {
    navigation.reset({
      index: 0,
      routes: [{name: 'Home', params: {screen: 'Donations'}}],
    });
  }

  function openConfirmDialog(): void {
    if (!validateDonaturFields()) {
      return;
    }
    setIsConfirmDialogVisible(true);
  }

  function closeConfirmDialog(): void {
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

  const hasSummary = selectedAmount > 0 && selectedMethod !== null;

  return (
    <View className="flex-1 bg-neutral-50" style={{paddingTop: insets.top}}>
      <HeaderLight
        title="Donasi Sekarang"
        onBack={() => navigation.goBack()}
      />

      {hasSummary && selectedMethod ? (
        <ScrollView
          contentContainerClassName="p-4 gap-4 pb-12"
          showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-xl p-4 gap-3 border border-neutral-100 shadow-sm">
            <View className="flex-row items-center gap-3">
              <Image
                source={{uri: programImageUrl}}
                className="w-18 h-10 rounded-md bg-neutral-200"
                style={{width: 72, height: (72 * 9) / 16}}
              />
              <Text className="flex-1 text-base font-semibold text-neutral-900" numberOfLines={2}>
                {programTitle}
              </Text>
              <TouchableOpacity
                className="min-h-[44px] self-center justify-center px-2"
                onPress={handleChangeProgram}
                accessibilityRole="button"
                accessibilityLabel="Ubah program">
                <Text className="text-sm font-medium text-primary-500">Ubah</Text>
              </TouchableOpacity>
            </View>

            <View className="h-px bg-neutral-200" />

            <View className="flex-row items-center justify-between">
              <View className="gap-0.5">
                <Text className="text-sm text-neutral-500">{nominalLabel}</Text>
                <Text className="text-base font-semibold text-neutral-900">
                  {formatCurrency(selectedAmount)}
                </Text>
              </View>
              <TouchableOpacity
                className="min-h-[44px] self-center justify-center px-2"
                onPress={() => nominalSheetRef.current?.present()}
                accessibilityRole="button"
                accessibilityLabel="Ubah nominal donasi">
                <Text className="text-sm font-medium text-primary-500">Ubah</Text>
              </TouchableOpacity>
            </View>

            <View className="h-px bg-neutral-200" />

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 flex-1">
                {selectedMethod.type === 'wallet' ? (
                  <View className="w-7 h-7 rounded-sm bg-primary-50 items-center justify-center">
                    <Icon icon={Wallet} size={18} color={colors.primary[500]} />
                  </View>
                ) : selectedMethod.logoUrl ? (
                  <Image
                    source={{uri: selectedMethod.logoUrl}}
                    className="w-7 h-7 rounded-sm"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="w-7 h-7 rounded-sm bg-neutral-100" />
                )}
                <Text className="text-base font-semibold text-neutral-900">{selectedMethod.name}</Text>
              </View>
              <TouchableOpacity
                className="min-h-[44px] self-center justify-center px-2"
                onPress={openMetodeSheet}
                accessibilityRole="button"
                accessibilityLabel="Ubah metode pembayaran">
                <Text className="text-sm font-medium text-primary-500">Ubah</Text>
              </TouchableOpacity>
            </View>
          </View>

          {methodError ? (
            <Text className="text-sm text-semantic-error" accessibilityLiveRegion="polite">
              {methodError}
            </Text>
          ) : null}

          <View className="bg-white rounded-xl p-4 gap-4 border border-neutral-100 shadow-sm">
            <View className="gap-2">
              <Text className="text-base font-medium text-neutral-900">Nama Lengkap</Text>
              {isAuthenticated ? (
                <Text className="text-base font-medium text-neutral-900">{user?.name}</Text>
              ) : (
                <TextInput
                  className="h-12 border border-neutral-200 rounded-md px-3 text-base text-neutral-900 bg-white"
                  value={donaturName}
                  onChangeText={setDonaturName}
                  placeholder="Tulis nama lengkap"
                  placeholderTextColor={colors.neutral[400]}
                  accessibilityLabel="Nama Lengkap"
                />
              )}
              {donaturNameError ? (
                <Text className="text-sm text-semantic-error" accessibilityLiveRegion="polite">
                  {donaturNameError}
                </Text>
              ) : null}
            </View>
            <View className="gap-2">
              <Text className="text-base font-medium text-neutral-900">Nomor WhatsApp</Text>
              {isAuthenticated ? (
                <Text className="text-base font-medium text-neutral-900">{user?.phone}</Text>
              ) : (
                <View className="flex-row items-center h-12 border border-neutral-200 rounded-md px-3 gap-1 bg-white">
                  <Text className="text-base font-medium text-neutral-500">+62</Text>
                  <TextInput
                    className="flex-1 text-base text-neutral-900 p-0"
                    value={donaturPhone}
                    onChangeText={setDonaturPhone}
                    placeholder="8xx-xxxx-xxxx"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="phone-pad"
                    accessibilityLabel="Nomor WhatsApp"
                  />
                </View>
              )}
              {donaturPhoneError ? (
                <Text className="text-sm text-semantic-error" accessibilityLiveRegion="polite">
                  {donaturPhoneError}
                </Text>
              ) : null}
            </View>
            <DonationOptionToggle
              label="Sembunyikan nama"
              sublabel="(tampil sebagai Hamba Allah)"
              value={isAnonymous}
              onValueChange={setIsAnonymous}
            />
            <View className="gap-2">
              <View className="flex-row items-center gap-1">
                <Text className="text-base font-medium text-neutral-900">Do'a atau Pesan</Text>
                <Text className="text-xs text-neutral-400">(opsional)</Text>
              </View>
              <TextInput
                className="h-22 border border-neutral-200 rounded-md px-3 pt-2 text-base text-neutral-900 bg-white"
                style={{textAlignVertical: 'top'}}
                value={prayer}
                onChangeText={setPrayer}
                placeholder="Tulis Do'a atau Pesan..."
                placeholderTextColor={colors.neutral[400]}
                multiline
                accessibilityLabel="Do'a atau Pesan (opsional)"
              />
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 gap-4 border border-neutral-100 shadow-sm">
            <DonationOptionToggle
              label="Donasi atas nama orang lain"
              value={isOnBehalfEnabled}
              onValueChange={setIsOnBehalfEnabled}
              inputValue={onBehalfOf}
              onInputChange={setOnBehalfOf}
              inputPlaceholder="Nama penerima manfaat"
            />
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-base text-neutral-500 text-center">
            Lengkapi nominal dan metode pembayaran untuk melanjutkan donasi.
          </Text>
        </View>
      )}

      <View
        className="p-4 bg-white border-t border-neutral-200"
        style={{paddingBottom: insets.bottom + 12}}>
        <Button
          label="Lanjutkan Donasi"
          onPress={openConfirmDialog}
          isDisabled={isSubmitting || !hasSummary}
          size="lg"
        />
      </View>

      <NominalBottomSheet
        ref={nominalSheetRef}
        programTitle={programTitle}
        programImageUrl={programImageUrl}
        nominalType={nominalType}
        presets={presets?.map(preset => ({
          amount: preset.nominal,
          iconUrl: preset.iconUrl,
          label: preset.label,
        }))}
        packages={packages}
        onConfirm={handleConfirmAmount}
      />
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

      <DonationConfirmDialog
        visible={isConfirmDialogVisible}
        isLoading={isSubmitting}
        amount={selectedAmount}
        onConfirm={handleConfirmSubmit}
        onCancel={closeConfirmDialog}
      />
    </View>
  );
}
