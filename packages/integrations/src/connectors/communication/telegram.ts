import { BaseConnector, ConnectorConfig, ConnectorAction } from '../base';
import { z } from 'zod';

export interface TelegramConfig extends ConnectorConfig {
  botToken: string;
  baseUrl?: string;
}

const sendMessageSchema = z.object({
  chat_id: z.union([z.string(), z.number()]),
  text: z.string().max(4096),
  parse_mode: z.enum(['Markdown', 'HTML']).optional(),
  disable_web_page_preview: z.boolean().optional(),
  disable_notification: z.boolean().optional(),
  reply_to_message_id: z.number().optional(),
});

const sendPhotoSchema = z.object({
  chat_id: z.union([z.string(), z.number()]),
  photo: z.string(), // URL or file_id
  caption: z.string().max(1024).optional(),
  parse_mode: z.enum(['Markdown', 'HTML']).optional(),
  disable_notification: z.boolean().optional(),
  reply_to_message_id: z.number().optional(),
});

export class TelegramConnector extends BaseConnector<TelegramConfig> {
  private baseUrl: string;

  constructor(config: TelegramConfig) {
    super('telegram', 'Telegram Bot', config);
    this.baseUrl = config.baseUrl || 'https://api.telegram.org';
  }

  async initialize(): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    // Validate bot token by getting bot information
    const response = await fetch(`${this.baseUrl}/bot${this.config.botToken}/getMe`);
    
    if (!response.ok) {
      throw new Error(`Telegram initialization failed: ${response.statusText}`);
    }

    const botInfo = await response.json();
    if (!botInfo.ok) {
      throw new Error(`Telegram bot validation failed: ${botInfo.description}`);
    }

    this.status = 'connected';
  }

  getActions(): ConnectorAction[] {
    return [
      {
        id: 'send_message',
        name: 'Send Message',
        description: 'Send a text message to a chat',
        schema: sendMessageSchema,
        execute: this.sendMessage.bind(this),
      },
      {
        id: 'send_photo',
        name: 'Send Photo',
        description: 'Send a photo to a chat',
        schema: sendPhotoSchema,
        execute: this.sendPhoto.bind(this),
      },
      {
        id: 'get_updates',
        name: 'Get Updates',
        description: 'Get incoming updates',
        schema: z.object({
          offset: z.number().optional(),
          limit: z.number().max(100).optional(),
          timeout: z.number().max(50).optional(),
        }),
        execute: this.getUpdates.bind(this),
      },
      {
        id: 'get_chat',
        name: 'Get Chat Info',
        description: 'Get information about a chat',
        schema: z.object({
          chat_id: z.union([z.string(), z.number()]),
        }),
        execute: this.getChat.bind(this),
      },
    ];
  }

  private async sendMessage(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const validated = sendMessageSchema.parse(params);
    
    const response = await fetch(`${this.baseUrl}/bot${this.config.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validated),
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Failed to send message: ${data.description}`);
    }

    return data.result;
  }

  private async sendPhoto(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const validated = sendPhotoSchema.parse(params);
    
    const response = await fetch(`${this.baseUrl}/bot${this.config.botToken}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validated),
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Failed to send photo: ${data.description}`);
    }

    return data.result;
  }

  private async getUpdates(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const queryParams = new URLSearchParams();
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.timeout) queryParams.append('timeout', params.timeout);

    const response = await fetch(
      `${this.baseUrl}/bot${this.config.botToken}/getUpdates?${queryParams}`
    );

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Failed to get updates: ${data.description}`);
    }

    return data.result;
  }

  private async getChat(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const response = await fetch(
      `${this.baseUrl}/bot${this.config.botToken}/getChat?chat_id=${params.chat_id}`
    );

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Failed to get chat info: ${data.description}`);
    }

    return data.result;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initialize();
      return true;
    } catch (error) {
      console.error('Telegram connection test failed:', error);
      return false;
    }
  }
}