'use client'

import { useState, useEffect } from 'react'
import { Icon, Card, Badge, EmptyState, Select, Pagination, toast, useIsMobile } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

interface AdminLead {
  id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  service_needed: string | null
  status: string
  source: string
  business_name: string
  business_id: string
  created_at: string
}

const STATUS_TONE: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  new: 'blue', contacted: 'amber', booked: 'green', follow_up: 'gray', lost: 'red', archived: 'gray',
}
const STATUS_LABEL: Record<string, string> = {
  new: 'New', contacted: 'Contacted', booked: 'Booked', follow_up: 'Follow-up', lost: 'Lost', archived: 'Archived',
}
const PER_PAGE = 20

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function exportCsv(rows: AdminLead[]) {
  const header = ['Customer', 'Email', 'Phone', 'Service', 'Status', 'Business', 'Date']
  const lines = rows.map(r => [
    r.customer_name, r.customer_email ?? '', r.customer_phone ?? '',
    r.service_needed ?? '', STATUS_LABEL[r.status] ?? r.status, r.business_name, formatDate(r.created_at),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const csv = [header.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export default function AdminLeadsPage() {
  const token = useApiToken()
  const isMobile = useIsMobile(860)
  const [leads, setLeads] = useState<AdminLead[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [statusF, setStatusF] = useState('All Statuses')
  const [bizF, setBizF] = useState('All Businesses')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: AdminLead[] }>('/admin/leads?limit=500', token)
      .then(r => setLeads(r.data ?? []))
      .catch(() => toast('Failed to load leads'))
      .finally(() => setLoading(false))
  }, [token])

  const businesses = ['All Businesses', ...Array.from(new Set(leads.map(l => l.business_name)))]
  const statuses = ['All Statuses', ...Array.from(new Set(leads.map(l => l.status)))]

  const filtered = leads.filter(l => {
    const matchQ = l.customer_name.toLowerCase().includes(q.toLowerCase()) ||
      (l.customer_email ?? '').toLowerCase().includes(q.toLowerCase()) ||
      (l.service_needed ?? '').toLowerCase().includes(q.toLowerCase())
    const matchS = statusF === 'All Statuses' || l.status === statusF
    const matchB = bizF === 'All Businesses' || l.business_name === bizF
    return matchQ && matchS && matchB
  })
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const counts = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    booked: leads.filter(l => l.status === 'booked').length,
  }

  return (
    <div className="page-pad fade-up">
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">All Leads</h1>
          <p className="page-subtitle">Every lead across all businesses on the platform.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => exportCsv(filtered)}>
          <Icon name="upload" size={16} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Leads', value: counts.total, icon: 'userPlus', color: 'var(--primary)' },
          { label: 'New (Uncontacted)', value: counts.new, icon: 'inbox', color: 'var(--blue, #2563EB)' },
          { label: 'Booked', value: counts.booked, icon: 'check', color: 'var(--green)' },
        ].map((s, i) => (
          <Card key={i} style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={s.icon} size={17} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{loading ? '—' : s.value}</div>
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
            <input className="input has-icon" placeholder="Search name, email, or service…" value={q} onChange={e => { setQ(e.target.value); setPage(1) }} />
          </div>
          <div style={{ width: 160 }}>
            <Select options={statuses} value={statusF} onChange={v => { setStatusF(v); setPage(1) }} />
          </div>
          <div style={{ width: 190 }}>
            <Select options={businesses} value={bizF} onChange={v => { setBizF(v); setPage(1) }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '32px 22px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="spinner" /><span className="muted">Loading leads…</span>
          </div>
        ) : isMobile ? (
          paginated.length === 0 ? <EmptyState icon="userPlus" title="No leads found" text="Try adjusting your filters." /> : (
            <div className="mcard-list" style={{ padding: 14 }}>
              {paginated.map(l => (
                <div key={l.id} className="mcard" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div className="mcard-row">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{l.customer_name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{l.customer_email ?? l.customer_phone ?? '—'}</div>
                    </div>
                    <Badge tone={STATUS_TONE[l.status] ?? 'gray'}>{STATUS_LABEL[l.status] ?? l.status}</Badge>
                  </div>
                  <div className="mcard-meta">
                    <span>{l.business_name}</span>
                    <span>{l.service_needed ?? '—'}</span>
                    <span>{formatDate(l.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>{['Customer', 'Contact', 'Service', 'Business', 'Status', 'Date'].map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon="userPlus" title="No leads found" text="Try adjusting your filters." /></td></tr>
                ) : paginated.map(l => (
                  <tr key={l.id}>
                    <td><div className="strong">{l.customer_name}</div></td>
                    <td className="muted" style={{ fontSize: 12.5 }}>
                      <div>{l.customer_email ?? '—'}</div>
                      <div>{l.customer_phone ?? ''}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{l.service_needed ?? <span className="muted">—</span>}</td>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{l.business_name}</td>
                    <td><Badge tone={STATUS_TONE[l.status] ?? 'gray'}>{STATUS_LABEL[l.status] ?? l.status}</Badge></td>
                    <td className="muted tabnum" style={{ fontSize: 12.5 }}>{formatDate(l.created_at)}</td>
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
            info={`Showing ${Math.min(filtered.length, (page - 1) * PER_PAGE + 1)}–${Math.min(filtered.length, page * PER_PAGE)} of ${filtered.length} leads`}
            onPage={setPage}
          />
        </div>
      </Card>
    </div>
  )
}
