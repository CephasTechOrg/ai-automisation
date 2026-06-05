// components.jsx — shared UI primitives for LeadFlow Pro
(function () {
  const { useState, useEffect, useRef } = React;
  const Icon = window.Icon;

  // ---------------- Responsive hook ----------------
  function useMediaQuery(query) {
    const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
    useEffect(() => {
      const mq = window.matchMedia(query);
      const h = e => setMatch(e.matches);
      setMatch(mq.matches);
      mq.addEventListener ? mq.addEventListener('change', h) : mq.addListener(h);
      return () => { mq.removeEventListener ? mq.removeEventListener('change', h) : mq.removeListener(h); };
    }, [query]);
    return match;
  }
  const useIsMobile = (bp = 720) => useMediaQuery('(max-width: ' + bp + 'px)');

  // ---------------- Logo ----------------
  function Logo({ light = false, size = 30 }) {
    return React.createElement('div', { className: 'lf-logo', style: { display: 'flex', alignItems: 'center', gap: 9 } },
      React.createElement('div', { style: {
        width: size, height: size, borderRadius: 9, background: 'var(--primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: '0 2px 6px rgba(37,99,235,.35)',
      } },
        React.createElement('svg', { width: size * 0.62, height: size * 0.62, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' },
          React.createElement('circle', { cx: 11, cy: 11, r: 7 }),
          React.createElement('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 }),
        ),
      ),
      React.createElement('div', { style: { fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: light ? '#fff' : 'var(--text)' } },
        'LeadFlow ', React.createElement('span', { style: { color: light ? '#93C5FD' : 'var(--primary)' } }, 'Pro'),
      ),
    );
  }

  // ---------------- Button ----------------
  function Button({ variant = 'secondary', size = '', icon, iconRight, children, className = '', ...rest }) {
    const cls = ['btn', 'btn-' + variant, size ? 'btn-' + size : '', className].filter(Boolean).join(' ');
    return React.createElement('button', { className: cls, ...rest },
      icon && React.createElement(Icon, { name: icon, size: size === 'xs' ? 15 : 17 }),
      children,
      iconRight && React.createElement(Icon, { name: iconRight, size: size === 'xs' ? 15 : 17 }),
    );
  }

  // ---------------- Badge / Status ----------------
  const STATUS_MAP = {
    New: 'blue', Contacted: 'amber', Booked: 'green', 'Follow-up': 'violet', Lost: 'red',
    Active: 'green', Pending: 'amber', Paused: 'gray', Invited: 'blue',
    High: 'green', Medium: 'amber', Low: 'gray',
  };
  function Badge({ children, tone, dot = true }) {
    const t = tone || STATUS_MAP[children] || 'gray';
    return React.createElement('span', { className: 'badge badge-' + t },
      dot && React.createElement('span', { className: 'dot' }), children);
  }
  function PlanBadge({ children }) {
    const map = { Pro: { bg: 'var(--primary-50)', c: 'var(--primary)', b: 'var(--primary-200)' }, Standard: { bg: 'var(--muted-bg)', c: 'var(--text-secondary)', b: 'var(--border)' }, Basic: { bg: '#fff', c: 'var(--text-muted)', b: 'var(--border)' }, Enterprise: { bg: 'var(--violet-bg)', c: 'var(--violet)', b: '#DDD6FE' } };
    const s = map[children] || map.Standard;
    return React.createElement('span', { style: { display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 9px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: s.bg, color: s.c, border: '1px solid ' + s.b } }, children);
  }

  // ---------------- Avatar ----------------
  function Avatar({ initials, name, size = 38, color, square = false, src }) {
    const palette = ['#2563EB', '#0891B2', '#7C3AED', '#059669', '#D97706', '#DB2777', '#0F172A'];
    let bg = color;
    if (!bg) { let h = 0; const s = name || initials || 'x'; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); bg = palette[Math.abs(h) % palette.length]; }
    return React.createElement('div', {
      className: 'avatar' + (square ? ' avatar-sq' : ''),
      style: { width: size, height: size, fontSize: size * 0.36, background: bg + '1A', color: bg },
    }, src ? React.createElement('img', { src }) : (initials || (name ? name.split(' ').map(w => w[0]).slice(0, 2).join('') : '')));
  }

  // ---------------- Brand glyph (business icon tile) ----------------
  function BrandTile({ icon, color, name, size = 38 }) {
    return React.createElement('div', {
      style: { width: size, height: size, borderRadius: 10, background: color + '14', color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid ' + color + '22' },
    }, icon ? React.createElement(Icon, { name: icon, size: size * 0.5 }) : (name ? name.slice(0, 2).toUpperCase() : ''));
  }

  // ---------------- Toggle ----------------
  function Toggle({ on, onChange }) {
    return React.createElement('button', { type: 'button', className: 'toggle' + (on ? ' on' : ''), onClick: () => onChange(!on), 'aria-pressed': on });
  }

  // ---------------- Field / Input ----------------
  function Field({ label, required, helper, error, children, className = '' }) {
    return React.createElement('div', { className: 'field ' + className },
      label && React.createElement('label', { className: 'label' }, label, required && React.createElement('span', { className: 'req' }, '*')),
      children,
      error ? React.createElement('div', { className: 'error-msg' }, React.createElement(Icon, { name: 'info', size: 13 }), error)
        : helper ? React.createElement('div', { className: 'helper' }, helper) : null,
    );
  }
  function Input({ icon, iconRight, error, ...rest }) {
    const inp = React.createElement('input', { className: 'input' + (icon ? ' has-icon' : '') + (error ? ' error' : ''), ...rest });
    if (!icon && !iconRight) return inp;
    return React.createElement('div', { className: 'input-wrap' },
      icon && React.createElement('span', { className: 'input-icon' }, React.createElement(Icon, { name: icon, size: 17 })),
      inp,
      iconRight && React.createElement('span', { className: 'input-icon input-icon-right' }, iconRight),
    );
  }
  function Textarea({ error, ...rest }) {
    return React.createElement('textarea', { className: 'textarea' + (error ? ' error' : ''), ...rest });
  }
  function Select({ options = [], value, onChange, placeholder, ...rest }) {
    return React.createElement('div', { className: 'select', style: { width: '100%' } },
      React.createElement('select', { className: 'select-el', value: value, onChange: e => onChange && onChange(e.target.value), ...rest },
        placeholder && React.createElement('option', { value: '', disabled: true }, placeholder),
        options.map(o => {
          const val = typeof o === 'string' ? o : o.value; const lab = typeof o === 'string' ? o : o.label;
          return React.createElement('option', { key: val, value: val }, lab);
        }),
      ),
      React.createElement('span', { className: 'chev' }, React.createElement(Icon, { name: 'chevDown', size: 16 })),
    );
  }

  // ---------------- Card ----------------
  function Card({ children, className = '', pad = true, style }) {
    return React.createElement('div', { className: 'card ' + (pad ? 'card-pad ' : '') + className, style }, children);
  }

  // ---------------- StatCard ----------------
  function StatCard({ icon, label, value, trend, trendDir = 'up', trendNote, accent = 'var(--primary)', compact }) {
    if (compact) {
      return React.createElement('div', { className: 'card stat-card stat-compact' },
        React.createElement('div', { className: 'between', style: { marginBottom: 8 } },
          React.createElement('span', { style: { fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)' } }, label),
          React.createElement('div', { style: { width: 30, height: 30, borderRadius: 8, background: accent + '14', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: icon, size: 16 }))),
        React.createElement('div', { style: { display: 'flex', alignItems: 'baseline', gap: 9 } },
          React.createElement('span', { style: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }, className: 'tabnum' }, value),
          trend && React.createElement('span', { className: 'trend trend-' + trendDir, style: { fontSize: 12 } }, (trendDir === 'up' ? '+' : '\u2212') + trend)));
    }
    return React.createElement('div', { className: 'card card-pad stat-card' },
      React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 14 } },
        React.createElement('div', { style: { width: 44, height: 44, borderRadius: 11, background: accent + '14', color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
          React.createElement(Icon, { name: icon, size: 21 })),
        React.createElement('div', { className: 'grow' },
          React.createElement('div', { style: { fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' } }, label),
          React.createElement('div', { style: { fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2, lineHeight: 1.1 }, className: 'tabnum' }, value),
          trend && React.createElement('div', { style: { marginTop: 8 } },
            React.createElement('span', { className: 'trend trend-' + trendDir },
              React.createElement(Icon, { name: trendDir === 'up' ? 'trendUp' : 'trendDown', size: 14 }), trend),
            trendNote && React.createElement('span', { className: 'trend' }, React.createElement('span', { className: 'vs', style: { marginLeft: 6 } }, trendNote)),
          ),
        ),
      ),
    );
  }

  // ---------------- Section header ----------------
  function SectionHead({ title, action, sub }) {
    return React.createElement('div', { className: 'between', style: { marginBottom: 4 } },
      React.createElement('div', null,
        React.createElement('div', { className: 'section-title', style: { fontSize: 16 } }, title),
        sub && React.createElement('div', { className: 'helper', style: { marginTop: 3 } }, sub)),
      action,
    );
  }

  // ---------------- EmptyState ----------------
  function EmptyState({ icon = 'inbox', title, text, action }) {
    return React.createElement('div', { style: { textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 } },
      React.createElement('div', { style: { width: 56, height: 56, borderRadius: 14, background: 'var(--muted-bg)', color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 } },
        React.createElement(Icon, { name: icon, size: 26 })),
      React.createElement('div', { style: { fontSize: 15, fontWeight: 600 } }, title),
      text && React.createElement('div', { className: 'muted', style: { fontSize: 13.5, maxWidth: 320 } }, text),
      action && React.createElement('div', { style: { marginTop: 12 } }, action),
    );
  }

  // ---------------- Line / Area chart ----------------
  function AreaChart({ data, height = 220, color = 'var(--primary)', maxOverride, yTicks }) {
    const ref = useRef(null);
    const [w, setW] = useState(640);
    useEffect(() => {
      if (!ref.current) return;
      const ro = new ResizeObserver(es => { for (const e of es) setW(e.contentRect.width); });
      ro.observe(ref.current); return () => ro.disconnect();
    }, []);
    const padL = 38, padR = 14, padT = 14, padB = 28;
    const max = maxOverride || Math.ceil(Math.max(...data.map(d => d.v)) / 20) * 20 || 100;
    const innerW = Math.max(w - padL - padR, 10), innerH = height - padT - padB;
    const x = i => padL + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = v => padT + innerH - (v / max) * innerH;
    const pts = data.map((d, i) => [x(i), y(d.v)]);
    const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ' ' + p[1]).join(' ');
    const area = line + ' L' + pts[pts.length - 1][0] + ' ' + (padT + innerH) + ' L' + pts[0][0] + ' ' + (padT + innerH) + ' Z';
    const ticks = yTicks || [0, max / 4, max / 2, (max * 3) / 4, max];
    const gid = 'ag-' + Math.round(Math.random() * 1e6);
    return React.createElement('div', { ref, style: { width: '100%' } },
      React.createElement('svg', { width: w, height, style: { display: 'block', overflow: 'visible' } },
        React.createElement('defs', null,
          React.createElement('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 },
            React.createElement('stop', { offset: '0%', stopColor: color, stopOpacity: 0.18 }),
            React.createElement('stop', { offset: '100%', stopColor: color, stopOpacity: 0 }))),
        ticks.map((t, i) => React.createElement('g', { key: i },
          React.createElement('line', { x1: padL, x2: w - padR, y1: y(t), y2: y(t), stroke: 'var(--divider)', strokeDasharray: i === 0 ? '0' : '3 4' }),
          React.createElement('text', { x: padL - 8, y: y(t) + 4, textAnchor: 'end', fontSize: 11, fill: 'var(--text-disabled)' }, Math.round(t) >= 1000 ? (Math.round(t) / 1000) + 'K' : Math.round(t)))),
        React.createElement('path', { d: area, fill: 'url(#' + gid + ')' }),
        React.createElement('path', { d: line, fill: 'none', stroke: color, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }),
        pts.map((p, i) => React.createElement('circle', { key: i, cx: p[0], cy: p[1], r: 3.5, fill: '#fff', stroke: color, strokeWidth: 2 })),
        data.map((d, i) => React.createElement('text', { key: i, x: x(i), y: height - 8, textAnchor: 'middle', fontSize: 11, fill: 'var(--text-muted)' }, d.label)),
      ),
    );
  }

  // ---------------- Donut chart ----------------
  function Donut({ value, size = 150, stroke = 14, color = 'var(--primary)', track = '#E2E8F0', label, sub }) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c - (value / 100) * c;
    return React.createElement('div', { style: { position: 'relative', width: size, height: size } },
      React.createElement('svg', { width: size, height: size, style: { transform: 'rotate(-90deg)' } },
        React.createElement('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: track, strokeWidth: stroke }),
        React.createElement('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: color, strokeWidth: stroke, strokeDasharray: c, strokeDashoffset: off, strokeLinecap: 'round', style: { transition: 'stroke-dashoffset .8s ease' } })),
      React.createElement('div', { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
        React.createElement('div', { style: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' } }, label || value + '%'),
        sub && React.createElement('div', { className: 'muted', style: { fontSize: 12, fontWeight: 500 } }, sub)),
    );
  }

  // ---------------- Dropdown menu ----------------
  function Menu({ items, trigger, align = 'right' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
      document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
    }, []);
    return React.createElement('div', { ref, style: { position: 'relative', display: 'inline-flex' } },
      React.createElement('div', { onClick: e => { e.stopPropagation(); setOpen(o => !o); } }, trigger),
      open && React.createElement('div', { className: 'menu-pop fade-in', style: { position: 'absolute', top: 'calc(100% + 6px)', [align]: 0, zIndex: 50, minWidth: 188, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', padding: 6 } },
        items.map((it, i) => it.divider
          ? React.createElement('div', { key: i, style: { height: 1, background: 'var(--divider)', margin: '5px 4px' } })
          : React.createElement('button', { key: i, className: 'menu-item', onClick: e => { e.stopPropagation(); setOpen(false); it.onClick && it.onClick(); }, style: { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', background: 'transparent', fontSize: 13.5, fontWeight: 500, color: it.danger ? 'var(--red)' : 'var(--text-secondary)', textAlign: 'left' } },
            it.icon && React.createElement(Icon, { name: it.icon, size: 16 }), it.label))),
    );
  }

  // ---------------- Toast ----------------
  let toastFn = null;
  function ToastHost() {
    const [items, setItems] = useState([]);
    useEffect(() => { toastFn = (msg, icon) => { const id = Math.random(); setItems(s => [...s, { id, msg, icon }]); setTimeout(() => setItems(s => s.filter(t => t.id !== id)), 2600); }; }, []);
    return React.createElement('div', { className: 'toast-wrap' },
      items.map(t => React.createElement('div', { key: t.id, className: 'toast' },
        React.createElement('span', { className: 'ic' }, React.createElement(Icon, { name: t.icon || 'checkCircle', size: 17 })), t.msg)));
  }
  function toast(msg, icon) { if (toastFn) toastFn(msg, icon); }

  // ---------------- Tabs ----------------
  function Tabs({ tabs, active, onChange }) {
    return React.createElement('div', { style: { display: 'flex', gap: 4, background: 'var(--muted-bg)', padding: 4, borderRadius: 10, width: 'fit-content' } },
      tabs.map(t => {
        const val = typeof t === 'string' ? t : t.value; const lab = typeof t === 'string' ? t : t.label; const count = typeof t === 'object' ? t.count : null;
        const on = active === val;
        return React.createElement('button', { key: val, onClick: () => onChange(val), style: { display: 'inline-flex', alignItems: 'center', gap: 7, height: 34, padding: '0 14px', borderRadius: 7, border: 'none', background: on ? '#fff' : 'transparent', color: on ? 'var(--text)' : 'var(--text-muted)', fontSize: 13.5, fontWeight: 600, boxShadow: on ? 'var(--shadow-xs)' : 'none' } },
          lab, count != null && React.createElement('span', { style: { fontSize: 11.5, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: on ? 'var(--primary-50)' : 'var(--border)', color: on ? 'var(--primary)' : 'var(--text-muted)' } }, count));
      }));
  }

  // ---------------- Pagination ----------------
  function Pagination({ page = 1, pages = 5, onPage, info }) {
    return React.createElement('div', { className: 'between', style: { padding: '14px 4px 2px' } },
      info && React.createElement('div', { className: 'helper' }, info),
      React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' } },
        React.createElement('button', { className: 'pg-btn', disabled: page === 1, onClick: () => onPage && onPage(page - 1) }, React.createElement(Icon, { name: 'chevLeft', size: 15 })),
        Array.from({ length: pages }, (_, i) => i + 1).map(p => React.createElement('button', { key: p, className: 'pg-btn' + (p === page ? ' active' : ''), onClick: () => onPage && onPage(p) }, p)),
        React.createElement('button', { className: 'pg-btn', disabled: page === pages, onClick: () => onPage && onPage(page + 1) }, React.createElement(Icon, { name: 'chevRight', size: 15 }))));
  }

  // ---------------- CopyLinkBox ----------------
  function CopyLinkBox({ url, onCopy }) {
    const [copied, setCopied] = useState(false);
    return React.createElement('div', { style: { display: 'flex', gap: 8 } },
      React.createElement('div', { style: { flex: 1, minWidth: 0, height: 44, display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid var(--border)', borderRadius: 'var(--r-input)', background: 'var(--muted-bg-2)', color: 'var(--text-secondary)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, url),
      React.createElement('button', { className: 'btn btn-primary', style: { flexShrink: 0 }, onClick: () => { setCopied(true); toast('Link copied to clipboard'); onCopy && onCopy(); setTimeout(() => setCopied(false), 1600); } },
        React.createElement(Icon, { name: copied ? 'check' : 'copy', size: 16 }), copied ? 'Copied' : 'Copy'));
  }

  window.UI = {
    Logo, Button, Badge, PlanBadge, Avatar, BrandTile, Toggle, Field, Input, Textarea, Select,
    Card, StatCard, SectionHead, EmptyState, AreaChart, Donut, Menu, ToastHost, toast, Tabs, Pagination, CopyLinkBox,
    STATUS_MAP, useMediaQuery, useIsMobile,
  };
})();
