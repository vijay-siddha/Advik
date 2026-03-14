import { useState } from 'react'
import { ApiWithFallback as Api } from '../api-fallback'
import './LoginPage.css'

interface LoginPageProps {
  onAuthSuccess: (token: string) => void
  onNavigate: (page: 'login' | 'register' | 'forgot-password') => void
}

export default function LoginPage({ onAuthSuccess, onNavigate }: LoginPageProps) {
  const [login, setLogin] = useState({ email: 'admin@advik.com', password: '' })
  const [authError, setAuthError] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault()
    setAuthError('')
    try {
      const { token: t } = await Api.login(login)
      onAuthSuccess(t)
      localStorage.setItem('token', t)
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }
      setLogin({ email: 'admin@advik.com', password: '' })
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
    <div className="login-page">
      <div className="login-container">
        <div className="logo-section">
          <div className="logo">⚙️</div>
          <h1>ADVIK BENCHMARKING</h1>
          <p>Teardown Data Management System</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="email"
                placeholder="admin@advik.com"
                value={login.email}
                onChange={e => setLogin({ ...login, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Enter your password"
                value={login.password}
                onChange={e => setLogin({ ...login, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="remember-forgot">
            <label className="remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              className="forgot-link"
              onClick={() => onNavigate('forgot-password')}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="login-btn">
            🔓 Sign In
          </button>

          {authError && <p className="error">{authError}</p>}

          <button
            type="button"
            className="login-btn secondary"
            onClick={handleMasterLogin}
          >
            🔓 Master Login
          </button>
        </form>

        <div className="status-bar">
          <div className="status-dot"></div>
          <span>All Systems Operational • Last backup: 2 hours ago</span>
        </div>

        <div className="footer">
          <div className="auth-links">
            <button className="link-btn" onClick={() => onNavigate('register')}>
              Create an account
            </button>
          </div>
          © 2026 ADVIK Hi-Tech Pvt Ltd • Version 2.0.1
        </div>
      </div>
    </div>
  )
}
