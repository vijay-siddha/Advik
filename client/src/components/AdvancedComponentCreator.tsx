import React, { useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ApiWithFallback as Api } from '../api-fallback'

const propSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  type: z.enum(['string', 'number', 'boolean']).default('string'),
  value: z.union([z.string(), z.number(), z.boolean()]).transform(v => String(v))
})

const componentSchema: z.ZodType<any> = z.object({
  name: z.string().min(1),
  status: z.enum(['draft', 'published']).default('draft'),
  parent_id: z.string().optional().nullable(),
  properties: z.array(propSchema).default([]),
  photos: z.any().optional(),
  videos: z.any().optional(),
  children: z.array(z.lazy(() => componentSchema)).default([])
})

export type ComponentForm = any

export default function AdvancedComponentCreator({ token, onDone }: { token: string; onDone: () => void }) {
  const { control, register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<ComponentForm>({
    resolver: zodResolver(componentSchema as any),
    defaultValues: {
      name: '',
      status: 'draft',
      parent_id: null,
      properties: [],
      children: []
    }
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'properties' })
  const { fields: childFields, append: appendChild, remove: removeChild } = useFieldArray({ control, name: 'children' })
  const [components, setComponents] = useState<any[]>([])
  const [keySuggestions, setKeySuggestions] = useState<string[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [videoPreviews, setVideoPreviews] = useState<string[]>([])
  const [dupSource, setDupSource] = useState<string>('')
  const [step, setStep] = useState<number>(1)

  useEffect(() => {
    (async () => {
      try {
        const r = await Api.listComponents(token)
        setComponents(r.items || [])
      } catch {}
      try {
        const r2 = await Api.listAttributeKeys(token)
        setKeySuggestions(r2.keys || [])
      } catch {}
    })()
  }, [token])

  function toAttributes(props: { key: string; value: string; type: string }[]) {
    const out: Record<string, any> = {}
    for (const p of props) {
      if (!p.key) continue
      if (p.type === 'number') out[p.key] = Number(p.value)
      else if (p.type === 'boolean') out[p.key] = ['true', '1', 'yes', 'on'].includes(String(p.value).toLowerCase())
      else out[p.key] = p.value
    }
    return out
  }

  function buildFormData(base: any): FormData {
    const fd = new FormData()
    fd.append('name', base.name)
    if (base.parent_id) fd.append('parent_id', base.parent_id)
    fd.append('status', base.status || 'draft')
    fd.append('attributes', JSON.stringify(toAttributes(base.properties || [])))
    ;(base.photos || []).forEach((f: File) => fd.append('photos', f))
    ;(base.videos || []).forEach((f: File) => fd.append('videos', f))
    return fd
  }

  async function submitTree(node: ComponentForm, pid: string | null): Promise<string> {
    const payload = { ...node, parent_id: pid || node.parent_id || null }
    const fd = buildFormData(payload as any)
    const res = await Api.createComponent(token, fd)
    const id = res.item.id as string
    for (const child of node.children || []) {
      await submitTree(child, id)
    }
    return id
  }

  function onDropFiles(kind: 'photos' | 'videos', files: FileList | File[]) {
    const arr = Array.from(files as any)
    setValue(kind, arr as any)
    if (kind === 'photos') setPhotoPreviews(arr.map(f => URL.createObjectURL(f as any)))
    if (kind === 'videos') setVideoPreviews(arr.map(f => URL.createObjectURL(f as any)))
  }

  const parentOptions = useMemo(() => {
    return components.map(c => ({ id: c.id, name: c.name }))
  }, [components])

  async function duplicateFromExisting() {
    if (!dupSource) return
    const src = components.find(c => c.id === dupSource)
    if (!src) return
    setValue('name', `${src.name} Copy`)
    const attrs = src.attributes || {}
    const props = Object.keys(attrs).map(k => {
      const v = attrs[k]
      let type: 'string' | 'number' | 'boolean' = 'string'
      if (typeof v === 'number') type = 'number'
      else if (typeof v === 'boolean') type = 'boolean'
      return { key: k, value: String(v), type }
    })
    setValue('properties', props as any)
  }

  function Stepper() {
    const labels = ['Basic Info', 'Technical Specs', 'Media']
    return (
      <div className="wizard-steps" style={{ marginBottom: 20 }}>
        {labels.map((label, i) => (
          <div key={i} className={`wizard-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
            <span className="wizard-step-num">{i + 1}</span>
            <span className="wizard-step-label">{label}</span>
          </div>
        ))}
      </div>
    )
  }

  function ChildEditor({ idx, depth = 1 }: { idx: number; depth?: number }) {
    const base = `children.${idx}`
    const { fields: childProps, append: appendProp, remove: removeProp } = useFieldArray({ control, name: `${base}.properties` as any })
    const { fields: grandChildren, append: appendGrand } = useFieldArray({ control, name: `${base}.children` as any })
    return (
      <div className="child-editor" style={{ marginLeft: depth * 16 }}>
        <div className="form-row">
          <div className="form-field">
            <label>Name</label>
            <input {...register(`${base}.name` as const)} placeholder="Subcomponent name" />
          </div>
          <button type="button" className="secondary" onClick={() => removeChild(idx)}>Remove</button>
        </div>
        <div className="attr-list">
          {childProps.map((cp, pi) => (
            <div className="attr-row" key={cp.id}>
              <input {...register(`${base}.properties.${pi}.key` as const)} placeholder="Key" list="attr-keys" />
              <select {...register(`${base}.properties.${pi}.type` as const)}>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
              </select>
              <input {...register(`${base}.properties.${pi}.value` as const)} placeholder="Value" />
              <button type="button" className="secondary icon-btn" onClick={() => removeProp(pi)}>&times;</button>
            </div>
          ))}
        </div>
        <button type="button" className="secondary" onClick={() => appendProp({ key: '', value: '', type: 'string' } as any)}>+ Add Property</button>
        {grandChildren.length > 0 && <p className="section-hint">Subcomponents</p>}
        {grandChildren.map((gc, gi) => (
          <ChildEditor key={gc.id} idx={gi as any} depth={(depth || 1) + 1} />
        ))}
        <div className="form-actions">
          <button type="button" className="secondary" onClick={() => appendGrand({ name: '', properties: [], children: [] } as any)}>+ Add Subcomponent</button>
        </div>
      </div>
    )
  }

  return (
    <div className="form-wizard">
      <div className="wizard-header">
        <div>
          <h2 style={{ margin: 0 }}>Advanced Component Creator</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Create components with nested subcomponents</p>
        </div>
        <button className="secondary" onClick={onDone}>← Back</button>
      </div>
      <Stepper />
      <form onSubmit={handleSubmit(async (data) => { await submitTree(data, null); onDone(); })}>

        {step === 1 && (
          <div className="form-section">
            <div className="form-group">
              <div className="form-row">
                <div className="form-field">
                  <label>Name</label>
                  <input {...register('name')} placeholder="e.g., Industrial Centrifugal Pump" />
                  {errors.name && <span className="field-error">{String(errors.name.message)}</span>}
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select {...register('status')}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Parent <span className="form-optional">(optional)</span></label>
                  <input list="parent-list" placeholder="Search parent..." onChange={e => setValue('parent_id', e.target.value || null)} />
                  <datalist id="parent-list">
                    {parentOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </datalist>
                </div>
                <div className="form-field">
                  <label>Duplicate From <span className="form-optional">(optional)</span></label>
                  <div className="dup-row">
                    <select value={dupSource} onChange={e => setDupSource(e.target.value)}>
                      <option value="">— Select —</option>
                      {components.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="button" className="secondary" onClick={duplicateFromExisting}>Copy</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" onClick={async () => { const ok = await trigger(['name', 'status'] as any); if (ok) setStep(2) }}>Next: Technical Specs →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-section">
            <div className="form-group">
              <p className="group-label">Properties</p>
              <div className="attr-list">
                {fields.map((f, idx) => (
                  <div className="attr-row" key={f.id}>
                    <input {...register(`properties.${idx}.key` as const)} placeholder="Key" list="attr-keys" />
                    <select {...register(`properties.${idx}.type` as const)}>
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                    </select>
                    <input {...register(`properties.${idx}.value` as const)} placeholder="Value" />
                    <button type="button" className="secondary icon-btn" onClick={() => remove(idx)}>&times;</button>
                  </div>
                ))}
              </div>
              <datalist id="attr-keys">
                {keySuggestions.map(k => <option key={k} value={k} />)}
              </datalist>
              <div>
                <button type="button" className="secondary" onClick={() => append({ key: '', value: '', type: 'string' })}>+ Add Property</button>
              </div>
            </div>

            <div className="form-group">
              <p className="group-label">Subcomponents</p>
              {childFields.map((c, ci) => (
                <ChildEditor key={c.id} idx={ci} depth={1} />
              ))}
              <div>
                <button type="button" className="secondary" onClick={() => appendChild({ name: '', properties: [], children: [] } as any)}>+ Add Subcomponent</button>
              </div>
            </div>

            <div className="form-actions form-actions-sep">
              <button type="button" className="secondary" onClick={() => setStep(1)}>← Back</button>
              <button type="button" onClick={() => setStep(3)}>Next: Media →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-section">
            <h3 className="section-title">Media</h3>
            <div className="form-row media-row">
              <div
                className="drop-zone"
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); onDropFiles('photos', e.dataTransfer.files) }}
              >
                <p className="drop-zone-hint">📷 Drag &amp; drop photos here</p>
                <input type="file" multiple onChange={e => onDropFiles('photos', e.target.files!)} />
                {photoPreviews.length > 0 && (
                  <div className="drop-zone-previews">
                    {photoPreviews.map((src, i) => <img key={i} src={src} alt="preview" className="media-preview-img" />)}
                  </div>
                )}
              </div>
              <div
                className="drop-zone"
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); onDropFiles('videos', e.dataTransfer.files) }}
              >
                <p className="drop-zone-hint">🎬 Drag &amp; drop videos here</p>
                <input type="file" multiple onChange={e => onDropFiles('videos', e.target.files!)} />
                {videoPreviews.length > 0 && (
                  <div className="drop-zone-previews">
                    {videoPreviews.map((src, i) => <video key={i} src={src as any} className="media-preview-video" controls />)}
                  </div>
                )}
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="secondary" onClick={() => setStep(2)}>← Back</button>
              <button type="submit">✓ Create Component</button>
            </div>
          </div>
        )}

      </form>
    </div>
  )
}
