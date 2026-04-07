import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { setUserId, clearUserId } from '../lib/userScope'

const AuthContext = createContext({})

const DEMO_USER = { id: 'demo-user', email: 'demo@dayforge.app', isDemoUser: true }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check demo mode first
    if (localStorage.getItem('dayforge_demo') === 'true') {
      setUserId('demo-user')
      setUser(DEMO_USER)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      if (u) setUserId(u.id)
      setUser(u)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      if (u) {
        setUserId(u.id)
      } else {
        clearUserId()
      }
      setUser(u)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    if (localStorage.getItem('dayforge_demo') === 'true') {
      localStorage.removeItem('dayforge_demo')
      clearUserId()
      setUser(null)
      return
    }
    clearUserId()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  function enterDemo() {
    localStorage.setItem('dayforge_demo', 'true')
    setUserId('demo-user')
    setUser(DEMO_USER)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, enterDemo }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
