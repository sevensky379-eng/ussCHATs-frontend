import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before upload to reduce bandwidth usage
 * @param {File} file - The image file to compress
 * @returns {Promise<File>} - The compressed image file
 */
export const compressImage = async (file) => {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return file; // Return original if not an image
  }

  const options = {
    maxSizeMB: 0.5,        // Max 500KB
    maxWidthOrHeight: 1920, // Max dimension
    useWebWorker: true,    // Use web worker for better performance
    fileType: 'image/webp' // Convert to WebP for better compression
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Return original file if compression fails
  }
};

/**
 * Compresses multiple images
 * @param {File[]} files - Array of image files
 * @returns {Promise<File[]>} - Array of compressed images
 */
export const compressImages = async (files) => {
  const compressedFiles = await Promise.all(
    files.map(file => compressImage(file))
  );
  return compressedFiles;
};