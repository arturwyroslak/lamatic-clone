import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface PipedriveConfig extends ConnectionConfig {
  apiToken: string
  companyDomain: string
}

export class PipedriveConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'pipedrive'
  public readonly name = 'Pipedrive'
  public readonly description = 'Sales CRM with deals, activities, contacts, and pipeline management'
  public readonly category = 'crm'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiToken',
        label: 'API Token',
        type: 'password' as const,
        required: true,
        description: 'Pipedrive API token'
      },
      {
        key: 'companyDomain',
        label: 'Company Domain',
        type: 'text' as const,
        required: true,
        description: 'Your Pipedrive company domain (e.g., "company-name")'
      }
    ]
  }

  async validateConnection(config: PipedriveConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`https://${config.companyDomain}.pipedrive.com/api/v1/users/me?api_token=${config.apiToken}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        return { valid: false, error: 'Invalid Pipedrive credentials' }
      }

      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      }
    }
  }

  async execute(input: any, config: PipedriveConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const baseUrl = `https://${config.companyDomain}.pipedrive.com/api/v1`

      let result
      switch (operation) {
        case 'getDeals':
          result = await this.getDeals(params, baseUrl, config.apiToken)
          break
        case 'getDeal':
          result = await this.getDeal(params, baseUrl, config.apiToken)
          break
        case 'createDeal':
          result = await this.createDeal(params, baseUrl, config.apiToken)
          break
        case 'updateDeal':
          result = await this.updateDeal(params, baseUrl, config.apiToken)
          break
        case 'deleteDeal':
          result = await this.deleteDeal(params, baseUrl, config.apiToken)
          break
        case 'getPersons':
          result = await this.getPersons(params, baseUrl, config.apiToken)
          break
        case 'getPerson':
          result = await this.getPerson(params, baseUrl, config.apiToken)
          break
        case 'createPerson':
          result = await this.createPerson(params, baseUrl, config.apiToken)
          break
        case 'updatePerson':
          result = await this.updatePerson(params, baseUrl, config.apiToken)
          break
        case 'getOrganizations':
          result = await this.getOrganizations(params, baseUrl, config.apiToken)
          break
        case 'createOrganization':
          result = await this.createOrganization(params, baseUrl, config.apiToken)
          break
        case 'getActivities':
          result = await this.getActivities(params, baseUrl, config.apiToken)
          break
        case 'createActivity':
          result = await this.createActivity(params, baseUrl, config.apiToken)
          break
        case 'getPipelines':
          result = await this.getPipelines(params, baseUrl, config.apiToken)
          break
        case 'getStages':
          result = await this.getStages(params, baseUrl, config.apiToken)
          break
        case 'getProducts':
          result = await this.getProducts(params, baseUrl, config.apiToken)
          break
        case 'createProduct':
          result = await this.createProduct(params, baseUrl, config.apiToken)
          break
        case 'getNotes':
          result = await this.getNotes(params, baseUrl, config.apiToken)
          break
        case 'createNote':
          result = await this.createNote(params, baseUrl, config.apiToken)
          break
        case 'getFiles':
          result = await this.getFiles(params, baseUrl, config.apiToken)
          break
        case 'uploadFile':
          result = await this.uploadFile(params, baseUrl, config.apiToken)
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

  private async makeRequest(endpoint: string, method: string, apiToken: string, data?: any): Promise<any> {
    const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}api_token=${apiToken}`
    const options: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    return await response.json()
  }

  private async getDeals(params: any, baseUrl: string, apiToken: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.filter_id) queryParams.append('filter_id', params.filter_id.toString())
    if (params.user_id) queryParams.append('user_id', params.user_id.toString())
    if (params.stage_id) queryParams.append('stage_id', params.stage_id.toString())
    if (params.status) queryParams.append('status', params.status)
    if (params.start) queryParams.append('start', params.start.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.sort) queryParams.append('sort', params.sort)
    if (params.owned_by_you !== undefined) queryParams.append('owned_by_you', params.owned_by_you ? '1' : '0')

    return await this.makeRequest(`${baseUrl}/deals?${queryParams}`, 'GET', apiToken)
  }

  private async getDeal(params: any, baseUrl: string, apiToken: string): Promise<any> {
    return await this.makeRequest(`${baseUrl}/deals/${params.dealId}`, 'GET', apiToken)
  }

  private async createDeal(params: any, baseUrl: string, apiToken: string): Promise<any> {
    return await this.makeRequest(`${baseUrl}/deals`, 'POST', apiToken, {
      title: params.title,
      value: params.value,
      currency: params.currency,
      user_id: params.user_id,
      person_id: params.person_id,
      org_id: params.org_id,
      stage_id: params.stage_id,
      status: params.status,
      expected_close_date: params.expected_close_date,
      probability: params.probability,
      lost_reason: params.lost_reason,
      visible_to: params.visible_to,
      add_time: params.add_time,
      pipeline_id: params.pipeline_id,
      won_time: params.won_time,
      lost_time: params.lost_time,
      close_time: params.close_time,
      label: params.label
    })
  }

  private async updateDeal(params: any, baseUrl: string, apiToken: string): Promise<any> {
    return await this.makeRequest(`${baseUrl}/deals/${params.dealId}`, 'PUT', apiToken, params.updates)
  }

  private async deleteDeal(params: any, baseUrl: string, apiToken: string): Promise<any> {
    return await this.makeRequest(`${baseUrl}/deals/${params.dealId}`, 'DELETE', apiToken)
  }

  private async getPersons(params: any, baseUrl: string, apiToken: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.filter_id) queryParams.append('filter_id', params.filter_id.toString())
    if (params.first_char) queryParams.append('first_char', params.first_char)
    if (params.start) queryParams.append('start', params.start.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.sort) queryParams.append('sort', params.sort)

    return await this.makeRequest(`${baseUrl}/persons?${queryParams}`, 'GET', apiToken)
  }

  private async getPerson(params: any, baseUrl: string, apiToken: string): Promise<any> {
    return await this.makeRequest(`${baseUrl}/persons/${params.personId}`, 'GET', apiToken)
  }

  private async createPerson(params: any, baseUrl: string, apiToken: string): Promise<any> {
    return await this.makeRequest(`${baseUrl}/persons`, 'POST', apiToken, {
      name: params.name,
      owner_id: params.owner_id,
      org_id: params.org_id,
      email: params.email,
      phone: params.phone,
      visible_to: params.visible_to,
      add_time: params.add_time,
      label: params.label
    })
  }

  private async updatePerson(params: any, baseUrl: string, apiToken: string): Promise<any> {
    return await this.makeRequest(`${baseUrl}/persons/${params.personId}`, 'PUT', apiToken, params.updates)
  }

  private async getOrganizations(params: any, baseUrl: string, apiToken: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.user_id) queryParams.append('user_id', params.user_id.toString())
    if (params.filter_id) queryParams.append('filter_id', params.filter_id.toString())
    if (params.first_char) queryParams.append('first_char', params.first_char)
    if (params.start) queryParams.append('start', params.start.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.sort) queryParams.append('sort', params.sort)

    return await this.makeRequest(`${baseUrl}/organizations?${queryParams}`, 'GET', apiToken)
  }

  private async createOrganization(params: any, baseUrl: string, apiToken: string): Promise<any> {
    return await this.makeRequest(`${baseUrl}/organizations`, 'POST', apiToken, {
      name: params.name,
      owner_id: params.owner_id,
      visible_to: params.visible_to,
      add_time: params.add_time,
      label: params.label
    })
  }

  private async getActivities(params: any, baseUrl: string, apiToken: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.user_id) queryParams.append('user_id', params.user_id.toString())
    if (params.filter_id) queryParams.append('filter_id', params.filter_id.toString())
    if (params.type) queryParams.append('type', params.type)
    if (params.start) queryParams.append('start', params.start.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.start_date) queryParams.append('start_date', params.start_date)
    if (params.end_date) queryParams.append('end_date', params.end_date)
    if (params.done !== undefined) queryParams.append('done', params.done ? '1' : '0')

    return await this.makeRequest(`${baseUrl}/activities?${queryParams}`, 'GET', apiToken)
  }

  private async createActivity(params: any, baseUrl: string, apiToken: string): Promise<any> {
    return await this.makeRequest(`${baseUrl}/activities`, 'POST', apiToken, {
      subject: params.subject,
      done: params.done,
      type: params.type,
      due_date: params.due_date,
      due_time: params.due_time,
      duration: params.duration,
      user_id: params.user_id,
      deal_id: params.deal_id,
      person_id: params.person_id,
      org_id: params.org_id,
      location: params.location,
      public_description: params.public_description,
      note: params.note,
      participants: params.participants,
      busy_flag: params.busy_flag,
      attendees: params.attendees
    })
  }

  private async getPipelines(params: any, baseUrl: string, apiToken: string): Promise<any> {
    return await this.makeRequest(`${baseUrl}/pipelines`, 'GET', apiToken)
  }

  private async getStages(params: any, baseUrl: string, apiToken: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.pipeline_id) queryParams.append('pipeline_id', params.pipeline_id.toString())

    return await this.makeRequest(`${baseUrl}/stages?${queryParams}`, 'GET', apiToken)
  }

  private async getProducts(params: any, baseUrl: string, apiToken: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.user_id) queryParams.append('user_id', params.user_id.toString())
    if (params.filter_id) queryParams.append('filter_id', params.filter_id.toString())
    if (params.first_char) queryParams.append('first_char', params.first_char)
    if (params.start) queryParams.append('start', params.start.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())

    return await this.makeRequest(`${baseUrl}/products?${queryParams}`, 'GET', apiToken)
  }

  private async createProduct(params: any, baseUrl: string, apiToken: string): Promise<any> {
    return await this.makeRequest(`${baseUrl}/products`, 'POST', apiToken, {
      name: params.name,
      code: params.code,
      unit: params.unit,
      tax: params.tax,
      active_flag: params.active_flag,
      selectable: params.selectable,
      first_char: params.first_char,
      visible_to: params.visible_to,
      owner_id: params.owner_id,
      prices: params.prices
    })
  }

  private async getNotes(params: any, baseUrl: string, apiToken: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.user_id) queryParams.append('user_id', params.user_id.toString())
    if (params.deal_id) queryParams.append('deal_id', params.deal_id.toString())
    if (params.person_id) queryParams.append('person_id', params.person_id.toString())
    if (params.org_id) queryParams.append('org_id', params.org_id.toString())
    if (params.start) queryParams.append('start', params.start.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.sort) queryParams.append('sort', params.sort)
    if (params.start_date) queryParams.append('start_date', params.start_date)
    if (params.end_date) queryParams.append('end_date', params.end_date)
    if (params.pinned_to_deal_flag !== undefined) queryParams.append('pinned_to_deal_flag', params.pinned_to_deal_flag ? '1' : '0')
    if (params.pinned_to_person_flag !== undefined) queryParams.append('pinned_to_person_flag', params.pinned_to_person_flag ? '1' : '0')
    if (params.pinned_to_organization_flag !== undefined) queryParams.append('pinned_to_organization_flag', params.pinned_to_organization_flag ? '1' : '0')

    return await this.makeRequest(`${baseUrl}/notes?${queryParams}`, 'GET', apiToken)
  }

  private async createNote(params: any, baseUrl: string, apiToken: string): Promise<any> {
    return await this.makeRequest(`${baseUrl}/notes`, 'POST', apiToken, {
      content: params.content,
      user_id: params.user_id,
      deal_id: params.deal_id,
      person_id: params.person_id,
      org_id: params.org_id,
      add_time: params.add_time,
      pinned_to_deal_flag: params.pinned_to_deal_flag,
      pinned_to_person_flag: params.pinned_to_person_flag,
      pinned_to_organization_flag: params.pinned_to_organization_flag
    })
  }

  private async getFiles(params: any, baseUrl: string, apiToken: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.start) queryParams.append('start', params.start.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.include_deleted_files !== undefined) queryParams.append('include_deleted_files', params.include_deleted_files ? '1' : '0')
    if (params.sort) queryParams.append('sort', params.sort)

    return await this.makeRequest(`${baseUrl}/files?${queryParams}`, 'GET', apiToken)
  }

  private async uploadFile(params: any, baseUrl: string, apiToken: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', params.file)
    if (params.deal_id) formData.append('deal_id', params.deal_id.toString())
    if (params.person_id) formData.append('person_id', params.person_id.toString())
    if (params.org_id) formData.append('org_id', params.org_id.toString())
    if (params.product_id) formData.append('product_id', params.product_id.toString())
    if (params.activity_id) formData.append('activity_id', params.activity_id.toString())

    const url = `${baseUrl}/files?api_token=${apiToken}`
    const response = await fetch(url, {
      method: 'POST',
      body: formData
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
        requestsPerMinute: 600,
        requestsPerDay: 100000
      },
      crmFeatures: {
        supportsDeals: true,
        supportsContacts: true,
        supportsOrganizations: true,
        supportsActivities: true,
        supportsPipelines: true,
        supportsProducts: true,
        supportsNotes: true,
        supportsFiles: true,
        supportsReporting: true,
        supportsAutomation: true,
        maxDeals: 'unlimited',
        maxContacts: 'unlimited',
        supportedCurrencies: 130
      }
    }
  }
}