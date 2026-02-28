/**
 * Image Upload Service using ImgBB API
 * Free image hosting with 32MB max file size
 */

export interface ImgBBImage {
  filename: string;
  name: string;
  mime: string;
  extension: string;
  url: string;
}

export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    size: string;
    time: string;
    expiration: string;
    image: ImgBBImage;
    thumb: ImgBBImage;
    medium?: ImgBBImage;
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export interface UploadOptions {
  name?: string;
  expiration?: number; // Auto-delete time in seconds (60-15552000)
}

export class ImageUploadService {
  private static API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
  private static API_URL = 'https://api.imgbb.com/1/upload';

  /**
   * Validate an image file before upload
   * @param file - The image file to validate
   * @returns Validation result with error message if invalid
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    // Check if file exists
    if (!file) {
      return { valid: false, error: 'Aucun fichier sélectionné' };
    }

    // Check file size (32MB max for ImgBB free tier)
    const maxSize = 32 * 1024 * 1024; // 32MB in bytes
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `Le fichier est trop volumineux (max: 32MB). Taille actuelle: ${(file.size / (1024 * 1024)).toFixed(2)}MB` 
      };
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp', 
      'image/bmp',
      'image/tiff',
      'image/heic'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Type de fichier non supporté. Utilisez JPEG, PNG, GIF, WEBP, BMP, TIFF ou HEIC' 
      };
    }

    return { valid: true };
  }

  /**
   * Upload an image file to ImgBB
   * @param file - The image file to upload
   * @param options - Upload options (name, expiration)
   * @returns Promise with the upload result data
   */
  static async uploadImage(
    file: File,
    options?: UploadOptions
  ): Promise<ImgBBResponse['data']> {
    // Validate API key
    if (!this.API_KEY) {
      throw new Error('Clé API ImgBB manquante. Vérifiez votre fichier .env');
    }

    // Validate file
    const validation = this.validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('key', this.API_KEY);
    formData.append('image', file);
    
    if (options?.name) {
      formData.append('name', options.name);
    }
    
    if (options?.expiration) {
      // Ensure expiration is within valid range (60 seconds to 15552000 seconds / 180 days)
      const validExpiration = Math.min(15552000, Math.max(60, options.expiration));
      formData.append('expiration', validExpiration.toString());
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || 
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result: ImgBBResponse = await response.json();
      
      if (!result.success) {
        throw new Error('L\'upload a échoué sans message d\'erreur');
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Délai d\'attente dépassé. Veuillez réessayer.');
        }
        throw new Error(`Erreur d'upload: ${error.message}`);
      }
      throw new Error('Erreur inconnue lors de l\'upload');
    }
  }

  /**
   * Upload an image from a URL to ImgBB
   * @param imageUrl - The URL of the image to upload
   * @param options - Upload options (name, expiration)
   * @returns Promise with the upload result data
   */
  static async uploadFromUrl(
    imageUrl: string,
    options?: UploadOptions
  ): Promise<ImgBBResponse['data']> {
    // Validate API key
    if (!this.API_KEY) {
      throw new Error('Clé API ImgBB manquante. Vérifiez votre fichier .env');
    }

    // Validate URL
    try {
      new URL(imageUrl);
    } catch {
      throw new Error('URL d\'image invalide');
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('key', this.API_KEY);
    formData.append('image', imageUrl);
    
    if (options?.name) {
      formData.append('name', options.name);
    }
    
    if (options?.expiration) {
      const validExpiration = Math.min(15552000, Math.max(60, options.expiration));
      formData.append('expiration', validExpiration.toString());
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || 
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result: ImgBBResponse = await response.json();
      
      if (!result.success) {
        throw new Error('L\'upload a échoué sans message d\'erreur');
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Délai d\'attente dépassé. Veuillez réessayer.');
        }
        throw new Error(`Erreur d'upload: ${error.message}`);
      }
      throw new Error('Erreur inconnue lors de l\'upload');
    }
  }

  /**
   * Get a direct image URL with optional size modifications
   * @param url - The original ImgBB URL
   * @param size - Desired size (thumb, medium, large)
   * @returns Modified URL for different sizes
   */
  static getImageUrl(url: string, size: 'thumb' | 'medium' | 'large' = 'large'): string {
    if (size === 'thumb') {
      return url.replace(/\.[^/.]+$/, 't.$&'); // Add 't' before extension for thumbnail
    }
    if (size === 'medium') {
      return url.replace(/\.[^/.]+$/, 'm.$&'); // Add 'm' before extension for medium
    }
    return url;
  }

  /**
   * Format file size for display
   * @param bytes - Size in bytes
   * @returns Formatted size string
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Extract file extension from filename or MIME type
   * @param file - The file object
   * @returns File extension without dot
   */
  static getFileExtension(file: File): string {
    return file.name.split('.').pop()?.toLowerCase() || 
           file.type.split('/').pop()?.toLowerCase() || 
           'jpg';
  }

  /**
   * Generate a safe filename for upload
   * @param originalName - Original filename
   * @returns Sanitized filename
   */
  static sanitizeFilename(originalName: string): string {
    return originalName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special characters with underscore
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .toLowerCase();
  }
}

/**
 * React hook for image upload with progress tracking
 */
export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImgBBResponse['data'] | null>(null);

  const upload = async (file: File, options?: UploadOptions) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const data = await ImageUploadService.uploadImage(file, options);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(data);
      
      // Reset progress after success
      setTimeout(() => {
        setProgress(0);
        setIsUploading(false);
      }, 1000);

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
      setProgress(0);
      throw err;
    }
  };

  const reset = () => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  };

  return {
    upload,
    reset,
    isUploading,
    progress,
    error,
    result
  };
};

// Add useState import if not available
import { useState } from 'react';