import React from 'react';
import { Badge } from '../ui/Badge';
import { SourceCitationCard } from './SourceCitationCard';
import { AlertTriangle, CheckCircle2, FileCheck, Layers, ShieldCheck, FolderGit2, ChevronRight } from 'lucide-react';

// Strip redundant raw "Source: [doc_id: ...]" lines appended at end of LLM text
const cleanRawSourceText = (text = '') => {
  return text
    .replace(/Source:\s*\[doc_id:[\s\S]*$/gi, '')
    .replace(/Source:\s*File:[\s\S]*$/gi, '')
    .trim();
};

// Formatted inline parser for **bold text**, `code`, and Technologies: lists
const FormattedInlineText = ({ text }) => {
  if (!text) return null;

  // Format "Technologies: React.js, Node.js..." as sleek pill tags using theme variables
  const techMatch = text.match(/^(Technologies|Tech Stack|Stack|Tools):\s*(.*)$/i);
  if (techMatch) {
    const label = techMatch[1];
    const techList = techMatch[2].split(',').map(t => t.trim()).filter(Boolean);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: '4px 0' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {label}:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {techList.map((tech, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-tint)',
                border: '1px solid var(--border)',
                padding: '2px 9px',
                borderRadius: '12px'
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Format **bold** and `code` using theme tokens
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return (
    <span>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return (
            <strong
              key={idx}
              style={{
                fontWeight: 700,
                color: 'var(--text-primary)',
                backgroundColor: 'var(--primary-tint)',
                padding: '2px 7px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                letterSpacing: '-0.01em',
                marginRight: '2px'
              }}
            >
              {boldText}
            </strong>
          );
        } else if (part.startsWith('`') && part.endsWith('`')) {
          const codeText = part.slice(1, -1);
          return (
            <code
              key={idx}
              style={{
                fontFamily: 'monospace',
                fontSize: '0.825rem',
                color: 'var(--primary)',
                backgroundColor: 'var(--surface)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--border)'
              }}
            >
              {codeText}
            </code>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
};

export const AnswerWorkspace = ({ response, onPreview }) => {
  if (!response) return null;

  const rawAnswer = cleanRawSourceText(response.answer || '');
  const lines = rawAnswer.split('\n').map(l => l.trim()).filter(Boolean);

  const isGuarded = response.is_hallucination_guarded;
  const confidence = Number.isFinite(response.confidence_score)
    ? (response.confidence_score * 100).toFixed(1)
    : '0.0';
  const StatusIcon = isGuarded ? AlertTriangle : CheckCircle2;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginTop: '10px',
      paddingTop: '10px',
      borderTop: '1px solid var(--border)'
    }}>
      {/* Answer Header Bar & Meta Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Badge status={isGuarded ? 'warning' : 'success'}>
            {isGuarded ? 'Guardrail blocked' : 'Verified RAG Answer'}
          </Badge>

          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
            Confidence {confidence}%
          </span>

          {!isGuarded && response.sources?.length > 0 && (
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileCheck size={14} style={{ color: 'var(--primary)' }} />
              {response.sources.length} source{response.sources.length === 1 ? '' : 's'} verified
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={13} />
            {response.llm_used || 'Extractive Engine'}
          </span>
        </div>
      </div>

      {/* Theme Adaptive Styled Answer Container */}
      <div style={{
        backgroundColor: isGuarded ? 'var(--status-warning-bg)' : 'var(--surface-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Title Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: isGuarded ? 'var(--status-warning-bg)' : 'var(--primary-tint)',
            color: isGuarded ? 'var(--status-warning-text)' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <StatusIcon size={15} />
          </div>
          <span style={{
            fontSize: '0.825rem',
            fontWeight: 750,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: isGuarded ? 'var(--status-warning-text)' : 'var(--primary)'
          }}>
            {isGuarded ? 'Document Scope Notice' : 'Synthesized Answer'}
          </span>
        </div>

        {/* Formatted Content Lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {lines.map((line, idx) => {
            const isHeader = line.endsWith(':') && line.length < 40 && !line.includes('Technologies');
            const isBullet = line.startsWith('- ') || line.startsWith('* ');
            const cleanContent = isBullet ? line.slice(2).trim() : line;

            // Render Main Section Headers (e.g. PROJECTS:)
            if (isHeader) {
              return (
                <div
                  key={idx}
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 750,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                    marginTop: idx > 0 ? '10px' : '0',
                    paddingBottom: '4px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FolderGit2 size={15} style={{ color: 'var(--primary)' }} />
                  <span>{line}</span>
                </div>
              );
            }

            // Render Bullet Points & Project Items
            if (isBullet) {
              const isProjectHeader = cleanContent.startsWith('**') && cleanContent.includes('**');
              return (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '16px minmax(0, 1fr)',
                    gap: '8px',
                    alignItems: 'flex-start',
                    paddingLeft: isProjectHeader ? '0px' : '8px',
                    marginTop: isProjectHeader ? '6px' : '2px'
                  }}
                >
                  <ChevronRight size={14} style={{ color: 'var(--primary)', marginTop: '4px', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    <FormattedInlineText text={cleanContent} />
                  </div>
                </div>
              );
            }

            // Regular Paragraph Line
            return (
              <div key={idx} style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--text-primary)' }}>
                <FormattedInlineText text={line} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Source Citations Section */}
      {response.sources && response.sources.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Verified Evidence Sources ({response.sources.length})
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Click citation to highlight excerpt
            </span>
          </div>
          {response.sources.map((citation, idx) => (
            <SourceCitationCard key={idx} citation={citation} onPreview={onPreview} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnswerWorkspace;
