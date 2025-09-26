import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface AWSLambdaConfig extends ConnectionConfig {
  accessKeyId: string
  secretAccessKey: string
  region: string
}

export class AWSLambdaConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'aws-lambda'
  public readonly name = 'AWS Lambda'
  public readonly description = 'Connect to AWS Lambda for serverless function execution and management'
  public readonly category = 'cloud-services'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessKeyId',
        label: 'Access Key ID',
        type: 'password' as const,
        required: true,
        description: 'Your AWS access key ID'
      },
      {
        key: 'secretAccessKey',
        label: 'Secret Access Key',
        type: 'password' as const,
        required: true,
        description: 'Your AWS secret access key'
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
          { value: 'eu-central-1', label: 'Europe (Frankfurt)' }
        ],
        description: 'AWS region for Lambda functions'
      }
    ]
  }

  async validateConnection(config: AWSLambdaConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      // Simple validation - mock response for demo
      if (config.accessKeyId && config.secretAccessKey && config.region) {
        return { valid: true }
      }
      
      return {
        valid: false,
        error: 'Invalid AWS credentials'
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  async execute(input: any, config: AWSLambdaConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input

      switch (operation) {
        case 'invokeFunction': {
          const { functionName, payload = {} } = params

          if (!functionName) {
            throw new Error('Function name is required')
          }

          // Mock AWS Lambda invocation
          return {
            success: true,
            data: {
              statusCode: 200,
              executedVersion: '$LATEST',
              payload: { 
                message: 'Function executed successfully',
                input: payload,
                functionName
              }
            },
            executedVersion: '$LATEST'
          }
        }

        case 'listFunctions': {
          // Mock function list
          return {
            success: true,
            data: {
              Functions: [
                {
                  FunctionName: 'example-function',
                  Runtime: 'nodejs18.x',
                  Role: 'arn:aws:iam::123456789012:role/lambda-role',
                  Handler: 'index.handler',
                  State: 'Active'
                }
              ]
            },
            functions: []
          }
        }

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

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: true,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 1000
      },
      operations: [
        'listFunctions',
        'invokeFunction'
      ]
    }
  }
}