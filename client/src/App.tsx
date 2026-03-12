import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import { ApiWithFallback as Api } from './api-fallback';
import LoggedOutView from './components/LoggedOutView';
import type { User } from '@shared/types';

const BenchmarkLibrary = lazy(() => import('./components/BenchmarkLibrary'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const BenchmarkDetail = lazy(() => import('./components/BenchmarkDetail'));
const ComparisonPage = lazy(() => import('./components/ComparisonPage'));

// Lazy load logged-in components
const LoggedInView = lazy(() => import('./components/LoggedInView'));

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [token, setToken] = useState<string>(localStorage.getItem('token') || '')
  const [me, setMe] = useState<User | null>(null)

  // Get current page from URL path
  const getPageFromPath = (path: string): 'home' | 'components' | 'compare' | 'create' | 'create-adv' | 'edit' | 'benchmarks' => {
    if (path === '/') return 'compare'  // Default to compare page
    if (path === '/components') return 'components'
    if (path === '/compare') return 'compare'
    if (path === '/create') return 'create'
    if (path === '/create-advanced') return 'create-adv'
    if (path === '/edit') return 'edit'
    if (path === '/admin') return 'home'  // Hidden admin route
    if (path === '/benchmarks') return 'benchmarks'
    return 'compare'
  }

  const [page, setPage] = useState<'home' | 'components' | 'compare' | 'create' | 'create-adv' | 'edit' | 'benchmarks'>(getPageFromPath(location.pathname))
  
  // Update page when location changes
  useEffect(() => {
    setPage(getPageFromPath(location.pathname))
  }, [location.pathname])
  
  // Navigate when page changes programmatically
  const navigateToPage = (newPage: 'home' | 'components' | 'compare' | 'create' | 'create-adv' | 'edit' | 'benchmarks') => {
    const pathMap: Record<string, string> = {
      'home': '/admin',
      'components': '/components',
      'compare': '/compare',
      'create': '/create',
      'create-adv': '/create-advanced',
      'edit': '/edit',
      'benchmarks': '/benchmarks'
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
    setToken(newToken);
    navigate('/dashboard');
  }

  function handleLogout() {
    setToken('')
    localStorage.removeItem('token')
    setMe(null)
    navigate('/')
  }

  return (
    <Routes>
      <Route
        path="/benchmarks"
        element={
          <Suspense fallback={<div className="card"><h2>Loading...</h2><p>Please wait while we load the Benchmark Library.</p></div>}>
            <BenchmarkLibrary />
          </Suspense>
        }
      />
      {/* Make Benchmark Detail public */}
      <Route
        path="/benchmarks/:id"
        element={
          <Suspense fallback={<div className="card"><h2>Loading...</h2><p>Please wait while we load the Benchmark Detail.</p></div>}>
            <BenchmarkDetail />
          </Suspense>
        }
      />
      {/* Make Comparison public */}
      <Route
        path="/compare"
        element={
          <Suspense fallback={<div className="card"><h2>Loading...</h2><p>Please wait while we load the Comparison page.</p></div>}>
            <ComparisonPage />
          </Suspense>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<div className="card"><h2>Loading...</h2><p>Please wait while we load the Dashboard.</p></div>}>
            <Dashboard />
          </Suspense>
        }
      />
      <Route
        path="/"
        element={
          <Suspense fallback={<div className="card"><h2>Loading...</h2><p>Please wait while we load the Dashboard.</p></div>}>
            <Dashboard />
          </Suspense>
        }
      />
      {/* Demo placeholder routes for navigation */}
        <Route path="/projects" element={<div className="demo-placeholder"><h2>Projects (Demo)</h2><p>This is a placeholder for the Projects page.</p></div>} />
        <Route path="/reports" element={<div className="demo-placeholder"><h2>Reports (Demo)</h2><p>This is a placeholder for the Reports page.</p></div>} />
        <Route path="/media" element={<div className="demo-placeholder"><h2>Media Library (Demo)</h2><p>This is a placeholder for the Media Library page.</p></div>} />
        <Route path="/settings" element={<div className="demo-placeholder"><h2>Settings (Demo)</h2><p>This is a placeholder for the Settings page.</p></div>} />
        <Route path="/advanced-search" element={<div className="demo-placeholder"><h2>Advanced Search (Demo)</h2><p>This is a placeholder for the Advanced Search page.</p></div>} />
      {/* Fallback: only protect other routes */}
      <Route
        path="*"
        element={
          !me ? (
            <LoggedOutView onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Suspense fallback={
              <div className="card">
                <h2>Loading...</h2>
                <p>Please wait while we load your dashboard.</p>
              </div>
            }>
              <div className="container">
                <LoggedInView 
                  me={me} 
                  token={token} 
                  page={page} 
                  setPage={navigateToPage} 
                  onLogout={handleLogout} 
                />
              </div>
            </Suspense>
          )
        }
      />
    </Routes>
  )
}

export default App
