import {useState} from 'react';
import {Alert} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {updateAvatar} from '@/services/userService';
import {useAuthStore} from '@/stores/authStore';
import {showToast} from '@/utils/toast';
import type {User} from '@/types/user';

type State = {
  user: User | null;
  isUploadingAvatar: boolean;
};

type Actions = {
  showAvatarSourcePicker: () => void;
};

export function useMyProfile(): State & Actions {
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  async function uploadFromSource(
    source: 'camera' | 'library',
  ): Promise<void> {
    const result =
      source === 'camera'
        ? await launchCamera({mediaType: 'photo', quality: 0.8})
        : await launchImageLibrary({mediaType: 'photo', quality: 0.8});

    if (result.didCancel || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    if (!asset?.uri) {
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const response = await updateAvatar({
        uri: asset.uri,
        fileName: asset.fileName ?? 'avatar.jpg',
        type: asset.type ?? 'image/jpeg',
      });
      if (!response.success) {
        showToast(response.message);
        return;
      }
      updateUser({avatarUrl: response.data.avatarUrl});
    } catch {
      showToast('Tidak dapat terhubung.');
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  function showAvatarSourcePicker(): void {
    Alert.alert('Ubah foto profil', undefined, [
      {text: 'Kamera', onPress: () => uploadFromSource('camera')},
      {text: 'Galeri', onPress: () => uploadFromSource('library')},
      {text: 'Batal', style: 'cancel'},
    ]);
  }

  return {
    user,
    isUploadingAvatar,
    showAvatarSourcePicker,
  };
}
