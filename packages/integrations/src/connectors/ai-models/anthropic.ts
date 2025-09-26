import { BaseConnector, ConnectorConfig, ConnectorAction } from '../base';
import { z } from 'zod';

export interface AnthropicConfig extends ConnectorConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  maxTokens?: number;
  temperature?: number;
}

const completionSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  model: z.string().optional(),
  max_tokens: z.number().min(1).max(4096).optional(),
  temperature: z.number().min(0).max(1).optional(),
  top_p: z.number().min(0).max(1).optional(),
  stop_sequences: z.array(z.string()).optional(),
  stream: z.boolean().optional(),
});

const textCompletionSchema = z.object({
  prompt: z.string(),
  model: z.string().optional(),
  max_tokens: z.number().min(1).max(4096).optional(),
  temperature: z.number().min(0).max(1).optional(),
  top_p: z.number().min(0).max(1).optional(),
  stop_sequences: z.array(z.string()).optional(),
});

export class AnthropicConnector extends BaseConnector<AnthropicConfig> {
  private baseUrl: string;

  constructor(config: AnthropicConfig) {
    super('anthropic', 'Anthropic Claude', config);
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com';
  }

  async initialize(): Promise<void> {
    // Test the API key by making a simple request
    try {
      if (!this.config) {
        throw new Error('Configuration not provided');
      }
      const response = await fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.config.defaultModel || 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${response.status} ${error}`);
      }

      this.status = 'connected';
    } catch (error) {
      throw new Error(`Failed to initialize Anthropic connector: ${error}`);
    }
  }

  getActions(): ConnectorAction[] {
    return [
      {
        id: 'create_message',
        name: 'Create Message',
        description: 'Generate a message using Claude',
        schema: completionSchema,
        execute: this.createMessage.bind(this),
      },
      {
        id: 'text_completion',
        name: 'Text Completion',
        description: 'Complete text using Claude (legacy format)',
        schema: textCompletionSchema,
        execute: this.textCompletion.bind(this),
      },
      {
        id: 'get_models',
        name: 'List Models',
        description: 'Get available Claude models',
        schema: z.object({}),
        execute: this.getModels.bind(this),
      },
    ];
  }

  private async createMessage(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const validated = completionSchema.parse(params);
    
    const requestBody = {
      model: validated.model || this.config.defaultModel || 'claude-3-haiku-20240307',
      max_tokens: validated.max_tokens || this.config.maxTokens || 1024,
      temperature: validated.temperature ?? this.config.temperature ?? 0.7,
      messages: validated.messages,
      ...(validated.top_p && { top_p: validated.top_p }),
      ...(validated.stop_sequences && { stop_sequences: validated.stop_sequences }),
      ...(validated.stream && { stream: validated.stream }),
    };

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  private async textCompletion(params: any): Promise<any> {
    const validated = textCompletionSchema.parse(params);
    
    // Convert to messages format
    const messages = [{ role: 'user' as const, content: validated.prompt }];
    
    return this.createMessage({
      messages,
      model: validated.model,
      max_tokens: validated.max_tokens,
      temperature: validated.temperature,
      top_p: validated.top_p,
      stop_sequences: validated.stop_sequences,
    });
  }

  private async getModels(_params: any): Promise<any> {
    // Anthropic doesn't have a models endpoint, so return static list
    return {
      models: [
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          description: 'Most powerful model for highly complex tasks',
          max_tokens: 4096,
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          description: 'Balanced performance and speed',
          max_tokens: 4096,
        },
        {
          id: 'claude-3-haiku-20240307',
          name: 'Claude 3 Haiku',
          description: 'Fastest model for simple tasks',
          max_tokens: 4096,
        },
        {
          id: 'claude-2.1',
          name: 'Claude 2.1',
          description: 'Previous generation model',
          max_tokens: 4096,
        },
        {
          id: 'claude-2.0',
          name: 'Claude 2.0',
          description: 'Previous generation model',
          max_tokens: 4096,
        },
      ],
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initialize();
      return true;
    } catch (error) {
      console.error('Anthropic connection test failed:', error);
      return false;
    }
  }
}