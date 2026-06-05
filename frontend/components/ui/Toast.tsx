'use client'

import { useState, useEffect } from 'react'
import { Icon } from './Icon'

type ToastFn = (msg: string, icon?: string) => void
let _toast: ToastFn | null = null

export function toast(msg: string, icon?: string) {
  _toast?.(msg, icon)
}

export function ToastHost() {
  const [items, setItems] = useState<{ id: number; msg: string; icon?: string }[]>([])

  useEffect(() => {
    _toast = (msg, icon) => {
      const id = Math.random()
      setItems(s => [...s, { id, msg, icon }])
      setTimeout(() => setItems(s => s.filter(t => t.id !== id)), 2600)
    }
  }, [])

  return (
    <div className="toast-wrap">
      {items.map(t => (
        <div key={t.id} className="toast">
          <span className="ic"><Icon name={t.icon || 'checkCircle'} size={17} /></span>
          {t.msg}
        </div>
      ))}
    </div>
  )
}
