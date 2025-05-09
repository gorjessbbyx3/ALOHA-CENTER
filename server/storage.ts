import fs from 'fs';
import path from 'path';
import { Client } from '@replit/object-storage';
import { checkS3Connection } from './aws-s3';

// Define storage interface
export interface Storage {
  uploadFile(filename: string, data: Buffer): Promise<string>;
  getFile(filename: string): Promise<Buffer | null>;
  listFiles(): Promise<string[]>;
  deleteFile(filename: string): Promise<boolean>;
}

// Local file storage implementation
class FileStorage implements Storage {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(filename: string, data: Buffer): Promise<string> {
    const filePath = path.join(this.baseDir, filename);
    await fs.promises.writeFile(filePath, data);
    return filePath;
  }

  async getFile(filename: string): Promise<Buffer | null> {
    const filePath = path.join(this.baseDir, filename);
    try {
      return await fs.promises.readFile(filePath);
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error);
      return null;
    }
  }

  async listFiles(): Promise<string[]> {
    try {
      return await fs.promises.readdir(this.baseDir);
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  async deleteFile(filename: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, filename);
    try {
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Error deleting file ${filename}:`, error);
      return false;
    }
  }
}

// Replit Object Storage implementation
class ReplitStorage implements Storage {
  private client: Client;

  constructor() {
    this.client = new Client();
  }

  async uploadFile(filename: string, data: Buffer): Promise<string> {
    const result = await this.client.uploadFromFile(filename, data);
    if (!result.ok) {
      throw new Error(`Failed to upload file: ${result.error.message}`);
    }
    return filename;
  }

  async getFile(filename: string): Promise<Buffer | null> {
    const result = await this.client.downloadToBuffer(filename);
    if (!result.ok) {
      console.error(`Error getting file ${filename}:`, result.error);
      return null;
    }
    return result.value;
  }

  async listFiles(): Promise<string[]> {
    const result = await this.client.list();
    if (!result.ok) {
      console.error('Error listing files:', result.error);
      return [];
    }
    return result.value.map(obj => obj.name);
  }

  async deleteFile(filename: string): Promise<boolean> {
    const result = await this.client.delete(filename);
    return result.ok;
  }
}

// Factory function to create appropriate storage instance
export function createStorage(): Storage {
  const storageType = process.env.STORAGE_TYPE || 'local';

  if (storageType === 'replit') {
    console.log('Using Replit Object Storage');
    return new ReplitStorage();
  } else if (storageType === 'aws') {
    console.log('Using AWS S3 Storage');
    // Import and use AWS storage implementation
    const { AWSStorage } = require('./aws-storage');
    return new AWSStorage();
  } else {
    console.log('Using Local File Storage');
    return new FileStorage();
  }
}

// Export singleton instance
export const storage = createStorage();