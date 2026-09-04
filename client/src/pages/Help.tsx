import './FeaturePages.css';
import { Link } from 'react-router-dom';

export default function Help() {
  return (
    <section className="feature-page">
      <div className="feature-page__hero">
        <h1>Contact & Help</h1>
        <p>Need support with competitions, tournaments, or wellbeing services? Start here.</p>
      </div>
      <div className="feature-grid">
        <article className="feature-card">
          <h2>Platform Support</h2>
          <ul className="feature-list">
            <li>Email: support@uaecompetition.example</li>
            <li>Response window: within 24 hours</li>
            <li>Use tournament pages for registration confirmation updates</li>
          </ul>
        </article>
        <article className="feature-card">
          <h2>Mental Health Support</h2>
          <p>
            If you want supportive guidance or a support worker handoff, visit the dedicated mental health area.
          </p>
          <Link to="/mental-health" className="feature-link">Open Mental Health Support →</Link>
        </article>
      </div>
    </section>
  );
}
