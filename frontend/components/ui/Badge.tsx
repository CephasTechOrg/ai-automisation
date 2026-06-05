const STATUS_MAP: Record<string, string> = {
  New: 'blue', Contacted: 'amber', Booked: 'green', 'Follow-up': 'violet', Lost: 'red',
  Active: 'green', Pending: 'amber', Paused: 'gray', Invited: 'blue',
  High: 'green', Medium: 'amber', Low: 'gray',
}

interface BadgeProps {
  children: string
  tone?: string
  dot?: boolean
}

export function Badge({ children, tone, dot = true }: BadgeProps) {
  const t = tone || STATUS_MAP[children] || 'gray'
  return (
    <span className={`badge badge-${t}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  )
}

interface PlanBadgeProps { children: string }

export function PlanBadge({ children }: PlanBadgeProps) {
  const map: Record<string, { bg: string; c: string; b: string }> = {
    Pro: { bg: 'var(--primary-50)', c: 'var(--primary)', b: 'var(--primary-200)' },
    Standard: { bg: 'var(--muted-bg)', c: 'var(--text-secondary)', b: 'var(--border)' },
    Basic: { bg: '#fff', c: 'var(--text-muted)', b: 'var(--border)' },
    Enterprise: { bg: 'var(--violet-bg)', c: 'var(--violet)', b: '#DDD6FE' },
  }
  const s = map[children] || map.Standard
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 9px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: s.bg, color: s.c, border: `1px solid ${s.b}` }}>
      {children}
    </span>
  )
}
