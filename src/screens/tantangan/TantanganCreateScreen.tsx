import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {AltArrowDown} from '@solar-icons/react-native/Linear';
import {Global} from '@solar-icons/react-native/Bold';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {PrayerOptionSheet} from '@/components/shared/PrayerOptionSheet';
import type {PrayerSheetOption} from '@/components/shared/PrayerOptionSheet';
import {TantanganCategoryChips} from '@/components/shared/TantanganCategoryChips';
import {TantanganModeToggle} from '@/components/shared/TantanganModeToggle';
import {Button} from '@/components/ui/Button';
import {Icon} from '@/components/ui/Icon';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {
  TANTANGAN_NAME_MAX_LENGTH,
  TANTANGAN_TARGET_TEXT_MAX_LENGTH,
  TANTANGAN_UNIT_MAX_LENGTH,
  useTantanganForm,
} from '@/hooks/useTantanganForm';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';
import type {
  RootStackNavigationProp,
  RootStackParamList,
} from '@/types/navigation';

// Pilihan durasi sengaja konstanta lokal, bukan dari server: angkanya tidak
// pernah jadi data — menambah pilihan berarti mengubah UI juga.
const DURATION_OPTIONS: PrayerSheetOption<number>[] = [
  {value: 7, label: '7 Hari', description: null},
  {value: 14, label: '14 Hari', description: null},
  {value: 21, label: '21 Hari', description: null},
  {value: 30, label: '30 Hari', description: null},
  {value: 40, label: '40 Hari', description: null},
  {value: 60, label: '60 Hari', description: null},
  {value: 90, label: '90 Hari', description: null},
];

export default function TantanganCreateScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'TantanganCreate'>>();
  const editChallengeId = route.params?.challengeId;
  const [isDurationSheetOpen, setIsDurationSheetOpen] = useState(false);

  const {
    isEditMode,
    isLoadingDetail,
    isDetailError,
    categories,
    isLoadingCategories,
    isCategoriesError,
    isModeLocked,
    name,
    categorySlug,
    mode,
    durationDays,
    unit,
    dailyTargetText,
    isPublic,
    fieldErrors,
    isSubmitting,
    setName,
    setCategorySlug,
    setMode,
    setDurationDays,
    setUnit,
    setDailyTargetText,
    setIsPublic,
    reloadCategories,
    reloadDetail,
    submit,
  } = useTantanganForm({challengeId: editChallengeId});

  const title = isEditMode ? 'Ubah Tantangan' : 'Tantangan Baru';

  function handleBack(): void {
    navigation.goBack();
  }

  async function handleSubmit(): Promise<void> {
    const saved = await submit();
    if (!saved) {
      return;
    }
    if (isEditMode) {
      // Mengubah tantangan kembali ke detail yang sudah ada — tidak ada yang
      // "baru dibuat" untuk dibuka sebagai halaman baru.
      navigation.goBack();
      return;
    }
    // replace supaya back dari detail tidak kembali ke form yang sudah tidak
    // relevan.
    navigation.replace('TantanganDetail', {challengeId: saved.id});
  }

  if (isLoadingDetail) {
    return (
      <View style={styles.container}>
        <HeaderLight title={title} onBack={handleBack} />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary[500]} />
        </View>
      </View>
    );
  }

  // Form setengah terisi lebih membingungkan daripada error state yang jujur:
  // pengguna tidak bisa membedakan field yang memang kosong dari field yang
  // gagal dimuat, lalu menyimpannya menghapus isi yang sebenarnya ada.
  if (isDetailError) {
    return (
      <View style={styles.container}>
        <HeaderLight title={title} onBack={handleBack} />
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Tantangan Tidak Ditemukan</Text>
          <Text style={styles.errorDescription}>
            Data tantangan gagal dimuat.
          </Text>
          <Button label="Coba Lagi" onPress={reloadDetail} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderLight title={title} onBack={handleBack} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={styles.label}>Nama Tantangan</Text>
            <TextInput
              style={[styles.input, fieldErrors.name ? styles.inputError : null]}
              value={name}
              onChangeText={setName}
              maxLength={TANTANGAN_NAME_MAX_LENGTH}
              placeholder="Misal: Sedekah Subuh 40 Hari"
              placeholderTextColor={colors.neutral[400]}
              accessibilityLabel="Nama tantangan"
            />
            {fieldErrors.name ? (
              <Text style={styles.error}>{fieldErrors.name}</Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Pilih Kategori</Text>
            <TantanganCategoryChips
              categories={categories}
              selectedSlug={categorySlug}
              isLoading={isLoadingCategories}
              isError={isCategoriesError}
              onSelect={setCategorySlug}
              onRetry={reloadCategories}
            />
            {fieldErrors.categorySlug ? (
              <Text style={styles.error}>{fieldErrors.categorySlug}</Text>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mode Tantangan</Text>
            <Text style={styles.cardDescription}>
              Pilih cara kamu menjalankan tantangan ini
            </Text>
            <TantanganModeToggle
              value={mode}
              onChange={setMode}
              isLocked={isModeLocked}
            />
            {isModeLocked ? (
              <Text style={styles.hint}>
                Mode tidak bisa diubah karena sudah ada peserta lain
              </Text>
            ) : null}
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Durasi &amp; Target</Text>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.smallLabel}>LAMA HARI</Text>
                <TouchableOpacity
                  style={[
                    styles.select,
                    fieldErrors.durationDays ? styles.inputError : null,
                  ]}
                  onPress={() => setIsDurationSheetOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    durationDays
                      ? `Lama ${durationDays} hari`
                      : 'Pilih lama hari'
                  }>
                  <Text
                    style={[
                      styles.selectLabel,
                      durationDays == null && styles.placeholder,
                    ]}
                    numberOfLines={1}>
                    {durationDays == null ? 'Pilih' : `${durationDays} Hari`}
                  </Text>
                  <Icon
                    icon={AltArrowDown}
                    size={20}
                    color={colors.neutral[600]}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.rowItem}>
                <Text style={styles.smallLabel}>SATUAN (OPSIONAL)</Text>
                <TextInput
                  style={[
                    styles.input,
                    fieldErrors.unit ? styles.inputError : null,
                  ]}
                  value={unit}
                  onChangeText={setUnit}
                  maxLength={TANTANGAN_UNIT_MAX_LENGTH}
                  placeholder="Halaman, Kali, Juz"
                  placeholderTextColor={colors.neutral[400]}
                  accessibilityLabel="Satuan target, opsional"
                />
              </View>
            </View>
            {fieldErrors.durationDays ? (
              <Text style={styles.error}>{fieldErrors.durationDays}</Text>
            ) : null}
            {fieldErrors.unit ? (
              <Text style={styles.error}>{fieldErrors.unit}</Text>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.smallLabel}>DESKRIPSI TARGET HARIAN</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  fieldErrors.dailyTargetText ? styles.inputError : null,
                ]}
                value={dailyTargetText}
                onChangeText={setDailyTargetText}
                maxLength={TANTANGAN_TARGET_TEXT_MAX_LENGTH}
                multiline
                textAlignVertical="top"
                placeholder="Apa yang harus dilakukan setiap hari?"
                placeholderTextColor={colors.neutral[400]}
                accessibilityLabel="Deskripsi target harian, opsional"
              />
              <Text style={styles.counter}>
                {`${dailyTargetText.length}/${TANTANGAN_TARGET_TEXT_MAX_LENGTH}`}
              </Text>
              {fieldErrors.dailyTargetText ? (
                <Text style={styles.error}>{fieldErrors.dailyTargetText}</Text>
              ) : null}
            </View>
          </View>

          {/* Tantangan personal tidak untuk diikuti orang lain — menawarkan
              "izinkan orang lain bergabung" di sana cuma menawarkan hal yang
              tidak akan terjadi. */}
          {mode === 'group' ? (
            <View style={styles.card}>
              <View style={styles.publicRow}>
                <View style={styles.publicText}>
                  <View style={styles.publicTitleRow}>
                    <Icon icon={Global} size={18} color={colors.primary[600]} />
                    <Text style={styles.cardTitle}>Tantangan Publik</Text>
                  </View>
                  <Text style={styles.cardDescription}>
                    Izinkan orang lain melihat dan bergabung
                  </Text>
                </View>
                {/* Switch bawaan RN dengan warna dari @/theme — pemakaian
                    yang sama dengan PrayerSettingToggleRow. */}
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{
                    false: colors.neutral[300],
                    true: colors.primary[400],
                  }}
                  thumbColor={
                    isPublic ? colors.primary[600] : colors.neutral[100]
                  }
                  accessibilityRole="switch"
                  accessibilityState={{checked: isPublic}}
                  accessibilityLabel="Tantangan publik"
                />
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <SafeAreaFooter>
        <Button
          label={isEditMode ? 'Simpan Perubahan' : 'Publikasikan Tantangan'}
          onPress={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        />
      </SafeAreaFooter>

      <PrayerOptionSheet
        title="Lama Hari"
        isOpen={isDurationSheetOpen}
        options={DURATION_OPTIONS}
        selectedValue={durationDays ?? 0}
        onSelect={setDurationDays}
        onClose={() => setIsDurationSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  errorTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  errorDescription: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginBottom: spacing.sm,
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  group: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  smallLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.neutral[500],
  },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  textArea: {
    minHeight: 96,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  select: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[100],
  },
  selectLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  placeholder: {
    fontWeight: fontWeight.regular,
    color: colors.neutral[400],
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.semantic.error,
  },
  error: {
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[900],
  },
  cardDescription: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
  },
  publicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  publicText: {
    flex: 1,
    gap: spacing.xs,
  },
  publicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
