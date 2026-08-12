import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx'

export default function Login() {
  const { login, isAuthenticated } = useCustomerAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/account" replace />
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/account')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="wrap">
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-sub">Welcome back — sign in to see your orders.</p>

          {error && <div className="admin-error">{error}</div>}

          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button className="btn btn-primary btn-full" disabled={submitting} style={{ marginTop: 8 }}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
