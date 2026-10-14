import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {User} from '@/types/user';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      setAccessToken: (token: string) => set({accessToken: token}),
      setUser: (user: User) => set({user}),
      updateUser: (partial: Partial<User>) => {
        const current = get().user;
        if (!current) {
          return;
        }
        set({user: {...current, ...partial}});
      },
      clearAuth: () => set({accessToken: null, user: null}),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
