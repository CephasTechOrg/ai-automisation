'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo, Icon } from '@/components/ui'

interface NavItem { id: string; label: string; icon: string; href: string; badge?: number }

const OWNER_NAV: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'home', href: '/dashboard' },
  { id: 'leads', label: 'Leads', icon: 'users', href: '/dashboard/leads' },
  { id: 'followups', label: 'Follow-ups', icon: 'messageDots', href: '/dashboard/follow-ups' },
  { id: 'form', label: 'My Form', icon: 'fileText', href: '/dashboard/form' },
  { id: 'messages', label: 'Messages', icon: 'mail', href: '/dashboard/messages', badge: 3 },
  { id: 'settings', label: 'Settings', icon: 'settings', href: '/dashboard/settings' },
]

const ADMIN_NAV: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'home', href: '/admin' },
  { id: 'businesses', label: 'Businesses', icon: 'building', href: '/admin/businesses' },
  { id: 'owners', label: 'Owners', icon: 'users', href: '/admin/owners' },
  { id: 'leads', label: 'Leads', icon: 'userPlus', href: '/admin/leads' },
  { id: 'automations', label: 'Automations', icon: 'zap', href: '/admin/automations' },
  { id: 'emails', label: 'Emails', icon: 'mail', href: '/admin/emails' },
  { id: 'audit', label: 'Audit Logs', icon: 'fileText', href: '/admin/audit' },
  { id: 'settings', label: 'Settings', icon: 'settings', href: '/admin/settings' },
]

interface SidebarProps {
  role: 'owner' | 'admin'
  open?: boolean
  onClose?: () => void
  businessName?: string
}

export function Sidebar({ role, open, onClose, businessName }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = role === 'admin'
  const nav = isAdmin ? ADMIN_NAV : OWNER_NAV

  function isActive(href: string) {
    if (href === '/dashboard' || href === '/admin') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className={'sidebar' + (isAdmin ? ' sidebar-admin' : '') + (open ? ' open' : '')}>
      <div style={{ padding: '20px 20px 12px' }}>
        <Logo light />
      </div>

      <div style={{ padding: '0 14px' }}>
        <div className="acct-card">
          <div style={{ width: 34, height: 34, borderRadius: 9, background: isAdmin ? 'var(--primary)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={isAdmin ? 'shield' : 'home2'} size={18} style={{ color: isAdmin ? '#fff' : 'var(--primary)' }} />
          </div>
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="trunc" style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>
              {isAdmin ? 'Platform Admin' : (businessName || 'My Business')}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-on-dark-muted)' }}>
              {isAdmin ? 'Administrator' : 'Business Owner'}
            </div>
          </div>
          <Icon name="chevDown" size={15} style={{ color: 'var(--text-on-dark-muted)' }} />
        </div>
      </div>

      <div className="sidebar-scroll">
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {nav.map(n => (
            <Link key={n.id} href={n.href} className={'nav-item' + (isActive(n.href) ? ' active' : '')} onClick={onClose}>
              <span className="nav-ic"><Icon name={n.icon} size={19} /></span>
              <span className="grow">{n.label}</span>
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div style={{ padding: '0 14px 18px' }}>
        {!isAdmin && (
          <div className="side-card">
            <div className="between">
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Pro Plan</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-on-dark-muted)', marginTop: 4 }}>
              <b style={{ color: '#fff' }}>1,248</b> / 2,500 leads
            </div>
            <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,.14)', marginTop: 10, overflow: 'hidden' }}>
              <div style={{ width: '50%', height: '100%', background: 'var(--primary)', borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-on-dark-muted)', marginTop: 8 }}>Resets in 12 days</div>
            <button className="btn btn-sm" style={{ width: '100%', marginTop: 12, background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.16)' }}>Upgrade Plan</button>
          </div>
        )}
        {isAdmin && (
          <div className="side-card">
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Icon name="headphones" size={18} style={{ color: '#93C5FD', marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Need help?</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-on-dark-muted)', marginTop: 2 }}>View help docs or contact support</div>
              </div>
            </div>
            <button className="btn btn-sm" style={{ width: '100%', marginTop: 12, background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.16)' }}>Contact Support</button>
          </div>
        )}
      </div>
    </aside>
  )
}
