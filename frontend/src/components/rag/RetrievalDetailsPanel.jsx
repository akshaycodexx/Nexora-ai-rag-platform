import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ChevronRight, ChevronLeft, Database, Activity, CheckCircle2, AlertTriangle, Layers, Cpu, Search, ShieldCheck, Sparkles } from 'lucide-react';

export const RetrievalDetailsPanel = ({ response, onPreview }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('chunks'); // 'chunks' | 'logs'

  if (collapsed) {
    return (
      <div
        onClick={() => setCollapsed(false)}
        style={{
          width: '36px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-subtle)',
          flexShrink: 0,
          minHeight: 0
        }}
        title="Expand Retrieval Details Panel"
      >
        <ChevronLeft size={16} style={{ color: 'var(--text-muted)' }} />
        <span style={{ writingMode: 'vertical-rl', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Retrieval Details
        </span>
      </div>
    );
  }

  const sources = response?.sources || [];
  const thresholdVal = response?.threshold ?? 0.10;
  const pipelineTrace = response?.pipeline_trace || [
    { step: 1, title: "Document Parsing & Boundary Chunking", detail: "Chunking documents into 1500-char boundary-aware chunks.", status: "success" },
    { step: 2, title: "Dense Vector Embedding Encoding", detail: "Encoding 384-dim dense vector embeddings via SentenceTransformers.", status: "success" },
    { step: 3, title: "Qdrant Cloud HNSW Similarity Search", detail: "Executing HNSW similarity search on Qdrant Cloud collection 'nexora_documents'.", status: "success" },
    { step: 4, title: "Context Grounding & Guardrail Check", detail: `Filtering matches against threshold (${thresholdVal} Min Score).`, status: response?.is_hallucination_guarded ? "warning" : "success" },
    { step: 5, title: "LLM Response Synthesis", detail: `Grounded QA generation via ${response?.llm_used || "RAG Engine"}.`, status: "success" }
  ];

  const getStepIcon = (step) => {
    switch (step) {
      case 1: return <Layers size={13} style={{ color: 'var(--primary)' }} />;
      case 2: return <Cpu size={13} style={{ color: 'var(--primary)' }} />;
      case 3: return <Search size={13} style={{ color: 'var(--primary)' }} />;
      case 4: return <ShieldCheck size={13} style={{ color: 'var(--primary)' }} />;
      case 5: return <Sparkles size={13} style={{ color: 'var(--primary)' }} />;
      default: return <Activity size={13} style={{ color: 'var(--primary)' }} />;
    }
  };

  return (
    <Card style={{ width: '260px', flexShrink: 0, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* Panel Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          <Database size={16} style={{ color: 'var(--primary)' }} />
          <span>Retrieval Inspector</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Collapse panel"
          title="Collapse panel"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Dynamic Guardrail Status Badge */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '8px',
        marginTop: '6px',
        backgroundColor: 'var(--surface-secondary)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Guardrail Threshold:</span>
          <Badge status={response?.is_hallucination_guarded ? "warning" : "success"}>
            {thresholdVal} Min Score
          </Badge>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Queries below {thresholdVal} similarity score are guarded.
        </div>
      </div>

      {/* Tab Switcher: Chunks vs Pipeline Logs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '4px',
        backgroundColor: 'var(--surface-secondary)',
        borderRadius: 'var(--radius-sm)',
        marginTop: '6px',
        border: '1px solid var(--border)',
        flexShrink: 0
      }}>
        <button
          onClick={() => setActiveTab('chunks')}
          style={{
            flex: 1,
            padding: '5px 8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'chunks' ? 'var(--surface)' : 'transparent',
            color: activeTab === 'chunks' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'chunks' ? 'var(--shadow-subtle)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Database size={13} />
          <span>Chunks ({sources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          style={{
            flex: 1,
            padding: '5px 8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'logs' ? 'var(--surface)' : 'transparent',
            color: activeTab === 'logs' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'logs' ? 'var(--shadow-subtle)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Activity size={13} />
          <span>Pipeline Logs</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingTop: '6px', paddingRight: '2px' }}>
        
        {/* TAB 1: RETRIEVED CHUNKS */}
        {activeTab === 'chunks' && (
          <div>
            {sources.length === 0 ? (
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0', textAlign: 'center' }}>
                No query executed yet. Ask a question to inspect retrieved vector embeddings.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sources.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => onPreview && onPreview(s)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '8px 10px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    title="Click to preview full document page and highlighted excerpt"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        {s.filename}
                      </span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        {(s.similarity_score * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Chunk ID: #{s.chunk_index || idx + 1} • {s.location || `Page ${s.page_number}`}
                    </div>

                    {s.snippet && (
                      <div style={{
                        fontSize: '0.725rem',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--surface)',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border)',
                        maxHeight: '75px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.4'
                      }}>
                        "{s.snippet.length > 130 ? s.snippet.substring(0, 130) + '...' : s.snippet}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BACKGROUND RAG PIPELINE EXECUTION LOGS */}
        {activeTab === 'logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Execution Flow (5-Step Trace)
            </div>

            {pipelineTrace.map((trace) => (
              <div
                key={trace.step}
                style={{
                  fontSize: '0.75rem',
                  padding: '8px 10px',
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {getStepIcon(trace.step)}
                    <span>Step {trace.step}: {trace.title}</span>
                  </div>
                  {trace.status === 'warning' ? (
                    <AlertTriangle size={13} style={{ color: 'var(--warning)' }} />
                  ) : (
                    <CheckCircle2 size={13} style={{ color: 'var(--success)' }} />
                  )}
                </div>

                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4', paddingLeft: '19px' }}>
                  {trace.detail}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </Card>
  );
};
