import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Client')
  const [businessName, setBusinessName] = useState('')
  const [contactDetails, setContactDetails] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (role === 'Owner' && !businessName.trim()) {
      setError('Business name is required for Station Owner registration.')
      return
    }

    try {
      await register(fullName, email, password, role, businessName || undefined, contactDetails || undefined)
      // Redirect based on role after registration
      if (role === 'Owner') {
        navigate('/owner/dashboard', { replace: true })
      } else if (role === 'Client') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/stations', { replace: true })
      }
    } catch {
      setError('Registration failed. Use a strong password and unique email.')
    }
  }

  return (
    <section className="auth-card glass">
      <h1>Create account</h1>
      <p>Join the EV charging network as a client or station owner.</p>
      <form onSubmit={onSubmit} className="stack-form">
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </label>
        <label>
          Account Type
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Client">Client (EV User)</option>
            <option value="Owner">Station Owner</option>
          </select>
        </label>
        
        {role === 'Owner' && (
          <>
            <label>
              Business Name *
              <input 
                value={businessName} 
                onChange={(e) => setBusinessName(e.target.value)} 
                placeholder="Your business or company name"
                required={role === 'Owner'}
              />
            </label>
            <label>
              Contact Details
              <textarea 
                value={contactDetails} 
                onChange={(e) => setContactDetails(e.target.value)}
                placeholder="Phone number, address, or other contact information"
                rows={3}
              />
            </label>
          </>
        )}

        {error && <p className="error-text">{error}</p>}
        <button type="submit">Register</button>
      </form>
      <p>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </section>
  )
}
