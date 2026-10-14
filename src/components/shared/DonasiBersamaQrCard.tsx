import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {captureRef} from 'react-native-view-shot';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {DownloadMinimalistic} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {showToast} from '@/utils/toast';
import {colors, spacing, radius, fontSize, fontWeight} from '@/theme';

const QR_SIZE = 180;
// Di bawah API 29 penyimpanan belum scoped, jadi menulis ke galeri masih
// butuh izin runtime. API 29+ tidak perlu izin apa pun.
const LEGACY_STORAGE_MAX_API = 28;

interface DonasiBersamaQrCardProps {
  inviteUrl: string | null;
  groupName: string;
}

async function ensureGalleryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Number(Platform.Version) > LEGACY_STORAGE_MAX_API) {
    return true;
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export function DonasiBersamaQrCard({
  inviteUrl,
  groupName,
}: DonasiBersamaQrCardProps): React.JSX.Element {
  // ref mengarah ke wadah QR + padding putihnya saja. Kalau diarahkan ke
  // kartu lengkap, hasil simpanan ikut membawa judul dan tombol; kalau ke
  // komponen QRCode langsung, quiet zone-nya hilang dan QR sering gagal
  // dipindai.
  const qrRef = useRef<View>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(): Promise<void> {
    if (!inviteUrl) {
      return;
    }
    setIsSaving(true);
    try {
      const isAllowed = await ensureGalleryPermission();
      if (!isAllowed) {
        showToast('Izin galeri dibutuhkan untuk menyimpan QR.');
        return;
      }
      const uri = await captureRef(qrRef, {format: 'png', quality: 1});
      // save() sudah deprecated di camera-roll v7 — saveAsset penggantinya.
      await CameraRoll.saveAsset(uri, {type: 'photo'});
      showToast('Kode QR disimpan ke galeri');
    } catch {
      // Izin ditolak, penyimpanan penuh, atau capture gagal — semuanya
      // berakhir di toast, tidak dilempar ke atas.
      showToast('Gagal menyimpan kode QR.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Tunjukkan kode QR ini</Text>

      <View style={styles.qrArea}>
        <View style={[styles.corner, styles.cornerTopLeft]} />
        <View style={[styles.corner, styles.cornerTopRight]} />
        <View style={[styles.corner, styles.cornerBottomLeft]} />
        <View style={[styles.corner, styles.cornerBottomRight]} />

        {inviteUrl ? (
          <View
            ref={qrRef}
            collapsable={false}
            style={styles.qrBox}
            accessibilityRole="image"
            accessibilityLabel={`Kode QR undangan grup ${groupName}`}>
            <QRCode
              value={inviteUrl}
              size={QR_SIZE}
              color={colors.neutral[900]}
              backgroundColor={colors.neutral[0]}
            />
          </View>
        ) : (
          // QR tidak pernah dirender dengan string kosong — hasilnya tetap
          // bisa dipindai dan menuju tempat yang salah.
          <View style={[styles.qrBox, styles.qrSkeleton]} />
        )}
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={!inviteUrl || isSaving}
        accessibilityRole="button"
        accessibilityLabel="Simpan kode QR undangan ke galeri"
        accessibilityState={{disabled: !inviteUrl || isSaving, busy: isSaving}}>
        <Icon
          icon={DownloadMinimalistic}
          size={18}
          color={colors.primary[600]}
        />
        <Text style={styles.saveLabel}>
          {isSaving ? 'Menyimpan...' : 'Simpan QR'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const CORNER_SIZE = 20;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.neutral[0],
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.neutral[700],
  },
  qrArea: {
    padding: spacing.sm,
  },
  qrBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.neutral[0],
  },
  qrSkeleton: {
    width: QR_SIZE + spacing.md * 2,
    height: QR_SIZE + spacing.md * 2,
    backgroundColor: colors.neutral[100],
  },
  // Empat sudut bingkai murni hiasan, bukan bagian dari QR.
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.neutral[900],
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderTopLeftRadius: radius.sm,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderTopRightRadius: radius.sm,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomLeftRadius: radius.sm,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderBottomRightRadius: radius.sm,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  saveLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semiBold,
    color: colors.primary[600],
  },
});
