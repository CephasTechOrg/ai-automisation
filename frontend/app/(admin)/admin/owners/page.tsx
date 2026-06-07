'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, Card, Badge, Avatar, EmptyState, Menu, toast, useIsMobile } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

interface Owner {
  id: string
  email: string
  full_name: string
  created_at: string
  business_name: string | null
  business_id: string | null
  member_role: string | null
  is_active: boolean
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d}d ago`
  return `${Math.floor(d / 30)}mo ago`
}

export default function AdminOwnersPage() {
  const router = useRouter()
  const token = useApiToken()
  const isMobile = useIsMobile(820)
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: Owner[] }>('/admin/owners', token)
      .then(r => setOwners(r.data ?? []))
      .catch(() => toast('Failed to load owners'))
      .finally(() => setLoading(false))
  }, [token])

  async function resendInvite(owner: Owner) {
    if (!owner.business_id || !token) return
    try {
      const res = await api.post<{ ok: boolean; data: { sent: boolean; email?: string; error?: string } }>(
        `/admin/businesses/${owner.business_id}/resend-invite`, {}, token
      )
      if (res.data?.sent) toast(`Invite resent to ${res.data.email}`)
      else toast(res.data?.error ?? 'Failed to resend invite')
    } catch { toast('Failed to resend invite') }
  }

  const filtered = owners.filter(o =>
    o.email.toLowerCase().includes(q.toLowerCase()) ||
    (o.full_name ?? '').toLowerCase().includes(q.toLowerCase()) ||
    (o.business_name ?? '').toLowerCase().includes(q.toLowerCase())
  )

  const active = owners.filter(o => o.is_active).length

  return (
    <div className="page-pad fade-up">
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Owners</h1>
          <p className="page-subtitle">All business owners registered on the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={() => router.push('/admin/businesses/new')}>
          <Icon name="plus" size={17} /> Add Business
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Owners', value: loading ? '—' : owners.length, icon: 'users', color: 'var(--primary)' },
          { label: 'Active', value: loading ? '—' : active, icon: 'check', color: 'var(--green)' },
          { label: 'Pending Setup', value: loading ? '—' : owners.length - active, icon: 'clock', color: 'var(--amber)' },
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
        <div style={{ display: 'flex', gap: 10, padding: 14, borderBottom: '1px solid var(--border)' }}>
          <div className="input-wrap" style={{ flex: 1 }}>
            <span className="input-icon"><Icon name="search" size={16} /></span>
            <input className="input has-icon" placeholder="Search by name, email, or business…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '32px 22px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="spinner" /><span className="muted">Loading owners…</span>
          </div>
        ) : isMobile ? (
          filtered.length === 0 ? <EmptyState icon="users" title="No owners found" text="Try adjusting your search." /> : (
            <div className="mcard-list" style={{ padding: 14 }}>
              {filtered.map(o => (
                <div key={o.id} className="mcard" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div className="mcard-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={o.full_name || o.email} size={36} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{o.full_name || '(no name)'}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{o.email}</div>
                      </div>
                    </div>
                    <Badge tone={o.is_active ? 'green' : 'amber'}>{o.is_active ? 'Active' : 'Pending'}</Badge>
                  </div>
                  <div className="mcard-meta">
                    <span>{o.business_name ?? 'No business'}</span>
                    <span>Joined {timeAgo(o.created_at)}</span>
                  </div>
                  <div className="mcard-actions">
                    {o.business_id && (
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => router.push(`/admin/businesses/${o.business_id}/edit`)}>
                        <Icon name="edit" size={14} /> View Business
                      </button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => resendInvite(o)}>
                      <Icon name="mail" size={14} /> Resend Invite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>{['Owner', 'Business', 'Joined', 'Status', ''].map((h, i) => <th key={i}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5}><EmptyState icon="users" title="No owners found" text="Try adjusting your search." /></td></tr>
                ) : filtered.map(o => (
                  <tr key={o.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <Avatar name={o.full_name || o.email} size={34} />
                        <div>
                          <div className="strong">{o.full_name || '(no name set)'}</div>
                          <div className="muted" style={{ fontSize: 12 }}>{o.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{o.business_name ?? <span className="muted">—</span>}</td>
                    <td className="muted tabnum" style={{ fontSize: 13 }}>{timeAgo(o.created_at)}</td>
                    <td>
                      <Badge tone={o.is_active ? 'green' : 'amber'}>{o.is_active ? 'Active' : 'Pending'}</Badge>
                    </td>
                    <td>
                      <Menu
                        trigger={<button className="icon-btn" style={{ width: 32, height: 32 }}><Icon name="more" size={18} /></button>}
                        items={[
                          ...(o.business_id ? [{ icon: 'edit', label: 'Edit Business', onClick: () => router.push(`/admin/businesses/${o.business_id}/edit`) }] : []),
                          { icon: 'mail', label: 'Resend Invite', onClick: () => resendInvite(o) },
                          { icon: 'copy', label: 'Copy Email', onClick: () => { navigator.clipboard.writeText(o.email); toast('Email copied') } },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '8px 18px 14px' }}>
          <span className="muted" style={{ fontSize: 13 }}>Showing {filtered.length} of {owners.length} owners</span>
        </div>
      </Card>
    </div>
  )
}
