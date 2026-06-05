interface LogoProps {
  light?: boolean
  size?: number
}

export function Logo({ light = false, size = 30 }: LogoProps) {
  return (
    <div className="lf-logo" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{
        width: size, height: size, borderRadius: 9, background: 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: '0 2px 6px rgba(37,99,235,.35)',
      }}>
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: light ? '#fff' : 'var(--text)' }}>
        LeadFlow <span style={{ color: light ? '#93C5FD' : 'var(--primary)' }}>Pro</span>
      </div>
    </div>
  )
}
