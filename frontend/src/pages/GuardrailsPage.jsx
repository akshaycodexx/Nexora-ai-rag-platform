import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ShieldCheck, Sliders, EyeOff, Ban, ShieldAlert } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/api';

export const GuardrailsPage = () => {
  const [similarityThreshold, setSimilarityThreshold] = useState(0.28);
  const [enablePiiRedactor, setEnablePiiRedactor] = useState(false);
  const [enableBlockedWords, setEnableBlockedWords] = useState(false);
  const [enableAntiHallucination, setEnableAntiHallucination] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchGuardrails = async () => {
      const data = await apiService.getSettings();
      if (data) {
        if (data.similarity_threshold !== undefined) setSimilarityThreshold(data.similarity_threshold);
        if (data.enable_pii_redactor !== undefined) setEnablePiiRedactor(data.enable_pii_redactor);
        if (data.enable_blocked_words !== undefined) setEnableBlockedWords(data.enable_blocked_words);
        if (data.enable_anti_hallucination !== undefined) setEnableAntiHallucination(data.enable_anti_hallucination);
      }
    };
    fetchGuardrails();
  }, []);

  const handleTogglePii = async () => {
    const nextVal = !enablePiiRedactor;
    setEnablePiiRedactor(nextVal);
    await apiService.updateSettings({ enable_pii_redactor: nextVal });
    addToast(`PII & Secret Data Redactor ${nextVal ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleToggleBlockedWords = async () => {
    const nextVal = !enableBlockedWords;
    setEnableBlockedWords(nextVal);
    await apiService.updateSettings({ enable_blocked_words: nextVal });
    addToast(`Custom Blocked Words Filter ${nextVal ? 'enabled' : 'disabled'}`, 'info');
  };

  const handleToggleAntiHallucination = async () => {
    const nextVal = !enableAntiHallucination;
    setEnableAntiHallucination(nextVal);
    await apiService.updateSettings({ enable_anti_hallucination: nextVal });
    addToast(`Anti-Hallucination Rejection ${nextVal ? 'enabled' : 'disabled'}`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
          AI & Knowledge / Guardrails
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Anti-Hallucination Guardrails & Safety Controls
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Configure strict retrieval thresholds, hallucination rejection, PII data redaction, and custom blocked term filters.
        </p>
      </div>

      {/* Similarity Threshold Adjustment Card */}
      <Card style={{ opacity: enableAntiHallucination ? 1 : 0.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
            <Sliders size={18} style={{ color: 'var(--primary)' }} />
            <span>Cosine Similarity Score Threshold (0.10 - 0.50)</span>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
            {parseFloat(similarityThreshold).toFixed(2)} Score
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Queries yielding vector similarity scores below this threshold trigger an automatic rejection notice to guarantee 0% hallucination.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0.10 (Permissive)</span>
          <input
            type="range"
            min="0.10"
            max="0.50"
            step="0.02"
            disabled={!enableAntiHallucination}
            value={similarityThreshold}
            onChange={async (e) => {
              const val = parseFloat(e.target.value);
              setSimilarityThreshold(val);
              await apiService.updateGuardrailThreshold(val);
              addToast(`Similarity threshold updated to ${val.toFixed(2)}`, 'success');
            }}
            style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0.50 (Strict)</span>
        </div>
      </Card>

      {/* Guardrail Policy Rows List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Policy 1: PII Data Redactor */}
        <Card style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                <EyeOff size={18} style={{ color: enablePiiRedactor ? 'var(--primary)' : 'var(--text-muted)' }} />
                <span>Automated PII & Secret Data Redactor</span>
                <Badge status={enablePiiRedactor ? 'success' : 'neutral'}>
                  {enablePiiRedactor ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Automatically detects and masks sensitive API Keys, passwords, phone numbers, and emails with <code style={{ color: 'var(--primary)' }}>***REDACTED***</code> before LLM processing.
              </p>
            </div>

            <button
              onClick={handleTogglePii}
              aria-label="Toggle PII Redactor"
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
        </Card>

        {/* Policy 2: Custom Blocked Words Filter */}
        <Card style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                <Ban size={18} style={{ color: enableBlockedWords ? 'var(--primary)' : 'var(--text-muted)' }} />
                <span>Custom Blocked Words & Sensitive Terms Filter</span>
                <Badge status={enableBlockedWords ? 'success' : 'neutral'}>
                  {enableBlockedWords ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Masks out custom user-defined words, profanity, and sensitive terms in RAG responses. Managed in Settings -&gt; Blocked Words Filter.
              </p>
            </div>

            <button
              onClick={handleToggleBlockedWords}
              aria-label="Toggle Blocked Words Filter"
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
        </Card>

        {/* Policy 3: Anti-Hallucination Rejection */}
        <Card style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                <ShieldCheck size={18} style={{ color: enableAntiHallucination ? 'var(--primary)' : 'var(--text-muted)' }} />
                <span>Zero-Hallucination Similarity Threshold Guardrail</span>
                <Badge status={enableAntiHallucination ? 'success' : 'neutral'}>
                  {enableAntiHallucination ? 'Active' : 'Disabled'}
                </Badge>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Guarantees 0% hallucination by rejecting user inquiries that fail to meet the cosine similarity threshold (0.10 - 0.50).
              </p>
            </div>

            <button
              onClick={handleToggleAntiHallucination}
              aria-label="Toggle Anti Hallucination Guardrail"
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
        </Card>

      </div>
    </div>
  );
};
