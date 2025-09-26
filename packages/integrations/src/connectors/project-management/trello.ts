import { IntegrationConnector, ConnectionConfig, ExecutionContext } from '../../types'
import { BaseConnector } from '../base'

export interface TrelloConfig extends ConnectionConfig {
  apiKey: string
  token: string
}

export class TrelloConnector extends BaseConnector implements IntegrationConnector {
  public readonly id = 'trello'
  public readonly name = 'Trello'
  public readonly description = 'Connect to Trello for visual project management with boards, lists, and cards'
  public readonly category = 'project-management'
  public readonly version = '1.0.0'
  
  public readonly config = {
    fields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password' as const,
        required: true,
        description: 'Your Trello API key'
      },
      {
        key: 'token',
        label: 'Token',
        type: 'password' as const,
        required: true,
        description: 'Your Trello authorization token'
      }
    ]
  }

  async validateConnection(config: TrelloConfig): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`https://api.trello.com/1/members/me?key=${config.apiKey}&token=${config.token}`, {
        method: 'GET'
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Trello API error: ${response.status} ${response.statusText}`
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

  async execute(input: any, config: TrelloConfig, context: ExecutionContext): Promise<any> {
    try {
      const { operation, ...params } = input
      const baseParams = `key=${config.apiKey}&token=${config.token}`

      switch (operation) {
        case 'getBoards': {
          const { memberId = 'me', filter = 'open' } = params
          const response = await fetch(`https://api.trello.com/1/members/${memberId}/boards?filter=${filter}&${baseParams}`, {
            method: 'GET'
          })

          if (!response.ok) {
            throw new Error(`Trello API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            boards: result
          }
        }

        case 'getBoard': {
          const { boardId } = params

          if (!boardId) {
            throw new Error('Board ID is required')
          }

          const response = await fetch(`https://api.trello.com/1/boards/${boardId}?${baseParams}`, {
            method: 'GET'
          })

          if (!response.ok) {
            throw new Error(`Trello API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            board: result
          }
        }

        case 'createBoard': {
          const { name, desc, defaultLabels = true, defaultLists = true } = params

          if (!name) {
            throw new Error('Board name is required')
          }

          const response = await fetch('https://api.trello.com/1/boards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name,
              desc,
              defaultLabels,
              defaultLists,
              key: config.apiKey,
              token: config.token
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Trello API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            board: result
          }
        }

        case 'getLists': {
          const { boardId, filter = 'open' } = params

          if (!boardId) {
            throw new Error('Board ID is required')
          }

          const response = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?filter=${filter}&${baseParams}`, {
            method: 'GET'
          })

          if (!response.ok) {
            throw new Error(`Trello API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            lists: result
          }
        }

        case 'createList': {
          const { name, boardId, pos = 'bottom' } = params

          if (!name || !boardId) {
            throw new Error('List name and board ID are required')
          }

          const response = await fetch('https://api.trello.com/1/lists', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name,
              idBoard: boardId,
              pos,
              key: config.apiKey,
              token: config.token
            })
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Trello API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            list: result
          }
        }

        case 'getCards': {
          const { listId, filter = 'open' } = params

          if (!listId) {
            throw new Error('List ID is required')
          }

          const response = await fetch(`https://api.trello.com/1/lists/${listId}/cards?filter=${filter}&${baseParams}`, {
            method: 'GET'
          })

          if (!response.ok) {
            throw new Error(`Trello API error: ${response.status} ${response.statusText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            cards: result
          }
        }

        case 'createCard': {
          const { name, desc, listId, pos = 'bottom', due, members, labels } = params

          if (!name || !listId) {
            throw new Error('Card name and list ID are required')
          }

          const cardData: any = {
            name,
            desc,
            idList: listId,
            pos,
            key: config.apiKey,
            token: config.token
          }

          if (due) cardData.due = due
          if (members) cardData.idMembers = members
          if (labels) cardData.idLabels = labels

          const response = await fetch('https://api.trello.com/1/cards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(cardData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Trello API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            card: result
          }
        }

        case 'updateCard': {
          const { cardId, name, desc, closed, pos, due, listId } = params

          if (!cardId) {
            throw new Error('Card ID is required')
          }

          const updateData: any = {
            key: config.apiKey,
            token: config.token
          }

          if (name !== undefined) updateData.name = name
          if (desc !== undefined) updateData.desc = desc
          if (closed !== undefined) updateData.closed = closed
          if (pos !== undefined) updateData.pos = pos
          if (due !== undefined) updateData.due = due
          if (listId !== undefined) updateData.idList = listId

          const response = await fetch(`https://api.trello.com/1/cards/${cardId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Trello API error: ${response.status} ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
          return {
            success: true,
            data: result,
            card: result
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
        requestsPerMinute: 300
      },
      operations: [
        'getBoards',
        'getBoard',
        'createBoard',
        'getLists',
        'createList',
        'getCards',
        'createCard',
        'updateCard'
      ]
    }
  }
}