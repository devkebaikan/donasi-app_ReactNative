import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@/components/ui/Icon';
import {DangerCircle} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import type {RootStackNavigationProp} from '@/types/navigation';
import {useEditProfile} from '@/hooks/useEditProfile';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

export default function EditProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {user, name, email, fieldErrors, isSaving, setName, setEmail, submit} =
    useEditProfile();

  async function handleSubmit(): Promise<void> {
    const success = await submit();
    if (success) {
      navigation.goBack();
    }
  }

  return (
    <View style={styles.root}>
      <HeaderLight title="Edit Profil" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={styles.label}>Nama lengkap</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors?.name ? styles.inputError : null,
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Nama lengkap"
              placeholderTextColor={colors.neutral[400]}
              returnKeyType="next"
              accessibilityLabel="Input nama lengkap"
              accessibilityRole="none"
            />
            {fieldErrors?.name ? (
              <Text style={styles.errorText} accessibilityLiveRegion="polite">
                {fieldErrors.name}
              </Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Alamat email</Text>
            <TextInput
              style={[
                styles.input,
                fieldErrors?.email ? styles.inputError : null,
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="user@email.com"
              placeholderTextColor={colors.neutral[400]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="off"
              textContentType="emailAddress"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              accessibilityLabel="Input alamat email"
              accessibilityRole="none"
            />
            {fieldErrors?.email ? (
              <Text style={styles.errorText} accessibilityLiveRegion="polite">
                {fieldErrors.email}
              </Text>
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <Text style={styles.value}>{user?.phone ?? '-'}</Text>
          </View>

          <View style={styles.warningBox}>
            <Icon icon={DangerCircle} size={20} color={colors.semantic.warning} />
            <Text style={styles.warningText}>
              Nomor telepon tidak dapat diubah di sini. Demi menjaga
              penyalahgunaan akun, hubungi CS untuk ubah nomor telepon.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaving ? styles.saveButtonDisabled : null,
            ]}
            onPress={handleSubmit}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Simpan perubahan"
            accessibilityState={{disabled: isSaving}}>
            {isSaving ? (
              <ActivityIndicator color={colors.neutral[0]} />
            ) : (
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: spacing.xl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.neutral[900],
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[0],
  },
  inputError: {
    borderColor: colors.semantic.error,
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.semantic.error,
  },
  warningBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.semantic.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.semantic.warning,
  },
  saveButton: {
    height: 52,
    backgroundColor: colors.primary[500],
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  saveButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
});
