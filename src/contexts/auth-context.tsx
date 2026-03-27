"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const SESSION_BACKUP_KEY = 'prog-overload:auth-session-backup'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saveSessionBackup = (session: Session | null) => {
      try {
        if (!session) {
          localStorage.removeItem(SESSION_BACKUP_KEY)
          return
        }

        localStorage.setItem(
          SESSION_BACKUP_KEY,
          JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        )
      } catch (error) {
        console.warn('Failed to persist auth backup:', error)
      }
    }

    const tryRestoreFromBackup = async () => {
      try {
        const rawBackup = localStorage.getItem(SESSION_BACKUP_KEY)
        if (!rawBackup) {
          return null
        }

        const parsedBackup = JSON.parse(rawBackup) as {
          access_token?: string
          refresh_token?: string
        }

        if (!parsedBackup.access_token || !parsedBackup.refresh_token) {
          localStorage.removeItem(SESSION_BACKUP_KEY)
          return null
        }

        const { data, error } = await supabase.auth.setSession({
          access_token: parsedBackup.access_token,
          refresh_token: parsedBackup.refresh_token,
        })

        if (error) {
          localStorage.removeItem(SESSION_BACKUP_KEY)
          return null
        }

        return data.session
      } catch (error) {
        console.warn('Failed restoring auth backup:', error)
        return null
      }
    }

  
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setUser(session.user)
        saveSessionBackup(session)
        setLoading(false)
        return
      }

      const restoredSession = await tryRestoreFromBackup()
      setUser(restoredSession?.user ?? null)
      setLoading(false)
    }

    const restoreOnResume = async () => {
      if (document.visibilityState !== 'visible') {
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setUser(session.user)
        saveSessionBackup(session)
        return
      }

      const restoredSession = await tryRestoreFromBackup()
      if (restoredSession?.user) {
        setUser(restoredSession.user)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          saveSessionBackup(null)
        } else {
          saveSessionBackup(session)
        }

        setUser(session?.user ?? null)
        setLoading(false)
      },
    )

    document.addEventListener('visibilitychange', restoreOnResume)
    window.addEventListener('pageshow', restoreOnResume)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', restoreOnResume)
      window.removeEventListener('pageshow', restoreOnResume)
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    loading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
