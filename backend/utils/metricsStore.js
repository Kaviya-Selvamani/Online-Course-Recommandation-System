const MAX_SAMPLES = 500;
const MAX_LOGS = 80;

const samples = [];
const logs = [];

export function recordRequest({ method, path, statusCode, durationMs }) {
  const now = Date.now();
  samples.push({ method, path, statusCode, durationMs, timestamp: now });
  if (samples.length > MAX_SAMPLES) samples.shift();

  if (statusCode >= 500) {
    addLog(`Server error on ${method} ${path} (${statusCode})`, "error");
  } else if (durationMs > 1200) {
    addLog(`Slow API response: ${method} ${path} (${Math.round(durationMs)}ms)`, "warning");
  }
}

export function addLog(message, level = "info") {
  logs.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    message,
    level,
    time: new Date(),
  });
  if (logs.length > MAX_LOGS) logs.shift();
}

export function getMetrics() {
  const now = Date.now();
  const durations = samples.map((s) => s.durationMs);
  const avgResponseMs = durations.length
    ? Math.round(durations.reduce((sum, v) => sum + v, 0) / durations.length)
    : 0;
  const sorted = [...durations].sort((a, b) => a - b);
  const p95ResponseMs = sorted.length
    ? Math.round(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))])
    : 0;

  const recent = samples.filter((s) => now - s.timestamp <= 60 * 1000);
  const requestsPerMinute = recent.length;

  const errorCount = samples.filter((s) => s.statusCode >= 500).length;
  const errorRate = samples.length ? Math.round((errorCount / samples.length) * 1000) / 10 : 0;

  return {
    avgResponseMs,
    p95ResponseMs,
    requestsPerMinute,
    errorRate,
    totalRequests: samples.length,
  };
}

export function getLogs(limit = 12) {
  return logs.slice(-limit).reverse();
}
