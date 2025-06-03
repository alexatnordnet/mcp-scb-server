import fetch from 'node-fetch';
import { PxWebError } from './types.js';
import { getApiConfig } from './registry.js';
/**
 * Rate limiter to track API calls per endpoint
 */
class RateLimiter {
    callTimes = new Map();
    /**
     * Check if a call is allowed for the given API
     */
    canMakeCall(apiId, config) {
        const now = Date.now();
        const calls = this.callTimes.get(apiId) || [];
        // Remove calls outside the rate limit period
        const validCalls = calls.filter(time => now - time < config.rateLimit.period);
        // Update the tracked calls
        this.callTimes.set(apiId, validCalls);
        return validCalls.length < config.rateLimit.calls;
    }
    /**
     * Record a new API call
     */
    recordCall(apiId) {
        const now = Date.now();
        const calls = this.callTimes.get(apiId) || [];
        calls.push(now);
        this.callTimes.set(apiId, calls);
    }
    /**
     * Get time until next call is allowed (in milliseconds)
     */
    getTimeUntilNextCall(apiId, config) {
        const now = Date.now();
        const calls = this.callTimes.get(apiId) || [];
        if (calls.length < config.rateLimit.calls) {
            return 0;
        }
        const oldestCall = Math.min(...calls);
        return Math.max(0, (oldestCall + config.rateLimit.period) - now);
    }
}
/**
 * Generic PX-Web API client
 */
export class PxWebClient {
    config;
    static rateLimiter = new RateLimiter();
    constructor(config) {
        this.config = config;
    }
    /**
     * Create a client from the API registry
     */
    static fromRegistry(apiId) {
        const config = getApiConfig(apiId);
        if (!config) {
            throw new Error(`API '${apiId}' not found in registry`);
        }
        return new PxWebClient(config);
    }
    /**
     * Create a client for a custom endpoint
     */
    static fromCustomEndpoint(baseUrl, options = {}) {
        const config = {
            id: 'custom',
            name: 'Custom PX-Web API',
            baseUrl,
            languages: ['en'],
            rateLimit: { calls: 10, period: 10000 },
            description: 'Custom PX-Web endpoint',
            ...options
        };
        return new PxWebClient(config);
    }
    /**
     * Make a request to the API with rate limiting
     */
    async request(endpoint, options = {}) {
        // Check rate limiting
        if (!PxWebClient.rateLimiter.canMakeCall(this.config.id, this.config)) {
            const waitTime = PxWebClient.rateLimiter.getTimeUntilNextCall(this.config.id, this.config);
            throw new PxWebError('RATE_LIMIT_EXCEEDED', `Rate limit exceeded for ${this.config.name}. Try again in ${Math.ceil(waitTime / 1000)} seconds.`, this.config.id, { waitTime });
        }
        // Build URL
        const url = this.buildUrl(endpoint, options);
        // Prepare headers
        const headers = {
            'Accept': 'application/json',
            'User-Agent': 'MCP-PxWeb-Client/1.0',
            ...options.headers
        };
        try {
            // Record the call for rate limiting
            PxWebClient.rateLimiter.recordCall(this.config.id);
            // Make the request
            const response = await fetch(url, {
                method: 'GET',
                headers,
                timeout: options.timeout || 30000
            });
            if (!response.ok) {
                throw new PxWebError('HTTP_ERROR', `HTTP ${response.status}: ${response.statusText}`, this.config.id, { status: response.status, statusText: response.statusText });
            }
            const data = await response.json();
            return {
                data,
                source: {
                    apiId: this.config.id,
                    apiName: this.config.name,
                    url
                },
                metadata: {
                    language: options.language || 'en',
                    format: 'json',
                    timestamp: new Date().toISOString()
                }
            };
        }
        catch (error) {
            if (error instanceof PxWebError) {
                throw error;
            }
            throw new PxWebError('REQUEST_FAILED', `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`, this.config.id, error);
        }
    }
    /**
     * Get list of available databases
     */
    async getDatabases(language = 'en') {
        return this.request(`/${language}`, { language });
    }
    /**
     * Get contents of a specific database path
     */
    async getDatabaseContents(path, language = 'en') {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return this.request(`/${language}/${cleanPath}`, { language });
    }
    /**
     * Get metadata for a specific table
     */
    async getTableMetadata(tablePath, language = 'en') {
        const cleanPath = tablePath.startsWith('/') ? tablePath.slice(1) : tablePath;
        return this.request(`/${language}/${cleanPath}`, { language });
    }
    /**
     * Query data from a table with filters
     */
    async queryData(tablePath, query, format = 'json', language = 'en') {
        const cleanPath = tablePath.startsWith('/') ? tablePath.slice(1) : tablePath;
        const url = `/${language}/${cleanPath}`;
        // For POST requests with query data
        const response = await fetch(this.buildUrl(url), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: Array.isArray(query) ? query : [query],
                response: { format }
            })
        });
        if (!response.ok) {
            throw new PxWebError('QUERY_FAILED', `Query failed: HTTP ${response.status}`, this.config.id, { status: response.status });
        }
        const data = await response.json();
        return {
            data,
            source: {
                apiId: this.config.id,
                apiName: this.config.name,
                url: this.buildUrl(url)
            },
            metadata: {
                language,
                format,
                timestamp: new Date().toISOString()
            }
        };
    }
    /**
     * Build full URL for an endpoint
     */
    buildUrl(endpoint, options = {}) {
        const baseUrl = this.config.baseUrl.replace(/\/$/, '');
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${baseUrl}${cleanEndpoint}`;
    }
    /**
     * Get API configuration
     */
    getConfig() {
        return { ...this.config };
    }
}
/**
 * Custom error class for PX-Web API errors
 */
export class PxWebError extends Error {
    code;
    apiId;
    details;
    constructor(code, message, apiId, details) {
        super(message);
        this.code = code;
        this.apiId = apiId;
        this.details = details;
        this.name = 'PxWebError';
    }
}
