import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface DatadogConfig extends ConnectionConfig {
  apiKey: string
  appKey: string
  site: string
}

export class DatadogConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'datadog'
  public readonly name = 'Datadog'
  public readonly description = 'Infrastructure monitoring with metrics, logs, APM, and alerting'
  public readonly category = 'monitoring'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'Datadog API key'
      },
      {
        key: 'appKey',
        label: 'Application Key',
        type: 'password' as const,
        required: true,
        description: 'Datadog application key'
      },
      {
        key: 'site',
        label: 'Site',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'datadoghq.com', label: 'US1 (datadoghq.com)' },
          { value: 'datadoghq.eu', label: 'EU (datadoghq.eu)' },
          { value: 'us3.datadoghq.com', label: 'US3 (us3.datadoghq.com)' },
          { value: 'us5.datadoghq.com', label: 'US5 (us5.datadoghq.com)' },
          { value: 'ap1.datadoghq.com', label: 'AP1 (ap1.datadoghq.com)' }
        ],
        default: 'datadoghq.com',
        description: 'Datadog site/region'
      }
    ]
  }

  async validateConnection(config: DatadogConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`https://api.${config.site}/api/v1/validate`, {
        method: 'GET',
        headers: {
          'DD-API-KEY': config.apiKey,
          'DD-APPLICATION-KEY': config.appKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return { valid: false, error: 'Invalid Datadog credentials' }
      }

      return { valid: true }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      }
    }
  }

  async execute(input: any, config: DatadogConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const baseUrl = `https://api.${config.site}/api/v1`

      const headers = {
        'DD-API-KEY': config.apiKey,
        'DD-APPLICATION-KEY': config.appKey,
        'Content-Type': 'application/json'
      }

      let result
      switch (operation) {
        case 'submitMetrics':
          result = await this.submitMetrics(params, headers, baseUrl)
          break
        case 'queryMetrics':
          result = await this.queryMetrics(params, headers, baseUrl)
          break
        case 'createDashboard':
          result = await this.createDashboard(params, headers, baseUrl)
          break
        case 'getDashboard':
          result = await this.getDashboard(params, headers, baseUrl)
          break
        case 'listDashboards':
          result = await this.listDashboards(params, headers, baseUrl)
          break
        case 'createMonitor':
          result = await this.createMonitor(params, headers, baseUrl)
          break
        case 'getMonitor':
          result = await this.getMonitor(params, headers, baseUrl)
          break
        case 'listMonitors':
          result = await this.listMonitors(params, headers, baseUrl)
          break
        case 'muteMonitor':
          result = await this.muteMonitor(params, headers, baseUrl)
          break
        case 'unmuteMonitor':
          result = await this.unmuteMonitor(params, headers, baseUrl)
          break
        case 'searchHosts':
          result = await this.searchHosts(params, headers, baseUrl)
          break
        case 'getHostTotals':
          result = await this.getHostTotals(params, headers, baseUrl)
          break
        case 'createEvent':
          result = await this.createEvent(params, headers, baseUrl)
          break
        case 'getEvents':
          result = await this.getEvents(params, headers, baseUrl)
          break
        case 'createSLO':
          result = await this.createSLO(params, headers, baseUrl)
          break
        case 'getSLO':
          result = await this.getSLO(params, headers, baseUrl)
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

  private async submitMetrics(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/series`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        series: params.series
      })
    })
    return await response.json()
  }

  private async queryMetrics(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams({
      query: params.query,
      from: params.from.toString(),
      to: params.to.toString()
    })

    const response = await fetch(`${baseUrl}/query?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createDashboard(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/dashboard`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: params.title,
        description: params.description,
        widgets: params.widgets,
        layout_type: params.layout_type || 'ordered',
        is_read_only: params.is_read_only || false,
        notify_list: params.notify_list,
        template_variables: params.template_variables
      })
    })
    return await response.json()
  }

  private async getDashboard(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/dashboard/${params.dashboardId}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async listDashboards(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/dashboard`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createMonitor(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/monitor`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: params.type,
        query: params.query,
        name: params.name,
        message: params.message,
        tags: params.tags,
        options: params.options,
        priority: params.priority,
        multi: params.multi
      })
    })
    return await response.json()
  }

  private async getMonitor(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/monitor/${params.monitorId}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async listMonitors(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.group_states) queryParams.append('group_states', params.group_states.join(','))
    if (params.name) queryParams.append('name', params.name)
    if (params.tags) queryParams.append('tags', params.tags.join(','))
    if (params.monitor_tags) queryParams.append('monitor_tags', params.monitor_tags.join(','))

    const response = await fetch(`${baseUrl}/monitor?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async muteMonitor(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/monitor/${params.monitorId}/mute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        scope: params.scope,
        end: params.end
      })
    })
    return await response.json()
  }

  private async unmuteMonitor(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/monitor/${params.monitorId}/unmute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        scope: params.scope
      })
    })
    return await response.json()
  }

  private async searchHosts(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params.filter) queryParams.append('filter', params.filter)
    if (params.sort_field) queryParams.append('sort_field', params.sort_field)
    if (params.sort_dir) queryParams.append('sort_dir', params.sort_dir)
    if (params.start) queryParams.append('start', params.start.toString())
    if (params.count) queryParams.append('count', params.count.toString())

    const response = await fetch(`${baseUrl}/hosts?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async getHostTotals(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/hosts/totals`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createEvent(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: params.title,
        text: params.text,
        date_happened: params.date_happened,
        priority: params.priority || 'normal',
        tags: params.tags,
        alert_type: params.alert_type || 'info',
        aggregation_key: params.aggregation_key,
        source_type_name: params.source_type_name,
        host: params.host
      })
    })
    return await response.json()
  }

  private async getEvents(params: any, headers: any, baseUrl: string): Promise<any> {
    const queryParams = new URLSearchParams({
      start: params.start.toString(),
      end: params.end.toString()
    })
    if (params.priority) queryParams.append('priority', params.priority)
    if (params.sources) queryParams.append('sources', params.sources.join(','))
    if (params.tags) queryParams.append('tags', params.tags.join(','))

    const response = await fetch(`${baseUrl}/events?${queryParams}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  private async createSLO(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/slo`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: params.name,
        description: params.description,
        type: params.type,
        sli_specification: params.sli_specification,
        thresholds: params.thresholds,
        timeframe: params.timeframe,
        target_threshold: params.target_threshold,
        warning_threshold: params.warning_threshold,
        tags: params.tags
      })
    })
    return await response.json()
  }

  private async getSLO(params: any, headers: any, baseUrl: string): Promise<any> {
    const response = await fetch(`${baseUrl}/slo/${params.sloId}`, {
      method: 'GET',
      headers
    })
    return await response.json()
  }

  getCapabilities() {
    return {
      supportsBatch: true,
      supportsStreaming: false,
      supportsFiles: false,
      maxConcurrency: 20,
      rateLimits: {
        requestsPerMinute: 6000,
        requestsPerHour: 1000000
      },
      monitoringFeatures: {
        supportsMetrics: true,
        supportsLogs: true,
        supportsTraces: true,
        supportsAlerts: true,
        supportsDashboards: true,
        supportsSLOs: true,
        supportsEvents: true,
        supportsInfrastructure: true,
        maxMetricsPerRequest: 1000,
        metricRetention: '15 months'
      }
    }
  }
}