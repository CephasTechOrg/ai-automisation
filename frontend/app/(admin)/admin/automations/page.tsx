'use client'

import { useState, useEffect } from 'react'
import { Icon, Card, Badge, EmptyState, Toggle, toast } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

interface AutomationRow {
  business_id: string
  business_name: string
  business_status: string
  smart_auto_reply: boolean
  owner_approval_required: boolean
  form_active: boolean
  lead_count: number
}

export default function AdminAutomationsPage() {
  const token = useApiToken()
  const [rows, setRows] = useState<AutomationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: AutomationRow[] }>('/admin/automations', token)
      .then(r => setRows(r.data ?? []))
      .catch(() => toast('Failed to load automations'))
      .finally(() => setLoading(false))
  }, [token])

  async function patch(bizId: string, field: 'smart_auto_reply' | 'owner_approval_required', value: boolean) {
    if (!token) return
    setSaving(bizId)
    try {
      const res = await api.patch<{ ok: boolean; data: { smart_auto_reply: boolean; owner_approval_required: boolean } }>(
        `/admin/automations/${bizId}`, { [field]: value }, token
      )
      setRows(rs => rs.map(r => r.business_id === bizId
        ? { ...r, smart_auto_reply: res.data.smart_auto_reply, owner_approval_required: res.data.owner_approval_required }
        : r
      ))
      toast('Saved')
    } catch {
      toast('Failed to save')
    } finally {
      setSaving(null)
    }
  }

  const autoReplying = rows.filter(r => r.smart_auto_reply).length
  const requireApproval = rows.filter(r => r.owner_approval_required).length

  return (
    <div className="page-pad fade-up">
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Automations</h1>
        <p className="page-subtitle">Control AI auto-reply and approval settings per business.</p>
      </div>

      {/* Legend */}
      <Card style={{ marginBottom: 22, padding: '16px 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="zap" size={18} style={{ color: 'var(--green)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Smart Auto-Reply</div>
              <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 3 }}>
                AI automatically sends the first reply to new leads without any owner approval.
              </div>
              <div style={{ marginTop: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--green)' }}>
                {loading ? '—' : autoReplying} of {rows.length} enabled
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="shieldCheck" size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Owner Approval Required</div>
              <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 3 }}>
                AI drafts a reply but the owner must approve before it goes to the customer.
              </div>
              <div style={{ marginTop: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--primary)' }}>
                {loading ? '—' : requireApproval} of {rows.length} enabled
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card pad={false}>
        {loading ? (
          <div style={{ padding: '40px 22px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="spinner" /><span className="muted">Loading…</span>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon="zap" title="No businesses" text="Add a business to configure automation." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  {['Business', 'Status', 'Form', 'Total Leads', 'Auto-Reply', 'Owner Approval'].map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.business_id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.business_name}</div>
                    </td>
                    <td>
                      <Badge tone={r.business_status === 'active' ? 'green' : r.business_status === 'paused' ? 'amber' : 'gray'}>
                        {r.business_status.charAt(0).toUpperCase() + r.business_status.slice(1)}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={r.form_active ? 'green' : 'gray'}>{r.form_active ? 'Live' : 'Paused'}</Badge>
                    </td>
                    <td className="tabnum" style={{ fontWeight: 600 }}>{r.lead_count}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ opacity: saving === r.business_id ? 0.5 : 1, pointerEvents: saving === r.business_id ? 'none' : 'auto' }}>
                          <Toggle on={r.smart_auto_reply} onChange={v => patch(r.business_id, 'smart_auto_reply', v)} />
                        </div>
                        {saving === r.business_id && <div className="spinner" style={{ width: 14, height: 14 }} />}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ opacity: saving === r.business_id ? 0.5 : 1, pointerEvents: saving === r.business_id ? 'none' : 'auto' }}>
                          <Toggle on={r.owner_approval_required} onChange={v => patch(r.business_id, 'owner_approval_required', v)} />
                        </div>
                        {saving === r.business_id && <div className="spinner" style={{ width: 14, height: 14 }} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
