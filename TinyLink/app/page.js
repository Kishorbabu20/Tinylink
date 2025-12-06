'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FiLink, 
  FiCopy, 
  FiCheck, 
  FiEye, 
  FiTrash2, 
  FiExternalLink,
  FiLink2,
  FiInbox,
  FiEdit,
  FiShare2,
  FiMoreVertical,
  FiCalendar,
  FiTag,
  FiRefreshCw
} from 'react-icons/fi';
import { MdQrCode } from 'react-icons/md';
import ThemeToggle from './ThemeToggle';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ url: '', code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [qrModal, setQrModal] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);
  const [refreshingTitle, setRefreshingTitle] = useState(null);
  const [selectedLinks, setSelectedLinks] = useState([]);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      setLinks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create link');
      }
      const newLink = await response.json();
      setLinks([newLink, ...links]);
      setFormData({ url: '', code: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (code) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      const response = await fetch(`/api/links/${code}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete link');
      setLinks(links.filter(link => link.code !== code));
      setSelectedLinks(selectedLinks.filter(c => c !== code));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectLink = (code) => {
    setSelectedLinks(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleSelectAll = () => {
    if (selectedLinks.length === links.length) {
      setSelectedLinks([]);
    } else {
      setSelectedLinks(links.map(link => link.code));
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedLinks.length === 0) return;
    
    const count = selectedLinks.length;
    if (!confirm(`Are you sure you want to delete ${count} link${count > 1 ? 's' : ''}?`)) return;
    
    try {
      // Delete all selected links
      const deletePromises = selectedLinks.map(code =>
        fetch(`/api/links/${code}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      // Remove deleted links from the list
      setLinks(links.filter(link => !selectedLinks.includes(link.code)));
      setSelectedLinks([]);
    } catch (err) {
      setError(err.message);
      alert('Failed to delete some links. Please try again.');
    }
  };

  const copyToClipboard = (text, code) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(code);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const fetchTitle = async (code) => {
    setRefreshingTitle(code);
    try {
      const response = await fetch(`/api/links/${code}/update-title`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch title');
      }
      const updatedLink = await response.json();
      // Update the link in the list
      setLinks(links.map(link => 
        link.code === code ? updatedLink : link
      ));
    } catch (err) {
      console.error('Error fetching title:', err);
      alert(`Failed to fetch title: ${err.message}. Please check the server console for details.`);
    } finally {
      setRefreshingTitle(null);
    }
  };

  const getShortUrl = (code) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/${code}`;
    }
    return `/${code}`;
  };

  const getDomainName = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  };

  const getFaviconUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return null;
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
    </div>
  );

  return (
    <div className="container">
      <ThemeToggle />
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiLink /> TinyLink
      </h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-light)' }}>
        Create short, shareable links with QR codes
      </p>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="url"
          placeholder="Enter URL to shorten (e.g., https://example.com)"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Custom code (optional)"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          pattern="[A-Za-z0-9_-]+"
          title="Only letters, numbers, hyphens, and underscores allowed"
        />
        <button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {submitting ? 'Creating...' : (
            <>
              <FiLink2 /> Create Short Link
            </>
          )}
        </button>
      </form>

      {links.length === 0 ? (
        <div className="empty">
          <FiInbox style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '1rem' }} />
          <p>No links yet. Create your first short link!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Selection Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            marginBottom: '0.5rem',
            border: '1px solid var(--border)'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={selectedLinks.length === links.length && links.length > 0}
                onChange={handleSelectAll}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary)'
                }}
              />
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                Select All ({selectedLinks.length} selected)
              </span>
            </label>
            {selectedLinks.length > 0 && (
              <button
                onClick={handleDeleteMultiple}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'var(--danger)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <FiTrash2 size={16} />
                Delete Selected ({selectedLinks.length})
              </button>
            )}
          </div>
          {links.map(link => {
            const shortUrl = getShortUrl(link.code);
            const domainName = getDomainName(link.url);
            const faviconUrl = getFaviconUrl(link.url);
            return (
              <div key={link.id} className="link-card" style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1.5rem',
                background: selectedLinks.includes(link.code) ? 'var(--bg)' : 'var(--bg-card)',
                borderRadius: '12px',
                boxShadow: selectedLinks.includes(link.code) ? 'var(--shadow-lg)' : 'var(--shadow)',
                transition: 'all 0.2s',
                border: selectedLinks.includes(link.code) ? '2px solid var(--primary)' : '1px solid transparent'
              }}>
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedLinks.includes(link.code)}
                  onChange={() => handleSelectLink(link.code)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    accentColor: 'var(--primary)',
                    marginTop: '0.25rem',
                    flexShrink: 0
                  }}
                />
                {/* Icon */}
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  {faviconUrl ? (
                    <img 
                      src={faviconUrl} 
                      alt={domainName}
                      style={{ width: '32px', height: '32px' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ 
                    display: faviconUrl ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    color: 'var(--primary)'
                  }}>
                    <FiLink size={24} />
                  </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Domain Name */}
                  <div style={{ 
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-light)',
                    marginBottom: '0.25rem',
                    wordBreak: 'break-word'
                  }}>
                    {domainName}
                  </div>
                  
                  {/* Page/Video Title */}
                  {link.title && link.title.trim() ? (
                    <div style={{ 
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: 'var(--text)',
                      marginBottom: '0.75rem',
                      wordBreak: 'break-word',
                      lineHeight: '1.4'
                    }}>
                      {link.title}
                    </div>
                  ) : (
                    <div style={{ 
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: 'var(--text)',
                      marginBottom: '0.75rem',
                      wordBreak: 'break-word'
                    }}>
                      {domainName}
                    </div>
                  )}

                  {/* Short Link */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ 
                      fontFamily: 'monospace',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}>
                      {shortUrl}
                    </span>
                    <button
                      onClick={() => copyToClipboard(shortUrl, link.code)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-light)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.25rem'
                      }}
                      title="Copy short link"
                    >
                      {copySuccess === link.code ? (
                        <FiCheck size={16} color="var(--success)" />
                      ) : (
                        <FiCopy size={16} />
                      )}
                    </button>
                  </div>

                  {/* Original URL with Arrow */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    color: 'var(--text-light)',
                    fontSize: '0.875rem'
                  }}>
                    <FiExternalLink size={14} />
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: 'var(--text-light)', 
                        textDecoration: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                      title={link.url}
                    >
                      {link.url}
                    </a>
                  </div>

                  {/* Metadata */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '1.5rem',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--text-light)',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiExternalLink size={14} />
                      <strong style={{ color: 'var(--text)' }}>{link.clickCount}</strong> clicks
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FiCalendar size={14} />
                      {new Date(link.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  alignItems: 'flex-start',
                  flexShrink: 0
                }}>
                  <a
                    href={`/qr/${link.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-light)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      textDecoration: 'none'
                    }}
                    title="QR Code"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <MdQrCode size={18} />
                  </a>
                  <button
                    onClick={() => setQrModal(link)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-light)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      borderRadius: '6px'
                    }}
                    title="Quick view"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <FiEye size={18} />
                  </button>
                  {(!link.title || !link.title.trim()) && (
                    <button
                      onClick={() => fetchTitle(link.code)}
                      disabled={refreshingTitle === link.code}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: refreshingTitle === link.code ? 'wait' : 'pointer',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        opacity: refreshingTitle === link.code ? 0.6 : 1
                      }}
                      title="Fetch video/page title"
                      onMouseEnter={(e) => {
                        if (refreshingTitle !== link.code) {
                          e.currentTarget.style.background = 'var(--bg)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <FiRefreshCw 
                        size={18} 
                        className={refreshingTitle === link.code ? 'spinning' : ''}
                      />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(link.code)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem',
                      borderRadius: '6px'
                    }}
                    title="Delete"
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {qrModal && (
        <div className="qr-modal" onClick={() => setQrModal(null)}>
          <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="qr-modal-close" 
              onClick={() => setQrModal(null)}
              aria-label="Close"
            >
              <FiTrash2 />
            </button>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MdQrCode /> QR Code
            </h2>
            <div className="qr-container">
              <div className="qr-code">
                <QRCodeSVG 
                  value={getShortUrl(qrModal.code)} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <p style={{ 
                  fontFamily: 'monospace', 
                  color: 'var(--primary)', 
                  fontWeight: 600,
                  marginBottom: '1rem',
                  wordBreak: 'break-all'
                }}>
                  {getShortUrl(qrModal.code)}
                </p>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      copyToClipboard(getShortUrl(qrModal.code), qrModal.code);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <FiCopy /> Copy Link
                  </button>
                  <a
                    href={`/qr/${qrModal.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => setQrModal(null)}
                  >
                    <FiLink2 /> Open QR Page
                  </a>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      copyToClipboard(`${window.location.origin}/qr/${qrModal.code}`, qrModal.code);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <FiLink /> Copy QR Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
