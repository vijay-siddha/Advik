import React, { useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Api } from '../api'

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
    return (
      <div className="row" style={{ marginBottom: 8 }}>
        <div className="pill" style={{ background: step === 1 ? '#2563eb' : '#eef2ff', color: step === 1 ? '#fff' : '#3730a3' }}>1. Basic Info</div>
        <div className="pill" style={{ background: step === 2 ? '#2563eb' : '#eef2ff', color: step === 2 ? '#fff' : '#3730a3' }}>2. Technical Specs</div>
        <div className="pill" style={{ background: step === 3 ? '#2563eb' : '#eef2ff', color: step === 3 ? '#fff' : '#3730a3' }}>3. Media</div>
      </div>
    )
  }

  function ChildEditor({ idx, depth = 1 }: { idx: number; depth?: number }) {
    const base = `children.${idx}`
    const { fields: childProps, append: appendProp, remove: removeProp } = useFieldArray({ control, name: `${base}.properties` as any })
    const { fields: grandChildren, append: appendGrand, remove: removeGrand } = useFieldArray({ control, name: `${base}.children` as any })
    return (
      <div style={{ marginLeft: depth * 16, borderLeft: '2px solid #e5e7eb', paddingLeft: 12, marginTop: 8 }}>
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <label>Name
            <input {...register(`${base}.name` as const)} placeholder="Subcomponent name" />
          </label>
          <button type="button" className="secondary" onClick={() => removeChild(idx)}>Remove Subcomponent</button>
        </div>
        <div>
          {childProps.map((cp, pi) => (
            <div className="row" key={cp.id} style={{ alignItems: 'flex-end' }}>
              <input {...register(`${base}.properties.${pi}.key` as const)} placeholder="Key" list="attr-keys" />
              <select {...register(`${base}.properties.${pi}.type` as const)}>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
              </select>
              <input {...register(`${base}.properties.${pi}.value` as const)} placeholder="Value" />
              <button type="button" className="secondary" onClick={() => removeProp(pi)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => appendProp({ key: '', value: '', type: 'string' } as any)}>Add Property</button>
        </div>
        {grandChildren.length > 0 && <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280' }}>Subcomponents</div>}
        {grandChildren.map((gc, gi) => (
          <ChildEditor key={gc.id} idx={gi as any} depth={(depth || 1) + 1} />
        ))}
        <div style={{ marginTop: 6 }}>
          <button type="button" onClick={() => appendGrand({ name: '', properties: [], children: [] } as any)}>Add Subcomponent</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="row spread">
        <h2>Advanced Component Creator</h2>
        <button className="secondary" onClick={onDone}>Back</button>
      </div>
      <Stepper />
      <form onSubmit={handleSubmit(async (data) => { await submitTree(data, null); onDone(); })}>
        {step === 1 && (
          <>
            <div className="row" style={{ alignItems: 'flex-end' }}>
              <label>Name
                <input {...register('name')} placeholder="e.g., Industrial Centrifugal Pump" />
              </label>
              <label>Status
                <select {...register('status')}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label>Parent
                <input list="parent-list" placeholder="Search parent..." onChange={e => setValue('parent_id', e.target.value || null)} />
                <datalist id="parent-list">
                  {parentOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </datalist>
              </label>
              <label>Duplicate From
                <select value={dupSource} onChange={e => setDupSource(e.target.value)}>
                  <option value="">Select</option>
                  {components.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <button type="button" onClick={duplicateFromExisting}>Copy Attributes</button>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button type="button" onClick={async () => { const ok = await trigger(['name','status'] as any); if (ok) setStep(2) }}>Next: Technical Specs</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3>Properties</h3>
            <div>
              {fields.map((f, idx) => (
                <div className="row" key={f.id} style={{ alignItems: 'flex-end' }}>
                  <input {...register(`properties.${idx}.key` as const)} placeholder="Key" list="attr-keys" />
                  <select {...register(`properties.${idx}.type` as const)}>
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </select>
                  <input {...register(`properties.${idx}.value` as const)} placeholder="Value" />
                  <button type="button" className="secondary" onClick={() => remove(idx)}>Remove</button>
                </div>
              ))}
              <datalist id="attr-keys">
                {keySuggestions.map(k => <option key={k} value={k} />)}
              </datalist>
              <button type="button" onClick={() => append({ key: '', value: '', type: 'string' })}>Add Property</button>
            </div>

            <h3 style={{ marginTop: 16 }}>Subcomponents</h3>
            {childFields.map((c, ci) => (
              <ChildEditor key={c.id} idx={ci} depth={1} />
            ))}
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={() => appendChild({ name: '', properties: [], children: [] } as any)}>Add Subcomponent</button>
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <button type="button" className="secondary" onClick={() => setStep(1)}>Back</button>
              <button type="button" onClick={() => setStep(3)}>Next: Media</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3>Media</h3>
            <div className="row">
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); onDropFiles('photos', e.dataTransfer.files) }}
                style={{ border: '1px dashed #9ca3af', padding: 12, borderRadius: 8 }}
              >
                <div>Drag & Drop Photos here</div>
                <input type="file" multiple onChange={e => onDropFiles('photos', e.target.files!)} />
                <div className="row" style={{ marginTop: 8 }}>
                  {photoPreviews.map((src, i) => <img key={i} src={src} alt="preview" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6 }} />)}
                </div>
              </div>
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); onDropFiles('videos', e.dataTransfer.files) }}
                style={{ border: '1px dashed #9ca3af', padding: 12, borderRadius: 8 }}
              >
                <div>Drag & Drop Videos here</div>
                <input type="file" multiple onChange={e => onDropFiles('videos', e.target.files!)} />
                <div className="row" style={{ marginTop: 8 }}>
                  {videoPreviews.map((src, i) => <video key={i} src={src as any} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} controls />)}
                </div>
              </div>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button type="button" className="secondary" onClick={() => setStep(2)}>Back</button>
              <button type="submit">Create Component</button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
