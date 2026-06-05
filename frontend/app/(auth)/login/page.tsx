'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo, Icon, Field, Input } from '@/components/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [magic, setMagic] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setErr('Please enter your email address.'); return }
    setErr('')
    setLoading(true)
    const supabase = createClient()
    if (magic) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      })
      setLoading(false)
      if (error) { setErr(error.message); return }
      setSent(true)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
      setLoading(false)
      if (error) { setErr(error.message); return }
      router.push('/')
      router.refresh()
    }
  }

  const features = [
    { icon: 'users', t: 'Capture more leads', d: 'Get leads from every channel into one place.' },
    { icon: 'phone', t: 'Respond faster', d: 'Automate follow-ups and never miss a chance.' },
    { icon: 'chart', t: 'Grow with insights', d: "See what's working and scale what matters." },
  ]

  return (
    <div className="auth-wrap">
      {/* LEFT */}
      <div className="auth-left">
        <Logo />
        <div style={{ marginTop: 56, maxWidth: 440 }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
            Run your business.<br />Grow with confidence.
          </h1>
          <p style={{ fontSize: 16.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 18, maxWidth: 420 }}>
            LeadFlow Pro helps service businesses capture more leads, follow up faster, and close more jobs—all in one powerful platform.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 32 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--primary-100)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={f.icon} size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{f.t}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13.5, marginTop: 2 }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        {sent ? (
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 32, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-bg)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
              <Icon name="mail" size={32} style={{ color: 'var(--green)' }} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 10px' }}>Check your inbox</h2>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
              We sent a magic link to <b style={{ color: 'var(--text)' }}>{email}</b>. Click it to sign in.
            </p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 22 }} onClick={() => { setSent(false); setMagic(false) }}>
              Back to sign in
            </button>
          </div>
        ) : (
          <form className="card" style={{ width: '100%', maxWidth: 440, padding: 32 }} onSubmit={submit}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 14, borderRadius: 12, background: 'var(--primary-50)', border: '1px solid var(--info-border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--primary-100)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="users" size={18} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>You were invited to manage</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>LeadFlow Pro</div>
              </div>
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '26px 0 4px' }}>Welcome back</h2>
            <p className="muted" style={{ margin: '0 0 22px', fontSize: 14 }}>Sign in to your LeadFlow Pro account</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Email address" error={!magic ? err : undefined}>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  error={!magic && !!err}
                  onChange={(e) => { setEmail(e.target.value); setErr('') }}
                />
              </Field>

              {!magic && (
                <div>
                  <div className="between" style={{ marginBottom: 7 }}>
                    <label className="label">Password</label>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>Forgot password?</span>
                  </div>
                  <Input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    iconRight={
                      <button type="button" onClick={() => setShowPw(s => !s)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                        <Icon name={showPw ? 'eyeOff' : 'eye'} size={18} />
                      </button>
                    }
                  />
                </div>
              )}

              {err && magic && (
                <div className="error-msg"><Icon name="info" size={13} />{err}</div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 22 }} disabled={loading}>
              {loading && <span className="spinner" />}
              {magic ? 'Send magic link' : 'Sign In'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0' }}>
              <div className="divider-h" style={{ flex: 1 }} />
              <span className="muted" style={{ fontSize: 13 }}>or</span>
              <div className="divider-h" style={{ flex: 1 }} />
            </div>

            <button type="button" className="btn btn-secondary btn-lg btn-block" onClick={() => { setMagic(m => !m); setErr('') }}>
              <Icon name="mail" size={17} />
              {magic ? 'Use password instead' : 'Send me a magic link'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <p className="muted" style={{ fontSize: 13.5 }}>Don&apos;t have an account? Contact your administrator.</p>
        </div>

        <div className="between" style={{ marginTop: 26, width: '100%', maxWidth: 440, fontSize: 12.5, color: 'var(--text-disabled)' }}>
          <span>© 2025 LeadFlow Pro. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>
      </div>
    </div>
  )
}
