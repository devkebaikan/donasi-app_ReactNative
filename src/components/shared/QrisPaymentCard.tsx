import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {captureRef} from 'react-native-view-shot';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {DownloadMinimalistic} from '@solar-icons/react-native/Linear';
import {Icon} from '@/components/ui/Icon';
import {formatCurrency} from '@/utils/formatCurrency';
import {showToast} from '@/utils/toast';
import {colors} from '@/theme';

interface QrisPaymentCardProps {
  qrPayload: string;
  donationAmount: number;
  accountBehalf?: string;
  imgUrl?: string;
}

const LEGACY_STORAGE_MAX_API = 28;

async function ensureGalleryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Number(Platform.Version) > LEGACY_STORAGE_MAX_API) {
    return true;
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export function QrisPaymentCard({
  qrPayload,
  donationAmount,
  accountBehalf = 'Sahabat Beramal Bersama',
  imgUrl,
}: QrisPaymentCardProps): React.JSX.Element {
  const qrRef = useRef<View>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveQr(): Promise<void> {
    if (!qrPayload || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      const isAllowed = await ensureGalleryPermission();
      if (!isAllowed) {
        showToast('Izin galeri dibutuhkan untuk menyimpan QR.');
        return;
      }
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
      });
      await CameraRoll.saveAsset(uri, {type: 'photo'});
      showToast('QR Code berhasil disimpan ke galeri!');
    } catch {
      showToast('Gagal menyimpan QR Code ke galeri');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm items-center gap-4">
      {/* Header Badge */}
      <View className="flex-row items-center gap-2">
        {imgUrl ? (
          <Image
            source={{uri: imgUrl}}
            className="w-14 h-6"
            resizeMode="contain"
          />
        ) : (
          <View className="px-2 py-0.5 rounded bg-primary-50 border border-primary-200">
            <Text className="text-xs font-bold text-primary-600">QRIS</Text>
          </View>
        )}
        <Text className="text-sm font-medium text-neutral-600">
          Pembayaran QRIS
        </Text>
      </View>

      {/* Title & Account */}
      <View className="items-center">
        <Text className="text-lg font-bold text-neutral-900">
          Scan untuk Membayar
        </Text>
        <Text className="text-xs text-neutral-500 mt-0.5">
          a.n <Text className="font-semibold text-neutral-700">{accountBehalf}</Text>
        </Text>
      </View>

      {/* QR Code Container */}
      <View
        ref={qrRef}
        collapsable={false}
        className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm items-center justify-center">
        {qrPayload ? (
          <QRCode
            value={qrPayload}
            size={210}
            backgroundColor="#ffffff"
            color="#000000"
          />
        ) : (
          <View className="w-52 h-52 items-center justify-center">
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text className="text-xs text-neutral-400 mt-2">
              Memuat QR Code...
            </Text>
          </View>
        )}
      </View>

      {/* Tombol Simpan QR Code */}
      {qrPayload ? (
        <TouchableOpacity
          onPress={handleSaveQr}
          disabled={isSaving}
          className="flex-row items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-neutral-100 active:bg-neutral-200"
          accessibilityRole="button"
          accessibilityLabel="Simpan QR Code ke galeri">
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.neutral[700]} />
          ) : (
            <Icon
              icon={DownloadMinimalistic}
              size={16}
              color={colors.neutral[700]}
            />
          )}
          <Text className="text-xs font-medium text-neutral-700">
            {isSaving ? 'Menyimpan...' : 'Simpan Gambar QR'}
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Total Pembayaran Box */}
      <View className="w-full bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 items-center">
        <Text className="text-xs text-neutral-500">Total Pembayaran</Text>
        <Text className="text-xl font-bold text-neutral-900 mt-0.5">
          {formatCurrency(donationAmount)}
        </Text>
      </View>

      {/* Panduan Pembayaran */}
      <View className="w-full bg-neutral-50/70 p-3 rounded-xl border border-neutral-100 gap-1.5">
        <Text className="text-xs font-semibold text-neutral-700">
          Cara Pembayaran:
        </Text>
        <Text className="text-xs text-neutral-600 leading-relaxed">
          1. Buka aplikasi m-Banking atau e-Wallet (BCA, Mandiri, BRI, BSI, GoPay, OVO, ShopeePay, DANA, dll).
        </Text>
        <Text className="text-xs text-neutral-600 leading-relaxed">
          2. Pilih menu <Text className="font-semibold text-neutral-800">Scan QR / QRIS</Text>.
        </Text>
        <Text className="text-xs text-neutral-600 leading-relaxed">
          3. Arahkan kamera ke QR Code di atas (atau pilih gambar dari galeri).
        </Text>
        <Text className="text-xs text-neutral-600 leading-relaxed">
          4. Periksa nominal donasi dan konfirmasi pembayaran.
        </Text>
      </View>
    </View>
  );
}
