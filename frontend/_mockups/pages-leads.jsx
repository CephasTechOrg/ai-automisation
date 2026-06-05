// pages-leads.jsx — Owner Leads CRM (progressive-disclosure refactor)
(function () {
  const { useState } = React;
  const Icon = window.Icon;
  const D = window.DATA;
  const { Button, Badge, Avatar, Card, Select, Menu, toast, useIsMobile } = window.UI;

  const TL_ICON = {
    received: { icon: 'users', color: 'var(--primary)' }, email: { icon: 'mail', color: 'var(--text-muted)' },
    scheduled: { icon: 'clock', color: 'var(--amber)' }, contacted: { icon: 'phone', color: 'var(--green)' },
    booked: { icon: 'checkCircle', color: 'var(--green)' }, lost: { icon: 'xCircle', color: 'var(--red)' }, note: { icon: 'note', color: 'var(--text-muted)' },
  };
  const INTENT_DOT = { High: 'var(--green)', Medium: 'var(--amber)', Low: 'var(--text-disabled)' };

  // ---- compact KPI tile (calmer than full StatCard) ----
  function MiniStat({ label, value, trend }) {
    return React.createElement('div', { className: 'mini-stat' },
      React.createElement('div', { className: 'mini-stat-label' }, label),
      React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', gap: 8 } },
        React.createElement('span', { className: 'mini-stat-value tabnum' }, value),
        trend && React.createElement('span', { className: 'mini-stat-trend' }, trend)));
  }

  function LeadsCRM({ initialLead }) {
    const [leads, setLeads] = useState(D.LEADS);
    const [selId, setSelId] = useState(initialLead || D.LEADS[0].id);
    const [statusF, setStatusF] = useState('All Statuses');
    const [q, setQ] = useState('');
    const [sort, setSort] = useState('Newest First');
    const [mobileDetail, setMobileDetail] = useState(false);

    const sel = leads.find(l => l.id === selId) || leads[0];

    let filtered = leads.filter(l =>
      (statusF === 'All Statuses' || l.status === statusF) &&
      (l.name.toLowerCase().includes(q.toLowerCase()) || l.service.toLowerCase().includes(q.toLowerCase())));
    if (sort === 'Oldest First') filtered = [...filtered].reverse();
    if (sort === 'Highest Intent') filtered = [...filtered].sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.intent] - { High: 0, Medium: 1, Low: 2 }[b.intent]));

    function setStatus(id, status) {
      setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l));
      toast('Marked as ' + status, status === 'Lost' ? 'xCircle' : 'checkCircle');
    }
    function selectLead(id) { setSelId(id); setMobileDetail(true); setLeads(ls => ls.map(l => l.id === id ? { ...l, unread: false } : l)); }

    return React.createElement('div', { className: 'page-pad fade-up' },
      // header — calm, single row
      React.createElement('div', { className: 'crm-head' + (mobileDetail ? ' mobile-hidden' : '') },
        React.createElement('div', null,
          React.createElement('h1', { className: 'page-title' }, 'Leads'),
          React.createElement('p', { className: 'page-subtitle' }, 'Which leads need you today?')),
        React.createElement('div', { className: 'crm-minis' },
          React.createElement(MiniStat, { label: 'New', value: '12', trend: '+5 today' }),
          React.createElement(MiniStat, { label: 'Follow-ups', value: '3' }),
          React.createElement(MiniStat, { label: 'Booked', value: '32' }),
          React.createElement(MiniStat, { label: 'Response rate', value: '94%' }))),
      React.createElement('div', { className: 'crm-grid' },
        // LEFT — list
        React.createElement('div', { className: 'crm-list' + (mobileDetail ? ' mobile-hidden' : '') },
          React.createElement('div', { className: 'lead-filters' },
            React.createElement('div', { className: 'input-wrap', style: { flex: 1, minWidth: 0 } },
              React.createElement('span', { className: 'input-icon' }, React.createElement(Icon, { name: 'search', size: 16 })),
              React.createElement('input', { className: 'input has-icon', placeholder: 'Search leads...', value: q, onChange: e => setQ(e.target.value) })),
            React.createElement('div', { style: { width: 132, flexShrink: 0 } }, React.createElement(Select, { options: ['All Statuses', 'New', 'Contacted', 'Booked', 'Follow-up', 'Lost'], value: statusF, onChange: setStatusF })),
            React.createElement(Menu, { trigger: React.createElement('button', { className: 'btn btn-secondary btn-icon', title: 'More filters' }, React.createElement(Icon, { name: 'sliders', size: 17 })), items: [{ icon: 'calendar', label: 'Date range' }, { icon: 'filter', label: 'High intent only' }, { icon: 'mail', label: 'Unread only' }, { icon: 'clock', label: 'Due for follow-up' }, { divider: true }, ...['Newest First', 'Oldest First', 'Highest Intent'].map(s => ({ icon: sort === s ? 'check' : 'chevDown', label: 'Sort: ' + s, onClick: () => setSort(s) }))] })),
          React.createElement('div', { className: 'lead-list-scroll' },
            filtered.length === 0
              ? React.createElement(window.UI.EmptyState, { icon: 'inbox', title: 'No leads yet', text: 'Share your public form link to start capturing customer requests.', action: React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => toast('Form link copied') }, React.createElement(Icon, { name: 'copy', size: 15 }), 'Copy Form Link') })
              : filtered.map(l => React.createElement(LeadListItem, { key: l.id, lead: l, active: l.id === selId, onClick: () => selectLead(l.id) }))),
          filtered.length > 0 && React.createElement('div', { className: 'helper', style: { marginTop: 12, textAlign: 'center' } }, 'Showing ' + filtered.length + ' of 25 leads'),
        ),
        // RIGHT — detail
        React.createElement('div', { className: 'crm-detail' + (mobileDetail ? ' mobile-show' : '') },
          React.createElement(LeadDetail, { key: sel.id, lead: sel, setStatus, onBack: () => setMobileDetail(false) }),
        ),
      ),
    );
  }

  function LeadListItem({ lead, active, onClick }) {
    return React.createElement('button', { className: 'lead-item' + (active ? ' active' : ''), onClick },
      React.createElement(Avatar, { name: lead.name, initials: lead.initials, size: 38 }),
      React.createElement('div', { className: 'grow', style: { minWidth: 0, textAlign: 'left' } },
        React.createElement('div', { className: 'between', style: { gap: 8 } },
          React.createElement('span', { style: { fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 } },
            lead.unread && React.createElement('span', { style: { width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 } }),
            React.createElement('span', { className: 'trunc' }, lead.name)),
          React.createElement('span', { className: 'muted', style: { fontSize: 12, flexShrink: 0 } }, lead.time)),
        React.createElement('div', { className: 'between', style: { marginTop: 5, gap: 8 } },
          React.createElement('span', { className: 'muted trunc', style: { fontSize: 13 } }, lead.service),
          React.createElement(Badge, { dot: false }, lead.status))));
  }

  // ============ LEAD DETAIL (tabbed) ============
  function LeadDetail({ lead, setStatus, onBack }) {
    const [tab, setTab] = useState('overview');
    const [reply, setReply] = useState('');
    const isMobile = useIsMobile(980);
    const replyText = reply || lead.reply;

    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'messages', label: 'Messages' },
      { id: 'ai', label: 'AI', dot: true },
      { id: 'timeline', label: 'Timeline' },
    ];

    const moreItems = [
      { icon: 'xCircle', label: 'Mark Lost', onClick: () => setStatus(lead.id, 'Lost') },
      { icon: 'send', label: 'Send Follow-up', onClick: () => toast('Follow-up scheduled', 'send') },
      { icon: 'note', label: 'Add Note', onClick: () => toast('Note added') },
      { icon: 'clock', label: 'Reschedule Follow-up', onClick: () => toast('Follow-up rescheduled') },
      { divider: true },
      { icon: 'copy', label: 'Copy Details', onClick: () => toast('Details copied') },
      { icon: 'trash', label: 'Archive', danger: true, onClick: () => toast('Lead archived') },
    ];

    return React.createElement('div', { className: 'lead-detail' },
      // ---- header: identity ----
      React.createElement('div', { className: 'ld-head' },
        React.createElement('button', { className: 'icon-btn crm-back', onClick: onBack }, React.createElement(Icon, { name: 'chevLeft', size: 20 })),
        React.createElement(Avatar, { name: lead.name, initials: lead.initials, size: 46 }),
        React.createElement('div', { className: 'grow', style: { minWidth: 0 } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
            React.createElement('span', { style: { fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em' } }, lead.name),
            React.createElement(Badge, null, lead.status)),
          React.createElement('div', { className: 'muted trunc', style: { fontSize: 13, marginTop: 3 } }, lead.service, ' \u00B7 ', lead.value)),
        React.createElement(Menu, { align: 'right', trigger: React.createElement('button', { className: 'btn btn-secondary btn-icon btn-sm' }, React.createElement(Icon, { name: 'more', size: 18 })), items: moreItems })),

      // ---- next best action (primary alert) ----
      React.createElement('div', { className: 'nba-card' },
        React.createElement('div', { className: 'nba-ic' }, React.createElement(Icon, { name: 'target', size: 18 })),
        React.createElement('div', { className: 'grow', style: { minWidth: 0 } },
          React.createElement('div', { className: 'nba-label' }, 'Next best action'),
          React.createElement('div', { className: 'nba-text' }, lead.nextStep)),
        React.createElement('button', { className: 'btn btn-primary btn-sm nba-btn', onClick: () => setTab('messages') }, 'Reply', React.createElement(Icon, { name: 'arrowRight', size: 15 }))),

      // ---- tabs ----
      React.createElement('div', { className: 'ld-tabs' }, tabs.map(t =>
        React.createElement('button', { key: t.id, className: 'ld-tab' + (tab === t.id ? ' active' : ''), onClick: () => setTab(t.id) },
          t.label, t.dot && React.createElement('span', { className: 'ld-tab-dot' })))),

      // ---- tab content ----
      React.createElement('div', { className: 'ld-tabpane' },
        tab === 'overview' && React.createElement(OverviewTab, { lead, onReview: () => setTab('ai') }),
        tab === 'messages' && React.createElement(MessagesTab, { lead, reply: replyText, setReply, onReview: () => setTab('ai') }),
        tab === 'ai' && React.createElement(AITab, { lead, reply: replyText, setReply }),
        tab === 'timeline' && React.createElement(TimelineTab, { lead })),

      // ---- desktop primary actions ----
      !isMobile && React.createElement('div', { className: 'ld-actions' },
        React.createElement('button', { className: 'btn btn-primary', style: { flex: 1 }, onClick: () => setTab('messages') }, React.createElement(Icon, { name: 'message', size: 16 }), 'Reply'),
        React.createElement('button', { className: 'btn btn-secondary', onClick: () => setStatus(lead.id, 'Contacted') }, React.createElement(Icon, { name: 'phone', size: 16 }), 'Mark Contacted'),
        React.createElement('button', { className: 'btn btn-secondary', onClick: () => setStatus(lead.id, 'Booked') }, React.createElement(Icon, { name: 'checkCircle', size: 16 }), 'Booked')),

      // ---- mobile sticky action bar ----
      isMobile && React.createElement('div', { className: 'ld-actionbar' },
        React.createElement('button', { className: 'btn btn-primary', style: { flex: 1 }, onClick: () => setTab('messages') }, React.createElement(Icon, { name: 'message', size: 16 }), 'Reply'),
        React.createElement('button', { className: 'btn btn-secondary', style: { flex: 1 }, onClick: () => setStatus(lead.id, 'Booked') }, 'Booked'),
        React.createElement(Menu, { align: 'right', trigger: React.createElement('button', { className: 'btn btn-secondary btn-icon' }, React.createElement(Icon, { name: 'more', size: 18 })), items: [{ icon: 'phone', label: 'Mark Contacted', onClick: () => setStatus(lead.id, 'Contacted') }, ...moreItems] })),
    );
  }

  // ---- Overview tab ----
  function OverviewTab({ lead, onReview }) {
    return React.createElement('div', { className: 'tabpane-stack' },
      // original request
      React.createElement('section', null,
        React.createElement('div', { className: 'sec-label' }, 'Original request'),
        React.createElement('p', { className: 'req-quote' }, lead.message)),
      // key AI summary (concise)
      React.createElement('section', null,
        React.createElement('div', { className: 'sec-label', style: { display: 'flex', alignItems: 'center', gap: 7 } }, React.createElement(Icon, { name: 'sparkles', size: 14, style: { color: 'var(--primary)' } }), 'AI summary'),
        React.createElement('p', { style: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 } }, lead.summary),
        React.createElement('div', { style: { display: 'flex', gap: 16, marginTop: 12 } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7 } }, React.createElement('span', { className: 'sec-meta-k' }, 'Intent'), React.createElement(Badge, { tone: { High: 'green', Medium: 'amber', Low: 'gray' }[lead.intent] }, lead.intent)),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7 } }, React.createElement('span', { className: 'sec-meta-k' }, 'Urgency'), React.createElement(Badge, { tone: { High: 'red', Medium: 'amber', Low: 'gray' }[lead.urgency] }, lead.urgency)))),
      // suggested reply teaser (collapsed)
      React.createElement('button', { className: 'ai-teaser', onClick: onReview },
        React.createElement('div', { className: 'ai-teaser-ic' }, React.createElement(Icon, { name: 'sparkles', size: 16 })),
        React.createElement('div', { className: 'grow', style: { textAlign: 'left' } },
          React.createElement('div', { style: { fontWeight: 600, fontSize: 13.5 } }, 'Suggested reply ready'),
          React.createElement('div', { className: 'muted', style: { fontSize: 12.5, marginTop: 1 } }, 'AI drafted a response for you to review')),
        React.createElement('span', { className: 'btn btn-secondary btn-xs', style: { flexShrink: 0 } }, 'Review Reply')),
      // metadata (supporting)
      React.createElement('section', null,
        React.createElement('div', { className: 'sec-label' }, 'Details'),
        React.createElement('div', { className: 'meta-grid' },
          [['Email', lead.email], ['Phone', lead.phone], ['Location', lead.location], ['Lead source', lead.source], ['Received', lead.received + ' \u00B7 ' + lead.time], ['Estimated value', lead.value]].map((c, i) =>
            React.createElement('div', { key: i, className: 'meta-row' },
              React.createElement('span', { className: 'meta-k' }, c[0]),
              React.createElement('span', { className: 'meta-v' }, c[1]))))),
    );
  }

  // ---- Messages tab ----
  function MessagesTab({ lead, reply, setReply, onReview }) {
    const thread = [
      { kind: 'customer', text: lead.message, time: lead.received + ' \u00B7 ' + lead.time },
      { kind: 'auto', text: "Thanks for reaching out! We've received your request and will be in touch shortly.", time: lead.received },
    ];
    return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
      React.createElement('div', { className: 'ld-thread' }, thread.map((m, i) =>
        React.createElement('div', { key: i, className: 'ld-msg ' + m.kind },
          React.createElement('div', { className: 'ld-msg-label' }, m.kind === 'customer' ? 'Customer Message' : 'Auto Reply'),
          React.createElement('div', { className: 'ld-msg-bubble ' + m.kind }, m.text),
          React.createElement('div', { className: 'ld-msg-time' }, m.time)))),
      React.createElement('div', { className: 'ai-teaser', onClick: onReview, style: { cursor: 'pointer' } },
        React.createElement('div', { className: 'ai-teaser-ic' }, React.createElement(Icon, { name: 'sparkles', size: 16 })),
        React.createElement('div', { className: 'grow', style: { textAlign: 'left' } }, React.createElement('div', { style: { fontWeight: 600, fontSize: 13.5 } }, 'AI reply suggestion available')),
        React.createElement('span', { className: 'btn btn-secondary btn-xs', style: { flexShrink: 0 } }, 'Review')),
      React.createElement('div', { className: 'ld-composer' },
        React.createElement('textarea', { className: 'textarea', placeholder: 'Write a reply\u2026', value: reply, onChange: e => setReply(e.target.value), style: { minHeight: 90 } }),
        React.createElement('div', { className: 'between', style: { marginTop: 10 } },
          React.createElement('button', { className: 'btn btn-ghost btn-sm', onClick: onReview }, React.createElement(Icon, { name: 'sparkles', size: 15 }), 'Use AI draft'),
          React.createElement('button', { className: 'btn btn-primary btn-sm', onClick: () => { toast('Reply sent to ' + lead.name.split(' ')[0], 'send'); } }, React.createElement(Icon, { name: 'send', size: 15 }), 'Send Reply'))));
  }

  // ---- AI tab ----
  function AITab({ lead, reply, setReply }) {
    const replyText = reply || lead.reply;
    return React.createElement('div', { className: 'tabpane-stack' },
      React.createElement('div', { className: 'ai-states' },
        React.createElement('span', { className: 'ai-state done' }, React.createElement(Icon, { name: 'check', size: 12 }), 'Auto-reply sent'),
        React.createElement('span', { className: 'ai-state pending' }, React.createElement(Icon, { name: 'sparkles', size: 12 }), 'Draft awaiting approval')),
      React.createElement('section', null,
        React.createElement('div', { className: 'sec-label' }, 'Summary'),
        React.createElement('p', { style: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 } }, lead.summary),
        React.createElement('div', { style: { display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7 } }, React.createElement('span', { className: 'sec-meta-k' }, 'Intent'), React.createElement(Badge, { tone: { High: 'green', Medium: 'amber', Low: 'gray' }[lead.intent] }, lead.intent)),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7 } }, React.createElement('span', { className: 'sec-meta-k' }, 'Urgency'), React.createElement(Badge, { tone: { High: 'red', Medium: 'amber', Low: 'gray' }[lead.urgency] }, lead.urgency))),
        React.createElement('div', { style: { display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 } }, lead.tags.map((t, i) => React.createElement('span', { key: i, className: 'tag', style: { fontSize: 12, height: 24, background: 'var(--primary-50)', color: 'var(--primary)', borderColor: 'var(--info-border)' } }, t)))),
      React.createElement('section', null,
        React.createElement('div', { className: 'sec-label' }, 'Recommended next step'),
        React.createElement('p', { style: { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 } }, lead.nextStep)),
      React.createElement('section', null,
        React.createElement('div', { className: 'sec-label' }, 'Suggested reply'),
        React.createElement('textarea', { className: 'textarea', value: replyText, onChange: e => setReply(e.target.value), style: { minHeight: 150, fontSize: 13.5, background: 'var(--muted-bg-2)' } }),
        React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 12 } },
          React.createElement('button', { className: 'btn btn-primary', style: { flex: 1 }, onClick: () => toast('Reply sent to ' + lead.name.split(' ')[0], 'send') }, React.createElement(Icon, { name: 'send', size: 16 }), 'Approve & Send'),
          React.createElement('button', { className: 'btn btn-secondary btn-icon', title: 'Copy', onClick: () => toast('Copied to clipboard') }, React.createElement(Icon, { name: 'copy', size: 17 })),
          React.createElement('button', { className: 'btn btn-secondary btn-icon', title: 'Regenerate', onClick: () => toast('Regenerating reply\u2026', 'refresh') }, React.createElement(Icon, { name: 'refresh', size: 17 }))),
        React.createElement('div', { className: 'helper', style: { marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 6 } }, React.createElement(Icon, { name: 'shield', size: 13, style: { flexShrink: 0, marginTop: 1 } }), 'AI only auto-sends the acknowledgement email. Important replies are drafted for you to review and send.')),
    );
  }

  // ---- Timeline tab ----
  function TimelineTab({ lead }) {
    return React.createElement('div', { className: 'timeline', style: { paddingTop: 4 } },
      lead.timeline.map((t, i) => {
        const m = TL_ICON[t.type] || TL_ICON.note;
        return React.createElement('div', { key: i, className: 'tl-item' },
          React.createElement('div', { className: 'tl-dot', style: { color: m.color, borderColor: m.color } }, React.createElement(Icon, { name: m.icon, size: 13 })),
          React.createElement('div', null, React.createElement('div', { style: { fontWeight: 600, fontSize: 13.5 } }, t.title), React.createElement('div', { className: 'muted tabnum', style: { fontSize: 12.5, marginTop: 2 } }, t.date + ' \u00B7 ' + t.time)));
      }),
      React.createElement('div', { className: 'tl-item' },
        React.createElement('div', { className: 'tl-dot', style: { color: 'var(--text-disabled)', borderColor: 'var(--border)', borderStyle: 'dashed' } }, React.createElement(Icon, { name: 'plus', size: 13 })),
        React.createElement('button', { className: 'btn btn-ghost btn-xs', style: { paddingLeft: 0 }, onClick: () => toast('Note added') }, 'Add note or activity')));
  }

  window.Pages = window.Pages || {};
  Object.assign(window.Pages, { LeadsCRM });
})();
