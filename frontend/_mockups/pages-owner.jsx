// pages-owner.jsx — Owner: Overview, Follow-ups, Form Link
(function () {
  const { useState } = React;
  const Icon = window.Icon;
  const D = window.DATA;
  const { Button, Badge, Avatar, StatCard, Card, AreaChart, Select, Tabs, Pagination, CopyLinkBox, EmptyState, toast, useIsMobile } = window.UI;

  const FORM_URL = 'https://leadflowpro.com/f/acme-home-services';

  function PageHead({ title, sub, right }) {
    return React.createElement('div', { className: 'between stack-sm', style: { gap: 16, marginBottom: 24, alignItems: 'flex-start' } },
      React.createElement('div', null,
        React.createElement('h1', { className: 'page-title' }, title),
        sub && React.createElement('p', { className: 'page-subtitle' }, sub)),
      right);
  }

  function DateRange() {
    return React.createElement('button', { className: 'btn btn-secondary', style: { gap: 10 } },
      React.createElement(Icon, { name: 'calendar', size: 17, style: { color: 'var(--text-muted)' } }),
      'May 12 \u2013 May 18, 2025',
      React.createElement(Icon, { name: 'chevDown', size: 15, style: { color: 'var(--text-muted)' } }));
  }

  // ============ OVERVIEW ============
  function OwnerOverview({ onNav, onOpenLead }) {
    const kpis = [
      { icon: 'users', label: 'New Leads', value: '128', trend: '24% this week', trendDir: 'up', accent: '#2563EB' },
      { icon: 'clock', label: 'Follow-ups Due', value: '15', trend: '8% this week', trendDir: 'down', accent: '#D97706' },
      { icon: 'calendar', label: 'Booked', value: '32', trend: '14% this week', trendDir: 'up', accent: '#059669' },
      { icon: 'target', label: 'Response Rate', value: '94%', trend: '6% this week', trendDir: 'up', accent: '#0891B2' },
    ];
    const recent = D.LEADS.slice(0, 5);
    const insights = [
      { icon: 'messageDots', t: 'Follow-ups need attention', d: '3 leads are waiting for follow-up today.' },
      { icon: 'calendar', t: 'Fridays are your busiest', d: 'You get 2.1\u00D7 more leads on Fridays.' },
      { icon: 'phone', t: 'Improve contact rate', d: 'Top performers contact 90%+ of new leads.' },
    ];
    const isMobile = useIsMobile(900);

    const header = React.createElement(PageHead, {
      key: 'h',
      title: React.createElement('span', null, 'Welcome back, Alex ', React.createElement('span', { style: { fontSize: 26 } }, '\uD83D\uDC4B')),
      sub: 'What needs your attention today?',
      right: React.createElement(DateRange),
    });

    const needsAction = React.createElement('div', { key: 'na', className: 'needs-action' },
      React.createElement('div', { className: 'na-head' },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
          React.createElement('div', { className: 'na-pulse' }, React.createElement(Icon, { name: 'zap', size: 17 })),
          React.createElement('span', { className: 'section-title', style: { fontSize: 16, color: '#fff' } }, 'Needs Action')),
        React.createElement('span', { style: { fontSize: 12.5, color: 'rgba(255,255,255,.7)' } }, 'Today \u00B7 May 18')),
      React.createElement('div', { className: 'na-grid' },
        [
          { n: 5, label: 'New leads waiting', icon: 'users', cta: 'Review', go: () => onNav('leads') },
          { n: 3, label: 'Follow-ups due today', icon: 'clock', cta: 'Send', go: () => onNav('followups') },
          { n: 2, label: 'AI replies ready to approve', icon: 'sparkles', cta: 'Approve', go: () => onNav('leads') },
        ].map((a, i) => React.createElement('button', { key: i, className: 'na-card', onClick: a.go },
          React.createElement('div', { className: 'na-ic' }, React.createElement(Icon, { name: a.icon, size: 18 })),
          React.createElement('div', { className: 'grow', style: { minWidth: 0, textAlign: 'left' } },
            React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', gap: 7 } },
              React.createElement('span', { style: { fontSize: 22, fontWeight: 700, color: '#fff' } }, a.n),
              React.createElement('span', { style: { fontSize: 13, color: 'rgba(255,255,255,.78)' } }, a.label)),
          ),
          React.createElement('span', { className: 'na-cta' }, a.cta, React.createElement(Icon, { name: 'arrowRight', size: 14 }))))));

    const kpiGrid = React.createElement('div', { key: 'k', className: 'kpi-grid' }, kpis.map((k, i) => React.createElement(StatCard, { key: i, ...k, compact: true })));

    const chartCard = React.createElement(Card, { key: 'c' },
      React.createElement('div', { className: 'between', style: { marginBottom: 14 } },
        React.createElement('span', { className: 'section-title', style: { fontSize: 15 } }, 'Lead Volume'),
        React.createElement('div', { style: { width: 104 } }, React.createElement(Select, { options: ['This week', 'This month', 'This quarter'], value: 'This week', onChange: () => { } }))),
      React.createElement(AreaChart, { data: D.LEAD_VOLUME, height: 190, maxOverride: 80 }));

    const recentBlock = React.createElement(Card, { key: 'r', pad: false },
      React.createElement('div', { className: 'between', style: { padding: '18px 22px 14px' } },
        React.createElement('span', { className: 'section-title', style: { fontSize: 16 } }, 'Recent Leads'),
        React.createElement('button', { className: 'btn btn-ghost btn-xs', onClick: () => onNav('leads') }, 'View all', React.createElement(Icon, { name: 'arrowRight', size: 15 }))),
      isMobile
        ? React.createElement('div', { className: 'mcard-list', style: { padding: '0 14px 14px' } }, recent.map(l => React.createElement('button', { key: l.id, className: 'mcard', onClick: () => onOpenLead(l.id) },
            React.createElement(Avatar, { name: l.name, initials: l.initials, size: 38 }),
            React.createElement('div', { className: 'grow', style: { minWidth: 0, textAlign: 'left' } },
              React.createElement('div', { className: 'between' }, React.createElement('span', { style: { fontWeight: 600, fontSize: 14 }, className: 'trunc' }, l.name), React.createElement(Badge, { dot: false }, l.status)),
              React.createElement('div', { className: 'muted', style: { fontSize: 12.5, marginTop: 3 } }, l.service, ' \u00B7 ', l.time)),
            React.createElement(Icon, { name: 'chevRight', size: 17, style: { color: 'var(--text-disabled)', flexShrink: 0, alignSelf: 'center' } }))))
        : React.createElement('div', { style: { overflowX: 'auto' } },
          React.createElement('table', { className: 'table' },
            React.createElement('thead', null, React.createElement('tr', null, ['Customer', 'Service', 'Status', 'Received', ''].map((h, i) => React.createElement('th', { key: i }, h)))),
            React.createElement('tbody', null, recent.map(l => React.createElement('tr', { key: l.id, style: { cursor: 'pointer' }, onClick: () => onOpenLead(l.id) },
              React.createElement('td', null, React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 11 } }, React.createElement(Avatar, { name: l.name, initials: l.initials, size: 34 }), React.createElement('span', { className: 'strong' }, l.name))),
              React.createElement('td', null, l.service),
              React.createElement('td', null, React.createElement(Badge, null, l.status)),
              React.createElement('td', { className: 'tabnum' }, l.received, ' ', React.createElement('span', { className: 'muted' }, l.time)),
              React.createElement('td', null, React.createElement('button', { className: 'icon-btn', style: { width: 32, height: 32 }, onClick: e => { e.stopPropagation(); onOpenLead(l.id); } }, React.createElement(Icon, { name: 'chevRight', size: 16 })))))))))));

    const formLinkCard = React.createElement(Card, { key: 'fl' },
      React.createElement('div', { className: 'section-title', style: { fontSize: 16 } }, 'Your Public Form Link'),
      React.createElement('p', { className: 'helper', style: { margin: '5px 0 16px' } }, 'Share this link to start capturing leads.'),
      React.createElement(CopyLinkBox, { url: FORM_URL }),
      React.createElement('button', { className: 'btn btn-ghost btn-xs', style: { marginTop: 12, paddingLeft: 0 }, onClick: () => onNav('formlink') }, 'Preview Form', React.createElement(Icon, { name: 'externalLink', size: 14 })));

    const insightsCard = React.createElement(Card, { key: 'ai' },
      React.createElement('div', { className: 'between', style: { marginBottom: 14 } },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, React.createElement(Icon, { name: 'sparkles', size: 17, style: { color: 'var(--primary)' } }), React.createElement('span', { className: 'section-title', style: { fontSize: 16 } }, 'AI Insights'))),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column' } },
        insights.map((it, i) => React.createElement('div', { key: i, className: 'insight-row' },
          React.createElement('div', { className: 'insight-ic' }, React.createElement(Icon, { name: it.icon, size: 15 })),
          React.createElement('div', { className: 'grow', style: { minWidth: 0 } }, React.createElement('div', { style: { fontWeight: 600, fontSize: 13.5 } }, it.t), React.createElement('div', { className: 'muted', style: { fontSize: 12.5, marginTop: 1 } }, it.d))))),
      React.createElement('button', { className: 'btn btn-ghost btn-xs', style: { marginTop: 10, paddingLeft: 0 } }, 'View details', React.createElement(Icon, { name: 'arrowRight', size: 14 })));

    if (isMobile) {
      // mobile: header, Needs Action, KPIs, form link, recent, AI insights, chart
      return React.createElement('div', { className: 'page-pad fade-up', style: { display: 'flex', flexDirection: 'column', gap: 20 } },
        header, needsAction, kpiGrid, formLinkCard, recentBlock, insightsCard, chartCard);
    }
    // desktop: header, Needs Action, KPIs, then 2-col [recent + chart] | [form link + AI]
    return React.createElement('div', { className: 'page-pad fade-up' },
      header,
      React.createElement('div', { style: { marginBottom: 22 } }, needsAction),
      React.createElement('div', { style: { marginBottom: 22 } }, kpiGrid),
      React.createElement('div', { className: 'ov-grid' },
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 22 } }, recentBlock, chartCard),
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 22 } }, formLinkCard, insightsCard),
      ),
    );
  }

  // ============ FOLLOW-UPS ============
  function OwnerFollowups({ onOpenLead }) {
    const [tab, setTab] = useState('due');
    const counts = { due: 0, scheduled: 0, sent: 0, overdue: 0 };
    D.FOLLOWUPS.forEach(f => counts[f.state]++);
    const sentWeek = D.FOLLOWUPS.filter(f => f.state === 'sent').length + 9;
    const kpis = [
      { icon: 'calendarClock', label: 'Due Today', value: counts.due, accent: '#2563EB' },
      { icon: 'calendar', label: 'Scheduled', value: counts.scheduled, accent: '#0891B2' },
      { icon: 'send', label: 'Sent This Week', value: sentWeek, accent: '#059669' },
      { icon: 'clock', label: 'Overdue', value: counts.overdue, accent: '#DC2626' },
    ];
    const tabs = [
      { value: 'due', label: 'Due Today', count: counts.due },
      { value: 'scheduled', label: 'Scheduled', count: counts.scheduled },
      { value: 'overdue', label: 'Overdue', count: counts.overdue },
      { value: 'sent', label: 'Sent', count: counts.sent },
    ];
    const rows = D.FOLLOWUPS.filter(f => f.state === tab);
    const dueBadge = { due: 'badge-blue', scheduled: 'badge-gray', overdue: 'badge-red', sent: 'badge-green' };
    const isMobile = useIsMobile(720);
    const mobileCards = React.createElement('div', { className: 'mcard-list', style: { padding: 16 } }, rows.map(f =>
      React.createElement('div', { key: f.id, className: 'mcard', style: { cursor: 'default', flexDirection: 'column', alignItems: 'stretch' } },
        React.createElement('div', { className: 'mcard-row' },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 } }, React.createElement(Avatar, { name: f.name, initials: f.initials, size: 36 }), React.createElement('div', { style: { minWidth: 0 } }, React.createElement('div', { style: { fontWeight: 600, fontSize: 14 }, className: 'trunc' }, f.name), React.createElement('div', { className: 'muted', style: { fontSize: 12.5 } }, f.service))),
          React.createElement(Badge, { dot: false }, f.status)),
        React.createElement('div', { className: 'mcard-meta' },
          React.createElement('span', null, React.createElement('span', { className: 'k' }, 'Last: '), f.last),
          React.createElement('span', null, React.createElement('span', { className: 'k' }, 'Due: '), React.createElement('span', { className: 'badge ' + dueBadge[f.state], style: { height: 20 } }, React.createElement('span', { className: 'dot' }), f.due))),
        React.createElement('div', { className: 'mcard-actions' },
          tab === 'sent'
            ? React.createElement('button', { className: 'btn btn-secondary btn-sm btn-block', onClick: () => onOpenLead(f.id) }, 'Open Lead')
            : React.createElement(React.Fragment, null,
              React.createElement('button', { className: 'btn btn-secondary btn-sm', style: { flex: 1 }, onClick: () => toast('Follow-up rescheduled') }, 'Reschedule'),
              React.createElement('button', { className: 'btn btn-primary btn-sm', style: { flex: 1 }, onClick: () => toast('Follow-up sent', 'send') }, React.createElement(Icon, { name: 'send', size: 15 }), 'Send'))))));
    return React.createElement('div', { className: 'page-pad fade-up' },
      React.createElement(PageHead, { title: 'Follow-ups', sub: 'Stay on top of leads that need your attention.', right: React.createElement(DateRange) }),
      React.createElement('div', { className: 'kpi-grid', style: { marginBottom: 22 } }, kpis.map((k, i) => React.createElement(StatCard, { key: i, ...k }))),
      React.createElement(Card, { pad: false },
        React.createElement('div', { style: { padding: '16px 20px' } }, React.createElement(Tabs, { tabs, active: tab, onChange: setTab })),
        React.createElement('div', { className: 'divider-h' }),
        rows.length === 0
          ? React.createElement(EmptyState, { icon: 'checkCircle', title: 'All caught up!', text: 'No follow-ups in this category right now.' })
          : isMobile ? mobileCards : React.createElement('div', { style: { overflowX: 'auto' } },
            React.createElement('table', { className: 'table' },
              React.createElement('thead', null, React.createElement('tr', null, ['Customer', 'Service', 'Status', 'Last Contact', 'Follow-up Due', ''].map((h, i) => React.createElement('th', { key: i }, h)))),
              React.createElement('tbody', null, rows.map(f => React.createElement('tr', { key: f.id },
                React.createElement('td', null, React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 11 } }, React.createElement(Avatar, { name: f.name, initials: f.initials, size: 34 }), React.createElement('span', { className: 'strong' }, f.name))),
                React.createElement('td', null, f.service),
                React.createElement('td', null, React.createElement(Badge, null, f.status)),
                React.createElement('td', { className: 'tabnum' }, f.last),
                React.createElement('td', null, React.createElement('span', { className: 'badge ' + dueBadge[f.state] }, React.createElement('span', { className: 'dot' }), f.due)),
                React.createElement('td', null, React.createElement('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' } },
                  tab === 'sent'
                    ? React.createElement('button', { className: 'btn btn-secondary btn-xs', onClick: () => onOpenLead(f.id) }, 'Open Lead')
                    : React.createElement(React.Fragment, null,
                      React.createElement('button', { className: 'btn btn-secondary btn-xs', onClick: () => toast('Follow-up rescheduled') }, 'Reschedule'),
                      React.createElement('button', { className: 'btn btn-primary btn-xs', onClick: () => toast('Follow-up sent', 'send') }, React.createElement(Icon, { name: 'send', size: 14 }), 'Send')
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );
  }

  // ============ FORM LINK ============
  function OwnerFormLink({ onNav }) {
    return React.createElement('div', { className: 'page-pad fade-up' },
      React.createElement(PageHead, { title: 'Form Link', sub: 'Share your public form and start capturing leads instantly.' }),
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 24, alignItems: 'start' }, className: 'fl-grid' },
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 22 } },
          React.createElement(Card, null,
            React.createElement('div', { className: 'section-title', style: { fontSize: 16 } }, 'Your Public Form Link'),
            React.createElement('p', { className: 'helper', style: { margin: '5px 0 16px' } }, 'Anyone with this link can submit a request to your business.'),
            React.createElement(CopyLinkBox, { url: FORM_URL }),
            React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' } },
              React.createElement('button', { className: 'btn btn-secondary btn-sm', onClick: () => onNav('settings') }, React.createElement(Icon, { name: 'externalLink', size: 16 }), 'Preview Form'),
              React.createElement('button', { className: 'btn btn-secondary btn-sm', onClick: () => toast('QR code downloaded') }, React.createElement(Icon, { name: 'grid', size: 16 }), 'Download QR Code'),
              React.createElement('button', { className: 'btn btn-secondary btn-sm', onClick: () => onNav('settings') }, React.createElement(Icon, { name: 'edit', size: 16 }), 'Customize Form'))),
          React.createElement(Card, null,
            React.createElement('div', { className: 'section-title', style: { fontSize: 16, marginBottom: 16 } }, 'Where to share your link'),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } },
              [
                { icon: 'globe', t: 'Your website', d: 'Add a "Get a Quote" button.' },
                { icon: 'users', t: 'Social media', d: 'Post in bio and stories.' },
                { icon: 'mail', t: 'Email signature', d: 'Link in every email you send.' },
                { icon: 'grid', t: 'QR code', d: 'Print on flyers & vehicles.' },
              ].map((c, i) => React.createElement('div', { key: i, style: { display: 'flex', gap: 12, padding: 16, border: '1px solid var(--border)', borderRadius: 12 } },
                React.createElement('div', { style: { width: 38, height: 38, borderRadius: 10, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: c.icon, size: 18 })),
                React.createElement('div', null, React.createElement('div', { style: { fontWeight: 600, fontSize: 13.5 } }, c.t), React.createElement('div', { className: 'muted', style: { fontSize: 12.5, marginTop: 2 } }, c.d)))))),
        ),
        React.createElement(Card, { style: { position: 'sticky', top: 24 } },
          React.createElement('div', { className: 'section-title', style: { fontSize: 16 } }, 'QR Code'),
          React.createElement('p', { className: 'helper', style: { margin: '5px 0 16px' } }, 'Scan to open your form.'),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'center', padding: 18, background: 'var(--muted-bg-2)', borderRadius: 14, border: '1px solid var(--divider)' } }, React.createElement(QR)),
          React.createElement('button', { className: 'btn btn-secondary btn-block btn-sm', style: { marginTop: 14 }, onClick: () => toast('QR code downloaded') }, React.createElement(Icon, { name: 'upload', size: 16 }), 'Download PNG')),
      ),
    );
  }

  function QR() {
    // deterministic pseudo-QR
    const cells = [];
    const grid = 21;
    for (let y = 0; y < grid; y++) for (let x = 0; x < grid; x++) {
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      const on = finder ? ((x === 0 || x === 6 || y === 0 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5)) && !(x > 6 || y > 6) ? true : (x > 13 ? ((x === 14 || x === 20 || y === 0 || y === 6 || (x > 15 && x < 19 && y > 1 && y < 5)) ? true : false) : (y > 13 ? ((x === 0 || x === 6 || y === 14 || y === 20 || (x > 1 && x < 5 && y > 15 && y < 19)) ? true : false) : false))) : ((x * 7 + y * 13 + x * y) % 3 === 0);
      if (on) cells.push(React.createElement('rect', { key: x + '-' + y, x: x * 6, y: y * 6, width: 6, height: 6, fill: 'var(--navy)' }));
    }
    return React.createElement('svg', { width: 150, height: 150, viewBox: '0 0 126 126', style: { borderRadius: 8, background: '#fff', padding: 4 } }, cells);
  }

  window.Pages = window.Pages || {};
  Object.assign(window.Pages, { OwnerOverview, OwnerFollowups, OwnerFormLink, PageHead, DateRange, FORM_URL });
})();
