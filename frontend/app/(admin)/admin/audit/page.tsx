'use client'

import { useState } from 'react'
import { Icon, Card, Avatar, Select, Pagination, EmptyState, toast, useIsMobile } from '@/components/ui'
import { AUDIT, type MockAudit } from '@/lib/data/mock'

const TYPE_MAP: Record<string, { c: string; i: string }> = {
  create: { c: 'green', i: 'plus' },
  invite: { c: 'violet', i: 'userPlus' },
  update: { c: 'blue', i: 'edit' },
  read: { c: 'gray', i: 'eye' },
  email: { c: 'blue', i: 'mail' },
  pause: { c: 'amber', i: 'pause' },
}

function toneBg(c: string) {
  if (c === 'gray') return 'var(--muted-bg)'
  if (c === 'blue') return 'var(--info-bg)'
  if (c === 'green') return 'var(--green-bg)'
  if (c === 'amber') return 'var(--amber-bg)'
  return 'var(--violet-bg)'
}
function toneFg(c: string) {
  return c === 'gray' ? 'var(--text-muted)' : `var(--${c})`
}

export default function AdminAuditPage() {
  const [type, setType] = useState('All Actions')
  const [biz, setBiz] = useState('All Businesses')
  const [q, setQ] = useState('')
  const isMobile = useIsMobile(820)

  const actions = ['All Actions', ...Array.from(new Set(AUDIT.map(a => a.action)))]
  const businesses = ['All Businesses', ...Array.from(new Set(AUDIT.map(a => a.business)))]

  const rows: MockAudit[] = AUDIT.filter(a =>
    (type === 'All Actions' || a.action === type) &&
    (biz === 'All Businesses' || a.business === biz) &&
    (a.actor.toLowerCase().includes(q.toLowerCase()) || a.action.toLowerCase().includes(q.toLowerCase()) || a.details.toLowerCase().includes(q.toLowerCase()))
  )

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
            <input className="input has-icon" placeholder="Search by actor, action, or details..." value={q} onChange={e => setQ(e.target.value)} style={{ height: 40 }} />
          </div>
          <div style={{ width: 180 }}>
            <Select options={businesses} value={biz} onChange={setBiz} />
          </div>
          <div style={{ width: 170 }}>
            <Select options={actions} value={type} onChange={setType} />
          </div>
          <button className="btn btn-secondary">
            <Icon name="calendar" size={16} style={{ color: 'var(--text-muted)' }} /> Date range
          </button>
        </div>

        {isMobile ? (
          rows.length === 0 ? (
            <EmptyState icon="fileText" title="No log entries" text="No activity matches your filters." />
          ) : (
            <div className="mcard-list" style={{ padding: 14 }}>
              {rows.map((a, i) => {
                const m = TYPE_MAP[a.type] || TYPE_MAP.read
                return (
                  <div key={i} className="mcard" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch' }}>
                    <div className="mcard-row">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 26, height: 26, borderRadius: 7, background: toneBg(m.c), color: toneFg(m.c), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name={m.i} size={13} />
                        </span>
                        <span className="strong" style={{ fontSize: 13.5 }}>{a.action}</span>
                      </span>
                      <span className="muted" style={{ fontSize: 11.5, flexShrink: 0 }}>{a.ts}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>{a.details}</div>
                    <div className="mcard-meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {a.actor === 'System' ? <Icon name="zap" size={13} /> : <Avatar name={a.actor} size={18} />}
                        {a.actor}
                      </span>
                      <span><span className="k">Business: </span>{a.business}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead><tr>{['Timestamp', 'Actor', 'Business', 'Action', 'Details', 'IP / Device'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon="fileText" title="No log entries" text="No activity matches your filters." /></td></tr>
                ) : rows.map((a, i) => {
                  const m = TYPE_MAP[a.type] || TYPE_MAP.read
                  return (
                    <tr key={i}>
                      <td className="tabnum" style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{a.ts}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          {a.actor === 'System'
                            ? <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--muted-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="zap" size={14} style={{ color: 'var(--text-muted)' }} /></div>
                            : <Avatar name={a.actor} size={28} />}
                          <div>
                            <div className="strong" style={{ fontSize: 13 }}>{a.actor}</div>
                            <div className="muted" style={{ fontSize: 11.5 }}>{a.actorRole}</div>
                          </div>
                        </div>
                      </td>
                      <td>{a.business}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ width: 24, height: 24, borderRadius: 7, background: toneBg(m.c), color: toneFg(m.c), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon name={m.i} size={13} />
                          </span>
                          <span className="strong" style={{ fontSize: 13 }}>{a.action}</span>
                        </span>
                      </td>
                      <td style={{ maxWidth: 240 }}>{a.details}</td>
                      <td className="muted" style={{ fontSize: 12 }}>{a.ip}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '8px 18px 14px' }}>
          <Pagination page={1} pages={4} info={`Showing ${rows.length} of 1,284 events`} onPage={() => {}} />
        </div>
      </Card>
    </div>
  )
}
