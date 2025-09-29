export type IntegrationCategory = string;
export type IntegrationType = string;
export type IntegrationStatus = 'active' | 'beta' | 'deprecated' | 'coming_soon';
export type TriggerType = 'webhook' | 'polling' | 'event_trigger' | 'action' | 'sync_trigger';
export interface SetupInstruction {
    step: number;
    title: string;
    description: string;
    url?: string;
}
export interface IntegrationConfig {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    type: IntegrationType;
    category: IntegrationCategory;
    provider: string;
    version: string;
    status: IntegrationStatus;
    features: string[];
    triggers: TriggerType[];
    actions: string[];
    configSchema: any;
    credentialsSchema: any;
    setupInstructions: SetupInstruction[];
    documentation?: string;
    examples: any[];
}
export interface ModelProvider {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    website?: string;
    apiKeyRequired?: boolean;
    setupInstructions: string[];
    features: string[];
    pricing?: PricingInfo;
    models: ModelConfig[];
}
export interface ModelConfig {
    id: string;
    name: string;
    description: string;
    type: 'text' | 'image' | 'audio' | 'video' | 'embedding' | 'chat';
    contextLength?: number;
    maxTokens?: number;
    inputPricing?: number;
    outputPricing?: number;
    features: string[];
    capabilities?: string[];
    pricing?: ModelPricing;
}
export interface AuthMethod {
    type: 'api_key' | 'oauth2' | 'bearer_token';
    fields: AuthField[];
}
export interface AuthField {
    name: string;
    type: 'string' | 'password' | 'url';
    required: boolean;
    description: string;
}
export interface RateLimit {
    requests: number;
    window: string;
    burst?: number;
}
export interface PricingPlan {
    name: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
}
export interface PricingRate {
    operation: string;
    price: number;
    unit: string;
}
export interface PricingInfo {
    type: string;
    model?: 'pay_per_use' | 'subscription' | 'free';
    currency?: string;
    rates?: PricingRate[];
    plans?: PricingPlan[];
}
export interface ModelPricing {
    input?: number;
    output?: number;
    unit?: string;
}
export interface ConnectorInstance {
    id: string;
    integrationId: string;
    name: string;
    workspaceId: string;
    config: Record<string, any>;
    credentials: Record<string, any>;
    status: 'active' | 'inactive' | 'error' | 'connected' | 'disconnected';
    lastTested?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ExecutionContext {
    workflowId: string;
    executionId: string;
    userId: string;
    workspaceId: string;
    variables: Record<string, any>;
}
export interface ActionResult {
    success: boolean;
    data?: any;
    error?: string;
    metadata?: Record<string, any>;
}
export interface ConfigFieldOption {
    label: string;
    value: string;
}
export interface ConfigField {
    key: string;
    label: string;
    type: string;
    required: boolean;
    description?: string;
    defaultValue?: any;
    options?: ConfigFieldOption[];
}
export interface ConnectionConfig {
    workspaceId?: string;
    [key: string]: any;
}
export interface ConnectorConfigSchema {
    fields: ConfigField[];
}
export interface ConnectorCapabilities {
    supportsBatch?: boolean;
    supportsStreaming?: boolean;
    supportsFiles?: boolean;
    maxConcurrency?: number;
    rateLimits?: Record<string, any>;
    operations?: string[];
    [key: string]: any;
}
export interface IntegrationConnector {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly version: string;
    readonly config: ConnectorConfigSchema;
    validateConnection(config: ConnectionConfig): Promise<{
        valid: boolean;
        error?: string;
    }>;
    execute(input: any, config: ConnectionConfig, context: ExecutionContext): Promise<ActionResult | any>;
    getCapabilities(): ConnectorCapabilities;
}
//# sourceMappingURL=types.d.ts.map