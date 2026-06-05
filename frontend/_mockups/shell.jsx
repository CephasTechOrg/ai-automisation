// shell.jsx — AppShell, Sidebar, Topbar
(function () {
  const { useState } = React;
  const Icon = window.Icon;
  const { Logo, Avatar, Menu, Button } = window.UI;

  const OWNER_NAV = [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'leads', label: 'Leads', icon: 'users' },
    { id: 'followups', label: 'Follow-ups', icon: 'messageDots' },
    { id: 'formlink', label: 'Form Link', icon: 'link' },
    { id: 'messages', label: 'Messages', icon: 'mail', badge: 3 },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];
  const ADMIN_NAV = [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'businesses', label: 'Businesses', icon: 'building' },
    { id: 'owners', label: 'Owners', icon: 'users' },
    { id: 'leads', label: 'Leads', icon: 'userPlus' },
    { id: 'automations', label: 'Automations', icon: 'zap' },
    { id: 'emails', label: 'Emails', icon: 'mail' },
    { id: 'audit', label: 'Audit Logs', icon: 'fileText' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  function Sidebar({ role, page, onNav, open, onClose }) {
    const isAdmin = role === 'admin';
    const nav = isAdmin ? ADMIN_NAV : OWNER_NAV;
    return React.createElement('aside', { className: 'sidebar' + (isAdmin ? ' sidebar-admin' : '') + (open ? ' open' : '') },
      // logo
      React.createElement('div', { style: { padding: '20px 20px 12px' } }, React.createElement(Logo, { light: true })),
      // account selector
      React.createElement('div', { style: { padding: '0 14px' } },
        React.createElement('div', { className: 'acct-card' },
          isAdmin
            ? React.createElement('div', { style: { width: 34, height: 34, borderRadius: 9, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: 'shield', size: 18, style: { color: '#fff' } }))
            : React.createElement('div', { style: { width: 34, height: 34, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: 'home2', size: 18, style: { color: 'var(--primary)' } })),
          React.createElement('div', { className: 'grow', style: { minWidth: 0 } },
            React.createElement('div', { style: { fontSize: 13.5, fontWeight: 700, color: '#fff' }, className: 'trunc' }, isAdmin ? 'Platform Admin' : 'Acme Home Services'),
            React.createElement('div', { style: { fontSize: 11.5, color: 'var(--text-on-dark-muted)' } }, isAdmin ? 'Administrator' : 'Business Owner')),
          React.createElement(Icon, { name: 'chevDown', size: 15, style: { color: 'var(--text-on-dark-muted)' } })),
      ),
      // nav
      React.createElement('div', { className: 'sidebar-scroll' },
        React.createElement('nav', { style: { display: 'flex', flexDirection: 'column', gap: 3 } },
          nav.map(n => React.createElement('button', { key: n.id, className: 'nav-item' + (page === n.id ? ' active' : ''), onClick: () => { onNav(n.id); onClose && onClose(); } },
            React.createElement('span', { className: 'nav-ic' }, React.createElement(Icon, { name: n.icon, size: 19 })),
            React.createElement('span', { className: 'grow' }, n.label),
            n.badge && React.createElement('span', { className: 'nav-badge' }, n.badge)))),
      ),
      // bottom cards
      React.createElement('div', { style: { padding: '0 14px 18px' } },
        !isAdmin && React.createElement('div', { className: 'side-card' },
          React.createElement('div', { className: 'between' },
            React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: '#fff' } }, 'Pro Plan'),
          ),
          React.createElement('div', { style: { fontSize: 12, color: 'var(--text-on-dark-muted)', marginTop: 4 } },
            React.createElement('b', { style: { color: '#fff' } }, '1,248'), ' / 2,500 leads'),
          React.createElement('div', { style: { height: 6, borderRadius: 999, background: 'rgba(255,255,255,.14)', marginTop: 10, overflow: 'hidden' } },
            React.createElement('div', { style: { width: '50%', height: '100%', background: 'var(--primary)', borderRadius: 999 } })),
          React.createElement('div', { style: { fontSize: 11.5, color: 'var(--text-on-dark-muted)', marginTop: 8 } }, 'Resets in 12 days'),
          React.createElement('button', { className: 'btn btn-sm', style: { width: '100%', marginTop: 12, background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.16)' } }, 'Upgrade Plan')),
        isAdmin && React.createElement('div', { className: 'side-card' },
          React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start' } },
            React.createElement(Icon, { name: 'headphones', size: 18, style: { color: '#93C5FD', marginTop: 1 } }),
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: '#fff' } }, 'Need help?'),
              React.createElement('div', { style: { fontSize: 11.5, color: 'var(--text-on-dark-muted)', marginTop: 2 } }, 'View help docs or contact support'))),
          React.createElement('button', { className: 'btn btn-sm', style: { width: '100%', marginTop: 12, background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.16)' } }, 'Contact Support')),
        !isAdmin && React.createElement('div', { className: 'side-card', style: { marginTop: 10 } },
          React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start' } },
            React.createElement(Icon, { name: 'headphones', size: 17, style: { color: '#93C5FD', marginTop: 1 } }),
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: 12.5, fontWeight: 700, color: '#fff' } }, 'Need help?'),
              React.createElement('div', { style: { fontSize: 11, color: 'var(--text-on-dark-muted)', marginTop: 2 } }, 'View help docs or contact support')))),
      ),
    );
  }

  function Topbar({ role, breadcrumb, onMenu, mobileTitle, onSearch }) {
    const isAdmin = role === 'admin';
    return React.createElement('header', { className: 'topbar' },
      React.createElement('button', { className: 'icon-btn only-mobile', onClick: onMenu, style: { marginLeft: -6, flexShrink: 0 } }, React.createElement(Icon, { name: 'menu', size: 20 })),
      // mobile title
      React.createElement('div', { className: 'only-mobile grow', style: { minWidth: 0, fontWeight: 700, fontSize: 15.5 } },
        React.createElement('span', { className: 'trunc', style: { display: 'block' } }, mobileTitle || (isAdmin ? 'Platform Admin' : 'Acme Home Services'))),
      // desktop breadcrumb
      breadcrumb
        ? React.createElement('div', { className: 'breadcrumb grow only-desktop' }, breadcrumb)
        : React.createElement('div', { className: 'grow only-desktop' }),
      // desktop search
      React.createElement('div', { className: 'search-top only-desktop', style: isAdmin ? { maxWidth: 620, margin: '0 auto' } : {} },
        React.createElement('span', { style: { position: 'absolute', left: 14, color: 'var(--text-disabled)', display: 'flex' } }, React.createElement(Icon, { name: 'search', size: 17 })),
        React.createElement('input', { className: 'input', placeholder: isAdmin ? 'Search businesses, owners, leads, and more...' : 'Search leads, customers, messages...', style: { paddingLeft: 42, paddingRight: 70, height: 42, background: 'var(--muted-bg-2)' } }),
        React.createElement('span', { className: 'kbd', style: { position: 'absolute', right: 12 } }, '\u2318 K')),
      React.createElement('div', { className: 'grow only-desktop' }),
      // right cluster
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 } },
        React.createElement('button', { className: 'icon-btn only-mobile', onClick: onSearch }, React.createElement(Icon, { name: 'search', size: 19 })),
        React.createElement('button', { className: 'icon-btn' },
          React.createElement(Icon, { name: 'bell', size: 19 }),
          React.createElement('span', { className: 'notif-dot' }, isAdmin ? 8 : 5)),
        React.createElement('div', { style: { width: 1, height: 26, background: 'var(--border)' }, className: 'only-desktop' }),
        React.createElement(Menu, {
          align: 'right',
          trigger: React.createElement('button', { style: { display: 'flex', alignItems: 'center', gap: 9, border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 4px 4px 6px', borderRadius: 10 } },
            React.createElement(Avatar, { name: isAdmin ? 'Admin User' : 'Alex Johnson', size: 34, color: isAdmin ? '#0F172A' : '#2563EB' }),
            React.createElement('div', { className: 'only-desktop', style: { textAlign: 'left' } },
              React.createElement('div', { style: { fontSize: 13.5, fontWeight: 600, lineHeight: 1.2 } }, isAdmin ? 'Admin User' : 'Alex Johnson'),
              React.createElement('div', { style: { fontSize: 11.5, color: 'var(--text-muted)' } }, isAdmin ? 'Super Admin' : 'Business Owner')),
            React.createElement(Icon, { name: 'chevDown', size: 15, style: { color: 'var(--text-muted)' }, className: 'only-desktop' })),
          items: [
            { icon: 'user', label: 'My Profile' }, { icon: 'settings', label: 'Account Settings' },
            { divider: true }, { icon: 'logout', label: 'Sign out', danger: true },
          ],
        }),
      ),
    );
  }

  function AppShell({ role, page, onNav, breadcrumb, mobileTitle, children }) {
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const isAdmin = role === 'admin';
    return React.createElement('div', { className: 'app-shell' },
      open && React.createElement('div', { className: 'scrim', onClick: () => setOpen(false) }),
      React.createElement(Sidebar, { role, page, onNav, open, onClose: () => setOpen(false) }),
      React.createElement('div', { className: 'main-area' },
        React.createElement(Topbar, { role, breadcrumb, mobileTitle, onMenu: () => setOpen(true), onSearch: () => setSearchOpen(true) }),
        React.createElement('div', { className: 'page-scroll' }, children),
      ),
      searchOpen && React.createElement('div', { className: 'search-overlay fade-in', onClick: () => setSearchOpen(false) },
        React.createElement('div', { className: 'search-sheet', onClick: e => e.stopPropagation() },
          React.createElement('div', { className: 'input-wrap', style: { flex: 1 } },
            React.createElement('span', { className: 'input-icon' }, React.createElement(Icon, { name: 'search', size: 18 })),
            React.createElement('input', { className: 'input has-icon', autoFocus: true, placeholder: isAdmin ? 'Search businesses, owners, leads...' : 'Search leads, customers, messages...' })),
          React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: () => setSearchOpen(false) }, 'Cancel'))),
    );
  }

  window.Shell = { AppShell, OWNER_NAV, ADMIN_NAV };
})();
