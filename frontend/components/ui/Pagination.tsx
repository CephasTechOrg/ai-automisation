'use client'

import { Icon } from './Icon'

interface PaginationProps {
  page?: number
  pages?: number
  onPage?: (p: number) => void
  info?: string
}

export function Pagination({ page = 1, pages = 5, onPage, info }: PaginationProps) {
  return (
    <div className="between" style={{ padding: '14px 4px 2px' }}>
      {info && <div className="helper">{info}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
        <button className="pg-btn" disabled={page === 1} onClick={() => onPage?.(page - 1)}>
          <Icon name="chevLeft" size={15} />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
          <button key={p} className={'pg-btn' + (p === page ? ' active' : '')} onClick={() => onPage?.(p)}>{p}</button>
        ))}
        <button className="pg-btn" disabled={page === pages} onClick={() => onPage?.(page + 1)}>
          <Icon name="chevRight" size={15} />
        </button>
      </div>
    </div>
  )
}
