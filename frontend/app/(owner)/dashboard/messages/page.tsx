'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, Badge, Avatar, Menu, toast } from '@/components/ui'
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
}

interface MsgItem {
  id: string
  type: string
  direction: string
  content: string
  created_at: string
}

interface AIData {
  suggested_reply?: string
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function MessagesPage() {
  const token = useApiToken()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selId, setSelId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MsgItem[]>([])
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [aiData, setAiData] = useState<AIData | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [mobileThread, setMobileThread] = useState(false)
  const [search, setSearch] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: Lead[] }>('/owner/leads?limit=100', token)
      .then(r => { setLeads(r.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const loadThread = useCallback((leadId: string) => {
    if (!token) return
    setMsgsLoading(true)
    setMessages([])
    setAiData(null)
    setAiOpen(false)
    Promise.all([
      api.get<{ ok: boolean; data: MsgItem[] }>(`/owner/leads/${leadId}/messages`, token),
      api.get<{ ok: boolean; data: { lead: Lead; ai: AIData | null } }>(`/owner/leads/${leadId}`, token),
    ]).then(([msgRes, detailRes]) => {
      setMessages(msgRes.data ?? [])
      setAiData(detailRes.data?.ai ?? null)
      setMsgsLoading(false)
    }).catch(() => setMsgsLoading(false))
  }, [token])

  function selectLead(id: string) {
    setSelId(id)
    setMobileThread(true)
    loadThread(id)
  }

  async function send(text: string) {
    if (!text.trim() || !selId || sending) return
    setSending(true)
    const tempId = 'temp-' + Date.now()
    const optimistic: MsgItem = { id: tempId, type: 'owner_reply', direction: 'outbound', content: text, created_at: new Date().toISOString() }
    setMessages(ms => [...ms, optimistic])
    setDraft('')
    try {
      const r = await api.post<{ ok: boolean; data: MsgItem }>(`/owner/leads/${selId}/messages`, { content: text }, token ?? undefined)
      setMessages(ms => ms.map(m => m.id === tempId ? r.data : m))
      toast('Reply sent')
    } catch {
      setMessages(ms => ms.filter(m => m.id !== tempId))
      setDraft(text)
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
    ? leads.filter(l => l.customer_name.toLowerCase().includes(search.toLowerCase()) || l.service_needed?.toLowerCase().includes(search.toLowerCase()))
    : leads

  return (
    <div className="page-pad fade-up" style={{ paddingBottom: 24 }}>
      <h1 className="page-title">Messages</h1>
      <p className="page-subtitle" style={{ marginBottom: 22 }}>Email and message history connected to your leads.</p>

      <div className="msg-grid card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Lead list */}
        <div className={'msg-list' + (mobileThread ? ' mobile-hidden' : '')}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="input-wrap">
              <span className="input-icon"><Icon name="search" size={16} /></span>
              <input
                className="input has-icon"
                placeholder="Search conversations..."
                style={{ height: 40 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: 64, borderRadius: 10, background: 'var(--muted-bg)', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                {search ? 'No results' : 'No leads yet'}
              </div>
            ) : (
              filtered.map(lead => (
                <button key={lead.id} className={'conv-item' + (lead.id === selId ? ' active' : '')} onClick={() => selectLead(lead.id)}>
                  <Avatar name={lead.customer_name} initials={initials(lead.customer_name)} size={42} />
                  <div className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
                    <div className="between">
                      <span style={{ fontWeight: 600, fontSize: 13.5 }} className="trunc">{lead.customer_name}</span>
                      <span className="muted" style={{ fontSize: 11.5, flexShrink: 0 }}>{formatTime(lead.created_at)}</span>
                    </div>
                    <div className="muted trunc" style={{ fontSize: 12.5, marginTop: 3 }}>
                      {lead.service_needed ?? 'No service specified'}
                    </div>
                  </div>
                  <Badge tone={lead.status === 'new' ? 'blue' : lead.status === 'booked' ? 'green' : 'gray'}>
                    {lead.status}
                  </Badge>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread */}
        <div className={'msg-thread' + (mobileThread ? ' mobile-show' : '')}>
          {!sel ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 10 }}>
              <Icon name="mail" size={36} />
              <div style={{ fontSize: 14 }}>Select a lead to view messages</div>
            </div>
          ) : (
            <>
              <div className="msg-thread-head">
                <button className="icon-btn crm-back" onClick={() => setMobileThread(false)}><Icon name="chevLeft" size={20} /></button>
                <Avatar name={sel.customer_name} initials={initials(sel.customer_name)} size={40} />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{sel.customer_name}</span>
                    <Badge tone={sel.status === 'new' ? 'blue' : sel.status === 'booked' ? 'green' : 'gray'}>{sel.status}</Badge>
                  </div>
                  <div className="muted trunc" style={{ fontSize: 12.5 }}>
                    {sel.service_needed ?? 'General enquiry'} · {sel.customer_email ?? sel.customer_phone ?? ''}
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm only-desktop" onClick={() => router.push(`/dashboard/leads?open=${sel.id}`)}>
                  <Icon name="externalLink" size={15} /> Open Lead
                </button>
                <Menu
                  trigger={<button className="icon-btn"><Icon name="more" size={18} /></button>}
                  items={[
                    { icon: 'externalLink', label: 'Open lead', onClick: () => router.push(`/dashboard/leads?open=${sel.id}`) },
                  ]}
                />
              </div>

              <div className="msg-body" ref={scrollRef}>
                {msgsLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                    <div className="spinner" />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 32 }}>No messages yet</div>
                ) : (
                  messages.map((m, i) => <MsgBubble key={m.id} msg={m} index={i} onEdit={t => setDraft(t)} />)
                )}
              </div>

              <div className="msg-composer">
                {aiData?.suggested_reply && (
                  aiOpen ? (
                    <div className="ai-suggest">
                      <div className="between" style={{ marginBottom: 7 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <Icon name="sparkles" size={15} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>AI Suggested Response</span>
                        </div>
                        <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setAiOpen(false)}><Icon name="x" size={15} /></button>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{aiData.suggested_reply}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button className="btn btn-primary btn-xs" onClick={() => { setDraft(aiData.suggested_reply!); setAiOpen(false) }}>Use Suggestion</button>
                      </div>
                    </div>
                  ) : (
                    <button className="ai-suggest-pill" onClick={() => setAiOpen(true)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name="sparkles" size={15} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>AI reply suggestion available</span>
                      </div>
                      <span className="btn btn-secondary btn-xs">Review</span>
                    </button>
                  )
                )}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginTop: 12 }}>
                  <textarea
                    className="textarea"
                    placeholder="Type a message..."
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft) } }}
                    style={{ minHeight: 46, maxHeight: 120 }}
                    disabled={sending}
                  />
                  <button
                    className="btn btn-primary btn-icon"
                    style={{ height: 46, width: 46, flexShrink: 0 }}
                    onClick={() => send(draft)}
                    disabled={sending || !draft.trim()}
                  >
                    {sending ? <span className="spinner" /> : <Icon name="send" size={18} />}
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

const TYPE_CONFIG: Record<string, { label: string; cls: string }> = {
  customer_message: { label: 'Customer Message', cls: 'them' },
  owner_reply:      { label: 'Owner Reply', cls: 'me' },
  auto_reply:       { label: 'Auto Reply', cls: 'sys' },
  ai_draft:         { label: 'AI Draft', cls: 'ai' },
  follow_up:        { label: 'Follow-up', cls: 'sys' },
}

function MsgBubble({ msg, index, onEdit }: { msg: MsgItem; index: number; onEdit: (t: string) => void }) {
  const cfg = TYPE_CONFIG[msg.type] ?? TYPE_CONFIG.owner_reply
  const isSys = msg.type === 'auto_reply' || msg.type === 'follow_up'
  const isAI = msg.type === 'ai_draft'
  const isCustomer = msg.type === 'customer_message'

  if (isSys) {
    return (
      <div className="msg-system">
        <div className="msg-sys-line">
          <span className="msg-sys-chip gray">
            <Icon name={msg.type === 'follow_up' ? 'send' : 'mail'} size={12} />
            {cfg.label}
          </span>
          <span className="msg-sys-time">{formatTime(msg.created_at)}</span>
        </div>
        <div className="msg-sys-text">{msg.content}</div>
      </div>
    )
  }

  const side = isCustomer ? 'them' : 'me'
  return (
    <div className={'bubble-row ' + side}>
      <div className={'bubble-wrap ' + side}>
        <div className="bubble-label">
          {isAI && <Icon name="sparkles" size={12} style={{ marginRight: 4, verticalAlign: '-1px' }} />}
          {cfg.label}
        </div>
        <div className={'bubble ' + cfg.cls}>
          <div>{msg.content}</div>
          <div className="bubble-time">{formatTime(msg.created_at)}</div>
        </div>
        {isAI && (
          <div className="ai-draft-actions">
            <button className="btn btn-secondary btn-xs" onClick={() => onEdit(msg.content)}>Edit</button>
          </div>
        )}
      </div>
    </div>
  )
}
