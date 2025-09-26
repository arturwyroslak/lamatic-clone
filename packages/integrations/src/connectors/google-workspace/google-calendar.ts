import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface GoogleCalendarConfig extends ConnectionConfig {
  accessToken: string
  refreshToken?: string
}

export class GoogleCalendarConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'google-calendar'
  public readonly name = 'Google Calendar'
  public readonly description = 'Connect to Google Calendar for event management and scheduling'
  public readonly category = 'google-workspace'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password' as const,
        required: true,
        description: 'OAuth 2.0 access token for Google Calendar API'
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

  async validateConnection(config: GoogleCalendarConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Google Calendar API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: GoogleCalendarConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const headers = {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }

      switch (operation) {
        case 'getCalendars': {
          const { maxResults = 250, showDeleted = false, showHidden = false } = params

          const queryParams = new URLSearchParams({
            maxResults: maxResults.toString(),
            showDeleted: showDeleted.toString(),
            showHidden: showHidden.toString()
          })

          const response = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            calendars: result.items,
            nextPageToken: result.nextPageToken
          }
        }

        case 'getCalendar': {
          const { calendarId = 'primary' } = params

          const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            calendar: result
          }
        }

        case 'createCalendar': {
          const { summary, description, timeZone, location } = params

          if (!summary) {
            throw new Error('Calendar summary is required')
          }

          const calendarData: any = { summary }
          if (description) calendarData.description = description
          if (timeZone) calendarData.timeZone = timeZone
          if (location) calendarData.location = location

          const response = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
            method: 'POST',
            headers,
            body: JSON.stringify(calendarData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            calendar: result
          }
        }

        case 'getEvents': {
          const { 
            calendarId = 'primary',
            timeMin,
            timeMax,
            q,
            maxResults = 250,
            orderBy = 'startTime',
            singleEvents = true,
            showDeleted = false
          } = params

          const queryParams = new URLSearchParams({
            maxResults: maxResults.toString(),
            orderBy,
            singleEvents: singleEvents.toString(),
            showDeleted: showDeleted.toString()
          })

          if (timeMin) queryParams.append('timeMin', timeMin)
          if (timeMax) queryParams.append('timeMax', timeMax)
          if (q) queryParams.append('q', q)

          const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${queryParams.toString()}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            events: result.items,
            nextPageToken: result.nextPageToken
          }
        }

        case 'getEvent': {
          const { calendarId = 'primary', eventId } = params

          if (!eventId) {
            throw new Error('Event ID is required')
          }

          const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
            method: 'GET',
            headers
          })

          if (!response.ok) {
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            event: result
          }
        }

        case 'createEvent': {
          const { 
            calendarId = 'primary',
            summary,
            description,
            start,
            end,
            location,
            attendees,
            reminders,
            recurrence
          } = params

          if (!summary || !start || !end) {
            throw new Error('Event summary, start, and end are required')
          }

          const eventData: any = {
            summary,
            start,
            end
          }

          if (description) eventData.description = description
          if (location) eventData.location = location
          if (attendees) eventData.attendees = attendees
          if (reminders) eventData.reminders = reminders
          if (recurrence) eventData.recurrence = recurrence

          const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
            method: 'POST',
            headers,
            body: JSON.stringify(eventData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            event: result
          }
        }

        case 'updateEvent': {
          const { 
            calendarId = 'primary',
            eventId,
            summary,
            description,
            start,
            end,
            location,
            attendees,
            reminders
          } = params

          if (!eventId) {
            throw new Error('Event ID is required')
          }

          const eventData: any = {}
          if (summary) eventData.summary = summary
          if (description) eventData.description = description
          if (start) eventData.start = start
          if (end) eventData.end = end
          if (location) eventData.location = location
          if (attendees) eventData.attendees = attendees
          if (reminders) eventData.reminders = reminders

          const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(eventData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            event: result
          }
        }

        case 'deleteEvent': {
          const { calendarId = 'primary', eventId } = params

          if (!eventId) {
            throw new Error('Event ID is required')
          }

          const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
            method: 'DELETE',
            headers
          })

          if (!response.ok) {
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText}`)
          }

          return {
            success: true,
            message: 'Event deleted successfully'
          }
        }

        case 'getFreeBusy': {
          const { timeMin, timeMax, items } = params

          if (!timeMin || !timeMax || !items) {
            throw new Error('Time min, time max, and items are required')
          }

          const requestBody = {
            timeMin,
            timeMax,
            items
          }

          const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Google Calendar API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            calendars: result.calendars
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
      supportsFiles: false,
      maxConcurrency: 10,
      rateLimits: {
        requestsPerMinute: 250,
        requestsPerHour: 1000000
      },
      operations: [
        'getCalendars',
        'getCalendar',
        'createCalendar',
        'getEvents',
        'getEvent',
        'createEvent',
        'updateEvent',
        'deleteEvent',
        'getFreeBusy'
      ]
    }
  }
}