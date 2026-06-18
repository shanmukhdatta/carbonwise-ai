import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ariaLabel,
  ...props
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    fontWeight: '600',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s var(--ease-standard)',
    userSelect: 'none',
    outline: 'none',
    opacity: disabled ? 0.6 : 1,
    transform: 'scale(1)',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'var(--primary-100)',
          color: 'var(--primary-900)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--primary-700)',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--danger)',
          color: 'var(--white)',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--primary-600)',
          color: 'var(--white)',
          boxShadow: 'var(--shadow-sm)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: 'var(--space-2) var(--space-4)',
          fontSize: '13px',
          minHeight: '36px',
        };
      case 'lg':
        return {
          padding: 'var(--space-4) var(--space-8)',
          fontSize: '16px',
          minHeight: '48px',
        };
      case 'md':
      default:
        return {
          padding: 'var(--space-3) var(--space-6)',
          fontSize: '14px',
          minHeight: '44px', // Touch target size compliance
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  // Combine custom inline styles for core look and let className take custom margins/flexes
  const mergedStyles = {
    ...baseStyle,
    ...variantStyles,
    ...sizeStyles,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={mergedStyles}
      className={`cw-button ${variant} ${size} ${className}`}
      aria-label={ariaLabel}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseEnter={(e) => {
        if (!disabled && variant !== 'ghost') {
          e.currentTarget.style.filter = 'brightness(1.05)';
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
