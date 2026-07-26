import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { mockSystemHealth } from '../../data/mockData';

export const SystemHealth = ({ systemHealth = [] }) => {
  const displayItems = systemHealth && systemHealth.length > 0 ? systemHealth : mockSystemHealth;

  return (
    <Card style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ paddingBottom: '6px', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          System Health
        </h3>
        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          Real-time service operational status
        </p>
      </div>

      {/* Scrollable Container */}
      <div style={{ maxHeight: '238px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
        {displayItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              backgroundColor: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                {item.sub}
              </div>
            </div>

            <Badge status={item.status}>
              {item.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
