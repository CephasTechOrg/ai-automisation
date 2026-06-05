'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Icon } from '@/components/ui'

interface AppShellProps {
  role: 'owner' | 'admin'
  mobileTitle?: string
  businessName?: string
  userName?: string
  children: React.ReactNode
}

export function AppShell({ role, mobileTitle, businessName, userName, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const isAdmin = role === 'admin'

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}
      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} businessName={businessName} />
      <div className="main-area">
        <Topbar role={role} mobileTitle={mobileTitle} userName={userName} onMenu={() => setSidebarOpen(true)} onSearch={() => setSearchOpen(true)} />
        <div className="page-scroll">{children}</div>
      </div>
      {searchOpen && (
        <div className="search-overlay fade-in" onClick={() => setSearchOpen(false)}>
          <div className="search-sheet" onClick={e => e.stopPropagation()}>
            <div className="input-wrap" style={{ flex: 1 }}>
              <span className="input-icon"><Icon name="search" size={18} /></span>
              <input className="input has-icon" autoFocus placeholder={isAdmin ? 'Search businesses, owners, leads...' : 'Search leads, customers, messages...'} />
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSearchOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
