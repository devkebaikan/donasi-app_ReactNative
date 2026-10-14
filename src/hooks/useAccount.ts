import {useEffect, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {getMe, updateSettings} from '@/services/userService';
import {logout} from '@/services/authService';
import {useAuthStore} from '@/stores/authStore';
import {useSettingStore} from '@/stores/settingStore';
import {useNotificationStore} from '@/stores/notificationStore';
import {useSearchStore} from '@/stores/searchStore';
import {showToast} from '@/utils/toast';
import type {User} from '@/types/user';

type State = {
  user: User | null;
  isAuthenticated: boolean;
  isHideNominal: boolean;
  isLoggingOut: boolean;
  isLogoutDialogVisible: boolean;
};

type Actions = {
  toggleHideNominal: (value: boolean) => Promise<void>;
  openLogoutDialog: () => void;
  closeLogoutDialog: () => void;
  confirmLogout: () => Promise<boolean>;
};

export function useAccount(): State & Actions {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore(s => s.accessToken);
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);
  const clearAuth = useAuthStore(s => s.clearAuth);
  const isHideNominal = useSettingStore(s => s.isHideNominal);
  const setHideNominal = useSettingStore(s => s.setHideNominal);
  const resetSetting = useSettingStore(s => s.reset);
  const resetNotification = useNotificationStore(s => s.reset);
  const resetSearch = useSearchStore(s => s.reset);

  const isAuthenticated = accessToken != null;
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutDialogVisible, setIsLogoutDialogVisible] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user) {
      return;
    }
    async function fetchUser(): Promise<void> {
      try {
        const response = await getMe();
        if (response.success) {
          setUser(response.data);
        }
      } catch {
        showToast('Tidak dapat terhubung.');
      }
    }
    fetchUser();
  }, [isAuthenticated, user, setUser]);

  async function toggleHideNominal(value: boolean): Promise<void> {
    const previous = isHideNominal;
    setHideNominal(value);
    try {
      const response = await updateSettings({hideNominal: value});
      if (!response.success) {
        setHideNominal(previous);
        showToast(response.message);
      }
    } catch {
      setHideNominal(previous);
      showToast('Tidak dapat terhubung.');
    }
  }

  function openLogoutDialog(): void {
    setIsLogoutDialogVisible(true);
  }

  function closeLogoutDialog(): void {
    setIsLogoutDialogVisible(false);
  }

  async function confirmLogout(): Promise<boolean> {
    setIsLoggingOut(true);
    try {
      const response = await logout();
      if (!response.success) {
        showToast(response.message);
        return false;
      }
      clearAuth();
      resetSetting();
      resetNotification();
      resetSearch();
      queryClient.clear();
      return true;
    } catch {
      showToast('Tidak dapat terhubung.');
      return false;
    } finally {
      setIsLoggingOut(false);
      setIsLogoutDialogVisible(false);
    }
  }

  return {
    user,
    isAuthenticated,
    isHideNominal,
    isLoggingOut,
    isLogoutDialogVisible,
    toggleHideNominal,
    openLogoutDialog,
    closeLogoutDialog,
    confirmLogout,
  };
}
