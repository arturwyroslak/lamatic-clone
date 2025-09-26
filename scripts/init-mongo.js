// MongoDB Initialization Script for Lamatic
// This script creates collections and indexes for document storage

// Switch to the lamatic_dev database
db = db.getSiblingDB('lamatic_dev');

// Create user for the application
db.createUser({
  user: 'lamatic_app',
  pwd: 'lamatic_app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'lamatic_dev'
    }
  ]
});

// Create collections with schema validation

// Document Templates Collection
db.createCollection('document_templates', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'type', 'content', 'created_at'],
      properties: {
        name: { bsonType: 'string', description: 'Template name is required' },
        type: { 
          bsonType: 'string', 
          enum: ['workflow', 'agent', 'integration', 'email', 'report'],
          description: 'Template type must be one of the specified values'
        },
        content: { bsonType: 'object', description: 'Template content is required' },
        variables: { bsonType: 'array', description: 'Template variables' },
        tags: { bsonType: 'array', description: 'Template tags' },
        created_at: { bsonType: 'date', description: 'Creation date is required' },
        updated_at: { bsonType: 'date', description: 'Last update date' },
        created_by: { bsonType: 'string', description: 'Creator user ID' },
        workspace_id: { bsonType: 'string', description: 'Workspace ID' }
      }
    }
  }
});

// User Preferences Collection
db.createCollection('user_preferences', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user_id', 'preferences', 'created_at'],
      properties: {
        user_id: { bsonType: 'string', description: 'User ID is required' },
        preferences: { bsonType: 'object', description: 'User preferences object is required' },
        workspace_settings: { bsonType: 'object', description: 'Workspace-specific settings' },
        created_at: { bsonType: 'date', description: 'Creation date is required' },
        updated_at: { bsonType: 'date', description: 'Last update date' }
      }
    }
  }
});

// Execution Logs Collection
db.createCollection('execution_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['execution_id', 'workflow_id', 'log_level', 'message', 'timestamp'],
      properties: {
        execution_id: { bsonType: 'string', description: 'Execution ID is required' },
        workflow_id: { bsonType: 'string', description: 'Workflow ID is required' },
        log_level: { 
          bsonType: 'string',
          enum: ['debug', 'info', 'warn', 'error', 'fatal'],
          description: 'Log level must be one of the specified values'
        },
        message: { bsonType: 'string', description: 'Log message is required' },
        metadata: { bsonType: 'object', description: 'Additional log metadata' },
        timestamp: { bsonType: 'date', description: 'Log timestamp is required' },
        workspace_id: { bsonType: 'string', description: 'Workspace ID' }
      }
    }
  }
});

// Integration Data Collection
db.createCollection('integration_data', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['integration_id', 'data_type', 'data', 'created_at'],
      properties: {
        integration_id: { bsonType: 'string', description: 'Integration ID is required' },
        data_type: { bsonType: 'string', description: 'Data type is required' },
        data: { bsonType: 'object', description: 'Integration data is required' },
        metadata: { bsonType: 'object', description: 'Additional data metadata' },
        expires_at: { bsonType: 'date', description: 'Data expiration date' },
        created_at: { bsonType: 'date', description: 'Creation date is required' },
        workspace_id: { bsonType: 'string', description: 'Workspace ID' }
      }
    }
  }
});

// Workflow Backups Collection
db.createCollection('workflow_backups', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['workflow_id', 'version', 'backup_data', 'created_at'],
      properties: {
        workflow_id: { bsonType: 'string', description: 'Workflow ID is required' },
        version: { bsonType: 'int', description: 'Version number is required' },
        backup_data: { bsonType: 'object', description: 'Backup data is required' },
        backup_type: { 
          bsonType: 'string',
          enum: ['manual', 'auto', 'pre_deploy'],
          description: 'Backup type'
        },
        created_by: { bsonType: 'string', description: 'Creator user ID' },
        created_at: { bsonType: 'date', description: 'Creation date is required' },
        workspace_id: { bsonType: 'string', description: 'Workspace ID' }
      }
    }
  }
});

// Create indexes for performance

// Document Templates indexes
db.document_templates.createIndex({ 'workspace_id': 1, 'type': 1 });
db.document_templates.createIndex({ 'created_by': 1 });
db.document_templates.createIndex({ 'tags': 1 });
db.document_templates.createIndex({ 'created_at': -1 });

// User Preferences indexes
db.user_preferences.createIndex({ 'user_id': 1 }, { unique: true });

// Execution Logs indexes
db.execution_logs.createIndex({ 'execution_id': 1, 'timestamp': -1 });
db.execution_logs.createIndex({ 'workflow_id': 1, 'timestamp': -1 });
db.execution_logs.createIndex({ 'workspace_id': 1, 'timestamp': -1 });
db.execution_logs.createIndex({ 'log_level': 1, 'timestamp': -1 });

// Integration Data indexes
db.integration_data.createIndex({ 'integration_id': 1, 'data_type': 1 });
db.integration_data.createIndex({ 'workspace_id': 1 });
db.integration_data.createIndex({ 'expires_at': 1 }, { expireAfterSeconds: 0 });
db.integration_data.createIndex({ 'created_at': -1 });

// Workflow Backups indexes
db.workflow_backups.createIndex({ 'workflow_id': 1, 'version': -1 });
db.workflow_backups.createIndex({ 'workspace_id': 1, 'created_at': -1 });
db.workflow_backups.createIndex({ 'backup_type': 1 });

// Insert sample data for development
print('Inserting sample data...');

// Sample document templates
db.document_templates.insertMany([
  {
    name: 'Email Welcome Template',
    type: 'email',
    content: {
      subject: 'Welcome to {{workspace_name}}!',
      body: 'Hello {{user_name}}, welcome to our platform!',
      template_engine: 'handlebars'
    },
    variables: ['workspace_name', 'user_name'],
    tags: ['email', 'welcome', 'onboarding'],
    created_at: new Date(),
    updated_at: new Date(),
    created_by: '00000000-0000-0000-0000-000000000001',
    workspace_id: '00000000-0000-0000-0000-000000000001'
  },
  {
    name: 'Workflow Execution Report',
    type: 'report',
    content: {
      title: '{{workflow_name}} Execution Report',
      sections: [
        {
          name: 'summary',
          template: 'Workflow executed {{execution_count}} times with {{success_rate}}% success rate'
        },
        {
          name: 'details',
          template: 'Last execution: {{last_execution_date}}'
        }
      ]
    },
    variables: ['workflow_name', 'execution_count', 'success_rate', 'last_execution_date'],
    tags: ['report', 'workflow', 'analytics'],
    created_at: new Date(),
    updated_at: new Date(),
    created_by: '00000000-0000-0000-0000-000000000001',
    workspace_id: '00000000-0000-0000-0000-000000000001'
  }
]);

// Sample user preferences
db.user_preferences.insertOne({
  user_id: '00000000-0000-0000-0000-000000000001',
  preferences: {
    theme: 'dark',
    notifications: {
      email: true,
      browser: true,
      workflow_failures: true,
      workflow_completions: false
    },
    dashboard: {
      default_view: 'workflows',
      widgets: ['recent_executions', 'system_health', 'usage_metrics']
    },
    editor: {
      auto_save: true,
      vim_mode: false,
      font_size: 14
    }
  },
  workspace_settings: {
    '00000000-0000-0000-0000-000000000001': {
      default_integrations: ['openai', 'slack'],
      favorite_workflows: []
    }
  },
  created_at: new Date(),
  updated_at: new Date()
});

print('MongoDB initialization complete!');
print('Created collections: document_templates, user_preferences, execution_logs, integration_data, workflow_backups');
print('Created indexes for optimal query performance');
print('Inserted sample development data');