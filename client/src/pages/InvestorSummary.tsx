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
          <h1>Valuation Overview</h1>
          <p>
            This section provides a clear snapshot of the platform&apos;s current disclosure status.
            Financial and operational figures are intentionally shared as placeholders where verified
            data is not yet published.
          </p>
        </div>
      </section>

      <section className="investor-summary__section">
        <div className="container">
          <h2>Business Overview</h2>
          <p>
            UAE Competition is positioned as a digital prize-competition platform with recurring
            campaign operations, audience engagement, and draw-based product inventory. The current
            focus is operational execution, product maturity, and transparent reporting readiness.
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
            <h2>Asking Price / Current Valuation Status</h2>
            <p>
              Asking price: <strong>Available on request</strong>. Any valuation view should be treated as
              indicative and subject to due diligence, verification of operating data, and commercial review.
            </p>
          </article>
          <article className="disclosure-panel">
            <h2>Maintenance &amp; Operating Effort</h2>
            <p>
              Current maintenance is founder-managed with a low-to-moderate weekly operating commitment.
              Time allocation varies by campaign volume, customer support demand, and acquisition activity.
            </p>
          </article>
        </div>
      </section>

      <section className="investor-summary__section investor-summary__section--alt">
        <div className="container">
          <h2>Future Valuation Potential (Forward-Looking)</h2>
          <p>
            Potential future valuation expansion is expected to depend on three drivers: sustained user
            growth, verified repeat participation economics, and stronger operating leverage as systems,
            support, and campaign workflows mature. As traction data becomes auditable, the platform may
            warrant a materially higher valuation profile than its current disclosure stage.
          </p>
        </div>
      </section>
    </main>
  );
}

export default InvestorSummary;
