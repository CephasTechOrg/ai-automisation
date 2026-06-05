'use client'

import { useRouter } from 'next/navigation'
import { Icon, StatCard, Card, AreaChart, Badge, Avatar, BrandTile, PlanBadge, Pagination, Select, Menu, toast } from '@/components/ui'
import { BUSINESSES, ACTIVITY, PLATFORM_GROWTH } from '@/lib/data/mock'

const KPIS = [
  { icon: 'building', label: 'Total Businesses', value: '248', trend: '18%', trendDir: 'up' as const, accent: '#2563EB', trendNote: 'vs May 5 – May 11' },
  { icon: 'users', label: 'Active Owners', value: '312', trend: '14%', trendDir: 'up' as const, accent: '#0891B2', trendNote: 'vs May 5 – May 11' },
  { icon: 'userPlus', label: 'New Leads Today', value: '128', trend: '24%', trendDir: 'up' as const, accent: '#059669', trendNote: 'vs May 5 – May 11' },
  { icon: 'mail', label: 'Emails Sent', value: '1,842', trend: '16%', trendDir: 'up' as const, accent: '#7C3AED', trendNote: 'vs May 5 – May 11' },
]

const ACT_TONE: Record<string, string> = {
  blue: 'var(--primary)', violet: 'var(--violet)', green: 'var(--green)', gray: 'var(--text-muted)',
}

const BIZ_MENU = [
  { icon: 'eye', label: 'View Business' },
  { icon: 'edit', label: 'Edit Business' },
  { icon: 'copy', label: 'Copy Form Link', onClick: () => toast('Form link copied') },
  { icon: 'mail', label: 'Resend Owner Invite', onClick: () => toast('Invite resent') },
  { divider: true },
  { icon: 'pause', label: 'Pause Business', onClick: () => toast('Business paused') },
  { icon: 'trash', label: 'Archive Business', danger: true },
]

export default function AdminOverviewPage() {
  const router = useRouter()

  const quickActions = [
    { icon: 'plus', t: 'Add Business', d: 'Create a new business', action: () => router.push('/admin/businesses/new') },
    { icon: 'userPlus', t: 'Add Owner', d: 'Invite a new owner', action: () => toast('Invite owner') },
    { icon: 'mail', t: 'Resend Invite', d: 'Resend owner invitation', action: () => toast('Invite resent') },
    { icon: 'fileText', t: 'View Audit Logs', d: 'Review system activity', action: () => router.push('/admin/audit') },
  ]

  return (
    <div className="page-pad fade-up">
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Admin Overview</h1>
          <p className="page-subtitle">Monitor platform activity and system performance.</p>
        </div>
        <button className="btn btn-secondary">
          <Icon name="calendar" size={17} style={{ color: 'var(--text-muted)' }} />
          May 12 – May 18, 2025
          <Icon name="chevDown" size={15} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 22 }}>
        {KPIS.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      <div className="ov-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Platform Growth Chart */}
          <Card>
            <div className="between" style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="section-title" style={{ fontSize: 16 }}>Platform Growth</span>
                <Icon name="info" size={15} style={{ color: 'var(--text-disabled)' }} />
              </div>
              <div style={{ width: 110 }}>
                <Select options={['Daily', 'Weekly', 'Monthly']} value="Daily" onChange={() => {}} />
              </div>
            </div>
            <AreaChart data={PLATFORM_GROWTH} height={250} maxOverride={1000} />
          </Card>

          {/* Recently Added Businesses */}
          <Card pad={false}>
            <div className="between" style={{ padding: '18px 22px 14px' }}>
              <span className="section-title" style={{ fontSize: 16 }}>Recently Added Businesses</span>
              <button className="btn btn-ghost btn-xs" onClick={() => router.push('/admin/businesses')}>
                View all businesses <Icon name="arrowRight" size={14} />
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead><tr>{['Business', 'Owner', 'Plan', 'Added On', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {BUSINESSES.slice(0, 5).map(b => (
                    <tr key={b.slug}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <BrandTile icon={b.icon} color={b.color} name={b.name} size={34} />
                          <div>
                            <div className="strong">{b.name}</div>
                            <div className="muted" style={{ fontSize: 12 }}>{b.domain}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar name={b.owner} size={26} />{b.owner}
                        </div>
                      </td>
                      <td><PlanBadge>{b.plan}</PlanBadge></td>
                      <td className="tabnum">{b.added}</td>
                      <td><Badge>{b.status === 'Pending' ? 'Invited' : b.status}</Badge></td>
                      <td><Menu trigger={<button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="more" size={18} /></button>} items={BIZ_MENU} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '4px 18px 14px' }}>
              <Pagination page={1} pages={5} info="Showing 1 to 5 of 248 businesses" onPage={() => {}} />
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Recent Activity */}
          <Card>
            <div className="between" style={{ marginBottom: 16 }}>
              <span className="section-title" style={{ fontSize: 16 }}>Recent Activity</span>
              <button className="btn btn-ghost btn-xs">View all <Icon name="arrowRight" size={14} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--divider)' : 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: ACT_TONE[a.tone] + '14', color: ACT_TONE[a.tone], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={a.icon} size={16} />
                  </div>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>{a.title}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{a.meta} · {a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {quickActions.map((q, i) => (
                <button key={i} className="qa-card" onClick={q.action}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icon name={q.icon} size={19} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{q.t}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{q.d}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
