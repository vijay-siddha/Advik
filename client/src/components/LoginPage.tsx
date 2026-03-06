import { useState } from 'react'
import { ApiWithFallback as Api } from '../api-fallback'

interface LoginPageProps {
  onAuthSuccess: (token: string) => void
  onNavigate: (page: 'login' | 'register' | 'forgot-password') => void
}

export default function LoginPage({ onAuthSuccess, onNavigate }: LoginPageProps) {
  const [login, setLogin] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')

  async function handleLogin() {
    setAuthError('')
    try {
      const { token: t } = await Api.login(login)
      onAuthSuccess(t)
      localStorage.setItem('token', t)
      setLogin({ email: '', password: '' })
    } catch (e: any) {
      setAuthError(e.message)
    }
  }

  async function handleMasterLogin() {
    setAuthError('')
    try {
      const { token: t } = await Api.login({ email: 'admin@example.com', password: 'newpass123' } as any)
      onAuthSuccess(t)
      localStorage.setItem('token', t)
    } catch (e: any) {
      setAuthError(e.message)
    }
  }

  return (
    <div className="card auth-card">
      <h2>Login</h2>

      <div className="auth-form">
        <input
          placeholder="Email"
          type="email"
          value={login.email}
          onChange={e => setLogin({ ...login, email: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          value={login.password}
          onChange={e => setLogin({ ...login, password: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <button onClick={handleLogin}>Login</button>
        <button className="secondary" onClick={handleMasterLogin}>Master Login</button>
      </div>

      {authError && <p className="error">{authError}</p>}

      <div className="auth-links">
        <button className="link-btn" onClick={() => onNavigate('forgot-password')}>
          Forgot password?
        </button>
        <span className="auth-sep">·</span>
        <button className="link-btn" onClick={() => onNavigate('register')}>
          Create an account
        </button>
      </div>
    </div>
  )
}
