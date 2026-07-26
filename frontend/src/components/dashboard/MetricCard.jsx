import React from 'react';

export const MetricCard = ({ label, value, change, isPositive = true, icon: Icon }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: 'var(--shadow-subtle)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </span>
        {Icon && <Icon size={16} style={{ color: 'var(--text-muted)' }} strokeWidth={2} />}
      </div>

      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {value}
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{
          color: isPositive ? 'var(--primary)' : 'var(--text-secondary)',
          fontWeight: 600
        }}>
          {change}
        </span>
      </div>
    </div>
  );
};
