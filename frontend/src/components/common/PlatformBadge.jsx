import { getPlatformMeta } from "../../services/learningInsights.js";

export default function PlatformBadge({ platform }) {
  const meta = getPlatformMeta(platform);

  return (
    <span className="platform-badge" title={meta.label}>
      <span className="platform-badge-icon">{meta.short}</span>
      {meta.label}
    </span>
  );
}
