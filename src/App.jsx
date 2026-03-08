import { useState } from 'react'
import axios from 'axios'
import ProductGallery from './ProductGallery'
import AdminDashboard from './AdminDashboard'
import './App.css'

const API_BASE = 'http://localhost:3000'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const savedUser = localStorage.getItem('user')
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null)
  const [mode, setMode] = useState('login')
  const [view, setView] = useState('shop')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')

    if (!email.trim() || !password.trim() || (mode === 'register' && !name.trim())) {
      setAuthError('Please fill all required fields.')
      return
    }

    try {
      setAuthLoading(true)
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login'
        ? { email: email.trim(), password: password.trim() }
        : { name: name.trim(), email: email.trim(), password: password.trim() }

      const response = await axios.post(`${API_BASE}${endpoint}`, payload)
      const receivedToken = response.data?.token || ''

      if (!receivedToken) {
        setAuthError('Authentication failed. No token received.')
        return
      }

      localStorage.setItem('token', receivedToken)
      localStorage.setItem('user', JSON.stringify(response.data?.user || null))
      setToken(receivedToken)
      setUser(response.data?.user || null)
      resetForm()
    } catch {
      setAuthError('Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUser(null)
    setView('shop')
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">{mode === 'login' ? 'Login' : 'Register'}</h1>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="auth-input"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="auth-input"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="auth-input"
            />

            {authError && <p className="auth-error">{authError}</p>}

            <button className="auth-btn" type="submit" disabled={authLoading}>
              {authLoading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <button
            type="button"
            className="auth-switch"
            onClick={() => {
              setAuthError('')
              setMode(mode === 'login' ? 'register' : 'login')
            }}
          >
            {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {user?.role === 'admin' && (
        <div className="view-switcher">
          <button type="button" onClick={() => setView('shop')}>Shop View</button>
          <button type="button" onClick={() => setView('admin')}>Admin View</button>
        </div>
      )}

      {view === 'admin' && user?.role === 'admin' ? (
        <AdminDashboard token={token} />
      ) : (
        <ProductGallery token={token} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
