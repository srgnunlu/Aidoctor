const { getStorage } = require('../config/firebase');
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
    this.bucket = null;
  }

  getBucket() {
    if (!this.bucket) {
      const storage = getStorage();
      this.bucket = storage.bucket();
    }
    return this.bucket;
  }

  getPrivateObjectDir() {
    return 'medical-files';
  }

  async uploadImage(imageBuffer, fileExtension = 'jpg') {
    const objectId = randomUUID();
    const key = `${this.getPrivateObjectDir()}/uploads/${objectId}.${fileExtension}`;

    try {
      const bucket = this.getBucket();
      const file = bucket.file(key);

      await file.save(imageBuffer, {
        metadata: {
          contentType: this.getContentType(fileExtension),
        },
      });

      return {
        key,
        objectPath: key,
        size: imageBuffer.length,
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async getObjectEntityFile(objectPath) {
    let key = objectPath;

    if (objectPath.startsWith('/objects/')) {
      const parts = objectPath.slice(1).split('/');
      const entityId = parts.slice(1).join('/');
      key = `${this.getPrivateObjectDir()}/${entityId}`;
    }

    try {
      const bucket = this.getBucket();
      const file = bucket.file(key);
      const [exists] = await file.exists();

      if (!exists) {
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

  async getObjectBuffer(file) {
    try {
      const bucket = this.getBucket();
      const fileRef = bucket.file(file.key);
      const [buffer] = await fileRef.download();

      return buffer;
    } catch (error) {
      console.error('Error getting object buffer:', error);
      throw error;
    }
  }

  async downloadObject(file, res, cacheTtlSec = 3600) {
    try {
      const bucket = this.getBucket();
      const fileRef = bucket.file(file.key);
      const [buffer] = await fileRef.download();

      const contentType = this.getContentType(file.key);

      res.set({
        'Content-Type': contentType,
        'Content-Length': buffer.length,
        'Cache-Control': `private, max-age=${cacheTtlSec}`,
      });

      res.send(buffer);
    } catch (error) {
      console.error('Error downloading file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error downloading file' });
      }
    }
  }

  async listObjects(prefix = '') {
    try {
      const bucket = this.getBucket();
      const [files] = await bucket.getFiles({ prefix });

      return files.map(file => ({
        name: file.name,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
        updated: file.metadata.updated,
      }));
    } catch (error) {
      console.error('Error listing objects:', error);
      return [];
    }
  }

  async deleteObject(key) {
    try {
      const bucket = this.getBucket();
      const file = bucket.file(key);
      await file.delete();
      return true;
    } catch (error) {
      console.error('Error deleting object:', error);
      return false;
    }
  }

  getContentType(keyOrExtension) {
    let contentType = 'application/octet-stream';

    if (keyOrExtension.endsWith('.jpg') || keyOrExtension.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (keyOrExtension.endsWith('.png')) {
      contentType = 'image/png';
    } else if (keyOrExtension.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (keyOrExtension.endsWith('.gif')) {
      contentType = 'image/gif';
    } else if (keyOrExtension.endsWith('.webp')) {
      contentType = 'image/webp';
    }

    return contentType;
  }
}

module.exports = {
  ObjectStorageService,
  ObjectNotFoundError,
};
