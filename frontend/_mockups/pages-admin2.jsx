// pages-admin2.jsx — Admin: Create Business + Audit Logs
(function () {
  const { useState } = React;
  const Icon = window.Icon;
  const D = window.DATA;
  const { Button, Badge, Card, Field, Input, Select, Textarea, Toggle, Menu, Avatar, toast, useIsMobile } = window.UI;

  function slugify(s) { return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  // ============ CREATE BUSINESS ============
  function AdminCreateBusiness({ onNav }) {
    const [f, setF] = useState({
      name: 'Acme Home Services', industry: 'Home Services', phone: '(555) 123-4567', email: 'support@acmehomeservices.com', address: '123 Main St, San Diego, CA 92101',
      slug: 'acme-home-services', slugEdited: false,
      ownerName: 'Alex Johnson', ownerEmail: 'alex.johnson@acmehomeservices.com', ownerPhone: '(555) 987-6543', role: 'Business Owner',
      color: '#2563EB', welcome: "Thanks for reaching out to Acme Home Services! We're here to help with all your home service needs. Fill out the form below and we'll get back to you as soon as possible.",
      autoReply: true, assignTo: 'Primary Owner (Alex Johnson)', followup: true, delay: '24 hours',
    });
    function set(k, v) { setF(s => { const n = { ...s, [k]: v }; if (k === 'name' && !s.slugEdited) n.slug = slugify(v); if (k === 'slug') n.slugEdited = true; return n; }); }
    const formUrl = 'https://leadflowpro.com/f/' + (f.slug || 'your-business');

    const checklist = [
      { t: 'Business Information', d: 'Add your business details', done: !!f.name && !!f.industry },
      { t: 'Owner Information', d: 'Add owner contact details', done: !!f.ownerName && !!f.ownerEmail },
      { t: 'Branding', d: 'Customize your brand', done: !!f.welcome },
      { t: 'Automation Settings', d: 'Configure lead automation', done: true },
      { t: 'Send Invite', d: 'Invite your team member', done: false, active: true },
    ];

    function Section({ n, title, children }) {
      return React.createElement(Card, null,
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 } },
          React.createElement('div', { style: { width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 } }, n),
          React.createElement('span', { className: 'section-title', style: { fontSize: 16 } }, title)),
        children);
    }

    return React.createElement('div', { className: 'page-pad fade-up', style: { paddingBottom: 40 } },
      React.createElement('div', { className: 'breadcrumb', style: { marginBottom: 14 } }, React.createElement('span', { className: 'crumb-link', onClick: () => onNav('businesses') }, 'Onboarding'), React.createElement(Icon, { name: 'chevRight', size: 14 }), React.createElement('span', { className: 'crumb-cur' }, 'Create Business')),
      React.createElement('h1', { className: 'page-title' }, 'Create Your Business'),
      React.createElement('p', { className: 'page-subtitle', style: { marginBottom: 26 } }, "Let's set up your business and get you ready to start capturing leads."),
      React.createElement('div', { className: 'cb-grid' },
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 22 } },
          React.createElement(Section, { n: 1, title: 'Business Information' },
            React.createElement('div', { className: 'cb-2col' },
              React.createElement(Field, { label: 'Business Name', required: true }, React.createElement(Input, { value: f.name, onChange: e => set('name', e.target.value) })),
              React.createElement(Field, { label: 'Industry', required: true }, React.createElement(Select, { options: D.INDUSTRIES, value: f.industry, onChange: v => set('industry', v) })),
              React.createElement(Field, { label: 'Business Phone' }, React.createElement(Input, { value: f.phone, onChange: e => set('phone', e.target.value) })),
              React.createElement(Field, { label: 'Business Email' }, React.createElement(Input, { value: f.email, onChange: e => set('email', e.target.value) }))),
            React.createElement(Field, { label: 'Business Address', className: 'cb-field' }, React.createElement(Input, { value: f.address, onChange: e => set('address', e.target.value) })),
            React.createElement(Field, { label: 'Business Slug', helper: 'Auto-generated from your business name \u2014 editable.', className: 'cb-field' },
              React.createElement(Input, { value: f.slug, onChange: e => set('slug', slugify(e.target.value)) }))),
          React.createElement(Section, { n: 2, title: 'Owner Information' },
            React.createElement('div', { className: 'cb-2col' },
              React.createElement(Field, { label: 'Owner Name', required: true }, React.createElement(Input, { value: f.ownerName, onChange: e => set('ownerName', e.target.value) })),
              React.createElement(Field, { label: 'Owner Email', required: true }, React.createElement(Input, { value: f.ownerEmail, onChange: e => set('ownerEmail', e.target.value) })),
              React.createElement(Field, { label: 'Owner Phone' }, React.createElement(Input, { value: f.ownerPhone, onChange: e => set('ownerPhone', e.target.value) })),
              React.createElement(Field, { label: 'Role' }, React.createElement(Select, { options: ['Business Owner', 'Manager', 'Team Member'], value: f.role, onChange: v => set('role', v) })))),
          React.createElement(Section, { n: 3, title: 'Branding' },
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' } },
              React.createElement(Field, { label: 'Brand Color', helper: 'This color will be used in your public form and emails.' },
                React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
                  React.createElement('label', { style: { width: 38, height: 38, borderRadius: 8, background: f.color, cursor: 'pointer', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border)' } }, React.createElement('input', { type: 'color', value: f.color, onChange: e => set('color', e.target.value), style: { opacity: 0, width: '100%', height: '100%' } })),
                  React.createElement(Input, { value: f.color.toUpperCase(), onChange: e => set('color', e.target.value) }))),
              React.createElement(Field, { label: 'Business Logo' },
                React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'center' } },
                  React.createElement('div', { style: { width: 56, height: 56, borderRadius: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--muted-bg-2)', flexShrink: 0 } }, React.createElement(Icon, { name: 'home2', size: 24, style: { color: f.color } })),
                  React.createElement('div', null, React.createElement('button', { className: 'btn btn-secondary btn-sm' }, React.createElement(Icon, { name: 'upload', size: 15 }), 'Upload Logo'), React.createElement('div', { className: 'helper', style: { marginTop: 6 } }, 'PNG, JPG or SVG. Max size 2MB.'))))),
            React.createElement(Field, { label: 'Welcome Message', className: 'cb-field' },
              React.createElement(Textarea, { value: f.welcome, maxLength: 500, onChange: e => set('welcome', e.target.value), style: { minHeight: 90 } }),
              React.createElement('div', { style: { textAlign: 'right', fontSize: 12, color: 'var(--text-disabled)', marginTop: 2 } }, f.welcome.length + ' / 500 characters'))),
          React.createElement(Section, { n: 4, title: 'Automation Settings' },
            React.createElement('div', { className: 'cb-2col', style: { alignItems: 'start' } },
              React.createElement('div', null,
                React.createElement('div', { className: 'between' }, React.createElement('div', null, React.createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, 'Auto-Reply to New Leads'), React.createElement('p', { className: 'helper', style: { margin: '4px 0 0', maxWidth: 240 } }, 'Automatically send a welcome email when a new lead is captured.')), React.createElement(Toggle, { on: f.autoReply, onChange: v => set('autoReply', v) }))),
              React.createElement(Field, { label: 'Assign New Leads To', helper: 'Choose who receives new leads by default.' }, React.createElement(Select, { options: ['Primary Owner (Alex Johnson)', 'Round Robin', 'Unassigned'], value: f.assignTo, onChange: v => set('assignTo', v) }))),
            React.createElement('div', { className: 'cb-2col', style: { marginTop: 18, alignItems: 'start' } },
              React.createElement('div', null,
                React.createElement('div', { className: 'between' }, React.createElement('div', null, React.createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, 'Follow-up Enabled'), React.createElement('p', { className: 'helper', style: { margin: '4px 0 0', maxWidth: 240 } }, 'Schedule automatic follow-ups for new leads.')), React.createElement(Toggle, { on: f.followup, onChange: v => set('followup', v) }))),
              React.createElement(Field, { label: 'Default Follow-up Delay' }, React.createElement(Select, { options: ['1 hour', '4 hours', '24 hours', '48 hours', '3 days'], value: f.delay, onChange: v => set('delay', v) })))),
          React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap' } },
            React.createElement('button', { className: 'btn btn-secondary', onClick: () => toast('Draft saved') }, 'Save Draft'),
            React.createElement('button', { className: 'btn btn-ghost', onClick: () => onNav('businesses') }, 'Cancel'),
            React.createElement('button', { className: 'btn btn-primary', style: { marginLeft: 'auto' }, onClick: () => { toast('Business created & invite sent!', 'checkCircle'); setTimeout(() => onNav('businesses'), 800); } }, React.createElement(Icon, { name: 'send', size: 16 }), 'Create Business & Send Invite')),
        ),
        // RIGHT panels
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 18 } },
          React.createElement(Card, null,
            React.createElement('div', { className: 'section-title', style: { fontSize: 15 } }, 'Public Form Preview'),
            React.createElement('p', { className: 'helper', style: { margin: '5px 0 14px' } }, 'See how your form link will look to your customers.'),
            React.createElement('div', { style: { border: '1px solid var(--border)', borderRadius: 12, padding: 16, background: 'var(--muted-bg-2)' } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 } }, React.createElement(Icon, { name: 'home2', size: 18, style: { color: f.color } }), React.createElement('div', { className: 'skeleton', style: { height: 9, width: 70 } })),
              React.createElement('div', { className: 'skeleton', style: { height: 12, width: '70%', marginBottom: 12 } }),
              [80, 100, 100, 60].map((w, i) => React.createElement('div', { key: i, className: 'skeleton', style: { height: 26, width: w + '%', marginBottom: 8, borderRadius: 6 } })),
              React.createElement('div', { style: { height: 30, borderRadius: 6, background: f.color, marginTop: 6 } }))),
          React.createElement(Card, null,
            React.createElement('div', { className: 'section-title', style: { fontSize: 15 } }, 'Your Public Form Link'),
            React.createElement('p', { className: 'helper', style: { margin: '5px 0 12px' } }, 'Share this link to start capturing leads.'),
            React.createElement(window.UI.CopyLinkBox, { url: formUrl })),
          React.createElement(Card, null,
            React.createElement('div', { className: 'between', style: { marginBottom: 6 } }, React.createElement('span', { className: 'section-title', style: { fontSize: 15 } }, 'Owner Invite Status'), React.createElement(Badge, { tone: 'green', dot: false }, 'Ready to Send')),
            React.createElement('p', { className: 'helper', style: { margin: '4px 0 4px' } }, 'An invite will be sent to'),
            React.createElement('div', { style: { fontSize: 13.5, fontWeight: 600, color: 'var(--primary)', marginBottom: 12 } }, f.ownerEmail),
            React.createElement('button', { className: 'btn btn-secondary btn-block', style: { color: 'var(--primary)', borderColor: 'var(--primary-200)' }, onClick: () => toast('Invite sent', 'send') }, React.createElement(Icon, { name: 'send', size: 16 }), 'Send Invite')),
          React.createElement(Card, null,
            React.createElement('div', { className: 'section-title', style: { fontSize: 15, marginBottom: 14 } }, 'Onboarding Checklist'),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
              checklist.map((c, i) => React.createElement('div', { key: i, style: { display: 'flex', gap: 11, alignItems: 'flex-start' } },
                c.done ? React.createElement('div', { style: { width: 20, height: 20, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 } }, React.createElement(Icon, { name: 'check', size: 13, stroke: 3, style: { color: '#fff' } }))
                  : React.createElement('div', { style: { width: 20, height: 20, borderRadius: '50%', border: '2px solid ' + (c.active ? 'var(--primary)' : 'var(--border-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 } }, c.active && React.createElement('div', { style: { width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' } })),
                React.createElement('div', null, React.createElement('div', { style: { fontSize: 13.5, fontWeight: 600, color: c.active ? 'var(--primary)' : 'var(--text)' } }, c.t), React.createElement('div', { className: 'muted', style: { fontSize: 12, marginTop: 1 } }, c.d)))),
            ),
            React.createElement('p', { className: 'helper', style: { marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--divider)' } }, 'Complete all steps to finish onboarding.')),
        ),
      ),
    );
  }

  // ============ AUDIT LOGS ============
  function AdminAudit() {
    const [type, setType] = useState('All Actions');
    const [biz, setBiz] = useState('All Businesses');
    const [q, setQ] = useState('');
    const typeMap = { create: { c: 'green', i: 'plus' }, invite: { c: 'violet', i: 'userPlus' }, update: { c: 'blue', i: 'edit' }, read: { c: 'gray', i: 'eye' }, email: { c: 'blue', i: 'mail' }, pause: { c: 'amber', i: 'pause' } };
    let rows = D.AUDIT.filter(a =>
      (type === 'All Actions' || a.action === type) &&
      (biz === 'All Businesses' || a.business === biz) &&
      (a.actor.toLowerCase().includes(q.toLowerCase()) || a.action.toLowerCase().includes(q.toLowerCase()) || a.details.toLowerCase().includes(q.toLowerCase())));
    const actions = ['All Actions', ...Array.from(new Set(D.AUDIT.map(a => a.action)))];
    const bizes = ['All Businesses', ...Array.from(new Set(D.AUDIT.map(a => a.business)))];
    const isMobile = useIsMobile(820);
    const toneBg = c => c === 'gray' ? 'var(--muted-bg)' : c === 'blue' ? 'var(--info-bg)' : c === 'green' ? 'var(--green-bg)' : c === 'amber' ? 'var(--amber-bg)' : 'var(--violet-bg)';
    const toneFg = c => c === 'gray' ? 'var(--text-muted)' : 'var(--' + c + ')';
    const auditCards = React.createElement('div', { className: 'mcard-list', style: { padding: 14 } }, rows.length === 0
      ? React.createElement(window.UI.EmptyState, { icon: 'fileText', title: 'No log entries', text: 'No activity matches your filters.' })
      : rows.map((a, i) => { const m = typeMap[a.type] || typeMap.read; return React.createElement('div', { key: i, className: 'mcard', style: { cursor: 'default', flexDirection: 'column', alignItems: 'stretch' } },
        React.createElement('div', { className: 'mcard-row' },
          React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 7 } }, React.createElement('span', { style: { width: 26, height: 26, borderRadius: 7, background: toneBg(m.c), color: toneFg(m.c), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: m.i, size: 13 })), React.createElement('span', { className: 'strong', style: { fontSize: 13.5 } }, a.action)),
          React.createElement('span', { className: 'muted', style: { fontSize: 11.5, flexShrink: 0 } }, a.ts)),
        React.createElement('div', { style: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 } }, a.details),
        React.createElement('div', { className: 'mcard-meta' },
          React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 6 } }, a.actor === 'System' ? React.createElement(Icon, { name: 'zap', size: 13 }) : React.createElement(Avatar, { name: a.actor, size: 18 }), a.actor),
          React.createElement('span', null, React.createElement('span', { className: 'k' }, 'Business: '), a.business))); }));

    return React.createElement('div', { className: 'page-pad fade-up' },
      React.createElement('div', { className: 'between stack-sm', style: { gap: 16, marginBottom: 24, alignItems: 'flex-start' } },
        React.createElement('div', null, React.createElement('h1', { className: 'page-title' }, 'Audit Logs'), React.createElement('p', { className: 'page-subtitle' }, 'Track every system action for safety and accountability.')),
        React.createElement('button', { className: 'btn btn-secondary', onClick: () => toast('Logs exported') }, React.createElement(Icon, { name: 'upload', size: 16 }), 'Export CSV')),
      React.createElement(Card, { pad: false },
        React.createElement('div', { style: { display: 'flex', gap: 10, padding: 16, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid var(--border)' } },
          React.createElement('div', { className: 'input-wrap', style: { flex: 1, minWidth: 220 } }, React.createElement('span', { className: 'input-icon' }, React.createElement(Icon, { name: 'search', size: 16 })), React.createElement('input', { className: 'input has-icon', placeholder: 'Search by actor, action, or details...', value: q, onChange: e => setQ(e.target.value), style: { height: 40 } })),
          React.createElement('div', { style: { width: 180 } }, React.createElement(Select, { options: bizes, value: biz, onChange: setBiz })),
          React.createElement('div', { style: { width: 170 } }, React.createElement(Select, { options: actions, value: type, onChange: setType })),
          React.createElement('button', { className: 'btn btn-secondary' }, React.createElement(Icon, { name: 'calendar', size: 16, style: { color: 'var(--text-muted)' } }), 'Date range')),
        isMobile ? auditCards : React.createElement('div', { style: { overflowX: 'auto' } },
          React.createElement('table', { className: 'table' },
            React.createElement('thead', null, React.createElement('tr', null, ['Timestamp', 'Actor', 'Business', 'Action', 'Details', 'IP / Device'].map(h => React.createElement('th', { key: h }, h)))),
            React.createElement('tbody', null, rows.length === 0
              ? React.createElement('tr', null, React.createElement('td', { colSpan: 6 }, React.createElement(window.UI.EmptyState, { icon: 'fileText', title: 'No log entries', text: 'No activity matches your filters.' })))
              : rows.map((a, i) => { const m = typeMap[a.type] || typeMap.read; return React.createElement('tr', { key: i },
                React.createElement('td', { className: 'tabnum', style: { whiteSpace: 'nowrap', color: 'var(--text-muted)' } }, a.ts),
                React.createElement('td', null, React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 9 } }, a.actor === 'System' ? React.createElement('div', { style: { width: 28, height: 28, borderRadius: 8, background: 'var(--muted-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, React.createElement(Icon, { name: 'zap', size: 14, style: { color: 'var(--text-muted)' } })) : React.createElement(Avatar, { name: a.actor, size: 28 }), React.createElement('div', null, React.createElement('div', { className: 'strong', style: { fontSize: 13 } }, a.actor), React.createElement('div', { className: 'muted', style: { fontSize: 11.5 } }, a.actorRole)))),
                React.createElement('td', null, a.business),
                React.createElement('td', null, React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 7 } }, React.createElement('span', { style: { width: 24, height: 24, borderRadius: 7, background: 'var(--' + (m.c === 'gray' ? 'muted-bg' : m.c === 'blue' ? 'info-bg' : m.c === 'green' ? 'green-bg' : m.c === 'amber' ? 'amber-bg' : 'violet-bg') + ')', color: 'var(--' + (m.c === 'gray' ? 'text-muted' : m.c) + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: m.i, size: 13 })), React.createElement('span', { className: 'strong', style: { fontSize: 13 } }, a.action))),
                React.createElement('td', { style: { maxWidth: 240 } }, a.details),
                React.createElement('td', { className: 'muted', style: { fontSize: 12 } }, a.ip)); }))),
        ),
        React.createElement('div', { style: { padding: '8px 18px 14px' } }, React.createElement(window.UI.Pagination, { page: 1, pages: 4, info: 'Showing ' + rows.length + ' of 1,284 events', onPage: () => { } }))),
    );
  }

  window.Pages = window.Pages || {};
  Object.assign(window.Pages, { AdminCreateBusiness, AdminAudit });
})();
