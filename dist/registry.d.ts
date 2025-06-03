import { PxWebAPI } from './types.js';
/**
 * Registry of known PX-Web API endpoints
 * Based on research from pxweb R package and various statistical agencies
 */
export declare const PX_WEB_API_REGISTRY: Record<string, PxWebAPI>;
/**
 * Get API configuration by ID
 */
export declare function getApiConfig(apiId: string): PxWebAPI | null;
/**
 * Get all available API IDs
 */
export declare function getAvailableApis(): string[];
/**
 * Get APIs by country
 */
export declare function getApisByCountry(country: string): PxWebAPI[];
/**
 * Get APIs that support a specific language
 */
export declare function getApisByLanguage(language: string): PxWebAPI[];
/**
 * Search APIs by name or description
 */
export declare function searchApis(query: string): PxWebAPI[];
/**
 * Create a custom API configuration
 */
export declare function createCustomApiConfig(id: string, baseUrl: string, options?: Partial<PxWebAPI>): PxWebAPI;
