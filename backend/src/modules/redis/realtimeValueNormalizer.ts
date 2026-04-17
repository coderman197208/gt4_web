const arrayLikeTags = new Set(['ALIGN_POS_TUBE_INFO']);
const nullableTags = new Set(['PlanInfo']);

/**
 * Normalize empty Redis payloads into valid JSON strings before they are pushed downstream.
 */
export function normalizeRealtimeTagValue(tagName: string, rawValue: string): string {
  if (rawValue.trim() !== '') {
    return rawValue;
  }

  if (arrayLikeTags.has(tagName)) {
    console.warn(`[RedisValueNormalizer] tag "${tagName}" 为空字符串，改写为 []`);
    return '[]';
  }

  if (nullableTags.has(tagName)) {
    console.warn(`[RedisValueNormalizer] tag "${tagName}" 为空字符串，改写为 null`);
    return 'null';
  }

  console.warn(`[RedisValueNormalizer] tag "${tagName}" 为空字符串，默认改写为 null`);
  return 'null';
}
