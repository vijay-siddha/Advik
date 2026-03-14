import React, { useState, useEffect, useRef } from 'react'
import type { User } from '@shared/types'
import './Shell.css'
import { type Page } from './NavBar'

interface ShellProps {
  children: React.ReactNode
  page: Page
  setPage: (page: Page) => void
  me: User
  onLogout: () => void
}

export default function Shell({ children, page, setPage, me, onLogout }: ShellProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const crumbsFor = (page: Page) => {
    if (page === 'home') return ['Home']
    if (page === 'components') return ['Home', 'Benchmark List']
    if (page === 'benchmark-detail') return ['Home', 'Benchmark Details']
    if (page === 'compare') return ['Home', 'Comparisons']
    if (page === 'create') return ['Home', 'Projects', 'Create']
    if (page === 'edit') return ['Home', 'Components', 'Edit']
    return ['Home']
  }

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

  const crumbs = crumbsFor(page)

  return (
    <div className="shell">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button 
            className="menu-btn" 
            onClick={handleMenuToggle}
            aria-label={isMobile ? "Toggle mobile menu" : (sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar")}
            title={isMobile ? "Toggle mobile menu" : (sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar")}
          >
            {isMobile ? '☰' : (sidebarCollapsed ? '☰' : '◀')}
          </button>
          <div className="header-breadcrumb">
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
          </div>
        </div>
        <div className="header-right">
          <div className="search-box">
            <input type="text" placeholder="Search benchmarks, products..." />
            <span className="search-icon">🔍</span>
          </div>
          <button className="icon-btn">
            🔔
            <span className="badge">3</span>
          </button>
          <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="avatar">{getInitials(me.name)}</div>
            <span>{me.name} ▼</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <nav className={`sidebar ${mobileMenuOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="nav-items">
          <a 
            href="#" 
            className={`nav-item ${page === 'home' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setPage('home'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">🏠</span>
            {!sidebarCollapsed && <span>Dashboard</span>}
          </a>
          <a 
            href="#" 
            className={`nav-item ${page === 'components' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setPage('components'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">📊</span>
            {!sidebarCollapsed && <span>Benchmark List</span>}
          </a>
          <a 
            href="#" 
            className={`nav-item ${page === 'benchmark-detail' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setPage('benchmark-detail'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">📋</span>
            {!sidebarCollapsed && <span>Benchmark Details</span>}
          </a>
          <a 
            href="#" 
            className={`nav-item ${page === 'compare' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setPage('compare'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">🔍</span>
            {!sidebarCollapsed && <span>Comparisons</span>}
          </a>
          <a 
            href="#" 
            className={`nav-item ${page === 'create' || page === 'create-adv' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setPage('create'); setMobileMenuOpen(false); }}
          >
            <span className="nav-icon">📁</span>
            {!sidebarCollapsed && <span>Projects</span>}
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📄</span>
            {!sidebarCollapsed && <span>Reports</span>}
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📷</span>
            {!sidebarCollapsed && <span>Media Library</span>}
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">⚙️</span>
            {!sidebarCollapsed && <span>Settings</span>}
          </a>
        </div>
      </nav>

      {/* User Menu Dropdown */}
      {showUserMenu && (
        <div className="user-menu-dropdown" ref={userMenuRef}>
          <div className="user-menu-header">
            <div className="user-avatar">{getInitials(me.name)}</div>
            <div className="user-info">
              <div className="user-name">{me.name}</div>
              <div className="user-role">{me.role}</div>
            </div>
          </div>
          <div className="user-menu-items">
            {me.role === 'admin' && (
              <button 
                className="menu-item" 
                onClick={() => { setPage('home'); setShowUserMenu(false) }}
              >
                <span className="menu-icon">👥</span>
                Users Management
              </button>
            )}
            <button className="menu-item">
              <span className="menu-icon">👤</span>
              Profile Settings
            </button>
            <button className="menu-item">
              <span className="menu-icon">🔔</span>
              Notifications
            </button>
            <hr className="menu-divider" />
            <button className="menu-item logout" onClick={onLogout}>
              <span className="menu-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {children}
      </main>
    </div>
  )
}
