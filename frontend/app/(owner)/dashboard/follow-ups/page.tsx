'use client'

import { useState } from 'react'
import { Icon, StatCard, Card, Badge, Avatar, Tabs, EmptyState, toast, useIsMobile } from '@/components/ui'
import { FOLLOWUPS, type MockFollowup } from '@/lib/data/mock'

const DUE_BADGE: Record<string, string> = {
  due: 'badge-blue', scheduled: 'badge-gray', overdue: 'badge-red', sent: 'badge-green',
}

export default function FollowUpsPage() {
  const [tab, setTab] = useState('due')
  const isMobile = useIsMobile(720)

  const counts = { due: 0, scheduled: 0, sent: 0, overdue: 0 }
  FOLLOWUPS.forEach(f => counts[f.state as keyof typeof counts]++)
  const sentWeek = FOLLOWUPS.filter(f => f.state === 'sent').length + 9

  const kpis = [
    { icon: 'calendarClock', label: 'Due Today', value: String(counts.due), accent: '#2563EB' },
    { icon: 'calendar', label: 'Scheduled', value: String(counts.scheduled), accent: '#0891B2' },
    { icon: 'send', label: 'Sent This Week', value: String(sentWeek), accent: '#059669' },
    { icon: 'clock', label: 'Overdue', value: String(counts.overdue), accent: '#DC2626' },
  ]

  const tabList = [
    { value: 'due', label: 'Due Today', count: counts.due },
    { value: 'scheduled', label: 'Scheduled', count: counts.scheduled },
    { value: 'overdue', label: 'Overdue', count: counts.overdue },
    { value: 'sent', label: 'Sent', count: counts.sent },
  ]

  const rows = FOLLOWUPS.filter(f => f.state === tab)

  return (
    <div className="page-pad fade-up">
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Follow-ups</h1>
          <p className="page-subtitle">Stay on top of leads that need your attention.</p>
        </div>
        <button className="btn btn-secondary" style={{ gap: 10 }}>
          <Icon name="calendar" size={17} style={{ color: 'var(--text-muted)' }} />
          May 12 – May 18, 2025
          <Icon name="chevDown" size={15} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 22 }}>
        {kpis.map((k, i) => <StatCard key={i} {...k} />)}
      </div>

      <Card pad={false}>
        <div style={{ padding: '16px 20px' }}>
          <Tabs tabs={tabList} active={tab} onChange={setTab} />
        </div>
        <div className="divider-h" />
        {rows.length === 0 ? (
          <EmptyState icon="checkCircle" title="All caught up!" text="No follow-ups in this category right now." />
        ) : isMobile ? (
          <MobileCards rows={rows} tab={tab} />
        ) : (
          <DesktopTable rows={rows} tab={tab} />
        )}
      </Card>
    </div>
  )
}

function MobileCards({ rows, tab }: { rows: MockFollowup[]; tab: string }) {
  return (
    <div className="mcard-list" style={{ padding: 16 }}>
      {rows.map(f => (
        <div key={f.id} className="mcard" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="mcard-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <Avatar name={f.name} initials={f.initials} size={36} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }} className="trunc">{f.name}</div>
                <div className="muted" style={{ fontSize: 12.5 }}>{f.service}</div>
              </div>
            </div>
            <Badge dot={false}>{f.status}</Badge>
          </div>
          <div className="mcard-meta">
            <span><span className="k">Last: </span>{f.last}</span>
            <span><span className="k">Due: </span><span className={'badge ' + DUE_BADGE[f.state]} style={{ height: 20 }}><span className="dot" />{f.due}</span></span>
          </div>
          <div className="mcard-actions">
            {tab === 'sent' ? (
              <button className="btn btn-secondary btn-sm btn-block">Open Lead</button>
            ) : (
              <>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => toast('Follow-up rescheduled')}>Reschedule</button>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => toast('Follow-up sent')}>
                  <Icon name="send" size={15} /> Send
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function DesktopTable({ rows, tab }: { rows: MockFollowup[]; tab: string }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead><tr>{['Customer', 'Service', 'Status', 'Last Contact', 'Follow-up Due', ''].map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map(f => (
            <tr key={f.id}>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><Avatar name={f.name} initials={f.initials} size={34} /><span className="strong">{f.name}</span></div></td>
              <td>{f.service}</td>
              <td><Badge>{f.status}</Badge></td>
              <td className="tabnum">{f.last}</td>
              <td><span className={'badge ' + DUE_BADGE[f.state]}><span className="dot" />{f.due}</span></td>
              <td>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {tab === 'sent' ? (
                    <button className="btn btn-secondary btn-xs">Open Lead</button>
                  ) : (
                    <>
                      <button className="btn btn-secondary btn-xs" onClick={() => toast('Follow-up rescheduled')}>Reschedule</button>
                      <button className="btn btn-primary btn-xs" onClick={() => toast('Follow-up sent')}>
                        <Icon name="send" size={14} /> Send
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
  )
}
