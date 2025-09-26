import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface DropboxConfig extends ConnectionConfig {
  accessToken: string
}

export class DropboxConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'dropbox'
  public readonly name = 'Dropbox Business'
  public readonly description = 'File storage and collaboration with team folders, sharing, and advanced admin features'
  public readonly category = 'storage'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'Dropbox API access token'
      }
    ]
  }

  async validateConnection(config: DropboxConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })

      if (!response.ok) {
        return { valid: false, error: 'Invalid Dropbox access token' }
      }

      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      }
    }
  }

  async execute(input: any, config: DropboxConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }

      let result
      switch (operation) {
        case 'listFolder':
          result = await this.listFolder(params, headers)
          break
        case 'createFolderV2':
          result = await this.createFolderV2(params, headers)
          break
        case 'uploadFile':
          result = await this.uploadFile(params, headers)
          break
        case 'downloadFile':
          result = await this.downloadFile(params, headers)
          break
        case 'getMetadata':
          result = await this.getMetadata(params, headers)
          break
        case 'moveV2':
          result = await this.moveV2(params, headers)
          break
        case 'copyV2':
          result = await this.copyV2(params, headers)
          break
        case 'deleteV2':
          result = await this.deleteV2(params, headers)
          break
        case 'createSharedLinkWithSettings':
          result = await this.createSharedLinkWithSettings(params, headers)
          break
        case 'listSharedLinks':
          result = await this.listSharedLinks(params, headers)
          break
        case 'revokeSharedLink':
          result = await this.revokeSharedLink(params, headers)
          break
        case 'searchV2':
          result = await this.searchV2(params, headers)
          break
        case 'getSpaceUsage':
          result = await this.getSpaceUsage(params, headers)
          break
        default:
          throw new Error(`Unsupported operation: ${operation}`)
      }

      return {
        success: true,
        data: result,
        operation: operation,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  private async listFolder(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        path: params.path || '',
        recursive: params.recursive || false,
        include_media_info: params.include_media_info || false,
        include_deleted: params.include_deleted || false,
        include_has_explicit_shared_members: params.include_has_explicit_shared_members || false,
        include_mounted_folders: params.include_mounted_folders || true,
        limit: params.limit || 2000,
        shared_link: params.shared_link,
        include_property_groups: params.include_property_groups
      })
    })
    return await response.json()
  }

  private async createFolderV2(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.dropboxapi.com/2/files/create_folder_v2', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        path: params.path,
        autorename: params.autorename || false
      })
    })
    return await response.json()
  }

  private async uploadFile(params: any, headers: any): Promise<any> {
    const uploadHeaders = {
      'Authorization': headers.Authorization,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: params.path,
        mode: params.mode || 'add',
        autorename: params.autorename || false,
        client_modified: params.client_modified,
        mute: params.mute || false,
        property_groups: params.property_groups,
        strict_conflict: params.strict_conflict || false
      })
    }

    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: uploadHeaders,
      body: params.file
    })
    return await response.json()
  }

  private async downloadFile(params: any, headers: any): Promise<any> {
    const downloadHeaders = {
      'Authorization': headers.Authorization,
      'Dropbox-API-Arg': JSON.stringify({
        path: params.path
      })
    }

    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: downloadHeaders
    })

    return {
      content: await response.arrayBuffer(),
      metadata: JSON.parse(response.headers.get('Dropbox-API-Result') || '{}')
    }
  }

  private async getMetadata(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.dropboxapi.com/2/files/get_metadata', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        path: params.path,
        include_media_info: params.include_media_info || false,
        include_deleted: params.include_deleted || false,
        include_has_explicit_shared_members: params.include_has_explicit_shared_members || false
      })
    })
    return await response.json()
  }

  private async moveV2(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.dropboxapi.com/2/files/move_v2', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from_path: params.from_path,
        to_path: params.to_path,
        allow_shared_folder: params.allow_shared_folder || false,
        autorename: params.autorename || false,
        allow_ownership_transfer: params.allow_ownership_transfer || false
      })
    })
    return await response.json()
  }

  private async copyV2(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.dropboxapi.com/2/files/copy_v2', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from_path: params.from_path,
        to_path: params.to_path,
        allow_shared_folder: params.allow_shared_folder || false,
        autorename: params.autorename || false,
        allow_ownership_transfer: params.allow_ownership_transfer || false
      })
    })
    return await response.json()
  }

  private async deleteV2(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        path: params.path,
        parent_rev: params.parent_rev
      })
    })
    return await response.json()
  }

  private async createSharedLinkWithSettings(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        path: params.path,
        settings: {
          requested_visibility: params.requested_visibility,
          link_password: params.link_password,
          expires: params.expires,
          audience: params.audience,
          access: params.access
        }
      })
    })
    return await response.json()
  }

  private async listSharedLinks(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        path: params.path,
        cursor: params.cursor,
        direct_only: params.direct_only || false
      })
    })
    return await response.json()
  }

  private async revokeSharedLink(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.dropboxapi.com/2/sharing/revoke_shared_link', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        url: params.url
      })
    })
    return await response.json()
  }

  private async searchV2(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.dropboxapi.com/2/files/search_v2', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: params.query,
        options: {
          path: params.path,
          max_results: params.max_results || 100,
          order_by: params.order_by,
          file_status: params.file_status,
          filename_only: params.filename_only || false,
          file_extensions: params.file_extensions,
          file_categories: params.file_categories
        },
        match_field_options: {
          include_highlights: params.include_highlights || false
        }
      })
    })
    return await response.json()
  }

  private async getSpaceUsage(params: any, headers: any): Promise<any> {
    const response = await fetch('https://api.dropboxapi.com/2/users/get_space_usage', {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    })
    return await response.json()
  }

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: true,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 1200,
        requestsPerDay: 1000000
      },
      storageFeatures: {
        supportsFileUpload: true,
        supportsFileDownload: true,
        supportsFileSharing: true,
        supportsFolderOperations: true,
        supportsSearch: true,
        supportsVersioning: true,
        maxFileSize: '350GB',
        maxFolderDepth: 'unlimited',
        supportedFileTypes: 'all',
        supportsCollaboration: true
      }
    }
  }
}