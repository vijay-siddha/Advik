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
  function removeCol(idx: number) {
    onColumnsChange(columns.filter((_, i) => i !== idx))
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
    <div className="compare-wrap">
      <div className="compare-toolbar">
        <label className="compare-toggle">
          <input type="checkbox" checked={highlightDifferences} onChange={e => onToggleHighlight(e.target.checked)} />
          Highlight Differences
        </label>
        <label className="compare-toggle">
          <input type="checkbox" checked={onlyCommon} onChange={e => onToggleOnlyCommon(e.target.checked)} />
          Only Common Specs
        </label>
      </div>
      <div className="compare-scroll">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-th compare-th-spec">
                <div className="compare-spec-header">
                  <span>Spec</span>
                  <button
                    className="compare-add-btn"
                    aria-label="Add column"
                    title="Add column"
                    onClick={addColSafe}
                  >
                    +
                  </button>
                </div>
              </th>
              {columns.map((id, idx) => {
                const selected = options.find(o => o.id === id)
                return (
                  <th key={id + ':' + idx} className="compare-th compare-th-col">
                    <div className="compare-col-header">
                      {selected && selected.photoUrl
                        ? <img src={selected.photoUrl} alt={selected.name} className="compare-thumb" />
                        : <div className="compare-thumb-placeholder" />}
                      <div className="compare-col-controls">
                        <select
                          className="compare-select"
                          value={id}
                          title="Select component"
                          onChange={e => changeAt(idx, e.target.value)}
                        >
                          {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                        <button
                          className="compare-remove-btn"
                          aria-label="Remove column"
                          title="Remove column"
                          onClick={() => removeCol(idx)}
                        >
                          &times;
                        </button>
                      </div>
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
              return (
                <tr key={k} className={highlightDifferences && diff ? 'compare-row-diff' : 'compare-row'}>
                  <td className="compare-td-key">{k}</td>
                  {cols.map((i, idx) => (
                    <td key={(i.id || idx) + ':' + k} className="compare-td">
                      {values[idx] || <span className="compare-empty">—</span>}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ComparisonTable
