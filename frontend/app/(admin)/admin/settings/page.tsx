'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, Card, toast } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

interface PlatformSettings {
  ai_model: string
  email_provider: string
  resend_configured: boolean
  deepseek_configured: boolean
  resend_from: string
  platform_name: string
  total_businesses: number
  active_businesses: number
  total_leads: number
  total_emails_sent: number
  emails_failed: number
}

function HealthRow({ label, ok, value }: { label: string; ok: boolean; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--divider)' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: ok ? 'var(--green)' : 'var(--red)', flexShrink: 0 }} />
      <span style={{ fontSize: 14, flex: 1 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: ok ? 'var(--green)' : 'var(--red)' }}>{value}</span>
    </div>
  )
}

function StatRow({ icon, label, value, color = 'var(--primary)' }: { icon: string; label: string; value: string | number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--divider)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={16} style={{ color }} />
      </div>
      <span style={{ fontSize: 13.5, flex: 1 }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 700 }}>{value}</span>
    </div>
  )
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const token = useApiToken()
  const [data, setData] = useState<PlatformSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: PlatformSettings }>('/admin/settings', token)
      .then(r => setData(r.data))
      .catch(() => toast('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [token])

  const deliveryRate = data
    ? data.total_emails_sent + data.emails_failed === 0
      ? 'N/A'
      : `${Math.round(data.total_emails_sent / (data.total_emails_sent + data.emails_failed) * 100)}%`
    : '—'

  return (
    <div className="page-pad fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Platform Settings</h1>
        <p className="page-subtitle">System configuration and health overview for LeadFlow Pro.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 22, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* System Health */}
          <Card>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 4 }}>System Health</div>
            <p className="helper" style={{ marginBottom: 16 }}>Live status of all integrated services.</p>
            {loading ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 0' }}>
                <div className="spinner" /><span className="muted">Checking…</span>
              </div>
            ) : (
              <div>
                <HealthRow label="Resend (Email)" ok={data?.resend_configured ?? false} value={data?.resend_configured ? 'Connected' : 'Not configured'} />
                <HealthRow label="DeepSeek (AI)" ok={data?.deepseek_configured ?? false} value={data?.deepseek_configured ? 'Connected' : 'Not configured'} />
                <HealthRow label="Supabase (Database)" ok={true} value="Connected" />
                <div style={{ borderBottom: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, flex: 1 }}>Platform API</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--green)' }}>Online</span>
                </div>
              </div>
            )}
          </Card>

          {/* AI & Email Config */}
          <Card>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 16 }}>Service Configuration</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'AI Provider', value: 'DeepSeek', icon: 'sparkles' },
                { label: 'AI Model', value: loading ? '—' : (data?.ai_model ?? '—'), icon: 'layers' },
                { label: 'Email Provider', value: loading ? '—' : (data?.email_provider ?? '—'), icon: 'mail' },
                { label: 'From Email', value: loading ? '—' : (data?.resend_from ?? '—'), icon: 'send' },
              ].map((row, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--divider)' : 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--muted-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={row.icon} size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <span style={{ fontSize: 13.5, flex: 1, color: 'var(--text-secondary)' }}>{row.label}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick links */}
          <Card>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 16 }}>Quick Links</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Manage Businesses', desc: 'View and edit all businesses', icon: 'building', href: '/admin/businesses' },
                { label: 'View Audit Logs', desc: 'Review all system events', icon: 'fileText', href: '/admin/audit' },
                { label: 'Email Delivery Logs', desc: 'Track sent emails and failures', icon: 'mail', href: '/admin/emails' },
                { label: 'Automation Settings', desc: 'Toggle AI per business', icon: 'zap', href: '/admin/automations' },
              ].map((link, i) => (
                <button
                  key={i}
                  onClick={() => router.push(link.href)}
                  style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--muted-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={link.icon} size={17} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{link.label}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{link.desc}</div>
                  </div>
                  <Icon name="chevRight" size={15} style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Card>
            <div className="section-title" style={{ fontSize: 15, marginBottom: 4 }}>Platform Stats</div>
            <p className="helper" style={{ marginBottom: 16 }}>All-time platform totals.</p>
            {loading ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><div className="spinner" /></div>
            ) : (
              <div>
                <StatRow icon="building" label="Total businesses" value={data?.total_businesses ?? '—'} color="var(--primary)" />
                <StatRow icon="check" label="Active businesses" value={data?.active_businesses ?? '—'} color="var(--green)" />
                <StatRow icon="userPlus" label="Total leads" value={data?.total_leads ?? '—'} color="var(--primary)" />
                <StatRow icon="send" label="Emails sent" value={data?.total_emails_sent ?? '—'} color="var(--green)" />
                <StatRow icon="xCircle" label="Emails failed" value={data?.emails_failed ?? '—'} color="var(--red)" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--primary)15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="chart" size={16} style={{ color: 'var(--primary)' }} />
                  </div>
                  <span style={{ fontSize: 13.5, flex: 1 }}>Delivery rate</span>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{deliveryRate}</span>
                </div>
              </div>
            )}
          </Card>

          <Card style={{ padding: '18px 20px', background: 'var(--navy)', border: 'none' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>LeadFlow Pro</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.6)', lineHeight: 1.55 }}>
              AI-powered lead automation for small businesses. Built with FastAPI, Next.js, Supabase, and DeepSeek.
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['FastAPI', 'Next.js', 'Supabase', 'DeepSeek'].map(t => (
                <span key={t} style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.8)' }}>{t}</span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
