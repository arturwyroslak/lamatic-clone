import { BaseConnector, ConnectorConfig, ConnectorAction } from '../base';
import { z } from 'zod';

export interface SalesforceConfig extends ConnectorConfig {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  securityToken: string;
  instanceUrl?: string;
  apiVersion?: string;
}

const createRecordSchema = z.object({
  sobjectType: z.string(),
  data: z.record(z.any()),
});

const updateRecordSchema = z.object({
  sobjectType: z.string(),
  id: z.string(),
  data: z.record(z.any()),
});

const querySchema = z.object({
  query: z.string(),
});

const searchSchema = z.object({
  searchTerm: z.string(),
  sobjects: z.array(z.string()).optional(),
});

export class SalesforceConnector extends BaseConnector<SalesforceConfig> {
  private accessToken?: string;
  private instanceUrl?: string;

  constructor(config: SalesforceConfig) {
    super('salesforce', 'Salesforce CRM', config);
  }

  async initialize(): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    // Get access token for Salesforce API
    const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        username: this.config.username,
        password: this.config.password + this.config.securityToken,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Authentication failed: ${tokenResponse.statusText}`);
    }

    const authData = await tokenResponse.json();
    this.accessToken = authData.access_token;
    this.instanceUrl = authData.instance_url;

    this.status = 'connected';
  }

  getActions(): ConnectorAction[] {
    return [
      {
        id: 'create_record',
        name: 'Create Record',
        description: 'Create a new record in Salesforce',
        schema: createRecordSchema,
        execute: this.createRecord.bind(this),
      },
      {
        id: 'update_record',
        name: 'Update Record',
        description: 'Update an existing record in Salesforce',
        schema: updateRecordSchema,
        execute: this.updateRecord.bind(this),
      },
      {
        id: 'get_record',
        name: 'Get Record',
        description: 'Retrieve a record by ID',
        schema: z.object({
          sobjectType: z.string(),
          id: z.string(),
          fields: z.array(z.string()).optional(),
        }),
        execute: this.getRecord.bind(this),
      },
      {
        id: 'delete_record',
        name: 'Delete Record',
        description: 'Delete a record by ID',
        schema: z.object({
          sobjectType: z.string(),
          id: z.string(),
        }),
        execute: this.deleteRecord.bind(this),
      },
      {
        id: 'query_records',
        name: 'Query Records',
        description: 'Execute a SOQL query',
        schema: querySchema,
        execute: this.queryRecords.bind(this),
      },
      {
        id: 'search_records',
        name: 'Search Records',
        description: 'Search records using SOSL',
        schema: searchSchema,
        execute: this.searchRecords.bind(this),
      },
      {
        id: 'get_sobject_describe',
        name: 'Describe SObject',
        description: 'Get metadata for a SObject type',
        schema: z.object({
          sobjectType: z.string(),
        }),
        execute: this.getSObjectDescribe.bind(this),
      },
    ];
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken || !this.instanceUrl) {
      throw new Error('Not authenticated');
    }

    const url = `${this.instanceUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Salesforce API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  private async createRecord(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const validated = createRecordSchema.parse(params);
    const apiVersion = this.config.apiVersion || '58.0';
    
    return this.makeRequest(`/services/data/v${apiVersion}/sobjects/${validated.sobjectType}`, {
      method: 'POST',
      body: JSON.stringify(validated.data),
    });
  }

  private async updateRecord(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const validated = updateRecordSchema.parse(params);
    const apiVersion = this.config.apiVersion || '58.0';
    
    return this.makeRequest(`/services/data/v${apiVersion}/sobjects/${validated.sobjectType}/${validated.id}`, {
      method: 'PATCH',
      body: JSON.stringify(validated.data),
    });
  }

  private async getRecord(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const apiVersion = this.config.apiVersion || '58.0';
    const fieldsParam = params.fields ? `?fields=${params.fields.join(',')}` : '';
    
    return this.makeRequest(`/services/data/v${apiVersion}/sobjects/${params.sobjectType}/${params.id}${fieldsParam}`);
  }

  private async deleteRecord(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const apiVersion = this.config.apiVersion || '58.0';
    
    await this.makeRequest(`/services/data/v${apiVersion}/sobjects/${params.sobjectType}/${params.id}`, {
      method: 'DELETE',
    });

    return { success: true, id: params.id };
  }

  private async queryRecords(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const validated = querySchema.parse(params);
    const apiVersion = this.config.apiVersion || '58.0';
    const encodedQuery = encodeURIComponent(validated.query);
    
    return this.makeRequest(`/services/data/v${apiVersion}/query?q=${encodedQuery}`);
  }

  private async searchRecords(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const validated = searchSchema.parse(params);
    const apiVersion = this.config.apiVersion || '58.0';
    
    let sosl = `FIND {${validated.searchTerm}}`;
    if (validated.sobjects && validated.sobjects.length > 0) {
      sosl += ` IN (${validated.sobjects.join(', ')})`;
    }
    
    const encodedSearch = encodeURIComponent(sosl);
    return this.makeRequest(`/services/data/v${apiVersion}/search?q=${encodedSearch}`);
  }

  private async getSObjectDescribe(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const apiVersion = this.config.apiVersion || '58.0';
    
    return this.makeRequest(`/services/data/v${apiVersion}/sobjects/${params.sobjectType}/describe`);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initialize();
      // Test with a simple query
      await this.queryRecords({ query: 'SELECT Id FROM User LIMIT 1' });
      return true;
    } catch (error) {
      console.error('Salesforce connection test failed:', error);
      return false;
    }
  }
}