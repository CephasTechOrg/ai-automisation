'use client'

import { useState } from 'react'
import { Icon, Field, Input, Textarea, Select, Logo } from '@/components/ui'
import { SERVICES } from '@/lib/data/mock'

interface FormState {
  name: string; email: string; phone: string; service: string
  date: string; time: string; msg: string
}
interface FormErrors { name?: string; email?: string; phone?: string; service?: string }

export default function PublicFormPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', service: '', date: '', time: '', msg: '' })
  const [errs, setErrs] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function set(k: keyof FormState, v: string) {
    setForm(s => ({ ...s, [k]: v }))
    setErrs(e => ({ ...e, [k]: undefined }))
  }

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!form.name) e.name = 'Please enter your name.'
    if (!form.email) e.email = 'Email is required.'
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.phone) e.phone = 'Phone is required.'
    if (!form.service) e.service = 'Please select a service.'
    return e
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length) { setErrs(errors); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setSubmitted(true)
  }

  const highlights = [
    { icon: 'user', t: 'Professional & Reliable', d: 'Background-checked, trained, and dedicated to excellence.' },
    { icon: 'shieldCheck', t: 'Satisfaction Guarantee', d: "Not happy? We'll make it right within 24 hours." },
    { icon: 'leaf', t: 'Eco-Friendly Products', d: 'Safe for your family, pets, and the environment.' },
    { icon: 'calendar', t: 'Flexible Scheduling', d: 'Convenient appointment times that work for you.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ height: 68, borderBottom: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 600 }}>
          <Icon name="shieldCheck" size={17} style={{ color: 'var(--green)' }} />
          Secure &amp; Confidential
        </div>
      </header>

      <div className="pf-grid">
        <div>
          {submitted ? (
            <SuccessState name={form.name} onReset={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', service: '', date: '', time: '', msg: '' }) }} />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', border: '2.5px solid var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Icon name="home2" size={22} style={{ color: 'var(--navy)' }} />
                  <Icon name="sparkles" size={12} style={{ color: 'var(--primary)', position: 'absolute', top: 6, right: 5 }} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--navy)', lineHeight: 1 }}>BRIGHT</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--primary)', marginTop: 2 }}>CLEANING SERVICES</div>
                </div>
              </div>

              <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', margin: '26px 0 0', color: 'var(--navy)' }}>Request a Quote</h1>
              <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.55, margin: '14px 0 0', maxWidth: 480 }}>
                Tell us about your cleaning needs and we&apos;ll create a customized quote that&apos;s right for you.
              </p>

              <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', margin: '20px 0 36px' }}>
                {[{ icon: 'shieldCheck', t: 'Trusted by 500+ customers' }, { icon: 'star', t: '5.0 average rating' }, { icon: 'shield', t: 'Insured & Bonded' }].map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <Icon name={t.icon} size={16} style={{ color: 'var(--primary)' }} />
                    {t.t}
                  </div>
                ))}
              </div>

              <form onSubmit={submit} noValidate>
                <div className="pf-fields">
                  <Field label="Full Name" required error={errs.name}>
                    <Input icon="user" placeholder="Enter your full name" value={form.name} error={!!errs.name} onChange={e => set('name', e.target.value)} />
                  </Field>
                  <Field label="Email Address" required error={errs.email}>
                    <Input icon="mail" type="email" placeholder="Enter your email" value={form.email} error={!!errs.email} onChange={e => set('email', e.target.value)} />
                  </Field>
                  <Field label="Phone Number" required error={errs.phone}>
                    <Input icon="phone" placeholder="(555) 123-4567" value={form.phone} error={!!errs.phone} onChange={e => set('phone', e.target.value)} />
                  </Field>
                  <Field label="Service Needed" required error={errs.service}>
                    <Select options={SERVICES} value={form.service} placeholder="Select a service" onChange={v => set('service', v)} />
                  </Field>
                  <Field label="Preferred Date">
                    <Input icon="calendar" placeholder="Select a date" value={form.date} onChange={e => set('date', e.target.value)} />
                  </Field>
                  <Field label="Preferred Time">
                    <Select
                      options={['Morning (8am–12pm)', 'Afternoon (12–4pm)', 'Evening (4–7pm)', 'Flexible']}
                      value={form.time}
                      placeholder="Select a time"
                      onChange={v => set('time', v)}
                    />
                  </Field>
                </div>

                <Field label="Message (Optional)" className="pf-msg">
                  <Textarea placeholder="Tell us more about your space or any special requests..." maxLength={500} value={form.msg} onChange={e => set('msg', e.target.value)} style={{ minHeight: 120 }} />
                  <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-disabled)', marginTop: 2 }}>{form.msg.length}/500</div>
                </Field>

                <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 24, height: 54, fontSize: 16 }} disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? 'Submitting...' : 'Submit Request'}
                  {!loading && <Icon name="arrowRight" size={18} />}
                </button>

                <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <Icon name="lock" size={14} />
                  Your information is secure and will never be shared.
                </div>
              </form>
            </>
          )}
        </div>

        <aside className="pf-rail">
          <div className="card" style={{ padding: 26, position: 'sticky', top: 24 }}>
            <h3 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: 'var(--navy)', letterSpacing: '-0.01em' }}>
              Why Choose Bright Cleaning Services?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 22 }}>
              {highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={h.icon} size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--navy)' }}>{h.t}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3, lineHeight: 1.5 }}>{h.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="divider-h" style={{ margin: '22px 0' }} />
            <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="clock" size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--navy)' }}>Fast Response</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 3, lineHeight: 1.5 }}>
                  We typically respond within <b style={{ color: 'var(--text-secondary)' }}>1 hour during business hours.</b>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: 'var(--primary-50)', border: '1px solid var(--info-border)', display: 'flex', gap: 12 }}>
              <Icon name="lock" size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--primary)' }}>Your Privacy Matters</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12.5, marginTop: 3, lineHeight: 1.5 }}>
                  We use your information only to respond to your quote request and will never spam you or share your data.
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SuccessState({ name, onReset }: { name: string; onReset: () => void }) {
  const steps = [
    { icon: 'mail', t: 'Check your inbox', d: "We've sent a confirmation email with your request details." },
    { icon: 'phone', t: "We'll be in touch", d: 'Our team reviews your request and reaches out with a quote.' },
    { icon: 'calendar', t: 'Schedule your service', d: "Pick a time that works and we'll handle the rest." },
  ]
  return (
    <div className="fade-up" style={{ maxWidth: 540, paddingTop: 20 }}>
      <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--green-bg)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
        <Icon name="check" size={42} style={{ color: 'var(--green)' }} />
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: 'var(--navy)' }}>
        Thank you{name ? `, ${name.split(' ')[0]}` : ''}!
      </h1>
      <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 16 }}>
        Your request has been received. A member of the Bright Cleaning Services team will reach out within <b>1 hour</b> during business hours.
      </p>
      <div className="card" style={{ padding: 22, marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>What happens next</div>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={s.icon} size={17} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{s.t}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-secondary" style={{ marginTop: 24 }} onClick={onReset}>
        <Icon name="plus" size={16} /> Submit another request
      </button>
    </div>
  )
}
