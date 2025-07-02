import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'admin' | 'exec' | 'director' | 'member' | 'newmember'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  author_id: string
  author_name: string
  created_at: string
  updated_at: string
} 