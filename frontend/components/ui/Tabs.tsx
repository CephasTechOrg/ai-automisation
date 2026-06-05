'use client'

interface TabItem { value: string; label: string; count?: number }

interface TabsProps {
  tabs: (string | TabItem)[]
  active: string
  onChange: (v: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--muted-bg)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
      {tabs.map(t => {
        const val = typeof t === 'string' ? t : t.value
        const lab = typeof t === 'string' ? t : t.label
        const count = typeof t === 'object' ? t.count : null
        const on = active === val
        return (
          <button key={val} onClick={() => onChange(val)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 14px', borderRadius: 7, border: 'none', background: on ? '#fff' : 'transparent', color: on ? 'var(--text)' : 'var(--text-muted)', fontSize: 13.5, fontWeight: 600, boxShadow: on ? 'var(--shadow-xs)' : 'none', cursor: 'pointer' }}>
            {lab}
            {count != null && <span style={{ fontSize: 11.5, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: on ? 'var(--primary-50)' : 'var(--border)', color: on ? 'var(--primary)' : 'var(--text-muted)' }}>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
