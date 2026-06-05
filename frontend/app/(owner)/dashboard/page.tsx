'use client'

import { useRouter } from 'next/navigation'
import { Icon, StatCard, Card, AreaChart, Badge, Avatar, CopyLinkBox, useIsMobile } from '@/components/ui'
import { LEADS, LEAD_VOLUME, FORM_URL } from '@/lib/data/mock'

const KPIS = [
  { icon: 'users', label: 'New Leads', value: '128', trend: '24% this week', trendDir: 'up' as const, accent: '#2563EB' },
  { icon: 'clock', label: 'Follow-ups Due', value: '15', trend: '8% this week', trendDir: 'down' as const, accent: '#D97706' },
  { icon: 'calendar', label: 'Booked', value: '32', trend: '14% this week', trendDir: 'up' as const, accent: '#059669' },
  { icon: 'target', label: 'Response Rate', value: '94%', trend: '6% this week', trendDir: 'up' as const, accent: '#0891B2' },
]

const INSIGHTS = [
  { icon: 'messageDots', t: 'Follow-ups need attention', d: '3 leads are waiting for follow-up today.' },
  { icon: 'calendar', t: 'Fridays are your busiest', d: 'You get 2.1× more leads on Fridays.' },
  { icon: 'phone', t: 'Improve contact rate', d: 'Top performers contact 90%+ of new leads.' },
]

export default function OwnerDashboardPage() {
  const router = useRouter()
  const isMobile = useIsMobile(900)
  const recent = LEADS.slice(0, 5)

  const needsAction = [
    { n: 5, label: 'New leads waiting', icon: 'users', cta: 'Review', go: () => router.push('/dashboard/leads') },
    { n: 3, label: 'Follow-ups due today', icon: 'clock', cta: 'Send', go: () => router.push('/dashboard/follow-ups') },
    { n: 2, label: 'AI replies ready to approve', icon: 'sparkles', cta: 'Approve', go: () => router.push('/dashboard/leads') },
  ]

  return (
    <div className="page-pad fade-up">
      {/* Header */}
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Welcome back, Alex 👋</h1>
          <p className="page-subtitle">What needs your attention today?</p>
        </div>
        <button className="btn btn-secondary" style={{ gap: 10 }}>
          <Icon name="calendar" size={17} style={{ color: 'var(--text-muted)' }} />
          May 12 – May 18, 2025
          <Icon name="chevDown" size={15} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Needs Action */}
      <div className="needs-action" style={{ marginBottom: 22 }}>
        <div className="na-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="na-pulse"><Icon name="zap" size={17} /></div>
            <span className="section-title" style={{ fontSize: 16, color: '#fff' }}>Needs Action</span>
          </div>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.7)' }}>Today · May 18</span>
        </div>
        <div className="na-grid">
          {needsAction.map((a, i) => (
            <button key={i} className="na-card" onClick={a.go}>
              <div className="na-ic"><Icon name={a.icon} size={18} /></div>
              <div className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{a.n}</span>
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
        {KPIS.map((k, i) => <StatCard key={i} {...k} compact />)}
      </div>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <FormLinkCard router={router} />
          <RecentLeadsCard recent={recent} router={router} isMobile={isMobile} />
          <AIInsightsCard />
          <ChartCard />
        </div>
      ) : (
        <div className="ov-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <RecentLeadsCard recent={recent} router={router} isMobile={isMobile} />
            <ChartCard />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <FormLinkCard router={router} />
            <AIInsightsCard />
          </div>
        </div>
      )}
    </div>
  )
}

function FormLinkCard({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <Card>
      <div className="section-title" style={{ fontSize: 16 }}>Your Public Form Link</div>
      <p className="helper" style={{ margin: '5px 0 16px' }}>Share this link to start capturing leads.</p>
      <CopyLinkBox url={FORM_URL} />
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
      <button className="btn btn-ghost btn-xs" style={{ marginTop: 10, paddingLeft: 0 }}>
        View details <Icon name="arrowRight" size={14} />
      </button>
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

function RecentLeadsCard({ recent, router, isMobile }: { recent: typeof LEADS; router: ReturnType<typeof useRouter>; isMobile: boolean }) {
  return (
    <Card pad={false}>
      <div className="between" style={{ padding: '18px 22px 14px' }}>
        <span className="section-title" style={{ fontSize: 16 }}>Recent Leads</span>
        <button className="btn btn-ghost btn-xs" onClick={() => router.push('/dashboard/leads')}>
          View all <Icon name="arrowRight" size={15} />
        </button>
      </div>
      {isMobile ? (
        <div className="mcard-list" style={{ padding: '0 14px 14px' }}>
          {recent.map(l => (
            <button key={l.id} className="mcard" onClick={() => router.push('/dashboard/leads')}>
              <Avatar name={l.name} initials={l.initials} size={38} />
              <div className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
                <div className="between">
                  <span style={{ fontWeight: 600, fontSize: 14 }} className="trunc">{l.name}</span>
                  <Badge dot={false}>{l.status}</Badge>
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{l.service} · {l.time}</div>
              </div>
              <Icon name="chevRight" size={17} style={{ color: 'var(--text-disabled)', flexShrink: 0, alignSelf: 'center' }} />
            </button>
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead><tr>{['Customer', 'Service', 'Status', 'Received', ''].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>
              {recent.map(l => (
                <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard/leads')}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><Avatar name={l.name} initials={l.initials} size={34} /><span className="strong">{l.name}</span></div></td>
                  <td>{l.service}</td>
                  <td><Badge>{l.status}</Badge></td>
                  <td className="tabnum">{l.received} <span className="muted">{l.time}</span></td>
                  <td><button className="icon-btn" style={{ width: 32, height: 32 }} onClick={e => { e.stopPropagation(); router.push('/dashboard/leads') }}><Icon name="chevRight" size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
