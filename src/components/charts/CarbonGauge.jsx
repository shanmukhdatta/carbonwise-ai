import React, { useEffect, useState } from 'react';

const CarbonGauge = ({ value = 0, budget = 22 }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  // Animating score rise
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const percentage = budget > 0 ? Math.min(100, (animatedValue / budget) * 100) : 0;
  
  // Circular calculations
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Arc represents 75% of a full circle (leaving bottom open)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;
  const rotation = 135; // Rotate to center open section at bottom

  // Gauge status definitions
  let statusText = 'Eco Safe';
  let statusColor = 'var(--success)';
  let glowColor = 'rgba(16, 185, 129, 0.2)';
  
  if (value > budget) {
    statusText = 'Over Budget';
    statusColor = 'var(--danger)';
    glowColor = 'rgba(239, 68, 68, 0.2)';
  } else if (value >= budget * 0.8) {
    statusText = 'Warning Zone';
    statusColor = 'var(--warning)';
    glowColor = 'rgba(245, 158, 11, 0.2)';
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-2)',
        position: 'relative'
      }}
    >
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{
          filter: `drop-shadow(0 4px 12px ${glowColor})`,
          transition: 'filter 0.5s ease'
        }}
      >
        {/* Background track arc */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--gray-100)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${rotation} 100 100)`}
        />
        {/* Active progress arc */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={statusColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(${rotation} 100 100)`}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease'
          }}
        />
      </svg>

      {/* Internal Value Labels */}
      <div
        style={{
          position: 'absolute',
          top: '75px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '38px',
            fontWeight: '800',
            color: 'var(--primary-900)',
            lineHeight: 1
          }}
        >
          {animatedValue.toFixed(1)}
        </span>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--gray-400)',
            fontWeight: '600',
            marginTop: '2px'
          }}
        >
          kg CO2e today
        </span>
      </div>

      {/* Under Status Indicator */}
      <div
        style={{
          marginTop: '-12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontWeight: '800',
            color: 'var(--white)',
            backgroundColor: statusColor,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-sm)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {statusText}
        </span>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--gray-500)',
            marginTop: '4px'
          }}
        >
          Daily Budget Limit: **{budget.toFixed(1)}** kg
        </span>
      </div>
    </div>
  );
};

export default CarbonGauge;
