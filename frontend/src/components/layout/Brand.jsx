import React from 'react';
import { Layers } from 'lucide-react';

export const Brand = ({ collapsed = false }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--primary-tint)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
        flexShrink: 0
      }}>
        <Layers size={18} strokeWidth={2.2} />
      </div>
      {!collapsed && (
        <span style={{
          fontSize: '1rem',
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
