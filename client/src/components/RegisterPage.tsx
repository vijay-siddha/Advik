import { useState } from 'react'
import { ApiWithFallback as Api } from '../api-fallback'
import type { UserInsert } from '@shared/types'

interface RegisterPageProps {
  onAuthSuccess: (token: string) => void
  onNavigate: (page: 'login' | 'register' | 'forgot-password') => void
}

export default function RegisterPage({ onAuthSuccess, onNavigate }: RegisterPageProps) {
  const [reg, setReg] = useState<UserInsert>({ name: '', email: '', password: '' } as any)
  const [authError, setAuthError] = useState('')

  async function handleRegister() {
    setAuthError('')
    try {
      const { token: t } = await Api.register(reg)
      onAuthSuccess(t)
      localStorage.setItem('token', t)
      setReg({ name: '', email: '', password: '' } as any)
    } catch (e: any) {
      setAuthError(e.message)
    }
  }

  return (
    <div className="card auth-card">
      <h2>Create Account</h2>

      <div className="auth-form">
        <input
          placeholder="Full name"
          value={reg.name}
          onChange={e => setReg({ ...reg, name: e.target.value })}
        />
        <input
          placeholder="Email"
          type="email"
          value={reg.email}
          onChange={e => setReg({ ...reg, email: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          value={(reg as any).password || ''}
          onChange={e => setReg({ ...reg, password: e.target.value } as any)}
          onKeyDown={e => e.key === 'Enter' && handleRegister()}
        />
        <button onClick={handleRegister}>Register</button>
      </div>

      {authError && <p className="error">{authError}</p>}

      <div className="auth-links">
        <span>Already have an account?</span>
        <button className="link-btn" onClick={() => onNavigate('login')}>
          Login
        </button>
      </div>
    </div>
  )
}
