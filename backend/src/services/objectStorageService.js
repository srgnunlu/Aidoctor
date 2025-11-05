const { getSupabaseAdmin } = require('../config/supabase');
const { randomUUID } = require('crypto');

class ObjectNotFoundError extends Error {
  constructor() {
    super('Object not found');
    this.name = 'ObjectNotFoundError';
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

class ObjectStorageService {
  constructor() {
    this.bucketName = 'medical-files';
  }

  getSupabase() {
    return getSupabaseAdmin();
  }

  getPrivateObjectDir() {
    return 'uploads';
  }

  /**
   * Upload an image to Supabase Storage
   * @param {Buffer} imageBuffer - The image buffer to upload
   * @param {string} fileExtension - File extension (jpg, png, etc.)
   * @param {string} userId - User ID to organize files
   * @returns {Promise<{key: string, objectPath: string, size: number}>}
   */
  async uploadImage(imageBuffer, fileExtension = 'jpg', userId = null) {
    const objectId = randomUUID();
    const userFolder = userId || 'shared';
    const key = `${userFolder}/${this.getPrivateObjectDir()}/${objectId}.${fileExtension}`;

    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(key, imageBuffer, {
          contentType: this.getContentType(fileExtension),
          upsert: false,
        });

      if (error) {
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      return {
        key: key,
        objectPath: key,
        size: imageBuffer.length,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Get object file reference from Supabase Storage
   * @param {string} objectPath - Path to the object in storage
   * @returns {Promise<{key: string}>}
   */
  async getObjectEntityFile(objectPath) {
    let key = objectPath;

    // Handle legacy path format
    if (objectPath.startsWith('/objects/')) {
      const parts = objectPath.slice(1).split('/');
      const entityId = parts.slice(1).join('/');
      key = entityId;
    }

    try {
      const supabase = this.getSupabase();

      // Check if file exists
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(key.substring(0, key.lastIndexOf('/')), {
          search: key.substring(key.lastIndexOf('/') + 1)
        });

      if (error || !data || data.length === 0) {
        throw new ObjectNotFoundError();
      }

      return { key };
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        throw error;
      }
      throw new ObjectNotFoundError();
    }
  }

  /**
   * Get object buffer from Supabase Storage
   * @param {object} file - File object with key property
   * @returns {Promise<Buffer>}
   */
  async getObjectBuffer(file) {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .download(file.key);

      if (error) {
        throw new Error(`Failed to download object: ${error.message}`);
      }

      // Convert Blob to Buffer
      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error getting object buffer:', error);
      throw error;
    }
  }

  /**
   * Download object and send to response
   * @param {object} file - File object with key property
   * @param {object} res - Express response object
   * @param {number} cacheTtlSec - Cache TTL in seconds
   */
  async downloadObject(file, res, cacheTtlSec = 3600) {
    try {
      const buffer = await this.getObjectBuffer(file);
      const contentType = this.getContentType(file.key);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', `public, max-age=${cacheTtlSec}`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error('Error downloading object:', error);
      throw error;
    }
  }

  /**
   * Get signed URL for private object access
   * @param {string} key - Object key in storage
   * @param {number} expiresIn - URL expiration in seconds (default: 3600)
   * @returns {Promise<string>}
   */
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(key, expiresIn);

      if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      throw error;
    }
  }

  /**
   * Delete object from storage
   * @param {string} key - Object key to delete
   * @returns {Promise<boolean>}
   */
  async deleteObject(key) {
    try {
      const supabase = this.getSupabase();

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([key]);

      if (error) {
        throw new Error(`Failed to delete object: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting object:', error);
      throw error;
    }
  }

  /**
   * Get content type from file extension
   * @param {string} filename - Filename or path
   * @returns {string}
   */
  getContentType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const contentTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      json: 'application/json',
      txt: 'text/plain',
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
    };

    return contentTypes[ext] || 'application/octet-stream';
  }
}

module.exports = new ObjectStorageService();
module.exports.ObjectNotFoundError = ObjectNotFoundError;