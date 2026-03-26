const POSITIVE_WORDS = new Set([
  "great",
  "excellent",
  "amazing",
  "helpful",
  "love",
  "loved",
  "good",
  "fantastic",
  "clear",
  "useful",
  "insightful",
  "recommended",
  "best",
  "awesome",
]);

const NEGATIVE_WORDS = new Set([
  "bad",
  "poor",
  "confusing",
  "boring",
  "waste",
  "terrible",
  "hard",
  "awful",
  "slow",
  "outdated",
  "unhelpful",
  "disappointed",
]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeRating(rating) {
  if (typeof rating !== "number" || Number.isNaN(rating)) return 0;
  return clamp(rating, 0, 5) / 5;
}

export function analyzeSentiment(text = "") {
  const tokens = String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  let score = 0;
  tokens.forEach((token) => {
    if (POSITIVE_WORDS.has(token)) score += 1;
    if (NEGATIVE_WORDS.has(token)) score -= 1;
  });

  if (score > 0) return 1;
  if (score < 0) return -1;
  return 0;
}

export function computeInterestMatch(userInterests = [], courseTags = [], category = "") {
  const interestSet = new Set(
    userInterests.map((item) => String(item).toLowerCase().trim()).filter(Boolean)
  );
  if (interestSet.size === 0) return 0;

  const courseTerms = [
    ...courseTags.map((tag) => String(tag).toLowerCase().trim()),
    String(category || "").toLowerCase().trim(),
  ].filter(Boolean);

  const matched = courseTerms.some((term) => interestSet.has(term));
  return matched ? 1 : 0;
}

export function computeRelevanceScore({
  ratingScore = 0,
  sentimentScore = 0,
  interestMatchScore = 0,
}) {
  const r = typeof ratingScore === "number" ? ratingScore : 0;
  const s = typeof sentimentScore === "number" ? sentimentScore : 0;
  const i = typeof interestMatchScore === "number" ? interestMatchScore : 0;

  return Number(
    (0.4 * r + 0.3 * s + 0.3 * i).toFixed(4)
  );
}
