'use client'

import { useState, useEffect } from 'react'
import { Icon, Card, Avatar, EmptyState, toast, useIsMobile } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

interface AuditEntry {
  id: string
  action: string
  actor_email: string
  business_name: string
  details: Record<string, unknown>
  created_at: string
}

const ACTION_STYLE: Record<string, { icon: string; color: string }> = {
  business_created:         { icon: 'plus',     color: 'green'  },
  business_updated:         { icon: 'edit',     color: 'blue'   },
  business_status_changed:  { icon: 'pause',    color: 'amber'  },
  invite_resent:            { icon: 'userPlus', color: 'violet' },
  'business.created':       { icon: 'plus',     color: 'green'  },
  'lead.created':           { icon: 'users',    color: 'blue'   },
  'owner.invite.failed':    { icon: 'xCircle',  color: 'red'    },
  'owner.invite.sent':      { icon: 'mail',     color: 'violet' },
}

function getStyle(action: string) {
  return ACTION_STYLE[action] ?? { icon: 'fileText', color: 'gray' }
}

function formatTs(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function actionLabel(action: string) {
  return action.replace(/_/g, ' ').replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function detailsSummary(details: Record<string, unknown>): string {
  if (details.fields) return `Fields: ${(details.fields as string[]).join(', ')}`
  if (details.owner_email) return `Owner: ${details.owner_email}`
  if (details.email) return `Email: ${details.email}`
  if (details.from && details.to) return `${details.from} → ${details.to}`
  const keys = Object.keys(details).filter(k => k !== 'name')
  if (keys.length === 0) return ''
  return keys.map(k => `${k}: ${details[k]}`).join(', ')
}

export default function AdminAuditPage() {
  const token = useApiToken()
  const isMobile = useIsMobile(820)
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: AuditEntry[] }>('/admin/audit-logs?limit=100', token)
      .then(r => { setLogs(r.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const filtered = q
    ? logs.filter(l =>
        l.actor_email.toLowerCase().includes(q.toLowerCase()) ||
        l.action.toLowerCase().includes(q.toLowerCase()) ||
        l.business_name.toLowerCase().includes(q.toLowerCase()) ||
        detailsSummary(l.details).toLowerCase().includes(q.toLowerCase())
      )
    : logs

  const actions = ['All Actions', ...Array.from(new Set(logs.map(l => l.action)))]
  const businesses = ['All Businesses', ...Array.from(new Set(logs.map(l => l.business_name).filter(n => n !== '—')))]
  const [actionFilter, setActionFilter] = useState('All Actions')
  const [bizFilter, setBizFilter] = useState('All Businesses')

  const rows = filtered
    .filter(l => actionFilter === 'All Actions' || l.action === actionFilter)
    .filter(l => bizFilter === 'All Businesses' || l.business_name === bizFilter)

  return (
    <div className="page-pad fade-up">
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Track every system action for safety and accountability.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => toast('Logs exported')}>
          <Icon name="upload" size={16} /> Export CSV
        </button>
      </div>

      <Card pad={false}>
        <div style={{ display: 'flex', gap: 10, padding: 16, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div className="input-wrap" style={{ flex: 1, minWidth: 220 }}>
            <span className="input-icon"><Icon name="search" size={16} /></span>
            <input
              className="input has-icon"
              placeholder="Search by actor, action, or details..."
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{ height: 40 }}
            />
          </div>
          <select
            className="input"
            style={{ height: 40, width: 180 }}
            value={bizFilter}
            onChange={e => setBizFilter(e.target.value)}
          >
            {businesses.map(b => <option key={b}>{b}</option>)}
          </select>
          <select
            className="input"
            style={{ height: 40, width: 200 }}
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
          >
            {actions.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ padding: '32px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="spinner" />
            <span className="muted" style={{ fontSize: 14 }}>Loading audit logs…</span>
          </div>
        ) : isMobile ? (
          rows.length === 0 ? (
            <EmptyState icon="fileText" title="No log entries" text="No activity matches your filters." />
          ) : (
            <div className="mcard-list" style={{ padding: 14 }}>
              {rows.map(a => {
                const s = getStyle(a.action)
                const detail = detailsSummary(a.details)
                return (
                  <div key={a.id} className="mcard" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch' }}>
                    <div className="mcard-row">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 26, height: 26, borderRadius: 7, background: `var(--${s.color}-bg, var(--muted-bg))`, color: `var(--${s.color}, var(--text-muted))`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name={s.icon} size={13} />
                        </span>
                        <span className="strong" style={{ fontSize: 13.5 }}>{actionLabel(a.action)}</span>
                      </span>
                      <span className="muted" style={{ fontSize: 11.5, flexShrink: 0 }}>{formatTs(a.created_at)}</span>
                    </div>
                    {detail && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{detail}</div>}
                    <div className="mcard-meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {a.actor_email === 'System' ? <Icon name="zap" size={13} /> : <Avatar name={a.actor_email} size={18} />}
                        {a.actor_email}
                      </span>
                      {a.business_name !== '—' && <span>{a.business_name}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>{['Timestamp', 'Actor', 'Business', 'Action', 'Details'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={5}><EmptyState icon="fileText" title="No log entries" text="No activity matches your filters." /></td></tr>
                ) : rows.map(a => {
                  const s = getStyle(a.action)
                  const detail = detailsSummary(a.details)
                  return (
                    <tr key={a.id}>
                      <td className="tabnum" style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: 12 }}>{formatTs(a.created_at)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          {a.actor_email === 'System'
                            ? <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--muted-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="zap" size={14} style={{ color: 'var(--text-muted)' }} /></div>
                            : <Avatar name={a.actor_email} size={28} />}
                          <div className="strong" style={{ fontSize: 13 }}>{a.actor_email}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{a.business_name}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ width: 24, height: 24, borderRadius: 7, background: `var(--${s.color}-bg, var(--muted-bg))`, color: `var(--${s.color}, var(--text-muted))`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon name={s.icon} size={13} />
                          </span>
                          <span className="strong" style={{ fontSize: 13 }}>{actionLabel(a.action)}</span>
                        </span>
                      </td>
                      <td style={{ maxWidth: 260, fontSize: 13, color: 'var(--text-secondary)' }}>{detail || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '8px 18px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="muted" style={{ fontSize: 13 }}>Showing {rows.length} of {logs.length} events</span>
        </div>
      </Card>
    </div>
  )
}
