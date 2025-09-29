import { IntegrationRegistry } from './registry';
import { EventEmitter } from 'events';
export class IntegrationManager extends EventEmitter {
    constructor() {
        super();
        this.connectors = new Map();
        this.activeConnections = new Map();
        this.registry = IntegrationRegistry.getInstance();
    }
    // Get all available integrations
    getAvailableIntegrations() {
        return this.registry.getAllIntegrations();
    }
    // Get integrations by category
    getIntegrationsByCategory(category) {
        return this.registry.getIntegrationsByCategory(category);
    }
    // Get all model providers
    getModelProviders() {
        return this.registry.getAllModelProviders();
    }
    // Search integrations
    searchIntegrations(query) {
        return this.registry.searchIntegrations(query);
    }
    // Create connector instance
    async createConnector(integrationId, workspaceId, name, config, credentials) {
        const integration = this.registry.getIntegration(integrationId);
        if (!integration) {
            throw new Error(`Integration ${integrationId} not found`);
        }
        // Validate config and credentials
        await this.validateConfig(integration, config, credentials);
        const connector = {
            id: this.generateId(),
            integrationId,
            name,
            workspaceId,
            config,
            credentials: this.encryptCredentials(credentials),
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.connectors.set(connector.id, connector);
        // Initialize connection
        await this.initializeConnection(connector);
        this.emit('connector:created', connector);
        return connector;
    }
    // Update connector
    async updateConnector(connectorId, updates) {
        const connector = this.connectors.get(connectorId);
        if (!connector) {
            throw new Error(`Connector ${connectorId} not found`);
        }
        const integration = this.registry.getIntegration(connector.integrationId);
        if (updates.config || updates.credentials) {
            await this.validateConfig(integration, updates.config || connector.config, updates.credentials || this.decryptCredentials(connector.credentials));
        }
        Object.assign(connector, {
            ...updates,
            credentials: updates.credentials ? this.encryptCredentials(updates.credentials) : connector.credentials,
            updatedAt: new Date()
        });
        this.connectors.set(connectorId, connector);
        // Reinitialize connection if config changed
        if (updates.config || updates.credentials) {
            await this.initializeConnection(connector);
        }
        this.emit('connector:updated', connector);
        return connector;
    }
    // Delete connector
    async deleteConnector(connectorId) {
        const connector = this.connectors.get(connectorId);
        if (!connector) {
            throw new Error(`Connector ${connectorId} not found`);
        }
        // Cleanup connection
        await this.cleanupConnection(connectorId);
        this.connectors.delete(connectorId);
        this.activeConnections.delete(connectorId);
        this.emit('connector:deleted', { id: connectorId });
    }
    // Test connector connection
    async testConnector(connectorId) {
        const connector = this.connectors.get(connectorId);
        if (!connector) {
            throw new Error(`Connector ${connectorId} not found`);
        }
        try {
            const connection = this.activeConnections.get(connectorId);
            if (!connection) {
                throw new Error('Connection not initialized');
            }
            // Run integration-specific test
            const result = await this.runConnectorTest(connector, connection);
            return {
                success: true,
                message: 'Connection test successful',
                details: result
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
                details: error
            };
        }
    }
    // Execute connector action
    async executeAction(connectorId, action, params) {
        const connector = this.connectors.get(connectorId);
        if (!connector) {
            throw new Error(`Connector ${connectorId} not found`);
        }
        const connection = this.activeConnections.get(connectorId);
        if (!connection) {
            throw new Error('Connection not initialized');
        }
        const integration = this.registry.getIntegration(connector.integrationId);
        if (!integration.actions.includes(action)) {
            throw new Error(`Action ${action} not supported by integration ${integration.name}`);
        }
        try {
            const result = await this.runConnectorAction(connector, connection, action, params);
            this.emit('action:executed', {
                connectorId,
                action,
                params,
                result,
                timestamp: new Date()
            });
            return result;
        }
        catch (error) {
            this.emit('action:failed', {
                connectorId,
                action,
                params,
                error,
                timestamp: new Date()
            });
            throw error;
        }
    }
    // Get connector by ID
    getConnector(connectorId) {
        return this.connectors.get(connectorId);
    }
    // Get connectors by workspace
    getConnectorsByWorkspace(workspaceId) {
        return Array.from(this.connectors.values())
            .filter(connector => connector.workspaceId === workspaceId);
    }
    // Private methods
    async validateConfig(integration, config, credentials) {
        // Validate using Zod schemas
        try {
            integration.configSchema.parse(config);
            integration.credentialsSchema.parse(credentials);
        }
        catch (error) {
            throw new Error(`Invalid configuration: ${error}`);
        }
    }
    async initializeConnection(connector) {
        const integration = this.registry.getIntegration(connector.integrationId);
        const credentials = this.decryptCredentials(connector.credentials);
        // Create connection based on integration type
        const connection = await this.createConnection(integration, connector.config, credentials);
        this.activeConnections.set(connector.id, connection);
        this.emit('connection:initialized', { connectorId: connector.id });
    }
    async cleanupConnection(connectorId) {
        const connection = this.activeConnections.get(connectorId);
        if (connection && typeof connection.close === 'function') {
            await connection.close();
        }
        this.emit('connection:closed', { connectorId });
    }
    async createConnection(integration, config, credentials) {
        // Implementation would vary by integration type
        // This would dynamically import the appropriate connector class
        const ConnectorClass = await this.loadConnectorClass(integration.slug);
        return new ConnectorClass(config, credentials);
    }
    async loadConnectorClass(slug) {
        // Dynamic import based on integration slug
        try {
            const module = await import(`./connectors/${slug}`);
            return module.default || module[this.toPascalCase(slug) + 'Connector'];
        }
        catch (error) {
            throw new Error(`Failed to load connector for ${slug}: ${error}`);
        }
    }
    async runConnectorTest(connector, connection) {
        if (typeof connection.test === 'function') {
            return await connection.test();
        }
        throw new Error('Test method not implemented for this connector');
    }
    async runConnectorAction(connector, connection, action, params) {
        const methodName = this.toCamelCase(action);
        if (typeof connection[methodName] === 'function') {
            return await connection[methodName](params);
        }
        throw new Error(`Action method ${methodName} not implemented for this connector`);
    }
    encryptCredentials(credentials) {
        // Implementation would use proper encryption
        // For now, just return as-is (in production, use proper encryption)
        return credentials;
    }
    decryptCredentials(encryptedCredentials) {
        // Implementation would use proper decryption
        // For now, just return as-is (in production, use proper decryption)
        return encryptedCredentials;
    }
    generateId() {
        return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    toPascalCase(str) {
        return str.replace(/(^|-)(.)/g, (_, __, char) => char.toUpperCase());
    }
    toCamelCase(str) {
        return str.replace(/-(.)/g, (_, char) => char.toUpperCase());
    }
}
//# sourceMappingURL=manager.js.map