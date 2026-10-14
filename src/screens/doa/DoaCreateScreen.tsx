import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {AltArrowDown, DangerCircle} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {HeaderLight} from '@/components/shared/HeaderLight';
import {DoaNameVisibilitySheet} from '@/components/shared/DoaNameVisibilitySheet';
import {Button} from '@/components/ui/Button';
import {SafeAreaFooter} from '@/components/ui/SafeAreaFooter';
import {useCreateDoa} from '@/hooks/useCreateDoa';
import {useAuthStore} from '@/stores/authStore';
import {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
} from '@/theme';
import type {RootStackNavigationProp} from '@/types/navigation';
import type {DoaNameVisibility} from '@/types/doa';

const CONTENT_MIN_LENGTH = 10;
const CONTENT_MAX_LENGTH = 500;
const ANONYMOUS_NAME = 'Hamba Allah';

export default function DoaCreateScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const user = useAuthStore(s => s.user);
  const {isSubmitting, submit} = useCreateDoa();

  // Sheet dibuka lewat ref, bukan lewat prop `isOpen` — lihat catatan di
  // DoaNameVisibilitySheet.
  const nameSheetRef = useRef<BottomSheetModal>(null);

  const [content, setContent] = useState('');
  const [nameVisibility, setNameVisibility] =
    useState<DoaNameVisibility | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(
    null,
  );

  const userName = user?.name?.trim() || 'Nama saya';

  const selectedNameLabel =
    nameVisibility === 'name'
      ? userName
      : nameVisibility === 'anonymous'
        ? ANONYMOUS_NAME
        : null;

  const isAtMaxLength = content.length >= CONTENT_MAX_LENGTH;

  function handleBack(): void {
    navigation.goBack();
  }

  // Keyboard ditutup dulu supaya sheet tidak muncul di balik keyboard.
  function handleOpenNameSheet(): void {
    Keyboard.dismiss();
    nameSheetRef.current?.present();
  }

  function handleSelectNameVisibility(value: DoaNameVisibility): void {
    setNameVisibility(value);
    nameSheetRef.current?.dismiss();
  }

  // Validasi hanya jalan di sini — bukan saat mengetik atau blur. Aturan wajib
  // di CLAUDE.md.
  function validate(): Record<string, string> | null {
    const errors: Record<string, string> = {};
    const trimmed = content.trim();

    if (!trimmed) {
      errors.content = 'Tulis doa terlebih dahulu';
    } else if (trimmed.length < CONTENT_MIN_LENGTH) {
      errors.content = `Tulis doa minimal ${CONTENT_MIN_LENGTH} karakter`;
    }

    if (!nameVisibility) {
      errors.nameVisibility = 'Pilih dulu cara nama kamu ditampilkan';
    }

    return Object.keys(errors).length ? errors : null;
  }

  async function handleSubmit(): Promise<void> {
    const errors = validate();
    setFieldErrors(errors);
    if (errors || !nameVisibility) {
      return;
    }

    const outcome = await submit({
      content: content.trim(),
      nameVisibility,
    });

    if (!outcome.ok) {
      setFieldErrors(outcome.fieldErrors);
      return;
    }

    // popTo, bukan navigate: di React Navigation v7 `navigate` tidak lagi pop
    // balik ke screen yang sudah ada di stack — dia push DoaList baru dan
    // menyisakan DoaCreate di bawahnya, sehingga tombol back dari daftar malah
    // kembali ke form yang sudah terkirim. popTo membuang DoaCreate dari stack.
    // goBack() juga tidak dipakai karena tidak bisa mengoper initialTab.
    navigation.popTo('DoaList', {initialTab: 'mine'});
  }

  return (
    <View style={styles.root}>
      <HeaderLight title="Tulis Doa Sahabat" onBack={handleBack} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>Kolom Doa</Text>
          <TextInput
            style={[
              styles.contentInput,
              fieldErrors?.content ? styles.inputError : null,
            ]}
            value={content}
            onChangeText={setContent}
            placeholder="Ungkapkan doa sahabat disini..."
            placeholderTextColor={colors.neutral[400]}
            multiline
            textAlignVertical="top"
            maxLength={CONTENT_MAX_LENGTH}
            // Tanpa onSubmitEditing: field multiline, tombol return harus
            // menyisipkan baris baru, bukan mengirim form.
            accessibilityLabel="Input isi doa"
            accessibilityRole="none"
          />

          <Text
            style={[styles.counter, isAtMaxLength ? styles.counterMax : null]}>
            {content.length}/{CONTENT_MAX_LENGTH}
          </Text>

          {fieldErrors?.content ? (
            <View style={styles.errorRow} accessibilityLiveRegion="polite">
              <Icon
                icon={DangerCircle}
                size={16}
                color={colors.semantic.error}
              />
              <Text style={styles.errorText}>{fieldErrors.content}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tampilkan Nama</Text>
          <TouchableOpacity
            style={[
              styles.selectTrigger,
              fieldErrors?.nameVisibility ? styles.inputError : null,
            ]}
            onPress={handleOpenNameSheet}
            accessibilityRole="button"
            accessibilityLabel={
              selectedNameLabel
                ? `Tampilkan nama: ${selectedNameLabel}`
                : 'Pilih cara nama ditampilkan'
            }>
            <Text
              style={[
                styles.selectValue,
                selectedNameLabel ? null : styles.selectPlaceholder,
              ]}
              numberOfLines={1}>
              {selectedNameLabel ?? 'Pilihan ditampilkan'}
            </Text>
            <Icon icon={AltArrowDown} size={20} color={colors.neutral[500]} />
          </TouchableOpacity>

          {fieldErrors?.nameVisibility ? (
            <View style={styles.errorRow} accessibilityLiveRegion="polite">
              <Icon
                icon={DangerCircle}
                size={16}
                color={colors.semantic.error}
              />
              <Text style={styles.errorText}>{fieldErrors.nameVisibility}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.hint}>
          Doa kamu akan tampil di Relung Doa dan bisa diaamiinkan pengguna lain.
        </Text>
      </ScrollView>

      <SafeAreaFooter>
        <Button
          label="Kirim Doa"
          onPress={handleSubmit}
          // Sengaja tidak disabled saat form kosong — hanya saat mengirim.
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        />
      </SafeAreaFooter>

      <DoaNameVisibilitySheet
        ref={nameSheetRef}
        userName={userName}
        selectedValue={nameVisibility}
        onSelect={handleSelectNameVisibility}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  scroll: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  contentInput: {
    // ±6 baris, mengikuti proporsi field di design.
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[0],
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: fontSize.sm,
    color: colors.neutral[400],
  },
  counterMax: {
    color: colors.semantic.error,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  selectValue: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.neutral[900],
  },
  selectPlaceholder: {
    color: colors.neutral[400],
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  hint: {
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: colors.neutral[500],
  },
});
