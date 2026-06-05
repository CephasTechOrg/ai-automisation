'use client'

import { useState, useEffect, useRef } from 'react'
import { Icon } from './Icon'

export interface MenuItem {
  icon?: string
  label?: string
  onClick?: () => void
  danger?: boolean
  divider?: boolean
}

interface MenuProps {
  items: MenuItem[]
  trigger: React.ReactNode
  align?: 'left' | 'right'
}

export function Menu({ items, trigger, align = 'right' }: MenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <div onClick={e => { e.stopPropagation(); setOpen(o => !o) }}>{trigger}</div>
      {open && (
        <div className="menu-pop fade-in" style={{ position: 'absolute', top: 'calc(100% + 6px)', [align]: 0, zIndex: 50, minWidth: 188, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 6 }}>
          {items.map((it, i) =>
            it.divider
              ? <div key={i} style={{ height: 1, background: 'var(--divider)', margin: '5px 4px' }} />
              : (
                <button key={i} className="menu-item" onClick={e => { e.stopPropagation(); setOpen(false); it.onClick?.() }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 500, color: it.danger ? 'var(--red)' : 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer' }}>
                  {it.icon && <Icon name={it.icon} size={16} />}
                  {it.label}
                </button>
              )
          )}
        </div>
      )}
    </div>
  )
}
