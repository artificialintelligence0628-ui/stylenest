import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, fetchMe } from '../api/auth.js'

const CustomerAuthContext = createContext(null)
const TOKEN_KEY = 'stylenest_customer_token'

export function CustomerAuthProvider({ children }) {
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
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const register = useCallback(async (name, email, password, phone) => {
    const { token: newToken, user: newUser } = await apiRegister(name, email, password, phone)
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
    isAuthenticated: Boolean(user),
    login, register, logout,
  }

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider')
  return ctx
}
