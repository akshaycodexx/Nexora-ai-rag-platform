import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { QuestionComposer } from '../components/rag/QuestionComposer';
import { AnswerWorkspace } from '../components/rag/AnswerWorkspace';
import { RetrievalDetailsPanel } from '../components/rag/RetrievalDetailsPanel';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Plus, MessageSquare, Trash2, Clock, Bot, User, ChevronLeft, ChevronRight } from 'lucide-react';

export const AskAIPage = () => {
  // Current user storage key
  const getUserKey = () => {
    try {
      const saved = localStorage.getItem('nexora_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.email || u.id || 'default_user';
      }
    } catch (e) {}
    return 'default_user';
  };

  const userStorageKey = 'nexora_chat_sessions_' + getUserKey();
  const activeSessionKey = 'nexora_active_session_' + getUserKey();

  // Chat Sessions State (Isolated per user account)
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem(userStorageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Could not parse saved chat sessions");
      }
    }
    return [
      {
        id: 'session_fresh',
        title: 'New RAG Conversation',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: []
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem(activeSessionKey) || 'session_fresh';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { addToast } = useToast();
  const chatBottomRef = useRef(null);

  const handleOpenPreview = (citation) => {
    setSelectedCitation(citation);
    setIsPreviewOpen(true);
  };

  // Save user-isolated sessions to localStorage
  useEffect(() => {
    localStorage.setItem(userStorageKey, JSON.stringify(sessions));
    localStorage.setItem(activeSessionKey, activeSessionId);
  }, [sessions, activeSessionId, userStorageKey, activeSessionKey]);

  // Ensure active session exists
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || {
    id: 'session_1',
    title: 'New Conversation',
    messages: []
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, loading]);

  const handleCreateNewSession = () => {
    const newId = `session_${Date.now()}`;
    const newSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    addToast('Started new chat session', 'info');
  };

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      // Clear messages if only 1 session remains
      setSessions([
        {
          id: `session_${Date.now()}`,
          title: 'New Conversation',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: []
        }
      ]);
      return;
    }
    const filtered = sessions.filter(s => s.id !== sessionId);
    setSessions(filtered);
    if (activeSessionId === sessionId) {
      setActiveSessionId(filtered[0].id);
    }
    addToast('Chat session deleted', 'info');
  };

  const handleQuerySubmit = async ({ question, model, doc_ids }) => {
    if (!question.trim()) return;

    const userMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update active session with user message & title if new
    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        const isFirst = s.messages.length === 0;
        const newTitle = isFirst ? (question.length > 28 ? question.substring(0, 28) + '...' : question) : s.title;
        return {
          ...s,
          title: newTitle,
          messages: [...s.messages, userMessage]
        };
      }
      return s;
    }));

    setLoading(true);

    try {
      const res = await apiService.queryRAG({
        question,
        top_k: 4,
        llm_provider: model,
        api_key: null,
        doc_ids
      });

      const assistantMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        sources: res.sources,
        confidence_score: res.confidence_score,
        llm_used: res.llm_used,
        is_hallucination_guarded: res.is_hallucination_guarded,
        threshold: res.threshold,
        pipeline_trace: res.pipeline_trace,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: [...s.messages, assistantMessage]
          };
        }
        return s;
      }));

      if (res.is_hallucination_guarded) {
        addToast('Anti-Hallucination Guardrail Rejection', 'info');
      }
    } catch (err) {
      addToast(err.message || 'Failed to query RAG engine', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get last assistant response for right-side inspection panel
  const lastAssistantMsg = [...activeSession.messages].reverse().find(m => m.role === 'assistant');
  const latestResponseObj = lastAssistantMsg ? {
    answer: lastAssistantMsg.content,
    sources: lastAssistantMsg.sources,
    confidence_score: lastAssistantMsg.confidence_score,
    llm_used: lastAssistantMsg.llm_used,
    is_hallucination_guarded: lastAssistantMsg.is_hallucination_guarded,
    threshold: lastAssistantMsg.threshold,
    pipeline_trace: lastAssistantMsg.pipeline_trace
  } : null;


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      
      {/* Ultra-Compact Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, padding: '2px 0 4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', margin: 0 }}>
            Ask AI Workspace
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Multi-session RAG assistant
          </span>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={handleCreateNewSession} style={{ padding: '4px 10px', fontSize: '0.75rem', height: '28px' }}>
          New Chat
        </Button>
      </div>

      {/* Main Layout: Left Session History Drawer + Center Chat Workspace + Right Inspection Panel */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left Chat Sessions Sidebar */}
        <div style={{
          width: isSidebarOpen ? '180px' : '38px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          minHeight: 0,
          transition: 'width var(--transition-normal)',
          overflow: 'hidden'
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: isSidebarOpen ? '10px' : '8px 4px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarOpen ? 'space-between' : 'center',
            flexShrink: 0
          }}>
            {isSidebarOpen && (
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Chat History
              </span>
            )}
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              aria-label="Toggle chat history sidebar"
              style={{
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)'
              }}
            >
              {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          {/* New Chat Quick Button */}
          <div style={{ padding: '8px', flexShrink: 0 }}>
            <button
              onClick={handleCreateNewSession}
              title="New Thread"
              style={{
                width: '100%',
                padding: '7px 8px',
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'center'
              }}
            >
              <Plus size={16} />
              {isSidebarOpen && <span>New Thread</span>}
            </button>
          </div>

          {/* Sessions List */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: isSidebarOpen ? '6px' : '6px 4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sessions.map(s => {
              const isActive = s.id === activeSession.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  style={{
                    padding: isSidebarOpen ? '8px 10px' : '10px 0',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'var(--primary-tint)' : 'transparent',
                    border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSidebarOpen ? 'space-between' : 'center',
                    gap: '8px',
                    transition: 'all var(--transition-fast)'
                  }}
                  title={s.title}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', justifyContent: isSidebarOpen ? 'flex-start' : 'center', width: '100%' }}>
                    <MessageSquare size={16} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                    {isSidebarOpen && (
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--primary)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.title}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {s.messages.length} messages
                        </span>
                      </div>
                    )}
                  </div>

                  {isSidebarOpen && (
                    <button
                      onClick={(e) => handleDeleteSession(e, s.id)}
                      aria-label="Delete chat thread"
                      title="Delete thread"
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Main Chat Messages & Question Composer Workspace */}
        <Card style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', padding: '10px 12px', gap: '6px' }}>
          
          {/* Scrollable Conversation Stream */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px', marginBottom: '4px' }}>
            {activeSession.messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', gap: '8px', paddingTop: '40px' }}>
                <Bot size={32} style={{ color: 'var(--primary)' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Ask a question to start this RAG conversation thread
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', maxWidth: '380px', textAlign: 'center' }}>
                  Ask about your indexed documents, request summaries, or query specific facts. All responses are backed by vector citations.
                </div>
              </div>
            ) : (
              activeSession.messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: msg.role === 'user' ? '80%' : '100%'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {msg.role === 'user' ? <User size={13} /> : <Bot size={13} style={{ color: 'var(--primary)' }} />}
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {msg.role === 'user' ? 'You' : 'Nexora RAG Assistant'}
                    </span>
                    <span>• {msg.timestamp}</span>
                  </div>

                  {msg.role === 'user' ? (
                    <div style={{
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md) var(--radius-md) 0 var(--radius-md)',
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.5
                    }}>
                      {msg.content}
                    </div>
                  ) : (
                    <AnswerWorkspace
                      response={{
                        answer: msg.content,
                        sources: msg.sources,
                        confidence_score: msg.confidence_score,
                        llm_used: msg.llm_used,
                        is_hallucination_guarded: msg.is_hallucination_guarded
                      }}
                      onPreview={handleOpenPreview}
                    />
                  )}
                </div>
              ))
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Question Composer Form */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '6px', flexShrink: 0 }}>
            <QuestionComposer onSubmit={handleQuerySubmit} loading={loading} />
          </div>
        </Card>

        {/* Right Collapsible Retrieval Inspection Panel */}
        <RetrievalDetailsPanel response={latestResponseObj} onPreview={handleOpenPreview} />
      </div>

      {/* Document Preview & Text Highlight Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        citation={selectedCitation}
      />

    </div>
  );
};
