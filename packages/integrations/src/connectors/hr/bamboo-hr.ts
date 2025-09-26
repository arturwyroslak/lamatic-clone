import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface BambooHRConfig extends ConnectionConfig {
  apiKey: string
  subdomain: string
}

export class BambooHRConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'bamboo-hr'
  public readonly name = 'BambooHR'
  public readonly description = 'Complete HR management with employees, time-off, performance, and organizational charts'
  public readonly category = 'hr'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'BambooHR API key'
      },
      {
        key: 'subdomain',
        label: 'Subdomain',
        type: 'text' as const,
        required: true,
        description: 'Your BambooHR subdomain (e.g., "company" for company.bamboohr.com)'
      }
    ]
  }

  async validateConnection(config: BambooHRConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`https://api.bamboohr.com/api/gateway.php/${config.subdomain}/v1/employees/directory`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${config.apiKey}:x`).toString('base64')}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        return { valid: false, error: 'Invalid BambooHR credentials' }
      }

      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      }
    }
  }

  async execute(input: any, config: BambooHRConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const baseUrl = `https://api.bamboohr.com/api/gateway.php/${config.subdomain}/v1`

      const headers = {
        'Authorization': `Basic ${Buffer.from(`${config.apiKey}:x`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      let result
      switch (operation) {
        case 'getEmployees':
          result = await this.getEmployees(params, headers, baseUrl)
          break
        case 'getEmployee':
          result = await this.getEmployee(params, headers, baseUrl)
          break
        case 'createEmployee':
          result = await this.createEmployee(params, headers, baseUrl)
          break
        case 'updateEmployee':
          result = await this.updateEmployee(params, headers, baseUrl)
          break
        case 'getTimeOffRequests':
          result = await this.getTimeOffRequests(params, headers, baseUrl)
          break
        case 'createTimeOffRequest':
          result = await this.createTimeOffRequest(params, headers, baseUrl)
          break
        case 'approveTimeOffRequest':
          result = await this.approveTimeOffRequest(params, headers, baseUrl)
          break
        case 'getCompanyReport':
          result = await this.getCompanyReport(params, headers, baseUrl)
          break
        case 'getFields':
          result = await this.getFields(params, headers, baseUrl)
          break
        case 'getFiles':
          result = await this.getFiles(params, headers, baseUrl)
          break
        case 'uploadFile':
          result = await this.uploadFile(params, headers, baseUrl)
          break
        case 'getJobInfo':
          result = await this.getJobInfo(params, headers, baseUrl)
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

  private async getEmployees(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/employees/directory`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async getEmployee(params: any, headers: any, baseUrl: string): Promise<any> {
    const fields = params.fields ? `?fields=${params.fields.join(',')}` : ''
    const response = await fetch(`${baseUrl}/employees/${params.employeeId}${fields}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createEmployee(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        jobTitle: params.jobTitle,
        department: params.department,
        division: params.division,
        location: params.location,
        workPhone: params.workPhone,
        mobilePhone: params.mobilePhone,
        address1: params.address1,
        address2: params.address2,
        city: params.city,
        state: params.state,
        zipcode: params.zipcode,
        country: params.country,
        dateOfBirth: params.dateOfBirth,
        hireDate: params.hireDate,
        employeeNumber: params.employeeNumber,
        supervisorId: params.supervisorId,
        payRate: params.payRate,
        payType: params.payType,
        paySchedule: params.paySchedule,
        exempt: params.exempt,
        standardHoursPerWeek: params.standardHoursPerWeek
      })
    })
    return await response.json()
  }

  private async updateEmployee(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/employees/${params.employeeId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params.updates)
    })
    return await response.json()
  }

  private async getTimeOffRequests(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.start) queryParams.append('start', params.start)
    if (params.end) queryParams.append('end', params.end)
    if (params.employeeId) queryParams.append('employeeId', params.employeeId.toString())
    if (params.action) queryParams.append('action', params.action)
    if (params.status) queryParams.append('status', params.status)

    const response = await fetch(`${baseUrl}/time_off/requests?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createTimeOffRequest(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/employees/${params.employeeId}/time_off/request`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        start: params.start,
        end: params.end,
        timeOffTypeId: params.timeOffTypeId,
        amount: params.amount,
        notes: params.notes,
        previousRequest: params.previousRequest
      })
    })
    return await response.json()
  }

  private async approveTimeOffRequest(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/time_off/requests/${params.requestId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        status: params.status, // 'approved', 'denied', 'canceled'
        note: params.note
      })
    })
    return await response.json()
  }

  private async getCompanyReport(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/reports/${params.reportId}?format=${params.format || 'JSON'}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async getFields(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/meta/fields`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async getFiles(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/employees/${params.employeeId}/files/view/`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async uploadFile(params: any, headers: any, baseUrl: string): Promise<any> {
    const formData = new FormData()
    formData.append('file', params.file)
    formData.append('fileName', params.fileName)
    formData.append('category', params.category)
    if (params.shareWithEmployee) formData.append('shareWithEmployee', params.shareWithEmployee)

    const uploadHeaders = {
      'Authorization': headers.Authorization
    }

    const response = await fetch(`${baseUrl}/employees/${params.employeeId}/files`, {
      method: 'POST',
      headers: uploadHeaders,
      body: formData
    })
    return await response.json()
  }

  private async getJobInfo(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/employees/${params.employeeId}/tables/jobInfo`, {
      method: 'GET',
      headers
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
        requestsPerMinute: 1000,
        requestsPerDay: 10000
      },
      hrFeatures: {
        supportsEmployeeManagement: true,
        supportsTimeOff: true,
        supportsPerformanceReviews: true,
        supportsReporting: true,
        supportsFileManagement: true,
        supportsPayroll: true,
        maxEmployees: 50000,
        supportedCountries: ['US', 'CA', 'UK', 'AU']
      }
    }
  }
}