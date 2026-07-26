import React, { useState, useEffect } from 'react';
import { Send, Cpu, Database, FileText, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { apiService } from '../../services/api';

export const QuestionComposer = ({ onSubmit, loading = false }) => {
  const [question, setQuestion] = useState('');
  const [model, setModel] = useState('gemini');

  // Document Scope Mode: 'all' | 'selective'
  const [searchScope, setSearchScope] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [showDocPicker, setShowDocPicker] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      const docs = await apiService.getDocuments();
      setDocuments(docs || []);
    };
    fetchDocs();
  }, []);

  const toggleDocSelection = (docId) => {
    setSelectedDocIds(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAllDocs = () => {
    if (selectedDocIds.length === documents.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(documents.map(d => d.doc_id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const submittedQuestion = question.trim();
    setQuestion(''); // Clear input search box after submission
    onSubmit({
      question: submittedQuestion,
      model,
      doc_ids: searchScope === 'selective' ? selectedDocIds : documents.map(d => d.doc_id)
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ position: 'relative' }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your knowledge base... (Press Ctrl+Enter to submit)"
          style={{
            width: '100%',
            minHeight: '110px',
            maxHeight: '150px',
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            fontSize: '0.925rem',
            color: 'var(--text-primary)',
            outline: 'none',
            resize: 'none',
            overflowY: 'auto',
            transition: 'border-color var(--transition-fast)'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleSubmit(e);
            }
          }}
        />
      </div>

      {/* Control Bar Below Textarea */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Document Scope Toggle (All vs Selective) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            <Database size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <select
              value={searchScope}
              onChange={(e) => {
                const scope = e.target.value;
                setSearchScope(scope);
                if (scope === 'selective') setShowDocPicker(true);
                else setShowDocPicker(false);
              }}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 10px',
                fontSize: '0.775rem',
                color: 'var(--text-secondary)',
                outline: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="all">Search Mode: All Documents ({documents.length})</option>
              <option value="selective">Search Mode: Selective Documents ({selectedDocIds.length} Selected)</option>
            </select>

            {searchScope === 'selective' && (
              <button
                type="button"
                onClick={() => setShowDocPicker(prev => !prev)}
                style={{
                  background: 'var(--surface-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Select Files ({selectedDocIds.length})</span>
                <ChevronDown size={12} />
              </button>
            )}

            {/* Scrollable Selective Document Picker Dropdown Popup */}
            {searchScope === 'selective' && showDocPicker && (
              <>
                <div
                  onClick={() => setShowDocPicker(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: 0,
                    zIndex: 100,
                    width: '320px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px var(--border)',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Select Target Documents
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllDocs}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.725rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {selectedDocIds.length === documents.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  {/* Scroller Container for Documents List */}
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {documents.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px' }}>
                        No indexed documents found. Upload a file first.
                      </div>
                    ) : (
                      documents.map(doc => {
                        const isSelected = selectedDocIds.includes(doc.doc_id);
                        return (
                          <div
                            key={doc.doc_id}
                            onClick={() => toggleDocSelection(doc.doc_id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: isSelected ? 'var(--primary-tint)' : 'transparent',
                              cursor: 'pointer',
                              fontSize: '0.775rem',
                              color: 'var(--text-primary)'
                            }}
                          >
                            {isSelected ? (
                              <CheckSquare size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            ) : (
                              <Square size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            )}
                            <FileText size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {doc.filename}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setShowDocPicker(false)}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: 'var(--button-primary)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Done ({selectedDocIds.length})
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Model Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 10px',
                fontSize: '0.775rem',
                color: 'var(--text-secondary)',
                outline: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="gemini">Google Gemini 1.5 Flash</option>
              <option value="openai">OpenAI GPT-3.5 Turbo</option>
              <option value="extractive">Extractive Engine (No Key)</option>
            </select>
          </div>
        </div>

        {/* Primary Ask Button */}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!question.trim()}
          icon={Send}
        >
          Ask RAG Engine
        </Button>
      </div>
    </form>
  );
};
