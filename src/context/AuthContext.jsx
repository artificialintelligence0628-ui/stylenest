import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, fetchMe } from '../api/auth.js'

const AuthContext = createContext(null)
const TOKEN_KEY = 'stylenest_admin_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    fetchMe(token)
      .then(u => { if (!cancelled) setUser(u) })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  const login = useCallback(async (email, password) => {
    const { token: newToken, user: newUser } = await apiLogin(email, password)
    if (newUser.role !== 'ADMIN') {
      throw new Error('This account does not have admin access.')
    }
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = {
    token, user, loading,
    isAdmin: Boolean(user && user.role === 'ADMIN'),
    login, logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
