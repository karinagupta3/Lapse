import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfileState {
  name: string;
  setName: (name: string) => void;
}

export const useUserProfileStore = create<UserProfileState>(
  persist(
    (set) => ({
      name: 'User', // Default name
      setName: (name: string) => set({ name }),
    }),
    {
      name: 'user-profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
