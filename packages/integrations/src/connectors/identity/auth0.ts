import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface Auth0Config extends ConnectionConfig {
  domain: string
  clientId: string
  clientSecret: string
  managementApiToken?: string
}

export class Auth0Connector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'auth0'
  public readonly name = 'Auth0'
  public readonly description = 'Identity platform with authentication, authorization, user management, and security'
  public readonly category = 'identity'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'domain',
        label: 'Domain',
        type: 'text' as const,
        required: true,
        description: 'Auth0 domain (e.g., your-tenant.auth0.com)'
      },
      {
        key: 'clientId',
        label: 'Client ID',
        type: 'text' as const,
        required: true,
        description: 'Auth0 application client ID'
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: 'password' as const,
        required: true,
        description: 'Auth0 application client secret'
      },
      {
        key: 'managementApiToken',
        label: 'Management API Token',
        type: 'password' as const,
        required: false,
        description: 'Auth0 Management API token for advanced operations'
      }
    ]
  }

  async validateConnection(config: Auth0Config): Promise<{ valid: boolean; error?: string }> {
    try {
      // Get access token for Management API
      const tokenResponse = await fetch(`https://${config.domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          audience: `https://${config.domain}/api/v2/`,
          grant_type: 'client_credentials'
        })
      })

      if (!tokenResponse.ok) {
        return { valid: false, error: 'Invalid Auth0 credentials' }
      }

      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      }
    }
  }

  async execute(input: any, config: Auth0Config, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input

      // Get Management API access token
      const tokenResponse = await fetch(`https://${config.domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          audience: `https://${config.domain}/api/v2/`,
          grant_type: 'client_credentials'
        })
      })

      const tokenData = await tokenResponse.json()
      const accessToken = config.managementApiToken || tokenData.access_token
      const baseUrl = `https://${config.domain}/api/v2`

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }

      let result
      switch (operation) {
        case 'getUsers':
          result = await this.getUsers(params, headers, baseUrl)
          break
        case 'getUser':
          result = await this.getUser(params, headers, baseUrl)
          break
        case 'createUser':
          result = await this.createUser(params, headers, baseUrl)
          break
        case 'updateUser':
          result = await this.updateUser(params, headers, baseUrl)
          break
        case 'deleteUser':
          result = await this.deleteUser(params, headers, baseUrl)
          break
        case 'getUserRoles':
          result = await this.getUserRoles(params, headers, baseUrl)
          break
        case 'assignRolesToUser':
          result = await this.assignRolesToUser(params, headers, baseUrl)
          break
        case 'removeRolesFromUser':
          result = await this.removeRolesFromUser(params, headers, baseUrl)
          break
        case 'getRoles':
          result = await this.getRoles(params, headers, baseUrl)
          break
        case 'createRole':
          result = await this.createRole(params, headers, baseUrl)
          break
        case 'getConnections':
          result = await this.getConnections(params, headers, baseUrl)
          break
        case 'createConnection':
          result = await this.createConnection(params, headers, baseUrl)
          break
        case 'getClients':
          result = await this.getClients(params, headers, baseUrl)
          break
        case 'createClient':
          result = await this.createClient(params, headers, baseUrl)
          break
        case 'getLogEvents':
          result = await this.getLogEvents(params, headers, baseUrl)
          break
        case 'getStats':
          result = await this.getStats(params, headers, baseUrl)
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

  private async getUsers(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.q) queryParams.append('q', params.q)
    if (params.search_engine) queryParams.append('search_engine', params.search_engine)
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params.include_totals) queryParams.append('include_totals', params.include_totals.toString())
    if (params.sort) queryParams.append('sort', params.sort)
    if (params.connection) queryParams.append('connection', params.connection)
    if (params.fields) queryParams.append('fields', params.fields.join(','))
    if (params.include_fields) queryParams.append('include_fields', params.include_fields.toString())

    const response = await fetch(`${baseUrl}/users?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async getUser(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.fields) queryParams.append('fields', params.fields.join(','))
    if (params.include_fields) queryParams.append('include_fields', params.include_fields.toString())

    const response = await fetch(`${baseUrl}/users/${params.userId}?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createUser(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        connection: params.connection,
        email: params.email,
        username: params.username,
        password: params.password,
        phone_number: params.phone_number,
        user_metadata: params.user_metadata,
        app_metadata: params.app_metadata,
        email_verified: params.email_verified,
        phone_verified: params.phone_verified,
        verify_email: params.verify_email,
        blocked: params.blocked,
        given_name: params.given_name,
        family_name: params.family_name,
        name: params.name,
        nickname: params.nickname,
        picture: params.picture
      })
    })
    return await response.json()
  }

  private async updateUser(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/users/${params.userId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(params.updates)
    })
    return await response.json()
  }

  private async deleteUser(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/users/${params.userId}`, {
      method: 'DELETE',
      headers
    })
    return response.status === 204 ? { success: true } : await response.json()
  }

  private async getUserRoles(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params.include_totals) queryParams.append('include_totals', params.include_totals.toString())

    const response = await fetch(`${baseUrl}/users/${params.userId}/roles?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async assignRolesToUser(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/users/${params.userId}/roles`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        roles: params.roles
      })
    })
    return response.status === 204 ? { success: true } : await response.json()
  }

  private async removeRolesFromUser(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/users/${params.userId}/roles`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({
        roles: params.roles
      })
    })
    return response.status === 204 ? { success: true } : await response.json()
  }

  private async getRoles(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params.include_totals) queryParams.append('include_totals', params.include_totals.toString())
    if (params.name_filter) queryParams.append('name_filter', params.name_filter)

    const response = await fetch(`${baseUrl}/roles?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createRole(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/roles`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: params.name,
        description: params.description
      })
    })
    return await response.json()
  }

  private async getConnections(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.strategy) queryParams.append('strategy', params.strategy.join(','))
    if (params.name) queryParams.append('name', params.name.join(','))
    if (params.fields) queryParams.append('fields', params.fields.join(','))
    if (params.include_fields) queryParams.append('include_fields', params.include_fields.toString())

    const response = await fetch(`${baseUrl}/connections?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createConnection(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/connections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: params.name,
        strategy: params.strategy,
        options: params.options,
        enabled_clients: params.enabled_clients,
        metadata: params.metadata
      })
    })
    return await response.json()
  }

  private async getClients(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.fields) queryParams.append('fields', params.fields.join(','))
    if (params.include_fields) queryParams.append('include_fields', params.include_fields.toString())
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params.include_totals) queryParams.append('include_totals', params.include_totals.toString())

    const response = await fetch(`${baseUrl}/clients?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createClient(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/clients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: params.name,
        description: params.description,
        client_id: params.client_id,
        client_secret: params.client_secret,
        app_type: params.app_type,
        logo_uri: params.logo_uri,
        is_first_party: params.is_first_party,
        oidc_conformant: params.oidc_conformant,
        callbacks: params.callbacks,
        allowed_origins: params.allowed_origins,
        web_origins: params.web_origins,
        client_aliases: params.client_aliases,
        allowed_clients: params.allowed_clients,
        allowed_logout_urls: params.allowed_logout_urls,
        jwt_configuration: params.jwt_configuration,
        signing_keys: params.signing_keys,
        sso: params.sso,
        sso_disabled: params.sso_disabled,
        cross_origin_auth: params.cross_origin_auth,
        cross_origin_loc: params.cross_origin_loc,
        custom_login_page_on: params.custom_login_page_on,
        custom_login_page: params.custom_login_page,
        custom_login_page_preview: params.custom_login_page_preview,
        form_template: params.form_template,
        addons: params.addons,
        token_endpoint_auth_method: params.token_endpoint_auth_method,
        client_metadata: params.client_metadata,
        mobile: params.mobile,
        initiate_login_uri: params.initiate_login_uri,
        native_social_login: params.native_social_login,
        refresh_token: params.refresh_token,
        organization_usage: params.organization_usage,
        organization_require_behavior: params.organization_require_behavior
      })
    })
    return await response.json()
  }

  private async getLogEvents(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.q) queryParams.append('q', params.q)
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params.sort) queryParams.append('sort', params.sort)
    if (params.fields) queryParams.append('fields', params.fields.join(','))
    if (params.include_fields) queryParams.append('include_fields', params.include_fields.toString())
    if (params.include_totals) queryParams.append('include_totals', params.include_totals.toString())
    if (params.from) queryParams.append('from', params.from)
    if (params.take) queryParams.append('take', params.take.toString())

    const response = await fetch(`${baseUrl}/logs?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async getStats(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/stats/active-users`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  getCapabilities() {
    return {
      supportsBatch: false,
      supportsStreaming: false,
      supportsFiles: false,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 1000,
        requestsPerDay: 1000000
      },
      identityFeatures: {
        supportsAuthentication: true,
        supportsAuthorization: true,
        supportsUserManagement: true,
        supportsRoleBasedAccess: true,
        supportsMultiFactorAuth: true,
        supportsSocialLogins: true,
        supportsPasswordless: true,
        supportsSAML: true,
        supportsOIDC: true,
        maxUsers: 7000,
        maxConnections: 50,
        maxApplications: 100
      }
    }
  }
}