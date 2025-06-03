import { PxWebAPI, PxWebRequestOptions, PxWebResponse, PxWebError } from './types.js';
/**
 * Generic PX-Web API client
 */
export declare class PxWebClient {
    private config;
    private static rateLimiter;
    constructor(config: PxWebAPI);
    /**
     * Create a client from the API registry
     */
    static fromRegistry(apiId: string): PxWebClient;
    /**
     * Create a client for a custom endpoint
     */
    static fromCustomEndpoint(baseUrl: string, options?: Partial<PxWebAPI>): PxWebClient;
    /**
     * Make a request to the API with rate limiting
     */
    request<T = any>(endpoint: string, options?: PxWebRequestOptions): Promise<PxWebResponse<T>>;
    /**
     * Get list of available databases
     */
    getDatabases(language?: string): Promise<PxWebResponse>;
    /**
     * Get contents of a specific database path
     */
    getDatabaseContents(path: string, language?: string): Promise<PxWebResponse>;
    /**
     * Get metadata for a specific table
     */
    getTableMetadata(tablePath: string, language?: string): Promise<PxWebResponse>;
    /**
     * Query data from a table with filters
     */
    queryData(tablePath: string, query: any, format?: string, language?: string): Promise<PxWebResponse>;
    /**
     * Build full URL for an endpoint
     */
    private buildUrl;
    /**
     * Get API configuration
     */
    getConfig(): PxWebAPI;
}
/**
 * Custom error class for PX-Web API errors
 */
export declare class PxWebError extends Error implements PxWebError {
    code: string;
    apiId: string;
    details?: any | undefined;
    constructor(code: string, message: string, apiId: string, details?: any | undefined);
}
