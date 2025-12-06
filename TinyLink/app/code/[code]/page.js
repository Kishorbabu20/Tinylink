'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FiBarChart2, 
  FiCopy, 
  FiCheck, 
  FiLink2, 
  FiDownload,
  FiArrowLeft,
  FiExternalLink
} from 'react-icons/fi';
import { MdQrCode } from 'react-icons/md';
import ThemeToggle from '../../ThemeToggle';

export default function LinkStats() {
  const { code } = useParams();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (code) {
      fetchLink();
    }
  }, [code]);

  const fetchLink = async () => {
    try {
      const response = await fetch(`/api/links/${code}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Link not found');
        }
        throw new Error('Failed to fetch link');
      }
      const data = await response.json();
      setLink(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const getShortUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/${link.code}`;
    }
    return `/${link.code}`;
  };

  if (loading) return (
    <div className="container">
      <div className="loading">Loading...</div>
    </div>
  );
  
  if (error) return (
    <div className="container">
      <div className="error">Error: {error}</div>
      <a href="/" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiArrowLeft /> Back to Dashboard
      </a>
    </div>
  );
  
  if (!link) return (
    <div className="container">
      <div className="error">Link not found</div>
      <a href="/" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiArrowLeft /> Back to Dashboard
      </a>
    </div>
  );

  const shortUrl = getShortUrl();
  const getDomainName = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };
  const domainName = getDomainName(link.url);

  return (
    <div className="container">
      <ThemeToggle />
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiBarChart2 /> Link Statistics
      </h1>

      {/* Title and Domain Display */}
      {link.title && (
        <div style={{ 
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ 
            fontSize: '0.875rem',
            color: 'var(--text-light)',
            marginBottom: '0.5rem'
          }}>
            {domainName}
          </div>
          <div style={{ 
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text)',
            wordBreak: 'break-word'
          }}>
            {link.title}
          </div>
        </div>
      )}

      <div className="stats-card">
        <div className="stat-item">
          <strong>Short Link:</strong>
          <div className="short-link">
            <span style={{ fontFamily: 'monospace', fontSize: '1.125rem' }}>{shortUrl}</span>
            <button 
              className="btn btn-primary"
              onClick={() => copyToClipboard(shortUrl)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {copySuccess ? (
                <>
                  <FiCheck /> Copied!
                </>
              ) : (
                <>
                  <FiCopy /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="stat-item">
          <strong>Original URL:</strong>
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: 'var(--primary)', 
              wordBreak: 'break-all',
              textDecoration: 'none'
            }}
          >
            {link.url}
          </a>
        </div>

        <div className="stat-item">
          <strong>Code:</strong> 
          <span style={{ 
            fontFamily: 'monospace', 
            color: 'var(--primary)', 
            fontWeight: 600,
            fontSize: '1.125rem'
          }}>
            {link.code}
          </span>
        </div>

        <div className="stat-item">
          <strong>Clicks:</strong> 
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginLeft: '0.5rem'
          }}>
            <FiExternalLink /> {link.clickCount}
          </span>
        </div>

        <div className="stat-item">
          <strong>Created:</strong> {new Date(link.createdAt).toLocaleString()}
        </div>

        {link.lastClicked && (
          <div className="stat-item">
            <strong>Last Clicked:</strong> {new Date(link.lastClicked).toLocaleString()}
          </div>
        )}
      </div>

      <div className="stats-card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem',
            color: 'var(--text)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <MdQrCode /> QR Code
          </h2>
          <a
            href={`/qr/${link.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiLink2 /> Open QR Page
          </a>
        </div>
        <div className="qr-container">
          <div className="qr-code">
            <QRCodeSVG 
              value={shortUrl} 
              size={250}
              level="H"
              includeMargin={true}
            />
          </div>
          <p style={{ 
            marginTop: '1rem',
            color: 'var(--text-light)',
            fontSize: '0.875rem'
          }}>
            Scan to open the link
          </p>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              const canvas = document.querySelector('svg');
              if (canvas) {
                const svgData = new XMLSerializer().serializeToString(canvas);
                const canvas2 = document.createElement('canvas');
                const ctx = canvas2.getContext('2d');
                const img = new Image();
                img.onload = () => {
                  canvas2.width = img.width;
                  canvas2.height = img.height;
                  ctx.drawImage(img, 0, 0);
                  canvas2.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `qrcode-${link.code}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                  });
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiDownload /> Download QR Code
          </button>
        </div>
      </div>

      <a href="/" className="back-link">← Back to Dashboard</a>
    </div>
  );
}
