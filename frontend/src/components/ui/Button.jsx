import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  style = {},
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--button-primary)',
          color: '#ffffff',
          border: 'none'
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--surface-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--status-error-bg)',
          color: 'var(--status-error-text)',
          border: '1px solid var(--status-error-text)'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { height: '30px', padding: '0 10px', fontSize: '0.775rem' };
      case 'lg':
        return { height: '42px', padding: '0 20px', fontSize: '0.925rem' };
      case 'md':
      default:
        return { height: '36px', padding: '0 14px', fontSize: '0.85rem' };
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: 600,
        borderRadius: 'var(--radius-sm)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
      {...props}
    >
      {loading && (
        <span style={{
          width: '14px',
          height: '14px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderTopColor: '#ffffff',
          borderRadius: '50%',
          animation: 'skeleton-pulse 0.8s infinite linear',
          display: 'inline-block'
        }} />
      )}
      {!loading && Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2} />}
      <span>{children}</span>
    </button>
  );
};
