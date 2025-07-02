import { create } from 'zustand'
import { supabase, Announcement } from './supabase'

interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

interface AuthState {
  user: User | null
  isAuthorized: boolean
  isLoading: boolean
  announcements: Announcement[]
  isAnnouncementsLoading: boolean
  setUser: (user: User | null) => void
  setAuthorized: (authorized: boolean) => void
  setLoading: (loading: boolean) => void
  setAnnouncements: (announcements: Announcement[]) => void
  setAnnouncementsLoading: (loading: boolean) => void
  fetchAnnouncements: () => Promise<void>
  hideAnnouncement: (id: string) => Promise<void>
  reset: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthorized: false,
  isLoading: true,
  announcements: [],
  isAnnouncementsLoading: true,
  setUser: (user) => set({ user }),
  setAuthorized: (isAuthorized) => set({ isAuthorized }),
  setLoading: (isLoading) => set({ isLoading }),
  setAnnouncements: (announcements) => set({ announcements }),
  setAnnouncementsLoading: (isAnnouncementsLoading) => set({ isAnnouncementsLoading }),
  reset: () => set({ user: null, isAuthorized: false, isLoading: false, announcements: [], isAnnouncementsLoading: false }),
  
  fetchAnnouncements: async () => {
    try {
      set({ isAnnouncementsLoading: true })
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('hidden', false) // Only fetch non-hidden announcements
        .order('created_at', { ascending: false })

      if (error) throw error
      
      set({ announcements: data || [] })
    } catch (err) {
      console.error('Error fetching announcements:', err)
      set({ announcements: [] })
    } finally {
      set({ isAnnouncementsLoading: false })
    }
  },

  hideAnnouncement: async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ hidden: true })
        .eq('id', id)

      if (error) {
        console.error('Database error hiding announcement:', error)
        throw error
      }

      // Remove from local state immediately
      const { announcements } = get()
      const updatedAnnouncements = announcements.filter(ann => ann.id !== id)
      set({ announcements: updatedAnnouncements })
    } catch (err) {
      console.error('Error hiding announcement:', err)
      throw err
    }
  }
})) 