'use client'

import { useState, useEffect } from 'react'
import { Icon, Card, Field, Input, Toggle, CopyLinkBox, toast } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

interface BusinessData {
  name: string
  contact_email: string | null
  brand_color: string
  logo_url: string | null
  smart_auto_reply: boolean
  owner_approval_required: boolean
}

function ToggleRow({
  label,
  helper,
  on,
  onChange,
}: {
  label: string
  helper: string
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '16px 0', borderTop: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{label}</div>
        <div className="helper" style={{ margin: '3px 0 0', lineHeight: 1.5 }}>{helper}</div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  )
}

export default function SettingsPage() {
  const token = useApiToken()
  const [loading, setLoading] = useState(true)
  const [formUrl, setFormUrl] = useState<string | null>(null)
  const [formSlug, setFormSlug] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [color, setColor] = useState('#2563EB')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  const [smartAutoReply, setSmartAutoReply] = useState(false)
  const [ownerApproval, setOwnerApproval] = useState(true)
  const [aiSaving, setAiSaving] = useState(false)
  const [safetyOpen, setSafetyOpen] = useState(false)

  useEffect(() => {
    if (!token) return
    Promise.all([
      api.get<{ ok: boolean; data: BusinessData }>('/owner/business', token),
      api.get<{ ok: boolean; data: { slug: string } }>('/owner/form', token).catch(() => ({ data: { slug: '' } })),
    ]).then(([bizRes, formRes]) => {
      const d = bizRes.data
      setName(d.name ?? '')
      setEmail(d.contact_email ?? '')
      setColor(d.brand_color ?? '#2563EB')
      setLogoUrl(d.logo_url ?? null)
      setSmartAutoReply(d.smart_auto_reply ?? false)
      setOwnerApproval(d.owner_approval_required ?? true)
      const s = formRes.data?.slug
      if (s) { setFormSlug(s); setFormUrl(`${window.location.origin}/forms/${s}`) }
    }).catch(() => toast('Failed to load settings')).finally(() => setLoading(false))
  }, [token])

  async function saveProfile() {
    if (!token) return
    setSaving(true)
    try {
      await api.patch('/owner/business', {
        name: name.trim() || undefined,
        contact_email: email.trim() || undefined,
        brand_color: color || undefined,
      }, token)
      setDirty(false)
      toast('Profile saved')
    } catch {
      toast('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function patchAi(patch: object) {
    if (!token) return
    setAiSaving(true)
    try {
      await api.patch('/owner/business', patch, token)
      toast('Setting saved')
    } catch {
      toast('Failed to save')
    } finally {
      setAiSaving(false)
    }
  }

  const autoActive = smartAutoReply && !ownerApproval
  const modeLabel = autoActive ? 'Auto Mode' : 'Safe Mode'
  const modeColor = autoActive ? '#D97706' : '#059669'
  const modeBg   = autoActive ? '#FFFBEB' : '#F0FDF4'
  const modeBorder = autoActive ? '#FDE68A' : '#BBF7D0'

  if (loading) {
    return (
      <div className="page-pad fade-up" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 60 }}>
        <div className="spinner" />
        <span className="muted">Loading settings…</span>
      </div>
    )
  }

  return (
    <div className="page-pad fade-up" style={{ paddingBottom: 40 }}>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle" style={{ marginBottom: 26 }}>Manage your business profile and AI automation preferences.</p>

      <div className="fm-grid">

        {/* ── LEFT ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Business Profile */}
          <Card>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 18 }}>Business Profile</div>

            {logoUrl && (
              <div style={{ marginBottom: 18 }}>
                <img src={logoUrl} alt={name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border)' }} />
                <p className="helper" style={{ marginTop: 6 }}>Logo is managed by your admin.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Business Name">
                <Input value={name} onChange={e => { setName(e.target.value); setDirty(true) }} />
              </Field>
              <Field label="Contact Email" helper="Lead notifications are sent here.">
                <Input type="email" value={email} onChange={e => { setEmail(e.target.value); setDirty(true) }} />
              </Field>
              <Field label="Brand Color" helper="Applied to your public form and customer emails.">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <label style={{ width: 38, height: 38, borderRadius: 8, background: color, cursor: 'pointer', border: '1px solid var(--border)', flexShrink: 0, overflow: 'hidden' }}>
                    <input type="color" value={color} onChange={e => { setColor(e.target.value); setDirty(true) }} style={{ opacity: 0, width: '100%', height: '100%' }} />
                  </label>
                  <Input value={color.toUpperCase()} onChange={e => { setColor(e.target.value); setDirty(true) }} />
                </div>
              </Field>
            </div>

            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={!dirty || saving}>
                {saving && <span className="spinner" />}
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </Card>

          {/* AI Automation */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="section-title" style={{ fontSize: 15 }}>AI Automation</div>
              {aiSaving && <span className="spinner" style={{ width: 14, height: 14 }} />}
            </div>
            <p className="helper" style={{ marginBottom: 4 }}>
              Control how AI handles new leads. Changes take effect immediately.
            </p>

            {/* Smart Auto-Reply — top-level toggle */}
            <ToggleRow
              label="Smart Auto-Reply"
              helper={smartAutoReply
                ? 'AI will send a personalized reply to the customer when they submit a form.'
                : 'Off — customers receive a safe generic confirmation. AI draft saved for your review.'}
              on={smartAutoReply}
              onChange={v => {
                setSmartAutoReply(v)
                // turning off auto-reply → reset approval to safe default
                if (!v) setOwnerApproval(true)
                patchAi({ smart_auto_reply: v, owner_approval_required: v ? ownerApproval : true })
              }}
            />

            {/* Require Approval — sub-option, only visible when auto-reply is ON */}
            {smartAutoReply && (
              <div style={{ marginLeft: 20, paddingLeft: 16, borderLeft: '2px solid var(--border)' }}>
                <ToggleRow
                  label="Require my approval before sending"
                  helper={ownerApproval
                    ? 'AI drafts are saved in Messages. You review and click Send yourself.'
                    : 'AI sends automatically when the safety check passes. No action needed from you.'}
                  on={ownerApproval}
                  onChange={v => { setOwnerApproval(v); patchAi({ owner_approval_required: v }) }}
                />
              </div>
            )}

            {/* Safety rules accordion */}
            {smartAutoReply && !ownerApproval && (
              <div style={{ marginTop: 14 }}>
                <button
                  onClick={() => setSafetyOpen(o => !o)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}
                >
                  <Icon name={safetyOpen ? 'chevDown' : 'chevRight'} size={13} />
                  When will AI hold back and not send?
                </button>
                {safetyOpen && (
                  <div style={{ marginTop: 10, padding: '12px 14px', background: 'var(--muted-bg)', borderRadius: 8 }}>
                    {[
                      'Business is paused or archived',
                      'AI rated the reply as medium or high risk',
                      'AI confidence is below 75%',
                      'Reply mentions prices, bookings, refunds, or legal / medical advice',
                    ].map((r, i, arr) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: i < arr.length - 1 ? 7 : 0, lineHeight: 1.5 }}>
                        <Icon name="shieldCheck" size={13} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
                        {r}
                      </div>
                    ))}
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                      In any of these cases the AI saves a draft in Messages for you to send manually.
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* ── RIGHT ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Form Link */}
          <Card>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 4 }}>Public Form Link</div>
            <p className="helper" style={{ marginBottom: 14 }}>Share this with customers to capture leads.</p>
            {formUrl ? (
              <CopyLinkBox url={formUrl} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40 }}>
                <div className="spinner" />
                <span className="muted" style={{ fontSize: 13 }}>Loading…</span>
              </div>
            )}
            <button
              className="btn btn-ghost btn-xs"
              style={{ paddingLeft: 0, marginTop: 10 }}
              onClick={() => formSlug && window.open(`/forms/${formSlug}`, '_blank')}
              disabled={!formSlug}
            >
              Preview form <Icon name="externalLink" size={13} />
            </button>
          </Card>

          {/* Current Mode */}
          <Card>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 14 }}>Current Mode</div>
            <div style={{ padding: '16px 18px', background: modeBg, border: `1px solid ${modeBorder}`, borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: modeColor, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 14, color: modeColor }}>{modeLabel}</span>
              </div>
              {autoActive ? (
                <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.7 }}>
                  AI will send a personalized reply to new customers automatically when it passes the safety check.
                  Drafts are saved in Messages for your reference.
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#065F46', lineHeight: 1.7 }}>
                  New customers receive a safe acknowledgement email.
                  AI drafts are saved in Messages for you to review and send manually.
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Safe acknowledgement', always: true, on: true },
                { label: 'Owner notification', always: true, on: true },
                { label: 'AI draft saved', always: true, on: true },
                { label: 'AI auto-reply to customer', always: false, on: autoActive },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: row.on ? 'var(--green-bg)' : 'var(--muted-bg)',
                    border: `1px solid ${row.on ? 'var(--green-border, #BBF7D0)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name={row.on ? 'check' : 'minus'} size={10} style={{ color: row.on ? 'var(--green)' : 'var(--text-disabled)' }} />
                  </div>
                  <span style={{ fontSize: 13, color: row.on ? 'var(--text)' : 'var(--text-muted)', flex: 1 }}>{row.label}</span>
                  {row.always && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--muted-bg)', padding: '1px 7px', borderRadius: 10 }}>always</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  )
}
