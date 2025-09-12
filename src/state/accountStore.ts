import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AuthProvider = "google" | "apple" | "password" | "local";

export interface Account {
  id: string; // google:sub, apple:sub, email:hash, local:default
  provider: AuthProvider;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

interface AccountState {
  currentAccountId: string | null;
  accounts: Account[];
  upsertAccount: (acc: Account) => void;
  signInAs: (id: string) => void;
  signOut: () => void;
  removeAccount: (id: string) => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      currentAccountId: null,
      accounts: [],
      upsertAccount: (acc) => {
        const found = get().accounts.find(a => a.id === acc.id);
        if (found) {
          set({ accounts: get().accounts.map(a => (a.id === acc.id ? { ...a, ...acc } : a)) });
        } else {
          set({ accounts: [...get().accounts, acc] });
        }
      },
      signInAs: (id) => set({ currentAccountId: id }),
      signOut: () => set({ currentAccountId: null }),
      removeAccount: (id) => set({ accounts: get().accounts.filter(a => a.id !== id) }),
    }),
    {
      name: "account-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
