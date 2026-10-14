import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Icon} from '@/components/ui/Icon';
import {Pen, DangerCircle} from '@solar-icons/react-native/Linear';
import {HeaderLight} from '@/components/shared/HeaderLight';
import type {RootStackNavigationProp} from '@/types/navigation';
import {useMyProfile} from '@/hooks/useMyProfile';
import {Avatar} from '@/components/ui/Avatar';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

export default function MyProfileScreen(): React.JSX.Element {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {user, isUploadingAvatar, showAvatarSourcePicker} = useMyProfile();

  return (
    <View style={styles.root}>
      <HeaderLight title="Profile Anda" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Avatar
              uri={user?.avatarUrl ?? null}
              name={user?.name ?? ''}
              size={96}
            />
            <TouchableOpacity
              style={styles.editAvatarBadge}
              onPress={showAvatarSourcePicker}
              disabled={isUploadingAvatar}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityRole="button"
              accessibilityLabel="Ubah foto profil"
              accessibilityState={{disabled: isUploadingAvatar}}>
              {isUploadingAvatar ? (
                <ActivityIndicator size="small" color={colors.neutral[0]} />
              ) : (
                <Icon icon={Pen} size={16} color={colors.neutral[0]} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nama lengkap</Text>
          <Text style={styles.value}>{user?.name ?? '-'}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Alamat email</Text>
          <Text style={styles.value}>{user?.email ?? '-'}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nomor Telepon</Text>
          <Text style={styles.value}>{user?.phone ?? '-'}</Text>
        </View>

        <View style={styles.warningBox}>
          <Icon icon={DangerCircle} size={20} color={colors.semantic.warning} />
          <Text style={styles.warningText}>
            Demi menjaga penyalahgunaan akun, hubungi CS untuk ubah nomor
            telepon
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => navigation.navigate('EditProfile')}
          accessibilityRole="button"
          accessibilityLabel="Edit profil">
          <Text style={styles.editProfileButtonText}>Edit Profil</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral[0],
  },
  scroll: {
    padding: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  avatarWrapper: {
    width: 96,
    height: 96,
  },
  editAvatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary[500],
    borderWidth: 2,
    borderColor: colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
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
  editProfileButton: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  editProfileButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[500],
  },
});
