'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  
  // Create supabase client only once and memoize it
  const [supabase] = useState(() => createSupabaseClient())

  useEffect(() => {
    setMounted(true)
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error('Error getting session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
        
        // Redirect to auth page when user signs out
        if (event === 'SIGNED_OUT' && mounted) {
          router.push('/auth')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, router, mounted])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error.message)
        throw error
      }
      // The redirect is handled by the auth state change listener
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}