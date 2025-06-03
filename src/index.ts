/**
 * Main entry point for the PX-Web API Registry System
 */

// Core types
export * from './types.js';

// API registry and utilities
export * from './registry.js';

// Generic client
export * from './client.js';

// Re-export commonly used functions for convenience
import { 
  PX_WEB_API_REGISTRY, 
  getApiConfig, 
  getAvailableApis, 
  getApisByCountry, 
  getApisByLanguage,
  searchApis,
  createCustomApiConfig 
} from './registry.js';

import { PxWebClient } from './client.js';

// Convenience object for easy access
export const PxWeb = {
  // Registry access
  registry: PX_WEB_API_REGISTRY,
  getApiConfig,
  getAvailableApis,
  getApisByCountry,
  getApisByLanguage,
  searchApis,
  createCustomApiConfig,
  
  // Client factory methods
  createClient: (apiId: string) => PxWebClient.fromRegistry(apiId),
  createCustomClient: (baseUrl: string, options?: any) => 
    PxWebClient.fromCustomEndpoint(baseUrl, options),
  
  // Quick info methods
  listApis: () => {
    return Object.values(PX_WEB_API_REGISTRY).map(api => ({
      id: api.id,
      name: api.name,
      country: api.country,
      languages: api.languages,
      description: api.description
    }));
  },
  
  getApiInfo: (apiId: string) => {
    const config = getApiConfig(apiId);
    if (!config) return null;
    
    return {
      ...config,
      exampleUsage: `PxWeb.createClient('${apiId}').getDatabases()`
    };
  }
};
