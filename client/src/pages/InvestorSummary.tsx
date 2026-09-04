import './InvestorSummary.css';

const metricDisclosures = [
  { label: 'Business type', value: 'Prize competition / consumer entertainment platform' },
  { label: 'Monthly recurring revenue', value: 'Not disclosed' },
  { label: 'Last 12-month revenue', value: 'Not disclosed' },
  { label: 'Profit status', value: 'Not disclosed' },
  { label: 'Growth status', value: 'Available on request' },
  { label: 'Active customers', value: 'Not disclosed' },
  { label: 'Churn', value: 'Not disclosed' },
  { label: 'Traffic', value: 'Available on request' },
  { label: 'Operating costs', value: 'Not disclosed' },
];

function InvestorSummary() {
  return (
    <main className="investor-summary">
      <section className="investor-summary__hero">
        <div className="container">
          <p className="investor-summary__eyebrow">Investor Summary</p>
          <h1>Disclosure &amp; Demo Overview</h1>
          <p>
            This page is designed to support demos with a disclosure-first overview of what the
            platform currently shows publicly and which commercial details remain private until
            verified or shared through diligence.
          </p>
        </div>
      </section>

      <section className="investor-summary__section">
        <div className="container">
          <h2>Business Overview</h2>
          <p>
            UAE Competition is presented here as a premium digital prize-draw product experience.
            The current frontend demo focuses on competition browsing, dashboard visibility, and
            clear supporting disclosure rather than public performance marketing claims.
          </p>
        </div>
      </section>

      <section className="investor-summary__section investor-summary__section--alt">
        <div className="container">
          <h2>Key Metrics Disclosure</h2>
          <div className="disclosure-grid">
            {metricDisclosures.map((metric) => (
              <article key={metric.label} className="disclosure-card">
                <h3>{metric.label}</h3>
                <p>{metric.value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="investor-summary__section">
        <div className="container disclosure-layout">
          <article className="disclosure-panel">
            <h2>Commercial Disclosure Status</h2>
            <p>
              Asking price and any valuation discussion are <strong>available on request</strong>. No
              public valuation is presented here without verification, diligence, and commercial review.
            </p>
          </article>
          <article className="disclosure-panel">
            <h2>Operating Ownership</h2>
            <p>
              Current maintenance is founder-managed. Operating effort will vary with campaign
              volume, support demand, compliance workflows, and future commercial scale.
            </p>
          </article>
        </div>
      </section>

      <section className="investor-summary__section investor-summary__section--alt">
        <div className="container">
          <h2>Due Diligence Readiness</h2>
          <p>
            The current demo, dashboard, and disclosure map are intended to make the product easy to
            understand quickly. Verified traffic, growth, and financial information can be layered in
            later once they are auditable and ready for formal diligence sharing.
          </p>
        </div>
      </section>
    </main>
  );
}

export default InvestorSummary;
