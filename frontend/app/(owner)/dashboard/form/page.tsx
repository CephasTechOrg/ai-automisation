'use client'

import { useState, useEffect, useRef } from 'react'
import { Icon, Card, Field, Input, CopyLinkBox, toast } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

interface FormData {
  form_id: string
  slug: string
  title: string
  description: string | null
  success_message: string
  services: string[] | null
  is_active: boolean
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/

/* ─────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */
export default function MyFormPage() {
  const token = useApiToken()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormData | null>(null)
  const [formUrl, setFormUrl] = useState<string | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [togglingActive, setTogglingActive] = useState(false)

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: FormData }>('/owner/form', token)
      .then(r => {
        setForm(r.data)
        setFormUrl(`${window.location.origin}/forms/${r.data.slug}`)
      })
      .catch(() => toast('Could not load form'))
      .finally(() => setLoading(false))
  }, [token])

  async function patchForm(patch: Partial<FormData>): Promise<FormData | undefined> {
    if (!token || !form) return undefined
    const updated = await api.patch<{ ok: boolean; data: FormData }>('/owner/form', patch, token)
    setForm(updated.data)
    const newUrl = `${window.location.origin}/forms/${updated.data.slug}`
    setFormUrl(newUrl)
    setPreviewKey(k => k + 1) // Reload iframe after any save
    return updated.data
  }

  async function toggleActive() {
    if (!form) return
    setTogglingActive(true)
    try {
      await patchForm({ is_active: !form.is_active })
      toast(form.is_active ? 'Form paused' : 'Form is now live')
    } catch {
      toast('Failed to update')
    } finally {
      setTogglingActive(false)
    }
  }

  if (loading) {
    return (
      <div className="page-pad fade-up" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 60 }}>
        <div className="spinner" /><span className="muted">Loading form…</span>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="page-pad fade-up" style={{ paddingTop: 60, textAlign: 'center' }}>
        <p className="muted">No form found. Contact your administrator.</p>
      </div>
    )
  }

  return (
    <div className="page-pad fade-up" style={{ paddingBottom: 40 }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 26, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">My Form</h1>
          <p className="page-subtitle">Customise your public form and preview exactly what customers see.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* Status badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20,
            background: form.is_active ? 'var(--green-bg, #F0FDF4)' : 'var(--muted-bg)',
            border: `1px solid ${form.is_active ? 'var(--green-border, #BBF7D0)' : 'var(--border)'}`,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: form.is_active ? 'var(--green, #16A34A)' : 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: form.is_active ? 'var(--green, #16A34A)' : 'var(--text-muted)' }}>
              {form.is_active ? 'Live' : 'Paused'}
            </span>
          </div>

          {/* Open in new tab */}
          {formUrl && (
            <button className="btn btn-secondary btn-sm" onClick={() => window.open(formUrl, '_blank')}>
              <Icon name="externalLink" size={15} /> Open Form
            </button>
          )}

          {/* Pause / Activate */}
          <button
            className={`btn btn-sm ${form.is_active ? 'btn-secondary' : 'btn-primary'}`}
            onClick={toggleActive}
            disabled={togglingActive}
          >
            {togglingActive ? <span className="spinner" /> : <Icon name={form.is_active ? 'pause' : 'zap'} size={15} />}
            {form.is_active ? 'Pause form' : 'Activate form'}
          </button>
        </div>
      </div>

      {/* ── Form URL — full width ───────────────────────────── */}
      <FormUrlCard form={form} formUrl={formUrl} patchForm={patchForm} />

      {/* ── Two-column body ─────────────────────────────────── */}
      <div className="fm-grid" style={{ marginTop: 22 }}>

        {/* Left — editing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <FormContentCard form={form} patchForm={patchForm} />
          <ServicesCard form={form} patchForm={patchForm} />
          {formUrl && (
            <Card style={{ padding: '16px 20px' }}>
              <div className="section-title" style={{ fontSize: 14, marginBottom: 10 }}>Share your form</div>
              <CopyLinkBox url={formUrl} />
            </Card>
          )}
        </div>

        {/* Right — live preview + QR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <LivePreviewCard formUrl={formUrl} previewKey={previewKey} onRefresh={() => setPreviewKey(k => k + 1)} />
          {formUrl && <QRCard formUrl={formUrl} />}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Form URL card
───────────────────────────────────────────────────────── */
function FormUrlCard({ form, formUrl, patchForm }: {
  form: FormData
  formUrl: string | null
  patchForm: (p: Partial<FormData>) => Promise<FormData | undefined>
}) {
  const [editing, setEditing] = useState(false)
  const [slugInput, setSlugInput] = useState(form.slug)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setSlugInput(form.slug); setError(null); setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }
  function cancel() { setEditing(false); setError(null); setSlugInput(form.slug) }

  async function save() {
    const val = slugInput.trim().toLowerCase()
    if (val === form.slug) { cancel(); return }
    if (!SLUG_RE.test(val)) {
      setError('Use only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.')
      return
    }
    setSaving(true); setError(null)
    try {
      await patchForm({ slug: val })
      setEditing(false)
      toast('Form URL updated')
    } catch (e: unknown) {
      const msg = (e as { detail?: string })?.detail
      setError(msg ?? 'That URL is already taken. Try a different one.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="section-title" style={{ fontSize: 15 }}>Form URL</div>
        {!editing && (
          <button className="btn btn-ghost btn-xs" onClick={startEdit}>
            <Icon name="edit" size={13} /> Edit URL
          </button>
        )}
      </div>

      {!editing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--muted-bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <Icon name="link" size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, color: 'var(--text-secondary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{formUrl}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 13px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8 }}>
            <Icon name="info" size={14} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12.5, color: '#92400E', lineHeight: 1.5 }}>
              Changing your URL will break any links you have already shared. Customers using the old URL will see a "not found" error.
            </span>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>New URL</div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--input-bg, #fff)' }}>
              <span style={{ padding: '0 12px', fontSize: 13, color: 'var(--text-muted)', background: 'var(--muted-bg)', borderRight: '1px solid var(--border)', height: 40, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                /forms/
              </span>
              <input
                ref={inputRef}
                className="input"
                value={slugInput}
                onChange={e => { setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setError(null) }}
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
                style={{ border: 'none', borderRadius: 0, flex: 1, fontFamily: 'monospace' }}
                placeholder="your-business-name"
                disabled={saving}
              />
            </div>
            {error && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 5 }}>{error}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving || !slugInput.trim() || slugInput.trim() === form.slug}>
              {saving ? <><span className="spinner" /> Saving…</> : 'Save new URL'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={cancel} disabled={saving}>Cancel</button>
          </div>
        </div>
      )}
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────
   Form content card
───────────────────────────────────────────────────────── */
function FormContentCard({ form, patchForm }: {
  form: FormData
  patchForm: (p: Partial<FormData>) => Promise<FormData | undefined>
}) {
  const [title, setTitle] = useState(form.title)
  const [description, setDescription] = useState(form.description ?? '')
  const [successMsg, setSuccessMsg] = useState(form.success_message)
  const [saving, setSaving] = useState(false)

  const dirty = title !== form.title ||
    description !== (form.description ?? '') ||
    successMsg !== form.success_message

  async function save() {
    if (!dirty) return
    setSaving(true)
    try {
      await patchForm({
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        success_message: successMsg.trim() || undefined,
      })
      toast('Form content saved')
    } catch {
      toast('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <div className="section-title" style={{ fontSize: 15, marginBottom: 18 }}>Form Content</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Form title" helper="The heading customers see at the top of your form.">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Request a Quote" />
        </Field>
        <Field label="Description" helper="A short intro below the title (optional).">
          <textarea
            className="textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Fill out the form and we'll get back to you within 24 hours."
            style={{ minHeight: 76, resize: 'vertical' }}
          />
        </Field>
        <Field label="Success message" helper="Shown to customers immediately after they submit.">
          <textarea
            className="textarea"
            value={successMsg}
            onChange={e => setSuccessMsg(e.target.value)}
            placeholder="Thanks. Your request has been received."
            style={{ minHeight: 60, resize: 'vertical' }}
          />
        </Field>
      </div>
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={!dirty || saving}>
          {saving && <span className="spinner" />}
          {saving ? 'Saving…' : 'Save content'}
        </button>
      </div>
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────
   Services card
───────────────────────────────────────────────────────── */
function ServicesCard({ form, patchForm }: {
  form: FormData
  patchForm: (p: Partial<FormData>) => Promise<FormData | undefined>
}) {
  const [services, setServices] = useState<string[]>(form.services ?? [])
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)

  const dirty = JSON.stringify(services) !== JSON.stringify(form.services ?? [])

  function add() {
    const val = input.trim()
    if (!val || services.includes(val)) { setInput(''); return }
    setServices(s => [...s, val])
    setInput('')
  }

  async function save() {
    setSaving(true)
    try {
      await patchForm({ services })
      toast('Services updated')
    } catch {
      toast('Failed to save services')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <div className="section-title" style={{ fontSize: 15, marginBottom: 6 }}>Services</div>
      <p className="helper" style={{ marginBottom: 16 }}>
        The options shown in the "Service Needed" dropdown. If empty, customers type their own answer.
      </p>

      {services.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {services.map(s => (
            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 12px', background: 'var(--primary-50, #EFF6FF)', color: 'var(--primary)', border: '1px solid var(--info-border, #BFDBFE)', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
              {s}
              <button onClick={() => setServices(prev => prev.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0, display: 'flex', opacity: 0.7 }}>
                <Icon name="x" size={13} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div style={{ padding: '11px 14px', background: 'var(--muted-bg)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
          No services added. Customers will type their own answer.
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="e.g. House Cleaning, HVAC Repair…"
          style={{ flex: 1 }}
        />
        <button className="btn btn-secondary btn-sm" onClick={add} disabled={!input.trim()}>
          <Icon name="plus" size={15} /> Add
        </button>
      </div>
      <div className="helper" style={{ marginTop: 6 }}>Press Enter or click Add. Click × on a pill to remove it.</div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={!dirty || saving}>
          {saving && <span className="spinner" />}
          {saving ? 'Saving…' : 'Save services'}
        </button>
      </div>
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────
   Live preview card — iframe of the actual public form
───────────────────────────────────────────────────────── */
function LivePreviewCard({ formUrl, previewKey, onRefresh }: {
  formUrl: string | null
  previewKey: number
  onRefresh: () => void
}) {
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {/* Preview header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Icon name="eye" size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Live Preview</span>
          <span className="helper" style={{ margin: 0 }}>— what your customers see</span>
        </div>
        <button className="btn btn-ghost btn-xs" onClick={onRefresh} title="Reload preview">
          <Icon name="refresh" size={13} /> Refresh
        </button>
      </div>

      {/* iframe */}
      {formUrl ? (
        <div style={{ height: 580, overflow: 'auto', background: 'var(--muted-bg)' }}>
          <iframe
            key={previewKey}
            src={formUrl}
            style={{ width: '100%', height: '900px', border: 'none', display: 'block', background: '#fff' }}
            title="Live form preview"
          />
        </div>
      ) : (
        <div style={{ height: 580, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      )}
    </Card>
  )
}

/* ─────────────────────────────────────────────────────────
   QR code card — real QR from URL
───────────────────────────────────────────────────────── */
function QRCard({ formUrl }: { formUrl: string }) {
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(formUrl)}`

  return (
    <Card>
      <div className="section-title" style={{ fontSize: 15, marginBottom: 4 }}>QR Code</div>
      <p className="helper" style={{ marginBottom: 16 }}>
        Print or display this so customers can scan and open your form instantly.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', background: 'var(--muted-bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt="QR code for your form"
          width={160}
          height={160}
          style={{ borderRadius: 4, display: 'block' }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <a
          href={qrSrc.replace('200x200', '400x400')}
          download="form-qr-code.png"
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-block btn-sm"
        >
          <Icon name="upload" size={15} /> Download PNG
        </a>
      </div>
    </Card>
  )
}
