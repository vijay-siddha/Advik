import { useEffect, useState } from 'react'
import { Api } from '../api'
import ComparisonTable, { type ComponentItem } from './ComparisonTable'
import NavBar from './NavBar'
import CreateComponentForm from './CreateComponentForm'
import AdvancedComponentCreator from './AdvancedComponentCreator'
import ComponentTreeView from './ComponentTreeView'
import type { User } from '@shared/types'

interface LoggedInViewProps {
  me: User
  token: string
  page: 'home' | 'components' | 'compare' | 'create' | 'create-adv'
  setPage: (page: 'home' | 'components' | 'compare' | 'create' | 'create-adv') => void
  onLogout: () => void
}

export default function LoggedInView({ me, token, page, setPage, onLogout }: LoggedInViewProps) {
  const [adminError, setAdminError] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState<{ name: string; email: string; password: string; role: 'user' | 'admin' }>({ name: '', email: '', password: '', role: 'user' })
  
  const [compError, setCompError] = useState('')
  const [components, setComponents] = useState<any[]>([])
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
            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as 'user' | 'admin' })}>
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
          <div className="row spread">
            <h2>Components</h2>
            <div className="row">
              <button 
                className={viewMode === 'tree' ? 'link active' : 'link secondary'} 
                onClick={() => setViewMode('tree')}
              >
                Tree View
              </button>
              <button 
                className={viewMode === 'table' ? 'link active' : 'link secondary'} 
                onClick={() => setViewMode('table')}
              >
                Table View
              </button>
              <button onClick={() => setPage('create')}>Create Component</button>
              <button className="secondary" onClick={() => setPage('create-adv')}>Create (Advanced)</button>
            </div>
          </div>
          <div className="row">
            <button className="secondary" onClick={async () => {
              try {
                setCompError('')
                const r = await Api.listComponents(token, undefined, undefined, viewMode === 'tree')
                setComponents(r.items || [])
              } catch (e: any) {
                setCompError(e.message)
              }
            }}>Refresh</button>
          </div>
          {compError && <p className="error">{compError}</p>}
          {viewMode === 'tree' ? (
            <ComponentTreeView 
              components={components} 
              onComponentSelect={(component) => {
                // You can add component selection logic here
                console.log('Selected component:', component)
              }}
            />
          ) : (
            <table>
              <thead>
                <tr><th>Name</th><th>Parent</th><th>Attributes</th></tr>
              </thead>
              <tbody>
                {components.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.parent_id || '-'}</td>
                    <td>{Object.keys(c.attributes || {}).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {page === 'create' && (
        <div className="card">
          <h2>Create Component</h2>
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
        <div className="card">
          <AdvancedComponentCreator token={token} onDone={() => setPage('components')} />
        </div>
      )}
      
      {page === 'compare' && (
        <div className="card">
          <h2>Compare Components</h2>
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
