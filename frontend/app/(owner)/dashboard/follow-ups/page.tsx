'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, StatCard, Card, Badge, Avatar, Tabs, EmptyState, toast, useIsMobile } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

interface FollowUp {
  id: string
  lead_id: string
  customer_name: string
  service_needed: string | null
  lead_status: string
  state: 'due' | 'scheduled' | 'overdue' | 'sent' | string
  scheduled_at: string
  sent_at: string | null
  subject: string | null
  content: string | null
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffHrs = Math.round(diffMs / 3600000)
  if (diffHrs > 0 && diffHrs < 24) return `In ${diffHrs}h`
  if (diffHrs <= 0 && diffHrs > -24) return 'Today'
  if (diffHrs <= -24 && diffHrs > -48) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const STATE_BADGE: Record<string, string> = {
  due: 'badge-blue', scheduled: 'badge-gray', overdue: 'badge-red', sent: 'badge-green', canceled: 'badge-gray',
}

export default function FollowUpsPage() {
  const token = useApiToken()
  const router = useRouter()
  const isMobile = useIsMobile(720)
  const [followups, setFollowups] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('due')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: FollowUp[] }>('/owner/followups', token)
      .then(r => { setFollowups(r.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  async function markSent(id: string) {
    if (!token) return
    setUpdating(id)
    try {
      await api.patch(`/owner/followups/${id}`, { status: 'sent' }, token)
      setFollowups(fs => fs.map(f => f.id === id ? { ...f, state: 'sent', sent_at: new Date().toISOString() } : f))
      toast('Follow-up marked as sent')
    } catch {
      toast('Failed to update follow-up')
    } finally {
      setUpdating(null)
    }
  }

  async function reschedule(id: string, hoursFromNow: number) {
    if (!token) return
    setUpdating(id)
    const scheduled_at = new Date(Date.now() + hoursFromNow * 3600000).toISOString()
    try {
      await api.patch(`/owner/followups/${id}`, { scheduled_at }, token)
      const newState = hoursFromNow <= 24 ? 'due' : 'scheduled'
      setFollowups(fs => fs.map(f => f.id === id ? { ...f, state: newState, scheduled_at } : f))
      toast(`Rescheduled for ${hoursFromNow === 24 ? 'tomorrow' : `${hoursFromNow}h from now`}`)
    } catch {
      toast('Failed to reschedule')
    } finally {
      setUpdating(null)
    }
  }

  const counts = { due: 0, scheduled: 0, overdue: 0, sent: 0 }
  followups.forEach(f => {
    const k = f.state as keyof typeof counts
    if (k in counts) counts[k]++
  })

  const kpis = [
    { icon: 'calendarClock', label: 'Due Today',  value: loading ? '—' : String(counts.due),       accent: '#2563EB' },
    { icon: 'calendar',      label: 'Scheduled',   value: loading ? '—' : String(counts.scheduled), accent: '#0891B2' },
    { icon: 'send',          label: 'Sent',         value: loading ? '—' : String(counts.sent),      accent: '#059669' },
    { icon: 'clock',         label: 'Overdue',      value: loading ? '—' : String(counts.overdue),   accent: '#DC2626' },
  ]

  const tabList = [
    { value: 'due',       label: 'Due Today',  count: counts.due },
    { value: 'overdue',   label: 'Overdue',    count: counts.overdue },
    { value: 'scheduled', label: 'Scheduled',  count: counts.scheduled },
    { value: 'sent',      label: 'Sent',       count: counts.sent },
  ]

  const rows = followups.filter(f => f.state === tab)

  return (
    <div className="page-pad fade-up">
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Follow-ups</h1>
          <p className="page-subtitle">Stay on top of leads that need your attention.</p>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 22 }}>
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      <Card pad={false}>
        <div style={{ padding: '16px 20px' }}>
          <Tabs tabs={tabList} active={tab} onChange={setTab} />
        </div>
        <div className="divider-h" />

        {loading ? (
          <div style={{ padding: '32px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="spinner" />
            <span className="muted" style={{ fontSize: 14 }}>Loading follow-ups…</span>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={tab === 'sent' ? 'checkCircle' : 'calendarClock'}
            title={tab === 'sent' ? 'No sent follow-ups yet' : 'All caught up!'}
            text={tab === 'sent' ? 'Sent follow-ups will appear here.' : 'No follow-ups in this category right now.'}
          />
        ) : isMobile ? (
          <div className="mcard-list" style={{ padding: 16 }}>
            {rows.map(f => (
              <div key={f.id} className="mcard" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch' }}>
                <div className="mcard-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <Avatar name={f.customer_name} initials={initials(f.customer_name)} size={36} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }} className="trunc">{f.customer_name}</div>
                      <div className="muted" style={{ fontSize: 12.5 }}>{f.service_needed ?? 'General enquiry'}</div>
                    </div>
                  </div>
                  <Badge>{f.lead_status}</Badge>
                </div>
                <div className="mcard-meta">
                  <span>
                    <span className="k">{tab === 'sent' ? 'Sent: ' : 'Due: '}</span>
                    <span className={'badge ' + (STATE_BADGE[f.state] ?? 'badge-gray')} style={{ height: 20 }}>
                      <span className="dot" />
                      {tab === 'sent' ? formatDate(f.sent_at!) : formatDate(f.scheduled_at)}
                    </span>
                  </span>
                </div>
                {f.content && <div className="muted" style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>{f.content.slice(0, 100)}{f.content.length > 100 ? '…' : ''}</div>}
                <div className="mcard-actions">
                  {tab === 'sent' ? (
                    <button className="btn btn-secondary btn-sm btn-block" onClick={() => router.push(`/dashboard/leads?open=${f.lead_id}`)}>
                      Open Lead
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        disabled={updating === f.id}
                        onClick={() => reschedule(f.id, 24)}
                      >
                        Reschedule
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        disabled={updating === f.id}
                        onClick={() => markSent(f.id)}
                      >
                        {updating === f.id ? <span className="spinner" /> : <Icon name="send" size={15} />}
                        Send
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>{['Customer', 'Service', 'Lead Status', tab === 'sent' ? 'Sent' : 'Due', 'Message', ''].map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map(f => (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <Avatar name={f.customer_name} initials={initials(f.customer_name)} size={34} />
                        <span className="strong">{f.customer_name}</span>
                      </div>
                    </td>
                    <td>{f.service_needed ?? '—'}</td>
                    <td><Badge>{f.lead_status}</Badge></td>
                    <td>
                      <span className={'badge ' + (STATE_BADGE[f.state] ?? 'badge-gray')}>
                        <span className="dot" />
                        {tab === 'sent' ? formatDate(f.sent_at!) : formatDate(f.scheduled_at)}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220, fontSize: 13, color: 'var(--text-secondary)' }}>
                      {f.content ? f.content.slice(0, 80) + (f.content.length > 80 ? '…' : '') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        {tab === 'sent' ? (
                          <button className="btn btn-secondary btn-xs" onClick={() => router.push(`/dashboard/leads?open=${f.lead_id}`)}>
                            Open Lead
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn btn-secondary btn-xs"
                              disabled={updating === f.id}
                              onClick={() => reschedule(f.id, 24)}
                            >
                              Reschedule
                            </button>
                            <button
                              className="btn btn-primary btn-xs"
                              disabled={updating === f.id}
                              onClick={() => markSent(f.id)}
                            >
                              {updating === f.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Icon name="send" size={14} />}
                              Send
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
