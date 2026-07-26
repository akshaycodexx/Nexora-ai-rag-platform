import React, { useState } from 'react';
import { Card } from '../ui/Card';

export const QueryActivityChart = ({
  chartData7d,
  chartData30d,
  successfulCount = 0,
  guardedCount = 0,
  successRate = 100
}) => {
  const [timeRange, setTimeRange] = useState('7D');

  const default7D = [
    { label: 'Mon', val: 0 },
    { label: 'Tue', val: 0 },
    { label: 'Wed', val: 0 },
    { label: 'Thu', val: 0 },
    { label: 'Fri', val: 0 },
    { label: 'Sat', val: 0 },
    { label: 'Sun', val: 0 }
  ];

  const default30D = [
    { label: 'W1', val: 0 },
    { label: 'W2', val: 0 },
    { label: 'W3', val: 0 },
    { label: 'W4', val: 0 }
  ];

  const points7D = chartData7d && chartData7d.length > 0 ? chartData7d : default7D;
  const points30D = chartData30d && chartData30d.length > 0 ? chartData30d : default30D;

  const currentPoints = timeRange === '7D' ? points7D : points30D;
  const maxVal = Math.max(...currentPoints.map(p => p.val), 10);

  // Generate SVG Path
  const width = 500;
  const height = 118;
  const stepX = width / (currentPoints.length - 1 || 1);
  const pathD = currentPoints.map((p, i) => {
    const x = i * stepX;
    const y = height - (p.val / maxVal) * (height - 20) - 10;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <Card style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Query Activity
          </h3>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Retrieval volume and RAG execution frequency
          </p>
        </div>

        {/* 7D / 30D Selector */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--surface-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '2px'
        }}>
          {['7D', '30D'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                background: timeRange === range ? 'var(--surface)' : 'transparent',
                color: timeRange === range ? 'var(--primary)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Lightweight SVG Line Chart */}
      <div style={{ marginTop: '12px', width: '100%', overflowX: 'hidden' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '118px', overflow: 'visible' }}>
          {/* Grid lines */}
          <line x1="0" y1="20" x2={width} y2="20" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="0" y1="70" x2={width} y2="70" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="0" y1="120" x2={width} y2="120" stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {currentPoints.map((p, i) => {
            const x = i * stepX;
            const y = height - (p.val / maxVal) * (height - 20) - 10;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="var(--surface)"
                stroke="var(--primary)"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', padding: '0 4px' }}>
          {currentPoints.map((p, i) => (
            <span key={i} style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Success / Failure Metrics Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        borderTop: '1px solid var(--border)',
        paddingTop: '12px',
        marginTop: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Successful Retrievals:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{successfulCount} ({successRate}%)</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-warning-text)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Guarded Queries:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{guardedCount}</strong>
        </div>
      </div>
    </Card>
  );
};
