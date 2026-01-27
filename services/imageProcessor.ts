// Canvas-based background removal for transparency
import { IMAGE_PROCESSING, IMAGE_COMPRESSION } from '../constants/api';

// Compress image to reduce API payload size
export const compressImage = async (
  imageDataUrl: string,
  maxWidth: number = IMAGE_COMPRESSION.MAX_WIDTH,
  quality: number = IMAGE_COMPRESSION.QUALITY
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');

      // Calculate new dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = imageDataUrl;
  });
};

export const removeGreenBackground = async (
  imageDataUrl: string,
  tolerance: number = IMAGE_PROCESSING.GREEN_TOLERANCE
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Process each pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;

        // Check if pixel is close to pure green (#00FF00)
        if (g > IMAGE_PROCESSING.GREEN_THRESHOLD && r < tolerance && b < tolerance) {
          // Make fully transparent
          data[i + 3] = 0;
        }
        // Handle anti-aliased edges near green
        else if (g > IMAGE_PROCESSING.GREEN_EDGE_THRESHOLD && r < IMAGE_PROCESSING.GREEN_EDGE_TOLERANCE && b < IMAGE_PROCESSING.GREEN_EDGE_TOLERANCE) {
          // Partial transparency based on how green it is
          const greenness = (g - Math.max(r, b)) / 255;
          data[i + 3] = Math.floor(255 * (1 - greenness));
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
};

// Alternative: Remove white background (fallback)
export const removeWhiteBackground = async (
  imageDataUrl: string,
  threshold: number = IMAGE_PROCESSING.WHITE_THRESHOLD
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;

        // Check if pixel is close to white
        if (r > threshold && g > threshold && b > threshold) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
};

// Try green first, fall back to white
export const removeBackground = async (imageDataUrl: string): Promise<string> => {
  try {
    const result = await removeGreenBackground(imageDataUrl);
    return result;
  } catch {
    // Fall back to white background removal
    return removeWhiteBackground(imageDataUrl);
  }
};
