import { useEffect, useState } from 'react'
import { ApiWithFallback as Api } from '../api-fallback'
import ComparisonTable, { type ComponentItem } from './ComparisonTable'
import Shell from './Shell'
import CreateComponentForm from './CreateComponentForm'
import AdvancedComponentCreator from './AdvancedComponentCreator'
import ComponentTreeView from './ComponentTreeView'
import Dashboard from './Dashboard'
import BenchmarkList from './BenchmarkList'
import Comparison from './Comparison'
import BenchmarkDetail from './BenchmarkDetail'
import type { User } from '@shared/types'

interface LoggedInViewProps {
  me: User
  token: string
  page: 'home' | 'components' | 'compare' | 'create' | 'create-adv' | 'edit' | 'benchmark-detail'
  setPage: (page: 'home' | 'components' | 'compare' | 'create' | 'create-adv' | 'edit' | 'benchmark-detail') => void
  onLogout: () => void
}

export default function LoggedInView({ me, token, page, setPage, onLogout }: LoggedInViewProps) {
  const [adminError, setAdminError] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState<{ name: string; email: string; password: string; role: 'user' | 'admin' }>({ name: '', email: '', password: '', role: 'user' })
  
  const [compError, setCompError] = useState('')
  const [components, setComponents] = useState<any[]>([])
  const [editingComponent, setEditingComponent] = useState<any | null>(null)
  const [selectedBenchmark, setSelectedBenchmark] = useState<any | null>(null)

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
    async function loadForCompare() {
      if (!token || page !== 'compare') return
      try {
        const r = await Api.listComponents(token)
        setComponents(r.items || [])
      } catch {}
    }
    loadForCompare()
  }, [page, token])

  useEffect(() => {
    async function loadComponents() {
      if (!token || page !== 'components') return
      try {
        const r = await Api.listComponents(token)
        setComponents(r.items || [])
      } catch {}
    }
    loadComponents()
  }, [page, token])

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
    <Shell page={page} setPage={setPage} me={me} onLogout={onLogout}>
      {page === 'home' && (
        <Dashboard userName={me.name} />
      )}
      
      {page === 'components' && (
        <BenchmarkList 
          onCreateNew={() => setPage('create')}
          onView={(item) => {
            setSelectedBenchmark(item)
            setPage('benchmark-detail')
          }}
          onEdit={(item) => console.log('Edit benchmark:', item)}
          onDelete={(item) => console.log('Delete benchmark:', item)}
          onCompare={(items) => {
            console.log('Compare benchmarks:', items)
            setPage('compare')
          }}
        />
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
        <Comparison 
          onGenerateReport={() => console.log('Generate report')}
          onAddProduct={() => setPage('components')}
        />
      )}
      
      {page === 'benchmark-detail' && (
        <BenchmarkDetail 
          benchmarkId={selectedBenchmark?.id || 'BMT-2024-TDI'}
          onEdit={() => console.log('Edit benchmark')}
          onReport={() => console.log('Generate report')}
          onShare={() => console.log('Share benchmark')}
          onBack={() => setPage('components')}
        />
      )}
    </Shell>
  )
}
