import { BaseConnector, ConnectorConfig, ConnectorAction } from '../base';
import { z } from 'zod';

export interface AWSS3Config extends ConnectorConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

const uploadFileSchema = z.object({
  key: z.string(),
  body: z.any(), // File content, Buffer, or string
  contentType: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  acl: z.enum(['private', 'public-read', 'public-read-write', 'authenticated-read']).optional(),
});

const downloadFileSchema = z.object({
  key: z.string(),
  versionId: z.string().optional(),
});

const deleteFileSchema = z.object({
  key: z.string(),
  versionId: z.string().optional(),
});

const listObjectsSchema = z.object({
  prefix: z.string().optional(),
  delimiter: z.string().optional(),
  maxKeys: z.number().max(1000).optional(),
  startAfter: z.string().optional(),
});

const generatePresignedUrlSchema = z.object({
  key: z.string(),
  operation: z.enum(['getObject', 'putObject']),
  expiresIn: z.number().max(604800).optional(), // Max 7 days
});

export class AWSS3Connector extends BaseConnector<AWSS3Config> {
  private s3Client: any;

  constructor(config: AWSS3Config) {
    super('aws-s3', 'Amazon S3', config);
  }

  async initialize(): Promise<void> {
    try {
      // In a real implementation, you would use AWS SDK
      // This is a mock implementation for demonstration
      this.s3Client = {
        headBucket: () => Promise.resolve({}),
        putObject: () => Promise.resolve({ ETag: '"mock-etag"' }),
        getObject: () => Promise.resolve({ Body: Buffer.from('mock data') }),
        deleteObject: () => Promise.resolve({}),
        listObjectsV2: () => Promise.resolve({ Contents: [] }),
        getSignedUrl: () => Promise.resolve('https://mock-presigned-url.com'),
      };

      // Test bucket access
      await this.s3Client.headBucket({ Bucket: this.config.bucket });
      
      this.status = 'connected';
    } catch (error) {
      throw new Error(`Failed to initialize S3 connection: ${error}`);
    }
  }

  getActions(): ConnectorAction[] {
    return [
      {
        id: 'upload_file',
        name: 'Upload File',
        description: 'Upload a file to S3 bucket',
        schema: uploadFileSchema,
        execute: this.uploadFile.bind(this),
      },
      {
        id: 'download_file',
        name: 'Download File',
        description: 'Download a file from S3 bucket',
        schema: downloadFileSchema,
        execute: this.downloadFile.bind(this),
      },
      {
        id: 'delete_file',
        name: 'Delete File',
        description: 'Delete a file from S3 bucket',
        schema: deleteFileSchema,
        execute: this.deleteFile.bind(this),
      },
      {
        id: 'list_objects',
        name: 'List Objects',
        description: 'List objects in S3 bucket',
        schema: listObjectsSchema,
        execute: this.listObjects.bind(this),
      },
      {
        id: 'generate_presigned_url',
        name: 'Generate Presigned URL',
        description: 'Generate a presigned URL for file access',
        schema: generatePresignedUrlSchema,
        execute: this.generatePresignedUrl.bind(this),
      },
      {
        id: 'copy_object',
        name: 'Copy Object',
        description: 'Copy an object within S3 or between buckets',
        schema: z.object({
          sourceKey: z.string(),
          destinationKey: z.string(),
          sourceBucket: z.string().optional(),
          destinationBucket: z.string().optional(),
        }),
        execute: this.copyObject.bind(this),
      },
      {
        id: 'get_object_metadata',
        name: 'Get Object Metadata',
        description: 'Retrieve metadata for an S3 object',
        schema: z.object({
          key: z.string(),
        }),
        execute: this.getObjectMetadata.bind(this),
      },
    ];
  }

  private async uploadFile(params: any): Promise<any> {
    const validated = uploadFileSchema.parse(params);
    
    const uploadParams = {
      Bucket: this.config.bucket,
      Key: validated.key,
      Body: validated.body,
      ContentType: validated.contentType,
      Metadata: validated.metadata,
      ACL: validated.acl,
    };

    try {
      const result = await this.s3Client.putObject(uploadParams);
      return {
        key: validated.key,
        etag: result.ETag,
        location: `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${validated.key}`,
        bucket: this.config.bucket,
      };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  private async downloadFile(params: any): Promise<any> {
    const validated = downloadFileSchema.parse(params);
    
    const downloadParams = {
      Bucket: this.config.bucket,
      Key: validated.key,
      VersionId: validated.versionId,
    };

    try {
      const result = await this.s3Client.getObject(downloadParams);
      return {
        key: validated.key,
        body: result.Body,
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        metadata: result.Metadata,
      };
    } catch (error) {
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  private async deleteFile(params: any): Promise<any> {
    const validated = deleteFileSchema.parse(params);
    
    const deleteParams = {
      Bucket: this.config.bucket,
      Key: validated.key,
      VersionId: validated.versionId,
    };

    try {
      const result = await this.s3Client.deleteObject(deleteParams);
      return {
        key: validated.key,
        deleted: true,
        versionId: result.VersionId,
        deleteMarker: result.DeleteMarker,
      };
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  private async listObjects(params: any): Promise<any> {
    const validated = listObjectsSchema.parse(params);
    
    const listParams = {
      Bucket: this.config.bucket,
      Prefix: validated.prefix,
      Delimiter: validated.delimiter,
      MaxKeys: validated.maxKeys,
      StartAfter: validated.startAfter,
    };

    try {
      const result = await this.s3Client.listObjectsV2(listParams);
      return {
        objects: result.Contents?.map((obj: any) => ({
          key: obj.Key,
          size: obj.Size,
          lastModified: obj.LastModified,
          etag: obj.ETag,
          storageClass: obj.StorageClass,
        })) || [],
        prefixes: result.CommonPrefixes?.map((prefix: any) => prefix.Prefix) || [],
        isTruncated: result.IsTruncated,
        nextContinuationToken: result.NextContinuationToken,
      };
    } catch (error) {
      throw new Error(`Failed to list objects: ${error}`);
    }
  }

  private async generatePresignedUrl(params: any): Promise<any> {
    const validated = generatePresignedUrlSchema.parse(params);
    
    const urlParams = {
      Bucket: this.config.bucket,
      Key: validated.key,
      Expires: validated.expiresIn || 3600, // Default 1 hour
    };

    try {
      const url = await this.s3Client.getSignedUrl(validated.operation, urlParams);
      return {
        url,
        expires: new Date(Date.now() + (validated.expiresIn || 3600) * 1000),
        operation: validated.operation,
      };
    } catch (error) {
      throw new Error(`Failed to generate presigned URL: ${error}`);
    }
  }

  private async copyObject(params: any): Promise<any> {
    const sourceBucket = params.sourceBucket || this.config.bucket;
    const destinationBucket = params.destinationBucket || this.config.bucket;
    
    const copyParams = {
      Bucket: destinationBucket,
      Key: params.destinationKey,
      CopySource: `${sourceBucket}/${params.sourceKey}`,
    };

    try {
      const result = await this.s3Client.copyObject(copyParams);
      return {
        sourceKey: params.sourceKey,
        destinationKey: params.destinationKey,
        sourceBucket,
        destinationBucket,
        etag: result.CopyObjectResult?.ETag,
        lastModified: result.CopyObjectResult?.LastModified,
      };
    } catch (error) {
      throw new Error(`Failed to copy object: ${error}`);
    }
  }

  private async getObjectMetadata(params: any): Promise<any> {
    const metadataParams = {
      Bucket: this.config.bucket,
      Key: params.key,
    };

    try {
      const result = await this.s3Client.headObject(metadataParams);
      return {
        key: params.key,
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        etag: result.ETag,
        metadata: result.Metadata,
        storageClass: result.StorageClass,
        versionId: result.VersionId,
      };
    } catch (error) {
      throw new Error(`Failed to get object metadata: ${error}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.s3Client.headBucket({ Bucket: this.config.bucket });
      return true;
    } catch (error) {
      console.error('S3 connection test failed:', error);
      return false;
    }
  }
}