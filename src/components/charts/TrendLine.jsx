import React, { useState } from 'react';

const TrendLine = ({ data = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (data.length === 0) {
    return <div style={{ color: 'var(--gray-400)', fontSize: '14px', textAlign: 'center' }}>No trend data</div>;
  }

  // Find max value for Y scaling
  const values = data.map((d) => d.co2e);
  const maxVal = Math.max(10, ...values) * 1.15; // 15% padding on top

  // Chart configuration
  const width = 360;
  const height = 150;
  const paddingLeft = 30;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Convert points to coordinates
  const points = data.map((item, index) => {
    const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (item.co2e / maxVal) * chartHeight;
    return { x, y, item };
  });

  // Construct SVG Path String (straight lines for maximum clarity)
  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    points.forEach((pt, idx) => {
      if (idx > 0) linePath += ` L ${pt.x} ${pt.y}`;
    });

    // Close path for area fill
    areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  // Draw simple Y-axis guidelines
  const gridLinesCount = 3;
  const gridLines = Array.from({ length: gridLinesCount }, (_, idx) => {
    const ratio = idx / (gridLinesCount - 1);
    const yVal = maxVal * (1 - ratio);
    const yCoord = paddingTop + ratio * chartHeight;
    return { y: yCoord, label: Math.round(yVal) };
  });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Dynamic Tooltip Label */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '24px',
          padding: '0 8px'
        }}
      >
        <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: '600' }}>
          Weekly Emission Trends
        </span>
        {hoveredPoint !== null && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--primary-800)',
              backgroundColor: 'var(--primary-50)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--primary-100)'
            }}
          >
            {data[hoveredPoint].day}: **{data[hoveredPoint].co2e.toFixed(1)} kg CO2e**
          </span>
        )}
      </div>

      {/* SVG Canvas */}
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          {/* Gradients definitions */}
          <defs>
            <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-500)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary-500)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={width - paddingRight}
                y2={line.y}
                stroke="var(--gray-100)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--gray-400)"
                fontWeight="600"
              >
                {line.label}
              </text>
            </g>
          ))}

          {/* Area under the line */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#trendAreaGradient)"
              style={{
                transition: 'd 0.5s ease-in-out'
              }}
            />
          )}

          {/* Trend Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--primary-600)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'd 0.5s ease-in-out'
              }}
            />
          )}

          {/* Interactive points */}
          {points.map((pt, index) => {
            const isHovered = hoveredPoint === index;
            return (
              <g
                key={index}
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? 'var(--primary-700)' : 'var(--white)'}
                  stroke="var(--primary-600)"
                  strokeWidth={isHovered ? 3 : 2}
                  style={{ transition: 'all 0.2s ease' }}
                />
                {/* Capture overlay circle for better hover response */}
                <circle cx={pt.x} cy={pt.y} r="15" fill="transparent" />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {data.map((item, index) => {
            const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
            return (
              <text
                key={index}
                x={x}
                y={height - 6}
                textAnchor="middle"
                fontSize="11"
                fill="var(--gray-500)"
                fontWeight="500"
              >
                {item.day}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default TrendLine;
