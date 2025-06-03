/**
 * Main entry point for the PX-Web API Registry System
 */
export * from './types.js';
export * from './registry.js';
export * from './client.js';
import { getApiConfig, getAvailableApis, getApisByCountry, getApisByLanguage, searchApis, createCustomApiConfig } from './registry.js';
import { PxWebClient } from './client.js';
export declare const PxWeb: {
    registry: Record<string, import("./types.js").PxWebAPI>;
    getApiConfig: typeof getApiConfig;
    getAvailableApis: typeof getAvailableApis;
    getApisByCountry: typeof getApisByCountry;
    getApisByLanguage: typeof getApisByLanguage;
    searchApis: typeof searchApis;
    createCustomApiConfig: typeof createCustomApiConfig;
    createClient: (apiId: string) => PxWebClient;
    createCustomClient: (baseUrl: string, options?: any) => PxWebClient;
    listApis: () => {
        id: string;
        name: string;
        country: string | undefined;
        languages: string[];
        description: string;
    }[];
    getApiInfo: (apiId: string) => {
        exampleUsage: string;
        id: string;
        name: string;
        baseUrl: string;
        languages: string[];
        rateLimit: {
            calls: number;
            period: number;
        };
        description: string;
        country?: string;
        organization?: string;
        metadata?: Record<string, any>;
    } | null;
};
