import { IntegrationConfig, ModelProvider } from './types';
export declare class IntegrationRegistry {
    private static instance;
    private integrations;
    private modelProviders;
    private categories;
    private constructor();
    static getInstance(): IntegrationRegistry;
    private loadIntegrations;
    private loadModelProviders;
    private indexByCategory;
    getAllIntegrations(): IntegrationConfig[];
    getIntegration(id: string): IntegrationConfig | undefined;
    getIntegrationsByCategory(category: string): IntegrationConfig[];
    getAllModelProviders(): ModelProvider[];
    getModelProvider(id: string): ModelProvider | undefined;
    searchIntegrations(query: string): IntegrationConfig[];
    private getAppsDataSources;
    private getModelProviders;
    private getInterfaces;
    private getDeveloperTools;
}
//# sourceMappingURL=registry.d.ts.map