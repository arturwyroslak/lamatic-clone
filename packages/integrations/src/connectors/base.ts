import { z } from 'zod';
import { ConnectionConfig, ExecutionContext, ActionResult, ConnectorCapabilities } from '../types';

export interface ConnectorConfig {
  id?: string;
  name?: string;
  apiEndpoint?: string;
  timeout?: number;
  retries?: number;
  [key: string]: unknown;
}

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  schema: z.ZodSchema<any>;
  execute: (params: any) => Promise<any>;
}

export type ConnectorStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export class BaseConnector<T extends ConnectorConfig = ConnectorConfig> {
  protected status: ConnectorStatus = 'disconnected';
  protected lastError?: Error;
  protected config?: T;

  constructor(type?: string, displayName?: string, config?: T) {
    // Support both new parameterless style and legacy style with config
    this.config = config;
  }

  async initialize(): Promise<void> {
    return Promise.resolve();
  }

  getActions(): ConnectorAction[] {
    return [];
  }

  async testConnection(config?: ConnectionConfig): Promise<boolean> {
    // Default implementation - should be overridden by subclasses
    return this.status === 'connected' || this.status === 'connecting';
  }

  async connect(config?: ConnectionConfig): Promise<boolean> {
    try {
      this.status = 'connecting';
      this.clearError();
      await this.initialize();
      this.status = 'connected';
      return true;
    } catch (error) {
      this.setError(error as Error);
      return false;
    }
  }

  // Add logExecution method that many connectors expect
  protected async logExecution(
    context: ExecutionContext,
    operation: string,
    input: any,
    result: any
  ): Promise<void> {
    // Default implementation - can be overridden by subclasses
    console.log(`[${context.executionId}] ${operation}:`, { input, result });
  }

  getStatus(): ConnectorStatus {
    return this.status;
  }

  getLastError(): Error | undefined {
    return this.lastError;
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

  disconnect(): void {
    this.status = 'disconnected';
    this.clearError();
  }

  async executeAction(actionId: string, params: any): Promise<any> {
    if (this.status !== 'connected') {
      throw new Error(`Connector is not connected`);
    }

    const action = this.getActions().find(a => a.id === actionId);
    if (!action) {
      throw new Error(`Action ${actionId} not found in connector`);
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