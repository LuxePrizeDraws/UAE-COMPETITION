import { Link } from 'react-router-dom';
import './FeatureCentre.css';

const surfacedIntegrations = [
  {
    title: 'Live competition catalogue',
    description: 'The homepage and dashboard both surface current competitions with status, pricing, progress, and prize framing.',
    location: 'Home + Dashboard',
  },
  {
    title: 'Prize or cash selection',
    description: 'Eligible competitions already expose user choice between a physical prize and a cash alternative.',
    location: 'Dashboard + Entry modal',
  },
  {
    title: 'Stripe checkout integration',
    description: 'The entry flow can redirect into Stripe when payment keys are configured in the environment.',
    location: 'Entry modal',
  },
  {
    title: 'Demo fallback entry mode',
    description: 'When Stripe is not configured, the same flow still works in a safe demo mode for presentations and walkthroughs.',
    location: 'Entry modal + backend',
  },
  {
    title: 'Free postal entry support',
    description: 'Postal-entry guidance is included as a visible alternative path inside the entry journey.',
    location: 'Entry modal + API',
  },
  {
    title: 'Wellbeing support and charity layer',
    description: 'A dedicated support tab now includes the AI advisor, awareness messaging, persistent help badge, and one-click charity button.',
    location: 'Support tab',
  },
  {
    title: 'Disclosure-first investor view',
    description: 'Commercial context stays visible through a dedicated investor summary without unsupported public claims.',
    location: 'Investor Summary',
  },
] as const;

const navigationLayers = [
  'Use Home to frame the product and open the main demo paths.',
  'Use Dashboard to show live states, prize options, countdowns, and entry actions.',
  'Use Entry Options to walk through paid, demo, and postal participation methods.',
  'Use Investor Summary to close with disclosure and diligence positioning.',
] as const;

export default function FeatureCentre() {
  return (
    <main className="feature-centre">
      <section className="feature-centre__hero">
        <div className="container">
          <p className="feature-centre__eyebrow">Feature Centre</p>
          <h1>All implemented integrations, surfaced in one place</h1>
          <p>
            This tab is the no-hidden-features layer of the demo. It collects the active product,
            entry, and disclosure integrations that are already implemented in the current build.
          </p>
          <div className="feature-centre__actions">
            <Link to="/dashboard" className="feature-centre__btn feature-centre__btn--primary">Open dashboard</Link>
            <Link to="/entry-options" className="feature-centre__btn">Review entry options</Link>
          </div>
        </div>
      </section>

      <section className="feature-centre__section">
        <div className="container">
          <h2>Current integration surface</h2>
          <div className="feature-centre__grid">
            {surfacedIntegrations.map((item) => (
              <article key={item.title} className="feature-centre__card">
                <span>{item.location}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="feature-centre__section feature-centre__section--alt">
        <div className="container">
          <h2>Demo navigation layers</h2>
          <div className="feature-centre__steps">
            {navigationLayers.map((item, index) => (
              <article key={item} className="feature-centre__step">
                <strong>Layer {index + 1}</strong>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
