import { useState } from 'react'
import { ApiWithFallback as Api } from '../api-fallback'

interface ForgotPasswordPageProps {
  onNavigate: (page: 'login' | 'register' | 'forgot-password') => void
}

export default function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [resetNewPw, setResetNewPw] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [step, setStep] = useState<'request' | 'confirm'>('request')

  async function handleResetRequest() {
    setResetMsg('')
    try {
      const r = await Api.passwordResetRequest(resetEmail)
      setResetMsg('Reset token sent. Token: ' + (r.token || 'check your email'))
      setStep('confirm')
    } catch (e: any) {
      setResetMsg(e.message)
    }
  }

  async function handleResetConfirm() {
    setResetMsg('')
    try {
      await Api.passwordResetConfirm(resetToken, resetNewPw)
      setResetMsg('Password updated successfully!')
      setResetToken('')
      setResetNewPw('')
    } catch (e: any) {
      setResetMsg(e.message)
    }
  }

  return (
    <div className="card auth-card">
      <h2>Reset Password</h2>

      {step === 'request' ? (
        <div className="auth-form">
          <p className="auth-hint">Enter your email address and we'll send you a reset token.</p>
          <input
            placeholder="Email address"
            type="email"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleResetRequest()}
          />
          <button onClick={handleResetRequest}>Send Reset Token</button>
        </div>
      ) : (
        <div className="auth-form">
          <p className="auth-hint">Enter the reset token you received and choose a new password.</p>
          <input
            placeholder="Reset token"
            value={resetToken}
            onChange={e => setResetToken(e.target.value)}
          />
          <input
            placeholder="New password"
            type="password"
            value={resetNewPw}
            onChange={e => setResetNewPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleResetConfirm()}
          />
          <button onClick={handleResetConfirm}>Set New Password</button>
          <button className="secondary" onClick={() => setStep('request')}>Back</button>
        </div>
      )}

      {resetMsg && <p className={resetMsg.includes('success') ? 'success' : 'info'}>{resetMsg}</p>}

      <div className="auth-links">
        <button className="link-btn" onClick={() => onNavigate('login')}>
          Back to Login
        </button>
      </div>
    </div>
  )
}
