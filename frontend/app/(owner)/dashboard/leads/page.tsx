'use client'

import { useState, useEffect, useCallback } from 'react'
import { Icon, Badge, Avatar, Select, Menu, EmptyState, toast, useIsMobile } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

/* ── API shape ──────────────────────────────────────────── */
interface LeadRead {
  id: string
  business_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  service_needed: string | null
  preferred_time: string | null
  message: string | null
  status: string
  source: string
  created_at: string
}

/* ── UI shape (superset of LeadRead + optional AI fields) ─ */
interface UILead extends LeadRead {
  displayStatus: string
  initials: string
  timeAgo: string
  summary: string | null
  intent: string | null
  urgency: string | null
  tags: string[]
  nextStep: string | null
  suggestedReply: string | null
  unread: boolean
}

/* ── Helpers ────────────────────────────────────────────── */
const STATUS_DISPLAY: Record<string, string> = {
  new: 'New', contacted: 'Contacted', booked: 'Booked',
  follow_up: 'Follow-up', lost: 'Lost', archived: 'Archived',
}
const DISPLAY_TO_API: Record<string, string> = {
  New: 'new', Contacted: 'contacted', Booked: 'booked',
  'Follow-up': 'follow_up', Lost: 'lost', Archived: 'archived',
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
}

function timeAgo(isoStr: string) {
  const diff = Date.now() - new Date(isoStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function toUILead(l: LeadRead): UILead {
  return {
    ...l,
    displayStatus: STATUS_DISPLAY[l.status] ?? l.status,
    initials: initials(l.customer_name).toUpperCase(),
    timeAgo: timeAgo(l.created_at),
    summary: null, intent: null, urgency: null,
    tags: [], nextStep: null, suggestedReply: null,
    unread: l.status === 'new',
  }
}

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

/* ─────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */
export default function LeadsPage() {
  const token = useApiToken()
  const [leads, setLeads] = useState<UILead[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [selId, setSelId] = useState<string | null>(null)
  const [statusF, setStatusF] = useState('All Statuses')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('Newest First')
  const [mobileDetail, setMobileDetail] = useState(false)

  const fetchLeads = useCallback(async (t: string) => {
    setLoading(true)
    setFetchError(false)
    try {
      const res = await api.get<{ ok: boolean; data: LeadRead[] }>('/owner/leads', t)
      const mapped = (res.data ?? []).map(toUILead)
      setLeads(mapped)
      if (mapped.length && !selId) setSelId(mapped[0].id)
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }, [selId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (token) fetchLeads(token)
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const sel = leads.find(l => l.id === selId) ?? leads[0] ?? null

  let filtered = leads.filter(l =>
    (statusF === 'All Statuses' || l.displayStatus === statusF) &&
    (l.customer_name.toLowerCase().includes(q.toLowerCase()) ||
     (l.service_needed ?? '').toLowerCase().includes(q.toLowerCase()))
  )
  if (sort === 'Oldest First') filtered = [...filtered].reverse()

  const counts = {
    new: leads.filter(l => l.status === 'new').length,
    followUp: leads.filter(l => l.status === 'follow_up').length,
    booked: leads.filter(l => l.status === 'booked').length,
  }

  async function setStatus(id: string, displayStatus: string) {
    if (!token) return
    const apiStatus = DISPLAY_TO_API[displayStatus] ?? displayStatus.toLowerCase()
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status: apiStatus, displayStatus } : l))
    try {
      await api.patch(`/owner/leads/${id}/status`, { status: apiStatus }, token)
      toast('Marked as ' + displayStatus)
    } catch {
      if (token) fetchLeads(token)
      toast('Failed to update status')
    }
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
          <MiniStat label="New" value={String(counts.new)} />
          <MiniStat label="Follow-ups" value={String(counts.followUp)} />
          <MiniStat label="Booked" value={String(counts.booked)} />
          <MiniStat label="Total" value={String(leads.length)} />
        </div>
      </div>

      <div className="crm-grid">
        {/* Left */}
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
              trigger={<button className="btn btn-secondary btn-icon" title="Sort"><Icon name="sliders" size={17} /></button>}
              items={(['Newest First', 'Oldest First'] as const).map(s => ({
                icon: sort === s ? 'check' : 'chevDown',
                label: 'Sort: ' + s,
                onClick: () => setSort(s),
              }))}
            />
          </div>

          <div className="lead-list-scroll">
            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }} />
                <div className="muted" style={{ fontSize: 14 }}>Loading leads…</div>
              </div>
            ) : fetchError ? (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <EmptyState icon="alert" title="Failed to load leads" text="Check your connection and try again." />
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => token && fetchLeads(token)}>Retry</button>
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState icon="inbox" title="No leads yet" text="Share your public form link to start capturing customer requests." />
            ) : (
              filtered.map(l => (
                <button key={l.id} className={'lead-item' + (l.id === selId ? ' active' : '')} onClick={() => selectLead(l.id)}>
                  <Avatar name={l.customer_name} initials={l.initials} size={38} />
                  <div className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
                    <div className="between" style={{ gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                        {l.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
                        <span className="trunc">{l.customer_name}</span>
                      </span>
                      <span className="muted" style={{ fontSize: 12, flexShrink: 0 }}>{l.timeAgo}</span>
                    </div>
                    <div className="between" style={{ marginTop: 5, gap: 8 }}>
                      <span className="muted trunc" style={{ fontSize: 13 }}>{l.service_needed ?? '—'}</span>
                      <Badge dot={false}>{l.displayStatus}</Badge>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          {!loading && filtered.length > 0 && (
            <div className="helper" style={{ marginTop: 12, textAlign: 'center' }}>Showing {filtered.length} of {leads.length} leads</div>
          )}
        </div>

        {/* Right */}
        <div className={'crm-detail' + (mobileDetail ? ' mobile-show' : '')}>
          {sel ? (
            <LeadDetail key={sel.id} lead={sel} setStatus={setStatus} onBack={() => setMobileDetail(false)} />
          ) : !loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <EmptyState icon="users" title="Select a lead" text="Pick a lead from the list to view details." />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Lead detail panel
───────────────────────────────────────────────────────── */
function LeadDetail({ lead, setStatus, onBack }: { lead: UILead; setStatus: (id: string, s: string) => void; onBack: () => void }) {
  const [tab, setTab] = useState('overview')
  const [reply, setReply] = useState('')
  const isMobile = useIsMobile(980)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'messages', label: 'Messages' },
    { id: 'ai', label: 'AI', dot: !!lead.suggestedReply },
    { id: 'timeline', label: 'Timeline' },
  ]

  const moreItems = [
    { icon: 'xCircle', label: 'Mark Lost', onClick: () => setStatus(lead.id, 'Lost') },
    { icon: 'send', label: 'Send Follow-up', onClick: () => toast('Follow-up scheduled') },
    { icon: 'note', label: 'Add Note', onClick: () => toast('Note added') },
    { divider: true },
    { icon: 'copy', label: 'Copy Details', onClick: () => toast('Details copied') },
    { icon: 'trash', label: 'Archive', danger: true, onClick: () => setStatus(lead.id, 'Archived') },
  ]

  return (
    <div className="lead-detail">
      <div className="ld-head">
        <button className="icon-btn crm-back" onClick={onBack}><Icon name="chevLeft" size={20} /></button>
        <Avatar name={lead.customer_name} initials={lead.initials} size={46} />
        <div className="grow" style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em' }}>{lead.customer_name}</span>
            <Badge>{lead.displayStatus}</Badge>
          </div>
          <div className="muted trunc" style={{ fontSize: 13, marginTop: 3 }}>
            {lead.service_needed ?? 'General inquiry'} · {lead.timeAgo}
          </div>
        </div>
        <Menu align="right" trigger={<button className="btn btn-secondary btn-icon btn-sm"><Icon name="more" size={18} /></button>} items={moreItems} />
      </div>

      {lead.nextStep && (
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
      )}

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
        {tab === 'messages' && <MessagesTab lead={lead} reply={reply} setReply={setReply} onReview={() => setTab('ai')} />}
        {tab === 'ai' && <AITab lead={lead} reply={reply || lead.suggestedReply || ''} setReply={setReply} />}
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

function OverviewTab({ lead, onReview }: { lead: UILead; onReview: () => void }) {
  const receivedDate = new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const details: [string, string][] = [
    ['Email', lead.customer_email ?? '—'],
    ['Phone', lead.customer_phone ?? '—'],
    ['Service', lead.service_needed ?? '—'],
    ['Preferred time', lead.preferred_time ?? '—'],
    ['Lead source', lead.source],
    ['Received', receivedDate],
  ]
  return (
    <div className="tabpane-stack">
      <section>
        <div className="sec-label">Original request</div>
        <p className="req-quote">{lead.message ?? 'No message provided.'}</p>
      </section>
      {lead.summary && (
        <section>
          <div className="sec-label" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="sparkles" size={14} style={{ color: 'var(--primary)' }} /> AI summary
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{lead.summary}</p>
          {(lead.intent || lead.urgency) && (
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {lead.intent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className="sec-meta-k">Intent</span>
                  <Badge tone={lead.intent === 'High' ? 'green' : lead.intent === 'Medium' ? 'amber' : 'gray'}>{lead.intent}</Badge>
                </div>
              )}
              {lead.urgency && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className="sec-meta-k">Urgency</span>
                  <Badge tone={lead.urgency === 'High' ? 'red' : lead.urgency === 'Medium' ? 'amber' : 'gray'}>{lead.urgency}</Badge>
                </div>
              )}
            </div>
          )}
        </section>
      )}
      {lead.suggestedReply && (
        <button className="ai-teaser" onClick={onReview}>
          <div className="ai-teaser-ic"><Icon name="sparkles" size={16} /></div>
          <div className="grow" style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>Suggested reply ready</div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 1 }}>AI drafted a response for you to review</div>
          </div>
          <span className="btn btn-secondary btn-xs" style={{ flexShrink: 0 }}>Review Reply</span>
        </button>
      )}
      <section>
        <div className="sec-label">Details</div>
        <div className="meta-grid">
          {details.map(([k, v], i) => (
            <div key={i} className="meta-row">
              <span className="meta-k">{k}</span>
              <span className="meta-v">{v}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function MessagesTab({ lead, reply, setReply, onReview }: { lead: UILead; reply: string; setReply: (v: string) => void; onReview: () => void }) {
  const thread = [
    { kind: 'customer', text: lead.message ?? '(no message)', time: new Date(lead.created_at).toLocaleString() },
    { kind: 'auto', text: "Thanks for reaching out! We've received your request and will be in touch shortly.", time: new Date(lead.created_at).toLocaleString() },
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
      {lead.suggestedReply && (
        <div className="ai-teaser" style={{ cursor: 'pointer' }} onClick={onReview}>
          <div className="ai-teaser-ic"><Icon name="sparkles" size={16} /></div>
          <div className="grow" style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>AI reply suggestion available</div>
          </div>
          <span className="btn btn-secondary btn-xs" style={{ flexShrink: 0 }}>Review</span>
        </div>
      )}
      <div className="ld-composer">
        <textarea className="textarea" placeholder="Write a reply…" value={reply} onChange={e => setReply(e.target.value)} style={{ minHeight: 90 }} />
        <div className="between" style={{ marginTop: 10 }}>
          {lead.suggestedReply && (
            <button className="btn btn-ghost btn-sm" onClick={onReview}><Icon name="sparkles" size={15} /> Use AI draft</button>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-primary btn-sm" onClick={() => toast('Reply sent to ' + lead.customer_name.split(' ')[0])}>
              <Icon name="send" size={15} /> Send Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AITab({ lead, reply, setReply }: { lead: UILead; reply: string; setReply: (v: string) => void }) {
  return (
    <div className="tabpane-stack">
      {lead.summary || lead.suggestedReply ? (
        <>
          <div className="ai-states">
            <span className="ai-state done"><Icon name="check" size={12} /> Auto-reply sent</span>
            {lead.suggestedReply && <span className="ai-state pending"><Icon name="sparkles" size={12} /> Draft awaiting approval</span>}
          </div>
          {lead.summary && (
            <section>
              <div className="sec-label">Summary</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{lead.summary}</p>
              {(lead.intent || lead.urgency) && (
                <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                  {lead.intent && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span className="sec-meta-k">Intent</span>
                      <Badge tone={lead.intent === 'High' ? 'green' : lead.intent === 'Medium' ? 'amber' : 'gray'}>{lead.intent}</Badge>
                    </div>
                  )}
                  {lead.urgency && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span className="sec-meta-k">Urgency</span>
                      <Badge tone={lead.urgency === 'High' ? 'red' : lead.urgency === 'Medium' ? 'amber' : 'gray'}>{lead.urgency}</Badge>
                    </div>
                  )}
                </div>
              )}
              {lead.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
                  {lead.tags.map((t, i) => (
                    <span key={i} className="tag" style={{ fontSize: 12, height: 24, background: 'var(--primary-50)', color: 'var(--primary)', borderColor: 'var(--info-border)' }}>{t}</span>
                  ))}
                </div>
              )}
            </section>
          )}
          {lead.nextStep && (
            <section>
              <div className="sec-label">Recommended next step</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{lead.nextStep}</p>
            </section>
          )}
          {lead.suggestedReply && (
            <section>
              <div className="sec-label">Suggested reply</div>
              <textarea className="textarea" value={reply} onChange={e => setReply(e.target.value)} style={{ minHeight: 150, fontSize: 13.5, background: 'var(--muted-bg-2)' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => toast('Reply sent to ' + lead.customer_name.split(' ')[0])}>
                  <Icon name="send" size={16} /> Approve &amp; Send
                </button>
                <button className="btn btn-secondary btn-icon" title="Copy" onClick={() => toast('Copied to clipboard')}><Icon name="copy" size={17} /></button>
                <button className="btn btn-secondary btn-icon" title="Regenerate" onClick={() => toast('Regenerating reply…')}><Icon name="refresh" size={17} /></button>
              </div>
            </section>
          )}
        </>
      ) : (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Icon name="sparkles" size={22} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>AI analysis pending</div>
          <p className="muted" style={{ fontSize: 13.5, marginTop: 8, maxWidth: 300, margin: '8px auto 0' }}>
            AI insights will appear here once the lead has been processed.
          </p>
        </div>
      )}
      <div className="helper" style={{ marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <Icon name="shield" size={13} style={{ flexShrink: 0, marginTop: 1 }} />
        AI only auto-sends the acknowledgement email. Important replies are drafted for you to review and send.
      </div>
    </div>
  )
}

function TimelineTab({ lead }: { lead: UILead }) {
  const received = new Date(lead.created_at)
  const events = [
    {
      type: 'received',
      title: 'Lead received',
      date: received.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: received.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    },
    {
      type: 'email',
      title: 'Auto-reply sent',
      date: received.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: received.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    },
  ]
  return (
    <div className="timeline" style={{ paddingTop: 4 }}>
      {events.map((t, i) => {
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
