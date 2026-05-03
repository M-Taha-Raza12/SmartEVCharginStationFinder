import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../services/api'
import type { User } from '../types/models'

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Load user from localStorage on init
    const stored = localStorage.getItem('ev.user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    
    // Save both token and user
    localStorage.setItem('ev.token', response.token)
    localStorage.setItem('ev.user', JSON.stringify(response.user))
    
    setUser(response.user)
    return response.user
  }

  const logout = () => {
    localStorage.removeItem('ev.token')
    localStorage.removeItem('ev.user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
