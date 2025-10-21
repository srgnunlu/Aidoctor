const { Client } = require('@replit/object-storage');
const { randomUUID } = require('crypto');

const objectStorageClient = new Client();

class ObjectNotFoundError extends Error {
  constructor() {
    super('Object not found');
    this.name = 'ObjectNotFoundError';
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

class ObjectStorageService {
  getPrivateObjectDir() {
    return 'medical-files';
  }

  async uploadImage(imageBuffer, fileExtension = 'jpg') {
    const objectId = randomUUID();
    const key = `${this.getPrivateObjectDir()}/uploads/${objectId}.${fileExtension}`;

    try {
      const result = await objectStorageClient.uploadFromBytes(key, imageBuffer);
      
      if (!result.ok) {
        throw new Error(`Upload failed: ${result.error}`);
      }
      
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
      const result = await objectStorageClient.downloadAsBytes(key);
      if (!result.ok) {
        throw new ObjectNotFoundError();
      }
      return { key };
    } catch (error) {
      throw new ObjectNotFoundError();
    }
  }

  async getObjectBuffer(file) {
    try {
      const key = file.key;
      const result = await objectStorageClient.downloadAsBytes(key);
      
      if (!result.ok) {
        throw new Error(`Download failed: ${result.error}`);
      }
      
      return result.value[0];
    } catch (error) {
      console.error('Error getting object buffer:', error);
      throw error;
    }
  }

  async downloadObject(file, res, cacheTtlSec = 3600) {
    try {
      const key = file.key;
      const result = await objectStorageClient.downloadAsBytes(key);
      
      if (!result.ok) {
        throw new Error(`Download failed: ${result.error}`);
      }
      
      const buffer = result.value[0];
      
      let contentType = 'application/octet-stream';
      if (key.endsWith('.jpg') || key.endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      } else if (key.endsWith('.png')) {
        contentType = 'image/png';
      } else if (key.endsWith('.pdf')) {
        contentType = 'application/pdf';
      }

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
      const result = await objectStorageClient.list({ prefix });
      if (!result.ok) {
        return [];
      }
      return result.value;
    } catch (error) {
      console.error('Error listing objects:', error);
      return [];
    }
  }

  async deleteObject(key) {
    try {
      const result = await objectStorageClient.delete(key);
      return result.ok;
    } catch (error) {
      console.error('Error deleting object:', error);
      return false;
    }
  }
}

module.exports = {
  ObjectStorageService,
  ObjectNotFoundError,
  objectStorageClient,
};
