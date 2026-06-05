'use client'

import { useState, useRef, useEffect } from 'react'
import { Icon, Badge, Avatar, Menu, toast } from '@/components/ui'
import { CONVERSATIONS, type MockConversation, type MockMessage } from '@/lib/data/mock'

const SYS_MAP: Record<string, { label: string; icon: string; tone: string }> = {
  auto: { label: 'Auto Reply', icon: 'mail', tone: 'gray' },
  followup: { label: 'Follow-up', icon: 'send', tone: 'blue' },
  scheduled: { label: 'Scheduled', icon: 'calendarClock', tone: 'amber' },
  failed: { label: 'Delivery Failed', icon: 'xCircle', tone: 'red' },
}
const BUB_MAP: Record<string, { side: string; label: string; cls: string }> = {
  customer: { side: 'them', label: 'Customer Message', cls: 'them' },
  owner: { side: 'me', label: 'Owner Reply', cls: 'me' },
  'ai-draft': { side: 'me', label: 'AI Draft · pending approval', cls: 'ai' },
}

export default function MessagesPage() {
  const [convs, setConvs] = useState(CONVERSATIONS)
  const [selId, setSelId] = useState(CONVERSATIONS[0].id)
  const [draft, setDraft] = useState('')
  const [aiOpen, setAiOpen] = useState(false)
  const [mobileThread, setMobileThread] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const sel = convs.find(c => c.id === selId) || convs[0]

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [selId, convs])

  function send(text: string) {
    if (!text.trim()) return
    setConvs(cs => cs.map(c =>
      c.id === selId
        ? { ...c, thread: [...c.thread.filter(m => m.kind !== 'ai-draft'), { kind: 'owner', text, time: 'Just now' }], preview: text, time: 'Just now' }
        : c
    ))
    setDraft('')
    toast('Reply sent')
  }

  function selectConv(id: string) {
    setSelId(id)
    setMobileThread(true)
    setConvs(cs => cs.map(c => c.id === id ? { ...c, unread: 0 } : c))
  }

  return (
    <div className="page-pad fade-up" style={{ paddingBottom: 24 }}>
      <h1 className="page-title">Messages</h1>
      <p className="page-subtitle" style={{ marginBottom: 22 }}>Email and message history connected to your leads.</p>

      <div className="msg-grid card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Conversation list */}
        <div className={'msg-list' + (mobileThread ? ' mobile-hidden' : '')}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div className="input-wrap">
              <span className="input-icon"><Icon name="search" size={16} /></span>
              <input className="input has-icon" placeholder="Search conversations..." style={{ height: 40 }} />
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {convs.map(c => (
              <button key={c.id} className={'conv-item' + (c.id === selId ? ' active' : '')} onClick={() => selectConv(c.id)}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar name={c.name} initials={c.initials} size={42} />
                  {c.online && <span style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: 'var(--green)', border: '2px solid #fff' }} />}
                </div>
                <div className="grow" style={{ minWidth: 0, textAlign: 'left' }}>
                  <div className="between">
                    <span style={{ fontWeight: 600, fontSize: 13.5 }} className="trunc">{c.name}</span>
                    <span className="muted" style={{ fontSize: 11.5, flexShrink: 0 }}>{c.time}</span>
                  </div>
                  <div className="muted trunc" style={{ fontSize: 12.5, marginTop: 3 }}>{c.preview}</div>
                </div>
                {c.unread > 0 && <span className="nav-badge" style={{ background: 'var(--primary)', alignSelf: 'center' }}>{c.unread}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className={'msg-thread' + (mobileThread ? ' mobile-show' : '')}>
          <div className="msg-thread-head">
            <button className="icon-btn crm-back" onClick={() => setMobileThread(false)}><Icon name="chevLeft" size={20} /></button>
            <Avatar name={sel.name} initials={sel.initials} size={40} />
            <div className="grow" style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{sel.name}</span>
                <Badge>{sel.status}</Badge>
              </div>
              <div className="muted trunc" style={{ fontSize: 12.5 }}>{sel.service} · Lead {sel.leadId}</div>
            </div>
            <button className="btn btn-secondary btn-sm only-desktop" onClick={() => toast('Opening lead ' + sel.leadId)}>
              <Icon name="externalLink" size={15} /> Open Lead
            </button>
            <Menu
              trigger={<button className="icon-btn"><Icon name="more" size={18} /></button>}
              items={[
                { icon: 'externalLink', label: 'Open lead' },
                { icon: 'check', label: 'Mark resolved' },
              ]}
            />
          </div>

          <div className="msg-body" ref={scrollRef}>
            {sel.thread.map((m, i) => renderMsg(m, i, sel, () => send(m.text), () => setDraft(m.text)))}
          </div>

          <div className="msg-composer">
            {aiOpen ? (
              <div className="ai-suggest">
                <div className="between" style={{ marginBottom: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Icon name="sparkles" size={15} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>AI Suggested Response</span>
                  </div>
                  <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setAiOpen(false)}><Icon name="x" size={15} /></button>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{sel.suggested}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn btn-primary btn-xs" onClick={() => { setDraft(sel.suggested); setAiOpen(false) }}>Use Suggestion</button>
                  <button className="btn btn-ghost btn-xs" onClick={() => toast('Regenerating...')}><Icon name="refresh" size={14} /> Regenerate</button>
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
            )}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginTop: 12 }}>
              <textarea
                className="textarea"
                placeholder="Type a message..."
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft) } }}
                style={{ minHeight: 46, maxHeight: 120 }}
              />
              <button className="btn btn-primary btn-icon" style={{ height: 46, width: 46, flexShrink: 0 }} onClick={() => send(draft)}>
                <Icon name="send" size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function renderMsg(m: MockMessage, i: number, conv: MockConversation, onApprove: () => void, onEdit: () => void) {
  const sys = SYS_MAP[m.kind]
  if (sys) {
    return (
      <div key={i} className="msg-system">
        <div className="msg-sys-line">
          <span className={'msg-sys-chip ' + sys.tone}><Icon name={sys.icon} size={12} />{sys.label}</span>
          <span className="msg-sys-time">{m.time}</span>
        </div>
        <div className={'msg-sys-text' + (m.kind === 'failed' ? ' failed' : '')}>
          {m.text}
          {m.kind === 'failed' && (
            <button className="btn btn-xs" style={{ marginLeft: 8, color: 'var(--red)', border: '1px solid var(--red-border)', height: 26 }} onClick={() => toast('Retrying delivery...')}>
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }
  const L = BUB_MAP[m.kind] || BUB_MAP.owner
  return (
    <div key={i} className={'bubble-row ' + L.side}>
      <div className={'bubble-wrap ' + L.side}>
        <div className="bubble-label">
          {m.kind === 'ai-draft' && <Icon name="sparkles" size={12} style={{ marginRight: 4, verticalAlign: '-1px' }} />}
          {L.label}
        </div>
        <div className={'bubble ' + L.cls}>
          <div>{m.text}</div>
          <div className="bubble-time">{m.time}</div>
        </div>
        {m.kind === 'ai-draft' && (
          <div className="ai-draft-actions">
            <button className="btn btn-primary btn-xs" onClick={onApprove}><Icon name="check" size={14} /> Approve &amp; Send</button>
            <button className="btn btn-secondary btn-xs" onClick={onEdit}>Edit</button>
          </div>
        )}
      </div>
    </div>
  )
}
