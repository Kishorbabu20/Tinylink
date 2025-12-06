import { FiArrowLeft, FiLink } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="container">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiLink /> 404 - Link Not Found
      </h1>
      <p>The short link you're looking for doesn't exist or has been deleted.</p>
      <a href="/" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiArrowLeft /> Back to Dashboard
      </a>
    </div>
  );
}
