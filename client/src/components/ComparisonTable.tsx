import React from 'react'

type Attrs = Record<string, string | number | boolean | null | undefined>
type Media = { photos?: string[]; videos?: string[]; docs?: string[] }
export type ComponentItem = { id: string; name: string; attributes: Attrs; media?: Media; photoUrl?: string }

export type ComparisonTableProps = {
  options: ComponentItem[]
  columns: string[]
  onColumnsChange: (ids: string[]) => void
  highlightDifferences: boolean
  onlyCommon: boolean
  onToggleHighlight: (v: boolean) => void
  onToggleOnlyCommon: (v: boolean) => void
}

function valueToString(v: any) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function computeRows(items: ComponentItem[], onlyCommon: boolean) {
  const keySets = items.map(i => new Set(Object.keys(i.attributes || {})))
  let keys: string[] = []
  if (onlyCommon && keySets.length) {
    const common = [...keySets[0]].filter(k => keySets.every(s => s.has(k)))
    keys = common.sort()
  } else {
    const all = new Set<string>()
    keySets.forEach(s => s.forEach(k => all.add(k)))
    keys = [...all].sort()
  }
  return keys
}

export function ComparisonTable({ options, columns, onColumnsChange, highlightDifferences = false, onlyCommon = false, onToggleHighlight, onToggleOnlyCommon }: ComparisonTableProps) {
  const cols = columns
    .map(id => options.find(o => o.id === id))
    .filter(Boolean) as ComponentItem[]
  const keys = computeRows(cols, onlyCommon)
  function addColSafe() {
    const set = new Set(columns)
    const next = options.find(o => !set.has(o.id))
    if (!next) return
    onColumnsChange([...columns, next.id])
  }
  function changeAt(idx: number, val: string) {
    const cur = [...columns]
    const j = cur.findIndex(x => x === val)
    if (j !== -1 && j !== idx) {
      const tmp = cur[idx]
      cur[idx] = cur[j]
      cur[j] = tmp
    } else {
      cur[idx] = val
    }
    const uniq: string[] = []
    const seen = new Set<string>()
    for (const id of cur) { if (!seen.has(id)) { seen.add(id); uniq.push(id) } }
    onColumnsChange(uniq)
  }
  return (
    <div className="overflow-auto border rounded-md">
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <label>
            <input type="checkbox" checked={highlightDifferences} onChange={e => onToggleHighlight(e.target.checked)} /> Highlight Differences
          </label>
          <label>
            <input type="checkbox" checked={onlyCommon} onChange={e => onToggleOnlyCommon(e.target.checked)} /> Only Common Specs
          </label>
        </div>
      </div>
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-white shadow-sm">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Spec</span>
                <button
                  aria-label="Add column"
                  title="Add column"
                  onClick={addColSafe}
                  style={{
                    width: 22,
                    height: 22,
                    lineHeight: '20px',
                    textAlign: 'center',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    background: '#f9fafb',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </th>
            {columns.map((id, idx) => {
              const selected = options.find(o => o.id === id)
              return (
                <th key={id + ':' + idx} className="px-3 py-2 text-left font-semibold">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selected && selected.photoUrl
                      ? <img src={selected.photoUrl} alt={selected.name} style={{ width: 72, height: 48, borderRadius: 6, objectFit: 'cover' }} />
                      : <div style={{ width: 72, height: 48, borderRadius: 6, background: '#e5e7eb' }} />}
                    <select value={id} onChange={e => changeAt(idx, e.target.value)}>
                      {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {keys.map(k => {
            const values = cols.map(i => valueToString((i.attributes || {})[k]))
            const allSame = values.every(v => v === values[0])
            const diff = !allSame
            const rowClass = highlightDifferences && diff ? 'bg-yellow-50' : ''
            return (
              <tr key={k} className={rowClass}>
                <td className="px-3 py-2 font-medium">{k}</td>
                {cols.map((i, idx) => (
                  <td key={(i.id || idx) + ':' + k} className="px-3 py-2">
                    {values[idx]}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ComparisonTable
