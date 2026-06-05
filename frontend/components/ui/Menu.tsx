'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
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

interface Pos { top: number; left: number; minWidth: number }

export function Menu({ items, trigger, align = 'right' }: MenuProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<Pos | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)

  const reposition = useCallback(() => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    const popH = popRef.current?.offsetHeight ?? 260
    const spaceBelow = window.innerHeight - r.bottom
    const top = spaceBelow < popH + 8 && r.top > popH + 8
      ? r.top - popH - 6        // flip above
      : r.bottom + 6            // default below
    const left = align === 'right'
      ? Math.max(8, r.right - 188)
      : Math.min(r.left, window.innerWidth - 196)
    setPos({ top, left, minWidth: Math.max(r.width, 188) })
  }, [align])

  // Close on outside click or scroll/resize
  useEffect(() => {
    if (!open) return
    reposition()
    function onDown(e: MouseEvent) {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        popRef.current?.contains(e.target as Node)
      ) return
      setOpen(false)
    }
    function onScroll() { reposition() }
    function onResize() { reposition() }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open, reposition])

  const popup = open && pos ? createPortal(
    <div
      ref={popRef}
      className="menu-pop fade-in"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        minWidth: pos.minWidth,
        zIndex: 9900,
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: 'var(--shadow-lg)',
        padding: 6,
      }}
    >
      {items.map((it, i) =>
        it.divider
          ? <div key={i} style={{ height: 1, background: 'var(--divider)', margin: '5px 4px' }} />
          : (
            <button
              key={i}
              className="menu-item"
              onClick={e => { e.stopPropagation(); setOpen(false); it.onClick?.() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '9px 10px', borderRadius: 8, border: 'none', background: 'transparent',
                fontSize: 13.5, fontWeight: 500,
                color: it.danger ? 'var(--red)' : 'var(--text-secondary)',
                textAlign: 'left', cursor: 'pointer',
              }}
            >
              {it.icon && <Icon name={it.icon} size={16} />}
              {it.label}
            </button>
          )
      )}
    </div>,
    document.body
  ) : null

  return (
    <div ref={triggerRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <div onClick={e => { e.stopPropagation(); setOpen(o => !o) }}>{trigger}</div>
      {popup}
    </div>
  )
}
