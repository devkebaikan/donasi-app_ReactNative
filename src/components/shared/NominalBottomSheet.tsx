import React, {forwardRef, useCallback, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {EmptyState} from '@/components/ui/EmptyState';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {PackageOptionItem} from '@/components/shared/PackageOptionItem';
import {Box} from '@solar-icons/react-native/Linear';
import {colors} from '@/theme';
import {formatCurrency, formatNumberWithSeparator} from '@/utils/formatCurrency';
import {sanitizeImageUrl} from '@/utils/imageUrl';
import {MIN_DONATION_AMOUNT} from '@/hooks/useAlurDonasi';
import {getNominalOptions} from '@/services/donationService';
import type {DonationPackage} from '@/types/programDetail';
import type {NominalOption} from '@/types/payment';

export type AmountPreset = NominalOption;

interface NominalBottomSheetProps {
  programTitle: string;
  programImageUrl: string;
  onConfirm: (amount: number, label: string) => void;
  nominalType?: 'biasa' | 'paket';
  program_link?: string;
  nominal_options?: NominalOption[];
  presets?: any[];
  packages?: DonationPackage[];
  minAmount?: number;
  sectionTitle?: string;
  confirmLabel?: string;
  presetLayout?: 'list' | 'grid';
}

export const NominalBottomSheet = forwardRef<
  BottomSheetModal,
  NominalBottomSheetProps
>(function NominalBottomSheetComponent(
  {
    programTitle,
    programImageUrl,
    onConfirm,
    nominalType = 'biasa',
    program_link,
    nominal_options,
    presets,
    packages = [],
    minAmount = MIN_DONATION_AMOUNT,
    confirmLabel = 'Lanjut Donasi',
  },
  ref,
): React.JSX.Element {
  const [options, setOptions] = useState<NominalOption[]>(nominal_options || []);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<DonationPackage | null>(
    null,
  );
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (nominal_options && nominal_options.length > 0) {
      setOptions(nominal_options);
      return;
    }

    if (presets && presets.length > 0) {
      const normalized = presets.map((p, idx) => ({
        id: p.id ?? idx + 1,
        nama_pilihan: p.nama_pilihan ?? p.label ?? '',
        nominal: Number(p.nominal ?? p.amount ?? 0),
      }));
      setOptions(normalized);
      return;
    }

    if (program_link) {
      setIsLoadingOptions(true);
      getNominalOptions(program_link)
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            setOptions(res.data);
          }
        })
        .finally(() => {
          setIsLoadingOptions(false);
        });
    }
  }, [nominal_options, presets, program_link]);

  const isPaket = nominalType === 'paket';

  const amount = isPaket
    ? (selectedPackage?.nominal ?? 0) * packageQuantity
    : customAmount
    ? Number(customAmount.replace(/\D/g, '')) || 0
    : selectedPreset ?? 0;

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  function handleSelectPreset(preset: number): void {
    setSelectedPreset(preset);
    setCustomAmount('');
    setError(null);
  }

  function handleChangeCustomAmount(value: string): void {
    const digits = value.replace(/\D/g, '');
    setCustomAmount(digits);
    setSelectedPreset(null);
    setError(null);
  }

  function handleSelectPackage(pkg: DonationPackage): void {
    setSelectedPackage(pkg);
    setPackageQuantity(1);
    setError(null);
  }

  function handleIncrementPackage(): void {
    setPackageQuantity(q => q + 1);
  }

  function handleDecrementPackage(): void {
    setPackageQuantity(q => Math.max(1, q - 1));
  }

  function getConfirmLabel(): string {
    if (isPaket) {
      return `${selectedPackage?.label ?? ''} x ${packageQuantity}`;
    }
    if (selectedPreset !== null) {
      const option = options.find(p => p.nominal === selectedPreset);
      return option?.nama_pilihan || 'Nominal Donasi';
    }
    return 'Nominal Donasi';
  }

  function handleConfirm(): void {
    if (amount < minAmount) {
      setError(`Minimal donasi ${formatCurrency(minAmount)}`);
      return;
    }
    onConfirm(amount, getConfirmLabel());
  }

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['75%']}
      enableDynamicSizing={false}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      backgroundStyle={{backgroundColor: '#FFFFFF'}}
      handleIndicatorStyle={{backgroundColor: colors.neutral[300]}}>
      <View className="px-5 pt-2 pb-3 border-b border-neutral-100">
        <View className="flex-row items-center gap-3 mb-2">
          <Image
            source={{uri: sanitizeImageUrl(programImageUrl)}}
            className="w-16 h-10 rounded-md bg-neutral-100"
            resizeMode="cover"
          />
          <Text className="flex-1 text-sm font-semibold text-neutral-900" numberOfLines={2}>
            {programTitle}
          </Text>
        </View>
        <Text className="text-base font-bold text-neutral-900">
          {isPaket ? 'Pilih Paket Donasi' : 'Masukkan Nominal'}
        </Text>
      </View>

      {isPaket && packages.length === 0 ? (
        <EmptyState icon={Box} title="Belum ada paket donasi tersedia" />
      ) : (
        <BottomSheetScrollView
          contentContainerClassName="px-5 py-4 gap-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {isPaket ? (
            <View className="gap-2.5">
              {packages.map(pkg => (
                <PackageOptionItem
                  key={pkg.id}
                  item={pkg}
                  isSelected={selectedPackage?.id === pkg.id}
                  quantity={packageQuantity}
                  onSelect={() => handleSelectPackage(pkg)}
                  onIncrement={handleIncrementPackage}
                  onDecrement={handleDecrementPackage}
                />
              ))}
            </View>
          ) : (
            <>
              {/* Preset 2x2 Grid */}
              {isLoadingOptions ? (
                <View className="py-4 items-center justify-center">
                  <ActivityIndicator color={colors.primary[500]} />
                </View>
              ) : options.length > 0 ? (
                <View className="flex-row flex-wrap justify-between gap-y-3">
                  {options.map((option, index) => {
                    const isSelected = selectedPreset === option.nominal;
                    return (
                      <TouchableOpacity
                        key={option.id || option.nominal}
                        testID={`nominal-preset-${option.nominal}`}
                        className={`relative w-[48%] border-2 rounded-lg p-3.5 items-center justify-center ${
                          isSelected
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-primary-200 bg-white'
                        }`}
                        onPress={() => handleSelectPreset(option.nominal)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={formatCurrency(option.nominal)}
                        accessibilityState={{selected: isSelected}}>
                        {index === 1 && (
                          <View className="absolute -top-2.5 -right-1.5 bg-secondary-500 px-2 py-0.5 rounded-t-xl rounded-br-xl max-w-[90%]">
                            <Text className="text-[10px] text-white font-bold" numberOfLines={1}>
                              Nominal favorit
                            </Text>
                          </View>
                        )}
                        <Text
                          className={`text-sm font-bold ${
                            isSelected ? 'text-white' : 'text-neutral-700'
                          }`}>
                          {formatCurrency(option.nominal)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}

              {/* Custom Input */}
              <View className="gap-1.5">
                <Text className="text-xs text-neutral-500 font-medium">
                  Atau masukkan nominal lainnya
                </Text>
                <View
                  className={`flex-row items-center border rounded-lg px-3 h-12 bg-white ${
                    error ? 'border-semantic-error' : 'border-neutral-300'
                  }`}>
                  <Text className="text-sm font-bold text-neutral-500 mr-2">Rp</Text>
                  <TextInput
                    className="flex-1 text-sm font-bold text-neutral-900 p-0"
                    value={
                      customAmount
                        ? formatNumberWithSeparator(Number(customAmount))
                        : ''
                    }
                    onChangeText={handleChangeCustomAmount}
                    keyboardType="number-pad"
                    placeholder="Masukkan nominal"
                    placeholderTextColor={colors.neutral[400]}
                    accessibilityLabel="Input nominal donasi custom"
                  />
                </View>
              </View>
            </>
          )}
        </BottomSheetScrollView>
      )}

      <SafeAreaFooter>
        {isPaket ? (
          <View className="flex-row items-center justify-between py-1">
            <Text className="text-sm text-neutral-600">Total</Text>
            <Text className="text-lg font-bold text-neutral-900">
              {formatCurrency(amount)}
            </Text>
          </View>
        ) : null}

        {error ? (
          <Text className="text-xs text-semantic-error" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          className={`w-full py-3.5 rounded-lg items-center justify-center ${
            isPaket && (packages.length === 0 || !selectedPackage)
              ? 'bg-neutral-300'
              : 'bg-secondary-500 active:bg-secondary-600'
          }`}
          onPress={handleConfirm}
          activeOpacity={0.8}
          disabled={isPaket && (packages.length === 0 || !selectedPackage)}>
          <Text className="text-white font-bold text-sm">{confirmLabel}</Text>
        </TouchableOpacity>
      </SafeAreaFooter>
    </BottomSheetModal>
  );
});
