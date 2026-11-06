import React, {forwardRef, useCallback, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import type {BottomSheetBackdropProps} from '@gorhom/bottom-sheet';
import {Button} from '@/components/ui/Button';
import {EmptyState} from '@/components/ui/EmptyState';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {PackageOptionItem} from '@/components/shared/PackageOptionItem';
import {Box} from '@solar-icons/react-native/Linear';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import {formatCurrency, formatNumberWithSeparator} from '@/utils/formatCurrency';
import {sanitizeImageUrl} from '@/utils/imageUrl';
import {MIN_DONATION_AMOUNT} from '@/hooks/useAlurDonasi';
import type {DonationPackage} from '@/types/programDetail';

export interface AmountPreset {
  amount: number;
  impact?: string;
  iconUrl?: string;
  label?: string; // "Nama Pilihan" — nama tampilan preset, dirender di atas nominal
}

const DEFAULT_AMOUNT_PRESETS: AmountPreset[] = [
  {amount: 1_000_000, impact: 'Setara 5 tahun pendidikan anak'},
  {amount: 500_000, impact: 'Setara 500 buku bacaan'},
  {amount: 70_000, impact: 'Setara 1 paket sembako'},
  {amount: 50_000, impact: 'Dukung program ini'},
];

interface NominalBottomSheetProps {
  programTitle: string;
  programImageUrl: string;
  onConfirm: (amount: number, label: string) => void;
  nominalType?: 'biasa' | 'paket';
  presets?: AmountPreset[];
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
    presets = DEFAULT_AMOUNT_PRESETS,
    packages = [],
    minAmount = MIN_DONATION_AMOUNT,
    sectionTitle,
    confirmLabel = 'Lanjutkan Donasi',
    presetLayout = 'list',
  },
  ref,
): React.JSX.Element {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<DonationPackage | null>(
    null,
  );
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const isPaket = nominalType === 'paket';
  const resolvedSectionTitle =
    sectionTitle ?? (isPaket ? 'Pilih paket donasi' : 'Pilih nominal donasi');

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
      const preset = presets.find(p => p.amount === selectedPreset);
      return preset?.label ?? 'Nominal Donasi';
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
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}>
      <View style={styles.header}>
        <View style={styles.programRow}>
          <Image source={{uri: sanitizeImageUrl(programImageUrl)}} style={styles.programImage} />
          <Text style={styles.programTitle} numberOfLines={2}>
            {programTitle}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{resolvedSectionTitle}</Text>
      </View>

      {isPaket && packages.length === 0 ? (
        <EmptyState icon={Box} title="Belum ada paket donasi tersedia" />
      ) : (
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {isPaket ? (
            <View style={styles.packageList}>
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
              <View
                style={[
                  styles.presetList,
                  presetLayout === 'grid' && styles.presetListGrid,
                ]}>
                {presets.map(preset => {
                  const isSelected = selectedPreset === preset.amount;
                  return (
                    <TouchableOpacity
                      key={preset.amount}
                      testID={`nominal-preset-${preset.amount}`}
                      style={[
                        styles.presetItem,
                        presetLayout === 'grid' && styles.presetItemGrid,
                        isSelected && styles.presetItemSelected,
                      ]}
                      onPress={() => handleSelectPreset(preset.amount)}
                      accessibilityRole="button"
                      accessibilityLabel={[
                        preset.label,
                        formatCurrency(preset.amount),
                        preset.impact,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                      accessibilityState={{selected: isSelected}}>
                      {preset.iconUrl ? (
                        <Image
                          source={{uri: preset.iconUrl}}
                          style={styles.presetIcon}
                        />
                      ) : null}
                      <View style={styles.presetTextWrapper}>
                        {preset.label ? (
                          <Text
                            style={[
                              styles.presetLabel,
                              presetLayout === 'grid' && styles.presetLabelGrid,
                            ]}>
                            {preset.label}
                          </Text>
                        ) : null}
                        <Text
                          style={[
                            styles.presetAmount,
                            presetLayout === 'grid' && styles.presetAmountGrid,
                          ]}>
                          {formatCurrency(preset.amount)}
                        </Text>
                        {preset.impact ? (
                          <Text style={styles.presetImpact}>{preset.impact}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionTitle}>Atau tentukan donasi</Text>
              <View style={[styles.customInputWrapper, error && styles.inputError]}>
                <Text style={styles.customInputPrefix}>Rp</Text>
                <BottomSheetTextInput
                  style={styles.customInput}
                  value={
                    customAmount ? formatNumberWithSeparator(Number(customAmount)) : ''
                  }
                  onChangeText={handleChangeCustomAmount}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.neutral[400]}
                  accessibilityLabel="Input nominal donasi custom"
                />
              </View>
            </>
          )}
        </BottomSheetScrollView>
      )}

      <SafeAreaFooter>
        {isPaket ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(amount)}</Text>
          </View>
        ) : null}

        {error ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <Button
          label={confirmLabel}
          onPress={handleConfirm}
          size="lg"
          isDisabled={isPaket && (packages.length === 0 || !selectedPackage)}
        />
      </SafeAreaFooter>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.neutral[0],
  },
  handleIndicator: {
    backgroundColor: colors.neutral[300],
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  programImage: {
    // Foto program selalu landscape 16:9 — sama dengan kartu program di daftar.
    width: 72,
    height: (72 * 9) / 16,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[100],
  },
  programTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  presetList: {
    gap: spacing.sm,
  },
  presetListGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  presetItemGrid: {
    flexBasis: '31%',
    flexGrow: 1,
  },
  presetItemSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  presetIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[100],
  },
  presetTextWrapper: {
    flex: 1,
    gap: 2,
  },
  presetLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  presetLabelGrid: {
    textAlign: 'center',
  },
  presetAmount: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  presetAmountGrid: {
    textAlign: 'center',
  },
  presetImpact: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    marginTop: 2,
  },
  packageList: {
    gap: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  totalLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  customInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  customInputPrefix: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  customInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    padding: 0,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
    marginTop: -spacing.xs,
  },
});
