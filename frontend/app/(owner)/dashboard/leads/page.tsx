'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Icon, Badge, Avatar, Select, Menu, EmptyState, toast, useIsMobile } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

/* ── API shapes ─────────────────────────────────────────── */
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
  comm_status?: string | null   // ai_replied | owner_replied | acknowledged
}

interface AIData {
  summary?: string
  urgency?: string
  intent?: string
  suggested_reply?: string
  next_step?: string
  tags?: string[]
}

interface MsgItem {
  id: string
  type: string
  direction: string
  content: string
  created_at: string
}

/* ── UI shape ───────────────────────────────────────────── */
interface UILead extends LeadRead {
  displayStatus: string
  initials: string
  timeAgo: string
  unread: boolean
  commStatus: string | null
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
  return `${Math.floor(h / 24)}d ago`
}

function toUILead(l: LeadRead): UILead {
  return {
    ...l,
    displayStatus: STATUS_DISPLAY[l.status] ?? l.status,
    initials: initials(l.customer_name).toUpperCase(),
    timeAgo: timeAgo(l.created_at),
    unread: l.status === 'new',
    commStatus: l.comm_status ?? null,
  }
}

const COMM_CHIP: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  ai_replied:    { icon: 'sparkles', label: 'AI replied',   color: 'var(--green)',      bg: 'var(--green-bg, #F0FDF4)' },
  owner_replied: { icon: 'check',    label: 'You replied',  color: 'var(--primary)',    bg: 'var(--primary-50, #EFF6FF)' },
  acknowledged:  { icon: 'mail',     label: 'Acknowledged', color: 'var(--text-muted)', bg: 'var(--muted-bg)' },
}

function CommChip({ status }: { status: string | null }) {
  const s = status ? COMM_CHIP[status] : null
  if (!s) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, padding: '2px 7px', borderRadius: 20, flexShrink: 0, letterSpacing: '.01em' }}>
      <Icon name={s.icon} size={10} />
      {s.label}
    </span>
  )
}

const TL_ICON: Record<string, { icon: string; color: string }> = {
  received:  { icon: 'users',       color: 'var(--primary)' },
  email:     { icon: 'mail',        color: 'var(--text-muted)' },
  scheduled: { icon: 'clock',       color: 'var(--amber)' },
  contacted: { icon: 'phone',       color: 'var(--green)' },
  booked:    { icon: 'checkCircle', color: 'var(--green)' },
  lost:      { icon: 'xCircle',     color: 'var(--red)' },
  note:      { icon: 'note',        color: 'var(--text-muted)' },
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="mini-stat">
      <div className="mini-stat-label">{label}</div>
      <div className="mini-stat-value tabnum">{value}</div>
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
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
                        <CommChip status={l.commStatus} />
                        <Badge dot={false}>{l.displayStatus}</Badge>
                      </div>
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

        {/* Right — detail */}
        <div className={'crm-detail' + (mobileDetail ? ' mobile-show' : '')}>
          {sel ? (
            <LeadDetail key={sel.id} lead={sel} token={token} setStatus={setStatus} onBack={() => setMobileDetail(false)} />
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
function LeadDetail({ lead, token, setStatus, onBack }: {
  lead: UILead
  token: string | null
  setStatus: (id: string, s: string) => void
  onBack: () => void
}) {
  const [tab, setTab] = useState('overview')
  const [aiData, setAiData] = useState<AIData | null>(null)
  const [autoSent, setAutoSent] = useState(false)
  const isMobile = useIsMobile(980)

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: { lead: LeadRead; ai: AIData | null; auto_sent: boolean } }>(`/owner/leads/${lead.id}`, token)
      .then(r => { setAiData(r.data?.ai ?? null); setAutoSent(r.data?.auto_sent ?? false) })
      .catch(() => {})
  }, [token, lead.id])

  const suggestedReply = aiData?.suggested_reply ?? null

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'messages', label: 'Messages' },
    { id: 'ai', label: 'AI', dot: !!suggestedReply && !autoSent },
    { id: 'timeline', label: 'Timeline' },
  ]

  const moreItems = [
    { icon: 'xCircle', label: 'Mark Lost', onClick: () => setStatus(lead.id, 'Lost') },
    { icon: 'send', label: 'Send Follow-up', onClick: () => toast('Follow-up coming soon') },
    { icon: 'note', label: 'Add Note', onClick: () => toast('Notes coming soon') },
    { divider: true },
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

      {aiData?.next_step && (
        <div className="nba-card">
          <div className="nba-ic"><Icon name="target" size={18} /></div>
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="nba-label">Next best action</div>
            <div className="nba-text">{aiData.next_step}</div>
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
        {tab === 'overview' && <OverviewTab lead={lead} aiData={aiData} autoSent={autoSent} onReview={() => setTab('ai')} />}
        {tab === 'messages' && <MessagesTab lead={lead} token={token} onReview={() => setTab('ai')} />}
        {tab === 'ai' && <AITab lead={lead} token={token} aiData={aiData} autoSent={autoSent} />}
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

/* ─────────────────────────────────────────────────────────
   Overview tab
───────────────────────────────────────────────────────── */
function OverviewTab({ lead, aiData, autoSent, onReview }: { lead: UILead; aiData: AIData | null; autoSent: boolean; onReview: () => void }) {
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

      {aiData?.summary && (
        <section>
          <div className="sec-label" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="sparkles" size={14} style={{ color: 'var(--primary)' }} /> AI summary
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{aiData.summary}</p>
          {(aiData.intent || aiData.urgency) && (
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {aiData.intent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className="sec-meta-k">Intent</span>
                  <Badge>{aiData.intent}</Badge>
                </div>
              )}
              {aiData.urgency && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className="sec-meta-k">Urgency</span>
                  <Badge tone={aiData.urgency === 'high' ? 'red' : aiData.urgency === 'medium' ? 'amber' : 'gray'}>{aiData.urgency}</Badge>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {aiData?.suggested_reply && (
        <button className="ai-teaser" onClick={onReview}>
          <div className="ai-teaser-ic"><Icon name="sparkles" size={16} /></div>
          <div className="grow" style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>
              {autoSent ? 'AI replied to this customer' : 'Suggested reply ready'}
            </div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 1 }}>
              {autoSent ? 'View the personalized reply in the AI tab' : 'AI drafted a response for you to review'}
            </div>
          </div>
          <span className="btn btn-secondary btn-xs" style={{ flexShrink: 0 }}>
            {autoSent ? 'View Reply' : 'Review Reply'}
          </span>
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

/* ─────────────────────────────────────────────────────────
   Messages tab — real API
───────────────────────────────────────────────────────── */
function ThreadBanner({ color, icon, label, content, time }: { color: 'green' | 'amber' | 'gray'; icon: string; label: string; content: string; time: string }) {
  const s = {
    green: { bg: 'var(--green-bg, #F0FDF4)', border: 'var(--green-border, #BBF7D0)', header: 'var(--green, #16A34A)', body: '#166534' },
    amber: { bg: '#FFFBEB', border: '#FDE68A', header: '#92400E', body: '#78350F' },
    gray:  { bg: 'var(--muted-bg)', border: 'var(--border)', header: 'var(--text-muted)', body: 'var(--text-secondary)' },
  }[color]
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ padding: '12px 14px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Icon name={icon} size={13} style={{ color: s.header }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: s.header, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
          <span style={{ fontSize: 11, color: 'var(--text-disabled)', marginLeft: 'auto' }}>{time}</span>
        </div>
        <div style={{ fontSize: 13.5, color: s.body, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{content}</div>
      </div>
    </div>
  )
}

function CustomerBubble({ msg }: { msg: MsgItem }) {
  const time = new Date(msg.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  return (
    <div className="ld-msg customer">
      <div className="ld-msg-label">Customer</div>
      <div className="ld-msg-bubble customer">{msg.content}</div>
      <div className="ld-msg-time">{time}</div>
    </div>
  )
}

function OwnerBubble({ msg }: { msg: MsgItem }) {
  const time = new Date(msg.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  return (
    <div className="ld-msg owner">
      <div className="ld-msg-label">You</div>
      <div className="ld-msg-bubble owner">{msg.content}</div>
      <div className="ld-msg-time">{time}</div>
    </div>
  )
}

function MsgBubble({ msg }: { msg: MsgItem }) {
  const time = new Date(msg.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  if (msg.type === 'customer_message') return <CustomerBubble msg={msg} />
  if (msg.type === 'owner_reply')      return <OwnerBubble msg={msg} />
  if (msg.type === 'auto_reply')       return <ThreadBanner color="green" icon="sparkles" label="AI replied to customer" content={msg.content} time={time} />
  if (msg.type === 'follow_up')        return <ThreadBanner color="gray"  icon="send"     label="Follow-up sent"          content={msg.content} time={time} />
  return null
}

function MessagesTab({ lead, token, onReview }: {
  lead: UILead
  token: string | null
  onReview: () => void
}) {
  const [messages, setMessages] = useState<MsgItem[]>([])
  const [draftContent, setDraftContent] = useState<string | null>(null)
  const [draftDismissed, setDraftDismissed] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) return
    setLoadingMsgs(true)
    api.get<{ ok: boolean; data: MsgItem[] }>(`/owner/leads/${lead.id}/messages`, token)
      .then(r => {
        const all = r.data ?? []
        const hasAutoReply = all.some(m => m.type === 'auto_reply')
        const aiDraftMsg = all.find(m => m.type === 'ai_draft')
        setMessages(all.filter(m => m.type !== 'ai_draft'))
        setDraftContent((!hasAutoReply && aiDraftMsg) ? aiDraftMsg.content : null)
        setDraftDismissed(false)
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false))
  }, [token, lead.id])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || !token || sending) return
    setSending(true)
    const optimisticId = 'opt-' + Date.now()
    const optimistic: MsgItem = { id: optimisticId, type: 'owner_reply', direction: 'outbound', content: text, created_at: new Date().toISOString() }
    setMessages(ms => [...ms, optimistic])
    setReply('')
    try {
      const res = await api.post<{ ok: boolean; data: MsgItem }>(`/owner/leads/${lead.id}/messages`, { content: text }, token)
      setMessages(ms => ms.map(m => m.id === optimisticId ? res.data : m))
      toast('Reply sent')
    } catch {
      setMessages(ms => ms.filter(m => m.id !== optimisticId))
      toast('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  const showDraft = draftContent && !draftDismissed

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="ld-thread" ref={scrollRef}>
        {loadingMsgs ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 0' }}>
            <div className="spinner" /><span className="muted" style={{ fontSize: 13 }}>Loading messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="muted" style={{ fontSize: 13, padding: '12px 0' }}>No messages yet.</div>
        ) : messages.map((m, i) => <MsgBubble key={m.id ?? i} msg={m} />)}
      </div>

      {/* AI draft card — only shown when AI didn't auto-send */}
      {showDraft && (
        <div style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="sparkles" size={14} style={{ color: '#D97706' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '.04em' }}>AI Draft — not sent yet</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost btn-xs" onClick={onReview} style={{ color: '#92400E' }}>Full analysis</button>
              <button onClick={() => setDraftDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', padding: 2, display: 'flex' }}>
                <Icon name="x" size={14} />
              </button>
            </div>
          </div>
          <div style={{ fontSize: 13.5, color: '#78350F', lineHeight: 1.65, marginBottom: 10, whiteSpace: 'pre-wrap' }}>{draftContent}</div>
          <button
            className="btn btn-sm"
            style={{ background: '#D97706', color: '#fff', border: 'none' }}
            onClick={() => { setReply(draftContent!); setDraftDismissed(true) }}
          >
            <Icon name="edit" size={13} /> Load in composer
          </button>
        </div>
      )}

      <div className="ld-composer">
        <textarea
          className="textarea"
          placeholder="Write a reply… (Enter to send)"
          value={reply}
          onChange={e => setReply(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(reply) } }}
          style={{ minHeight: 90 }}
          disabled={sending}
        />
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-sm" onClick={() => send(reply)} disabled={sending || !reply.trim()}>
            {sending ? <><span className="spinner" /> Sending…</> : <><Icon name="send" size={15} /> Send Reply</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   AI tab — real data
───────────────────────────────────────────────────────── */
function AITab({ lead, token, aiData, autoSent }: { lead: UILead; token: string | null; aiData: AIData | null; autoSent: boolean }) {
  const [draft, setDraft] = useState(aiData?.suggested_reply ?? '')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    setDraft(aiData?.suggested_reply ?? '')
  }, [aiData?.suggested_reply])

  async function approveAndSend() {
    if (!draft.trim() || !token || sending) return
    setSending(true)
    try {
      await api.post(`/owner/leads/${lead.id}/messages`, { content: draft }, token)
      toast('Reply sent to ' + lead.customer_name.split(' ')[0])
    } catch {
      toast('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  if (!aiData) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Icon name="sparkles" size={22} style={{ color: 'var(--primary)' }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>AI analysis pending</div>
        <p className="muted" style={{ fontSize: 13.5, marginTop: 8, maxWidth: 300, margin: '8px auto 0' }}>
          AI insights will appear here once the lead has been processed.
        </p>
      </div>
    )
  }

  return (
    <div className="tabpane-stack">
      <div className="ai-states">
        {autoSent
          ? <span className="ai-state done"><Icon name="sparkles" size={12} /> AI replied to customer</span>
          : <span className="ai-state pending" style={{ color: 'var(--text-muted)' }}><Icon name="mail" size={12} /> Acknowledgement sent</span>
        }
        {!autoSent && aiData.suggested_reply && (
          <span className="ai-state pending"><Icon name="sparkles" size={12} /> Draft ready — awaiting your review</span>
        )}
      </div>

      {aiData.summary && (
        <section>
          <div className="sec-label">Summary</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{aiData.summary}</p>
          {(aiData.intent || aiData.urgency) && (
            <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              {aiData.intent && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className="sec-meta-k">Intent</span>
                  <Badge>{aiData.intent}</Badge>
                </div>
              )}
              {aiData.urgency && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span className="sec-meta-k">Urgency</span>
                  <Badge tone={aiData.urgency === 'high' ? 'red' : aiData.urgency === 'medium' ? 'amber' : 'gray'}>{aiData.urgency}</Badge>
                </div>
              )}
            </div>
          )}
          {aiData.tags && aiData.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
              {aiData.tags.map((t, i) => (
                <span key={i} className="tag" style={{ fontSize: 12, height: 24, background: 'var(--primary-50)', color: 'var(--primary)', borderColor: 'var(--info-border)' }}>{t}</span>
              ))}
            </div>
          )}
        </section>
      )}

      {aiData.next_step && (
        <section>
          <div className="sec-label">Recommended next step</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{aiData.next_step}</p>
        </section>
      )}

      {aiData.suggested_reply && (
        <section>
          <div className="sec-label">{autoSent ? 'Reply sent to customer' : 'Suggested reply'}</div>
          <textarea
            className="textarea"
            value={draft}
            onChange={e => !autoSent && setDraft(e.target.value)}
            readOnly={autoSent}
            style={{ minHeight: 150, fontSize: 13.5, background: autoSent ? 'var(--muted-bg)' : 'var(--muted-bg-2)', color: autoSent ? 'var(--text-secondary)' : 'inherit', cursor: autoSent ? 'default' : undefined }}
            disabled={sending}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {!autoSent && (
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={approveAndSend} disabled={sending || !draft.trim()}>
                {sending ? <><span className="spinner" /> Sending…</> : <><Icon name="send" size={16} /> Approve &amp; Send</>}
              </button>
            )}
            <button
              className="btn btn-secondary btn-icon"
              title="Copy to clipboard"
              onClick={() => { navigator.clipboard.writeText(draft); toast('Copied') }}
            >
              <Icon name="copy" size={17} />
            </button>
          </div>
        </section>
      )}

      <div className="helper" style={{ marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <Icon name="shield" size={13} style={{ flexShrink: 0, marginTop: 1 }} />
        {autoSent
          ? 'AI sent a personalized reply to this customer automatically. The draft below is a copy for your reference.'
          : 'A safe acknowledgement email was sent to the customer. The AI draft below is ready for you to edit and send.'}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Timeline tab
───────────────────────────────────────────────────────── */
function TimelineTab({ lead }: { lead: UILead }) {
  const received = new Date(lead.created_at)
  const emailEventTitle = lead.commStatus === 'ai_replied'
    ? 'AI replied to customer'
    : lead.commStatus === 'owner_replied'
    ? 'Owner replied to customer'
    : 'Acknowledgement sent'
  const events = [
    {
      type: 'received',
      title: 'Lead received',
      date: received.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: received.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    },
    {
      type: 'email',
      title: emailEventTitle,
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
        <button className="btn btn-ghost btn-xs" style={{ paddingLeft: 0 }} onClick={() => toast('Notes coming soon')}>
          Add note or activity
        </button>
      </div>
    </div>
  )
}
