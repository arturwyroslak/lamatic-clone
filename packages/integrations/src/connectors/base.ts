import { z } from 'zod';

export interface ConnectorConfig {
  id: string;
  name: string;
  apiEndpoint?: string;
  timeout?: number;
  retries?: number;
}

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  schema: z.ZodSchema<any>;
  execute: (params: any) => Promise<any>;
}

export type ConnectorStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export abstract class BaseConnector<T extends ConnectorConfig = ConnectorConfig> {
  protected status: ConnectorStatus = 'disconnected';
  protected lastError?: Error;

  constructor(
    public readonly type: string,
    public readonly displayName: string,
    protected config: T
  ) {}

  abstract initialize(): Promise<void>;
  abstract getActions(): ConnectorAction[];
  abstract testConnection(): Promise<boolean>;

  getStatus(): ConnectorStatus {
    return this.status;
  }

  getLastError(): Error | undefined {
    return this.lastError;
  }

  getConfig(): T {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<T>): void {
    this.config = { ...this.config, ...newConfig };
  }

  protected setError(error: Error): void {
    this.lastError = error;
    this.status = 'error';
  }

  protected clearError(): void {
    this.lastError = undefined;
    if (this.status === 'error') {
      this.status = 'disconnected';
    }
  }

  async connect(): Promise<void> {
    try {
      this.status = 'connecting';
      this.clearError();
      await this.initialize();
      this.status = 'connected';
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }

  disconnect(): void {
    this.status = 'disconnected';
    this.clearError();
  }

  async executeAction(actionId: string, params: any): Promise<any> {
    if (this.status !== 'connected') {
      throw new Error(`Connector ${this.displayName} is not connected`);
    }

    const action = this.getActions().find(a => a.id === actionId);
    if (!action) {
      throw new Error(`Action ${actionId} not found in connector ${this.displayName}`);
    }

    try {
      // Validate parameters
      const validatedParams = action.schema.parse(params);
      
      // Execute action
      return await action.execute(validatedParams);
    } catch (error) {
      this.setError(error as Error);
      throw error;
    }
  }
}