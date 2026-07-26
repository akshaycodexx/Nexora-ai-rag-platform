import React from 'react';

export const Badge = ({ children, status = 'success', style = {} }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'success':
      case 'Operational':
      case 'Indexed':
        return {
          backgroundColor: 'var(--status-success-bg)',
          color: 'var(--status-success-text)',
          borderColor: 'var(--status-success-text)'
        };
      case 'warning':
      case 'Warning':
      case 'Processing':
        return {
          backgroundColor: 'var(--status-warning-bg)',
          color: 'var(--status-warning-text)',
          borderColor: 'var(--status-warning-text)'
        };
      case 'error':
      case 'Offline':
      case 'Failed':
        return {
          backgroundColor: 'var(--status-error-bg)',
          color: 'var(--status-error-text)',
          borderColor: 'var(--status-error-text)'
        };
      default:
        return {
          backgroundColor: 'var(--surface-secondary)',
          color: 'var(--text-secondary)',
          borderColor: 'var(--border)'
        };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.725rem',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '12px',
        border: `1px solid ${statusStyles.borderColor}`,
        backgroundColor: statusStyles.backgroundColor,
        color: statusStyles.color,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: statusStyles.color
        }}
      />
      <span>{children}</span>
    </span>
  );
};
