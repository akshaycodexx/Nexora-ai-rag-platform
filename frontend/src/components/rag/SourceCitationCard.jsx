import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Eye } from 'lucide-react';

export const SourceCitationCard = ({ citation, onPreview }) => {
  const [expanded, setExpanded] = useState(false);

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (onPreview) {
      onPreview(citation);
    } else {
      setExpanded(prev => !prev);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--primary)',
        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
        padding: '10px 14px',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)'
      }}
      onClick={handleCardClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {citation.filename}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            • {citation.location || `Page ${citation.page_number}`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.725rem',
            fontWeight: 600,
            color: 'var(--primary)',
            backgroundColor: 'var(--primary-tint)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            Score: {(citation.similarity_score * 100).toFixed(1)}%
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onPreview) onPreview(citation);
            }}
            title="Preview Document & Highlight Snippet"
            style={{
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--primary)',
              cursor: 'pointer',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.725rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Eye size={12} />
            <span>Highlight</span>
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px dashed var(--border)',
          fontSize: '0.825rem',
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
          lineHeight: '1.4'
        }}>
          "{citation.snippet}"
        </div>
      )}
    </div>
  );
};
