// pages-owner2.jsx — Owner: Form Management (Settings) + Messages
(function () {
  const { useState, useRef, useEffect } = React;
  const Icon = window.Icon;
  const D = window.DATA;
  const { Button, Badge, Avatar, Card, Field, Input, Textarea, Toggle, Select, Menu, toast } = window.UI;
  const FORM_URL = 'https://leadflowpro.com/f/acme-home-services';

  // ============ FORM MANAGEMENT (Settings) ============
  function OwnerFormMgmt() {
    const [biz, setBiz] = useState({ name: 'Acme Home Services', tagline: 'Trusted experts for a cleaner, safer home.', email: 'hello@acmehomeservices.com', color: '#2563EB', followup: true });
    const [subject, setSubject] = useState('Thanks for reaching out to Acme Home Services!');
    const [msg, setMsg] = useState("Hi {{first_name}},\n\nThanks for contacting Acme Home Services. We've received your request and one of our team members will be in touch within 24 hours.\n\nIn the meantime, feel free to reply to this email if you have any additional details or questions.\n\nBest regards,\nThe Acme Home Services Team");
    const [dirty, setDirty] = useState(false);
    const [active, setActive] = useState(() => { try { return localStorage.getItem('lf_form_active') !== '0'; } catch (e) { return true; } });
    const [device, setDevice] = useState('desktop');
    function setFormActive(v) { setActive(v); try { localStorage.setItem('lf_form_active', v ? '1' : '0'); } catch (e) { } toast(v ? 'Public form is now live' : 'Public form paused'); }
    function set(k, v) { setBiz(s => ({ ...s, [k]: v })); setDirty(true); }

    return React.createElement('div', { className: 'page-pad fade-up', style: { paddingBottom: 110 } },
      React.createElement('div', { className: 'breadcrumb', style: { marginBottom: 14 } }, React.createElement('span', { className: 'crumb-link' }, 'Settings'), React.createElement(Icon, { name: 'chevRight', size: 14 }), React.createElement('span', { className: 'crumb-cur' }, 'Form Management')),
      React.createElement('h1', { className: 'page-title' }, 'Form Management'),
      React.createElement('p', { className: 'page-subtitle', style: { marginBottom: 26 } }, 'Manage your business details, customer form, and automated responses.'),
      React.createElement('div', { className: 'fm-grid' },
        // LEFT — profile + auto-reply
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 22 } },
          React.createElement(Card, null,
            React.createElement('div', { className: 'section-title', style: { fontSize: 16 } }, 'Business Profile'),
            React.createElement('p', { className: 'helper', style: { margin: '5px 0 22px' } }, 'This information appears on your form and auto-replies.'),
            React.createElement('div', { className: 'fm-profile' },
              React.createElement('div', null,
                React.createElement('label', { className: 'label', style: { marginBottom: 7, display: 'block' } }, 'Business Logo'),
                React.createElement('div', { style: { width: '100%', aspectRatio: '1.4', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'var(--muted-bg-2)' } },
                  React.createElement(Icon, { name: 'home2', size: 30, style: { color: 'var(--navy)' } }),
                  React.createElement('div', { style: { fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--navy)' } }, 'ACME'),
                  React.createElement('div', { style: { fontSize: 8, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-muted)' } }, 'HOME SERVICES')),
                React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 12 } },
                  React.createElement('button', { className: 'btn btn-secondary btn-sm' }, 'Change Logo'),
                  React.createElement('button', { className: 'btn btn-ghost btn-sm', style: { color: 'var(--red)' } }, 'Remove'))),
              React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
                React.createElement(Field, { label: 'Business Name' }, React.createElement(Input, { value: biz.name, onChange: e => set('name', e.target.value) })),
                React.createElement(Field, { label: 'Tagline (optional)' }, React.createElement(Input, { value: biz.tagline, onChange: e => set('tagline', e.target.value) })),
                React.createElement(Field, { label: 'Contact Email', helper: 'Leads will be emailed to this address.' }, React.createElement(Input, { value: biz.email, onChange: e => set('email', e.target.value) })))),
            React.createElement('div', { className: 'fm-cards', style: { marginTop: 22 } },
              React.createElement('div', { style: { border: '1px solid var(--border)', borderRadius: 12, padding: 18 } },
                React.createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, 'Brand Color'),
                React.createElement('p', { className: 'helper', style: { margin: '4px 0 14px' } }, 'Customize the accent color used on your form.'),
                React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'center' } },
                  React.createElement('label', { style: { width: 38, height: 38, borderRadius: 8, background: biz.color, cursor: 'pointer', border: '1px solid var(--border)', flexShrink: 0, position: 'relative', overflow: 'hidden' } },
                    React.createElement('input', { type: 'color', value: biz.color, onChange: e => set('color', e.target.value), style: { opacity: 0, width: '100%', height: '100%', cursor: 'pointer' } })),
                  React.createElement('div', { style: { flex: 1 } }, React.createElement(Input, { value: biz.color.toUpperCase(), onChange: e => set('color', e.target.value) })))),
              React.createElement('div', { style: { border: '1px solid var(--border)', borderRadius: 12, padding: 18 } },
                React.createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, 'Follow-up Automation'),
                React.createElement('p', { className: 'helper', style: { margin: '4px 0 14px' } }, 'Automatically send follow-ups to new leads.'),
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 11 } }, React.createElement(Toggle, { on: biz.followup, onChange: v => set('followup', v) }), React.createElement('span', { style: { fontSize: 14, fontWeight: 600 } }, biz.followup ? 'On' : 'Off')))),
            React.createElement('div', { style: { marginTop: 24 } },
              React.createElement('div', { className: 'between', style: { marginBottom: 4 } },
                React.createElement('div', null, React.createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, 'Auto-reply Email Template'), React.createElement('p', { className: 'helper', style: { margin: '4px 0 0' } }, 'This email is sent automatically when someone submits your form.')),
                React.createElement(Menu, { trigger: React.createElement('button', { className: 'btn btn-secondary btn-sm' }, 'Insert Field', React.createElement(Icon, { name: 'chevDown', size: 14 })), items: ['{{first_name}}', '{{business_name}}', '{{service_needed}}', '{{preferred_time}}'].map(v => ({ label: v, onClick: () => { setMsg(m => m + ' ' + v); setDirty(true); } })) })),
              React.createElement(Field, { label: 'Email Subject', className: 'fm-field' }, React.createElement(Input, { value: subject, onChange: e => { setSubject(e.target.value); setDirty(true); } })),
              React.createElement(Field, { label: 'Email Message', className: 'fm-field' }, React.createElement(Textarea, { value: msg, onChange: e => { setMsg(e.target.value); setDirty(true); }, style: { minHeight: 180 } })),
              React.createElement('p', { className: 'helper', style: { marginTop: 8 } }, 'You can use ', React.createElement('code', { style: { background: 'var(--muted-bg)', padding: '2px 6px', borderRadius: 5, color: 'var(--primary)', fontSize: 12 } }, '{{first_name}}'), ' and ', React.createElement('code', { style: { background: 'var(--muted-bg)', padding: '2px 6px', borderRadius: 5, color: 'var(--primary)', fontSize: 12 } }, '{{business_name}}'), ' in your message.'))),
        ),
        // RIGHT — link + preview
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 22 } },
          React.createElement(Card, null,
            React.createElement('div', { className: 'between' },
              React.createElement('div', null, React.createElement('div', { style: { fontWeight: 600, fontSize: 14 } }, 'Public Form Status'), React.createElement('p', { className: 'helper', style: { margin: '3px 0 0' } }, active ? 'Your form is live and accepting requests.' : 'Your form is paused. Visitors see an inactive notice.')),
              React.createElement(Toggle, { on: active, onChange: setFormActive })),
            React.createElement('div', { style: { marginTop: 10 } }, active ? React.createElement(Badge, { tone: 'green' }, 'Active') : React.createElement(Badge, { tone: 'amber' }, 'Paused'))),
          React.createElement(Card, null,
            React.createElement('div', { className: 'section-title', style: { fontSize: 16 } }, 'Public Form Link'),
            React.createElement('p', { className: 'helper', style: { margin: '5px 0 16px' } }, 'Share this link to start capturing leads.'),
            React.createElement(window.UI.CopyLinkBox, { url: FORM_URL }),
            React.createElement('div', { style: { display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' } },
              React.createElement('button', { className: 'btn btn-ghost btn-xs', style: { paddingLeft: 0 } }, 'Preview Form', React.createElement(Icon, { name: 'externalLink', size: 14 })),
              React.createElement('button', { className: 'btn btn-ghost btn-xs', onClick: () => toast('Test email sent to ' + biz.email, 'send') }, React.createElement(Icon, { name: 'mail', size: 14 }), 'Send test email'))),
          React.createElement(Card, null,
            React.createElement('div', { className: 'between', style: { marginBottom: 16 } },
              React.createElement('div', null, React.createElement('div', { className: 'section-title', style: { fontSize: 16 } }, 'Live Form Preview'), React.createElement('p', { className: 'helper', style: { margin: '4px 0 0' } }, 'How your form appears to customers.')),
              React.createElement('div', { style: { display: 'flex', gap: 4, background: 'var(--muted-bg)', padding: 3, borderRadius: 9 } },
                ['desktop', 'mobile'].map(d => React.createElement('button', { key: d, onClick: () => setDevice(d), title: d, style: { width: 34, height: 30, borderRadius: 7, border: 'none', background: device === d ? '#fff' : 'transparent', color: device === d ? 'var(--primary)' : 'var(--text-muted)', boxShadow: device === d ? 'var(--shadow-xs)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, React.createElement(Icon, { name: d === 'desktop' ? 'monitor' : 'smartphone', size: 16 }))))),
            React.createElement('div', { style: { maxWidth: device === 'mobile' ? 280 : '100%', margin: device === 'mobile' ? '0 auto' : '0', transition: 'max-width .25s ease' } }, React.createElement(FormPreview, { biz }))),
        ),
      ),
      // sticky save bar
      React.createElement('div', { className: 'save-bar' },
        React.createElement('div', { className: 'helper' }, dirty ? React.createElement('span', { style: { color: 'var(--amber)', fontWeight: 600 } }, '\u25CF Unsaved changes') : 'All changes saved'),
        React.createElement('div', { style: { display: 'flex', gap: 10 } },
          React.createElement('button', { className: 'btn btn-secondary', onClick: () => { setDirty(false); toast('Changes discarded'); } }, 'Discard Changes'),
          React.createElement('button', { className: 'btn btn-primary', onClick: () => { setDirty(false); toast('Changes saved'); } }, 'Save Changes'))),
    );
  }

  function FormPreview({ biz }) {
    return React.createElement('div', { style: { border: '1px solid var(--border)', borderRadius: 14, padding: 20, background: '#fff' } },
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, marginBottom: 16 } },
        React.createElement(Icon, { name: 'home2', size: 26, style: { color: biz.color } }),
        React.createElement('div', { style: { fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--navy)' } }, 'ACME')),
      React.createElement('div', { style: { fontSize: 16, fontWeight: 700, textAlign: 'center', color: 'var(--navy)' } }, 'Request a Free Estimate'),
      React.createElement('p', { style: { fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', margin: '6px 0 16px', lineHeight: 1.5 } }, "Fill out the form below and we'll get back to you within 24 hours."),
      React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
        ['Full Name *', 'Email Address *', 'Phone Number *', 'Service Needed *'].map((l, i) => React.createElement('div', { key: i },
          React.createElement('div', { style: { fontSize: 11.5, fontWeight: 600, marginBottom: 4 } }, l),
          React.createElement('div', { style: { height: 38, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted-bg-2)', display: 'flex', alignItems: 'center', padding: '0 11px', fontSize: 12, color: 'var(--text-disabled)' } }, i === 3 ? 'Select a service' : ['Enter your full name', 'Enter your email address', '(555) 123-4567'][i], i === 3 && React.createElement(Icon, { name: 'chevDown', size: 14, style: { marginLeft: 'auto' } })))),
        React.createElement('div', null, React.createElement('div', { style: { fontSize: 11.5, fontWeight: 600, marginBottom: 4 } }, 'Additional Details'), React.createElement('div', { style: { height: 52, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--muted-bg-2)', padding: '8px 11px', fontSize: 12, color: 'var(--text-disabled)' } }, 'Tell us more about your project...')),
        React.createElement('button', { className: 'btn', style: { background: biz.color, color: '#fff', marginTop: 4, height: 40 } }, 'Submit Request')),
    );
  }

  // ============ MESSAGES ============
  function OwnerMessages() {
    const [convs, setConvs] = useState(D.CONVERSATIONS);
    const [selId, setSelId] = useState(D.CONVERSATIONS[0].id);
    const [draft, setDraft] = useState('');
    const [aiOpen, setAiOpen] = useState(false);
    const [mobileThread, setMobileThread] = useState(false);
    const sel = convs.find(c => c.id === selId);
    const scrollRef = useRef(null);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [selId, convs]);

    function send(text) {
      if (!text.trim()) return;
      setConvs(cs => cs.map(c => c.id === selId ? { ...c, thread: [...c.thread.filter(m => m.kind !== 'ai-draft'), { kind: 'owner', text, time: 'Just now' }], preview: text, time: 'Just now', followState: 'Sent' } : c));
      setDraft('');
      toast('Reply sent', 'send');
    }
    function selectConv(id) { setSelId(id); setMobileThread(true); setConvs(cs => cs.map(c => c.id === id ? { ...c, unread: 0 } : c)); }

    const SYS = {
      auto: { label: 'Auto Reply', icon: 'mail', tone: 'gray' },
      followup: { label: 'Follow-up', icon: 'send', tone: 'blue' },
      scheduled: { label: 'Scheduled', icon: 'calendarClock', tone: 'amber' },
      failed: { label: 'Delivery Failed', icon: 'xCircle', tone: 'red' },
    };
    const BUB = {
      customer: { side: 'them', label: 'Customer Message', cls: 'them' },
      owner: { side: 'me', label: 'Owner Reply', cls: 'me' },
      'ai-draft': { side: 'me', label: 'AI Draft \u00B7 pending approval', cls: 'ai' },
    };
    function renderMsg(m, i) {
      if (SYS[m.kind]) {
        const s = SYS[m.kind];
        return React.createElement('div', { key: i, className: 'msg-system' },
          React.createElement('div', { className: 'msg-sys-line' },
            React.createElement('span', { className: 'msg-sys-chip ' + s.tone }, React.createElement(Icon, { name: s.icon, size: 12 }), s.label),
            React.createElement('span', { className: 'msg-sys-time' }, m.time)),
          React.createElement('div', { className: 'msg-sys-text' + (m.kind === 'failed' ? ' failed' : '') }, m.text,
            m.kind === 'failed' && React.createElement('button', { className: 'btn btn-xs', style: { marginLeft: 8, color: 'var(--red)', border: '1px solid var(--red-border)', height: 26 }, onClick: () => toast('Retrying delivery...', 'refresh') }, 'Retry')));
      }
      const L = BUB[m.kind] || BUB.owner;
      return React.createElement('div', { key: i, className: 'bubble-row ' + L.side },
        React.createElement('div', { className: 'bubble-wrap ' + L.side },
          React.createElement('div', { className: 'bubble-label' }, m.kind === 'ai-draft' && React.createElement(Icon, { name: 'sparkles', size: 12, style: { marginRight: 4, verticalAlign: '-1px' } }), L.label),
          React.createElement('div', { className: 'bubble ' + L.cls }, React.createElement('div', null, m.text), React.createElement('div', { className: 'bubble-time' }, m.time)),
          m.kind === 'ai-draft' && React.createElement('div', { className: 'ai-draft-actions' },
            React.createElement('button', { className: 'btn btn-primary btn-xs', onClick: () => send(m.text) }, React.createElement(Icon, { name: 'check', size: 14 }), 'Approve & Send'),
            React.createElement('button', { className: 'btn btn-secondary btn-xs', onClick: () => setDraft(m.text) }, 'Edit'))));
    }

    return React.createElement('div', { className: 'page-pad fade-up', style: { paddingBottom: 24 } },
      React.createElement('h1', { className: 'page-title' }, 'Messages'),
      React.createElement('p', { className: 'page-subtitle', style: { marginBottom: 22 } }, 'Email and message history connected to your leads.'),
      React.createElement('div', { className: 'msg-grid card', style: { padding: 0, overflow: 'hidden' } },
        // list
        React.createElement('div', { className: 'msg-list' + (mobileThread ? ' mobile-hidden' : '') },
          React.createElement('div', { style: { padding: '14px 16px', borderBottom: '1px solid var(--border)' } },
            React.createElement('div', { className: 'input-wrap' }, React.createElement('span', { className: 'input-icon' }, React.createElement(Icon, { name: 'search', size: 16 })), React.createElement('input', { className: 'input has-icon', placeholder: 'Search conversations...', style: { height: 40 } }))),
          React.createElement('div', { style: { overflowY: 'auto', flex: 1 } }, convs.map(c => React.createElement('button', { key: c.id, className: 'conv-item' + (c.id === selId ? ' active' : ''), onClick: () => selectConv(c.id) },
            React.createElement('div', { style: { position: 'relative', flexShrink: 0 } }, React.createElement(Avatar, { name: c.name, initials: c.initials, size: 42 }), c.online && React.createElement('span', { style: { position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: 'var(--green)', border: '2px solid #fff' } })),
            React.createElement('div', { className: 'grow', style: { minWidth: 0, textAlign: 'left' } },
              React.createElement('div', { className: 'between' }, React.createElement('span', { style: { fontWeight: 600, fontSize: 13.5 }, className: 'trunc' }, c.name), React.createElement('span', { className: 'muted', style: { fontSize: 11.5, flexShrink: 0 } }, c.time)),
              React.createElement('div', { className: 'muted trunc', style: { fontSize: 12.5, marginTop: 3 } }, c.preview)),
            c.unread > 0 && React.createElement('span', { className: 'nav-badge', style: { background: 'var(--primary)', alignSelf: 'center' } }, c.unread)))),
        ),
        // thread
        React.createElement('div', { className: 'msg-thread' + (mobileThread ? ' mobile-show' : '') },
          React.createElement('div', { className: 'msg-thread-head' },
            React.createElement('button', { className: 'icon-btn crm-back', onClick: () => setMobileThread(false) }, React.createElement(Icon, { name: 'chevLeft', size: 20 })),
            React.createElement(Avatar, { name: sel.name, initials: sel.initials, size: 40 }),
            React.createElement('div', { className: 'grow', style: { minWidth: 0 } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, React.createElement('span', { style: { fontWeight: 600, fontSize: 15 } }, sel.name), React.createElement(Badge, null, sel.status)),
              React.createElement('div', { className: 'muted trunc', style: { fontSize: 12.5 } }, sel.service + ' \u00B7 Lead ' + sel.leadId)),
            React.createElement('button', { className: 'btn btn-secondary btn-sm only-desktop', onClick: () => toast('Opening lead ' + sel.leadId) }, React.createElement(Icon, { name: 'externalLink', size: 15 }), 'Open Lead'),
            React.createElement(Menu, { trigger: React.createElement('button', { className: 'icon-btn' }, React.createElement(Icon, { name: 'more', size: 18 })), items: [{ icon: 'externalLink', label: 'Open lead' }, { icon: 'check', label: 'Mark resolved' }] })),
          React.createElement('div', { className: 'msg-body', ref: scrollRef },
            sel.thread.map((m, i) => renderMsg(m, i))),
          React.createElement('div', { className: 'msg-composer' },
            aiOpen
              ? React.createElement('div', { className: 'ai-suggest' },
                React.createElement('div', { className: 'between', style: { marginBottom: 7 } },
                  React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 7 } }, React.createElement(Icon, { name: 'sparkles', size: 15, style: { color: 'var(--primary)' } }), React.createElement('span', { style: { fontSize: 12, fontWeight: 700, color: 'var(--primary)' } }, 'AI Suggested Response')),
                  React.createElement('button', { className: 'icon-btn', style: { width: 26, height: 26 }, onClick: () => setAiOpen(false) }, React.createElement(Icon, { name: 'x', size: 15 }))),
                React.createElement('div', { style: { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 } }, sel.suggested),
                React.createElement('div', { style: { display: 'flex', gap: 8, marginTop: 10 } },
                  React.createElement('button', { className: 'btn btn-primary btn-xs', onClick: () => { setDraft(sel.suggested); setAiOpen(false); } }, 'Use Suggestion'),
                  React.createElement('button', { className: 'btn btn-ghost btn-xs', onClick: () => toast('Regenerating...', 'refresh') }, React.createElement(Icon, { name: 'refresh', size: 14 }), 'Regenerate')))
              : React.createElement('button', { className: 'ai-suggest-pill', onClick: () => setAiOpen(true) },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } }, React.createElement(Icon, { name: 'sparkles', size: 15, style: { color: 'var(--primary)' } }), React.createElement('span', { style: { fontSize: 12.5, fontWeight: 600, color: 'var(--text)' } }, 'AI reply suggestion available')),
                React.createElement('span', { className: 'btn btn-secondary btn-xs' }, 'Review')),
            React.createElement('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-end', marginTop: 12 } },
              React.createElement('textarea', { className: 'textarea', placeholder: 'Type a message...', value: draft, onChange: e => setDraft(e.target.value), onKeyDown: e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft); } }, style: { minHeight: 46, maxHeight: 120 } }),
              React.createElement('button', { className: 'btn btn-primary btn-icon', style: { height: 46, width: 46, flexShrink: 0 }, onClick: () => send(draft) }, React.createElement(Icon, { name: 'send', size: 18 })))),
        ),
      ),
    );
  }

  window.Pages = window.Pages || {};
  Object.assign(window.Pages, { OwnerFormMgmt, OwnerMessages });
})();
