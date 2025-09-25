// Complete productivity tools integrations following Lamatic.ai patterns
import { BaseConnector } from '../base/connector'
import { IntegrationConfig } from '../types'

// Asana Integration
export class AsanaConnector extends BaseConnector {
  constructor() {
    super({
      id: 'asana',
      name: 'Asana',
      description: 'Project management and team collaboration platform',
      category: 'productivity',
      icon: 'https://example.com/asana-icon.png',
      authType: 'oauth2',
      baseUrl: 'https://app.asana.com/api/1.0'
    })
  }

  async getProjects() {
    return this.request('GET', '/projects')
  }

  async createProject(data: { name: string; team?: string; notes?: string }) {
    return this.request('POST', '/projects', { data })
  }

  async getTasks(projectId?: string) {
    const url = projectId ? `/projects/${projectId}/tasks` : '/tasks'
    return this.request('GET', url)
  }

  async createTask(data: { name: string; projects?: string[]; assignee?: string; due_date?: string }) {
    return this.request('POST', '/tasks', { data })
  }

  async updateTask(taskId: string, data: any) {
    return this.request('PUT', `/tasks/${taskId}`, { data })
  }

  async getTeams() {
    return this.request('GET', '/teams')
  }

  async getUsers() {
    return this.request('GET', '/users')
  }
}

// Trello Integration
export class TrelloConnector extends BaseConnector {
  constructor() {
    super({
      id: 'trello',
      name: 'Trello',
      description: 'Visual project management with boards, lists, and cards',
      category: 'productivity',
      icon: 'https://example.com/trello-icon.png',
      authType: 'api_key',
      baseUrl: 'https://api.trello.com/1'
    })
  }

  async getBoards() {
    return this.request('GET', '/members/me/boards')
  }

  async createBoard(data: { name: string; desc?: string; defaultLists?: boolean }) {
    return this.request('POST', '/boards', data)
  }

  async getLists(boardId: string) {
    return this.request('GET', `/boards/${boardId}/lists`)
  }

  async createList(data: { name: string; idBoard: string; pos?: string }) {
    return this.request('POST', '/lists', data)
  }

  async getCards(listId: string) {
    return this.request('GET', `/lists/${listId}/cards`)
  }

  async createCard(data: { name: string; idList: string; desc?: string; due?: string }) {
    return this.request('POST', '/cards', data)
  }

  async updateCard(cardId: string, data: any) {
    return this.request('PUT', `/cards/${cardId}`, data)
  }

  async addCardMember(cardId: string, memberId: string) {
    return this.request('POST', `/cards/${cardId}/members`, { value: memberId })
  }
}

// Monday.com Integration
export class MondayConnector extends BaseConnector {
  constructor() {
    super({
      id: 'monday',
      name: 'Monday.com',
      description: 'Work management platform for teams',
      category: 'productivity',
      icon: 'https://example.com/monday-icon.png',
      authType: 'api_key',
      baseUrl: 'https://api.monday.com/v2'
    })
  }

  async getBoards() {
    const query = `query { boards { id name description } }`
    return this.graphqlRequest(query)
  }

  async createBoard(data: { board_name: string; board_kind: string; folder_id?: number }) {
    const mutation = `
      mutation { 
        create_board (board_name: "${data.board_name}", board_kind: ${data.board_kind}) { 
          id name 
        } 
      }
    `
    return this.graphqlRequest(mutation)
  }

  async getItems(boardId: string) {
    const query = `query { boards(ids: ${boardId}) { items { id name column_values { id text } } } }`
    return this.graphqlRequest(query)
  }

  async createItem(boardId: string, itemName: string, columnValues?: any) {
    const mutation = `
      mutation { 
        create_item (board_id: ${boardId}, item_name: "${itemName}") { 
          id name 
        } 
      }
    `
    return this.graphqlRequest(mutation)
  }

  private async graphqlRequest(query: string) {
    return this.request('POST', '', { query })
  }
}

// ClickUp Integration
export class ClickUpConnector extends BaseConnector {
  constructor() {
    super({
      id: 'clickup',
      name: 'ClickUp',
      description: 'All-in-one productivity and project management platform',
      category: 'productivity',
      icon: 'https://example.com/clickup-icon.png',
      authType: 'api_key',
      baseUrl: 'https://api.clickup.com/api/v2'
    })
  }

  async getTeams() {
    return this.request('GET', '/team')
  }

  async getSpaces(teamId: string) {
    return this.request('GET', `/team/${teamId}/space`)
  }

  async getFolders(spaceId: string) {
    return this.request('GET', `/space/${spaceId}/folder`)
  }

  async getLists(folderId: string) {
    return this.request('GET', `/folder/${folderId}/list`)
  }

  async getTasks(listId: string) {
    return this.request('GET', `/list/${listId}/task`)
  }

  async createTask(listId: string, data: { name: string; description?: string; assignees?: string[]; due_date?: number }) {
    return this.request('POST', `/list/${listId}/task`, data)
  }

  async updateTask(taskId: string, data: any) {
    return this.request('PUT', `/task/${taskId}`, data)
  }

  async getTimeTracking(taskId: string) {
    return this.request('GET', `/task/${taskId}/time`)
  }
}

// Todoist Integration
export class TodoistConnector extends BaseConnector {
  constructor() {
    super({
      id: 'todoist',
      name: 'Todoist',
      description: 'Task management and to-do list application',
      category: 'productivity',
      icon: 'https://example.com/todoist-icon.png',
      authType: 'oauth2',
      baseUrl: 'https://api.todoist.com/rest/v2'
    })
  }

  async getProjects() {
    return this.request('GET', '/projects')
  }

  async createProject(data: { name: string; parent_id?: string; color?: string; is_favorite?: boolean }) {
    return this.request('POST', '/projects', data)
  }

  async getTasks(projectId?: string) {
    const params = projectId ? { project_id: projectId } : {}
    return this.request('GET', '/tasks', params)
  }

  async createTask(data: { content: string; project_id?: string; due_date?: string; priority?: number }) {
    return this.request('POST', '/tasks', data)
  }

  async updateTask(taskId: string, data: any) {
    return this.request('POST', `/tasks/${taskId}`, data)
  }

  async completeTask(taskId: string) {
    return this.request('POST', `/tasks/${taskId}/close`)
  }

  async getLabels() {
    return this.request('GET', '/labels')
  }

  async createLabel(data: { name: string; color?: string }) {
    return this.request('POST', '/labels', data)
  }
}

// Basecamp Integration
export class BasecampConnector extends BaseConnector {
  constructor() {
    super({
      id: 'basecamp',
      name: 'Basecamp',
      description: 'Project management and team collaboration tool',
      category: 'productivity',
      icon: 'https://example.com/basecamp-icon.png',
      authType: 'oauth2',
      baseUrl: 'https://3.basecampapi.com'
    })
  }

  async getProjects() {
    return this.request('GET', '/projects.json')
  }

  async createProject(data: { name: string; description?: string }) {
    return this.request('POST', '/projects.json', data)
  }

  async getTodoLists(projectId: string) {
    return this.request('GET', `/projects/${projectId}/todosets.json`)
  }

  async createTodoList(projectId: string, data: { name: string; description?: string }) {
    return this.request('POST', `/projects/${projectId}/todosets.json`, data)
  }

  async getTodos(projectId: string, todoListId: string) {
    return this.request('GET', `/projects/${projectId}/todosets/${todoListId}/todos.json`)
  }

  async createTodo(projectId: string, todoListId: string, data: { content: string; due_on?: string; assignee_ids?: number[] }) {
    return this.request('POST', `/projects/${projectId}/todosets/${todoListId}/todos.json`, data)
  }

  async getMessages(projectId: string) {
    return this.request('GET', `/projects/${projectId}/message_board/messages.json`)
  }
}

// Export all productivity connectors
export const productivityConnectors: IntegrationConfig[] = [
  {
    id: 'asana',
    name: 'Asana',
    description: 'Project management and team collaboration platform',
    category: 'productivity',
    icon: 'https://example.com/asana-icon.png',
    connector: AsanaConnector,
    actions: [
      {
        id: 'get_projects',
        name: 'Get Projects',
        description: 'Retrieve all projects',
        inputs: [],
        outputs: [{ name: 'projects', type: 'array' }]
      },
      {
        id: 'create_project',
        name: 'Create Project',
        description: 'Create a new project',
        inputs: [
          { name: 'name', type: 'string', required: true },
          { name: 'team', type: 'string' },
          { name: 'notes', type: 'string' }
        ],
        outputs: [{ name: 'project', type: 'object' }]
      },
      {
        id: 'create_task',
        name: 'Create Task',
        description: 'Create a new task',
        inputs: [
          { name: 'name', type: 'string', required: true },
          { name: 'projects', type: 'array' },
          { name: 'assignee', type: 'string' },
          { name: 'due_date', type: 'string' }
        ],
        outputs: [{ name: 'task', type: 'object' }]
      }
    ]
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Visual project management with boards, lists, and cards',
    category: 'productivity',
    icon: 'https://example.com/trello-icon.png',
    connector: TrelloConnector,
    actions: [
      {
        id: 'get_boards',
        name: 'Get Boards',
        description: 'Retrieve all boards',
        inputs: [],
        outputs: [{ name: 'boards', type: 'array' }]
      },
      {
        id: 'create_board',
        name: 'Create Board',
        description: 'Create a new board',
        inputs: [
          { name: 'name', type: 'string', required: true },
          { name: 'desc', type: 'string' }
        ],
        outputs: [{ name: 'board', type: 'object' }]
      },
      {
        id: 'create_card',
        name: 'Create Card',
        description: 'Create a new card',
        inputs: [
          { name: 'name', type: 'string', required: true },
          { name: 'idList', type: 'string', required: true },
          { name: 'desc', type: 'string' },
          { name: 'due', type: 'string' }
        ],
        outputs: [{ name: 'card', type: 'object' }]
      }
    ]
  },
  {
    id: 'monday',
    name: 'Monday.com',
    description: 'Work management platform for teams',
    category: 'productivity',
    icon: 'https://example.com/monday-icon.png',
    connector: MondayConnector,
    actions: [
      {
        id: 'get_boards',
        name: 'Get Boards',
        description: 'Retrieve all boards',
        inputs: [],
        outputs: [{ name: 'boards', type: 'array' }]
      },
      {
        id: 'create_item',
        name: 'Create Item',
        description: 'Create a new item',
        inputs: [
          { name: 'boardId', type: 'string', required: true },
          { name: 'itemName', type: 'string', required: true }
        ],
        outputs: [{ name: 'item', type: 'object' }]
      }
    ]
  },
  {
    id: 'clickup',
    name: 'ClickUp',
    description: 'All-in-one productivity and project management platform',
    category: 'productivity',
    icon: 'https://example.com/clickup-icon.png',
    connector: ClickUpConnector,
    actions: [
      {
        id: 'get_tasks',
        name: 'Get Tasks',
        description: 'Retrieve tasks from a list',
        inputs: [{ name: 'listId', type: 'string', required: true }],
        outputs: [{ name: 'tasks', type: 'array' }]
      },
      {
        id: 'create_task',
        name: 'Create Task',
        description: 'Create a new task',
        inputs: [
          { name: 'listId', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'description', type: 'string' },
          { name: 'assignees', type: 'array' }
        ],
        outputs: [{ name: 'task', type: 'object' }]
      }
    ]
  },
  {
    id: 'todoist',
    name: 'Todoist',
    description: 'Task management and to-do list application',
    category: 'productivity',
    icon: 'https://example.com/todoist-icon.png',
    connector: TodoistConnector,
    actions: [
      {
        id: 'get_tasks',
        name: 'Get Tasks',
        description: 'Retrieve all tasks',
        inputs: [{ name: 'project_id', type: 'string' }],
        outputs: [{ name: 'tasks', type: 'array' }]
      },
      {
        id: 'create_task',
        name: 'Create Task',
        description: 'Create a new task',
        inputs: [
          { name: 'content', type: 'string', required: true },
          { name: 'project_id', type: 'string' },
          { name: 'due_date', type: 'string' }
        ],
        outputs: [{ name: 'task', type: 'object' }]
      }
    ]
  },
  {
    id: 'basecamp',
    name: 'Basecamp',
    description: 'Project management and team collaboration tool',
    category: 'productivity',
    icon: 'https://example.com/basecamp-icon.png',
    connector: BasecampConnector,
    actions: [
      {
        id: 'get_projects',
        name: 'Get Projects',
        description: 'Retrieve all projects',
        inputs: [],
        outputs: [{ name: 'projects', type: 'array' }]
      },
      {
        id: 'create_todo',
        name: 'Create Todo',
        description: 'Create a new todo item',
        inputs: [
          { name: 'projectId', type: 'string', required: true },
          { name: 'todoListId', type: 'string', required: true },
          { name: 'content', type: 'string', required: true }
        ],
        outputs: [{ name: 'todo', type: 'object' }]
      }
    ]
  }
]