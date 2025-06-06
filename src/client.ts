import fetch, { Response } from 'node-fetch';
import { PxWebAPI, PxWebRequestOptions, PxWebResponse, PxWebErrorInfo } from './types.js';
import { getApiConfig } from './registry.js';

/**
 * Rate limiter to track API calls per endpoint
 */
class RateLimiter {
  private callTimes: Map<string, number[]> = new Map();

  canMakeCall(apiId: string, config: PxWebAPI): boolean {
    const now = Date.now();
    const calls = this.callTimes.get(apiId) || [];
    
    const validCalls = calls.filter(time => now - time < config.rateLimit.period);
    this.callTimes.set(apiId, validCalls);
    
    return validCalls.length < config.rateLimit.calls;
  }

  recordCall(apiId: string): void {
    const now = Date.now();
    const calls = this.callTimes.get(apiId) || [];
    calls.push(now);
    this.callTimes.set(apiId, calls);
  }

  getTimeUntilNextCall(apiId: string, config: PxWebAPI): number {
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
  private static rateLimiter = new RateLimiter();
  
  constructor(private config: PxWebAPI) {}

  static fromRegistry(apiId: string): PxWebClient {
    const config = getApiConfig(apiId);
    if (!config) {
      throw new Error(`API '${apiId}' not found in registry`);
    }
    return new PxWebClient(config);
  }

  static fromCustomEndpoint(
    baseUrl: string, 
    options: Partial<PxWebAPI> = {}
  ): PxWebClient {
    const config: PxWebAPI = {
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
  async request<T = any>(
    endpoint: string,
    options: PxWebRequestOptions = {}
  ): Promise<PxWebResponse<T>> {
    if (!PxWebClient.rateLimiter.canMakeCall(this.config.id, this.config)) {
      const waitTime = PxWebClient.rateLimiter.getTimeUntilNextCall(this.config.id, this.config);
      throw new PxWebError(
        'RATE_LIMIT_EXCEEDED',
        `Rate limit exceeded for ${this.config.name}. Try again in ${Math.ceil(waitTime / 1000)} seconds.`,
        this.config.id,
        { waitTime }
      );
    }

    const url = this.buildUrl(endpoint, options);
    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'MCP-PxWeb-Client/1.0',
      ...options.headers
    };

    try {
      PxWebClient.rateLimiter.recordCall(this.config.id);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new PxWebError(
          'HTTP_ERROR',
          `HTTP ${response.status}: ${response.statusText}`,
          this.config.id,
          { status: response.status, statusText: response.statusText }
        );
      }

      const data = await response.json() as T;

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

    } catch (error) {
      if (error instanceof PxWebError) {
        throw error;
      }

      throw new PxWebError(
        'REQUEST_FAILED',
        `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.config.id,
        error
      );
    }
  }

  /**
   * Get list of available databases - Traditional PX-Web pattern
   */
  async getDatabases(language: string = 'en'): Promise<PxWebResponse> {
    return this.request(`/${language}`, { language });
  }

  /**
   * Get contents of a specific database path - Traditional PX-Web pattern
   */
  async getDatabaseContents(path: string, language: string = 'en'): Promise<PxWebResponse> {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return this.request(`/${language}/${cleanPath}`, { language });
  }

  /**
   * Get metadata for a specific table - Traditional PX-Web pattern
   */
  async getTableMetadata(tablePath: string, language: string = 'en'): Promise<PxWebResponse> {
    const cleanPath = tablePath.startsWith('/') ? tablePath.slice(1) : tablePath;
    return this.request(`/${language}/${cleanPath}`, { language });
  }

  /**
   * Query data from a table with filters - Enhanced for SCB POST format
   */
  async queryData(
    tablePath: string,
    selections: any[],
    format: string = 'json',
    language: string = 'en'
  ): Promise<PxWebResponse> {
    const cleanPath = tablePath.startsWith('/') ? tablePath.slice(1) : tablePath;
    const url = `/${language}/${cleanPath}`;
    
    // Try SCB-style POST body first
    let postBody;
    if (this.config.id === 'scb') {
      // SCB format with 'query' array
      postBody = {
        query: selections.map(sel => ({
          code: sel.code || sel.variable_code,
          selection: {
            filter: sel.selection?.filter || 'item',
            values: sel.selection?.values || sel.value_codes || []
          }
        })),
        response: { format }
      };
    } else {
      // Standard PX-Web format
      postBody = {
        query: Array.isArray(selections) ? selections : [selections],
        response: { format }
      };
    }

    const response = await fetch(this.buildUrl(url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(postBody)
    });

    if (!response.ok) {
      throw new PxWebError(
        'QUERY_FAILED',
        `Query failed: HTTP ${response.status} - ${response.statusText}`,
        this.config.id,
        { status: response.status, statusText: response.statusText }
      );
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
   * Query data with simple GET request (fallback to metadata)
   */
  async queryDataSimple(
    tablePath: string,
    format: string = 'json',
    language: string = 'en'
  ): Promise<PxWebResponse> {
    // Most PX-Web APIs don't support GET for data without selection
    // Return metadata instead
    return this.getTableMetadata(tablePath, language);
  }

  /**
   * Build full URL for an endpoint
   */
  private buildUrl(endpoint: string, options: PxWebRequestOptions = {}): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }

  getConfig(): PxWebAPI {
    return { ...this.config };
  }
}

/**
 * Custom error class for PX-Web API errors
 */
export class PxWebError extends Error {
  public code: string;
  public apiId: string;
  public details?: any;

  constructor(
    code: string,
    message: string,
    apiId: string,
    details?: any
  ) {
    super(message);
    this.name = 'PxWebError';
    this.code = code;
    this.apiId = apiId;
    this.details = details;
  }
}
