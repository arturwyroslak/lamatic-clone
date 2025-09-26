import { BaseConnector, ConnectorConfig, ConnectorAction } from '../base';
import { z } from 'zod';

export interface DiscordConfig extends ConnectorConfig {
  botToken: string;
  guildId?: string;
  applicationId: string;
}

export interface DiscordMessage {
  content: string;
  channelId: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
  }>;
  attachments?: Array<{
    url: string;
    filename: string;
  }>;
}

const sendMessageSchema = z.object({
  content: z.string().max(2000),
  channelId: z.string(),
  embeds: z.array(z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    color: z.number().optional(),
    fields: z.array(z.object({
      name: z.string(),
      value: z.string(),
      inline: z.boolean().optional(),
    })).optional(),
  })).optional(),
});

export class DiscordConnector extends BaseConnector<DiscordConfig> {
  constructor(config: DiscordConfig) {
    super('discord', 'Discord', config);
  }

  async initialize(): Promise<void> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    // Validate bot token by making a test API call
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        'Authorization': `Bot ${this.config.botToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Discord initialization failed: ${response.statusText}`);
    }

    this.status = 'connected';
  }

  getActions(): ConnectorAction[] {
    return [
      {
        id: 'send_message',
        name: 'Send Message',
        description: 'Send a message to a Discord channel',
        schema: sendMessageSchema,
        execute: this.sendMessage.bind(this),
      },
      {
        id: 'get_guild_channels',
        name: 'Get Guild Channels',
        description: 'Retrieve all channels in a guild',
        schema: z.object({
          guildId: z.string().optional(),
        }),
        execute: this.getGuildChannels.bind(this),
      },
      {
        id: 'create_channel',
        name: 'Create Channel',
        description: 'Create a new channel in a guild',
        schema: z.object({
          name: z.string(),
          type: z.number().default(0), // 0 = text channel
          guildId: z.string().optional(),
          topic: z.string().optional(),
        }),
        execute: this.createChannel.bind(this),
      },
    ];
  }

  private async sendMessage(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const validated = sendMessageSchema.parse(params);
    
    const response = await fetch(`https://discord.com/api/v10/channels/${validated.channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${this.config.botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validated),
    });

    if (!response.ok) {
      throw new Error(`Failed to send Discord message: ${response.statusText}`);
    }

    return response.json();
  }

  private async getGuildChannels(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const guildId = params.guildId || this.config.guildId;
    if (!guildId) {
      throw new Error('Guild ID is required');
    }

    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: {
        'Authorization': `Bot ${this.config.botToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get Discord channels: ${response.statusText}`);
    }

    return response.json();
  }

  private async createChannel(params: any): Promise<any> {
    if (!this.config) {
      throw new Error('Configuration not provided')
    }

    const guildId = params.guildId || this.config.guildId;
    if (!guildId) {
      throw new Error('Guild ID is required');
    }

    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${this.config.botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: params.name,
        type: params.type || 0,
        topic: params.topic,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create Discord channel: ${response.statusText}`);
    }

    return response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initialize();
      return true;
    } catch (error) {
      console.error('Discord connection test failed:', error);
      return false;
    }
  }
}