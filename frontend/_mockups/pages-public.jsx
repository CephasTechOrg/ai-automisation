// pages-public.jsx — Login / Invite acceptance + Public Customer Form
(function () {
  const { useState } = React;
  const Icon = window.Icon;
  const { Logo, Button, Field, Input, Select, Textarea } = window.UI;

  // ---------------- Abstract SaaS illustration ----------------
  function AuthArt() {
    return React.createElement('div', { style: { position: 'relative', height: 280, marginTop: 'auto' } },
      React.createElement('svg', { width: '100%', height: 280, viewBox: '0 0 460 280', fill: 'none', style: { position: 'absolute', bottom: 0, left: 0, opacity: .9 } },
        // background waves
        React.createElement('path', { d: 'M0 200 C120 150 200 240 460 170 L460 280 L0 280 Z', fill: '#BFDBFE', opacity: .35 }),
        React.createElement('path', { d: 'M0 230 C140 190 260 260 460 210 L460 280 L0 280 Z', fill: '#93C5FD', opacity: .3 }),
        // chart card
        React.createElement('g', { transform: 'translate(20 60)' },
          React.createElement('rect', { x: 0, y: 0, width: 210, height: 130, rx: 16, fill: '#fff', opacity: .92, stroke: '#DBEAFE' }),
          React.createElement('circle', { cx: 26, cy: 26, r: 11, fill: '#DBEAFE' }),
          React.createElement('path', { d: 'M22 26 a4 4 0 1 1 8 0', stroke: '#2563EB', strokeWidth: 2, fill: 'none' }),
          React.createElement('rect', { x: 46, y: 18, width: 90, height: 7, rx: 3.5, fill: '#E2E8F0' }),
          React.createElement('rect', { x: 46, y: 31, width: 60, height: 6, rx: 3, fill: '#EEF2F7' }),
          React.createElement('polyline', { points: '20,100 55,82 90,92 125,60 160,72 190,48', fill: 'none', stroke: '#2563EB', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }),
          [20, 55, 90, 125, 160, 190].map((x, i) => React.createElement('circle', { key: i, cx: x, cy: [100, 82, 92, 60, 72, 48][i], r: 3, fill: '#fff', stroke: '#2563EB', strokeWidth: 2 }))),
        // donut card
        React.createElement('g', { transform: 'translate(250 30)' },
          React.createElement('rect', { x: 0, y: 0, width: 120, height: 120, rx: 16, fill: '#fff', opacity: .92, stroke: '#DBEAFE' }),
          React.createElement('circle', { cx: 60, cy: 60, r: 34, fill: 'none', stroke: '#DBEAFE', strokeWidth: 12 }),
          React.createElement('circle', { cx: 60, cy: 60, r: 34, fill: 'none', stroke: '#2563EB', strokeWidth: 12, strokeDasharray: 214, strokeDashoffset: 70, strokeLinecap: 'round', transform: 'rotate(-90 60 60)' })),
        // check card
        React.createElement('g', { transform: 'translate(300 165)' },
          React.createElement('rect', { x: 0, y: 0, width: 86, height: 80, rx: 14, fill: '#fff', opacity: .95, stroke: '#DBEAFE' }),
          React.createElement('circle', { cx: 43, cy: 40, r: 18, fill: '#2563EB' }),
          React.createElement('path', { d: 'M35 40 l6 6 l12 -12', stroke: '#fff', strokeWidth: 3, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' })),
      ),
    );
  }

  function LoginPage({ onSignIn }) {
    const [showPw, setShowPw] = useState(false);
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [magic, setMagic] = useState(false);
    const [err, setErr] = useState('');
    function submit(e) {
      e.preventDefault();
      if (!email) { setErr('Please enter your email address.'); return; }
      onSignIn();
    }
    return React.createElement('div', { className: 'auth-wrap' },
      // LEFT
      React.createElement('div', { className: 'auth-left' },
        React.createElement(Logo, null),
        React.createElement('div', { style: { marginTop: 56, maxWidth: 440 } },
          React.createElement('h1', { style: { fontSize: 42, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 } }, 'Run your business.', React.createElement('br'), 'Grow with confidence.'),
          React.createElement('p', { style: { fontSize: 16.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 18, maxWidth: 420 } }, 'LeadFlow Pro helps service businesses capture more leads, follow up faster, and close more jobs\u2014all in one powerful platform.'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 18, marginTop: 32 } },
            [
              { icon: 'users', t: 'Capture more leads', d: 'Get leads from every channel into one place.' },
              { icon: 'phone', t: 'Respond faster', d: 'Automate follow-ups and never miss a chance.' },
              { icon: 'chart', t: 'Grow with insights', d: "See what's working and scale what matters." },
            ].map((f, i) => React.createElement('div', { key: i, style: { display: 'flex', gap: 14, alignItems: 'flex-start' } },
              React.createElement('div', { style: { width: 42, height: 42, borderRadius: 11, background: 'var(--primary-100)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: f.icon, size: 20 })),
              React.createElement('div', null,
                React.createElement('div', { style: { fontWeight: 700, fontSize: 15 } }, f.t),
                React.createElement('div', { style: { color: 'var(--text-muted)', fontSize: 13.5, marginTop: 2 } }, f.d))))),
        ),
        React.createElement('div', { className: 'hide-sm', style: { marginTop: 'auto' } }, React.createElement(AuthArt)),
      ),
      // RIGHT
      React.createElement('div', { className: 'auth-right' },
        React.createElement('form', { className: 'card', style: { width: '100%', maxWidth: 440, padding: 32 }, onSubmit: submit },
          React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'center', padding: 14, borderRadius: 12, background: 'var(--primary-50)', border: '1px solid var(--info-border)' } },
            React.createElement('div', { style: { width: 36, height: 36, borderRadius: 9, background: 'var(--primary-100)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: 'users', size: 18 })),
            React.createElement('div', null,
              React.createElement('div', { style: { fontSize: 12.5, color: 'var(--text-muted)' } }, 'You were invited to manage'),
              React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: 'var(--primary)' } }, 'Bright Cleaning Services'))),
          React.createElement('h2', { style: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '26px 0 4px' } }, 'Welcome back'),
          React.createElement('p', { className: 'muted', style: { margin: '0 0 22px', fontSize: 14 } }, 'Sign in to your LeadFlow Pro account'),
          React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 16 } },
            React.createElement(Field, { label: 'Email address' },
              React.createElement(Input, { type: 'email', placeholder: 'you@company.com', value: email, error: err, onChange: e => { setEmail(e.target.value); setErr(''); } })),
            !magic && React.createElement('div', null,
              React.createElement('div', { className: 'between', style: { marginBottom: 7 } },
                React.createElement('label', { className: 'label' }, 'Password'),
                React.createElement('span', { style: { fontSize: 13, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' } }, 'Forgot password?')),
              React.createElement(Input, { type: showPw ? 'text' : 'password', placeholder: 'Enter your password', value: pw, onChange: e => setPw(e.target.value),
                iconRight: React.createElement('button', { type: 'button', onClick: () => setShowPw(s => !s), style: { border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 } }, React.createElement(Icon, { name: showPw ? 'eyeOff' : 'eye', size: 18 })) })),
            err && magic && React.createElement('div', { className: 'error-msg' }, React.createElement(Icon, { name: 'info', size: 13 }), err),
          ),
          React.createElement('button', { type: 'submit', className: 'btn btn-primary btn-lg btn-block', style: { marginTop: 22 } }, magic ? 'Send magic link' : 'Sign In'),
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0' } },
            React.createElement('div', { className: 'divider-h', style: { flex: 1 } }), React.createElement('span', { className: 'muted', style: { fontSize: 13 } }, 'or'), React.createElement('div', { className: 'divider-h', style: { flex: 1 } })),
          React.createElement('button', { type: 'button', className: 'btn btn-secondary btn-lg btn-block', onClick: () => setMagic(m => !m) },
            React.createElement(Icon, { name: 'mail', size: 17 }), magic ? 'Use password instead' : 'Send me a magic link'),
        ),
        React.createElement('div', { style: { marginTop: 22, textAlign: 'center' } },
          React.createElement('p', { className: 'muted', style: { fontSize: 13.5 } }, "Don't have an account? Contact your administrator.")),
        React.createElement('div', { className: 'between', style: { marginTop: 26, width: '100%', maxWidth: 440, fontSize: 12.5, color: 'var(--text-disabled)' } },
          React.createElement('span', null, '\u00A9 2025 LeadFlow Pro. All rights reserved.'),
          React.createElement('div', { style: { display: 'flex', gap: 16 } }, React.createElement('span', { style: { cursor: 'pointer' } }, 'Privacy Policy'), React.createElement('span', { style: { cursor: 'pointer' } }, 'Terms of Service'))),
      ),
    );
  }

  // ---------------- Public Customer Form ----------------
  function BrightLogo() {
    return React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
      React.createElement('div', { style: { width: 46, height: 46, borderRadius: '50%', border: '2.5px solid var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' } },
        React.createElement(Icon, { name: 'home2', size: 22, style: { color: 'var(--navy)' } }),
        React.createElement(Icon, { name: 'sparkles', size: 12, style: { color: 'var(--primary)', position: 'absolute', top: 6, right: 5 } })),
      React.createElement('div', null,
        React.createElement('div', { style: { fontSize: 22, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--navy)', lineHeight: 1 } }, 'BRIGHT'),
        React.createElement('div', { style: { fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--primary)', marginTop: 2 } }, 'CLEANING SERVICES')));
  }

  function PublicForm() {
    const [f, setF] = useState({ name: '', email: '', phone: '', service: '', date: '', time: '', msg: '' });
    const [errs, setErrs] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const active = (() => { try { return localStorage.getItem('lf_form_active') !== '0'; } catch (e) { return true; } })();
    function set(k, v) { setF(s => ({ ...s, [k]: v })); setErrs(e => ({ ...e, [k]: null })); }
    function submit(e) {
      e.preventDefault();
      const er = {};
      if (!f.name) er.name = 'Please enter your name.';
      if (!f.email) er.email = 'Email is required.';
      else if (!/^[^@]+@[^@]+\.[^@]+$/.test(f.email)) er.email = 'Enter a valid email.';
      if (!f.phone) er.phone = 'Phone is required.';
      if (!f.service) er.service = 'Please select a service.';
      setErrs(er);
      if (Object.keys(er).length) return;
      setLoading(true);
      setTimeout(() => { setLoading(false); setSubmitted(true); }, 900);
    }

    return React.createElement('div', { style: { minHeight: '100vh', background: 'var(--bg)' } },
      // top nav
      React.createElement('header', { style: { height: 68, borderBottom: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' } },
        React.createElement(Logo, null),
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 600 } },
          React.createElement(Icon, { name: 'shieldCheck', size: 17, style: { color: 'var(--green)' } }), 'Secure & Confidential')),
      !active ? React.createElement(FormPausedState) : React.createElement('div', { className: 'pf-grid' },
        // main
        React.createElement('div', null,
          submitted
            ? React.createElement(SuccessState, { name: f.name, onReset: () => { setSubmitted(false); setF({ name: '', email: '', phone: '', service: '', date: '', time: '', msg: '' }); } })
            : React.createElement(React.Fragment, null,
              React.createElement(BrightLogo),
              React.createElement('h1', { style: { fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', margin: '26px 0 0', color: 'var(--navy)' } }, 'Request a Quote'),
              React.createElement('p', { style: { fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.55, margin: '14px 0 0', maxWidth: 480 } }, "Tell us about your cleaning needs and we'll create a customized quote that's right for you."),
              React.createElement('div', { style: { display: 'flex', gap: 22, flexWrap: 'wrap', margin: '20px 0 36px' } },
                [{ icon: 'shieldCheck', t: 'Trusted by 500+ customers' }, { icon: 'star', t: '5.0 average rating' }, { icon: 'shield', t: 'Insured & Bonded' }].map((t, i) =>
                  React.createElement('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)' } },
                    React.createElement(Icon, { name: t.icon, size: 16, style: { color: 'var(--primary)' } }), t.t))),
              React.createElement('form', { onSubmit: submit, noValidate: true },
                React.createElement('div', { className: 'pf-fields' },
                  React.createElement(Field, { label: 'Full Name', required: true, error: errs.name },
                    React.createElement(Input, { icon: 'user', placeholder: 'Enter your full name', value: f.name, error: errs.name, onChange: e => set('name', e.target.value) })),
                  React.createElement(Field, { label: 'Email Address', required: true, error: errs.email },
                    React.createElement(Input, { icon: 'mail', placeholder: 'Enter your email', value: f.email, error: errs.email, onChange: e => set('email', e.target.value) })),
                  React.createElement(Field, { label: 'Phone Number', required: true, error: errs.phone },
                    React.createElement(Input, { icon: 'phone', placeholder: '(555) 123-4567', value: f.phone, error: errs.phone, onChange: e => set('phone', e.target.value) })),
                  React.createElement(Field, { label: 'Service Needed', required: true, error: errs.service },
                    React.createElement(Select, { options: window.DATA.SERVICES, value: f.service, placeholder: 'Select a service', onChange: v => set('service', v) })),
                  React.createElement(Field, { label: 'Preferred Date' },
                    React.createElement(Input, { icon: 'calendar', type: 'text', placeholder: 'Select a date', value: f.date, onFocus: e => e.target.type = 'date', onBlur: e => { if (!e.target.value) e.target.type = 'text'; }, onChange: e => set('date', e.target.value) })),
                  React.createElement(Field, { label: 'Preferred Time' },
                    React.createElement(Select, { options: ['Morning (8am\u201312pm)', 'Afternoon (12\u20134pm)', 'Evening (4\u20137pm)', 'Flexible'], value: f.time, placeholder: 'Select a time', onChange: v => set('time', v) }))),
                React.createElement(Field, { label: 'Message (Optional)', className: 'pf-msg' },
                  React.createElement(Textarea, { placeholder: 'Tell us more about your space or any special requests...', maxLength: 500, value: f.msg, onChange: e => set('msg', e.target.value), style: { minHeight: 120 } }),
                  React.createElement('div', { style: { textAlign: 'right', fontSize: 12, color: 'var(--text-disabled)', marginTop: 2 } }, f.msg.length + '/500')),
                React.createElement('button', { type: 'submit', className: 'btn btn-primary btn-lg btn-block', style: { marginTop: 24, height: 54, fontSize: 16 }, disabled: loading },
                  loading ? React.createElement('span', { className: 'spinner' }) : null,
                  loading ? 'Submitting...' : 'Submit Request',
                  !loading && React.createElement(Icon, { name: 'arrowRight', size: 18 })),
                React.createElement('div', { style: { textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 } },
                  React.createElement(Icon, { name: 'lock', size: 14 }), 'Your information is secure and will never be shared.')),
            ),
        ),
        // right rail
        React.createElement('aside', { className: 'pf-rail' },
          React.createElement('div', { className: 'card', style: { padding: 26, position: 'sticky', top: 24 } },
            React.createElement('h3', { style: { fontSize: 19, fontWeight: 700, margin: 0, color: 'var(--navy)', letterSpacing: '-0.01em' } }, 'Why Choose Bright Cleaning Services?'),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 20, marginTop: 22 } },
              [
                { icon: 'user', t: 'Professional & Reliable', d: 'Background-checked, trained, and dedicated to excellence.' },
                { icon: 'shieldCheck', t: 'Satisfaction Guarantee', d: "Not happy? We'll make it right within 24 hours." },
                { icon: 'leaf', t: 'Eco-Friendly Products', d: 'Safe for your family, pets, and the environment.' },
                { icon: 'calendar', t: 'Flexible Scheduling', d: 'Convenient appointment times that work for you.' },
              ].map((h, i) => React.createElement('div', { key: i, style: { display: 'flex', gap: 13, alignItems: 'flex-start' } },
                React.createElement('div', { style: { width: 38, height: 38, borderRadius: 10, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: h.icon, size: 18 })),
                React.createElement('div', null,
                  React.createElement('div', { style: { fontWeight: 700, fontSize: 14.5, color: 'var(--navy)' } }, h.t),
                  React.createElement('div', { style: { color: 'var(--text-muted)', fontSize: 13, marginTop: 3, lineHeight: 1.5 } }, h.d)))),
            ),
            React.createElement('div', { className: 'divider-h', style: { margin: '22px 0' } }),
            React.createElement('div', { style: { display: 'flex', gap: 13, alignItems: 'flex-start' } },
              React.createElement('div', { style: { width: 38, height: 38, borderRadius: 10, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: 'clock', size: 18 })),
              React.createElement('div', null,
                React.createElement('div', { style: { fontWeight: 700, fontSize: 14.5, color: 'var(--navy)' } }, 'Fast Response'),
                React.createElement('div', { style: { color: 'var(--text-muted)', fontSize: 13, marginTop: 3, lineHeight: 1.5 } }, 'We typically respond within ', React.createElement('b', { style: { color: 'var(--text-secondary)' } }, '1 hour during business hours.')))),
            React.createElement('div', { style: { marginTop: 20, padding: 16, borderRadius: 12, background: 'var(--primary-50)', border: '1px solid var(--info-border)', display: 'flex', gap: 12 } },
              React.createElement(Icon, { name: 'lock', size: 18, style: { color: 'var(--primary)', flexShrink: 0, marginTop: 1 } }),
              React.createElement('div', null,
                React.createElement('div', { style: { fontWeight: 700, fontSize: 13.5, color: 'var(--primary)' } }, 'Your Privacy Matters'),
                React.createElement('div', { style: { color: 'var(--text-secondary)', fontSize: 12.5, marginTop: 3, lineHeight: 1.5 } }, 'We use your information only to respond to your quote request and will never spam you or share your data.'))),
          ),
        ),
      ),
    );
  }

  function FormPausedState() {
    return React.createElement('div', { className: 'fade-up', style: { maxWidth: 560, margin: '40px auto', textAlign: 'center', padding: '0 20px' } },
      React.createElement('div', { style: { width: 72, height: 72, borderRadius: '50%', background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' } },
        React.createElement(Icon, { name: 'pause', size: 30, style: { color: 'var(--amber)' } })),
      React.createElement('h1', { style: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: 'var(--navy)' } }, 'This form is temporarily unavailable'),
      React.createElement('p', { style: { fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 14 } }, "Bright Cleaning Services isn't accepting new requests right now. Please check back soon or reach out to them directly."),
      React.createElement('div', { style: { marginTop: 22, display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap', fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 } },
        React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 7 } }, React.createElement(Icon, { name: 'phone', size: 16, style: { color: 'var(--primary)' } }), '(555) 123-4567'),
        React.createElement('span', { style: { display: 'flex', alignItems: 'center', gap: 7 } }, React.createElement(Icon, { name: 'mail', size: 16, style: { color: 'var(--primary)' } }), 'hello@brightcleaning.com')));
  }

  function SuccessState({ name, onReset }) {
    return React.createElement('div', { className: 'fade-up', style: { maxWidth: 540, paddingTop: 20 } },
      React.createElement('div', { style: { width: 84, height: 84, borderRadius: '50%', background: 'var(--green-bg)', border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 } },
        React.createElement(Icon, { name: 'check', size: 42, stroke: 2.6, style: { color: 'var(--green)' } })),
      React.createElement('h1', { style: { fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: 'var(--navy)' } }, 'Thank you', name ? ', ' + name.split(' ')[0] : '', '!'),
      React.createElement('p', { style: { fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 16 } }, "Your request has been received. A member of the Bright Cleaning Services team will reach out within ", React.createElement('b', null, '1 hour'), " during business hours to discuss your quote."),
      React.createElement('div', { className: 'card', style: { padding: 22, marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 } },
        React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em' } }, "What happens next"),
        [
          { icon: 'mail', t: 'Check your inbox', d: "We've sent a confirmation email with your request details." },
          { icon: 'phone', t: "We'll be in touch", d: 'Our team reviews your request and reaches out with a quote.' },
          { icon: 'calendar', t: 'Schedule your service', d: "Pick a time that works and we'll handle the rest." },
        ].map((s, i) => React.createElement('div', { key: i, style: { display: 'flex', gap: 13, alignItems: 'flex-start' } },
          React.createElement('div', { style: { width: 36, height: 36, borderRadius: 9, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, React.createElement(Icon, { name: s.icon, size: 17 })),
          React.createElement('div', null, React.createElement('div', { style: { fontWeight: 700, fontSize: 14 } }, s.t), React.createElement('div', { className: 'muted', style: { fontSize: 13, marginTop: 2 } }, s.d))))),
      React.createElement('button', { className: 'btn btn-secondary', style: { marginTop: 24 }, onClick: onReset }, React.createElement(Icon, { name: 'plus', size: 16 }), 'Submit another request'),
    );
  }

  window.Pages = window.Pages || {};
  Object.assign(window.Pages, { LoginPage, PublicForm });
})();
