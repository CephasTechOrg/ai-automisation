// app.jsx — router, persona switcher, tweaks
(function () {
  const { useState, useEffect } = React;
  const Icon = window.Icon;
  const P = window.Pages;
  const { AppShell } = window.Shell;
  const { ToastHost, EmptyState } = window.UI;

  const OWNER_TITLES = { overview: ['Overview'], leads: ['Leads'], followups: ['Follow-ups'], formlink: ['Form Link'], messages: ['Messages'], settings: ['Settings', 'Form Management'] };
  const ADMIN_TITLES = { overview: ['Overview'], businesses: ['Businesses'], create: ['Businesses', 'Create Business'], owners: ['Owners'], leads: ['Leads'], automations: ['Automations'], emails: ['Emails'], audit: ['Audit Logs'], settings: ['Settings'] };

  function Placeholder({ title, icon }) {
    return React.createElement('div', { className: 'page-pad fade-up' },
      React.createElement('div', { className: 'placeholder-page' },
        React.createElement(EmptyState, { icon: icon || 'layers', title: title + ' coming soon', text: 'This section is part of the full LeadFlow Pro platform. The core experiences are fully built out — let me know if you\u2019d like this one fleshed out too.' })));
  }

  function App() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    // mode: 'login' | 'owner' | 'admin' | 'public'
    const [mode, setMode] = useState('owner');
    const [ownerPage, setOwnerPage] = useState('overview');
    const [adminPage, setAdminPage] = useState('overview');
    const [leadJump, setLeadJump] = useState(null);

    // ----- apply tweaks to CSS vars -----
    useEffect(() => {
      const root = document.documentElement;
      const c = t.primaryColor || '#2563EB';
      root.style.setProperty('--primary', c);
      root.style.setProperty('--primary-hover', `color-mix(in srgb, ${c} 86%, black)`);
      root.style.setProperty('--primary-active', `color-mix(in srgb, ${c} 74%, black)`);
      root.style.setProperty('--primary-50', `color-mix(in srgb, ${c} 8%, white)`);
      root.style.setProperty('--primary-100', `color-mix(in srgb, ${c} 16%, white)`);
      root.style.setProperty('--primary-200', `color-mix(in srgb, ${c} 32%, white)`);
      root.style.setProperty('--info', c);
      root.style.setProperty('--info-bg', `color-mix(in srgb, ${c} 8%, white)`);
      root.style.setProperty('--info-border', `color-mix(in srgb, ${c} 30%, white)`);
      const m = c.replace('#', '').match(/.{2}/g) || ['25', '63', 'eb'];
      root.style.setProperty('--primary-rgb', m.map(h => parseInt(h, 16)).join(', '));
    }, [t.primaryColor]);
    useEffect(() => {
      const root = document.documentElement;
      const d = t.density || 'comfortable';
      root.style.setProperty('--row-py', d === 'compact' ? '10px' : '14px');
      root.style.setProperty('--card-pad', d === 'compact' ? '18px' : '22px');
    }, [t.density]);

    function openLead(id) { setLeadJump(id); setOwnerPage('leads'); setMode('owner'); }
    function goOwner(pg) { setOwnerPage(pg); if (pg !== 'leads') setLeadJump(null); }

    let content;
    if (mode === 'login') {
      content = React.createElement(P.LoginPage, { onSignIn: () => setMode('owner') });
    } else if (mode === 'public') {
      content = React.createElement(P.PublicForm);
    } else if (mode === 'owner') {
      const crumb = ownerPage === 'settings' ? React.createElement('div', { className: 'breadcrumb' }, '\u00A0') : null;
      let pg;
      switch (ownerPage) {
        case 'overview': pg = React.createElement(P.OwnerOverview, { onNav: goOwner, onOpenLead: openLead }); break;
        case 'leads': pg = React.createElement(P.LeadsCRM, { key: leadJump || 'leads', initialLead: leadJump }); break;
        case 'followups': pg = React.createElement(P.OwnerFollowups, { onOpenLead: openLead }); break;
        case 'formlink': pg = React.createElement(P.OwnerFormLink, { onNav: goOwner }); break;
        case 'messages': pg = React.createElement(P.OwnerMessages); break;
        case 'settings': pg = React.createElement(P.OwnerFormMgmt); break;
        default: pg = React.createElement(Placeholder, { title: 'Page' });
      }
      content = React.createElement(AppShell, { role: 'owner', page: ownerPage, onNav: goOwner, mobileTitle: (OWNER_TITLES[ownerPage] || ['LeadFlow'])[(OWNER_TITLES[ownerPage] || []).length - 1] }, pg);
    } else if (mode === 'admin') {
      let pg;
      switch (adminPage) {
        case 'overview': pg = React.createElement(P.AdminOverview, { onNav: setAdminPage }); break;
        case 'businesses': pg = React.createElement(P.AdminBusinesses, { onNav: setAdminPage }); break;
        case 'create': pg = React.createElement(P.AdminCreateBusiness, { onNav: setAdminPage }); break;
        case 'audit': pg = React.createElement(P.AdminAudit); break;
        case 'owners': pg = React.createElement(Placeholder, { title: 'Owners & Users', icon: 'users' }); break;
        case 'automations': pg = React.createElement(Placeholder, { title: 'Automations', icon: 'zap' }); break;
        case 'emails': pg = React.createElement(Placeholder, { title: 'Emails', icon: 'mail' }); break;
        case 'leads': pg = React.createElement(Placeholder, { title: 'All Leads', icon: 'userPlus' }); break;
        default: pg = React.createElement(Placeholder, { title: 'Settings', icon: 'settings' });
      }
      content = React.createElement(AppShell, { role: 'admin', page: adminPage, onNav: setAdminPage, mobileTitle: (ADMIN_TITLES[adminPage] || ['Admin'])[(ADMIN_TITLES[adminPage] || []).length - 1] }, pg);
    }

    return React.createElement(React.Fragment, null,
      content,
      React.createElement(ToastHost),
      React.createElement(PersonaSwitcher, { mode, setMode }),
      React.createElement(TweaksPanel, null,
        React.createElement(TweakSection, { label: 'Brand' }),
        React.createElement(TweakColor, { label: 'Primary color', value: t.primaryColor, options: ['#2563EB', '#0F766E', '#7C3AED', '#DB2777', '#EA580C', '#0F172A'], onChange: v => setTweak('primaryColor', v) }),
        React.createElement(TweakSection, { label: 'Layout' }),
        React.createElement(TweakRadio, { label: 'Density', value: t.density, options: ['comfortable', 'compact'], onChange: v => setTweak('density', v) }),
      ),
    );
  }

  function PersonaSwitcher({ mode, setMode }) {
    const [open, setOpen] = useState(false);
    const items = [
      { id: 'login', label: 'Login / Invite', sub: 'Authentication', icon: 'lock' },
      { id: 'admin', label: 'Super Admin', sub: 'Platform portal', icon: 'shield' },
      { id: 'owner', label: 'Business Owner', sub: 'Dashboard', icon: 'home2' },
      { id: 'public', label: 'Public Form', sub: 'Customer-facing', icon: 'globe' },
    ];
    const cur = items.find(i => i.id === mode) || items[2];
    return React.createElement('div', { className: 'persona-fab' },
      open && React.createElement('div', { className: 'persona-pop fade-up' },
        React.createElement('div', { style: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', padding: '6px 11px 8px' } }, 'View as'),
        items.map(it => React.createElement('button', { key: it.id, className: 'persona-item' + (mode === it.id ? ' active' : ''), onClick: () => { setMode(it.id); setOpen(false); } },
          React.createElement('div', { style: { width: 34, height: 34, borderRadius: 9, background: mode === it.id ? 'var(--primary)' : 'var(--muted-bg)', color: mode === it.id ? '#fff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: it.icon, size: 17 })),
          React.createElement('div', { style: { textAlign: 'left' } },
            React.createElement('div', { style: { fontSize: 13.5, fontWeight: 600, color: mode === it.id ? 'var(--primary)' : 'var(--text)' } }, it.label),
            React.createElement('div', { className: 'muted', style: { fontSize: 11.5 } }, it.sub)),
          mode === it.id && React.createElement(Icon, { name: 'check', size: 16, style: { color: 'var(--primary)', marginLeft: 'auto' } }))),
      ),
      React.createElement('button', { onClick: () => setOpen(o => !o), style: { display: 'flex', alignItems: 'center', gap: 9, height: 46, padding: '0 16px 0 14px', borderRadius: 999, background: 'var(--navy)', color: '#fff', border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' } },
        React.createElement(Icon, { name: cur.icon, size: 17, style: { color: '#93C5FD' } }),
        React.createElement('span', { className: 'hide-sm' }, cur.label),
        React.createElement(Icon, { name: open ? 'chevDown' : 'chevUp', size: 15, style: { opacity: .7 } })),
    );
  }

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{ "primaryColor": "#2563EB", "density": "comfortable" }/*EDITMODE-END*/;

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();
