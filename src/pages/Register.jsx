import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx'

export default function Register() {
  const { register, isAuthenticated } = useCustomerAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/account" replace />
  }

  const update = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setSubmitting(true)
    try {
      await register(form.name, form.email, form.password, form.phone)
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">Save your details and track orders faster next time.</p>

          {error && <div className="admin-error">{error}</div>}

          <div className="field">
            <label>Full Name</label>
            <input value={form.name} onChange={update('name')} required autoFocus />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update('email')} required />
          </div>
          <div className="field">
            <label>Phone Number</label>
            <input value={form.phone} onChange={update('phone')} placeholder="024 000 0000" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={update('password')} required />
          </div>

          <button className="btn btn-primary btn-full" disabled={submitting} style={{ marginTop: 8 }}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
