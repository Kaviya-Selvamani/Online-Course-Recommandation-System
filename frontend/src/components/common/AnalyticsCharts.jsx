export function BarChart({ labels = [], values = [], accent = "var(--secondary-accent)" }) {
  const max = Math.max(...values, 1);

  return (
    <div className="chart-bars">
      {values.map((value, index) => (
        <div className="chart-bar-col" key={`${labels[index]}-${index}`}>
          <div
            className="chart-bar-fill"
            style={{
              height: `${Math.max(12, (value / max) * 110)}px`,
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
  let offset = 0;
  const colors = ["var(--secondary-accent)", "var(--ac)", "var(--warn)", "var(--info)", "var(--dng)"];
  const segments = data.map((item, index) => {
    const ratio = item.value / total;
    const dash = `${ratio * 100} ${100 - ratio * 100}`;
    const segment = {
      ...item,
      dash,
      offset,
      color: colors[index % colors.length],
    };
    offset -= ratio * 100;
    return segment;
  });

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
      {items.map((item) => (
        <div className="growth-row" key={item.label}>
          <div className="growth-head">
            <span>{item.label}</span>
            <strong>{item.progress}%</strong>
          </div>
          <div className="growth-track">
            <div className="growth-fill" style={{ width: `${item.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
