// pages-admin.jsx — Admin: Overview + Businesses
(function () {
  const { useState } = React;
  const Icon = window.Icon;
  const D = window.DATA;
  const { Button, Badge, PlanBadge, Avatar, BrandTile, StatCard, Card, AreaChart, Donut, Select, Menu, Pagination, Input, toast, useIsMobile } = window.UI;

  function DateRange() {
    return React.createElement('button', { className: 'btn btn-secondary' },
      React.createElement(Icon, { name: 'calendar', size: 17, style: { color: 'var(--text-muted)' } }), 'May 12 \u2013 May 18, 2025', React.createElement(Icon, { name: 'chevDown', size: 15, style: { color: 'var(--text-muted)' } }));
  }

  // ============ ADMIN OVERVIEW ============
  function AdminOverview({ onNav }) {
    const kpis = [
      { icon: 'building', label: 'Total Businesses', value: '248', trend: '18%', trendDir: 'up', accent: '#2563EB' },
      { icon: 'users', label: 'Active Owners', value: '312', trend: '14%', trendDir: 'up', accent: '#0891B2' },
      { icon: 'userPlus', label: 'New Leads Today', value: '128', trend: '24%', trendDir: 'up', accent: '#059669' },
      { icon: 'mail', label: 'Emails Sent', value: '1,842', trend: '16%', trendDir: 'up', accent: '#7C3AED' },
    ];
    const actTone = { blue: 'var(--primary)', violet: 'var(--violet)', green: 'var(--green)', gray: 'var(--text-muted)' };
    return React.createElement('div', { className: 'page-pad fade-up' },
      React.createElement('div', { className: 'between stack-sm', style: { gap: 16, marginBottom: 24, alignItems: 'flex-start' } },
        React.createElement('div', null, React.createElement('h1', { className: 'page-title' }, 'Admin Overview'), React.createElement('p', { className: 'page-subtitle' }, 'Monitor platform activity and system performance.')),
        React.createElement(DateRange)),
      React.createElement('div', { className: 'kpi-grid', style: { marginBottom: 22 } }, kpis.map((k, i) => React.createElement(StatCard, { key: i, ...k, trendNote: 'vs May 5 \u2013 May 11' }))),
      React.createElement('div', { className: 'ov-grid' },
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 22 } },
          React.createElement(Card, null,
            React.createElement('div', { className: 'between', style: { marginBottom: 18 } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, React.createElement('span', { className: 'section-title', style: { fontSize: 16 } }, 'Platform Growth'), React.createElement(Icon, { name: 'info', size: 15, style: { color: 'var(--text-disabled)' } })),
              React.createElement('div', { style: { width: 110 } }, React.createElement(Select, { options: ['Daily', 'Weekly', 'Monthly'], value: 'Daily', onChange: () => { } }))),
            React.createElement(AreaChart, { data: D.PLATFORM_GROWTH, height: 250, maxOverride: 1000 })),
          React.createElement(Card, { pad: false },
            React.createElement('div', { className: 'between', style: { padding: '18px 22px 14px' } },
              React.createElement('span', { className: 'section-title', style: { fontSize: 16 } }, 'Recently Added Businesses'),
              React.createElement('button', { className: 'btn btn-ghost btn-xs', onClick: () => onNav('businesses') }, 'View all businesses', React.createElement(Icon, { name: 'arrowRight', size: 14 }))),
            React.createElement('div', { style: { overflowX: 'auto' } },
              React.createElement('table', { className: 'table' },
                React.createElement('thead', null, React.createElement('tr', null, ['Business', 'Owner', 'Plan', 'Added On', 'Status', 'Actions'].map(h => React.createElement('th', { key: h }, h)))),
                React.createElement('tbody', null, D.BUSINESSES.slice(0, 5).map(b => React.createElement('tr', { key: b.slug },
                  React.createElement('td', null, React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 11 } }, React.createElement(BrandTile, { icon: b.icon, color: b.color, name: b.name, size: 34 }), React.createElement('div', null, React.createElement('div', { className: 'strong' }, b.name), React.createElement('div', { className: 'muted', style: { fontSize: 12 } }, b.domain)))),
                  React.createElement('td', null, React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, React.createElement(Avatar, { name: b.owner, size: 26 }), b.owner)),
                  React.createElement('td', null, React.createElement(PlanBadge, null, b.plan)),
                  React.createElement('td', { className: 'tabnum' }, b.added),
                  React.createElement('td', null, React.createElement(Badge, null, b.status === 'Pending' ? 'Invited' : b.status)),
                  React.createElement('td', null, React.createElement(Menu, { trigger: React.createElement('button', { className: 'icon-btn', style: { width: 32, height: 32 } }, React.createElement(Icon, { name: 'more', size: 18 })), items: bizMenu(onNav) })))))),
            React.createElement('div', { style: { padding: '4px 18px 14px' } }, React.createElement(Pagination, { page: 1, pages: 5, info: 'Showing 1 to 5 of 248 businesses', onPage: () => { } }))),
        ),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 22 } },
          React.createElement(Card, null,
            React.createElement('div', { className: 'between', style: { marginBottom: 16 } }, React.createElement('span', { className: 'section-title', style: { fontSize: 16 } }, 'Recent Activity'), React.createElement('button', { className: 'btn btn-ghost btn-xs' }, 'View all', React.createElement(Icon, { name: 'arrowRight', size: 14 }))),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
              D.ACTIVITY.map((a, i) => React.createElement('div', { key: i, style: { display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < D.ACTIVITY.length - 1 ? '1px solid var(--divider)' : 'none' } },
                React.createElement('div', { style: { width: 34, height: 34, borderRadius: 9, background: actTone[a.tone] + '14', color: actTone[a.tone], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: a.icon, size: 16 })),
                React.createElement('div', { className: 'grow', style: { minWidth: 0 } }, React.createElement('div', { style: { fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 } }, a.title), React.createElement('div', { className: 'muted', style: { fontSize: 12, marginTop: 2 } }, a.meta + ' \u00B7 ' + a.time)))))),
          React.createElement(Card, null,
            React.createElement('div', { className: 'section-title', style: { fontSize: 16, marginBottom: 16 } }, 'Quick Actions'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } },
              [
                { icon: 'plus', t: 'Add Business', d: 'Create a new business', action: () => onNav('create') },
                { icon: 'userPlus', t: 'Add Owner', d: 'Invite a new owner', action: () => toast('Invite owner') },
                { icon: 'mail', t: 'Resend Invite', d: 'Resend owner invitation', action: () => toast('Invite resent', 'send') },
                { icon: 'fileText', t: 'View Audit Logs', d: 'Review system activity', action: () => onNav('audit') },
              ].map((q, i) => React.createElement('button', { key: i, className: 'qa-card', onClick: q.action },
                React.createElement('div', { style: { width: 40, height: 40, borderRadius: 10, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 } }, React.createElement(Icon, { name: q.icon, size: 19 })),
                React.createElement('div', { style: { fontWeight: 600, fontSize: 13.5 } }, q.t),
                React.createElement('div', { className: 'muted', style: { fontSize: 12, marginTop: 2 } }, q.d))))),
        ),
      ),
    )
  );
  }

  function bizMenu(onNav) {
    return [
      { icon: 'eye', label: 'View Business' }, { icon: 'edit', label: 'Edit Business', onClick: () => onNav && onNav('create') },
      { icon: 'copy', label: 'Copy Form Link', onClick: () => toast('Form link copied') }, { icon: 'mail', label: 'Resend Owner Invite', onClick: () => toast('Invite resent', 'send') },
      { divider: true }, { icon: 'pause', label: 'Pause Business', onClick: () => toast('Business paused') }, { icon: 'trash', label: 'Archive Business', danger: true },
    ];
  }

  // ============ BUSINESSES ============
  function AdminBusinesses({ onNav }) {
    const [q, setQ] = useState('');
    const [industry, setIndustry] = useState('Industry');
    const [status, setStatus] = useState('Status');
    const [page, setPage] = useState(1);
    let rows = D.BUSINESSES.filter(b =>
      (b.name.toLowerCase().includes(q.toLowerCase()) || b.owner.toLowerCase().includes(q.toLowerCase()) || b.industry.toLowerCase().includes(q.toLowerCase())) &&
      (industry === 'Industry' || b.industry === industry) &&
      (status === 'Status' || b.status === status));
    const counts = { Active: 0, Pending: 0, Paused: 0 };
    D.BUSINESSES.forEach(b => counts[b.status]++);
    const isMobile = useIsMobile(860);

    const bizCards = React.createElement('div', { className: 'mcard-list', style: { padding: 14 } }, rows.length === 0
      ? React.createElement(window.UI.EmptyState, { icon: 'building', title: 'No businesses found', text: 'Try adjusting your search or filters.' })
      : rows.map(b => React.createElement('div', { key: b.slug, className: 'mcard', style: { cursor: 'default', flexDirection: 'column', alignItems: 'stretch' } },
        React.createElement('div', { className: 'mcard-row' },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 } }, React.createElement(BrandTile, { icon: b.icon, color: b.color, name: b.name, size: 38 }), React.createElement('div', { style: { minWidth: 0 } }, React.createElement('div', { style: { fontWeight: 600, fontSize: 14 }, className: 'trunc' }, b.name), React.createElement('div', { className: 'muted trunc', style: { fontSize: 12 } }, b.domain))),
          React.createElement(Badge, null, b.status)),
        React.createElement('div', { className: 'mcard-meta' },
          React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 6 } }, React.createElement(Avatar, { name: b.owner, size: 20 }), b.owner),
          React.createElement('span', null, React.createElement('span', { className: 'k' }, 'Industry: '), b.industry),
          React.createElement('span', null, React.createElement('span', { className: 'k' }, 'Leads: '), React.createElement('b', { style: { color: 'var(--text)' } }, b.leads))),
        React.createElement('div', { className: 'mcard-actions' },
          React.createElement('button', { className: 'btn btn-secondary btn-sm', style: { flex: 1 }, onClick: () => toast('Form link copied') }, React.createElement(Icon, { name: 'link', size: 15 }), 'Form Link'),
          React.createElement(Menu, { trigger: React.createElement('button', { className: 'btn btn-secondary btn-sm btn-icon' }, React.createElement(Icon, { name: 'more', size: 18 })), items: bizMenu(onNav) })))));

    return React.createElement('div', { className: 'page-pad fade-up' },
      React.createElement('div', { className: 'between stack-sm', style: { gap: 16, marginBottom: 24, alignItems: 'flex-start' } },
        React.createElement('div', null, React.createElement('h1', { className: 'page-title' }, 'Businesses'), React.createElement('p', { className: 'page-subtitle' }, 'Manage and monitor all businesses in your LeadFlow Pro account.')),
        React.createElement('button', { className: 'btn btn-primary', onClick: () => onNav('create') }, React.createElement(Icon, { name: 'plus', size: 17 }), 'Add Business')),
      React.createElement('div', { className: 'biz-grid' },
        React.createElement('div', { style: { minWidth: 0 } },
          React.createElement('div', { style: { display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' } },
            React.createElement('div', { className: 'input-wrap', style: { flex: 1, minWidth: 220 } }, React.createElement('span', { className: 'input-icon' }, React.createElement(Icon, { name: 'search', size: 16 })), React.createElement('input', { className: 'input has-icon', placeholder: 'Search businesses or owners...', value: q, onChange: e => setQ(e.target.value) })),
            React.createElement('div', { style: { width: 140 } }, React.createElement(Select, { options: ['Status', 'Active', 'Pending', 'Paused'], value: status, onChange: setStatus })),
            React.createElement(Menu, { align: 'right', trigger: React.createElement('button', { className: 'btn btn-secondary' }, React.createElement(Icon, { name: 'filter', size: 16 }), 'More Filters'), items: [{ icon: 'briefcase', label: 'All industries' }, ...D.INDUSTRIES.slice(0, 5).map(ind => ({ icon: industry === ind ? 'check' : 'chevRight', label: ind, onClick: () => setIndustry(ind) })), { divider: true }, { icon: 'creditCard', label: 'Filter by plan' }, { icon: 'calendar', label: 'Date added' }] })),
          React.createElement(Card, { pad: false },
            isMobile ? bizCards : React.createElement('div', { style: { overflowX: 'auto' } },
              React.createElement('table', { className: 'table' },
                React.createElement('thead', null, React.createElement('tr', null, ['Business', 'Owner', 'Status', 'Leads', ''].map((h, i) => React.createElement('th', { key: i, style: h === 'Leads' ? { textAlign: 'right' } : null }, h)))),
                React.createElement('tbody', null, rows.length === 0
                  ? React.createElement('tr', null, React.createElement('td', { colSpan: 5 }, React.createElement(window.UI.EmptyState, { icon: 'building', title: 'No businesses found', text: 'Try adjusting your search or filters.' })))
                  : rows.map(b => React.createElement('tr', { key: b.slug },
                    React.createElement('td', null, React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 11 } }, React.createElement(BrandTile, { icon: b.icon, color: b.color, name: b.name, size: 36 }), React.createElement('div', null, React.createElement('div', { className: 'strong' }, b.name), React.createElement('div', { className: 'muted', style: { fontSize: 12 } }, b.industry)))),
                    React.createElement('td', null, React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, React.createElement(Avatar, { name: b.owner, size: 28 }), b.owner)),
                    React.createElement('td', null, React.createElement(Badge, null, b.status)),
                    React.createElement('td', { className: 'strong tabnum', style: { textAlign: 'right' } }, b.leads),
                    React.createElement('td', null, React.createElement(Menu, { trigger: React.createElement('button', { className: 'icon-btn', style: { width: 32, height: 32 } }, React.createElement(Icon, { name: 'more', size: 18 })), items: bizMenu(onNav) })))))),
            ),
            React.createElement('div', { style: { padding: '8px 18px 14px' } }, React.createElement(Pagination, { page, pages: 5, info: 'Showing 1 to ' + rows.length + ' of 48 businesses', onPage: setPage }))),
        ),
        // right summary
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 22 } },
          React.createElement(Card, null,
            React.createElement('div', { className: 'section-title', style: { fontSize: 16 } }, 'Business Summary'),
            React.createElement('div', { style: { fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', margin: '12px 0 2px' } }, '48'),
            React.createElement('div', { className: 'muted', style: { fontSize: 13 } }, 'Total Businesses'),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 18 } },
              [['42', 'Active', 'var(--green)'], ['3', 'Pending', 'var(--amber)'], ['3', 'Paused', 'var(--text-muted)']].map((s, i) => React.createElement('div', { key: i },
                React.createElement('div', { style: { fontSize: 22, fontWeight: 700 } }, s[0]),
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 } }, React.createElement('span', { style: { width: 7, height: 7, borderRadius: '50%', background: s[2] } }), s[1]))))),
          React.createElement(Card, null,
            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } }, React.createElement('span', { className: 'section-title', style: { fontSize: 16 } }, 'Onboarding Progress'), React.createElement(Icon, { name: 'info', size: 15, style: { color: 'var(--text-disabled)' } })),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'center', padding: '8px 0 4px' } }, React.createElement(Donut, { value: 71, size: 150, label: '71%', sub: 'Completed' })),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 12 } },
              [['34', 'Completed', 'var(--green)'], ['14', 'In Progress', 'var(--primary)']].map((s, i) => React.createElement('div', { key: i },
                React.createElement('div', { style: { fontSize: 20, fontWeight: 700 } }, s[0]),
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 } }, React.createElement('span', { style: { width: 7, height: 7, borderRadius: '50%', background: s[2] } }), s[1]))))),
          React.createElement(Card, null,
            React.createElement('div', { className: 'between', style: { marginBottom: 14 } }, React.createElement('span', { className: 'section-title', style: { fontSize: 16 } }, 'Recent Registrations'), React.createElement('button', { className: 'btn btn-ghost btn-xs' }, 'View all')),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
              D.BUSINESSES.slice(6, 11).map(b => React.createElement('div', { key: b.slug, style: { display: 'flex', alignItems: 'center', gap: 11 } },
                React.createElement(BrandTile, { icon: b.icon, color: b.color, name: b.name, size: 32 }),
                React.createElement('div', { className: 'grow', style: { minWidth: 0 } }, React.createElement('div', { style: { fontSize: 13, fontWeight: 600 }, className: 'trunc' }, b.name), React.createElement('div', { className: 'muted', style: { fontSize: 11.5 } }, b.added)))))),
        ),
      ),
    );
  }

  window.Pages = window.Pages || {};
  Object.assign(window.Pages, { AdminOverview, AdminBusinesses });
})();
