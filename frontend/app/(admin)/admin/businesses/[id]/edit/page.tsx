'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Icon, Card, Field, Input, Select, Badge, BrandTile, toast } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'
import { INDUSTRIES } from '@/lib/data/mock'

interface BusinessRead {
  id: string
  name: string
  slug: string
  industry: string | null
  phone: string | null
  contact_email: string | null
  address: string | null
  brand_color: string
  status: string
  logo_url: string | null
  created_at: string
}

const STATUS_OPTIONS = ['active', 'pending', 'paused', 'archived']
const STATUS_DISPLAY: Record<string, string> = {
  active: 'Active', pending: 'Pending', paused: 'Paused', archived: 'Archived',
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
const MAX_MB = 5

export default function EditBusinessPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const token = useApiToken()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [business, setBusiness] = useState<BusinessRead | null>(null)

  // Editable fields
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [color, setColor] = useState('#2563EB')
  const [status, setStatus] = useState('active')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  // Load business data
  useEffect(() => {
    if (!token || !id) return
    api.get<{ ok: boolean; data: BusinessRead }>(`/admin/businesses/${id}`, token)
      .then(r => {
        const b = r.data
        setBusiness(b)
        setName(b.name)
        setIndustry(b.industry ?? 'Home Services')
        setPhone(b.phone ?? '')
        setEmail(b.contact_email ?? '')
        setAddress(b.address ?? '')
        setColor(b.brand_color)
        setStatus(b.status)
        setLogoUrl(b.logo_url)
      })
      .catch(() => toast('Failed to load business'))
      .finally(() => setLoading(false))
  }, [token, id])

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !token) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast('Invalid file type. Use PNG, JPG, WebP, or SVG.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast(`File too large. Maximum size is ${MAX_MB} MB.`)
      return
    }

    // Show instant local preview
    const reader = new FileReader()
    reader.onload = e => setLogoPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Upload to backend
    setLogoUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/api\/v1$/, '')
      const res = await fetch(
        `${base}/api/v1/admin/businesses/${id}/logo`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast(err.detail ?? 'Logo upload failed')
        setLogoPreview(null)
        return
      }
      const data = await res.json()
      setLogoUrl(data.data?.logo_url ?? null)
      toast('Logo updated')
    } catch {
      toast('Logo upload failed')
      setLogoPreview(null)
    } finally {
      setLogoUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSave() {
    if (!token || !id) return
    if (!name.trim()) { toast('Business name is required'); return }
    setSaving(true)
    try {
      const res = await api.patch<{ ok: boolean; data: BusinessRead }>(
        `/admin/businesses/${id}`,
        {
          name: name.trim(),
          industry: industry || null,
          phone: phone || null,
          contact_email: email || null,
          address: address || null,
          brand_color: color,
          status,
        },
        token,
      )
      setBusiness(res.data)
      toast('Business updated')
      setTimeout(() => router.push('/admin/businesses'), 600)
    } catch {
      toast('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const displayLogo = logoPreview ?? logoUrl

  if (loading) {
    return (
      <div className="page-pad fade-up" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 60 }}>
        <div className="spinner" />
        <span className="muted">Loading business…</span>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="page-pad fade-up">
        <p className="muted">Business not found.</p>
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => router.push('/admin/businesses')}>
          Back to Businesses
        </button>
      </div>
    )
  }

  return (
    <div className="page-pad fade-up" style={{ paddingBottom: 40 }}>
      <div className="breadcrumb" style={{ marginBottom: 14 }}>
        <button className="crumb-link" onClick={() => router.push('/admin/businesses')}>Businesses</button>
        <Icon name="chevRight" size={14} />
        <span className="crumb-cur">Edit — {business.name}</span>
      </div>
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 26, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Edit Business</h1>
          <p className="page-subtitle">Update business details. Changes are saved when you click Save.</p>
        </div>
        <Badge>{STATUS_DISPLAY[business.status] ?? business.status}</Badge>
      </div>

      <div className="cb-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Business Info */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>1</div>
              <span className="section-title" style={{ fontSize: 16 }}>Business Information</span>
            </div>
            <div className="cb-2col">
              <Field label="Business Name" required>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </Field>
              <Field label="Industry">
                <Select options={INDUSTRIES} value={industry} onChange={setIndustry} />
              </Field>
              <Field label="Business Phone">
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 (555) 000-0000" />
              </Field>
              <Field label="Contact Email">
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </Field>
            </div>
            <Field label="Address" className="cb-field">
              <Input value={address} onChange={e => setAddress(e.target.value)} />
            </Field>
            <Field label="Form Slug" helper="Changing the slug will break the existing form link." className="cb-field">
              <Input value={business.slug} disabled style={{ opacity: 0.6 }} />
            </Field>
          </Card>

          {/* Branding */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>2</div>
              <span className="section-title" style={{ fontSize: 16 }}>Branding</span>
            </div>

            {/* Logo upload */}
            <div style={{ marginBottom: 22 }}>
              <div className="label" style={{ marginBottom: 8 }}>Business Logo</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ flexShrink: 0 }}>
                  {displayLogo ? (
                    <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--muted-bg-2)' }}>
                      <img src={displayLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <BrandTile color={color} name={name} size={72} />
                  )}
                </div>
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    style={{ display: 'none' }}
                    onChange={handleLogoChange}
                  />
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={logoUploading}
                  >
                    {logoUploading ? <><span className="spinner" /> Uploading…</> : <><Icon name="upload" size={15} /> {displayLogo ? 'Change Logo' : 'Upload Logo'}</>}
                  </button>
                  <div className="helper" style={{ marginTop: 6 }}>PNG, JPG, WebP or SVG · Max {MAX_MB} MB</div>
                  {displayLogo && (
                    <button
                      className="btn btn-ghost btn-xs"
                      style={{ color: 'var(--red)', paddingLeft: 0, marginTop: 4 }}
                      onClick={() => { setLogoUrl(null); setLogoPreview(null) }}
                    >
                      Remove logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Brand color */}
            <Field label="Brand Color" helper="Used on the public form and email templates.">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <label style={{ width: 38, height: 38, borderRadius: 8, background: color, cursor: 'pointer', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ opacity: 0, width: '100%', height: '100%' }} />
                </label>
                <Input value={color.toUpperCase()} onChange={e => setColor(e.target.value)} />
              </div>
            </Field>
          </Card>

          {/* Status */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>3</div>
              <span className="section-title" style={{ fontSize: 16 }}>Business Status</span>
            </div>
            <Field label="Status" helper="Pausing a business hides its form from the public.">
              <Select
                options={STATUS_OPTIONS.map(s => STATUS_DISPLAY[s])}
                value={STATUS_DISPLAY[status] ?? status}
                onChange={v => setStatus(Object.entries(STATUS_DISPLAY).find(([, d]) => d === v)?.[0] ?? v)}
              />
            </Field>
          </Card>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={() => router.push('/admin/businesses')}>Cancel</button>
            <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={handleSave} disabled={saving || logoUploading}>
              {saving && <span className="spinner" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 14 }}>Live Preview</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--muted-bg-2)' }}>
              <BrandTile color={color} name={name} size={52} logoUrl={displayLogo ?? undefined} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }} className="trunc">{name || 'Business Name'}</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{industry || 'Industry'}</div>
                <div style={{ marginTop: 6 }}>
                  <Badge>{STATUS_DISPLAY[status]}</Badge>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="helper" style={{ marginBottom: 6 }}>Form Link</div>
              <div style={{ fontSize: 13, color: 'var(--primary)', wordBreak: 'break-all', fontFamily: 'monospace', background: 'var(--muted-bg)', padding: '8px 10px', borderRadius: 8 }}>
                /forms/{business.slug}
              </div>
            </div>
          </Card>

          <Card>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 12 }}>Business Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['ID', business.id.slice(0, 8) + '…'],
                ['Created', new Date(business.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })],
                ['Slug', business.slug],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                  <span className="muted">{k}</span>
                  <span style={{ fontWeight: 500, fontFamily: k === 'ID' || k === 'Slug' ? 'monospace' : 'inherit' }} className="trunc">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
