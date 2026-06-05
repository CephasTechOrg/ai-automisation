'use client'

import { useRouter } from 'next/navigation'
import { Icon, Avatar, Menu } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

interface TopbarProps {
  role: 'owner' | 'admin'
  mobileTitle?: string
  userName?: string
  onMenu: () => void
  onSearch: () => void
}

export function Topbar({ role, mobileTitle, userName, onMenu, onSearch }: TopbarProps) {
  const isAdmin = role === 'admin'
  const router = useRouter()
  const displayName = userName || (isAdmin ? 'Admin User' : 'My Account')

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="topbar">
      <button className="icon-btn only-mobile" onClick={onMenu} style={{ marginLeft: -6, flexShrink: 0 }}>
        <Icon name="menu" size={20} />
      </button>

      <div className="only-mobile grow" style={{ minWidth: 0, fontWeight: 700, fontSize: 15.5 }}>
        <span className="trunc" style={{ display: 'block' }}>{mobileTitle || (isAdmin ? 'Platform Admin' : 'Dashboard')}</span>
      </div>

      <div className="grow only-desktop" />

      <div className="search-top only-desktop" style={isAdmin ? { maxWidth: 620, margin: '0 auto' } : {}}>
        <span style={{ position: 'absolute', left: 14, color: 'var(--text-disabled)', display: 'flex' }}>
          <Icon name="search" size={17} />
        </span>
        <input className="input" placeholder={isAdmin ? 'Search businesses, owners, leads, and more...' : 'Search leads, customers, messages...'} style={{ paddingLeft: 42, paddingRight: 70, height: 42, background: 'var(--muted-bg-2)' }} />
        <span className="kbd" style={{ position: 'absolute', right: 12 }}>⌘ K</span>
      </div>

      <div className="grow only-desktop" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button className="icon-btn only-mobile" onClick={onSearch}>
          <Icon name="search" size={19} />
        </button>
        <button className="icon-btn">
          <Icon name="bell" size={19} />
          <span className="notif-dot">{isAdmin ? 8 : 5}</span>
        </button>
        <div style={{ width: 1, height: 26, background: 'var(--border)' }} className="only-desktop" />
        <Menu
          align="right"
          trigger={
            <button style={{ display: 'flex', alignItems: 'center', gap: 9, border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 4px 4px 6px', borderRadius: 10 }}>
              <Avatar name={displayName} size={34} color={isAdmin ? '#0F172A' : '#2563EB'} />
              <div className="only-desktop" style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.2 }}>{displayName}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{isAdmin ? 'Super Admin' : 'Business Owner'}</div>
              </div>
              <Icon name="chevDown" size={15} style={{ color: 'var(--text-muted)' }} className="only-desktop" />
            </button>
          }
          items={[
            { icon: 'user', label: 'My Profile' },
            { icon: 'settings', label: 'Account Settings' },
            { divider: true },
            { icon: 'logout', label: 'Sign out', danger: true, onClick: handleSignOut },
          ]}
        />
      </div>
    </header>
  )
}
