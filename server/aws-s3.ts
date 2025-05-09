
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from './config';
import fs from 'fs';
import path from 'path';

// Initialize S3 client
const s3Client = new S3Client({
  region: config.aws.region
});

const bucketName = config.aws.s3Bucket;

// Upload a file to S3
export async function uploadFile(filePath: string, key: string, contentType?: string): Promise<string> {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ContentType: contentType || 'application/octet-stream'
    };
    
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    // Return the full S3 path
    return `https://${bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
}

// Upload a buffer to S3
export async function uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType
    };
    
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    // Return the full S3 path
    return `https://${bucketName}.s3.${config.aws.region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading buffer to S3:', error);
    throw error;
  }
}

// Get a file from S3
export async function getFile(key: string): Promise<Buffer> {
  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    
    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    if (response.Body) {
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }
    }
    
    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Error getting file from S3:', error);
    throw error;
  }
}

// Generate a pre-signed URL for file download
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    const command = new GetObjectCommand(params);
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

// Generate a pre-signed URL for file upload
export async function getSignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      ContentType: contentType
    };
    
    const command = new PutObjectCommand(params);
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed upload URL:', error);
    throw error;
  }
}

// Delete a file from S3
export async function deleteFile(key: string): Promise<void> {
  try {
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
}

// List files in a directory
export async function listFiles(prefix: string): Promise<string[]> {
  try {
    const params = {
      Bucket: bucketName,
      Prefix: prefix
    };
    
    const command = new ListObjectsV2Command(params);
    const response = await s3Client.send(command);
    
    return (response.Contents || []).map(item => item.Key || '');
  } catch (error) {
    console.error('Error listing files in S3:', error);
    throw error;
  }
}

// Check S3 connection
export async function checkS3Connection(): Promise<boolean> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1
    });
    
    await s3Client.send(command);
    console.log('S3 connection successful');
    return true;
  } catch (error) {
    console.error('S3 connection failed:', error);
    return false;
  }
}
