import React, { useState, useEffect, useRef } from 'react'
import type { User } from '@shared/types'

export type Page = 'home' | 'components' | 'compare' | 'create' | 'create-adv' | 'edit'

function crumbsFor(page: Page) {
  if (page === 'home') return ['Home']
  if (page === 'compare') return ['Home', 'Compare']
  if (page === 'components') return ['Home', 'Components']
  if (page === 'create') return ['Home', 'Components', 'Create']
  if (page === 'edit') return ['Home', 'Components', 'Edit']
  return ['Home']
}

export function NavBar({ page, setPage, me, onLogout }: { page: Page; setPage: (p: Page) => void; me: User; onLogout: () => void }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const crumbs = crumbsFor(page)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  return (
    <div className="navbar">
      <div className="nav-inner">
        <div className="nav-left">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1
              const onClick = () => {
                if (c === 'Home') setPage('home')
                if (c === 'Compare') setPage('compare')
                if (c === 'Components') setPage('components')
                if (c === 'Create') setPage('create')
                if (c === 'Edit') setPage('components')
              }
              return (
                <span key={c} className={isLast ? 'crumb current' : 'crumb'} onClick={!isLast ? onClick : undefined}>
                  {c}{!isLast && <span className="sep">/</span>}
                </span>
              )
            })}
          </nav>
          <div className="nav-links">
            <button className={page === 'compare' ? 'link active' : 'link'} onClick={() => setPage('compare')}>Compare</button>
            <button className={page === 'components' ? 'link active' : 'link'} onClick={() => setPage('components')}>Components</button>
            <button className={page === 'benchmarks' ? 'link active' : 'link'} onClick={() => setPage('benchmarks')}>Benchmarks</button>
          </div>
        </div>
        <div className="nav-right">
          <div className="user-menu-container" ref={userMenuRef}>
            <button 
              className="user-button" 
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {me.name} · <span className="pill">{me.role}</span>
            </button>
            {showUserMenu && (
              <div className="user-menu">
                {me.role === 'admin' && (
                  <button className="menu-item" onClick={() => { setPage('home'); setShowUserMenu(false) }}>
                    Users
                  </button>
                )}
                <button className="menu-item" onClick={onLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavBar
