import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
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

  useEffect(() => {
    if (preservedMethod) {
      // Nominal & metode sudah dipilih duluan di DetailProgramScreen (tanpa
      // redirect) — langsung tampil Step 3, tidak ada bottom sheet yang dibuka.
      presetMethod(preservedMethod);
      loadPaymentMethods();
      loadWalletBalance();
    } else if (reopenMetodePembayaran || preservedAmount !== undefined) {
      openMetodeSheet();
    } else {
      nominalSheetRef.current?.present();
    }
    // Hanya dijalankan sekali saat screen mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <View style={styles.container}>
      <HeaderLight
        title="Donasi Sekarang"
        onBack={() => navigation.goBack()}
      />

      {hasSummary && selectedMethod ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.summaryCard}>
            <View style={styles.programRow}>
              <Image source={{uri: programImageUrl}} style={styles.programImage} />
              <Text style={styles.programTitle} numberOfLines={2}>
                {programTitle}
              </Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={handleChangeProgram}
                accessibilityRole="button"
                accessibilityLabel="Ubah program">
                <Text style={styles.changeButtonText}>Ubah</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.summaryTextWrapper}>
                <Text style={styles.summaryLabel}>{nominalLabel}</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(selectedAmount)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => nominalSheetRef.current?.present()}
                accessibilityRole="button"
                accessibilityLabel="Ubah nominal donasi">
                <Text style={styles.changeButtonText}>Ubah</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <View style={styles.methodInfo}>
                {selectedMethod.type === 'wallet' ? (
                  <View style={styles.methodIconWrapper}>
                    <Icon icon={Wallet} size={18} color={colors.primary[500]} />
                  </View>
                ) : selectedMethod.logoUrl ? (
                  <Image
                    source={{uri: selectedMethod.logoUrl}}
                    style={styles.methodLogo}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.methodLogoPlaceholder} />
                )}
                <Text style={styles.summaryValue}>{selectedMethod.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={openMetodeSheet}
                accessibilityRole="button"
                accessibilityLabel="Ubah metode pembayaran">
                <Text style={styles.changeButtonText}>Ubah</Text>
              </TouchableOpacity>
            </View>
          </View>

          {methodError ? (
            <Text style={styles.errorText} accessibilityLiveRegion="polite">
              {methodError}
            </Text>
          ) : null}

          <View style={styles.optionsCard}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.textareaLabel}>Nama Lengkap</Text>
              {isAuthenticated ? (
                <Text style={styles.fieldValue}>{user?.name}</Text>
              ) : (
                <TextInput
                  style={styles.fieldInput}
                  value={donaturName}
                  onChangeText={setDonaturName}
                  placeholder="Tulis nama lengkap"
                  placeholderTextColor={colors.neutral[400]}
                  accessibilityLabel="Nama Lengkap"
                />
              )}
              {donaturNameError ? (
                <Text style={styles.errorText} accessibilityLiveRegion="polite">
                  {donaturNameError}
                </Text>
              ) : null}
            </View>
            <View style={styles.fieldWrapper}>
              <Text style={styles.textareaLabel}>Nomor WhatsApp</Text>
              {isAuthenticated ? (
                <Text style={styles.fieldValue}>{user?.phone}</Text>
              ) : (
                <View style={styles.phoneInputWrapper}>
                  <Text style={styles.phoneInputPrefix}>+62</Text>
                  <TextInput
                    style={styles.phoneInput}
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
                <Text style={styles.errorText} accessibilityLiveRegion="polite">
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
            <View style={styles.doaWrapper}>
              <View style={styles.textareaLabelRow}>
                <Text style={styles.textareaLabel}>Do'a atau Pesan</Text>
                <Text style={styles.textareaLabelOptional}>(opsional)</Text>
              </View>
              <TextInput
                style={styles.textarea}
                value={prayer}
                onChangeText={setPrayer}
                placeholder="Tulis Do'a atau Pesan..."
                placeholderTextColor={colors.neutral[400]}
                multiline
                accessibilityLabel="Do'a atau Pesan (opsional)"
              />
            </View>
          </View>

          <View style={styles.optionsCard}>
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
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Lengkapi nominal dan metode pembayaran untuk melanjutkan donasi.
          </Text>
        </View>
      )}

      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.md}]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
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
    backgroundColor: colors.neutral[200],
  },
  programTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  summaryCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTextWrapper: {
    gap: 2,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  summaryValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  methodIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLogo: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
  },
  methodLogoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[100],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[200],
  },
  changeButton: {
    minHeight: 44,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  changeButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary[500],
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  optionsCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  doaWrapper: {
    gap: spacing.sm,
  },
  fieldWrapper: {
    gap: spacing.sm,
  },
  fieldValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  fieldInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[0],
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.neutral[0],
  },
  phoneInputPrefix: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  phoneInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    padding: 0,
  },
  textareaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  textareaLabel: {
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  textareaLabelOptional: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
  },
  textarea: {
    height: 88,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[0],
    textAlignVertical: 'top',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.neutral[0],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral[200],
  },
});
