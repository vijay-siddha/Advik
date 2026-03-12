import { useEffect, useState } from 'react'
import { ApiWithFallback as Api } from '../api-fallback'
import ComparisonTable, { type ComponentItem } from './ComparisonTable'
import NavBar from './NavBar'
import CreateComponentForm from './CreateComponentForm'
import AdvancedComponentCreator from './AdvancedComponentCreator'
import ComponentTreeView from './ComponentTreeView'
import type { User } from '@shared/types'

interface LoggedInViewProps {
  me: User
  token: string
  page: 'home' | 'components' | 'compare' | 'create' | 'create-adv' | 'edit'
  setPage: (page: 'home' | 'components' | 'compare' | 'create' | 'create-adv' | 'edit') => void
  onLogout: () => void
}

export default function LoggedInView({ me, token, page, setPage, onLogout }: LoggedInViewProps) {
  const [adminError, setAdminError] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState<{ name: string; email: string; password: string; role: 'user' | 'admin' }>({ name: '', email: '', password: '', role: 'user' })
  
  const [compError, setCompError] = useState('')
  const [components, setComponents] = useState<any[]>([])
  const [editingComponent, setEditingComponent] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree')
  const [columns, setColumns] = useState<string[]>(['CMP-001','CMP-002'])
  const [onlyCommon, setOnlyCommon] = useState(false)
  const [highlightDiff, setHighlightDiff] = useState(true)

  const TEST_COMPONENTS: ComponentItem[] = [
    {
      id: 'CMP-001',
      name: 'Industrial Centrifugal Pump',
      attributes: {
        'Flow Rate': '500 m³/h',
        'Max Pressure': '15 Bar',
        'Power Source': 'Electric',
        'Operating Temp': '-10°C to 120°C',
        'Material': 'Stainless Steel 316'
      },
      photoUrl: 'https://picsum.photos/seed/pump/400/300'
    },
    {
      id: 'SUB-101',
      name: 'Heavy Duty Impeller',
      attributes: {
        'Diameter': '250mm',
        'Vane Count': '6',
        'Balancing Grade': 'G2.5',
        'Coating': 'Ceramic'
      },
      photoUrl: 'https://picsum.photos/seed/impeller/400/300'
    },
    {
      id: 'CMP-002',
      name: 'High-Pressure Diesel Generator',
      attributes: {
        'Power Output': '250 kVA',
        'Fuel Consumption': '45 L/h',
        'Max Pressure': '10 Bar',
        'Noise Level': '75 dB',
        'Cooling System': 'Water Cooled'
      },
      photoUrl: 'https://picsum.photos/seed/generator/400/300'
    },
    {
      id: 'SUB-102',
      name: 'Fuel Injection Nozzle',
      attributes: {
        'Spray Angle': '120°',
        'Opening Pressure': '250 Bar',
        'Material': 'Tungsten Carbide'
      },
      photoUrl: 'https://picsum.photos/seed/nozzle/400/300'
    }
  ]

  function prefixUpload(url?: string) {
    if (!url) return ''
    if (url.startsWith('/uploads/')) return `http://localhost:3000${url}`
    return url
  }

  const combined: ComponentItem[] = [
    ...TEST_COMPONENTS,
    ...components
      .filter((c) => (c.status || 'draft') === 'published')
      .map((c) => ({
      id: c.id,
      name: c.name,
      attributes: c.attributes || {},
      photoUrl: prefixUpload((c.media && c.media.photos && c.media.photos[0]) || '')
    }))
  ]

  useEffect(() => {
    if (page === 'compare') {
      ensureDefaultColumns()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, combined.length])

  function ensureDefaultColumns() {
    if (columns.length >= 2) return
    const ids = combined.map(c => c.id)
    const base = ['CMP-001','CMP-002'].filter(id => ids.includes(id))
    const extra = ids.filter(id => !base.includes(id)).slice(0, 2 - base.length)
    setColumns([...base, ...extra])
  }

  useEffect(() => {
    async function loadForCompare() {
      if (!token || page !== 'compare') return
      try {
        const r = await Api.listComponents(token)
        setComponents(r.items || [])
      } catch {}
    }
    loadForCompare()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, token])

  useEffect(() => {
    async function loadComponents() {
      if (!token || page !== 'components') return
      try {
        const r = await Api.listComponents(token, undefined, undefined, viewMode === 'tree')
        setComponents(r.items || [])
      } catch {}
    }
    loadComponents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, token, viewMode])

  useEffect(() => {
    if (me.role === 'admin') {
      const loadUsers = async () => {
        try {
          const { users } = await Api.listUsers(token)
          setUsers(users as User[])
        } catch {
          setUsers([])
        }
      }
      loadUsers()
    }
  }, [me, token])

  async function handleAddUser() {
    setAdminError('')
    try {
      await Api.addUser(token, newUser as any)
      setNewUser({ name: '', email: '', password: '', role: 'user' })
      const { users } = await Api.listUsers(token)
      setUsers(users as User[])
    } catch (e: any) {
      setAdminError(e.message)
    }
  }

  async function toggleRole(u: User) {
    setAdminError('')
    try {
      const nextRole = u.role === 'admin' ? 'user' : 'admin'
      await Api.updateUser(token, u.id, { role: nextRole } as any)
      const { users } = await Api.listUsers(token)
      setUsers(users as User[])
    } catch (e: any) {
      setAdminError(e.message)
    }
  }

  async function resetPassword(u: User) {
    setAdminError('')
    try {
      const pw = Math.random().toString(36).slice(2, 10)
      await Api.updateUser(token, u.id, { password: pw } as any)
      alert('New temporary password: ' + pw)
    } catch (e: any) {
      setAdminError(e.message)
    }
  }

  async function deleteUser(u: User) {
    setAdminError('')
    try {
      await Api.deleteUser(token, u.id)
      const { users } = await Api.listUsers(token)
      setUsers(users as User[])
    } catch (e: any) {
      setAdminError(e.message)
    }
  }

  async function handleDeleteComponent(c: any) {
    if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return
    try {
      await Api.deleteComponent(token, c.id)
      setComponents(prev => prev.filter(x => x.id !== c.id))
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <>
      <NavBar page={page} setPage={setPage} me={me} onLogout={onLogout} />

      {page === 'home' && me.role === 'admin' && (
        <div className="card">
          <h2>Admin: Users</h2>
          <div className="row">
            <input placeholder="Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
            <input placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            <input placeholder="Temp password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            <select
              title="Select user role"
              aria-label="Select user role"
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value as 'user' | 'admin' })}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <button onClick={handleAddUser}>Add</button>
          </div>
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="pill">{u.role}</span></td>
                  <td className="actions">
                    <button onClick={() => toggleRole(u)}>{u.role === 'admin' ? 'Demote' : 'Promote'}</button>
                    <button onClick={() => resetPassword(u)}>Reset PW</button>
                    <button className="secondary" onClick={() => deleteUser(u)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {adminError && <p className="error">{adminError}</p>}
        </div>
      )}
      
      {page === 'components' && (
        <div className="card">
          <div className="comp-page-header">
            <div>
              <h2 style={{ margin: 0 }}>Components</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
                {components.length} component{components.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="comp-page-actions">
              <div className="view-toggle">
                <button
                  className={viewMode === 'tree' ? 'view-toggle-btn active' : 'view-toggle-btn'}
                  onClick={() => setViewMode('tree')}
                >
                  &#9783; Tree
                </button>
                <button
                  className={viewMode === 'table' ? 'view-toggle-btn active' : 'view-toggle-btn'}
                  onClick={() => setViewMode('table')}
                >
                  &#9776; Table
                </button>
              </div>
              <button className="secondary" onClick={async () => {
                try {
                  setCompError('')
                  const r = await Api.listComponents(token, undefined, undefined, viewMode === 'tree')
                  setComponents(r.items || [])
                } catch (e: any) {
                  setCompError(e.message)
                }
              }}>&#8635; Refresh</button>
              <button onClick={() => setPage('create')}>+ Create</button>
              <button className="secondary" onClick={() => setPage('create-adv')}>+ Create (Advanced)</button>
            </div>
          </div>

          {compError && <p className="error">{compError}</p>}

          {components.length === 0 ? (
            <div className="comp-empty">
              <p>No components yet. Create one to get started.</p>
            </div>
          ) : viewMode === 'tree' ? (
            <ComponentTreeView
              components={components}
              onComponentSelect={(component) => {
                console.log('Selected component:', component)
              }}
              onEdit={(component) => {
                setEditingComponent(component)
                setPage('edit')
              }}
            />
          ) : (
            <div className="comp-table-wrap">
              <table className="comp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Parent</th>
                    <th>Attributes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((c) => (
                    <tr key={c.id}>
                      <td className="comp-table-name">{c.name}</td>
                      <td><span className={`status-pill status-${c.status || 'draft'}`}>{c.status || 'draft'}</span></td>
                      <td className="comp-table-muted">{c.parent_id || '—'}</td>
                      <td className="comp-table-muted">{Object.keys(c.attributes || {}).length}</td>
                      <td>
                        <button className="secondary icon-btn" onClick={() => { setEditingComponent(c); setPage('edit') }} title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {page === 'edit' && (
        <div className="card form-page-card">
          {editingComponent ? (
            <CreateComponentForm
              initialData={{
                id: editingComponent.id,
                name: editingComponent.name,
                parent_id: editingComponent.parent_id,
                attributes: editingComponent.attributes || {},
                status: editingComponent.status || 'draft',
              }}
              onCancel={() => { setEditingComponent(null); setPage('components') }}
              onSubmit={async (form) => {
                try {
                  await Api.updateComponent(token, editingComponent.id, form)
                  setEditingComponent(null)
                  setPage('components')
                } catch (e: any) {
                  alert(e.message)
                }
              }}
            />
          ) : (
            <p>No component selected. <button className="secondary" onClick={() => setPage('components')}>Back to Components</button></p>
          )}
        </div>
      )}

      {page === 'create' && (
        <div className="card form-page-card">
          <CreateComponentForm
            onCancel={() => setPage('components')}
            onSubmit={async (form) => {
              try {
                await Api.createComponent(token, form)
                setPage('components')
              } catch (e: any) {
                alert(e.message)
              }
            }}
          />
        </div>
      )}

      {page === 'create-adv' && (
        <div className="card form-page-card">
          <AdvancedComponentCreator token={token} onDone={() => setPage('components')} />
        </div>
      )}
      
      {page === 'compare' && (
        <div className="card">
          <div className="row spread" style={{ marginBottom: 12 }}>
            <div>
              <h2 style={{ margin: 0 }}>Compare Components</h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
                {columns.length} component{columns.length !== 1 ? 's' : ''} selected
                &nbsp;&middot;&nbsp; {combined.length} available
              </p>
            </div>
          </div>
          <ComparisonTable
            options={combined}
            columns={columns}
            onColumnsChange={(ids) => setColumns(ids)}
            highlightDifferences={highlightDiff}
            onlyCommon={onlyCommon}
            onToggleHighlight={(v) => setHighlightDiff(v)}
            onToggleOnlyCommon={(v) => setOnlyCommon(v)}
          />
        </div>
      )}
    </>
  )
}
