/**
 * Core types for the generic PX-Web MCP server
 */

/**
 * Configuration for a PX-Web API endpoint
 */
export interface PxWebAPI {
  /** Unique identifier for this API */
  id: string;
  /** Human-readable name */
  name: string;
  /** Base URL for the API */
  baseUrl: string;
  /** Supported languages */
  languages: string[];
  /** Rate limiting configuration */
  rateLimit: {
    /** Number of calls allowed */
    calls: number;
    /** Time period in milliseconds */
    period: number;
  };
  /** Description for AI tools */
  description: string;
  /** Country or region this API covers */
  country?: string;
  /** Organization that provides this API */
  organization?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Request options for PX-Web API calls
 */
export interface PxWebRequestOptions {
  /** Language for the response */
  language?: string;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Generic query parameters for statistical data
 */
export interface PxWebQuery {
  /** API source to query */
  apiSource: string;
  /** Custom endpoint URL (if apiSource is 'custom') */
  customEndpoint?: string;
  /** Language for the response */
  language?: string;
  /** Database path */
  database?: string;
  /** Table ID */
  tableId?: string;
  /** Output format */
  format?: 'json' | 'json-stat' | 'json-stat2' | 'csv' | 'px';
}

/**
 * Response wrapper for API calls
 */
export interface PxWebResponse<T = any> {
  /** Response data */
  data: T;
  /** Source API information */
  source: {
    apiId: string;
    apiName: string;
    url: string;
  };
  /** Response metadata */
  metadata?: {
    language: string;
    format: string;
    timestamp: string;
  };
}

/**
 * Error information for failed API calls
 */
export interface PxWebError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Source API that generated the error */
  apiId: string;
  /** Original error details */
  details?: any;
}
