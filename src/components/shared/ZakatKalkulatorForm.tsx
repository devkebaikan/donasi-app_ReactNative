import React from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {ZakatCalculatorTab, ZakatPeriode} from '@/types/zakat';

interface ZakatKalkulatorFormProps {
  activeTab: ZakatCalculatorTab;
  deposito: number;
  properti: number;
  emas: number;
  saham: number;
  hutang: number;
  onChangeDeposito: (value: number) => void;
  onChangeProperti: (value: number) => void;
  onChangeEmas: (value: number) => void;
  onChangeSaham: (value: number) => void;
  onChangeHutang: (value: number) => void;
  penghasilanBulanan: number;
  pendapatanLain: number;
  periodePerhitungan: ZakatPeriode;
  onChangePenghasilanBulanan: (value: number) => void;
  onChangePendapatanLain: (value: number) => void;
  onChangePeriodePerhitungan: (value: ZakatPeriode) => void;
}

const PERIODE_OPTIONS: {value: ZakatPeriode; label: string}[] = [
  {value: 'bulanan', label: 'Bulanan'},
  {value: 'pertahun', label: 'Per Tahun'},
];

export function ZakatKalkulatorForm({
  activeTab,
  deposito,
  properti,
  emas,
  saham,
  hutang,
  onChangeDeposito,
  onChangeProperti,
  onChangeEmas,
  onChangeSaham,
  onChangeHutang,
  penghasilanBulanan,
  pendapatanLain,
  periodePerhitungan,
  onChangePenghasilanBulanan,
  onChangePendapatanLain,
  onChangePeriodePerhitungan,
}: ZakatKalkulatorFormProps): React.JSX.Element {
  if (activeTab === 'penghasilan') {
    return (
      <View style={styles.container}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Periode Perhitungan</Text>
          <View style={styles.periodeRow}>
            {PERIODE_OPTIONS.map(option => {
              const isActive = option.value === periodePerhitungan;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.periodeChip, isActive && styles.periodeChipActive]}
                  onPress={() => onChangePeriodePerhitungan(option.value)}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{selected: isActive}}>
                  <Text
                    style={[
                      styles.periodeChipLabel,
                      isActive && styles.periodeChipLabelActive,
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <CurrencyField
          label="Penghasilan per Bulan"
          value={penghasilanBulanan}
          onChangeValue={onChangePenghasilanBulanan}
        />
        <CurrencyField
          label="Pendapatan Lain (Bonus, THR, dll)"
          value={pendapatanLain}
          onChangeValue={onChangePendapatanLain}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CurrencyField
        label="Nilai Deposito/Tabungan/Giro"
        value={deposito}
        onChangeValue={onChangeDeposito}
      />
      <CurrencyField
        label="Nilai Properti & Kendaraan"
        value={properti}
        onChangeValue={onChangeProperti}
      />
      <CurrencyField
        label="Emas, perak, permata, dll"
        value={emas}
        onChangeValue={onChangeEmas}
      />
      <CurrencyField
        label="Saham, piutang, surat berharga"
        value={saham}
        onChangeValue={onChangeSaham}
      />
      <CurrencyField
        label="Hutang pribadi jatuh tempo"
        value={hutang}
        onChangeValue={onChangeHutang}
      />
    </View>
  );
}

interface CurrencyFieldProps {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
}

function CurrencyField({
  label,
  value,
  onChangeValue,
}: CurrencyFieldProps): React.JSX.Element {
  function handleChangeText(text: string): void {
    const digits = text.replace(/\D/g, '');
    onChangeValue(digits ? Number(digits) : 0);
  }

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.currencyInputWrapper}>
        <Text style={styles.currencyPrefix}>Rp</Text>
        <TextInput
          style={styles.currencyInput}
          value={value === 0 ? '' : String(value)}
          onChangeText={handleChangeText}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.neutral[400]}
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
  },
  currencyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  currencyPrefix: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  currencyInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    padding: 0,
  },
  periodeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  periodeChip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  periodeChipActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  periodeChipLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[600],
  },
  periodeChipLabelActive: {
    color: colors.primary[700],
    fontWeight: fontWeight.semiBold,
  },
});
