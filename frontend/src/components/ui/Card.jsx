import React from 'react';

export const Card = ({ children, style = {}, className = '', ...props }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        ...style
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};
