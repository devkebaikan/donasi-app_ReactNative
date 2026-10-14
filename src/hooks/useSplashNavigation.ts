import {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {RootStackNavigationProp} from '@/types/navigation';

type UseSplashNavigationResult = {
  navigateToOnboarding: () => void;
};

// Onboarding tampil setiap kali aplikasi dibuka — tidak ada status
// "sudah onboarding" yang disimpan/dicek lagi.
export function useSplashNavigation(): UseSplashNavigationResult {
  const navigation = useNavigation<RootStackNavigationProp>();

  const navigateToOnboarding = useCallback((): void => {
    navigation.replace('Onboarding');
  }, [navigation]);

  return {navigateToOnboarding};
}
