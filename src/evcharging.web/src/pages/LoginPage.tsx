import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect
  if (user) {
    const path = user.role === 'Owner' ? '/owner/dashboard' 
                : user.role === 'SuperAdmin' ? '/admin/dashboard' 
                : '/dashboard'
    navigate(path, { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const userData = await login(email, password)
      
      // Navigate based on role
      const path = userData.role === 'Owner' ? '/owner/dashboard' 
                  : userData.role === 'SuperAdmin' ? '/admin/dashboard' 
                  : '/dashboard'
      
      navigate(path, { replace: true })
    } catch (err: any) {
      setError('Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <section className="auth-card glass">
      <h1>Welcome back</h1>
      <p>Login to continue booking smart EV charging slots.</p>
      <form onSubmit={handleSubmit} className="stack-form">
        <label>
          Email
          <input 
            id="email"
            name="email"
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            disabled={loading}
          />
        </label>
        <label>
          Password
          <input 
            id="password"
            name="password"
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            disabled={loading}
          />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Need an account? <Link to="/register">Register</Link>
      </p>
    </section>
  )
}
