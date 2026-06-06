'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, Card, Badge, Field, Input, Textarea, Select, Toggle, CopyLinkBox, toast } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'
const INDUSTRIES = ['Home Services', 'Landscaping', 'Real Estate', 'Cleaning Services', 'Health & Wellness', 'Roofing', 'Fitness', 'Plumbing', 'Retail', 'Pet Services']

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface FormState {
  name: string; industry: string; phone: string; email: string; address: string
  slug: string; slugEdited: boolean
  ownerName: string; ownerEmail: string; ownerPhone: string; role: string
  color: string; welcome: string
  autoReply: boolean; assignTo: string; followup: boolean; delay: string
}

interface FormErrors {
  name?: string; ownerName?: string; ownerEmail?: string
}

export default function AdminCreateBusinessPage() {
  const router = useRouter()
  const token = useApiToken()
  const [f, setF] = useState<FormState>({
    name: '', industry: 'Home Services', phone: '', email: '', address: '',
    slug: '', slugEdited: false,
    ownerName: '', ownerEmail: '', ownerPhone: '', role: 'Business Owner',
    color: '#2563EB',
    welcome: "Thanks for reaching out! We're here to help. Fill out the form below and we'll get back to you as soon as possible.",
    autoReply: true, assignTo: 'Primary Owner', followup: true, delay: '24 hours',
  })
  const [errs, setErrs] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function set(k: keyof FormState, v: string | boolean) {
    setF(s => {
      const n = { ...s, [k]: v }
      if (k === 'name' && !s.slugEdited) n.slug = slugify(v as string)
      if (k === 'slug') n.slugEdited = true
      return n
    })
    setErrs(e => ({ ...e, [k]: undefined }))
  }

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!f.name.trim()) e.name = 'Business name is required.'
    if (!f.ownerName.trim()) e.ownerName = 'Owner name is required.'
    if (!f.ownerEmail.trim()) e.ownerEmail = 'Owner email is required.'
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(f.ownerEmail)) e.ownerEmail = 'Enter a valid email.'
    return e
  }

  const formUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/forms/${f.slug || 'your-business'}`

  const checklist = [
    { t: 'Business Information', d: 'Add your business details', done: !!f.name && !!f.industry },
    { t: 'Owner Information', d: 'Add owner contact details', done: !!f.ownerName && !!f.ownerEmail },
    { t: 'Branding', d: 'Customize your brand', done: !!f.welcome },
    { t: 'Automation Settings', d: 'Configure lead automation', done: true },
    { t: 'Send Invite', d: 'Invite your team member', done: false, active: true },
  ]

  async function handleCreate() {
    const errors = validate()
    if (Object.keys(errors).length) { setErrs(errors); return }
    if (!token) { toast('Not authenticated'); return }
    setSubmitting(true)
    try {
      await api.post('/admin/businesses', {
        name: f.name.trim(),
        industry: f.industry || null,
        phone: f.phone || null,
        contact_email: f.email || null,
        address: f.address || null,
        brand_color: f.color,
        owner: {
          full_name: f.ownerName.trim(),
          email: f.ownerEmail.trim(),
          phone: f.ownerPhone || null,
        },
      }, token)
      toast('Business created & invite sent!')
      setTimeout(() => router.push('/admin/businesses'), 800)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create business'
      toast(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-pad fade-up" style={{ paddingBottom: 40 }}>
      <div className="breadcrumb" style={{ marginBottom: 14 }}>
        <button className="crumb-link" onClick={() => router.push('/admin/businesses')}>Businesses</button>
        <Icon name="chevRight" size={14} />
        <span className="crumb-cur">Create Business</span>
      </div>
      <h1 className="page-title">Create Your Business</h1>
      <p className="page-subtitle" style={{ marginBottom: 26 }}>Let&apos;s set up your business and get you ready to start capturing leads.</p>

      <div className="cb-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Section 1 */}
          <Section n={1} title="Business Information">
            <div className="cb-2col">
              <Field label="Business Name" required error={errs.name}>
                <Input value={f.name} error={!!errs.name} onChange={e => set('name', e.target.value)} />
              </Field>
              <Field label="Industry" required>
                <Select options={INDUSTRIES} value={f.industry} onChange={v => set('industry', v)} />
              </Field>
              <Field label="Business Phone">
                <Input value={f.phone} onChange={e => set('phone', e.target.value)} />
              </Field>
              <Field label="Business Email">
                <Input type="email" value={f.email} onChange={e => set('email', e.target.value)} />
              </Field>
            </div>
            <Field label="Business Address" className="cb-field">
              <Input value={f.address} onChange={e => set('address', e.target.value)} />
            </Field>
            <Field label="Business Slug" helper="Auto-generated from your business name — editable." className="cb-field">
              <Input value={f.slug} onChange={e => set('slug', slugify(e.target.value))} />
            </Field>
          </Section>

          {/* Section 2 */}
          <Section n={2} title="Owner Information">
            <div className="cb-2col">
              <Field label="Owner Name" required error={errs.ownerName}>
                <Input value={f.ownerName} error={!!errs.ownerName} onChange={e => set('ownerName', e.target.value)} />
              </Field>
              <Field label="Owner Email" required error={errs.ownerEmail}>
                <Input type="email" value={f.ownerEmail} error={!!errs.ownerEmail} onChange={e => set('ownerEmail', e.target.value)} />
              </Field>
              <Field label="Owner Phone">
                <Input value={f.ownerPhone} onChange={e => set('ownerPhone', e.target.value)} />
              </Field>
              <Field label="Role">
                <Select options={['Business Owner', 'Manager', 'Team Member']} value={f.role} onChange={v => set('role', v)} />
              </Field>
            </div>
          </Section>

          {/* Section 3 */}
          <Section n={3} title="Branding">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' }}>
              <Field label="Brand Color" helper="This color will be used in your public form and emails.">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <label style={{ width: 38, height: 38, borderRadius: 8, background: f.color, cursor: 'pointer', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <input type="color" value={f.color} onChange={e => set('color', e.target.value)} style={{ opacity: 0, width: '100%', height: '100%' }} />
                  </label>
                  <Input value={f.color.toUpperCase()} onChange={e => set('color', e.target.value)} />
                </div>
              </Field>
              <Field label="Business Logo">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--muted-bg-2)', flexShrink: 0 }}>
                    <Icon name="home2" size={24} style={{ color: f.color }} />
                  </div>
                  <div>
                    <button className="btn btn-secondary btn-sm"><Icon name="upload" size={15} /> Upload Logo</button>
                    <div className="helper" style={{ marginTop: 6 }}>PNG, JPG or SVG. Max size 2MB.</div>
                  </div>
                </div>
              </Field>
            </div>
            <Field label="Welcome Message" className="cb-field">
              <Textarea value={f.welcome} maxLength={500} onChange={e => set('welcome', e.target.value)} style={{ minHeight: 90 }} />
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-disabled)', marginTop: 2 }}>{f.welcome.length} / 500 characters</div>
            </Field>
          </Section>

          {/* Section 4 */}
          <Section n={4} title="Automation Settings">
            <div className="cb-2col" style={{ alignItems: 'start' }}>
              <div>
                <div className="between">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Auto-Reply to New Leads</div>
                    <p className="helper" style={{ margin: '4px 0 0', maxWidth: 240 }}>Automatically send a welcome email when a new lead is captured.</p>
                  </div>
                  <Toggle on={f.autoReply} onChange={v => set('autoReply', v)} />
                </div>
              </div>
              <Field label="Assign New Leads To" helper="Choose who receives new leads by default.">
                <Select options={['Primary Owner', 'Round Robin', 'Unassigned']} value={f.assignTo} onChange={v => set('assignTo', v)} />
              </Field>
            </div>
            <div className="cb-2col" style={{ marginTop: 18, alignItems: 'start' }}>
              <div>
                <div className="between">
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Follow-up Enabled</div>
                    <p className="helper" style={{ margin: '4px 0 0', maxWidth: 240 }}>Schedule automatic follow-ups for new leads.</p>
                  </div>
                  <Toggle on={f.followup} onChange={v => set('followup', v)} />
                </div>
              </div>
              <Field label="Default Follow-up Delay">
                <Select options={['1 hour', '4 hours', '24 hours', '48 hours', '3 days']} value={f.delay} onChange={v => set('delay', v)} />
              </Field>
            </div>
          </Section>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => toast('Draft saved')}>Save Draft</button>
            <button className="btn btn-ghost" onClick={() => router.push('/admin/businesses')}>Cancel</button>
            <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={handleCreate} disabled={submitting}>
              {submitting && <span className="spinner" />}
              <Icon name="send" size={16} />
              {submitting ? 'Creating…' : 'Create Business & Send Invite'}
            </button>
          </div>
        </div>

        {/* Right panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <div className="section-title" style={{ fontSize: 15 }}>Public Form Preview</div>
            <p className="helper" style={{ margin: '5px 0 14px' }}>See how your form link will look to your customers.</p>
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, background: 'var(--muted-bg-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Icon name="home2" size={18} style={{ color: f.color }} />
                <div className="skeleton" style={{ height: 9, width: 70 }} />
              </div>
              <div className="skeleton" style={{ height: 12, width: '70%', marginBottom: 12 }} />
              {[80, 100, 100, 60].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: 26, width: w + '%', marginBottom: 8, borderRadius: 6 }} />
              ))}
              <div style={{ height: 30, borderRadius: 6, background: f.color, marginTop: 6 }} />
            </div>
          </Card>

          <Card>
            <div className="section-title" style={{ fontSize: 15 }}>Your Public Form Link</div>
            <p className="helper" style={{ margin: '5px 0 12px' }}>Share this link to start capturing leads.</p>
            <CopyLinkBox url={formUrl} />
          </Card>

          <Card>
            <div className="between" style={{ marginBottom: 6 }}>
              <span className="section-title" style={{ fontSize: 15 }}>Owner Invite Status</span>
              <Badge tone="green" dot={false}>Ready to Send</Badge>
            </div>
            <p className="helper" style={{ margin: '4px 0 4px' }}>An invite will be sent to</p>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 }}>
              {f.ownerEmail || 'owner@example.com'}
            </div>
            <button className="btn btn-secondary btn-block" style={{ color: 'var(--primary)', borderColor: 'var(--primary-200)' }} onClick={() => toast('Invite sent')}>
              <Icon name="send" size={16} /> Send Invite
            </button>
          </Card>

          <Card>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 14 }}>Onboarding Checklist</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {checklist.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  {c.done ? (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <Icon name="check" size={13} style={{ color: '#fff' }} />
                    </div>
                  ) : (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid ' + (c.active ? 'var(--primary)' : 'var(--border-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      {c.active && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: c.active ? 'var(--primary)' : 'var(--text)' }}>{c.t}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 1 }}>{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="helper" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--divider)' }}>
              Complete all steps to finish onboarding.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          {n}
        </div>
        <span className="section-title" style={{ fontSize: 16 }}>{title}</span>
      </div>
      {children}
    </Card>
  )
}
