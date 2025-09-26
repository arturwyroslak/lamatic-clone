import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface GoogleDriveConfig extends ConnectionConfig {
  accessToken: string
  refreshToken?: string
}

export class GoogleDriveConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'google-drive'
  public readonly name = 'Google Drive'
  public readonly description = 'Connect to Google Drive for file storage and management'
  public readonly category = 'google-workspace'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'OAuth 2.0 access token for Google Drive API'
      },
      {
        key: 'refreshToken',
        label: 'Refresh Token',
        type: 'password' as const,
        required: false,
        description: 'OAuth 2.0 refresh token (optional)'
      }
    ]
  }

  async validateConnection(config: GoogleDriveConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Google Drive API error: ${response.status} ${response.statusText}`
        }
      }

      return { valid: true }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown connection error'
      }
    }
  }

  async execute(input: any, config: GoogleDriveConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'listFiles': {
          const { 
            q, 
            pageSize = 10, 
            pageToken, 
            orderBy, 
            fields = 'nextPageToken, files(id, name, mimeType, size, modifiedTime)',
            spaces = 'drive'
          } = params

          const queryParams = new URLSearchParams({
            pageSize: pageSize.toString(),
            fields,
            spaces
          })

          if (q) queryParams.append('q', q)
          if (pageToken) queryParams.append('pageToken', pageToken)
          if (orderBy) queryParams.append('orderBy', orderBy)

          const response = await fetch(`https://www.googleapis.com/drive/v3/files?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Google Drive API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            files: result.files,
            nextPageToken: result.nextPageToken
          }
        }

        case 'getFile': {
          const { fileId, fields = 'id, name, mimeType, size, modifiedTime, webViewLink, webContentLink' } = params

          if (!fileId) {
            throw new Error('File ID is required')
          }

          const queryParams = new URLSearchParams({ fields })
          const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Google Drive API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            file: result
          }
        }

        case 'downloadFile': {
          const { fileId } = params

          if (!fileId) {
            throw new Error('File ID is required')
          }

          const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${config.accessToken}`
            }
          })

          if (!response.ok) {
            throw new Error(`Google Drive API error: ${response.status} ${response.statusText}`)
          }

          const content = await response.arrayBuffer()
          return {
            success: true,
            data: {
              content: Buffer.from(content).toString('base64'),
              size: content.byteLength
            }
          }
        }

        case 'createFile': {
          const { name, parents, mimeType, content } = params

          if (!name) {
            throw new Error('File name is required')
          }

          const metadata = {
            name,
            parents: parents || [],
            mimeType
          }

          let response
          if (content) {
            // Upload with content
            const boundary = '-------314159265358979323846'
            const delimiter = `\r\n--${boundary}\r\n`
            const close_delim = `\r\n--${boundary}--`

            const metadataString = JSON.stringify(metadata)
            const multipartRequestBody = 
              delimiter +
              'Content-Type: application/json\r\n\r\n' +
              metadataString +
              delimiter +
              `Content-Type: ${mimeType || 'application/octet-stream'}\r\n\r\n` +
              content +
              close_delim

            response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': `multipart/related; boundary="${boundary}"`
              },
              body: multipartRequestBody
            })
          } else {
            // Create empty file
            response = await fetch('https://www.googleapis.com/drive/v3/files', {
              method: 'POST',
              headers,
              body: JSON.stringify(metadata)
            })
          }

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            file: result
          }
        }

        case 'updateFile': {
          const { fileId, name, content, mimeType } = params

          if (!fileId) {
            throw new Error('File ID is required')
          }

          if (content) {
            // Update with content
            const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': mimeType || 'application/octet-stream'
              },
              body: content
            })

            if (!response.ok) {
              throw new Error(`Google Drive API error: ${response.status} ${response.statusText}`)
            }

            const result = await response.json()
            return {
              success: true,
              data: result,
              file: result
            }
          } else if (name) {
            // Update metadata only
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
              method: 'PATCH',
              headers,
              body: JSON.stringify({ name })
            })

            if (!response.ok) {
              throw new Error(`Google Drive API error: ${response.status} ${response.statusText}`)
            }

            const result = await response.json()
            return {
              success: true,
              data: result,
              file: result
            }
          } else {
            throw new Error('Either name or content must be provided for update')
          }
        }

        case 'deleteFile': {
          const { fileId } = params

          if (!fileId) {
            throw new Error('File ID is required')
          }

          const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${config.accessToken}`
            }
          })

          if (!response.ok) {
            throw new Error(`Google Drive API error: ${response.status} ${response.statusText}`)
          }

          return {
            success: true,
            message: 'File deleted successfully'
          }
        }

        case 'createFolder': {
          const { name, parents } = params

          if (!name) {
            throw new Error('Folder name is required')
          }

          const metadata = {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parents || []
          }

          const response = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers,
            body: JSON.stringify(metadata)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            folder: result
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
      supportsBatch: true,
      supportsStreaming: false,
      supportsFiles: true,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 1000,
        requestsPerHour: 10000
      },
      operations: [
        'listFiles',
        'getFile',
        'downloadFile',
        'createFile',
        'updateFile',
        'deleteFile',
        'createFolder'
      ]
    }
  }
}