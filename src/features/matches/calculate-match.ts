import type { FoundPost, LostReport } from '@/types/domain';

export const MATCH_THRESHOLD = 6;

export type MatchCalculation = {
  score: number;
  reasons: string[];
};

const genericNameWords = new Set([
  'cai',
  'chiec',
  'do',
  'hop',
  'mau',
  'may',
  'the',
  'vat',
]);

const genericLocationWords = new Set([
  'co',
  'day',
  'gan',
  'khu',
  'phong',
  'so',
  'tang',
  'toa',
]);

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function words(value: string) {
  return normalize(value).split(/\s+/).filter(Boolean);
}

function hasLocationOverlap(lostReport: LostReport, foundPost: FoundPost) {
  const foundLocation = normalize(
    `${foundPost.campus} ${foundPost.building} ${foundPost.specificLocation}`,
  );
  const foundWords = new Set(words(foundLocation));

  return lostReport.possibleLocations.some((location) => {
    const normalizedLocation = normalize(location);
    if (normalizedLocation.length >= 2 && foundLocation.includes(normalizedLocation)) {
      return true;
    }

    return words(location).some(
      (word) => word.length >= 2 && !genericLocationWords.has(word) && foundWords.has(word),
    );
  });
}

function hasSimilarName(lostReport: LostReport, foundPost: FoundPost) {
  const lostWords = new Set(
    words(lostReport.itemName).filter((word) => word.length >= 3 && !genericNameWords.has(word)),
  );

  return words(foundPost.title).some(
    (word) => word.length >= 3 && !genericNameWords.has(word) && lostWords.has(word),
  );
}

function hasReasonableTime(lostReport: LostReport, foundPost: FoundPost) {
  const difference = new Date(foundPost.foundAt).getTime() - new Date(lostReport.lostAt).getTime();
  const sixHours = 6 * 60 * 60 * 1000;
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  return Number.isFinite(difference) && difference >= -sixHours && difference <= thirtyDays;
}

export function calculateMatch(
  lostReport: LostReport,
  foundPost: FoundPost,
): MatchCalculation {
  let score = 0;
  const reasons: string[] = [];

  if (normalize(lostReport.category) === normalize(foundPost.category)) {
    score += 3;
    reasons.push('Cùng danh mục');
  }

  if (normalize(lostReport.color) === normalize(foundPost.color)) {
    score += 2;
    reasons.push(`Cùng màu ${foundPost.color.toLowerCase()}`);
  }

  if (hasLocationOverlap(lostReport, foundPost)) {
    score += 2;
    reasons.push(`Cùng khu vực ${foundPost.building}`);
  }

  if (hasReasonableTime(lostReport, foundPost)) {
    score += 2;
    reasons.push('Thời gian phù hợp');
  }

  if (hasSimilarName(lostReport, foundPost)) {
    score += 1;
    reasons.push('Tên vật phẩm tương đồng');
  }

  return { score, reasons };
}
