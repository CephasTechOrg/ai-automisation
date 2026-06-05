'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, StatCard, Card, AreaChart, Badge, Avatar, CopyLinkBox, useIsMobile } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'
import { LEAD_VOLUME, FORM_URL } from '@/lib/data/mock'

interface LeadRead {
  id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  service_needed: string | null
  status: string
  created_at: string
}

const STATUS_DISPLAY: Record<string, string> = {
  new: 'New', contacted: 'Contacted', booked: 'Booked',
  follow_up: 'Follow-up', lost: 'Lost', archived: 'Archived',
}

function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return (p.length >= 2 ? p[0][0] + p[1][0] : p[0].slice(0, 2)).toUpperCase()
}

function timeAgo(isoStr: string) {
  const m = Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const INSIGHTS = [
  { icon: 'messageDots', t: 'Follow-ups need attention', d: '3 leads are waiting for follow-up today.' },
  { icon: 'calendar', t: 'Fridays are your busiest', d: 'You get 2.1× more leads on Fridays.' },
  { icon: 'phone', t: 'Improve contact rate', d: 'Top performers contact 90%+ of new leads.' },
]

export default function OwnerDashboardPage() {
  const router = useRouter()
  const token = useApiToken()
  const isMobile = useIsMobile(900)
  const [leads, setLeads] = useState<LeadRead[]>([])
  const [loading, setLoading] = useState(true)
  const [formSlug, setFormSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: LeadRead[] }>('/owner/leads', token)
      .then(r => setLeads(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
    api.get<{ ok: boolean; data: { slug: string } }>('/owner/form', token)
      .then(r => setFormSlug(r.data?.slug ?? null))
      .catch(() => {})
  }, [token])

  const newCount = leads.filter(l => l.status === 'new').length
  const followUpCount = leads.filter(l => l.status === 'follow_up').length
  const bookedCount = leads.filter(l => l.status === 'booked').length
  const recent = leads.slice(0, 5)

  const kpis = [
    { icon: 'users', label: 'New Leads', value: String(newCount), trend: 'this period', trendDir: 'up' as const, accent: '#2563EB' },
    { icon: 'clock', label: 'Follow-ups Due', value: String(followUpCount), trend: 'pending', trendDir: 'down' as const, accent: '#D97706' },
    { icon: 'calendar', label: 'Booked', value: String(bookedCount), trend: 'this period', trendDir: 'up' as const, accent: '#059669' },
    { icon: 'target', label: 'Total Leads', value: String(leads.length), trend: 'all time', trendDir: 'up' as const, accent: '#0891B2' },
  ]

  const needsAction = [
    { n: newCount, label: 'New leads waiting', icon: 'users', cta: 'Review', go: () => router.push('/dashboard/leads') },
    { n: followUpCount, label: 'Follow-ups due', icon: 'clock', cta: 'Send', go: () => router.push('/dashboard/follow-ups') },
    { n: 0, label: 'AI replies ready to approve', icon: 'sparkles', cta: 'Approve', go: () => router.push('/dashboard/leads') },
  ]

  return (
    <div className="page-pad fade-up">
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Welcome back</h1>
          <p className="page-subtitle">What needs your attention today?</p>
        </div>
      </div>

      {/* Needs Action */}
      <div className="needs-action" style={{ marginBottom: 22 }}>
        <div className="na-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="na-pulse"><Icon name="zap" size={17} /></div>
            <span className="section-title" style={{ fontSize: 16, color: '#fff' }}>Needs Action</span>
          </div>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="na-grid">
          {needsAction.map((a, i) => (
            <button key={i} className="na-card" onClick={a.go}>
              <div className="na-ic"><Icon name={a.icon} size={18} /></div>
              <div className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
                    {loading ? '—' : a.n}
                  </span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,.78)' }}>{a.label}</span>
                </div>
              </div>
              <span className="na-cta">{a.cta} <Icon name="arrowRight" size={14} /></span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom: 22 }}>
        {kpis.map((k, i) => <StatCard key={i} {...k} compact />)}
      </div>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FormLinkCard router={router} formSlug={formSlug} />
          <RecentLeadsCard recent={recent} loading={loading} router={router} isMobile={isMobile} />
          <AIInsightsCard />
          <ChartCard />
        </div>
      ) : (
        <div className="ov-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <RecentLeadsCard recent={recent} loading={loading} router={router} isMobile={isMobile} />
            <ChartCard />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <FormLinkCard router={router} formSlug={formSlug} />
            <AIInsightsCard />
          </div>
        </div>
      )}
    </div>
  )
}

function FormLinkCard({ router, formSlug }: { router: ReturnType<typeof useRouter>; formSlug: string | null }) {
  const formUrl = formSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/forms/${formSlug}`
    : FORM_URL
  return (
    <Card>
      <div className="section-title" style={{ fontSize: 16 }}>Your Public Form Link</div>
      <p className="helper" style={{ margin: '5px 0 16px' }}>Share this link to start capturing leads.</p>
      <CopyLinkBox url={formUrl} />
      <button className="btn btn-ghost btn-xs" style={{ marginTop: 12, paddingLeft: 0 }} onClick={() => router.push('/dashboard/form-link')}>
        Preview Form <Icon name="externalLink" size={14} />
      </button>
    </Card>
  )
}

function AIInsightsCard() {
  return (
    <Card>
      <div className="between" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="sparkles" size={17} style={{ color: 'var(--primary)' }} />
          <span className="section-title" style={{ fontSize: 16 }}>AI Insights</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {INSIGHTS.map((it, i) => (
          <div key={i} className="insight-row">
            <div className="insight-ic"><Icon name={it.icon} size={15} /></div>
            <div className="grow" style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{it.t}</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 1 }}>{it.d}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ChartCard() {
  return (
    <Card>
      <div className="between" style={{ marginBottom: 14 }}>
        <span className="section-title" style={{ fontSize: 15 }}>Lead Volume</span>
      </div>
      <AreaChart data={LEAD_VOLUME} height={190} maxOverride={80} />
    </Card>
  )
}

function RecentLeadsCard({
  recent, loading, router, isMobile
}: {
  recent: LeadRead[]
  loading: boolean
  router: ReturnType<typeof useRouter>
  isMobile: boolean
}) {
  return (
    <Card pad={false}>
      <div className="between" style={{ padding: '18px 22px 14px' }}>
        <span className="section-title" style={{ fontSize: 16 }}>Recent Leads</span>
        <button className="btn btn-ghost btn-xs" onClick={() => router.push('/dashboard/leads')}>
          View all <Icon name="arrowRight" size={15} />
        </button>
      </div>
      {loading ? (
        <div style={{ padding: '24px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="spinner" />
          <span className="muted" style={{ fontSize: 14 }}>Loading leads…</span>
        </div>
      ) : recent.length === 0 ? (
        <div style={{ padding: '24px 22px', textAlign: 'center' }}>
          <p className="muted" style={{ fontSize: 14, margin: 0 }}>No leads yet. Share your form link to get started.</p>
        </div>
      ) : isMobile ? (
        <div className="mcard-list" style={{ padding: '0 14px 14px' }}>
          {recent.map(l => (
            <button key={l.id} className="mcard" onClick={() => router.push('/dashboard/leads')}>
              <Avatar name={l.customer_name} initials={initials(l.customer_name)} size={38} />
              <div className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
                <div className="between">
                  <span style={{ fontWeight: 600, fontSize: 14 }} className="trunc">{l.customer_name}</span>
                  <Badge dot={false}>{STATUS_DISPLAY[l.status] ?? l.status}</Badge>
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                  {l.service_needed ?? '—'} · {timeAgo(l.created_at)}
                </div>
              </div>
              <Icon name="chevRight" size={17} style={{ color: 'var(--text-disabled)', flexShrink: 0, alignSelf: 'center' }} />
            </button>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>{['Customer', 'Service', 'Status', 'Received', ''].map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {recent.map(l => (
                <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/leads')}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <Avatar name={l.customer_name} initials={initials(l.customer_name)} size={34} />
                      <span className="strong">{l.customer_name}</span>
                    </div>
                  </td>
                  <td>{l.service_needed ?? '—'}</td>
                  <td><Badge>{STATUS_DISPLAY[l.status] ?? l.status}</Badge></td>
                  <td className="tabnum">
                    {new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' '}<span className="muted">{timeAgo(l.created_at)}</span>
                  </td>
                  <td>
                    <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={e => { e.stopPropagation(); router.push('/dashboard/leads') }}>
                      <Icon name="chevRight" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
