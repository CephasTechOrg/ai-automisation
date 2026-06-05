// data.jsx — placeholder data for LeadFlow Pro
(function () {
  // ---------- Owner-side leads ----------
  const LEADS = [
    {
      id: 'L-1042', name: 'Jessica Smith', initials: 'JS', email: 'jessica.smith@email.com',
      phone: '(512) 555-0198', location: 'Austin, TX', service: 'Roof Inspection', status: 'New',
      source: 'Website Form', received: 'May 18, 2025', time: '10:24 AM', value: '$350 – $500',
      unread: true, intent: 'High', urgency: 'High',
      message: "Hi! I'm looking to get my roof inspected. I noticed some shingles might be loose after the last storm. Can you let me know availability this week?",
      tags: ['High Intent', 'Needs Inspection', 'Price Sensitive'],
      summary: 'Jessica is concerned about possible roof damage after a storm. She wants an inspection as soon as possible and is likely to book if availability is convenient this week.',
      nextStep: 'Offer a same-week inspection window and a ballpark estimate.',
      reply: "Hi Jessica,\n\nThanks for reaching out! I'd be happy to inspect your roof. We do have availability this week. Would you prefer a morning or afternoon appointment?\n\nBest regards,\nAcme Home Services",
      timeline: [
        { type: 'received', title: 'Lead received via Website Form', date: 'May 18, 2025', time: '10:24 AM' },
        { type: 'email', title: 'Auto-response email sent', date: 'May 18, 2025', time: '10:25 AM' },
        { type: 'scheduled', title: 'Follow-up scheduled', date: 'May 19, 2025', time: '10:00 AM' },
      ],
    },
    {
      id: 'L-1041', name: 'David Martinez', initials: 'DM', email: 'd.martinez@email.com',
      phone: '(512) 555-0142', location: 'Round Rock, TX', service: 'Gutter Cleaning', status: 'Contacted',
      source: 'Website Form', received: 'May 18, 2025', time: '9:58 AM', value: '$150 – $250',
      unread: false, intent: 'Medium', urgency: 'Low',
      message: 'My gutters are overflowing when it rains. Looking for a cleaning and maybe a quick check on the downspouts.',
      tags: ['Recurring Potential', 'Medium Intent'],
      summary: 'David has overflowing gutters and wants a cleaning plus a downspout check. Good candidate for a recurring maintenance plan.',
      nextStep: 'Confirm scheduling and mention the seasonal maintenance plan.',
      reply: "Hi David,\n\nThanks for getting in touch. We can take care of your gutter cleaning and check the downspouts. When works best for you this week?\n\nBest regards,\nAcme Home Services",
      timeline: [
        { type: 'received', title: 'Lead received via Website Form', date: 'May 18, 2025', time: '9:58 AM' },
        { type: 'email', title: 'Auto-response email sent', date: 'May 18, 2025', time: '9:59 AM' },
        { type: 'contacted', title: 'Owner marked Contacted', date: 'May 18, 2025', time: '11:30 AM' },
      ],
    },
    {
      id: 'L-1040', name: 'Amanda Wilson', initials: 'AW', email: 'amanda.w@email.com',
      phone: '(737) 555-0110', location: 'Cedar Park, TX', service: 'Window Cleaning', status: 'Booked',
      source: 'Referral', received: 'May 17, 2025', time: '4:21 PM', value: '$200 – $300',
      unread: false, intent: 'High', urgency: 'Low',
      message: 'Referred by my neighbor. Need exterior window cleaning for a two-story home before a family event.',
      tags: ['Referral', 'Booked'],
      summary: 'Amanda was referred and has booked exterior window cleaning ahead of a family event. High-trust lead.',
      nextStep: 'Send appointment confirmation and prep instructions.',
      reply: "Hi Amanda,\n\nWonderful — you're all set! We'll see you on the scheduled date. We'll send a reminder the day before.\n\nBest regards,\nAcme Home Services",
      timeline: [
        { type: 'received', title: 'Lead received via Referral', date: 'May 17, 2025', time: '4:21 PM' },
        { type: 'contacted', title: 'Owner marked Contacted', date: 'May 17, 2025', time: '5:02 PM' },
        { type: 'booked', title: 'Lead booked', date: 'May 18, 2025', time: '9:14 AM' },
      ],
    },
    {
      id: 'L-1039', name: 'Robert Brown', initials: 'RB', email: 'rob.brown@email.com',
      phone: '(512) 555-0177', location: 'Austin, TX', service: 'Roof Repair', status: 'Follow-up',
      source: 'Website Form', received: 'May 17, 2025', time: '2:15 PM', value: '$800 – $1,200',
      unread: false, intent: 'High', urgency: 'Medium',
      message: 'Got a quote elsewhere but wanted to compare. There is a leak near the chimney flashing.',
      tags: ['Comparison Shopping', 'High Value'],
      summary: 'Robert has a chimney flashing leak and is comparing quotes. Higher-value job; responsiveness will be decisive.',
      nextStep: 'Send a competitive estimate and emphasize warranty.',
      reply: "Hi Robert,\n\nThanks for considering us. Chimney flashing leaks are very fixable. I can put together a detailed estimate today — would a quick call work?\n\nBest regards,\nAcme Home Services",
      timeline: [
        { type: 'received', title: 'Lead received via Website Form', date: 'May 17, 2025', time: '2:15 PM' },
        { type: 'email', title: 'Auto-response email sent', date: 'May 17, 2025', time: '2:16 PM' },
        { type: 'scheduled', title: 'Follow-up scheduled', date: 'May 20, 2025', time: '9:00 AM' },
      ],
    },
    {
      id: 'L-1038', name: 'Kevin Lee', initials: 'KL', email: 'kevin.lee@email.com',
      phone: '(512) 555-0163', location: 'Pflugerville, TX', service: 'Pressure Washing', status: 'New',
      source: 'Website Form', received: 'May 17, 2025', time: '11:03 AM', value: '$180 – $260',
      unread: true, intent: 'Medium', urgency: 'Low',
      message: 'Driveway and patio need pressure washing. What does that usually run for a standard size?',
      tags: ['Price Question', 'Medium Intent'],
      summary: 'Kevin wants pressure washing for a driveway and patio and is asking about typical pricing.',
      nextStep: 'Provide a price range and offer to bundle driveway + patio.',
      reply: "Hi Kevin,\n\nGreat question! For a standard driveway and patio we typically quote $180–$260. I'd be glad to confirm with a quick photo. Want to book a visit?\n\nBest regards,\nAcme Home Services",
      timeline: [
        { type: 'received', title: 'Lead received via Website Form', date: 'May 17, 2025', time: '11:03 AM' },
        { type: 'email', title: 'Auto-response email sent', date: 'May 17, 2025', time: '11:04 AM' },
      ],
    },
    {
      id: 'L-1037', name: 'Michelle White', initials: 'MW', email: 'm.white@email.com',
      phone: '(512) 555-0129', location: 'Austin, TX', service: 'Gutter Cleaning', status: 'Lost',
      source: 'Website Form', received: 'May 16, 2025', time: '3:47 PM', value: '$120 – $180',
      unread: false, intent: 'Low', urgency: 'Low',
      message: 'Looking for gutter cleaning but need it done today. Can anyone come out?',
      tags: ['Urgent', 'Went Elsewhere'],
      summary: 'Michelle needed same-day service and went with another provider before we responded.',
      nextStep: 'Add to re-engagement list for seasonal offers.',
      reply: "Hi Michelle,\n\nApologies we missed your same-day request. We'd love to help next time and can offer priority scheduling. Keep us in mind!\n\nBest regards,\nAcme Home Services",
      timeline: [
        { type: 'received', title: 'Lead received via Website Form', date: 'May 16, 2025', time: '3:47 PM' },
        { type: 'lost', title: 'Marked Lost — went with competitor', date: 'May 16, 2025', time: '6:20 PM' },
      ],
    },
    {
      id: 'L-1036', name: 'Priya Nair', initials: 'PN', email: 'priya.nair@email.com',
      phone: '(737) 555-0184', location: 'Leander, TX', service: 'Roof Inspection', status: 'Contacted',
      source: 'Google Ads', received: 'May 16, 2025', time: '10:12 AM', value: '$300 – $450',
      unread: false, intent: 'High', urgency: 'Medium',
      message: 'Buying a home and need a pre-purchase roof inspection within the next few days.',
      tags: ['Time Sensitive', 'High Intent'],
      summary: 'Priya needs a pre-purchase roof inspection on a short timeline. Strong likelihood to book.',
      nextStep: 'Offer next-available slot and emailed report turnaround.',
      reply: "Hi Priya,\n\nCongrats on the new home! We can do a pre-purchase inspection within 2 days and email you a full report. What address should we visit?\n\nBest regards,\nAcme Home Services",
      timeline: [
        { type: 'received', title: 'Lead received via Google Ads', date: 'May 16, 2025', time: '10:12 AM' },
        { type: 'contacted', title: 'Owner marked Contacted', date: 'May 16, 2025', time: '10:40 AM' },
      ],
    },
    {
      id: 'L-1035', name: 'Tom Becker', initials: 'TB', email: 'tom.becker@email.com',
      phone: '(512) 555-0150', location: 'Austin, TX', service: 'Window Cleaning', status: 'New',
      source: 'Website Form', received: 'May 15, 2025', time: '5:33 PM', value: '$160 – $240',
      unread: true, intent: 'Medium', urgency: 'Low',
      message: 'Need interior + exterior window cleaning for a 3-bed house. Flexible on timing.',
      tags: ['Flexible', 'Medium Intent'],
      summary: 'Tom wants full interior + exterior window cleaning and is flexible on timing.',
      nextStep: 'Propose two time slots and a bundled price.',
      reply: "Hi Tom,\n\nHappy to help with interior and exterior windows. I can offer Tuesday AM or Thursday PM. Which suits you better?\n\nBest regards,\nAcme Home Services",
      timeline: [
        { type: 'received', title: 'Lead received via Website Form', date: 'May 15, 2025', time: '5:33 PM' },
        { type: 'email', title: 'Auto-response email sent', date: 'May 15, 2025', time: '5:34 PM' },
      ],
    },
  ];

  // ---------- Follow-ups ----------
  const FOLLOWUPS = [
    { id: 'L-1039', name: 'Robert Brown', initials: 'RB', service: 'Roof Repair', status: 'Follow-up', last: 'May 17, 2025', due: 'Today, 9:00 AM', state: 'due' },
    { id: 'L-1038', name: 'Kevin Lee', initials: 'KL', service: 'Pressure Washing', status: 'New', last: 'May 17, 2025', due: 'Today, 2:00 PM', state: 'due' },
    { id: 'L-1042', name: 'Jessica Smith', initials: 'JS', service: 'Roof Inspection', status: 'New', last: 'May 18, 2025', due: 'Tomorrow, 10:00 AM', state: 'scheduled' },
    { id: 'L-1036', name: 'Priya Nair', initials: 'PN', service: 'Roof Inspection', status: 'Contacted', last: 'May 16, 2025', due: 'May 20, 11:00 AM', state: 'scheduled' },
    { id: 'L-1030', name: 'Greg Holt', initials: 'GH', service: 'Roof Inspection', status: 'Follow-up', last: 'May 12, 2025', due: 'May 14 (overdue)', state: 'overdue' },
    { id: 'L-1029', name: 'Dana Cole', initials: 'DC', service: 'Gutter Cleaning', status: 'Contacted', last: 'May 11, 2025', due: 'May 13 (overdue)', state: 'overdue' },
    { id: 'L-1025', name: 'Alan Pierce', initials: 'AP', service: 'Window Cleaning', status: 'Contacted', last: 'May 10, 2025', due: 'May 9', state: 'sent' },
    { id: 'L-1022', name: 'Nina Park', initials: 'NP', service: 'Pressure Washing', status: 'Booked', last: 'May 9, 2025', due: 'May 8', state: 'sent' },
  ];

  // ---------- Messages / conversations ----------
  // message kinds: customer | auto | owner | ai-draft | followup | scheduled | failed
  const CONVERSATIONS = [
    {
      id: 'C-1', name: 'Jessica Smith', initials: 'JS', leadId: 'L-1042', service: 'Roof Inspection',
      status: 'New', followState: 'Reply ready', preview: 'Morning would be great, thanks!', time: '10:42 AM', unread: 2, online: true,
      thread: [
        { kind: 'customer', text: "Hi! I'm looking to get my roof inspected. I noticed some shingles might be loose after the last storm. Can you let me know availability this week?", time: '10:24 AM' },
        { kind: 'auto', text: "Thanks for reaching out to Acme Home Services! We've received your request and will be in touch within 24 hours.", time: '10:24 AM' },
        { kind: 'owner', text: "Hi Jessica, thanks for reaching out! I'd be happy to inspect your roof. We have availability this week — would you prefer a morning or afternoon appointment?", time: '10:31 AM' },
        { kind: 'customer', text: 'Morning would be great, thanks!', time: '10:42 AM' },
        { kind: 'ai-draft', text: "Perfect! I have Wednesday at 9:00 AM or Thursday at 10:30 AM open. Which works best for you?", time: 'Draft' },
      ],
      suggested: "Perfect! I have Wednesday at 9:00 AM or Thursday at 10:30 AM open. Which works best for you?",
    },
    {
      id: 'C-2', name: 'David Martinez', initials: 'DM', leadId: 'L-1041', service: 'Gutter Cleaning',
      status: 'Contacted', followState: 'Scheduled', preview: 'Tuesday afternoon works for me.', time: '9:58 AM', unread: 0, online: false,
      thread: [
        { kind: 'customer', text: 'My gutters are overflowing when it rains. Looking for a cleaning and maybe a quick check on the downspouts.', time: '9:58 AM' },
        { kind: 'auto', text: "Thanks for contacting Acme Home Services! We'll reply within 24 hours.", time: '9:58 AM' },
        { kind: 'owner', text: 'Hi David, we can take care of that. When works best this week?', time: '11:30 AM' },
        { kind: 'customer', text: 'Tuesday afternoon works for me.', time: '12:05 PM' },
        { kind: 'scheduled', text: 'Follow-up scheduled for Tue, May 20 at 2:00 PM', time: '12:06 PM' },
      ],
      suggested: "Great — I'll book you Tuesday at 2:00 PM. You'll get a confirmation shortly. Thanks David!",
    },
    {
      id: 'C-3', name: 'Amanda Wilson', initials: 'AW', leadId: 'L-1040', service: 'Window Cleaning',
      status: 'Booked', followState: 'Sent', preview: 'See you then! 🙂', time: 'Yesterday', unread: 1, online: false,
      thread: [
        { kind: 'customer', text: 'Referred by my neighbor. Need exterior window cleaning before a family event.', time: 'Yesterday' },
        { kind: 'owner', text: "You're all set for Saturday at 10 AM. We'll send a reminder the day before.", time: 'Yesterday' },
        { kind: 'followup', text: 'Reminder sent: Your appointment is tomorrow at 10:00 AM.', time: 'Yesterday' },
        { kind: 'customer', text: 'See you then! 🙂', time: 'Yesterday' },
      ],
      suggested: "Looking forward to it, Amanda! If anything changes just reply here. See you Saturday.",
    },
    {
      id: 'C-4', name: 'Priya Nair', initials: 'PN', leadId: 'L-1036', service: 'Roof Inspection',
      status: 'Contacted', followState: 'Action needed', preview: 'Can you do it before Friday?', time: 'Mon', unread: 0, online: true,
      thread: [
        { kind: 'customer', text: 'Buying a home and need a pre-purchase roof inspection within the next few days.', time: 'Mon' },
        { kind: 'owner', text: 'Congrats! We can do it within 2 days and email a full report.', time: 'Mon' },
        { kind: 'failed', text: 'Delivery failed — recipient mailbox full. Tap to retry.', time: 'Mon' },
        { kind: 'customer', text: 'Can you do it before Friday?', time: 'Mon' },
      ],
      suggested: "Absolutely — I can schedule Thursday morning and have the report to you by Thursday evening. Does 9 AM work?",
    },
  ];

  // ---------- Admin: businesses ----------
  const BUSINESSES = [
    { name: 'Acme Home Services', domain: 'acmehomeservices.com', slug: 'acme-home-services', owner: 'Alex Johnson', industry: 'Home Services', status: 'Active', plan: 'Pro', leads: 128, added: 'May 18, 2025', color: '#0F172A', icon: 'home2' },
    { name: 'Green Leaf Landscaping', domain: 'greenleaflandscaping.com', slug: 'green-leaf', owner: 'Sarah Mitchell', industry: 'Landscaping', status: 'Active', plan: 'Standard', leads: 86, added: 'May 18, 2025', color: '#059669', icon: 'leaf' },
    { name: 'Bright Realty Group', domain: 'brightrealtygroup.com', slug: 'bright-realty', owner: 'Michael Brown', industry: 'Real Estate', status: 'Active', plan: 'Pro', leads: 74, added: 'May 17, 2025', color: '#1E293B', icon: 'building' },
    { name: 'ProClean Services', domain: 'procleanservices.com', slug: 'proclean', owner: 'Jessica Smith', industry: 'Cleaning Services', status: 'Active', plan: 'Standard', leads: 62, added: 'May 17, 2025', color: '#2563EB', icon: 'droplet' },
    { name: 'Wellness Collective', domain: 'wellnesscollective.com', slug: 'wellness', owner: 'Amanda Wilson', industry: 'Health & Wellness', status: 'Active', plan: 'Pro', leads: 41, added: 'May 16, 2025', color: '#DB2777', icon: 'heart' },
    { name: 'Roofing Rangers', domain: 'roofingrangers.com', slug: 'roofing-rangers', owner: 'Robert Brown', industry: 'Roofing', status: 'Pending', plan: 'Standard', leads: 0, added: 'May 16, 2025', color: '#EA580C', icon: 'home' },
    { name: 'FitLife Studios', domain: 'fitlifestudios.com', slug: 'fitlife', owner: 'David Martinez', industry: 'Fitness', status: 'Active', plan: 'Standard', leads: 36, added: 'May 15, 2025', color: '#0891B2', icon: 'activity' },
    { name: 'QuickFix Plumbing', domain: 'quickfixplumbing.com', slug: 'quickfix', owner: 'Kevin Lee', industry: 'Plumbing', status: 'Paused', plan: 'Basic', leads: 12, added: 'May 14, 2025', color: '#B45309', icon: 'wrench' },
    { name: 'Urban Market Co.', domain: 'urbanmarketco.com', slug: 'urban-market', owner: 'Rachel Green', industry: 'Retail', status: 'Active', plan: 'Standard', leads: 55, added: 'May 14, 2025', color: '#7C3AED', icon: 'cart' },
    { name: 'Happy Paws Pet Care', domain: 'happypawspetcare.com', slug: 'happy-paws', owner: 'Melissa Taylor', industry: 'Pet Services', status: 'Active', plan: 'Basic', leads: 29, added: 'May 13, 2025', color: '#16A34A', icon: 'paw' },
  ];

  // ---------- Admin: recent activity ----------
  const ACTIVITY = [
    { icon: 'building', tone: 'blue', title: 'New business "Acme Home Services" added', meta: 'by Alex Johnson', time: '10:24 AM' },
    { icon: 'userPlus', tone: 'violet', title: 'Owner invite sent to Jessica Smith', meta: 'acme-home-services.com', time: '9:58 AM' },
    { icon: 'users', tone: 'green', title: 'New lead captured for Roof Inspection', meta: 'Acme Home Services', time: '9:41 AM' },
    { icon: 'mail', tone: 'blue', title: 'Email campaign "Spring Promo" sent', meta: 'Acme Plumbing', time: '9:15 AM' },
    { icon: 'building', tone: 'gray', title: 'Business "Bright Cleaners" created', meta: 'by Admin User', time: 'Yesterday 4:21 PM' },
  ];

  // ---------- Admin: audit logs ----------
  const AUDIT = [
    { ts: 'May 18, 2025 · 10:24 AM', actor: 'Alex Johnson', actorRole: 'Super Admin', business: 'Acme Home Services', action: 'Business created', type: 'create', details: 'Created new business with Pro plan', ip: '73.42.18.5 · Chrome / macOS' },
    { ts: 'May 18, 2025 · 9:58 AM', actor: 'Alex Johnson', actorRole: 'Super Admin', business: 'Acme Home Services', action: 'Owner invited', type: 'invite', details: 'Invite sent to jessica.smith@email.com', ip: '73.42.18.5 · Chrome / macOS' },
    { ts: 'May 18, 2025 · 9:41 AM', actor: 'System', actorRole: 'Automation', business: 'Acme Home Services', action: 'Lead status changed', type: 'update', details: 'L-1042 New → Contacted', ip: 'internal' },
    { ts: 'May 18, 2025 · 9:15 AM', actor: 'Sarah Mitchell', actorRole: 'Owner', business: 'Green Leaf Landscaping', action: 'Form link copied', type: 'read', details: 'Copied public form link', ip: '104.28.9.12 · Safari / iOS' },
    { ts: 'May 17, 2025 · 4:21 PM', actor: 'System', actorRole: 'Automation', business: 'ProClean Services', action: 'Email sent', type: 'email', details: 'Auto-reply to new lead L-0991', ip: 'internal' },
    { ts: 'May 17, 2025 · 2:15 PM', actor: 'Admin User', actorRole: 'Super Admin', business: 'QuickFix Plumbing', action: 'Business paused', type: 'pause', details: 'Subscription lapsed — auto-paused', ip: '73.42.18.5 · Chrome / macOS' },
    { ts: 'May 17, 2025 · 11:03 AM', actor: 'Michael Brown', actorRole: 'Owner', business: 'Bright Realty Group', action: 'Settings updated', type: 'update', details: 'Changed auto-reply template', ip: '99.12.44.7 · Firefox / Windows' },
    { ts: 'May 16, 2025 · 6:20 PM', actor: 'System', actorRole: 'Automation', business: 'Acme Home Services', action: 'Lead status changed', type: 'update', details: 'L-1037 New → Lost', ip: 'internal' },
    { ts: 'May 16, 2025 · 10:12 AM', actor: 'Admin User', actorRole: 'Super Admin', business: 'Roofing Rangers', action: 'Owner invited', type: 'invite', details: 'Invite sent to robert.brown@email.com', ip: '73.42.18.5 · Chrome / macOS' },
  ];

  // ---------- Lead volume chart (owner) ----------
  const LEAD_VOLUME = [
    { label: 'May 12', v: 22 }, { label: 'May 13', v: 35 }, { label: 'May 14', v: 24 },
    { label: 'May 15', v: 44 }, { label: 'May 16', v: 70 }, { label: 'May 17', v: 45 }, { label: 'May 18', v: 24 },
  ];
  const PLATFORM_GROWTH = [
    { label: 'May 12', v: 200 }, { label: 'May 13', v: 420 }, { label: 'May 14', v: 300 },
    { label: 'May 15', v: 480 }, { label: 'May 16', v: 820 }, { label: 'May 17', v: 540 }, { label: 'May 18', v: 280 },
  ];

  const SERVICES = ['Roof Inspection', 'Roof Repair', 'Gutter Cleaning', 'Window Cleaning', 'Pressure Washing', 'General Inquiry'];
  const INDUSTRIES = ['Home Services', 'Landscaping', 'Real Estate', 'Cleaning Services', 'Health & Wellness', 'Roofing', 'Fitness', 'Plumbing', 'Retail', 'Pet Services'];

  window.DATA = { LEADS, FOLLOWUPS, CONVERSATIONS, BUSINESSES, ACTIVITY, AUDIT, LEAD_VOLUME, PLATFORM_GROWTH, SERVICES, INDUSTRIES };
})();
