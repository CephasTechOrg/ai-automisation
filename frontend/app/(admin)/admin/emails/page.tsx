'use client'

import { useState, useEffect } from 'react'
import { Icon, Card, Badge, EmptyState, Select, Pagination, toast, useIsMobile } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

interface EmailEvent {
  id: string
  to_email: string
  from_email: string
  subject: string
  status: 'sent' | 'failed' | 'queued'
  provider: string
  error_message: string | null
  business_name: string
  lead_name: string
  created_at: string
}

const STATUS_TONE: Record<string, 'green' | 'red' | 'gray'> = {
  sent: 'green', failed: 'red', queued: 'gray',
}

const PER_PAGE = 20

function formatTs(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function exportCsv(rows: EmailEvent[]) {
  const header = ['Date', 'To', 'Subject', 'Status', 'Business', 'Lead', 'Error']
  const lines = rows.map(r => [
    formatTs(r.created_at), r.to_email, r.subject,
    r.status, r.business_name, r.lead_name, r.error_message ?? '',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const csv = [header.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `email-log-${new Date().toISOString().slice(0, 10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export default function AdminEmailsPage() {
  const token = useApiToken()
  const isMobile = useIsMobile(860)
  const [emails, setEmails] = useState<EmailEvent[]>([])
  const [meta, setMeta] = useState<{ total_sent: number; total_failed: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [statusF, setStatusF] = useState('All Statuses')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: EmailEvent[]; meta: { total_sent: number; total_failed: number } }>('/admin/emails?limit=500', token)
      .then(r => { setEmails(r.data ?? []); setMeta(r.meta ?? null) })
      .catch(() => toast('Failed to load email logs'))
      .finally(() => setLoading(false))
  }, [token])

  const filtered = emails.filter(e =>
    (e.to_email.toLowerCase().includes(q.toLowerCase()) ||
     e.subject.toLowerCase().includes(q.toLowerCase()) ||
     e.business_name.toLowerCase().includes(q.toLowerCase()) ||
     e.lead_name.toLowerCase().includes(q.toLowerCase())) &&
    (statusF === 'All Statuses' || e.status === statusF.toLowerCase())
  )
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="page-pad fade-up">
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Email Logs</h1>
          <p className="page-subtitle">All emails sent from the platform via Resend.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => exportCsv(filtered)}>
          <Icon name="upload" size={16} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Sent', value: meta?.total_sent ?? (loading ? '—' : emails.filter(e => e.status === 'sent').length), icon: 'send', color: 'var(--green)' },
          { label: 'Failed', value: meta?.total_failed ?? (loading ? '—' : emails.filter(e => e.status === 'failed').length), icon: 'xCircle', color: 'var(--red)' },
          { label: 'Delivery Rate', value: loading || !meta ? '—' : meta.total_sent + meta.total_failed === 0 ? '—' : `${Math.round(meta.total_sent / (meta.total_sent + meta.total_failed) * 100)}%`, icon: 'chart', color: 'var(--primary)' },
        ].map((s, i) => (
          <Card key={i} style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={s.icon} size={17} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card pad={false}>
        <div style={{ display: 'flex', gap: 10, padding: 14, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <div className="input-wrap" style={{ flex: 1, minWidth: 200 }}>
            <span className="input-icon"><Icon name="search" size={16} /></span>
            <input className="input has-icon" placeholder="Search recipient, subject, business…" value={q} onChange={e => { setQ(e.target.value); setPage(1) }} />
          </div>
          <div style={{ width: 160 }}>
            <Select options={['All Statuses', 'Sent', 'Failed', 'Queued']} value={statusF} onChange={v => { setStatusF(v); setPage(1) }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '32px 22px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="spinner" /><span className="muted">Loading email logs…</span>
          </div>
        ) : isMobile ? (
          paginated.length === 0 ? <EmptyState icon="mail" title="No emails found" text="Try adjusting your filters." /> : (
            <div className="mcard-list" style={{ padding: 14 }}>
              {paginated.map(e => (
                <div key={e.id} className="mcard" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div className="mcard-row">
                    <div style={{ minWidth: 0 }}>
                      <div className="strong trunc" style={{ fontSize: 13.5 }}>{e.subject}</div>
                      <div className="muted trunc" style={{ fontSize: 12 }}>{e.to_email}</div>
                    </div>
                    <Badge tone={STATUS_TONE[e.status] ?? 'gray'}>{e.status}</Badge>
                  </div>
                  <div className="mcard-meta">
                    <span>{e.business_name}</span>
                    <span>{e.lead_name}</span>
                    <span>{formatTs(e.created_at)}</span>
                  </div>
                  {e.error_message && (
                    <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 6, padding: '6px 10px', background: 'var(--red-bg, #FEF2F2)', borderRadius: 6 }}>
                      {e.error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>{['Date', 'To', 'Subject', 'Business', 'Status', 'Error'].map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon="mail" title="No emails found" text="Try adjusting your filters." /></td></tr>
                ) : paginated.map(e => (
                  <tr key={e.id}>
                    <td className="muted tabnum" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatTs(e.created_at)}</td>
                    <td style={{ fontSize: 13 }}>
                      <div>{e.to_email}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{e.lead_name !== '—' ? `Lead: ${e.lead_name}` : ''}</div>
                    </td>
                    <td style={{ fontSize: 13, maxWidth: 240 }}>{e.subject}</td>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{e.business_name}</td>
                    <td><Badge tone={STATUS_TONE[e.status] ?? 'gray'}>{e.status}</Badge></td>
                    <td style={{ fontSize: 12, color: 'var(--red)', maxWidth: 200 }}>{e.error_message ?? <span className="muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '8px 18px 14px' }}>
          <Pagination
            page={page}
            pages={pages}
            info={`Showing ${Math.min(filtered.length, (page - 1) * PER_PAGE + 1)}–${Math.min(filtered.length, page * PER_PAGE)} of ${filtered.length} emails`}
            onPage={setPage}
          />
        </div>
      </Card>
    </div>
  )
}
