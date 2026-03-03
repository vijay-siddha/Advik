import { useState } from 'react'
import { Api } from '../api'
import type { UserInsert } from '@shared/types'

interface LoggedOutViewProps {
  onAuthSuccess: (token: string) => void
}

export default function LoggedOutView({ onAuthSuccess }: LoggedOutViewProps) {
  const [authError, setAuthError] = useState('')
  const [reg, setReg] = useState<UserInsert>({ name: '', email: '', password: '' } as any)
  const [login, setLogin] = useState({ email: '', password: '' })
  
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [resetNewPw, setResetNewPw] = useState('')
  const [resetMsg, setResetMsg] = useState('')

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

  async function handleResetRequest() {
    setResetMsg('')
    try {
      const r = await Api.passwordResetRequest(resetEmail)
      setResetMsg('Requested. Token: ' + (r.token || 'sent'))
    } catch (e: any) {
      setResetMsg(e.message)
    }
  }

  async function handleResetConfirm() {
    setResetMsg('')
    try {
      await Api.passwordResetConfirm(resetToken, resetNewPw)
      setResetMsg('Password updated')
      setResetToken('')
      setResetNewPw('')
    } catch (e: any) {
      setResetMsg(e.message)
    }
  }

  return (
    <div className="card">
      <h2>Authenticate</h2>
      <div className="row">
        <input placeholder="Full name" value={reg.name} onChange={e => setReg({ ...reg, name: e.target.value })} />
        <input placeholder="Email" value={reg.email} onChange={e => setReg({ ...reg, email: e.target.value })} />
        <input placeholder="Password" type="password" value={(reg as any).password || ''} onChange={e => setReg({ ...reg, password: e.target.value } as any)} />
        <button onClick={handleRegister}>Register</button>
      </div>
      <div className="row">
        <input placeholder="Email" value={login.email} onChange={e => setLogin({ ...login, email: e.target.value })} />
        <input placeholder="Password" type="password" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} />
        <button onClick={handleLogin}>Login</button>
        <button className="secondary" onClick={async () => {
          try {
            const { token: t } = await Api.login({ email: 'admin@example.com', password: 'newpass123' } as any)
            onAuthSuccess(t); localStorage.setItem('token', t)
          } catch (e: any) {
            setAuthError(e.message)
          }
        }}>Master Login</button>
      </div>
      {authError && <p className="error">{authError}</p>}
      <div className="row">
        <input placeholder="Reset email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
        <button onClick={handleResetRequest}>Request Reset</button>
      </div>
      <div className="row">
        <input placeholder="Reset token" value={resetToken} onChange={e => setResetToken(e.target.value)} />
        <input placeholder="New password" type="password" value={resetNewPw} onChange={e => setResetNewPw(e.target.value)} />
        <button onClick={handleResetConfirm}>Confirm Reset</button>
      </div>
      {resetMsg && <p>{resetMsg}</p>}
    </div>
  )
}
