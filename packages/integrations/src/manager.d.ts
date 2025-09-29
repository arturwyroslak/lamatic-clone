import { ConnectorInstance, IntegrationConfig, ModelProvider } from './types';
import { EventEmitter } from 'events';
export declare class IntegrationManager extends EventEmitter {
    private registry;
    private connectors;
    private activeConnections;
    constructor();
    getAvailableIntegrations(): IntegrationConfig[];
    getIntegrationsByCategory(category: string): IntegrationConfig[];
    getModelProviders(): ModelProvider[];
    searchIntegrations(query: string): IntegrationConfig[];
    createConnector(integrationId: string, workspaceId: string, name: string, config: Record<string, any>, credentials: Record<string, any>): Promise<ConnectorInstance>;
    updateConnector(connectorId: string, updates: Partial<Pick<ConnectorInstance, 'name' | 'config' | 'credentials'>>): Promise<ConnectorInstance>;
    deleteConnector(connectorId: string): Promise<void>;
    testConnector(connectorId: string): Promise<{
        success: boolean;
        message?: string;
        details?: any;
    }>;
    executeAction(connectorId: string, action: string, params: Record<string, any>): Promise<any>;
    getConnector(connectorId: string): ConnectorInstance | undefined;
    getConnectorsByWorkspace(workspaceId: string): ConnectorInstance[];
    private validateConfig;
    private initializeConnection;
    private cleanupConnection;
    private createConnection;
    private loadConnectorClass;
    private runConnectorTest;
    private runConnectorAction;
    private encryptCredentials;
    private decryptCredentials;
    private generateId;
    private toPascalCase;
    private toCamelCase;
}
//# sourceMappingURL=manager.d.ts.map