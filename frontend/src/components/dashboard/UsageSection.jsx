import React from 'react';
import { Card } from '../ui/Card';

export const UsageSection = ({ usage = [] }) => {
  const defaultUsage = [
    { label: 'Storage Used', val: '0.0 MB / 10 GB', pct: 0 },
    { label: 'Documents Limit', val: '0 / 500', pct: 0 },
    { label: 'Daily Query Cap', val: '0 / 5,000', pct: 0 },
    { label: 'Token Consumption', val: '0 / 1M Tokens', pct: 0 }
  ];

  const displayItems = usage && usage.length > 0 ? usage : defaultUsage;

  return (
    <Card>
      <div style={{ paddingBottom: '6px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          System Capacity & Resource Usage
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {displayItems.map((u, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{u.label}</span>
              <span style={{ color: 'var(--text-muted)' }}>{u.val}</span>
            </div>

            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  width: `${u.pct}%`,
                  height: '100%',
                  backgroundColor: 'var(--primary)',
                  borderRadius: '4px',
                  transition: 'width var(--transition-normal)'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
