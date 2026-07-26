import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { Settings, Cpu, Key, Shield, Database, Sliders, Play, CheckCircle2, XCircle, Loader2, Sparkles, HardDrive, Ban, Plus, X, Lock, EyeOff, Server, Link as LinkIcon, Radio } from 'lucide-react';
import { apiService } from '../services/api';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('llm');
  const { addToast } = useToast();

  // General Settings
  const [orgName, setOrgName] = useState('Nexora AI Labs');
  const [email, setEmail] = useState('admin@nexora.ai');

  // Custom LLM Settings
  const [llmProvider, setLlmProvider] = useState('gemini');
  const [customModelName, setCustomModelName] = useState('gemini-1.5-flash');
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');

  // Embedding & Vector DB Settings
  const [embeddingProvider, setEmbeddingProvider] = useState('local');
  const [embeddingModel, setEmbeddingModel] = useState('sentence-transformers/all-MiniLM-L6-v2');
  const [embeddingApiKey, setEmbeddingApiKey] = useState('');
  const [vectorDbProvider, setVectorDbProvider] = useState('sqlite_vector');
  const [vectorDbPath, setVectorDbPath] = useState('./sql_app.db');

  // RAG Search Parameters & Guardrail Toggles
  const [topK, setTopK] = useState(4);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.28);
  const [enablePiiRedactor, setEnablePiiRedactor] = useState(false);
  const [enableBlockedWords, setEnableBlockedWords] = useState(false);
  const [enableAntiHallucination, setEnableAntiHallucination] = useState(false);

  // Custom Blocked & Sensitive Words Guardrail
  const [blockedKeywords, setBlockedKeywords] = useState('');
  const [newKeywordInput, setNewKeywordInput] = useState('');

  // Custom External Database Settings
  const [activeDbType, setActiveDbType] = useState('sqlite');
  const [dbConnectionUrl, setDbConnectionUrl] = useState('');
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState(5432);
  const [dbName, setDbName] = useState('nexora_db');
  const [dbUsername, setDbUsername] = useState('');
  const [dbPassword, setDbPassword] = useState('');
  const [dbApiKey, setDbApiKey] = useState('');

  // Test Connection States
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [testDbLoading, setTestDbLoading] = useState(false);
  const [testDbResult, setTestDbResult] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await apiService.getSettings();
      if (data) {
        if (data.org_name) setOrgName(data.org_name);
        if (data.contact_email) setEmail(data.contact_email);
        if (data.embedding_model) setEmbeddingModel(data.embedding_model);
        if (data.embedding_provider) setEmbeddingProvider(data.embedding_provider);
        if (data.embedding_api_key) setEmbeddingApiKey(data.embedding_api_key);
        if (data.custom_llm_provider) setLlmProvider(data.custom_llm_provider);
        if (data.custom_llm_name) setCustomModelName(data.custom_llm_name);
        if (data.custom_llm_base_url) setCustomBaseUrl(data.custom_llm_base_url);
        if (data.gemini_api_key) setGeminiKey(data.gemini_api_key);
        if (data.openai_api_key) setOpenaiKey(data.openai_api_key);
        if (data.groq_api_key) setGroqKey(data.groq_api_key);
        if (data.similarity_threshold !== undefined) setSimilarityThreshold(data.similarity_threshold);
        if (data.top_k !== undefined) setTopK(data.top_k);
        if (data.vector_db_provider) setVectorDbProvider(data.vector_db_provider);
        if (data.vector_db_path) setVectorDbPath(data.vector_db_path);
        if (data.blocked_keywords !== undefined) setBlockedKeywords(data.blocked_keywords);
        if (data.enable_pii_redactor !== undefined) setEnablePiiRedactor(data.enable_pii_redactor);
        if (data.enable_blocked_words !== undefined) setEnableBlockedWords(data.enable_blocked_words);
        if (data.enable_anti_hallucination !== undefined) setEnableAntiHallucination(data.enable_anti_hallucination);

        if (data.active_db_type) setActiveDbType(data.active_db_type);
        if (data.db_connection_url) setDbConnectionUrl(data.db_connection_url);
        if (data.db_host) setDbHost(data.db_host);
        if (data.db_port) setDbPort(data.db_port);
        if (data.db_name) setDbName(data.db_name);
        if (data.db_username) setDbUsername(data.db_username);
        if (data.db_password) setDbPassword(data.db_password);
        if (data.db_api_key) setDbApiKey(data.db_api_key);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    await apiService.updateSettings({
      org_name: orgName,
      contact_email: email,
      embedding_model: embeddingModel,
      embedding_provider: embeddingProvider,
      embedding_api_key: embeddingApiKey,
      default_llm: llmProvider,
      custom_llm_provider: llmProvider,
      custom_llm_name: customModelName,
      custom_llm_base_url: customBaseUrl,
      gemini_api_key: geminiKey,
      openai_api_key: openaiKey,
      groq_api_key: groqKey,
      similarity_threshold: parseFloat(similarityThreshold),
      top_k: parseInt(topK, 10),
      vector_db_provider: vectorDbProvider,
      vector_db_path: vectorDbPath,
      blocked_keywords: blockedKeywords,
      enable_pii_redactor: enablePiiRedactor,
      enable_blocked_words: enableBlockedWords,
      enable_anti_hallucination: enableAntiHallucination,
      active_db_type: activeDbType,
      db_connection_url: dbConnectionUrl,
      db_host: dbHost,
      db_port: parseInt(dbPort, 10),
      db_name: dbName,
      db_username: dbUsername,
      db_password: dbPassword,
      db_api_key: dbApiKey
    });
    addToast('Platform, Database & Guardrail settings saved successfully', 'success');
  };

  const handleAddKeyword = () => {
    if (!newKeywordInput.trim()) return;
    const word = newKeywordInput.trim().toLowerCase();
    const existingList = blockedKeywords.split(',').map(w => w.trim()).filter(Boolean);
    if (existingList.includes(word)) {
      addToast(`Word "${word}" is already in the blocked list`, 'info');
      setNewKeywordInput('');
      return;
    }
    const updated = [...existingList, word].join(', ');
    setBlockedKeywords(updated);
    setNewKeywordInput('');
    addToast(`Added "${word}" to blocked keywords list`, 'success');
  };

  const handleRemoveKeyword = (wordToRemove) => {
    const existingList = blockedKeywords.split(',').map(w => w.trim()).filter(Boolean);
    const updated = existingList.filter(w => w !== wordToRemove).join(', ');
    setBlockedKeywords(updated);
    addToast(`Removed "${wordToRemove}" from blocked list`, 'info');
  };

  const handleTestLLM = async () => {
    setTestLoading(true);
    setTestResult(null);

    let keyToUse = geminiKey;
    if (llmProvider === 'openai') keyToUse = openaiKey;
    if (llmProvider === 'groq') keyToUse = groqKey;

    const res = await apiService.testLLMConnection({
      provider: llmProvider,
      api_key: keyToUse,
      model_name: customModelName,
      base_url: customBaseUrl
    });

    setTestLoading(false);
    setTestResult(res);
    if (res.success) {
      addToast(`Connected to ${res.model_used || llmProvider} successfully!`, 'success');
    } else {
      addToast(res.message || 'LLM Connection test failed', 'error');
    }
  };

  const handleTestDB = async () => {
    setTestDbLoading(true);
    setTestDbResult(null);

    const res = await apiService.testDBConnection({
      db_type: activeDbType,
      connection_url: dbConnectionUrl,
      host: dbHost,
      port: parseInt(dbPort, 10),
      db_name: dbName,
      username: dbUsername,
      password: dbPassword,
      api_key: dbApiKey
    });

    setTestDbLoading(false);
    setTestDbResult(res);
    if (res.success) {
      addToast(`${res.db_type || activeDbType} connection test passed!`, 'success');
    } else {
      addToast(res.message || 'Database connection failed', 'error');
    }
  };

  const settingsNavGroups = [
    {
      group: 'AI Model & Engine',
      items: [
        { id: 'llm', label: 'Custom LLM Provider', icon: Cpu, desc: 'Model name & endpoints' },
        { id: 'embedding', label: 'Embedding & Vector DB', icon: Database, desc: 'Vectors & Qdrant store' },
        { id: 'rag', label: 'RAG Search Parameters', icon: Sliders, desc: 'Top-K & thresholds' }
      ]
    },
    {
      group: 'Database Integrations',
      items: [
        { id: 'custom_db', label: 'External Databases', icon: Server, desc: 'PostgreSQL, Mongo, Redis, Supabase' }
      ]
    },
    {
      group: 'Safety & Guardrails',
      items: [
        { id: 'blocked', label: 'Blocked Words Filter', icon: Ban, desc: 'Custom term redaction' },
        { id: 'security', label: 'PII & Security Policy', icon: Shield, desc: 'Data masking & JWT auth' }
      ]
    },
    {
      group: 'Organization',
      items: [
        { id: 'general', label: 'Workspace Credentials', icon: Key, desc: 'Org name & master keys' }
      ]
    }
  ];

  const availableDatabases = [
    { id: 'sqlite', name: 'SQLite (Local Engine)', desc: 'Embedded SQL storage file', icon: HardDrive, defaultPort: 0 },
    { id: 'postgresql', name: 'PostgreSQL', desc: 'Enterprise relational SQL DB', icon: Database, defaultPort: 5432 },
    { id: 'mongodb', name: 'MongoDB / Mongo Atlas', desc: 'NoSQL document cloud database', icon: Server, defaultPort: 27017 },
    { id: 'mysql', name: 'MySQL / MariaDB', desc: 'Relational SQL database engine', icon: Database, defaultPort: 3306 },
    { id: 'redis', name: 'Redis Cache', desc: 'In-memory key-value data store', icon: Cpu, defaultPort: 6379 },
    { id: 'supabase', name: 'Supabase Cloud', desc: 'Postgres & Storage platform', icon: Server, defaultPort: 5432 },
    { id: 'firebase', name: 'Firebase Firestore', desc: 'Google Cloud NoSQL store', icon: Database, defaultPort: 443 },
    { id: 'qdrant', name: 'Qdrant Cloud Vector', desc: 'Cloud HNSW vector engine', icon: HardDrive, defaultPort: 6333 }
  ];

  const activeBlockedWordsList = blockedKeywords.split(',').map(w => w.trim()).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Settings Page Header */}
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
          Administration / Settings
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Platform, Database & Custom LLM Settings
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Configure custom LLM models, external database connections (PostgreSQL, MongoDB, Supabase, Firebase), PII masking, and vector storage engines.
        </p>
      </div>

      {/* Main Settings Split View */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', width: '100%' }}>
        
        {/* Left Vertical Inner Settings Sidebar Drawer */}
        <div style={{
          width: '240px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          flexShrink: 0
        }}>
          {settingsNavGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <div style={{
                fontSize: '0.675rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '6px',
                paddingLeft: '8px'
              }}>
                {group.group}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isActive ? 'var(--primary-tint)' : 'transparent',
                        border: 'none',
                        borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <Icon size={16} style={{ color: isActive ? 'var(--primary)' : 'var(--text-secondary)', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.825rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--primary)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.label}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Settings Form Content Panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Card>

            {/* TAB 1: CUSTOM LLM CONFIGURATION */}
            {activeTab === 'llm' && (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                    Custom LLM & Model Endpoint Configuration
                  </h3>
                  <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Set custom LLM model names, private API keys, or custom OpenAI-compatible HTTP endpoints (Ollama, vLLM, Groq).
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>LLM Provider Engine</label>
                  <select
                    value={llmProvider}
                    onChange={(e) => {
                      const p = e.target.value;
                      setLlmProvider(p);
                      if (p === 'gemini') setCustomModelName('gemini-1.5-flash');
                      else if (p === 'openai') setCustomModelName('gpt-3.5-turbo');
                      else if (p === 'groq') setCustomModelName('llama-3.3-70b-versatile');
                      else if (p === 'custom_openai_http') setCustomModelName('custom-model-v1');
                    }}
                    style={{
                      width: '100%',
                      height: '38px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginTop: '4px',
                      fontWeight: 600
                    }}
                  >
                    <option value="gemini">Google Gemini AI (Cloud API)</option>
                    <option value="openai">OpenAI GPT Architecture (Cloud API)</option>
                    <option value="groq">Groq Cloud LLaMA3 Accelerator</option>
                    <option value="custom_openai_http">Custom HTTP OpenAI Endpoint (Ollama / Local vLLM)</option>
                    <option value="extractive">Extractive Zero-LLM Engine (Local Deterministic)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Model Identifier / Custom Model Name
                  </label>
                  <input
                    type="text"
                    value={customModelName}
                    onChange={(e) => setCustomModelName(e.target.value)}
                    placeholder="e.g. gemini-1.5-flash, gpt-4o, llama-3.3-70b-versatile, mistral-7b"
                    style={{
                      width: '100%',
                      height: '38px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginTop: '4px'
                    }}
                  />
                </div>

                {llmProvider === 'gemini' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Google Gemini API Key
                    </label>
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      style={{
                        width: '100%',
                        height: '38px',
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 12px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                )}

                {llmProvider === 'openai' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                      style={{
                        width: '100%',
                        height: '38px',
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 12px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                )}

                {llmProvider === 'groq' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Groq API Key
                    </label>
                    <input
                      type="password"
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                      placeholder="gsk_..."
                      style={{
                        width: '100%',
                        height: '38px',
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 12px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    icon={testLoading ? Loader2 : Play}
                    disabled={testLoading}
                    onClick={handleTestLLM}
                  >
                    {testLoading ? 'Testing LLM...' : 'Test LLM Connection'}
                  </Button>

                  <Button type="submit" variant="primary">
                    Save LLM Settings
                  </Button>
                </div>

                {testResult && (
                  <div style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: testResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${testResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '0.825rem'
                  }}>
                    {testResult.success ? (
                      <CheckCircle2 size={18} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <XCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 700, color: testResult.success ? '#22c55e' : '#ef4444' }}>
                        {testResult.success ? `Verified Connection: ${testResult.model_used || llmProvider}` : 'LLM Test Failed'}
                      </div>
                      <div style={{ color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'monospace' }}>
                        {testResult.message}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* TAB: EXTERNAL DATABASE CONNECTIONS */}
            {activeTab === 'custom_db' && (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Server size={18} style={{ color: 'var(--primary)' }} />
                    External Database Integrations & Custom Credentials
                  </h3>
                  <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Connect your own external database (PostgreSQL, MongoDB Atlas, MySQL, Redis, Supabase, Firebase, Qdrant Cloud).
                  </p>
                </div>

                {/* Database Engine Selector Grid */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                    Select Primary Storage Database Engine
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {availableDatabases.map(db => {
                      const IconComponent = db.icon;
                      const isSelected = activeDbType === db.id;
                      return (
                        <div
                          key={db.id}
                          onClick={() => {
                            setActiveDbType(db.id);
                            if (db.defaultPort > 0) setDbPort(db.defaultPort);
                          }}
                          style={{
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                            backgroundColor: isSelected ? 'var(--primary-tint)' : 'var(--surface-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <IconComponent size={20} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-secondary)', flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.825rem', fontWeight: isSelected ? 700 : 600, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                              {db.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {db.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Connection URL / Connection String */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Database Connection URI / String (Optional)
                  </label>
                  <input
                    type="text"
                    value={dbConnectionUrl}
                    onChange={(e) => setDbConnectionUrl(e.target.value)}
                    placeholder={activeDbType === 'mongodb' ? 'mongodb+srv://user:pass@cluster.mongodb.net/dbname' : activeDbType === 'postgresql' ? 'postgresql://user:pass@localhost:5432/dbname' : 'e.g. postgresql://user:pass@host:5432/dbname'}
                    style={{
                      width: '100%',
                      height: '38px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginTop: '4px'
                    }}
                  />
                </div>

                {/* Host & Port Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Host / Server Address</label>
                    <input
                      type="text"
                      value={dbHost}
                      onChange={(e) => setDbHost(e.target.value)}
                      placeholder="e.g. localhost, db.example.com"
                      style={{
                        width: '100%',
                        height: '38px',
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 12px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        marginTop: '4px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Port</label>
                    <input
                      type="number"
                      value={dbPort}
                      onChange={(e) => setDbPort(e.target.value)}
                      placeholder="5432"
                      style={{
                        width: '100%',
                        height: '38px',
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 12px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                </div>

                {/* Database Name & Credentials */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Database Name</label>
                    <input
                      type="text"
                      value={dbName}
                      onChange={(e) => setDbName(e.target.value)}
                      placeholder="nexora_db"
                      style={{
                        width: '100%',
                        height: '38px',
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 12px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        marginTop: '4px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Username</label>
                    <input
                      type="text"
                      value={dbUsername}
                      onChange={(e) => setDbUsername(e.target.value)}
                      placeholder="postgres / admin"
                      style={{
                        width: '100%',
                        height: '38px',
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 12px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        marginTop: '4px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                    <input
                      type="password"
                      value={dbPassword}
                      onChange={(e) => setDbPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%',
                        height: '38px',
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 12px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                </div>

                {/* API Key (For Supabase, Firebase, Qdrant Cloud) */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Database API Key / Service Token (For Cloud DBs like Qdrant / Supabase / Firebase)
                  </label>
                  <input
                    type="password"
                    value={dbApiKey}
                    onChange={(e) => setDbApiKey(e.target.value)}
                    placeholder="e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    style={{
                      width: '100%',
                      height: '38px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginTop: '4px'
                    }}
                  />
                </div>

                {/* Actions: Test DB Connection & Save Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    icon={testDbLoading ? Loader2 : Play}
                    disabled={testDbLoading}
                    onClick={handleTestDB}
                  >
                    {testDbLoading ? 'Testing DB Connection...' : `Test ${activeDbType.toUpperCase()} Connection`}
                  </Button>

                  <Button type="submit" variant="primary">
                    Save Database Credentials
                  </Button>
                </div>

                {testDbResult && (
                  <div style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: testDbResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${testDbResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '0.825rem'
                  }}>
                    {testDbResult.success ? (
                      <CheckCircle2 size={18} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <XCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 700, color: testDbResult.success ? '#22c55e' : '#ef4444' }}>
                        {testDbResult.success ? `Connected: ${testDbResult.db_type}` : 'Database Connection Failed'}
                      </div>
                      <div style={{ color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'monospace' }}>
                        {testDbResult.message}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* TAB 2: CUSTOM BLOCKED WORDS & PROFANITY FILTER */}
            {activeTab === 'blocked' && (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Ban size={18} style={{ color: 'var(--status-error-text)' }} />
                      Custom Blocked Words & Sensitive Terms Guardrail
                    </h3>
                    <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Specify custom words, profanity, or sensitive keywords to block or redact automatically.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: enableBlockedWords ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {enableBlockedWords ? 'ENABLED' : 'DISABLED'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnableBlockedWords(prev => !prev)}
                      style={{
                        width: '44px',
                        height: '24px',
                        backgroundColor: enableBlockedWords ? 'var(--button-primary)' : 'var(--border)',
                        borderRadius: '12px',
                        border: 'none',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color var(--transition-fast)'
                      }}
                    >
                      <span style={{
                        width: '18px',
                        height: '18px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '3px',
                        left: enableBlockedWords ? '23px' : '3px',
                        transition: 'left var(--transition-fast)'
                      }} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                    placeholder="Type a word to block (e.g. secret, confidential, badword) and press Add..."
                    style={{
                      flex: 1,
                      height: '42px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 14px',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                  <Button type="button" variant="primary" icon={Plus} onClick={handleAddKeyword}>
                    Add Word
                  </Button>
                </div>

                <div style={{
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Active Blocked Words ({activeBlockedWordsList.length})
                  </div>

                  {activeBlockedWordsList.length === 0 ? (
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No custom blocked words configured yet. Type a word above and click "Add Word".
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {activeBlockedWordsList.map((word, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            backgroundColor: 'var(--status-error-bg)',
                            border: '1px solid rgba(220, 38, 38, 0.25)',
                            borderRadius: '16px',
                            fontSize: '0.825rem',
                            fontWeight: 600,
                            color: 'var(--status-error-text)'
                          }}
                        >
                          <span>{word}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(word)}
                            title={`Remove "${word}"`}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--status-error-text)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0'
                            }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Advanced Direct Edit (Comma-separated list)
                  </label>
                  <textarea
                    value={blockedKeywords}
                    onChange={(e) => setBlockedKeywords(e.target.value)}
                    placeholder="confidential, secret, badword1, badword2..."
                    style={{
                      width: '100%',
                      height: '70px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginTop: '4px',
                      resize: 'none'
                    }}
                  />
                </div>

                <div style={{ alignSelf: 'flex-start' }}>
                  <Button type="submit" variant="primary">Save Blocked Words Guardrail</Button>
                </div>
              </form>
            )}

            {/* TAB 3: EMBEDDING & VECTOR DB STORAGE */}
            {activeTab === 'embedding' && (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardDrive size={18} style={{ color: 'var(--primary)' }} />
                    Dense Vector Embedding & Database Storage
                  </h3>
                  <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Configure feature extraction vector models and database index persistence directory.
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Embedding Provider & Model</label>
                  <select
                    value={embeddingModel}
                    onChange={(e) => setEmbeddingModel(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginTop: '4px',
                      fontWeight: 600
                    }}
                  >
                    <option value="sentence-transformers/all-MiniLM-L6-v2">SentenceTransformers all-MiniLM-L6-v2 (384 Dim - Local GPU/CPU)</option>
                    <option value="BAAI/bge-small-en-v1.5">BAAI BGE Small EN v1.5 (384 Dim - High Precision)</option>
                    <option value="openai/text-embedding-3-small">OpenAI Text Embedding 3 Small (1536 Dim - Cloud API)</option>
                    <option value="openai/text-embedding-3-large">OpenAI Text Embedding 3 Large (3072 Dim - Enterprise)</option>
                  </select>
                </div>

                {embeddingModel.includes('openai') && (
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Embedding API Key (OpenAI Cloud)
                    </label>
                    <input
                      type="password"
                      value={embeddingApiKey || openaiKey}
                      onChange={(e) => setEmbeddingApiKey(e.target.value)}
                      placeholder="sk-..."
                      style={{
                        width: '100%',
                        height: '38px',
                        backgroundColor: 'var(--surface-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 12px',
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Vector Database Engine</label>
                  <select
                    value={vectorDbProvider}
                    onChange={(e) => setVectorDbProvider(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginTop: '4px',
                      fontWeight: 600
                    }}
                  >
                    <option value="sqlite_vector">SQLite Vector Storage (Embedded Engine - Default)</option>
                    <option value="chromadb">ChromaDB Vector Store (Local Persistent Index)</option>
                    <option value="faiss">FAISS CPU Index (Facebook AI Similarity Search)</option>
                    <option value="qdrant">Qdrant Cloud Vector Service</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Storage File / Index Path Directory
                  </label>
                  <input
                    type="text"
                    value={vectorDbPath}
                    onChange={(e) => setVectorDbPath(e.target.value)}
                    placeholder="./sql_app.db or ./vector_storage"
                    style={{
                      width: '100%',
                      height: '38px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginTop: '4px'
                    }}
                  />
                </div>

                <div style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                  <Button type="submit" variant="primary">Save Vector & Storage Settings</Button>
                </div>
              </form>
            )}

            {/* TAB 4: RAG SEARCH PARAMETERS */}
            {activeTab === 'rag' && (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sliders size={18} style={{ color: 'var(--primary)' }} />
                      RAG Retrieval & Anti-Hallucination Guardrail
                    </h3>
                    <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Control chunk counts and toggle minimum cosine similarity score threshold rejection.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: enableAntiHallucination ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {enableAntiHallucination ? 'ENABLED' : 'DISABLED'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnableAntiHallucination(prev => !prev)}
                      style={{
                        width: '44px',
                        height: '24px',
                        backgroundColor: enableAntiHallucination ? 'var(--button-primary)' : 'var(--border)',
                        borderRadius: '12px',
                        border: 'none',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color var(--transition-fast)'
                      }}
                    >
                      <span style={{
                        width: '18px',
                        height: '18px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '3px',
                        left: enableAntiHallucination ? '23px' : '3px',
                        transition: 'left var(--transition-fast)'
                      }} />
                    </button>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface-secondary)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Top-K Chunk Retrieval Count
                    </label>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {topK} Chunks
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={topK}
                    onChange={(e) => setTopK(e.target.value)}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Higher numbers include more document context in LLM prompts. Lower numbers increase precision.
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface-secondary)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', opacity: enableAntiHallucination ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Anti-Hallucination Similarity Score Threshold (0.10 - 0.50)
                    </label>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {parseFloat(similarityThreshold).toFixed(2)} Score
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.50"
                    step="0.02"
                    disabled={!enableAntiHallucination}
                    value={similarityThreshold}
                    onChange={(e) => setSimilarityThreshold(e.target.value)}
                    style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Queries yielding scores below this threshold are automatically guarded/rejected.
                  </div>
                </div>

                <div style={{ alignSelf: 'flex-start' }}>
                  <Button type="submit" variant="primary">Save RAG Parameters</Button>
                </div>
              </form>
            )}

            {/* TAB 5: GENERAL & WORKSPACE */}
            {activeTab === 'general' && (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Organization & Master API Keys
                </h3>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginTop: '4px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Primary Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginTop: '4px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Master Google Gemini API Key</label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginTop: '4px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Master OpenAI API Key</label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      backgroundColor: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      marginTop: '4px'
                    }}
                  />
                </div>

                <div style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
                  <Button type="submit" variant="primary">Save Workspace Credentials</Button>
                </div>
              </form>
            )}

            {/* TAB 6: SECURITY & PII POLICY */}
            {activeTab === 'security' && (
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <EyeOff size={18} style={{ color: 'var(--primary)' }} />
                      Automated PII & Secret Data Masking Redactor
                    </h3>
                    <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Automatically detect and mask API Keys, passwords, phone numbers, and emails with <code style={{ color: 'var(--primary)' }}>***REDACTED***</code>.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: enablePiiRedactor ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {enablePiiRedactor ? 'ENABLED' : 'DISABLED'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnablePiiRedactor(prev => !prev)}
                      style={{
                        width: '44px',
                        height: '24px',
                        backgroundColor: enablePiiRedactor ? 'var(--button-primary)' : 'var(--border)',
                        borderRadius: '12px',
                        border: 'none',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color var(--transition-fast)'
                      }}
                    >
                      <span style={{
                        width: '18px',
                        height: '18px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '3px',
                        left: enablePiiRedactor ? '23px' : '3px',
                        transition: 'left var(--transition-fast)'
                      }} />
                    </button>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--surface-secondary)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  JWT Secret Algorithm: <strong>HS256</strong> • Token Expiry: <strong>30 mins</strong> • Password Hashing: <strong>Bcrypt</strong> • PII Redactor: <strong>{enablePiiRedactor ? 'Active (API Keys, Phone, Emails masked)' : 'Disabled'}</strong>
                </div>

                <div style={{ alignSelf: 'flex-start' }}>
                  <Button type="submit" variant="primary">Save Security & Guardrail Policy</Button>
                </div>
              </form>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};
