import React from 'react';

export const Card = ({ children, style = {}, className = '', ...props }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        ...style
      }}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};
