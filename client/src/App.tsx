import { useEffect, useState, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import { Api } from './api'
import LoggedOutView from './components/LoggedOutView'
import type { User } from '@shared/types'

// Lazy load logged-in components
const LoggedInView = lazy(() => import('./components/LoggedInView'))

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [token, setToken] = useState<string>(localStorage.getItem('token') || '')
  const [me, setMe] = useState<User | null>(null)

  // Get current page from URL path
  const getPageFromPath = (path: string): 'home' | 'components' | 'compare' | 'create' | 'create-adv' => {
    if (path === '/') return 'compare'  // Default to compare page
    if (path === '/components') return 'components'
    if (path === '/compare') return 'compare'
    if (path === '/create') return 'create'
    if (path === '/create-advanced') return 'create-adv'
    if (path === '/admin') return 'home'  // Hidden admin route
    return 'compare'
  }

  const [page, setPage] = useState<'home' | 'components' | 'compare' | 'create' | 'create-adv'>(getPageFromPath(location.pathname))
  
  // Update page when location changes
  useEffect(() => {
    setPage(getPageFromPath(location.pathname))
  }, [location.pathname])
  
  // Navigate when page changes programmatically
  const navigateToPage = (newPage: 'home' | 'components' | 'compare' | 'create' | 'create-adv') => {
    const pathMap = {
      'home': '/admin',
      'components': '/components',
      'compare': '/compare',
      'create': '/create',
      'create-adv': '/create-advanced'
    }
    navigate(pathMap[newPage])
  }

  async function refreshSession() {
    if (!token) {
      setMe(null)
      return
    }
    try {
      const { user } = await Api.me(token)
      setMe(user as User)
    } catch {
      setToken('')
      localStorage.removeItem('token')
      setMe(null)
    }
  }

  useEffect(() => {
    refreshSession()
  }, [token])

  function handleAuthSuccess(newToken: string) {
    setToken(newToken)
  }

  function handleLogout() {
    setToken('')
    localStorage.removeItem('token')
    setMe(null)
    navigate('/')
  }

  return (
    <div className="container">
      {!me ? (
        <LoggedOutView onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Suspense fallback={
          <div className="card">
            <h2>Loading...</h2>
            <p>Please wait while we load your dashboard.</p>
          </div>
        }>
          <LoggedInView 
            me={me} 
            token={token} 
            page={page} 
            setPage={navigateToPage} 
            onLogout={handleLogout} 
          />
        </Suspense>
      )}
    </div>
  )
}

export default App
