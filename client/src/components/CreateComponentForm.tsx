import React, { useState } from 'react'

type KV = { key: string; value: string }

export function CreateComponentForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (payload: FormData) => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)
  const [attrs, setAttrs] = useState<KV[]>([{ key: '', value: '' }])
  const [photos, setPhotos] = useState<FileList | null>(null)
  const [videos, setVideos] = useState<FileList | null>(null)
  const [docs, setDocs] = useState<FileList | null>(null)

  function next() { setStep(s => (s < 4 ? ((s + 1) as any) : s)) }
  function prev() { setStep(s => (s > 1 ? ((s - 1) as any) : s)) }
  function addAttr() { setAttrs(a => [...a, { key: '', value: '' }]) }
  function updateAttr(i: number, field: 'key' | 'value', v: string) {
    setAttrs(a => a.map((kv, idx) => (idx === i ? { ...kv, [field]: v } : kv)))
  }
  function submit() {
    const attributes: Record<string, string> = {}
    attrs.forEach(kv => { if (kv.key) attributes[kv.key] = kv.value })
    const form = new FormData()
    form.append('name', name)
    if (parentId) form.append('parent_id', parentId)
    form.append('attributes', JSON.stringify(attributes))
    if (photos) Array.from(photos).forEach(f => form.append('photos', f))
    if (videos) Array.from(videos).forEach(f => form.append('videos', f))
    if (docs) Array.from(docs).forEach(f => form.append('docs', f))
    onSubmit(form)
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <button className="secondary" onClick={onCancel}>Back</button>
        <div style={{ marginLeft: 'auto' }} />
        <span>Step {step} of 4</span>
      </div>
      {step === 1 && (
        <div className="row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <label>Name <input value={name} onChange={e => setName(e.target.value)} /></label>
          <label>Parent ID (optional) <input value={parentId || ''} onChange={e => setParentId(e.target.value || null)} /></label>
          <div className="row"><button onClick={next}>Next</button></div>
        </div>
      )}
      {step === 2 && (
        <div>
          {attrs.map((kv, i) => (
            <div className="row" key={i}>
              <input placeholder="Key" value={kv.key} onChange={e => updateAttr(i, 'key', e.target.value)} />
              <input placeholder="Value" value={kv.value} onChange={e => updateAttr(i, 'value', e.target.value)} />
            </div>
          ))}
          <div className="row">
            <button className="secondary" onClick={addAttr}>Add Attribute</button>
          </div>
          <div className="row">
            <button className="secondary" onClick={prev}>Back</button>
            <button onClick={next}>Next</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="row"><label>Photos <input type="file" multiple onChange={e => setPhotos(e.target.files)} /></label></div>
          <div className="row"><label>Videos <input type="file" multiple onChange={e => setVideos(e.target.files)} /></label></div>
          <div className="row"><label>Docs <input type="file" multiple onChange={e => setDocs(e.target.files)} /></label></div>
          <div className="row">
            <button className="secondary" onClick={prev}>Back</button>
            <button onClick={next}>Next</button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div>
          <p>Review and submit.</p>
          <div className="row">
            <button className="secondary" onClick={prev}>Back</button>
            <button onClick={submit}>Create</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateComponentForm
