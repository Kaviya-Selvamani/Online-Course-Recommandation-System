import { motion as Motion } from "framer-motion";

function polarToCartesian(cx, cy, radius, angleDeg) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

export function BarChart({ labels = [], values = [], accent = "var(--secondary-accent)" }) {
  const max = Math.max(...values, 1);

  return (
    <div className="chart-bars">
      {values.map((value, index) => (
        <div className="chart-bar-col" key={`${labels[index]}-${index}`}>
          <Motion.div
            className="chart-bar-fill"
            initial={{ height: 0, opacity: 0.5 }}
            animate={{ height: `${Math.max(12, (value / max) * 110)}px`, opacity: 1 }}
            transition={{ duration: 0.65, delay: index * 0.06, ease: "easeOut" }}
            style={{
              background: `linear-gradient(180deg, ${accent}, var(--ac))`,
            }}
          />
          <div className="chart-bar-label">{labels[index]}</div>
          <div className="chart-bar-value">{value}h</div>
        </div>
      ))}
    </div>
  );
}

export function PieChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const colors = ["var(--secondary-accent)", "var(--ac)", "var(--warn)", "var(--info)", "var(--dng)"];
  const segments = data.reduce((acc, item, index) => {
    const previousOffset = acc.length ? acc[acc.length - 1].offset - acc[acc.length - 1].ratio * 100 : 0;
    const ratio = item.value / total;
    acc.push({
      ...item,
      ratio,
      dash: `${ratio * 100} ${100 - ratio * 100}`,
      offset: previousOffset,
      color: colors[index % colors.length],
    });
    return acc;
  }, []);

  return (
    <div className="pie-wrap">
      <svg viewBox="0 0 42 42" className="pie-chart" aria-hidden="true">
        <circle className="pie-bg" cx="21" cy="21" r="15.9155" />
        {segments.map((segment) => (
          <circle
            key={segment.label}
            className="pie-segment"
            cx="21"
            cy="21"
            r="15.9155"
            stroke={segment.color}
            strokeDasharray={segment.dash}
            strokeDashoffset={segment.offset}
          />
        ))}
      </svg>
      <div className="pie-legend">
        {segments.map((segment) => (
          <div className="pie-legend-item" key={segment.label}>
            <span className="pie-swatch" style={{ background: segment.color }} />
            <span>{segment.label}</span>
            <strong>{segment.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GrowthChart({ items = [] }) {
  return (
    <div className="growth-list">
      {items.map((item, index) => (
        <div className="growth-row" key={item.label}>
          <div className="growth-head">
            <span>{item.label}</span>
            <strong>{item.progress}%</strong>
          </div>
          <div className="growth-track">
            <Motion.div
              className="growth-fill"
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RadarChart({ data = [] }) {
  const points = data.slice(0, 6);
  if (!points.length) {
    return <div className="empty-state" style={{ padding: 24 }}>No radar data available.</div>;
  }

  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 86;
  const levels = 4;
  const step = 360 / points.length;

  const polygonPoints = points
    .map((point, index) => {
      const radius = (Math.max(0, Math.min(100, point.value)) / 100) * maxRadius;
      const { x, y } = polarToCartesian(cx, cy, radius, index * step);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="radar-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} className="radar-chart" aria-hidden="true">
        {Array.from({ length: levels }).map((_, levelIndex) => {
          const levelRadius = ((levelIndex + 1) / levels) * maxRadius;
          const levelPoints = points
            .map((__, pointIndex) => {
              const { x, y } = polarToCartesian(cx, cy, levelRadius, pointIndex * step);
              return `${x},${y}`;
            })
            .join(" ");
          return (
            <polygon
              key={`grid-${levelIndex}`}
              points={levelPoints}
              className="radar-grid"
            />
          );
        })}

        {points.map((point, index) => {
          const end = polarToCartesian(cx, cy, maxRadius, index * step);
          return (
            <line
              key={`axis-${point.label}`}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              className="radar-axis"
            />
          );
        })}

        <Motion.polygon
          points={polygonPoints}
          className="radar-area"
          initial={{ opacity: 0, scale: 0.84 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      </svg>
      <div className="radar-legend">
        {points.map((point) => (
          <div className="radar-legend-item" key={point.label}>
            <span>{point.label}</span>
            <strong>{point.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DistributionBars({ data = [] }) {
  const points = data.slice(0, 6);
  const max = Math.max(...points.map((item) => item.value), 1);

  return (
    <div className="dist-list">
      {points.map((item, index) => (
        <div className="dist-row" key={item.label}>
          <div className="dist-head">
            <span>{item.label}</span>
            <strong>{item.value}%</strong>
          </div>
          <div className="dist-track">
            <Motion.div
              className="dist-fill"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(8, (item.value / max) * 100)}%` }}
              transition={{ duration: 0.6, delay: index * 0.07, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
