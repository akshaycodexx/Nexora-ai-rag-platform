import React from 'react';
import { Layers } from 'lucide-react';

export const Brand = ({ collapsed = false }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      <div style={{
        width: '26px',
        height: '26px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--primary-tint)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
        flexShrink: 0
      }}>
        <Layers size={15} strokeWidth={2.2} />
      </div>
      {!collapsed && (
        <span style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap'
        }}>
          Nexora
        </span>
      )}
    </div>
  );
};
