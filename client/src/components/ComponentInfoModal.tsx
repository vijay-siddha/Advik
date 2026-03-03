import React, { useEffect, useState } from 'react'
import { Api } from '../api'

type Node = {
  id: string
  name: string
  parent_id: string | null
  attributes: Record<string, any>
  media: { photos?: string[]; videos?: string[]; docs?: string[] }
  status?: string
  created_at?: string
  updated_at?: string
  children?: Node[]
}

export default function ComponentInfoModal({
  token,
  id,
  open,
  onClose,
  draft
}: {
  token?: string
  id?: string
  open: boolean
  onClose: () => void
  draft?: Node
}) {
  const [data, setData] = useState<{ item: Node; ancestors?: Node[] } | null>(null)
  useEffect(() => {
    if (!open) return
    if (draft) {
      setData({ item: draft, ancestors: [] })
      return
    }
    if (token && id) {
      Api.request && null
      ;(async () => {
        const r = await fetch(`http://localhost:3000/api/components/${id}/tree`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const j = await r.json()
        setData(j)
      })()
    }
  }, [open, token, id, draft])

  function renderNode(n: Node, depth = 0) {
    return (
      <div key={n.id} style={{ marginLeft: depth * 12 }}>
        <div style={{ fontWeight: 600 }}>{n.name}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>{n.id} {n.status ? `• ${n.status}` : ''}</div>
        <div style={{ marginTop: 6 }}>
          <table>
            <tbody>
              {Object.entries(n.attributes || {}).map(([k, v]) => (
                <tr key={k}><td style={{ paddingRight: 8, fontWeight: 600 }}>{k}</td><td>{String(v)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {(n.children || []).map(c => renderNode(c, depth + 1))}
      </div>
    )
  }

  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#fff', borderRadius: 8, width: '80%', maxHeight: '80%', overflow: 'auto', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Component Details</h3>
          <button className="secondary" onClick={onClose}>Close</button>
        </div>
        {!data ? <div>Loading…</div> : (
          <div>
            {data.ancestors && data.ancestors.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Ancestors</div>
                <div style={{ fontSize: 14, color: '#374151' }}>
                  {data.ancestors.map(a => a.name).reverse().join(' > ')}
                </div>
              </div>
            )}
            {renderNode(data.item, 0)}
          </div>
        )}
      </div>
    </div>
  )
}
