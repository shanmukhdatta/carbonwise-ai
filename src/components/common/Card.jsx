import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  variant = 'default', // default, glass, highlight
  className = '',
  style = {},
  ...props
}) => {
  const cardClass = `carbon-card ${variant === 'glass' ? 'glassmorphic' : ''} ${className}`;
  
  const highlightStyle = variant === 'highlight' 
    ? { borderLeft: '4px solid var(--primary-500)' } 
    : {};

  const mergedStyles = {
    ...highlightStyle,
    ...style
  };

  return (
    <div 
      className={cardClass} 
      style={mergedStyles} 
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-4)',
            gap: 'var(--space-4)'
          }}
        >
          <div>
            {title && (
              <h3 
                style={{ 
                  fontSize: '18px', 
                  color: 'var(--primary-900)',
                  fontWeight: '700'
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p 
                style={{ 
                  fontSize: '13px', 
                  color: 'var(--gray-500)',
                  marginTop: '2px'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="card-header-action">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
