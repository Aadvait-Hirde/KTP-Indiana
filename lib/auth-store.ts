import { create } from 'zustand'
import { User } from './supabase'

interface AuthState {
  user: User | null
  isAuthorized: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setAuthorized: (authorized: boolean) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthorized: false,
  isLoading: true,
  setUser: (user) => set({ user }),
  setAuthorized: (authorized) => set({ isAuthorized: authorized }),
  setLoading: (loading) => set({ isLoading: loading }),
  reset: () => set({ user: null, isAuthorized: false, isLoading: false }),
})) 