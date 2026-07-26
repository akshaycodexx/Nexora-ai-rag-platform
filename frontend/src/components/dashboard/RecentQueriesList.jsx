import React from 'react';
import { Card } from '../ui/Card';
import { MessageSquare, Clock, FileCheck } from 'lucide-react';

export const RecentQueriesList = ({ queries = [] }) => {
  const displayQueries = queries || [];

  return (
    <Card style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Recent Queries
        </h3>
        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          User RAG questions & retrieval latency ({displayQueries.length})
        </p>
      </div>

      {/* Scrollable Container */}
      <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
        {displayQueries.length === 0 ? (
          <div style={{ padding: '28px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No queries yet. Ask a question after uploading documents.
          </div>
        ) : displayQueries.map((q, index) => (
          <div
            key={q.id || index}
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              <MessageSquare size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {q.question}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FileCheck size={12} />
                {q.sources || 2} Sources Used
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                {q.responseTime || '110ms'} • {q.timestamp || 'Recently'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
