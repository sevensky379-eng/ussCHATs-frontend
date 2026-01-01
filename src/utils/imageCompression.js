/**
 * Image compression utility using browser-image-compression
 * Reduces file size while maintaining acceptable quality
 */

import imageCompression from 'browser-image-compression';

/**
 * Compress an image file
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export async function compressImage(file, options = {}) {
  // Only compress image files
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const defaultOptions = {
    maxSizeMB: 0.5,           // Maximum file size: 500KB
    maxWidthOrHeight: 1920,   // Maximum dimension: 1920px
    useWebWorker: true,       // Use web worker for better performance
    fileType: file.type,      // Preserve original file type
    initialQuality: 0.85,     // Initial quality (0-1)
  };

  const compressionOptions = { ...defaultOptions, ...options };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Log compression results (only in development)
    if (process.env.NODE_ENV === 'development') {
      const originalSize = (file.size / 1024 / 1024).toFixed(2);
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
      const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
      console.log(`Image compressed: ${originalSize}MB → ${compressedSize}MB (${reduction}% reduction)`);
    }

    return compressedFile;
  } catch (error) {
    console.error('Image compression error:', error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Compress multiple image files
 * @param {File[]} files - Array of files to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File[]>} - Array of compressed files
 */
export async function compressImages(files, options = {}) {
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  const nonImageFiles = files.filter(f => !f.type.startsWith('image/'));

  const compressedImages = await Promise.all(
    imageFiles.map(file => compressImage(file, options))
  );

  return [...compressedImages, ...nonImageFiles];
}


