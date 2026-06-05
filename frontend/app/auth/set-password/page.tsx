'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo, Icon, Field, Input } from '@/components/ui'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Verify user has an active session from the callback exchange
    createClient().auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/login?error=session_expired')
      } else {
        setSessionReady(true)
      }
    })
  }, [router])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')

    if (password.length < 8) {
      setErr('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setErr('Passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setErr(error.message)
      return
    }

    setDone(true)
    setTimeout(() => router.replace('/dashboard'), 1500)
  }

  if (!sessionReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <Logo />
        <div style={{ marginTop: 56, maxWidth: 440 }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
            You&apos;re almost in.
          </h1>
          <p style={{ fontSize: 16.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 18, maxWidth: 400 }}>
            Set a password for your LeadFlow Pro account and start managing your leads right away.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
            {[
              { icon: 'shieldCheck', t: 'Secure by default', d: 'Your account is protected with industry-standard encryption.' },
              { icon: 'zap', t: 'Ready instantly', d: 'Your dashboard is set up and waiting for you.' },
            ].map((f, i) => (
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

      <div className="auth-right">
        {done ? (
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 32, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-bg)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
              <Icon name="check" size={36} style={{ color: 'var(--green)' }} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 10px' }}>Password set!</h2>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
              Taking you to your dashboard…
            </p>
          </div>
        ) : (
          <form className="card" style={{ width: '100%', maxWidth: 440, padding: 32 }} onSubmit={submit}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 14, borderRadius: 12, background: 'var(--primary-50)', border: '1px solid var(--info-border)', marginBottom: 26 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--primary-100)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="users" size={18} />
              </div>
              <div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>You were invited to</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>LeadFlow Pro</div>
              </div>
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Set your password</h2>
            <p className="muted" style={{ margin: '0 0 24px', fontSize: 14 }}>Choose a strong password to secure your account.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="New password" error={err && !confirm ? err : undefined}>
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={password}
                  error={!!err}
                  onChange={e => { setPassword(e.target.value); setErr('') }}
                  iconRight={
                    <button type="button" onClick={() => setShowPw(s => !s)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                      <Icon name={showPw ? 'eyeOff' : 'eye'} size={18} />
                    </button>
                  }
                />
              </Field>

              <Field label="Confirm password" error={err}>
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirm}
                  error={!!err}
                  onChange={e => { setConfirm(e.target.value); setErr('') }}
                />
              </Field>

              {password.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    { label: '8+ chars', ok: password.length >= 8 },
                    { label: 'Uppercase', ok: /[A-Z]/.test(password) },
                    { label: 'Number', ok: /[0-9]/.test(password) },
                  ].map((r, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: r.ok ? 'var(--green)' : 'var(--text-muted)', fontWeight: 600 }}>
                      <Icon name={r.ok ? 'check' : 'minus'} size={13} />
                      {r.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 24 }} disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Setting password…' : 'Set Password & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
