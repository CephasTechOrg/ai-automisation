'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, Badge, Avatar, toast } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

interface Lead {
  id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  service_needed: string | null
  status: string
  created_at: string
  comm_status?: string | null   // ai_replied | owner_replied | acknowledged
}

interface MsgItem {
  id: string
  type: string
  direction: string
  content: string
  created_at: string
}

function timeLabel(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7)  return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

// ─── Lead sidebar item ────────────────────────────────────────────────────────

const COMM_ICON: Record<string, { icon: string; label: string; color: string }> = {
  ai_replied:    { icon: 'sparkles', label: 'AI replied',   color: 'var(--green, #16A34A)' },
  owner_replied: { icon: 'check',    label: 'You replied',  color: 'var(--primary)' },
  acknowledged:  { icon: 'mail',     label: 'Acknowledged', color: 'var(--text-muted)' },
}

function LeadItem({ lead, active, onClick }: { lead: Lead; active: boolean; onClick: () => void }) {
  const cs = lead.comm_status ? COMM_ICON[lead.comm_status] : null
  return (
    <button className={'conv-item' + (active ? ' active' : '')} onClick={onClick}>
      <Avatar name={lead.customer_name} initials={initials(lead.customer_name)} size={40} />
      <div className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
        <div className="between">
          <span style={{ fontWeight: 600, fontSize: 13.5 }} className="trunc">{lead.customer_name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{timeLabel(lead.created_at)}</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }} className="trunc">
          {lead.service_needed ?? 'General enquiry'}
        </div>
        {cs && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
            <Icon name={cs.icon} size={10} style={{ color: cs.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: cs.color, fontWeight: 600 }}>{cs.label}</span>
          </div>
        )}
      </div>
      <Badge tone={lead.status === 'new' ? 'blue' : lead.status === 'booked' ? 'green' : 'gray'}>
        {lead.status}
      </Badge>
    </button>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function CustomerBubble({ msg }: { msg: MsgItem }) {
  return (
    <div className="bubble-row them">
      <div className="bubble-wrap them">
        <div className="bubble-label">Customer</div>
        <div className="bubble them">
          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          <div className="bubble-time">{timeLabel(msg.created_at)}</div>
        </div>
      </div>
    </div>
  )
}

function OwnerBubble({ msg }: { msg: MsgItem }) {
  return (
    <div className="bubble-row me">
      <div className="bubble-wrap me">
        <div className="bubble-label">You</div>
        <div className="bubble me">
          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          <div className="bubble-time">{timeLabel(msg.created_at)}</div>
        </div>
      </div>
    </div>
  )
}

function SystemBanner({ icon, label, content, color }: { icon: string; label: string; content: string; color: 'green' | 'gray' }) {
  const styles = {
    green: { bg: 'var(--green-bg, #F0FDF4)', border: 'var(--green-border, #BBF7D0)', text: 'var(--green, #16A34A)', muted: '#166534' },
    gray:  { bg: 'var(--muted-bg)',          border: 'var(--border)',                 text: 'var(--text-muted)',   muted: 'var(--text-secondary)' },
  }[color]

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 24px' }}>
      <div style={{ maxWidth: 420, width: '100%', padding: '12px 16px', background: styles.bg, border: `1px solid ${styles.border}`, borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Icon name={icon} size={13} style={{ color: styles.text }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: styles.text, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
        </div>
        <div style={{ fontSize: 13, color: styles.muted, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{content}</div>
      </div>
    </div>
  )
}

function MsgBubble({ msg }: { msg: MsgItem }) {
  if (msg.type === 'customer_message') return <CustomerBubble msg={msg} />
  if (msg.type === 'owner_reply')      return <OwnerBubble msg={msg} />
  if (msg.type === 'auto_reply')       return <SystemBanner icon="sparkles" label="AI replied to customer" content={msg.content} color="green" />
  if (msg.type === 'follow_up')        return <SystemBanner icon="send"     label="Follow-up sent"          content={msg.content} color="gray" />
  return null
}

// ─── AI Draft card (above composer) ──────────────────────────────────────────

function AiDraftCard({ content, onUse, onDismiss }: { content: string; onUse: (t: string) => void; onDismiss: () => void }) {
  return (
    <div style={{ margin: '0 16px 10px', padding: '14px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="sparkles" size={14} style={{ color: '#D97706' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '.04em' }}>AI Draft — not sent yet</span>
        </div>
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', padding: 2, display: 'flex' }}
          title="Dismiss"
        >
          <Icon name="x" size={14} />
        </button>
      </div>
      <div style={{ fontSize: 13.5, color: '#78350F', lineHeight: 1.7, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{content}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-sm"
          style={{ background: '#D97706', color: '#fff', border: 'none' }}
          onClick={() => onUse(content)}
        >
          <Icon name="edit" size={13} /> Use this reply
        </button>
        <button className="btn btn-secondary btn-sm" onClick={onDismiss}>Dismiss</button>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyThread() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-muted)', padding: 32 }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--muted-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="mail" size={24} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>No conversation selected</div>
      <div style={{ fontSize: 13 }}>Pick a lead from the list to view messages</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const token = useApiToken()
  const router = useRouter()

  const [leads, setLeads]             = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(true)
  const [search, setSearch]           = useState('')
  const [selId, setSelId]             = useState<string | null>(null)

  const [messages, setMessages]       = useState<MsgItem[]>([])
  const [aiDraft, setAiDraft]         = useState<string | null>(null)
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [draftDismissed, setDraftDismissed] = useState(false)

  const [reply, setReply]             = useState('')
  const [sending, setSending]         = useState(false)
  const [mobileThread, setMobileThread] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: Lead[] }>('/owner/leads?limit=100', token)
      .then(r => { setLeads(r.data ?? []); setLeadsLoading(false) })
      .catch(() => setLeadsLoading(false))
  }, [token])

  const loadThread = useCallback((leadId: string) => {
    if (!token) return
    setMsgsLoading(true)
    setMessages([])
    setAiDraft(null)
    setDraftDismissed(false)
    Promise.all([
      api.get<{ ok: boolean; data: MsgItem[] }>(`/owner/leads/${leadId}/messages`, token),
      api.get<{ ok: boolean; data: { lead: Lead; ai: { suggested_reply?: string } | null } }>(`/owner/leads/${leadId}`, token),
    ]).then(([msgRes, detailRes]) => {
      const all = msgRes.data ?? []
      // ai_draft stays out of the visual thread — shown as a draft card instead
      setMessages(all.filter(m => m.type !== 'ai_draft'))
      const draft = all.find(m => m.type === 'ai_draft')
      setAiDraft(draft?.content ?? detailRes.data?.ai?.suggested_reply ?? null)
      setMsgsLoading(false)
    }).catch(() => setMsgsLoading(false))
  }, [token])

  function selectLead(id: string) {
    setSelId(id)
    setReply('')
    setMobileThread(true)
    loadThread(id)
    // Mark as seen — if still "new", quietly update to "contacted"
    const lead = leads.find(l => l.id === id)
    if (lead?.status === 'new' && token) {
      setLeads(ls => ls.map(l => l.id === id ? { ...l, status: 'contacted' } : l))
      api.patch(`/owner/leads/${id}/status`, { status: 'contacted' }, token).catch(() => {})
    }
  }

  async function sendReply(text: string) {
    if (!text.trim() || !selId || sending) return
    setSending(true)
    const tempId = 'temp-' + Date.now()
    const optimistic: MsgItem = { id: tempId, type: 'owner_reply', direction: 'outbound', content: text, created_at: new Date().toISOString() }
    setMessages(ms => [...ms, optimistic])
    setReply('')
    try {
      const r = await api.post<{ ok: boolean; data: MsgItem }>(`/owner/leads/${selId}/messages`, { content: text }, token ?? undefined)
      setMessages(ms => ms.map(m => m.id === tempId ? r.data : m))
      toast('Reply sent')
    } catch {
      setMessages(ms => ms.filter(m => m.id !== tempId))
      setReply(text)
      toast('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const sel = leads.find(l => l.id === selId) ?? null
  const filtered = search
    ? leads.filter(l =>
        l.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        l.service_needed?.toLowerCase().includes(search.toLowerCase())
      )
    : leads

  const showDraft = aiDraft && !draftDismissed

  return (
    <div className="page-pad fade-up" style={{ paddingBottom: 24 }}>
      <h1 className="page-title">Messages</h1>
      <p className="page-subtitle" style={{ marginBottom: 22 }}>Full conversation history for each lead.</p>

      <div className="msg-grid card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* ── Lead list ───────────────────────────────────────────── */}
        <div className={'msg-list' + (mobileThread ? ' mobile-hidden' : '')}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <div className="input-wrap">
              <span className="input-icon"><Icon name="search" size={15} /></span>
              <input
                className="input has-icon"
                placeholder="Search by name or service…"
                style={{ height: 38 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {leadsLoading ? (
              <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ height: 58, borderRadius: 10, background: 'var(--muted-bg)', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                {search ? 'No results' : 'No leads yet'}
              </div>
            ) : (
              filtered.map(lead => (
                <LeadItem key={lead.id} lead={lead} active={lead.id === selId} onClick={() => selectLead(lead.id)} />
              ))
            )}
          </div>
        </div>

        {/* ── Thread ──────────────────────────────────────────────── */}
        <div className={'msg-thread' + (mobileThread ? ' mobile-show' : '')}>
          {!sel ? <EmptyThread /> : (
            <>
              {/* Thread header */}
              <div className="msg-thread-head">
                <button className="icon-btn crm-back" onClick={() => setMobileThread(false)}>
                  <Icon name="chevLeft" size={20} />
                </button>
                <Avatar name={sel.customer_name} initials={initials(sel.customer_name)} size={38} />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14.5 }}>{sel.customer_name}</span>
                    <Badge tone={sel.status === 'new' ? 'blue' : sel.status === 'booked' ? 'green' : 'gray'}>
                      {sel.status}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }} className="trunc">
                    {sel.service_needed ?? 'General enquiry'}
                    {sel.customer_email ? ` · ${sel.customer_email}` : ''}
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-xs only-desktop"
                  onClick={() => router.push(`/dashboard/leads?open=${sel.id}`)}
                >
                  <Icon name="externalLink" size={13} /> Open Lead
                </button>
              </div>

              {/* Messages */}
              <div className="msg-body" ref={scrollRef}>
                {msgsLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                    <div className="spinner" />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 32 }}>
                    No messages yet
                  </div>
                ) : (
                  messages.map(m => <MsgBubble key={m.id} msg={m} />)
                )}
              </div>

              {/* AI Draft card */}
              {showDraft && (
                <AiDraftCard
                  content={aiDraft}
                  onUse={t => { setReply(t); setDraftDismissed(true) }}
                  onDismiss={() => setDraftDismissed(true)}
                />
              )}

              {/* Composer */}
              <div className="msg-composer">
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <textarea
                    className="textarea"
                    placeholder="Type a reply… (Enter to send, Shift+Enter for new line)"
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(reply) } }}
                    style={{ minHeight: 46, maxHeight: 120, flex: 1 }}
                    disabled={sending}
                  />
                  <button
                    className="btn btn-primary btn-icon"
                    style={{ height: 46, width: 46, flexShrink: 0 }}
                    onClick={() => sendReply(reply)}
                    disabled={sending || !reply.trim()}
                  >
                    {sending ? <span className="spinner" /> : <Icon name="send" size={17} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
