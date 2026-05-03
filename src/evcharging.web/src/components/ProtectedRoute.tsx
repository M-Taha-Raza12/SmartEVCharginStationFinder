import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ 
  children, 
  adminOnly = false,
  ownerOnly = false 
}: { 
  children: ReactNode
  adminOnly?: boolean
  ownerOnly?: boolean
}) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="page-shell">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user.role !== 'SuperAdmin') {
    return <Navigate to="/" replace />
  }

  if (ownerOnly && user.role !== 'Owner') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
