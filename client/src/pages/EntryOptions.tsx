import { Link } from 'react-router-dom';
import './EntryOptions.css';

const entryMethods = [
  {
    title: 'Stripe checkout',
    detail: 'Paid entry',
    description: 'Live competitions can redirect to Stripe checkout when payment credentials are configured for the environment.',
  },
  {
    title: 'Demo fallback mode',
    detail: 'Presentation safe',
    description: 'If Stripe is not configured, the same entry path confirms in demo mode so the walkthrough remains unblocked.',
  },
  {
    title: 'Free postal entry',
    detail: 'Alternative route',
    description: 'Postal instructions are available in the entry flow so a free entry path is visible alongside digital checkout.',
  },
] as const;

const interactionLayers = [
  'Choose ticket quantity with quick presets or direct quantity input.',
  'Switch between physical prize and cash alternative on eligible competitions.',
  'Review draw timing, remaining entries, and prize inclusions before entering.',
  'Accept the terms step before checkout or demo confirmation.',
] as const;

export default function EntryOptions() {
  return (
    <main className="entry-options-page">
      <section className="entry-options-page__hero">
        <div className="container">
          <p className="entry-options-page__eyebrow">Entry Options</p>
          <h1>Every current participation path, made visible</h1>
          <p>
            This tab pulls the entry integrations out of the modal context so presenters can explain
            paid checkout, demo fallback, postal entry, and prize-choice behavior before entering a draw.
          </p>
          <div className="entry-options-page__actions">
            <Link to="/dashboard" className="entry-options-page__btn entry-options-page__btn--primary">Go to dashboard</Link>
            <Link to="/feature-centre" className="entry-options-page__btn">Open feature centre</Link>
          </div>
        </div>
      </section>

      <section className="entry-options-page__section">
        <div className="container">
          <h2>Integrated entry methods</h2>
          <div className="entry-options-page__grid">
            {entryMethods.map((method) => (
              <article key={method.title} className="entry-options-page__card">
                <span>{method.detail}</span>
                <h3>{method.title}</h3>
                <p>{method.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="entry-options-page__section entry-options-page__section--alt">
        <div className="container">
          <h2>Interaction layers inside the entry flow</h2>
          <div className="entry-options-page__layers">
            {interactionLayers.map((layer, index) => (
              <article key={layer} className="entry-options-page__layer">
                <strong>Step {index + 1}</strong>
                <p>{layer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
