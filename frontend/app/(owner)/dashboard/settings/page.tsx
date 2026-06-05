'use client'

import { useState } from 'react'
import { Icon, Card, Badge, Field, Input, Textarea, Toggle, Menu, CopyLinkBox, toast } from '@/components/ui'
import { FORM_URL } from '@/lib/data/mock'

interface BizState {
  name: string; tagline: string; email: string; color: string; followup: boolean
}

export default function SettingsPage() {
  const [biz, setBiz] = useState<BizState>({
    name: 'Acme Home Services',
    tagline: 'Trusted experts for a cleaner, safer home.',
    email: 'hello@acmehomeservices.com',
    color: '#2563EB',
    followup: true,
  })
  const [subject, setSubject] = useState('Thanks for reaching out to Acme Home Services!')
  const [msg, setMsg] = useState(
    "Hi {{first_name}},\n\nThanks for contacting Acme Home Services. We've received your request and one of our team members will be in touch within 24 hours.\n\nBest regards,\nThe Acme Home Services Team"
  )
  const [dirty, setDirty] = useState(false)
  const [active, setActive] = useState(true)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  function set(k: keyof BizState, v: string | boolean) {
    setBiz(s => ({ ...s, [k]: v }))
    setDirty(true)
  }

  function setFormActive(v: boolean) {
    setActive(v)
    toast(v ? 'Public form is now live' : 'Public form paused')
  }

  const insertFields = ['{{first_name}}', '{{business_name}}', '{{service_needed}}', '{{preferred_time}}'].map(v => ({
    label: v,
    onClick: () => { setMsg(m => m + ' ' + v); setDirty(true) },
  }))

  return (
    <div className="page-pad fade-up" style={{ paddingBottom: 110 }}>
      <div className="breadcrumb" style={{ marginBottom: 14 }}>
        <span className="crumb-link">Settings</span>
        <Icon name="chevRight" size={14} />
        <span className="crumb-cur">Form Management</span>
      </div>
      <h1 className="page-title">Form Management</h1>
      <p className="page-subtitle" style={{ marginBottom: 26 }}>Manage your business details, customer form, and automated responses.</p>

      <div className="fm-grid">
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Card>
            <div className="section-title" style={{ fontSize: 16 }}>Business Profile</div>
            <p className="helper" style={{ margin: '5px 0 22px' }}>This information appears on your form and auto-replies.</p>

            <div className="fm-profile">
              <div>
                <label className="label" style={{ marginBottom: 7, display: 'block' }}>Business Logo</label>
                <div style={{ width: '100%', aspectRatio: '1.4', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'var(--muted-bg-2)' }}>
                  <Icon name="home2" size={30} style={{ color: 'var(--navy)' }} />
                  <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--navy)' }}>ACME</div>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-muted)' }}>HOME SERVICES</div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="btn btn-secondary btn-sm">Change Logo</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}>Remove</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Business Name">
                  <Input value={biz.name} onChange={e => set('name', e.target.value)} />
                </Field>
                <Field label="Tagline (optional)">
                  <Input value={biz.tagline} onChange={e => set('tagline', e.target.value)} />
                </Field>
                <Field label="Contact Email" helper="Leads will be emailed to this address.">
                  <Input value={biz.email} onChange={e => set('email', e.target.value)} />
                </Field>
              </div>
            </div>

            <div className="fm-cards" style={{ marginTop: 22 }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Brand Color</div>
                <p className="helper" style={{ margin: '4px 0 14px' }}>Customize the accent color used on your form.</p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <label style={{ width: 38, height: 38, borderRadius: 8, background: biz.color, cursor: 'pointer', border: '1px solid var(--border)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                    <input type="color" value={biz.color} onChange={e => set('color', e.target.value)} style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                  </label>
                  <div style={{ flex: 1 }}>
                    <Input value={biz.color.toUpperCase()} onChange={e => set('color', e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Follow-up Automation</div>
                <p className="helper" style={{ margin: '4px 0 14px' }}>Automatically send follow-ups to new leads.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Toggle on={biz.followup} onChange={v => set('followup', v)} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{biz.followup ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="between" style={{ marginBottom: 4 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Auto-reply Email Template</div>
                  <p className="helper" style={{ margin: '4px 0 0' }}>This email is sent automatically when someone submits your form.</p>
                </div>
                <Menu trigger={<button className="btn btn-secondary btn-sm">Insert Field <Icon name="chevDown" size={14} /></button>} items={insertFields} />
              </div>
              <Field label="Email Subject" className="fm-field">
                <Input value={subject} onChange={e => { setSubject(e.target.value); setDirty(true) }} />
              </Field>
              <Field label="Email Message" className="fm-field">
                <Textarea value={msg} onChange={e => { setMsg(e.target.value); setDirty(true) }} style={{ minHeight: 180 }} />
              </Field>
              <p className="helper" style={{ marginTop: 8 }}>
                You can use <code style={{ background: 'var(--muted-bg)', padding: '2px 6px', borderRadius: 5, color: 'var(--primary)', fontSize: 12 }}>{'{{first_name}}'}</code> and{' '}
                <code style={{ background: 'var(--muted-bg)', padding: '2px 6px', borderRadius: 5, color: 'var(--primary)', fontSize: 12 }}>{'{{business_name}}'}</code> in your message.
              </p>
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Card>
            <div className="between">
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Public Form Status</div>
                <p className="helper" style={{ margin: '3px 0 0' }}>
                  {active ? 'Your form is live and accepting requests.' : 'Your form is paused. Visitors see an inactive notice.'}
                </p>
              </div>
              <Toggle on={active} onChange={setFormActive} />
            </div>
            <div style={{ marginTop: 10 }}>
              {active ? <Badge tone="green">Active</Badge> : <Badge tone="amber">Paused</Badge>}
            </div>
          </Card>

          <Card>
            <div className="section-title" style={{ fontSize: 16 }}>Public Form Link</div>
            <p className="helper" style={{ margin: '5px 0 16px' }}>Share this link to start capturing leads.</p>
            <CopyLinkBox url={FORM_URL} />
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-xs" style={{ paddingLeft: 0 }}>Preview Form <Icon name="externalLink" size={14} /></button>
              <button className="btn btn-ghost btn-xs" onClick={() => toast('Test email sent to ' + biz.email)}>
                <Icon name="mail" size={14} /> Send test email
              </button>
            </div>
          </Card>

          <Card>
            <div className="between" style={{ marginBottom: 16 }}>
              <div>
                <div className="section-title" style={{ fontSize: 16 }}>Live Form Preview</div>
                <p className="helper" style={{ margin: '4px 0 0' }}>How your form appears to customers.</p>
              </div>
              <div style={{ display: 'flex', gap: 4, background: 'var(--muted-bg)', padding: 3, borderRadius: 9 }}>
                {(['desktop', 'mobile'] as const).map(d => (
                  <button key={d} onClick={() => setDevice(d)} title={d} style={{ width: 34, height: 30, borderRadius: 7, border: 'none', background: device === d ? '#fff' : 'transparent', color: device === d ? 'var(--primary)' : 'var(--text-muted)', boxShadow: device === d ? 'var(--shadow-xs)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={d === 'desktop' ? 'monitor' : 'smartphone'} size={16} />
                  </button>
                ))}
              </div>
            </div>
            <div style={{ maxWidth: device === 'mobile' ? 280 : '100%', margin: device === 'mobile' ? '0 auto' : '0', transition: 'max-width .25s ease' }}>
              <FormPreview color={biz.color} />
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="save-bar">
        <div className="helper">
          {dirty
            ? <span style={{ color: 'var(--amber)', fontWeight: 600 }}>● Unsaved changes</span>
            : 'All changes saved'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => { setDirty(false); toast('Changes discarded') }}>Discard Changes</button>
          <button className="btn btn-primary" onClick={() => { setDirty(false); toast('Changes saved') }}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}

function FormPreview({ color }: { color: string }) {
  const fields = ['Full Name *', 'Email Address *', 'Phone Number *', 'Service Needed *']
  const placeholders = ['Enter your full name', 'Enter your email address', '(555) 123-4567', 'Select a service']
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 20, background: '#fff' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, marginBottom: 16 }}>
        <Icon name="home2" size={26} style={{ color }} />
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--navy)' }}>ACME</div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', color: 'var(--navy)' }}>Request a Free Estimate</div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', margin: '6px 0 16px', lineHeight: 1.5 }}>
        Fill out the form below and we&apos;ll get back to you within 24 hours.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {fields.map((l, i) => (
          <div key={i}>
            <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4 }}>{l}</div>
            <div style={{ height: 38, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted-bg-2)', display: 'flex', alignItems: 'center', padding: '0 11px', fontSize: 12, color: 'var(--text-disabled)' }}>
              {placeholders[i]}
              {i === 3 && <Icon name="chevDown" size={14} style={{ marginLeft: 'auto' }} />}
            </div>
          </div>
        ))}
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 4 }}>Additional Details</div>
          <div style={{ height: 52, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted-bg-2)', padding: '8px 11px', fontSize: 12, color: 'var(--text-disabled)' }}>
            Tell us more about your project...
          </div>
        </div>
        <button className="btn" style={{ background: color, color: '#fff', marginTop: 4, height: 40 }}>Submit Request</button>
      </div>
    </div>
  )
}
