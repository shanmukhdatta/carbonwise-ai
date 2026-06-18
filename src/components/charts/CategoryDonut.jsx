import React, { useState } from 'react';

const CategoryDonut = ({ data = [] }) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Filter out zero values
  const activeData = data.filter((d) => d.value > 0);
  const total = activeData.reduce((sum, d) => sum + d.value, 0);

  const radius = 60;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        width: '100%'
      }}
    >
      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {total === 0 ? (
            /* Empty State Tracker Circle */
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="var(--gray-100)"
              strokeWidth={strokeWidth}
            />
          ) : (
            activeData.map((slice, index) => {
              const percentage = slice.value / total;
              const dashLength = percentage * circumference;
              const strokeDashoffset = circumference - (dashLength);
              const rotationAngle = (accumulatedPercent * 360) - 90;
              
              accumulatedPercent += percentage;

              const isHovered = hoveredSlice === slice.key;

              return (
                <circle
                  key={slice.key}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${rotationAngle} 80 80)`}
                  strokeLinecap="butt"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s var(--ease-standard)'
                  }}
                  onMouseEnter={() => setHoveredSlice(slice.key)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              );
            })
          )}
        </svg>

        {/* Center Hover Label Tooltip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          {hoveredSlice ? (
            <>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--gray-400)',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}
              >
                {data.find((d) => d.key === hoveredSlice)?.name}
              </span>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '18px',
                  fontWeight: '800',
                  color: 'var(--primary-900)'
                }}
              >
                {data.find((d) => d.key === hoveredSlice)?.value.toFixed(1)} kg
              </span>
              <span style={{ fontSize: '10px', color: 'var(--primary-600)', fontWeight: '600' }}>
                {((data.find((d) => d.key === hoveredSlice)?.value / (total || 1)) * 100).toFixed(0)}%
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '600' }}>TOTAL</span>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '20px',
                  fontWeight: '800',
                  color: 'var(--primary-900)'
                }}
              >
                {total.toFixed(1)}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--gray-500)' }}>kg CO2e</span>
            </>
          )}
        </div>
      </div>

      {/* Custom Flex Legend Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px 12px',
          width: '100%',
          maxWidth: '280px',
          fontSize: '12px'
        }}
      >
        {data.map((item) => (
          <div
            key={item.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              opacity: hoveredSlice && hoveredSlice !== item.key ? 0.5 : 1,
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={() => setHoveredSlice(item.key)}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: item.color,
                display: 'inline-block'
              }}
            />
            <span style={{ fontWeight: '500', color: 'var(--gray-700)' }}>{item.name}</span>
            <span style={{ fontWeight: '700', color: 'var(--gray-900)', marginLeft: 'auto' }}>
              {item.value.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDonut;
