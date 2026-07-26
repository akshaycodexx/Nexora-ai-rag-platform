import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FileText, Trash2 } from 'lucide-react';

export const RecentDocumentsTable = ({ documents = [], onDelete }) => {
  return (
    <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Recent Documents
          </h3>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Indexed files in knowledge repository ({documents.length} Total)
          </p>
        </div>
      </div>

      {/* Scrollable Container with Sticky Table Header */}
      <div style={{ maxHeight: '280px', overflowY: 'auto', overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: 'var(--surface-secondary)' }}>
            <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Document</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Type</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Chunks</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Updated</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No documents found.
                </td>
              </tr>
            ) : (
              documents.map(doc => (
                <tr key={doc.doc_id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.825rem' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.filename}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', padding: '2px 6px', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                      {doc.format || doc.filename.split('.').pop().toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {doc.chunk_count}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge status={doc.status || 'Indexed'}>
                      {doc.status || 'Indexed'}
                    </Badge>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                    {doc.uploaded || 'Recently'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <button
                      onClick={() => onDelete && onDelete(doc.doc_id)}
                      aria-label="Delete document"
                      title="Delete document"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'color var(--transition-fast)'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
