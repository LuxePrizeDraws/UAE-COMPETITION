import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="not-found-page">
    <div className="container auth-card not-found-card">
      <p className="section-eyebrow">404</p>
      <h1 className="section-heading">This luxury page has left the building.</h1>
      <p className="section-copy">The route you requested does not exist. Return to the competition gallery and continue exploring.</p>
      <Link className="btn" to="/">
        Back to homepage
      </Link>
    </div>
  </div>
);

export default NotFound;
