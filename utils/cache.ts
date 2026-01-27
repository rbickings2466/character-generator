import { MohoCharacterAttributes, PartViewKey } from '../types';

const CACHE_PREFIX = 'css_part_';
const CACHE_VERSION = 'v1';

// Generate a simple hash from character attributes for cache key
const hashAttributes = (attrs: MohoCharacterAttributes): string => {
  const str = JSON.stringify(attrs);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

// Build cache key for a specific part
const buildCacheKey = (attrs: MohoCharacterAttributes, partKey: PartViewKey): string => {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${hashAttributes(attrs)}_${partKey}`;
};

// Get cached part image
export const getCachedPart = (
  attrs: MohoCharacterAttributes,
  partKey: PartViewKey
): string | null => {
  try {
    const key = buildCacheKey(attrs, partKey);
    return sessionStorage.getItem(key);
  } catch {
    // sessionStorage may not be available
    return null;
  }
};

// Cache a generated part image
export const cachePart = (
  attrs: MohoCharacterAttributes,
  partKey: PartViewKey,
  imageUrl: string
): void => {
  try {
    const key = buildCacheKey(attrs, partKey);
    sessionStorage.setItem(key, imageUrl);
  } catch {
    // sessionStorage may be full or unavailable - fail silently
  }
};

// Clear a single cached part (for regeneration)
export const clearCachedPart = (
  attrs: MohoCharacterAttributes,
  partKey: PartViewKey
): void => {
  try {
    const key = buildCacheKey(attrs, partKey);
    sessionStorage.removeItem(key);
  } catch {
    // Fail silently
  }
};

// Clear all cached parts for a character
export const clearCharacterCache = (attrs: MohoCharacterAttributes): void => {
  try {
    const hash = hashAttributes(attrs);
    const prefix = `${CACHE_PREFIX}${CACHE_VERSION}_${hash}_`;

    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch {
    // Fail silently
  }
};

// Clear all cached parts
export const clearAllCache = (): void => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch {
    // Fail silently
  }
};
