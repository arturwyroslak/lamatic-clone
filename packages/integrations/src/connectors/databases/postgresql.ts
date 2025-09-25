import { BaseConnector, ConnectorConfig, ConnectorAction } from '../base';
import { z } from 'zod';

export interface PostgreSQLConfig extends ConnectorConfig {
  host: string;
  port?: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  connectionString?: string;
  maxConnections?: number;
}

const executeQuerySchema = z.object({
  query: z.string(),
  parameters: z.array(z.any()).optional(),
  transaction: z.boolean().optional(),
});

const insertDataSchema = z.object({
  table: z.string(),
  data: z.record(z.any()),
  returning: z.array(z.string()).optional(),
});

const updateDataSchema = z.object({
  table: z.string(),
  data: z.record(z.any()),
  where: z.record(z.any()),
  returning: z.array(z.string()).optional(),
});

export class PostgreSQLConnector extends BaseConnector<PostgreSQLConfig> {
  private pool: any;

  constructor(config: PostgreSQLConfig) {
    super('postgresql', 'PostgreSQL Database', config);
  }

  async initialize(): Promise<void> {
    try {
      // In a real implementation, you would use a library like 'pg'
      // This is a mock implementation for demonstration
      const connectionConfig = {
        host: this.config.host,
        port: this.config.port || 5432,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        ssl: this.config.ssl,
        max: this.config.maxConnections || 10,
      };

      // Mock connection pool creation
      this.pool = {
        connect: () => Promise.resolve({ query: () => Promise.resolve({ rows: [] }) }),
        end: () => Promise.resolve(),
      };

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      
      this.status = 'connected';
    } catch (error) {
      throw new Error(`Failed to connect to PostgreSQL: ${error}`);
    }
  }

  getActions(): ConnectorAction[] {
    return [
      {
        id: 'execute_query',
        name: 'Execute Query',
        description: 'Execute a SQL query against the database',
        schema: executeQuerySchema,
        execute: this.executeQuery.bind(this),
      },
      {
        id: 'insert_data',
        name: 'Insert Data',
        description: 'Insert data into a table',
        schema: insertDataSchema,
        execute: this.insertData.bind(this),
      },
      {
        id: 'update_data',
        name: 'Update Data',
        description: 'Update data in a table',
        schema: updateDataSchema,
        execute: this.updateData.bind(this),
      },
      {
        id: 'get_table_schema',
        name: 'Get Table Schema',
        description: 'Retrieve table schema information',
        schema: z.object({
          table: z.string(),
          schema: z.string().default('public'),
        }),
        execute: this.getTableSchema.bind(this),
      },
      {
        id: 'list_tables',
        name: 'List Tables',
        description: 'List all tables in the database',
        schema: z.object({
          schema: z.string().default('public'),
        }),
        execute: this.listTables.bind(this),
      },
    ];
  }

  private async executeQuery(params: any): Promise<any> {
    const validated = executeQuerySchema.parse(params);
    
    try {
      const client = await this.pool.connect();
      
      if (validated.transaction) {
        await client.query('BEGIN');
        try {
          const result = await client.query(validated.query, validated.parameters);
          await client.query('COMMIT');
          return result.rows;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      } else {
        const result = await client.query(validated.query, validated.parameters);
        return result.rows;
      }
    } catch (error) {
      throw new Error(`Query execution failed: ${error}`);
    }
  }

  private async insertData(params: any): Promise<any> {
    const validated = insertDataSchema.parse(params);
    
    const columns = Object.keys(validated.data);
    const values = Object.values(validated.data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    let query = `INSERT INTO ${validated.table} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    if (validated.returning && validated.returning.length > 0) {
      query += ` RETURNING ${validated.returning.join(', ')}`;
    }

    return this.executeQuery({
      query,
      parameters: values,
    });
  }

  private async updateData(params: any): Promise<any> {
    const validated = updateDataSchema.parse(params);
    
    const setClause = Object.keys(validated.data)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const whereClause = Object.keys(validated.where)
      .map((key, index) => `${key} = $${Object.keys(validated.data).length + index + 1}`)
      .join(' AND ');
    
    let query = `UPDATE ${validated.table} SET ${setClause} WHERE ${whereClause}`;
    
    if (validated.returning && validated.returning.length > 0) {
      query += ` RETURNING ${validated.returning.join(', ')}`;
    }

    const parameters = [...Object.values(validated.data), ...Object.values(validated.where)];

    return this.executeQuery({
      query,
      parameters,
    });
  }

  private async getTableSchema(params: any): Promise<any> {
    const query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `;

    return this.executeQuery({
      query,
      parameters: [params.schema, params.table],
    });
  }

  private async listTables(params: any): Promise<any> {
    const query = `
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = $1
      ORDER BY table_name
    `;

    return this.executeQuery({
      query,
      parameters: [params.schema],
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.executeQuery({ query: 'SELECT 1 as test' });
      return true;
    } catch (error) {
      console.error('PostgreSQL connection test failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    super.disconnect();
  }
}