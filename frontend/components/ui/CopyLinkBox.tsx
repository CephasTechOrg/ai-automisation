'use client'

import { useState } from 'react'
import { Icon } from './Icon'
import { toast } from './Toast'

interface CopyLinkBoxProps {
  url: string
  onCopy?: () => void
}

export function CopyLinkBox({ url, onCopy }: CopyLinkBoxProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    toast('Link copied to clipboard')
    onCopy?.()
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div style={{ flex: 1, minWidth: 0, height: 44, display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-input)', background: 'var(--muted-bg-2)', color: 'var(--text-secondary)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {url}
      </div>
      <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={handleCopy}>
        <Icon name={copied ? 'check' : 'copy'} size={16} />
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
