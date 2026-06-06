'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, StatCard, Card, AreaChart, Badge, Avatar, BrandTile, Pagination, Select, Menu, toast } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

interface BusinessRead {
  id: string
  name: string
  slug: string
  industry: string | null
  contact_email: string | null
  brand_color: string
  status: string
  logo_url: string | null
  created_at: string
}

interface Metrics {
  total_businesses: number
  active_businesses: number
  leads_today: number
  leads_this_week: number
  chart: { label: string; v: number }[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function bizInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function AdminOverviewPage() {
  const router = useRouter()
  const token = useApiToken()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [businesses, setBusinesses] = useState<BusinessRead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    Promise.all([
      api.get<{ ok: boolean; data: Metrics }>('/admin/metrics', token),
      api.get<{ ok: boolean; data: BusinessRead[] }>('/admin/businesses?limit=5', token),
    ]).then(([mRes, bRes]) => {
      setMetrics(mRes.data ?? null)
      setBusinesses(bRes.data ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [token])

  async function setStatus(bizId: string, status: string, bizName: string) {
    if (!token) return
    try {
      await api.patch(`/admin/businesses/${bizId}/status`, { status }, token)
      setBusinesses(bs => bs.map(b => b.id === bizId ? { ...b, status } : b))
      if (metrics && status === 'active') setMetrics(m => m ? { ...m, active_businesses: m.active_businesses + 1 } : m)
      if (metrics && status !== 'active') setMetrics(m => m ? { ...m, active_businesses: Math.max(0, m.active_businesses - 1) } : m)
      toast(`${bizName} ${status}`)
    } catch {
      toast('Failed to update status')
    }
  }

  const kpis = [
    { icon: 'building', label: 'Total Businesses', value: loading ? '—' : String(metrics?.total_businesses ?? 0), trend: 'all time', trendDir: 'up' as const, accent: '#2563EB', trendNote: 'platform total' },
    { icon: 'users', label: 'Active Businesses', value: loading ? '—' : String(metrics?.active_businesses ?? 0), trend: 'live now', trendDir: 'up' as const, accent: '#0891B2', trendNote: 'currently active' },
    { icon: 'userPlus', label: 'New Leads Today', value: loading ? '—' : String(metrics?.leads_today ?? 0), trend: 'today', trendDir: 'up' as const, accent: '#059669', trendNote: 'across all businesses' },
    { icon: 'mail', label: 'Leads This Week', value: loading ? '—' : String(metrics?.leads_this_week ?? 0), trend: 'last 7 days', trendDir: 'up' as const, accent: '#7C3AED', trendNote: 'across all businesses' },
  ]

  const quickActions = [
    { icon: 'plus', t: 'Add Business', d: 'Create a new business', action: () => router.push('/admin/businesses/new') },
    { icon: 'fileText', t: 'View Audit Logs', d: 'Review system activity', action: () => router.push('/admin/audit') },
    { icon: 'building', t: 'All Businesses', d: 'Manage every business', action: () => router.push('/admin/businesses') },
  ]

  return (
    <div className="page-pad fade-up">
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Admin Overview</h1>
          <p className="page-subtitle">Monitor platform activity and system performance.</p>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 22 }}>
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      <div className="ov-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Platform Growth Chart */}
          <Card>
            <div className="between" style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="section-title" style={{ fontSize: 16 }}>Platform Growth</span>
              </div>
              <span className="muted" style={{ fontSize: 12 }}>Last 14 days</span>
            </div>
            {loading || !metrics ? (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
              </div>
            ) : (
              <AreaChart data={metrics.chart} height={250} />
            )}
          </Card>

          {/* Recently Added Businesses */}
          <Card pad={false}>
            <div className="between" style={{ padding: '18px 22px 14px' }}>
              <span className="section-title" style={{ fontSize: 16 }}>Recently Added Businesses</span>
              <button className="btn btn-ghost btn-xs" onClick={() => router.push('/admin/businesses')}>
                View all <Icon name="arrowRight" size={14} />
              </button>
            </div>
            {loading ? (
              <div style={{ padding: '24px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="spinner" />
                <span className="muted" style={{ fontSize: 14 }}>Loading…</span>
              </div>
            ) : businesses.length === 0 ? (
              <div style={{ padding: '24px 22px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                No businesses yet. <button className="btn-link" onClick={() => router.push('/admin/businesses/new')}>Create one</button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead><tr>{['Business', 'Industry', 'Added On', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {businesses.map(b => (
                      <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/admin/businesses/${b.id}/edit`)}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <BrandTile icon="building" color={b.brand_color} name={b.name} size={34} />
                            <div>
                              <div className="strong">{b.name}</div>
                              <div className="muted" style={{ fontSize: 12 }}>{b.contact_email ?? b.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td>{b.industry ?? '—'}</td>
                        <td className="tabnum">{formatDate(b.created_at)}</td>
                        <td>
                          <Badge tone={b.status === 'active' ? 'green' : b.status === 'paused' ? 'amber' : b.status === 'archived' ? 'red' : 'gray'}>
                            {b.status === 'pending' ? 'Invited' : b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </Badge>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <Menu
                            trigger={<button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="more" size={18} /></button>}
                            items={[
                              { icon: 'edit', label: 'Edit Business', onClick: () => router.push(`/admin/businesses/${b.id}/edit`) },
                              { divider: true },
                              b.status !== 'paused' && b.status !== 'archived'
                                ? { icon: 'pause', label: 'Pause Business', onClick: () => setStatus(b.id, 'paused', b.name) }
                                : { icon: 'check', label: 'Activate Business', onClick: () => setStatus(b.id, 'active', b.name) },
                              { icon: 'trash', label: 'Archive Business', danger: true, onClick: () => setStatus(b.id, 'archived', b.name) },
                            ].filter(Boolean) as never[]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
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

          {/* Platform Summary */}
          <Card>
            <div className="section-title" style={{ fontSize: 16, marginBottom: 14 }}>Platform Summary</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: 'building', label: 'Total businesses', value: metrics?.total_businesses ?? '—' },
                { icon: 'check', label: 'Active businesses', value: metrics?.active_businesses ?? '—' },
                { icon: 'userPlus', label: 'Leads this week', value: metrics?.leads_this_week ?? '—' },
                { icon: 'mail', label: 'Leads today', value: metrics?.leads_today ?? '—' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--divider)' : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--muted-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={row.icon} size={15} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <span style={{ fontSize: 13.5, flex: 1 }}>{row.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{loading ? '—' : row.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
