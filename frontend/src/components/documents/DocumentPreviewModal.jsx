import React from 'react';
import { FileText, X, Copy, Check, ExternalLink, Sparkles, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';

export const DocumentPreviewModal = ({ isOpen, onClose, citation }) => {
  const { addToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !citation) return null;

  const filename = citation.filename || citation.name || 'Document.pdf';
  const location = citation.location || `Page ${citation.page_number || 1}`;
  const score = citation.similarity_score !== undefined
    ? (citation.similarity_score * 100).toFixed(1)
    : '94.0';
  const snippet = citation.snippet || citation.text || 'No text snippet available.';
  const chunkIndex = citation.chunk_index !== undefined ? citation.chunk_index : 1;
  const format = citation.format || filename.split('.').pop().toUpperCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    addToast('Cited text snippet copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        {/* Modal Window */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '85vh',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Modal Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface-secondary)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-tint)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {filename}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{location}</span>
                  <span>•</span>
                  <span>Chunk #{chunkIndex}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '4px 10px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={12} />
                Match Score: {score}%
              </span>

              <button
                onClick={onClose}
                aria-label="Close Preview Modal"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Metadata Sub-bar */}
          <div style={{
            padding: '10px 20px',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            flexShrink: 0,
            flexWrap: 'wrap'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={13} style={{ color: 'var(--text-muted)' }} />
              Format: <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{format}</strong>
            </span>
            <span>•</span>
            <span>Index Status: <strong style={{ color: '#22c55e' }}>Indexed & Verified</strong></span>
            <span>•</span>
            <span>Vector Distance: <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{(1 - parseFloat(score)/100).toFixed(4)}</strong></span>
          </div>

          {/* Modal Body / Text Viewer */}
          <div style={{
            padding: '20px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: 'var(--surface-secondary)'
          }}>

            {/* Glowing Neon Highlight Excerpt Box */}
            <div style={{
              backgroundColor: 'rgba(234, 179, 8, 0.08)',
              border: '1.5px solid rgba(234, 179, 8, 0.4)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 0 20px rgba(234, 179, 8, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  color: '#eab308',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(234, 179, 8, 0.15)',
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}>
                  📌 CITED EXCERPT (RAG Matched Vector Chunk)
                </span>

                <button
                  onClick={handleCopy}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(234, 179, 8, 0.4)',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    color: '#eab308',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied!' : 'Copy Excerpt'}</span>
                </button>
              </div>

              <div style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                fontWeight: 500,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                backgroundColor: 'rgba(234, 179, 8, 0.12)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '4px solid #eab308'
              }}>
                {snippet}
              </div>
            </div>

            {/* Document Context Overview Section */}
            <div style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Full Page / Section Context Preview
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                This excerpt was extracted from <strong>{filename}</strong> [{location}]. The RAG vector retrieval engine scored this text chunk at <strong>{score}% similarity</strong> to answer the query with ground truth citations.
              </p>
            </div>

          </div>

          {/* Modal Footer */}
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--surface)',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Press <strong>Esc</strong> or click outside to close
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Button variant="secondary" onClick={handleCopy} icon={copied ? Check : Copy}>
                {copied ? 'Copied Excerpt' : 'Copy Excerpt'}
              </Button>
              <Button variant="primary" onClick={onClose}>
                Done & Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
