import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DocumentTable } from '../components/documents/DocumentTable';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { apiService } from '../services/api';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchDocs = async () => {
    const data = await apiService.getDocuments();
    setDocuments(data);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    await apiService.deleteDocument(docId);
    fetchDocs();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
            Workspace / Documents
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Documents
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Manage and index organization documents for RAG search.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={() => setIsUploadOpen(true)}>
          Upload document
        </Button>
      </div>

      {/* Main Document Table */}
      <DocumentTable documents={documents} onDelete={handleDelete} />

      {/* Compact Upload Modal Dialog */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchDocs}
      />

    </div>
  );
};
