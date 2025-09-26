import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface ZendeskConfig extends ConnectionConfig {
  subdomain: string
  email: string
  apiToken: string
}

export class ZendeskConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'zendesk'
  public readonly name = 'Zendesk'
  public readonly description = 'Connect to Zendesk for customer support and ticket management'
  public readonly category = 'crm'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'subdomain',
        label: 'Subdomain',
        type: 'text' as const,
        required: true,
        description: 'Your Zendesk subdomain (e.g., company for company.zendesk.com)'
      },
      {
        key: 'email',
        label: 'Email',
        type: 'text' as const,
        required: true,
        description: 'Your Zendesk account email'
      },
      {
        key: 'apiToken',
        label: 'API Token',
        type: 'password' as const,
        required: true,
        description: 'Your Zendesk API token'
      }
    ]
  }

  private getAuthHeader(config: ZendeskConfig): string {
    return Buffer.from(`${config.email}/token:${config.apiToken}`).toString('base64')
  }

  async validateConnection(config: ZendeskConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`https://${config.subdomain}.zendesk.com/api/v2/users/me.json`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${this.getAuthHeader(config)}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Zendesk API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: ZendeskConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const baseUrl = `https://${config.subdomain}.zendesk.com/api/v2`
      const headers = {
        'Authorization': `Basic ${this.getAuthHeader(config)}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getTickets': {
          const { page = 1, per_page = 100, sort_by = 'created_at', sort_order = 'desc' } = params

          const queryParams = new URLSearchParams({
            page: page.toString(),
            per_page: per_page.toString(),
            sort_by,
            sort_order
          })

          const response = await fetch(`${baseUrl}/tickets.json?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Zendesk API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            tickets: result.tickets,
            nextPage: result.next_page,
            previousPage: result.previous_page,
            count: result.count
          }
        }

        case 'getTicket': {
          const { ticketId } = params

          if (!ticketId) {
            throw new Error('Ticket ID is required')
          }

          const response = await fetch(`${baseUrl}/tickets/${ticketId}.json`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Zendesk API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            ticket: result.ticket
          }
        }

        case 'createTicket': {
          const { subject, comment, requester, priority, type, tags, customFields } = params

          if (!subject || !comment) {
            throw new Error('Subject and comment are required')
          }

          const ticketData: any = {
            ticket: {
              subject,
              comment: {
                body: comment
              }
            }
          }

          if (requester) ticketData.ticket.requester = requester
          if (priority) ticketData.ticket.priority = priority
          if (type) ticketData.ticket.type = type
          if (tags) ticketData.ticket.tags = tags
          if (customFields) ticketData.ticket.custom_fields = customFields

          const response = await fetch(`${baseUrl}/tickets.json`, {
            method: 'POST',
            headers,
            body: JSON.stringify(ticketData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Zendesk API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            ticket: result.ticket
          }
        }

        case 'updateTicket': {
          const { ticketId, subject, comment, status, priority, assignee, tags } = params

          if (!ticketId) {
            throw new Error('Ticket ID is required')
          }

          const updateData: any = { ticket: {} }

          if (subject) updateData.ticket.subject = subject
          if (comment) updateData.ticket.comment = { body: comment }
          if (status) updateData.ticket.status = status
          if (priority) updateData.ticket.priority = priority
          if (assignee) updateData.ticket.assignee_id = assignee
          if (tags) updateData.ticket.tags = tags

          const response = await fetch(`${baseUrl}/tickets/${ticketId}.json`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updateData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Zendesk API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            ticket: result.ticket
          }
        }

        case 'deleteTicket': {
          const { ticketId } = params

          if (!ticketId) {
            throw new Error('Ticket ID is required')
          }

          const response = await fetch(`${baseUrl}/tickets/${ticketId}.json`, {
            method: 'DELETE',
            headers
          })

          if (!response.ok) {
            throw new Error(`Zendesk API error: ${response.status} ${response.statusText}`)
          }

          return {
            success: true,
            message: 'Ticket deleted successfully'
          }
        }

        case 'getUsers': {
          const { page = 1, per_page = 100, role } = params

          const queryParams = new URLSearchParams({
            page: page.toString(),
            per_page: per_page.toString()
          })

          if (role) queryParams.append('role', role)

          const response = await fetch(`${baseUrl}/users.json?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Zendesk API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            users: result.users,
            nextPage: result.next_page,
            previousPage: result.previous_page,
            count: result.count
          }
        }

        case 'getUser': {
          const { userId } = params

          if (!userId) {
            throw new Error('User ID is required')
          }

          const response = await fetch(`${baseUrl}/users/${userId}.json`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Zendesk API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            user: result.user
          }
        }

        case 'createUser': {
          const { name, email, role = 'end-user', verified = false } = params

          if (!name || !email) {
            throw new Error('Name and email are required')
          }

          const userData = {
            user: {
              name,
              email,
              role,
              verified
            }
          }

          const response = await fetch(`${baseUrl}/users.json`, {
            method: 'POST',
            headers,
            body: JSON.stringify(userData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Zendesk API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            user: result.user
          }
        }

        case 'searchTickets': {
          const { query, sort_by = 'created_at', sort_order = 'desc' } = params

          if (!query) {
            throw new Error('Search query is required')
          }

          const queryParams = new URLSearchParams({
            query,
            sort_by,
            sort_order
          })

          const response = await fetch(`${baseUrl}/search.json?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Zendesk API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            results: result.results,
            count: result.count
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
        requestsPerMinute: 700
      },
      operations: [
        'getTickets',
        'getTicket',
        'createTicket',
        'updateTicket',
        'deleteTicket',
        'getUsers',
        'getUser',
        'createUser',
        'searchTickets'
      ]
    }
  }
}