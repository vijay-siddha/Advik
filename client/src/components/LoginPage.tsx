
import { useState } from 'react';
import { ApiWithFallback as Api } from '../api-fallback';
import './LoginPage.css';

interface LoginPageProps {
  onAuthSuccess: (token: string) => void;
  onNavigate: (page: 'login' | 'register' | 'forgot-password') => void;
}

export default function LoginPage({ onAuthSuccess, onNavigate }: LoginPageProps) {
  const [login, setLogin] = useState({ email: 'admin@advik.com', password: '' });
  const [authError, setAuthError] = useState('');
  const [remember, setRemember] = useState(true);

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setAuthError('');
    // Static credentials
    const staticEmail = 'admin@advik.com';
    const staticPassword = 'admin123';
    if (login.email === staticEmail && login.password === staticPassword) {
      const fakeToken = 'static-token';
      onAuthSuccess(fakeToken);
      localStorage.setItem('token', fakeToken);
      setLogin({ email: staticEmail, password: '' });
    } else {
      setAuthError('Invalid username or password.');
    }
  }

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="logo-section">
          <div className="logo">⚙️</div>
          <h1>ADVIK BENCHMARKING</h1>
          <p>Teardown Data Management System</p>
        </div>
        <form>
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
            <label className="remember" htmlFor="rememberMe">
              <input id="rememberMe" type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
              <span>Remember me</span>
            </label>
            <a className="forgot-link" href="#" onClick={e => { e.preventDefault(); onNavigate('forgot-password'); }}>Forgot Password?</a>
          </div>
          <button type="submit" className="login-btn" onClick={handleLogin}>🔓 Sign In</button>
        </form>
        {authError && <div style={{ marginTop: 15, color: '#e53e3e', fontSize: 14, textAlign: 'center' }}>{authError}</div>}
        <div className="status-bar">
          <div className="status-dot"></div>
          <span>All Systems Operational • Last backup: 2 hours ago</span>
        </div>
        <div className="footer">
          © 2026 ADVIK Hi-Tech Pvt Ltd • Version 2.0.1
        </div>
      </div>
    </div>
  );
}
