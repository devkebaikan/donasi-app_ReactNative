import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {
  AltArrowDown,
  ArrowRight,
  Wallet,
} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {NominalBottomSheet} from '@/components/shared/NominalBottomSheet';
import {MetodePembayaranBottomSheet} from '@/components/shared/MetodePembayaranBottomSheet';
import {PrayerSettingToggleRow} from '@/components/shared/PrayerSettingToggleRow';
import {DonasiBersamaTargetCard} from '@/components/shared/DonasiBersamaTargetCard';
import {DonasiBersamaUniqueCodeAlert} from '@/components/shared/DonasiBersamaUniqueCodeAlert';
import {Button} from '@/components/ui/Button';
import {Icon} from '@/components/ui/Icon';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {useDonasiBersamaUrun} from '@/hooks/useDonasiBersamaUrun';
import {useAuthStore} from '@/stores/authStore';
import {formatCurrency} from '@/utils/formatCurrency';
import {formatNumberWithSeparator} from '@/utils/formatCurrency';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';
import type {PaymentMethod} from '@/types/payment';

const QUICK_AMOUNTS = [10000, 50000, 100000];

export default function DonasiBersamaUrunScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'DonasiBersamaUrun'>>();
  const {groupId, groupName, targetAmount, coverImageUrl} = route.params;

  const isAuthenticated = useAuthStore(s => s.accessToken != null);
  const nominalSheetRef = useRef<BottomSheetModal>(null);
  const metodeSheetRef = useRef<BottomSheetModal>(null);

  const {
    selectedAmount,
    amountError,
    isAnonymous,
    isSubmitting,
    paymentMethods,
    isLoadingMethods,
    selectedMethod,
    methodError,
    walletBalance,
    isLoadingWalletBalance,
    isWalletInsufficient,
    selectAmount,
    setIsAnonymous,
    loadPaymentMethods,
    loadWalletBalance,
    selectMethod,
    submit,
  } = useDonasiBersamaUrun(groupId);

  // Guest tidak seharusnya sampai di sini — detail sudah menahannya. Ini
  // pengaman untuk jalur tak terduga seperti deep link.
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace('Login', {
        redirectTo: {
          screen: 'DonasiBersamaUrun',
          params: {groupId, groupName, targetAmount, coverImageUrl},
        },
      });
    }
    // Hanya dijalankan sekali saat screen mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openMetodeSheet(): void {
    loadPaymentMethods();
    loadWalletBalance();
    metodeSheetRef.current?.present();
  }

  function handleConfirmAmount(amount: number): void {
    selectAmount(amount);
    nominalSheetRef.current?.dismiss();
  }

  function handleSelectMethod(method: PaymentMethod): void {
    selectMethod(method);
  }

  function handlePressTopupForWallet(): void {
    metodeSheetRef.current?.dismiss();
    navigation.navigate('Topup');
  }

  async function handleSubmit(): Promise<void> {
    const invoice = await submit();
    if (!invoice) {
      return;
    }
    // replace supaya back dari invoice mendarat di detail grup, bukan kembali
    // ke screen ini dengan nominal yang sudah terpakai.
    navigation.replace('PaymentInvoice', {
      ...invoice,
      isNewTransaction: true,
    });
  }

  return (
    <View style={styles.container}>
      <HeaderLight
        title="Urunan Grup"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <DonasiBersamaTargetCard
          groupName={groupName}
          targetAmount={targetAmount}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Nominal Urunan</Text>
          <TouchableOpacity
            style={[
              styles.amountBox,
              amountError ? styles.amountBoxError : null,
            ]}
            onPress={() => nominalSheetRef.current?.present()}
            accessibilityRole="button"
            accessibilityLabel={
              selectedAmount
                ? `Nominal urunan ${formatCurrency(selectedAmount)}`
                : 'Pilih nominal urunan'
            }>
            <Text style={styles.amountPrefix}>Rp</Text>
            <Text
              style={[
                styles.amountValue,
                !selectedAmount && styles.amountPlaceholder,
              ]}>
              {selectedAmount ? formatNumberWithSeparator(selectedAmount) : '0'}
            </Text>
          </TouchableOpacity>
          {amountError ? (
            <Text style={styles.error}>{amountError}</Text>
          ) : null}

          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map(amount => {
              const isSelected = selectedAmount === amount;
              return (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickChip,
                    isSelected && styles.quickChipSelected,
                  ]}
                  onPress={() => selectAmount(amount)}
                  accessibilityRole="radio"
                  accessibilityLabel={formatCurrency(amount)}
                  accessibilityState={{selected: isSelected}}>
                  <Text
                    style={[
                      styles.quickLabel,
                      isSelected && styles.quickLabelSelected,
                    ]}>
                    {formatCurrency(amount)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <DonasiBersamaUniqueCodeAlert />

        <PrayerSettingToggleRow
          label="Sembunyikan nama saya"
          description="Nama kamu akan tampil sebagai Hamba Allah di riwayat patungan"
          value={isAnonymous}
          onChange={setIsAnonymous}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Metode Pembayaran</Text>
          <TouchableOpacity
            style={[
              styles.methodBox,
              selectedMethod ? styles.methodBoxSelected : null,
              methodError ? styles.amountBoxError : null,
            ]}
            onPress={openMetodeSheet}
            accessibilityRole="button"
            accessibilityLabel={
              selectedMethod
                ? `Metode pembayaran ${selectedMethod.name}`
                : 'Pilih metode pembayaran'
            }>
            {selectedMethod?.logoUrl ? (
              <Image
                source={{uri: selectedMethod.logoUrl}}
                style={styles.methodLogo}
                resizeMode="contain"
              />
            ) : selectedMethod?.type === 'wallet' ? (
              <View style={styles.methodIconWrapper}>
                <Icon icon={Wallet} size={18} color={colors.primary[500]} />
              </View>
            ) : null}
            <Text
              style={[
                styles.methodLabel,
                !selectedMethod && styles.amountPlaceholder,
              ]}
              numberOfLines={1}>
              {selectedMethod?.name ?? 'Pilih metode pembayaran'}
            </Text>
            <Icon icon={AltArrowDown} size={20} color={colors.neutral[600]} />
          </TouchableOpacity>
          {methodError ? (
            <Text style={styles.error}>{methodError}</Text>
          ) : null}
        </View>
      </ScrollView>

      <SafeAreaFooter>
        {/* Tidak pernah disabled karena nominal masih kosong — hanya saat
            proses kirim berjalan. Validasi jalan ketika tombol ditekan. */}
        <Button
          label="Lanjut Pembayaran"
          icon={ArrowRight}
          isLoading={isSubmitting}
          onPress={handleSubmit}
        />
      </SafeAreaFooter>

      <NominalBottomSheet
        ref={nominalSheetRef}
        programTitle={groupName}
        programImageUrl={coverImageUrl ?? ''}
        sectionTitle="Nominal Urunan"
        confirmLabel="Pilih Nominal"
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
        onPressTopupForWallet={handlePressTopupForWallet}
        onConfirm={() => metodeSheetRef.current?.dismiss()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[50],
  },
  amountBoxError: {
    borderColor: colors.semantic.error,
  },
  amountPrefix: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  amountValue: {
    flex: 1,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  amountPlaceholder: {
    color: colors.neutral[400],
    fontWeight: fontWeight.regular,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  // Gaya chip pemilih di dalam form mengikuti JadwalPicker.
  quickChip: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.lg,
  },
  quickChipSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  quickLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  quickLabelSelected: {
    color: colors.primary[700],
    fontWeight: fontWeight.semiBold,
  },
  methodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  methodBoxSelected: {
    borderColor: colors.primary[500],
  },
  methodLogo: {
    width: 40,
    height: 24,
  },
  methodIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
});
