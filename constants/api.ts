// API configuration constants
export const API_CONFIG = {
  // Retry configuration
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 3000,
  REQUEST_DELAY_MS: 2000,

  // Total parts to generate (14 body parts × 4 views)
  TOTAL_PARTS: 56,

  // Download configuration
  DOWNLOAD_STAGGER_MS: 200,

  // Character name sanitization
  MAX_CHARACTER_NAME_LENGTH: 30,
} as const;

// Gemini model identifiers
export const GEMINI_MODELS = {
  CHARACTER_SHEET: 'gemini-2.5-flash-image',
  REFERENCE_SHEET: 'gemini-2.5-flash-image',
  BODY_PART: 'gemini-2.5-flash-image',
} as const;

// Image processing constants
export const IMAGE_PROCESSING = {
  GREEN_THRESHOLD: 180,
  GREEN_TOLERANCE: 50,
  GREEN_EDGE_THRESHOLD: 120,
  GREEN_EDGE_TOLERANCE: 80,
  WHITE_THRESHOLD: 245,
} as const;

// Image compression for API optimization
export const IMAGE_COMPRESSION = {
  MAX_WIDTH: 1024,
  QUALITY: 0.8,
} as const;
