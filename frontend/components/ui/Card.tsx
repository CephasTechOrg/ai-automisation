import { Icon } from './Icon'

interface CardProps {
  children: React.ReactNode
  className?: string
  pad?: boolean
  style?: React.CSSProperties
}

export function Card({ children, className = '', pad = true, style }: CardProps) {
  return (
    <div className={['card', pad ? 'card-pad' : '', className].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  )
}

interface StatCardProps {
  icon: string
  label: string
  value: string
  trend?: string
  trendDir?: 'up' | 'down'
  trendNote?: string
  accent?: string
  compact?: boolean
}

export function StatCard({ icon, label, value, trend, trendDir = 'up', trendNote, accent = 'var(--primary)', compact }: StatCardProps) {
  if (compact) {
    return (
      <div className="card stat-card stat-compact">
        <div className="between" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: accent + '14', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={16} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
          <span className="tabnum" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</span>
          {trend && <span className={`trend trend-${trendDir}`} style={{ fontSize: 12 }}>{trendDir === 'up' ? '+' : '−'}{trend}</span>}
        </div>
      </div>
    )
  }
  return (
    <div className="card card-pad stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 11, background: accent + '14', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={21} />
        </div>
        <div className="grow">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</div>
          <div className="tabnum" style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2, lineHeight: 1.1 }}>{value}</div>
          {trend && (
            <div style={{ marginTop: 8 }}>
              <span className={`trend trend-${trendDir}`}>
                <Icon name={trendDir === 'up' ? 'trendUp' : 'trendDown'} size={14} />
                {trend}
              </span>
              {trendNote && <span className="trend"><span className="vs" style={{ marginLeft: 6 }}>{trendNote}</span></span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface SectionHeadProps {
  title: string
  sub?: string
  action?: React.ReactNode
}

export function SectionHead({ title, sub, action }: SectionHeadProps) {
  return (
    <div className="between" style={{ marginBottom: 4 }}>
      <div>
        <div className="section-title" style={{ fontSize: 16 }}>{title}</div>
        {sub && <div className="helper" style={{ marginTop: 3 }}>{sub}</div>}
      </div>
      {action}
    </div>
  )
}
