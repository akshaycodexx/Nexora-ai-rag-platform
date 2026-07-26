import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const DocumentUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { addToast } = useToast();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const res = await apiService.uploadDocument(selectedFile);
      addToast(res.message || `Successfully indexed ${selectedFile.name}`, 'success');
      setSelectedFile(null);
      onUploadSuccess();
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload & Index Document">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Drop Zone Box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('modalFileInput').click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
            backgroundColor: dragOver ? 'var(--primary-tint)' : 'var(--surface-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          <UploadCloud size={36} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {selectedFile ? selectedFile.name : 'Click or Drag & Drop file here'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Supported formats: PDF, DOCX, XML, TXT (up to 50MB)
          </div>
          <input
            type="file"
            id="modalFileInput"
            accept=".pdf,.docx,.doc,.xml,.txt,.md"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Selected File Details */}
        {selectedFile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.825rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <File size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedFile.name}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload} loading={loading} disabled={!selectedFile}>
            Upload & Index
          </Button>
        </div>
      </div>
    </Modal>
  );
};
