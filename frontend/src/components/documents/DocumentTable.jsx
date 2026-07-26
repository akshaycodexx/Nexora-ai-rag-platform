import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Search, Filter, Trash2, FileText, ArrowUpDown, Eye } from 'lucide-react';
import { DocumentPreviewModal } from './DocumentPreviewModal';

export const DocumentTable = ({ documents = [], onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const pageSize = 5;

  // Filter Logic
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const docFormat = doc.format || doc.filename.split('.').pop().toUpperCase();
    const matchesFormat = formatFilter === 'all' || docFormat === formatFilter;
    const docStatus = doc.status || 'Indexed';
    const matchesStatus = statusFilter === 'all' || docStatus === statusFilter;
    return matchesSearch && matchesFormat && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDocs.length / pageSize) || 1;
  const paginatedDocs = filteredDocs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Control Bar: Search & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Filter documents by name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{
              width: '100%',
              height: '34px',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              paddingLeft: '32px',
              paddingRight: '12px',
              fontSize: '0.825rem',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Format Filter */}
          <select
            value={formatFilter}
            onChange={(e) => { setFormatFilter(e.target.value); setPage(1); }}
            style={{
              height: '34px',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0 10px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              outline: 'none'
            }}
          >
            <option value="all">All Formats</option>
            <option value="PDF">PDF</option>
            <option value="DOCX">DOCX</option>
            <option value="XML">XML</option>
            <option value="TXT">TXT</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              height: '34px',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0 10px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              outline: 'none'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Indexed">Indexed</option>
            <option value="Processing">Processing</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--surface)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-secondary)', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Format</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Size</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Chunks</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Index Status</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Uploaded</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Owner</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDocs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No matching documents found.
                </td>
              </tr>
            ) : (
              paginatedDocs.map(doc => {
                const format = doc.format || doc.filename.split('.').pop().toUpperCase();
                return (
                  <tr key={doc.doc_id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.825rem' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {doc.filename}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '0.725rem', fontFamily: 'monospace', padding: '2px 6px', backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                        {format}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {doc.size || '1.2 MB'}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {doc.chunk_count}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge status={doc.status || 'Indexed'}>
                        {doc.status || 'Indexed'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                      {doc.uploaded || 'Recently'}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {doc.owner || 'System Admin'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedDocForPreview({
                              filename: doc.filename,
                              location: 'Full Document Context',
                              page_number: 1,
                              chunk_index: 0,
                              similarity_score: 1.0,
                              snippet: `Indexed Document: ${doc.filename}\nFormat: ${doc.format || 'PDF'}\nChunks: ${doc.chunk_count}\nStatus: ${doc.status || 'Indexed'}`
                            });
                            setIsPreviewOpen(true);
                          }}
                          aria-label="Preview Document"
                          title="Preview Document & Context"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            transition: 'color var(--transition-fast)'
                          }}
                        >
                          <Eye size={15} />
                        </button>
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
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        citation={selectedDocForPreview}
      />

      {/* Pagination Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>Showing {paginatedDocs.length} of {filteredDocs.length} documents</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            style={{
              padding: '4px 10px',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1,
              color: 'var(--text-primary)',
              fontSize: '0.775rem'
            }}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            style={{
              padding: '4px 10px',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              opacity: page >= totalPages ? 0.5 : 1,
              color: 'var(--text-primary)',
              fontSize: '0.775rem'
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
