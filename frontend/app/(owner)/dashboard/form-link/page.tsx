'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icon, Card, CopyLinkBox, toast } from '@/components/ui'
import { api } from '@/lib/api/client'
import { useApiToken } from '@/lib/hooks/useApiToken'

const SHARE_CHANNELS = [
  { icon: 'globe', t: 'Your website', d: 'Add a "Get a Quote" button linking to this URL.' },
  { icon: 'users', t: 'Social media', d: 'Post the link in your bio and stories.' },
  { icon: 'mail', t: 'Email signature', d: 'Include the link in every email you send.' },
  { icon: 'grid', t: 'QR code', d: 'Print the QR code on flyers, vehicles, or cards.' },
]

export default function FormLinkPage() {
  const router = useRouter()
  const token = useApiToken()
  const [formUrl, setFormUrl] = useState<string | null>(null)
  const [slug, setSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    api.get<{ ok: boolean; data: { slug: string } }>('/owner/form', token)
      .then(r => {
        const s = r.data?.slug
        if (s) {
          setSlug(s)
          setFormUrl(`${window.location.origin}/forms/${s}`)
        }
      })
      .catch(() => toast('Could not load form link'))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="page-pad fade-up">
      <div className="between stack-sm" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Form Link</h1>
          <p className="page-subtitle">Share your public form and start capturing leads instantly.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 24, alignItems: 'start' }} className="fl-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Card>
            <div className="section-title" style={{ fontSize: 16 }}>Your Public Form Link</div>
            <p className="helper" style={{ margin: '5px 0 16px' }}>Anyone with this link can submit a request to your business.</p>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0' }}>
                <div className="spinner" /><span className="muted" style={{ fontSize: 14 }}>Loading…</span>
              </div>
            ) : formUrl ? (
              <>
                <CopyLinkBox url={formUrl} />
                <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => slug && router.push(`/forms/${slug}`)}
                  >
                    <Icon name="externalLink" size={16} /> Preview Form
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => toast('QR code download coming soon')}>
                    <Icon name="grid" size={16} /> Download QR Code
                  </button>
                </div>
              </>
            ) : (
              <p className="muted" style={{ fontSize: 14 }}>No active form found. Contact your administrator.</p>
            )}
          </Card>

          <Card>
            <div className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Where to share your link</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {SHARE_CHANNELS.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: 16, border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={c.icon} size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.t}</div>
                    <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{c.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card style={{ position: 'sticky', top: 24 }}>
          <div className="section-title" style={{ fontSize: 16 }}>QR Code</div>
          <p className="helper" style={{ margin: '5px 0 16px' }}>Scan to open your form.</p>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 18, background: 'var(--muted-bg-2)', borderRadius: 14, border: '1px solid var(--divider)' }}>
            <QRPlaceholder />
          </div>
          <button className="btn btn-secondary btn-block btn-sm" style={{ marginTop: 14 }} onClick={() => toast('QR code download coming soon')}>
            <Icon name="upload" size={16} /> Download PNG
          </button>
        </Card>
      </div>
    </div>
  )
}

function QRPlaceholder() {
  const cells: React.ReactNode[] = []
  const grid = 21
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const inFinder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
      let on: boolean
      if (inFinder) {
        if (x < 7 && y < 7) on = x === 0 || x === 6 || y === 0 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5)
        else if (x > 13 && y < 7) on = x === 14 || x === 20 || y === 0 || y === 6 || (x > 15 && x < 19 && y > 1 && y < 5)
        else on = x === 0 || x === 6 || y === 14 || y === 20 || (x > 1 && x < 5 && y > 15 && y < 19)
      } else {
        on = (x * 7 + y * 13 + x * y) % 3 === 0
      }
      if (on) cells.push(<rect key={`${x}-${y}`} x={x * 6} y={y * 6} width={6} height={6} fill="var(--navy)" />)
    }
  }
  return (
    <svg width={150} height={150} viewBox="0 0 126 126" style={{ borderRadius: 8, background: '#fff', padding: 4 }}>
      {cells}
    </svg>
  )
}
