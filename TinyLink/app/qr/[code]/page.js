'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FiCopy, 
  FiCheck, 
  FiDownload, 
  FiArrowLeft, 
  FiBarChart2,
  FiExternalLink
} from 'react-icons/fi';
import { MdQrCode } from 'react-icons/md';
import ThemeToggle from '../../ThemeToggle';

export default function QRCodePage() {
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

  const downloadQRCode = () => {
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
          a.download = `qrcode-${code}.png`;
          a.click();
          URL.revokeObjectURL(url);
        });
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
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
        <MdQrCode /> QR Code
      </h1>
      
      {/* Title and Domain Display */}
      {link.title && (
        <div style={{ 
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          textAlign: 'left'
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
      
      <div className="stats-card" style={{ textAlign: 'center' }}>
        <div className="qr-container" style={{ 
          border: 'none', 
          background: 'transparent',
          padding: '2rem 0'
        }}>
          <div className="qr-code" style={{ 
            display: 'flex', 
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--bg-card)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <QRCodeSVG 
              value={shortUrl} 
              size={300}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <p style={{ 
              fontFamily: 'monospace', 
              color: 'var(--primary)', 
              fontWeight: 600,
              fontSize: '1.25rem',
              marginBottom: '1rem',
              wordBreak: 'break-all'
            }}>
              {shortUrl}
            </p>
            
            <p style={{ 
              color: 'var(--text-light)',
              marginBottom: '1.5rem'
            }}>
              Scan this QR code to open the link
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
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
                    <FiCopy /> Copy Link
                  </>
                )}
              </button>
              <button 
                className="btn btn-secondary"
                onClick={downloadQRCode}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FiDownload /> Download QR Code
              </button>
            </div>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '2rem', 
          paddingTop: '2rem',
          borderTop: '1px solid var(--border)'
        }}>
          <div className="stat-item" style={{ borderBottom: 'none', marginBottom: '0.5rem' }}>
            <strong>Original URL:</strong>
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: 'var(--primary)', 
                wordBreak: 'break-all',
                textDecoration: 'none',
                display: 'block',
                marginTop: '0.5rem'
              }}
            >
              {link.url}
            </a>
          </div>
          <div className="stat-item" style={{ borderBottom: 'none', marginBottom: '0.5rem' }}>
            <strong>Clicks:</strong> 
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: 'var(--primary)',
              marginLeft: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiExternalLink /> {link.clickCount}
            </span>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        justifyContent: 'center',
        marginTop: '2rem',
        flexWrap: 'wrap'
      }}>
        <a href={`/code/${code}`} className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiBarChart2 /> View Full Stats
        </a>
        <a href="/" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiArrowLeft /> Back to Dashboard
        </a>
      </div>
    </div>
  );
}

