'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, Badge, Avatar, BrandTile, Card, Select, Menu, Pagination, Donut, EmptyState, toast, useIsMobile } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'
import { INDUSTRIES } from '@/lib/data/mock'


interface BusinessRead {
  id: string
  name: string
  slug: string
  industry: string | null
  phone: string | null
  contact_email: string | null
  address: string | null
  brand_color: string
  status: string
  logo_url: string | null
  created_at: string
}

const STATUS_DISPLAY: Record<string, string> = {
  active: 'Active', pending: 'Pending', paused: 'Paused', archived: 'Archived',
}

function timeAgo(isoStr: string) {
  const d = Math.floor((Date.now() - new Date(isoStr).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  const m = Math.floor(d / 30)
  return `${m}mo ago`
}

function BizMenu(router: ReturnType<typeof useRouter>, businessId: string, businessSlug: string, token: string | null) {
  return [
    { icon: 'edit', label: 'Edit Business', onClick: () => router.push(`/admin/businesses/${businessId}/edit`) },
    {
      icon: 'copy', label: 'Copy Form Link', onClick: () => {
        const url = `${window.location.origin}/forms/${businessSlug}`
        navigator.clipboard.writeText(url).then(() => toast('Form link copied!')).catch(() => toast('Copy failed'))
      }
    },
    {
      icon: 'mail', label: 'Resend Owner Invite', onClick: async () => {
        if (!token) { toast('Not authenticated'); return }
        try {
          const res = await api.post<{ ok: boolean; data: { sent: boolean; email?: string; error?: string } }>(
            `/admin/businesses/${businessId}/resend-invite`, {}, token
          )
          if (res.data?.sent) toast(`Invite resent to ${res.data.email}`)
          else toast(res.data?.error ?? 'Failed to resend invite')
        } catch { toast('Failed to resend invite') }
      }
    },
    { divider: true },
    { icon: 'pause', label: 'Pause Business', onClick: () => toast('Business paused') },
    { icon: 'trash', label: 'Archive Business', danger: true },
  ]
}

const PER_PAGE = 10

export default function AdminBusinessesPage() {
  const router = useRouter()
  const token = useApiToken()
  const [businesses, setBusinesses] = useState<BusinessRead[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [q, setQ] = useState('')
  const [statusF, setStatusF] = useState('Status')
  const [industryF, setIndustryF] = useState('Industry')
  const [page, setPage] = useState(1)
  const isMobile = useIsMobile(860)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    api.get<{ ok: boolean; data: BusinessRead[] }>('/admin/businesses', token)
      .then(r => setBusinesses(r.data ?? []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [token])

  const filtered = businesses.filter(b => {
    const displayStatus = STATUS_DISPLAY[b.status] ?? b.status
    const matchQ = b.name.toLowerCase().includes(q.toLowerCase()) ||
      (b.industry ?? '').toLowerCase().includes(q.toLowerCase()) ||
      (b.contact_email ?? '').toLowerCase().includes(q.toLowerCase())
    const matchS = statusF === 'Status' || displayStatus === statusF
    const matchI = industryF === 'Industry' || b.industry === industryF
    return matchQ && matchS && matchI
  })

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

  const counts = {
    active: businesses.filter(b => b.status === 'active').length,
    pending: businesses.filter(b => b.status === 'pending').length,
    paused: businesses.filter(b => b.status === 'paused').length,
  }
  const recentRegistrations = [...businesses].slice(0, 5)

  return (
    <div className="page-pad fade-up">
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Businesses</h1>
          <p className="page-subtitle">Manage and monitor all businesses in your LeadFlow Pro account.</p>
        </div>
        <button className="btn btn-primary" onClick={() => router.push('/admin/businesses/new')}>
          <Icon name="plus" size={17} /> Add Business
        </button>
      </div>

      <div className="biz-grid">
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div className="input-wrap" style={{ flex: 1, minWidth: 220 }}>
              <span className="input-icon"><Icon name="search" size={16} /></span>
              <input
                className="input has-icon"
                placeholder="Search businesses or emails..."
                value={q}
                onChange={e => { setQ(e.target.value); setPage(1) }}
              />
            </div>
            <div style={{ width: 140 }}>
              <Select
                options={['Status', 'Active', 'Pending', 'Paused']}
                value={statusF}
                onChange={v => { setStatusF(v); setPage(1) }}
              />
            </div>
            <Menu
              align="right"
              trigger={<button className="btn btn-secondary"><Icon name="filter" size={16} /> More Filters</button>}
              items={[
                { icon: 'briefcase', label: 'All industries', onClick: () => setIndustryF('Industry') },
                ...INDUSTRIES.slice(0, 5).map(ind => ({
                  icon: industryF === ind ? 'check' : 'chevRight',
                  label: ind,
                  onClick: () => { setIndustryF(ind); setPage(1) },
                })),
              ]}
            />
          </div>

          <Card pad={false}>
            {loading ? (
              <div style={{ padding: '40px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="spinner" /><span className="muted" style={{ fontSize: 14 }}>Loading businesses…</span>
              </div>
            ) : fetchError ? (
              <EmptyState icon="alert" title="Failed to load businesses" text="Check your connection and try again." />
            ) : isMobile ? (
              paginated.length === 0 ? (
                <EmptyState icon="building" title="No businesses found" text="Try adjusting your search or filters." />
              ) : (
                <div className="mcard-list" style={{ padding: 14 }}>
                  {paginated.map(b => (
                    <div key={b.id} className="mcard" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch' }}>
                      <div className="mcard-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                          <BrandTile color={b.brand_color} name={b.name} size={38} logoUrl={b.logo_url ?? undefined} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }} className="trunc">{b.name}</div>
                            <div className="muted trunc" style={{ fontSize: 12 }}>{b.industry ?? '—'}</div>
                          </div>
                        </div>
                        <Badge>{STATUS_DISPLAY[b.status] ?? b.status}</Badge>
                      </div>
                      <div className="mcard-meta">
                        <span><span className="k">Email: </span>{b.contact_email ?? '—'}</span>
                        <span><span className="k">Added: </span>{timeAgo(b.created_at)}</span>
                      </div>
                      <div className="mcard-actions">
                        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => toast('Form link copied')}>
                          <Icon name="link" size={15} /> Form Link
                        </button>
                        <Menu trigger={<button className="btn btn-secondary btn-sm btn-icon"><Icon name="more" size={18} /></button>} items={BizMenu(router, b.id, b.slug, token)} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>{['Business', 'Contact Email', 'Status', 'Added', ''].map((h, i) => <th key={i}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr><td colSpan={5}><EmptyState icon="building" title="No businesses found" text="Try adjusting your search or filters." /></td></tr>
                    ) : paginated.map(b => (
                      <tr key={b.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <BrandTile color={b.brand_color} name={b.name} size={36} logoUrl={b.logo_url ?? undefined} />
                            <div>
                              <div className="strong">{b.name}</div>
                              <div className="muted" style={{ fontSize: 12 }}>{b.industry ?? '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="muted" style={{ fontSize: 13 }}>{b.contact_email ?? '—'}</td>
                        <td><Badge>{STATUS_DISPLAY[b.status] ?? b.status}</Badge></td>
                        <td className="muted tabnum" style={{ fontSize: 13 }}>{timeAgo(b.created_at)}</td>
                        <td>
                          <Menu
                            trigger={<button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="more" size={18} /></button>}
                            items={BizMenu(router, b.id, b.slug, token)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ padding: '8px 18px 14px' }}>
              <Pagination
                page={page}
                pages={totalPages}
                info={`Showing ${Math.min(filtered.length, (page - 1) * PER_PAGE + 1)}–${Math.min(filtered.length, page * PER_PAGE)} of ${filtered.length} businesses`}
                onPage={setPage}
              />
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Card>
            <div className="section-title" style={{ fontSize: 16 }}>Business Summary</div>
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', margin: '12px 0 2px' }}>
              {loading ? '—' : businesses.length}
            </div>
            <div className="muted" style={{ fontSize: 13 }}>Total Businesses</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
              {([
                [counts.active, 'Active', 'var(--green)'],
                [counts.pending, 'Pending', 'var(--amber)'],
                [counts.paused, 'Paused', 'var(--text-muted)'],
              ] as const).map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{loading ? '—' : s[0]}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: s[2] }} />{s[1]}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="section-title" style={{ fontSize: 16 }}>Onboarding Progress</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
              <Donut
                value={businesses.length ? Math.round((counts.active / businesses.length) * 100) : 0}
                size={150}
                label={businesses.length ? `${Math.round((counts.active / businesses.length) * 100)}%` : '—'}
                sub="Active"
              />
            </div>
          </Card>

          <Card>
            <div className="between" style={{ marginBottom: 14 }}>
              <span className="section-title" style={{ fontSize: 16 }}>Recent Registrations</span>
            </div>
            {loading ? (
              <div className="muted" style={{ fontSize: 13 }}>Loading…</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentRegistrations.map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <BrandTile color={b.brand_color} name={b.name} size={32} logoUrl={b.logo_url ?? undefined} />
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }} className="trunc">{b.name}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{timeAgo(b.created_at)}</div>
                    </div>
                  </div>
                ))}
                {recentRegistrations.length === 0 && (
                  <div className="muted" style={{ fontSize: 13 }}>No businesses yet.</div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
