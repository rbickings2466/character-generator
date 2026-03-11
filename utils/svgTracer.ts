import ImageTracer from 'imagetracerjs';
import { logger } from './logger';

// Default options optimized for character art and cartoon styles
const DEFAULT_OPTIONS = {
  // Tracing
  ltres: 1, // Linear error threshold
  qtres: 1, // Quadratic spline error threshold
  pathomit: 8, // Edge node paths shorter than this will be discarded for noise reduction
  rightangleenhance: true,

  // Color quantization
  colorsampling: 2, // 0: disabled, 1: random, 2: deterministic
  numberofcolors: 24, // Optimized for cartoon art styles
  mincolorratio: 0,
  colorquantcycles: 3,

  // Rendering
  strokewidth: 0, // No stroke, purely fill
  linefilter: false,
  scale: 1,
  roundcoords: 1, // Round coordinates to 1 decimal place (reduces file size)
  viewbox: true, // Use viewBox instead of strict width/height

  // Blur (slight blur helps with noise in AI images before tracing)
  blurradius: 0, // No blur by default to keep crisp lines
  blurdelta: 20
};

/**
 * Converts a base64 Data URL (e.g., raster PNG) into an SVG string.
 * Uses imagetracerjs with settings optimized for character art.
 *
 * @param dataUrl The base64 data URL string of the image.
 * @returns A promise resolving to the raw SVG string.
 */
export const traceToSVG = (dataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // ImageTracer's imageToSVG takes the url, a callback with the resulting svgString, and options.
      ImageTracer.imageToSVG(
        dataUrl,
        (svgString: string) => {
          if (!svgString || !svgString.startsWith('<svg')) {
            reject(new Error('Failed to convert image to SVG.'));
            return;
          }
          resolve(svgString);
        },
        DEFAULT_OPTIONS
      );
    } catch (error) {
      logger.error('Error during SVG tracing:', error);
      reject(error);
    }
  });
};
