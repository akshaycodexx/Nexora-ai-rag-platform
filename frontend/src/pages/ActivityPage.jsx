import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { mockActivityLogs } from '../data/mockData';
import { Activity, ShieldCheck, FileText, Settings, Key } from 'lucide-react';
import { apiService } from '../services/api';

export const ActivityPage = () => {
  const [filter, setFilter] = useState('all');
  const [logs, setLogs] = useState(mockActivityLogs);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await apiService.getActivityLogs();
      if (data && data.length > 0) setLogs(data);
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => filter === 'all' || l.type === filter);

  const getIcon = (type) => {
    switch (type) {
      case 'document': return FileText;
      case 'security': return ShieldCheck;
      case 'settings': return Settings;
      case 'auth': return Key;
      default: return Activity;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
            Administration / Activity
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Audit Event Timeline
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Real-time audit log of system events, queries, document parsing, and authentication actions.
          </p>
        </div>

        {/* Filters */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            height: '36px',
            backgroundColor: 'var(--surface-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0 12px',
            fontSize: '0.825rem',
            color: 'var(--text-primary)',
            outline: 'none'
          }}
        >
          <option value="all">All Events</option>
          <option value="document">Document Ingestion</option>
          <option value="security">Security & Guardrails</option>
          <option value="settings">Settings Changes</option>
          <option value="auth">Authentication</option>
        </select>
      </div>

      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredLogs.map(log => {
            const Icon = getIcon(log.type);
            return (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '12px 14px',
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-tint)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  flexShrink: 0
                }}>
                  <Icon size={16} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {log.event}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {log.time}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {log.details}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Actor: {log.user}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
