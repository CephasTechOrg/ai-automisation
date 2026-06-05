'use client'

import { useState } from 'react'
import { Icon, Badge, Avatar, Card, Select, Menu, EmptyState, toast, useIsMobile } from '@/components/ui'
import { LEADS, type MockLead } from '@/lib/data/mock'

const TL_ICON: Record<string, { icon: string; color: string }> = {
  received: { icon: 'users', color: 'var(--primary)' },
  email: { icon: 'mail', color: 'var(--text-muted)' },
  scheduled: { icon: 'clock', color: 'var(--amber)' },
  contacted: { icon: 'phone', color: 'var(--green)' },
  booked: { icon: 'checkCircle', color: 'var(--green)' },
  lost: { icon: 'xCircle', color: 'var(--red)' },
  note: { icon: 'note', color: 'var(--text-muted)' },
}

function MiniStat({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div className="mini-stat">
      <div className="mini-stat-label">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span className="mini-stat-value tabnum">{value}</span>
        {trend && <span className="mini-stat-trend">{trend}</span>}
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState(LEADS)
  const [selId, setSelId] = useState(LEADS[0].id)
  const [statusF, setStatusF] = useState('All Statuses')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('Newest First')
  const [mobileDetail, setMobileDetail] = useState(false)

  const sel = leads.find(l => l.id === selId) || leads[0]

  let filtered = leads.filter(l =>
    (statusF === 'All Statuses' || l.status === statusF) &&
    (l.name.toLowerCase().includes(q.toLowerCase()) || l.service.toLowerCase().includes(q.toLowerCase()))
  )
  if (sort === 'Oldest First') filtered = [...filtered].reverse()
  if (sort === 'Highest Intent') filtered = [...filtered].sort((a, b) =>
    ({ High: 0, Medium: 1, Low: 2 }[a.intent]! - { High: 0, Medium: 1, Low: 2 }[b.intent]!)
  )

  function setStatus(id: string, status: string) {
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l))
    toast('Marked as ' + status)
  }
  function selectLead(id: string) {
    setSelId(id)
    setMobileDetail(true)
    setLeads(ls => ls.map(l => l.id === id ? { ...l, unread: false } : l))
  }

  return (
    <div className="page-pad fade-up">
      <div className={'crm-head' + (mobileDetail ? ' mobile-hidden' : '')}>
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">Which leads need you today?</p>
        </div>
        <div className="crm-minis">
          <MiniStat label="New" value="12" trend="+5 today" />
          <MiniStat label="Follow-ups" value="3" />
          <MiniStat label="Booked" value="32" />
          <MiniStat label="Response rate" value="94%" />
        </div>
      </div>

      <div className="crm-grid">
        {/* Left — list */}
        <div className={'crm-list' + (mobileDetail ? ' mobile-hidden' : '')}>
          <div className="lead-filters">
            <div className="input-wrap" style={{ flex: 1, minWidth: 0 }}>
              <span className="input-icon"><Icon name="search" size={16} /></span>
              <input className="input has-icon" placeholder="Search leads..." value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div style={{ width: 132, flexShrink: 0 }}>
              <Select options={['All Statuses', 'New', 'Contacted', 'Booked', 'Follow-up', 'Lost']} value={statusF} onChange={setStatusF} />
            </div>
            <Menu
              trigger={<button className="btn btn-secondary btn-icon" title="More filters"><Icon name="sliders" size={17} /></button>}
              items={[
                { icon: 'calendar', label: 'Date range' },
                { icon: 'filter', label: 'High intent only' },
                { icon: 'mail', label: 'Unread only' },
                { icon: 'clock', label: 'Due for follow-up' },
                { divider: true },
                ...(['Newest First', 'Oldest First', 'Highest Intent'] as const).map(s => ({
                  icon: sort === s ? 'check' : 'chevDown',
                  label: 'Sort: ' + s,
                  onClick: () => setSort(s),
                })),
              ]}
            />
          </div>
          <div className="lead-list-scroll">
            {filtered.length === 0 ? (
              <EmptyState icon="inbox" title="No leads yet" text="Share your public form link to start capturing customer requests." />
            ) : (
              filtered.map(l => (
                <button key={l.id} className={'lead-item' + (l.id === selId ? ' active' : '')} onClick={() => selectLead(l.id)}>
                  <Avatar name={l.name} initials={l.initials} size={38} />
                  <div className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
                    <div className="between" style={{ gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                        {l.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
                        <span className="trunc">{l.name}</span>
                      </span>
                      <span className="muted" style={{ fontSize: 12, flexShrink: 0 }}>{l.time}</span>
                    </div>
                    <div className="between" style={{ marginTop: 5, gap: 8 }}>
                      <span className="muted trunc" style={{ fontSize: 13 }}>{l.service}</span>
                      <Badge dot={false}>{l.status}</Badge>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          {filtered.length > 0 && (
            <div className="helper" style={{ marginTop: 12, textAlign: 'center' }}>Showing {filtered.length} of {leads.length} leads</div>
          )}
        </div>

        {/* Right — detail */}
        <div className={'crm-detail' + (mobileDetail ? ' mobile-show' : '')}>
          <LeadDetail key={sel.id} lead={sel} setStatus={setStatus} onBack={() => setMobileDetail(false)} />
        </div>
      </div>
    </div>
  )
}

function LeadDetail({ lead, setStatus, onBack }: { lead: MockLead; setStatus: (id: string, s: string) => void; onBack: () => void }) {
  const [tab, setTab] = useState('overview')
  const [reply, setReply] = useState('')
  const isMobile = useIsMobile(980)
  const replyText = reply || lead.reply

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'messages', label: 'Messages' },
    { id: 'ai', label: 'AI', dot: true },
    { id: 'timeline', label: 'Timeline' },
  ]

  const moreItems = [
    { icon: 'xCircle', label: 'Mark Lost', onClick: () => setStatus(lead.id, 'Lost') },
    { icon: 'send', label: 'Send Follow-up', onClick: () => toast('Follow-up scheduled') },
    { icon: 'note', label: 'Add Note', onClick: () => toast('Note added') },
    { divider: true },
    { icon: 'copy', label: 'Copy Details', onClick: () => toast('Details copied') },
    { icon: 'trash', label: 'Archive', danger: true, onClick: () => toast('Lead archived') },
  ]

  return (
    <div className="lead-detail">
      <div className="ld-head">
        <button className="icon-btn crm-back" onClick={onBack}><Icon name="chevLeft" size={20} /></button>
        <Avatar name={lead.name} initials={lead.initials} size={46} />
        <div className="grow" style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em' }}>{lead.name}</span>
            <Badge>{lead.status}</Badge>
          </div>
          <div className="muted trunc" style={{ fontSize: 13, marginTop: 3 }}>{lead.service} · {lead.value}</div>
        </div>
        <Menu align="right" trigger={<button className="btn btn-secondary btn-icon btn-sm"><Icon name="more" size={18} /></button>} items={moreItems} />
      </div>

      {/* Next Best Action */}
      <div className="nba-card">
        <div className="nba-ic"><Icon name="target" size={18} /></div>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="nba-label">Next best action</div>
          <div className="nba-text">{lead.nextStep}</div>
        </div>
        <button className="btn btn-primary btn-sm nba-btn" onClick={() => setTab('messages')}>
          Reply <Icon name="arrowRight" size={15} />
        </button>
      </div>

      {/* Tabs */}
      <div className="ld-tabs">
        {tabs.map(t => (
          <button key={t.id} className={'ld-tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
            {t.label}
            {t.dot && <span className="ld-tab-dot" />}
          </button>
        ))}
      </div>

      <div className="ld-tabpane">
        {tab === 'overview' && <OverviewTab lead={lead} onReview={() => setTab('ai')} />}
        {tab === 'messages' && <MessagesTab lead={lead} reply={replyText} setReply={setReply} onReview={() => setTab('ai')} />}
        {tab === 'ai' && <AITab lead={lead} reply={replyText} setReply={setReply} />}
        {tab === 'timeline' && <TimelineTab lead={lead} />}
      </div>

      {!isMobile && (
        <div className="ld-actions">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setTab('messages')}><Icon name="message" size={16} /> Reply</button>
          <button className="btn btn-secondary" onClick={() => setStatus(lead.id, 'Contacted')}><Icon name="phone" size={16} /> Mark Contacted</button>
          <button className="btn btn-secondary" onClick={() => setStatus(lead.id, 'Booked')}><Icon name="checkCircle" size={16} /> Booked</button>
        </div>
      )}

      {isMobile && (
        <div className="ld-actionbar">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setTab('messages')}><Icon name="message" size={16} /> Reply</button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStatus(lead.id, 'Booked')}>Booked</button>
          <Menu align="right" trigger={<button className="btn btn-secondary btn-icon"><Icon name="more" size={18} /></button>} items={moreItems} />
        </div>
      )}
    </div>
  )
}

function OverviewTab({ lead, onReview }: { lead: MockLead; onReview: () => void }) {
  const intTone = { High: 'green', Medium: 'amber', Low: 'gray' } as const
  const urgTone = { High: 'red', Medium: 'amber', Low: 'gray' } as const
  const details = [
    ['Email', lead.email], ['Phone', lead.phone], ['Location', lead.location],
    ['Lead source', lead.source], ['Received', lead.received + ' · ' + lead.time], ['Estimated value', lead.value],
  ]
  return (
    <div className="tabpane-stack">
      <section>
        <div className="sec-label">Original request</div>
        <p className="req-quote">{lead.message}</p>
      </section>
      <section>
        <div className="sec-label" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Icon name="sparkles" size={14} style={{ color: 'var(--primary)' }} /> AI summary
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{lead.summary}</p>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className="sec-meta-k">Intent</span>
            <Badge tone={intTone[lead.intent]}>{lead.intent}</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className="sec-meta-k">Urgency</span>
            <Badge tone={urgTone[lead.urgency]}>{lead.urgency}</Badge>
          </div>
        </div>
      </section>
      <button className="ai-teaser" onClick={onReview}>
        <div className="ai-teaser-ic"><Icon name="sparkles" size={16} /></div>
        <div className="grow" style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>Suggested reply ready</div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 1 }}>AI drafted a response for you to review</div>
        </div>
        <span className="btn btn-secondary btn-xs" style={{ flexShrink: 0 }}>Review Reply</span>
      </button>
      <section>
        <div className="sec-label">Details</div>
        <div className="meta-grid">
          {details.map((c, i) => (
            <div key={i} className="meta-row">
              <span className="meta-k">{c[0]}</span>
              <span className="meta-v">{c[1]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function MessagesTab({ lead, reply, setReply, onReview }: { lead: MockLead; reply: string; setReply: (v: string) => void; onReview: () => void }) {
  const thread = [
    { kind: 'customer', text: lead.message, time: lead.received + ' · ' + lead.time },
    { kind: 'auto', text: "Thanks for reaching out! We've received your request and will be in touch shortly.", time: lead.received },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="ld-thread">
        {thread.map((m, i) => (
          <div key={i} className={'ld-msg ' + m.kind}>
            <div className="ld-msg-label">{m.kind === 'customer' ? 'Customer Message' : 'Auto Reply'}</div>
            <div className={'ld-msg-bubble ' + m.kind}>{m.text}</div>
            <div className="ld-msg-time">{m.time}</div>
          </div>
        ))}
      </div>
      <div className="ai-teaser" style={{ cursor: 'pointer' }} onClick={onReview}>
        <div className="ai-teaser-ic"><Icon name="sparkles" size={16} /></div>
        <div className="grow" style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>AI reply suggestion available</div>
        </div>
        <span className="btn btn-secondary btn-xs" style={{ flexShrink: 0 }}>Review</span>
      </div>
      <div className="ld-composer">
        <textarea className="textarea" placeholder="Write a reply…" value={reply} onChange={e => setReply(e.target.value)} style={{ minHeight: 90 }} />
        <div className="between" style={{ marginTop: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={onReview}><Icon name="sparkles" size={15} /> Use AI draft</button>
          <button className="btn btn-primary btn-sm" onClick={() => toast('Reply sent to ' + lead.name.split(' ')[0])}>
            <Icon name="send" size={15} /> Send Reply
          </button>
        </div>
      </div>
    </div>
  )
}

function AITab({ lead, reply, setReply }: { lead: MockLead; reply: string; setReply: (v: string) => void }) {
  const intTone = { High: 'green', Medium: 'amber', Low: 'gray' } as const
  const urgTone = { High: 'red', Medium: 'amber', Low: 'gray' } as const
  return (
    <div className="tabpane-stack">
      <div className="ai-states">
        <span className="ai-state done"><Icon name="check" size={12} /> Auto-reply sent</span>
        <span className="ai-state pending"><Icon name="sparkles" size={12} /> Draft awaiting approval</span>
      </div>
      <section>
        <div className="sec-label">Summary</div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{lead.summary}</p>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className="sec-meta-k">Intent</span>
            <Badge tone={intTone[lead.intent]}>{lead.intent}</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className="sec-meta-k">Urgency</span>
            <Badge tone={urgTone[lead.urgency]}>{lead.urgency}</Badge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
          {lead.tags.map((t, i) => (
            <span key={i} className="tag" style={{ fontSize: 12, height: 24, background: 'var(--primary-50)', color: 'var(--primary)', borderColor: 'var(--info-border)' }}>{t}</span>
          ))}
        </div>
      </section>
      <section>
        <div className="sec-label">Recommended next step</div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{lead.nextStep}</p>
      </section>
      <section>
        <div className="sec-label">Suggested reply</div>
        <textarea className="textarea" value={reply} onChange={e => setReply(e.target.value)} style={{ minHeight: 150, fontSize: 13.5, background: 'var(--muted-bg-2)' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => toast('Reply sent to ' + lead.name.split(' ')[0])}>
            <Icon name="send" size={16} /> Approve &amp; Send
          </button>
          <button className="btn btn-secondary btn-icon" title="Copy" onClick={() => toast('Copied to clipboard')}><Icon name="copy" size={17} /></button>
          <button className="btn btn-secondary btn-icon" title="Regenerate" onClick={() => toast('Regenerating reply…')}><Icon name="refresh" size={17} /></button>
        </div>
        <div className="helper" style={{ marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <Icon name="shield" size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          AI only auto-sends the acknowledgement email. Important replies are drafted for you to review and send.
        </div>
      </section>
    </div>
  )
}

function TimelineTab({ lead }: { lead: MockLead }) {
  return (
    <div className="timeline" style={{ paddingTop: 4 }}>
      {lead.timeline.map((t, i) => {
        const m = TL_ICON[t.type] || TL_ICON.note
        return (
          <div key={i} className="tl-item">
            <div className="tl-dot" style={{ color: m.color, borderColor: m.color }}>
              <Icon name={m.icon} size={13} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t.title}</div>
              <div className="muted tabnum" style={{ fontSize: 12.5, marginTop: 2 }}>{t.date} · {t.time}</div>
            </div>
          </div>
        )
      })}
      <div className="tl-item">
        <div className="tl-dot" style={{ color: 'var(--text-disabled)', borderColor: 'var(--border)', borderStyle: 'dashed' }}>
          <Icon name="plus" size={13} />
        </div>
        <button className="btn btn-ghost btn-xs" style={{ paddingLeft: 0 }} onClick={() => toast('Note added')}>
          Add note or activity
        </button>
      </div>
    </div>
  )
}
