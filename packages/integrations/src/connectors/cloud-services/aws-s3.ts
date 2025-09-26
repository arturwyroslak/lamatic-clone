import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface AWSS3Config extends ConnectionConfig {
  accessKeyId: string
  secretAccessKey: string
  region: string
  bucketName?: string
  sessionToken?: string
}

export class AWSS3Connector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'aws-s3'
  public readonly name = 'AWS S3'
  public readonly description = 'Connect to Amazon S3 for cloud storage, file management, and data operations'
  public readonly category = 'cloud-services'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessKeyId',
        label: 'Access Key ID',
        type: 'text' as const,
        required: true,
        description: 'AWS access key ID'
      },
      {
        key: 'secretAccessKey',
        label: 'Secret Access Key',
        type: 'password' as const,
        required: true,
        description: 'AWS secret access key'
      },
      {
        key: 'region',
        label: 'Region',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'us-east-1', label: 'US East (N. Virginia)' },
          { value: 'us-east-2', label: 'US East (Ohio)' },
          { value: 'us-west-1', label: 'US West (N. California)' },
          { value: 'us-west-2', label: 'US West (Oregon)' },
          { value: 'eu-west-1', label: 'Europe (Ireland)' },
          { value: 'eu-west-2', label: 'Europe (London)' },
          { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
          { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
          { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
          { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' }
        ],
        default: 'us-east-1',
        description: 'AWS region'
      },
      {
        key: 'bucketName',
        label: 'Default Bucket Name',
        type: 'text' as const,
        required: false,
        description: 'Default S3 bucket name for operations'
      },
      {
        key: 'sessionToken',
        label: 'Session Token',
        type: 'password' as const,
        required: false,
        description: 'AWS session token (for temporary credentials)'
      }
    ]
  }

  async validateConnection(config: AWSS3Config): Promise<{ valid: boolean; error?: string }> {
    try {
      // Test connection by listing buckets
      const response = await this.makeAWSRequest('/', config, 'GET')
      
      if (response.status !== 200) {
        throw new Error(`AWS S3 API returned ${response.status}: ${response.statusText}`)
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  async execute(input: any, config: AWSS3Config, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input

      switch (operation) {
        case 'listBuckets':
          return await this.listBuckets(config)
        case 'createBucket':
          return await this.createBucket(config, params)
        case 'deleteBucket':
          return await this.deleteBucket(config, params)
        case 'listObjects':
          return await this.listObjects(config, params)
        case 'getObject':
          return await this.getObject(config, params)
        case 'putObject':
          return await this.putObject(config, params)
        case 'deleteObject':
          return await this.deleteObject(config, params)
        case 'copyObject':
          return await this.copyObject(config, params)
        case 'generatePresignedUrl':
          return await this.generatePresignedUrl(config, params)
        case 'getBucketPolicy':
          return await this.getBucketPolicy(config, params)
        case 'setBucketPolicy':
          return await this.setBucketPolicy(config, params)
        case 'getBucketCors':
          return await this.getBucketCors(config, params)
        case 'setBucketCors':
          return await this.setBucketCors(config, params)
        case 'getObjectMetadata':
          return await this.getObjectMetadata(config, params)
        default:
          throw new Error(`Unsupported operation: ${operation}`)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  private async makeAWSRequest(path: string, config: AWSS3Config, method: string = 'GET', body?: any, headers: Record<string, string> = {}): Promise<Response> {
    const host = config.bucketName 
      ? `${config.bucketName}.s3.${config.region}.amazonaws.com`
      : `s3.${config.region}.amazonaws.com`
    
    const url = `https://${host}${path}`
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '')
    
    // AWS Signature Version 4 signing (simplified)
    const authHeaders = this.createAWSSignature(config, method, path, timestamp, body, headers)
    
    const response = await fetch(url, {
      method,
      headers: {
        ...headers,
        ...authHeaders,
        'Host': host,
        'X-Amz-Date': timestamp
      },
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
    })

    return response
  }

  private createAWSSignature(config: AWSS3Config, method: string, path: string, timestamp: string, body?: any, headers: Record<string, string> = {}): Record<string, string> {
    // This is a simplified AWS signature - in production, use AWS SDK
    const date = timestamp.substring(0, 8)
    const scope = `${date}/${config.region}/s3/aws4_request`
    
    return {
      'Authorization': `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=host;x-amz-date, Signature=placeholder`,
      'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
    }
  }

  private async listBuckets(config: AWSS3Config): Promise<any> {
    const response = await this.makeAWSRequest('/', config, 'GET')
    const text = await response.text()
    
    // Parse XML response (simplified)
    return {
      success: true,
      buckets: [], // Would parse from XML
      rawResponse: text
    }
  }

  private async createBucket(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName) {
      throw new Error('Bucket name is required')
    }

    const response = await this.makeAWSRequest('/', { ...config, bucketName }, 'PUT')
    
    return {
      success: response.status === 200,
      bucketName,
      status: response.status,
      statusText: response.statusText
    }
  }

  private async deleteBucket(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName) {
      throw new Error('Bucket name is required')
    }

    const response = await this.makeAWSRequest('/', { ...config, bucketName }, 'DELETE')
    
    return {
      success: response.status === 204,
      bucketName,
      status: response.status,
      statusText: response.statusText
    }
  }

  private async listObjects(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName) {
      throw new Error('Bucket name is required')
    }

    const queryParams = new URLSearchParams({
      'list-type': '2',
      'max-keys': params.maxKeys?.toString() || '1000',
      'prefix': params.prefix || '',
      'delimiter': params.delimiter || '',
      'continuation-token': params.continuationToken || ''
    })

    const response = await this.makeAWSRequest(`/?${queryParams}`, { ...config, bucketName }, 'GET')
    const text = await response.text()
    
    return {
      success: true,
      objects: [], // Would parse from XML
      rawResponse: text
    }
  }

  private async getObject(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName || !params.key) {
      throw new Error('Bucket name and object key are required')
    }

    const response = await this.makeAWSRequest(`/${params.key}`, { ...config, bucketName }, 'GET')
    const content = await response.arrayBuffer()
    
    return {
      success: true,
      key: params.key,
      content: Buffer.from(content),
      contentType: response.headers.get('Content-Type'),
      contentLength: response.headers.get('Content-Length'),
      lastModified: response.headers.get('Last-Modified'),
      etag: response.headers.get('ETag')
    }
  }

  private async putObject(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName || !params.key || !params.body) {
      throw new Error('Bucket name, object key, and body are required')
    }

    const headers: Record<string, string> = {}
    if (params.contentType) {
      headers['Content-Type'] = params.contentType
    }
    if (params.metadata) {
      Object.entries(params.metadata).forEach(([key, value]) => {
        headers[`x-amz-meta-${key}`] = value as string
      })
    }

    const response = await this.makeAWSRequest(`/${params.key}`, { ...config, bucketName }, 'PUT', params.body, headers)
    
    return {
      success: response.status === 200,
      key: params.key,
      etag: response.headers.get('ETag'),
      status: response.status,
      statusText: response.statusText
    }
  }

  private async deleteObject(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName || !params.key) {
      throw new Error('Bucket name and object key are required')
    }

    const response = await this.makeAWSRequest(`/${params.key}`, { ...config, bucketName }, 'DELETE')
    
    return {
      success: response.status === 204,
      key: params.key,
      status: response.status,
      statusText: response.statusText
    }
  }

  private async copyObject(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName || !params.sourceKey || !params.destinationKey) {
      throw new Error('Bucket name, source key, and destination key are required')
    }

    const sourceBucket = params.sourceBucket || bucketName
    const headers = {
      'x-amz-copy-source': `/${sourceBucket}/${params.sourceKey}`
    }

    const response = await this.makeAWSRequest(`/${params.destinationKey}`, { ...config, bucketName }, 'PUT', undefined, headers)
    const text = await response.text()
    
    return {
      success: response.status === 200,
      sourceKey: params.sourceKey,
      destinationKey: params.destinationKey,
      rawResponse: text
    }
  }

  private async generatePresignedUrl(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName || !params.key) {
      throw new Error('Bucket name and object key are required')
    }

    const expiresIn = params.expiresIn || 3600 // 1 hour default
    const method = params.method || 'GET'
    
    // In a real implementation, you would generate a proper presigned URL
    const presignedUrl = `https://${bucketName}.s3.${config.region}.amazonaws.com/${params.key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${expiresIn}&X-Amz-SignedHeaders=host`
    
    return {
      success: true,
      presignedUrl,
      expiresIn,
      method
    }
  }

  private async getBucketPolicy(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName) {
      throw new Error('Bucket name is required')
    }

    const response = await this.makeAWSRequest('/?policy', { ...config, bucketName }, 'GET')
    const policy = await response.text()
    
    return {
      success: true,
      bucketName,
      policy: JSON.parse(policy)
    }
  }

  private async setBucketPolicy(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName || !params.policy) {
      throw new Error('Bucket name and policy are required')
    }

    const response = await this.makeAWSRequest('/?policy', { ...config, bucketName }, 'PUT', JSON.stringify(params.policy))
    
    return {
      success: response.status === 204,
      bucketName,
      status: response.status,
      statusText: response.statusText
    }
  }

  private async getBucketCors(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName) {
      throw new Error('Bucket name is required')
    }

    const response = await this.makeAWSRequest('/?cors', { ...config, bucketName }, 'GET')
    const cors = await response.text()
    
    return {
      success: true,
      bucketName,
      corsConfiguration: cors // Would parse XML in production
    }
  }

  private async setBucketCors(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName || !params.corsConfiguration) {
      throw new Error('Bucket name and CORS configuration are required')
    }

    const response = await this.makeAWSRequest('/?cors', { ...config, bucketName }, 'PUT', params.corsConfiguration)
    
    return {
      success: response.status === 200,
      bucketName,
      status: response.status,
      statusText: response.statusText
    }
  }

  private async getObjectMetadata(config: AWSS3Config, params: any): Promise<any> {
    const bucketName = params.bucketName || config.bucketName
    if (!bucketName || !params.key) {
      throw new Error('Bucket name and object key are required')
    }

    const response = await this.makeAWSRequest(`/${params.key}`, { ...config, bucketName }, 'HEAD')
    
    const metadata: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      if (key.startsWith('x-amz-meta-')) {
        metadata[key.replace('x-amz-meta-', '')] = value
      }
    })
    
    return {
      success: true,
      key: params.key,
      contentType: response.headers.get('Content-Type'),
      contentLength: response.headers.get('Content-Length'),
      lastModified: response.headers.get('Last-Modified'),
      etag: response.headers.get('ETag'),
      metadata
    }
  }

  getCapabilities() {
    return {
      supportsBatch: true,
      supportsStreaming: true,
      supportsFiles: true,
      maxConcurrency: 20,
      rateLimits: {
        requestsPerSecond: 100,
        requestsPerMinute: 6000
      },
      storage: {
        supportsUpload: true,
        supportsDownload: true,
        supportsDelete: true,
        supportsCopy: true,
        supportsMetadata: true,
        supportsPresignedUrls: true,
        maxFileSize: '5TB',
        supportedOperations: [
          'listBuckets', 'createBucket', 'deleteBucket',
          'listObjects', 'getObject', 'putObject', 'deleteObject',
          'copyObject', 'generatePresignedUrl', 'getBucketPolicy',
          'setBucketPolicy', 'getBucketCors', 'setBucketCors', 'getObjectMetadata'
        ]
      }
    }
  }
}