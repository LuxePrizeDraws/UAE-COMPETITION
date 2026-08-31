import './DreamAppPrize.css';

const included = [
  { icon: '👨‍💻', label: 'Dedicated Senior Developer' },
  { icon: '🎨', label: 'Professional UI/UX Design' },
  { icon: '🗄️', label: 'Database Architecture & Setup' },
  { icon: '🔐', label: 'User Authentication System' },
  { icon: '💳', label: 'Payment Integration (if needed)' },
  { icon: '🔌', label: 'API Integrations (up to 3)' },
  { icon: '⚡', label: 'Performance Optimisation' },
  { icon: '🛡️', label: 'Security Hardening' },
  { icon: '🧪', label: 'Testing & QA' },
  { icon: '🚀', label: 'Deployment Assistance' },
  { icon: '📄', label: 'Full Source Code Ownership' },
  { icon: '🎓', label: '3 Months Post-Launch Support' },
];

const timeline = [
  { week: 'Week 1', phase: 'Consultation', desc: 'Requirements gathering & vision alignment' },
  { week: 'Weeks 2–4', phase: 'Design', desc: 'Wireframes, mockups & UI/UX design' },
  { week: 'Weeks 5–24', phase: 'Development', desc: 'Agile sprints with weekly progress updates' },
  { week: 'Weeks 25–26', phase: 'Testing & Launch', desc: 'QA, deployment and go-live' },
  { week: 'Months 4–6', phase: 'Support', desc: 'Post-launch monitoring and fixes' },
];

const examples = [
  { icon: '🛍️', title: 'E-Commerce Store', desc: 'A fully custom online store with inventory management, payments and analytics.' },
  { icon: '📱', title: 'Mobile App', desc: 'iOS/Android app with user profiles, push notifications and real-time features.' },
  { icon: '📊', title: 'SaaS Dashboard', desc: 'A subscription platform with admin panel, billing and data visualisations.' },
  { icon: '🍽️', title: 'Booking Platform', desc: 'Appointment/reservation system with calendar, payments and email reminders.' },
];

const faqs = [
  {
    q: 'What kind of app can I build?',
    a: 'Virtually anything — web app, mobile app, e-commerce store, booking platform, SaaS tool, internal dashboard and more. The developer will advise on feasibility during consultation.',
  },
  {
    q: 'Can I take the £50,000 cash instead?',
    a: 'Yes! The choice is entirely yours. You can take full custom development OR £50,000 cash equivalent. Both options have equal value.',
  },
  {
    q: 'Do I keep the app and source code?',
    a: 'Absolutely. You receive full source code ownership and all intellectual property rights. The app is 100% yours.',
  },
  {
    q: 'How long does development take?',
    a: 'Typically 6–12 months depending on scope and complexity. The timeline is discussed and agreed during Week 1 consultation.',
  },
  {
    q: 'What happens after the 3-month support period?',
    a: 'We offer paid maintenance packages. Your developer will provide a proposal for ongoing support at competitive rates.',
  },
];

export default function DreamAppPrize() {
  return (
    <div className="da-page">
      {/* Hero */}
      <section className="da-hero">
        <div className="da-hero-glow" />
        <div className="da-hero-content">
          <span className="da-exclusive-badge">⚡ EXCLUSIVE · LIMITED AVAILABILITY</span>
          <h1 className="da-hero-title">🚀 BUILD YOUR<br />DREAM APP</h1>
          <p className="da-hero-value">Worth <strong>£50,000</strong> in custom development</p>
          <p className="da-hero-sub">
            Your idea, professionally built by a senior full-stack developer.
            From concept to live product — or take the £50K cash. Your choice.
          </p>
          <div className="da-choice-toggle">
            <div className="da-choice-item da-choice-item--active">
              <span className="da-choice-icon">💻</span>
              <span>Custom App Development</span>
            </div>
            <div className="da-choice-divider">OR</div>
            <div className="da-choice-item">
              <span className="da-choice-icon">💷</span>
              <span>£50,000 Cash</span>
            </div>
          </div>
          <a href="/" className="da-cta">ENTER TO WIN →</a>
        </div>
      </section>

      {/* What's included */}
      <section className="da-included">
        <div className="container">
          <h2 className="da-section-title">WHAT'S INCLUDED</h2>
          <div className="da-included-grid">
            {included.map((item) => (
              <div key={item.label} className="da-included-item">
                <span className="da-included-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="da-timeline">
        <div className="container">
          <h2 className="da-section-title">DEVELOPMENT TIMELINE</h2>
          <div className="da-timeline-track">
            {timeline.map((t, i) => (
              <div key={t.week} className="da-timeline-step">
                <div className="da-timeline-dot">{i + 1}</div>
                <div className="da-timeline-body">
                  <div className="da-timeline-week">{t.week}</div>
                  <div className="da-timeline-phase">{t.phase}</div>
                  <div className="da-timeline-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example apps */}
      <section className="da-examples">
        <div className="container">
          <h2 className="da-section-title">EXAMPLE APPS YOU COULD BUILD</h2>
          <div className="da-examples-grid">
            {examples.map((ex) => (
              <div key={ex.title} className="da-example-card">
                <div className="da-example-icon">{ex.icon}</div>
                <h3>{ex.title}</h3>
                <p>{ex.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="da-faqs">
        <div className="container">
          <h2 className="da-section-title">FREQUENTLY ASKED QUESTIONS</h2>
          <div className="da-faqs-list">
            {faqs.map((faq) => (
              <div key={faq.q} className="da-faq-item">
                <h3 className="da-faq-q">Q: {faq.q}</h3>
                <p className="da-faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="da-bottom-cta">
        <div className="container">
          <h2>CLAIM YOUR DREAM APP PRIZE</h2>
          <p>Enter the competition now — limited availability.</p>
          <a href="/" className="da-cta da-cta--large">START YOUR APP JOURNEY →</a>
        </div>
      </section>
    </div>
  );
}
