/**
 * Generic MCP tools wrapper that integrates generated tools with our API registry
 * This file bridges the gap between Kubb-generated tools and our multi-API approach
 * 
 * TYPICAL WORKFLOW FOR ACCESSING STATISTICAL DATA:
 * 1. px_discover_apis - Find available statistical agencies
 * 2. px_get_root_navigation - Browse main topic categories (Population, Economy, etc.)
 * 3. px_get_navigation_by_path - Drill down to specific data tables 
 * 4. px_get_table_metadata - Understand table structure and available variables
 * 5. px_query_table_data - Retrieve actual statistical data with specific filters
 * 
 * IMPORTANT: PX-Web APIs do not support search - you must navigate hierarchically
 */

import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { PxWebClient, PxWebError } from '../client.js';
import { getApiConfig, getAvailableApis } from '../registry.js';

/**
 * Schema for API source selection (used by all tools)
 */
export const ApiSourceSchema = z.object({
  api_source: z.enum(['scb', 'statfi', 'statice', 'hagstova', 'greenland', 'custom'] as const)
    .describe('Which PX-Web API to query: "scb" for Sweden, "statfi" for Finland, "statice" for Iceland, "hagstova" for Faroe Islands, "greenland" for Greenland, "custom" for other PX-Web APIs'),
  custom_endpoint: z.string().optional()
    .describe('Custom API endpoint URL (required if api_source is "custom"). Must be a valid PX-Web API base URL'),
  language: z.string().default('en')
    .describe('Language code for the response. Common values: "en" (English), "sv" (Swedish), "fi" (Finnish), "is" (Icelandic), "da" (Danish)'),
});

/**
 * Base interface for all our generic tools
 * This matches the ApiSourceSchema structure
 */
interface GenericToolParams {
  api_source: 'scb' | 'statfi' | 'statice' | 'hagstova' | 'greenland' | 'custom';
  custom_endpoint?: string;
  language?: string;
}

/**
 * Type alias for API source schema inference
 */
type ApiSourceParams = z.infer<typeof ApiSourceSchema>;

/**
 * Create a client from tool parameters
 */
function createClientFromParams(params: ApiSourceParams): PxWebClient {
  if (params.api_source === 'custom') {
    if (!params.custom_endpoint) {
      throw new PxWebError(
        'MISSING_ENDPOINT',
        'custom_endpoint is required when api_source is "custom"',
        'custom'
      );
    }
    return PxWebClient.fromCustomEndpoint(params.custom_endpoint);
  }

  return PxWebClient.fromRegistry(params.api_source);
}

/**
 * Convert Zod schema to MCP input schema format
 * Properly handles arrays, objects, and nested schemas
 */
function zodToMcpSchema(zodSchema: z.ZodType<any>): any {
  // Handle ZodObject
  if (zodSchema instanceof z.ZodObject) {
    const properties: any = {};
    const required: string[] = [];
    
    for (const [key, value] of Object.entries(zodSchema.shape)) {
      properties[key] = zodToMcpSchema(value as z.ZodType<any>);
      
      // Check if field is required (not optional)
      if (!(value instanceof z.ZodOptional)) {
        required.push(key);
      }
    }
    
    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
      additionalProperties: false
    };
  }
  
  // Handle ZodArray
  if (zodSchema instanceof z.ZodArray) {
    return {
      type: "array",
      items: zodToMcpSchema(zodSchema.element)
    };
  }
  
  // Handle ZodString
  if (zodSchema instanceof z.ZodString) {
    return { type: "string" };
  }
  
  // Handle ZodNumber
  if (zodSchema instanceof z.ZodNumber) {
    return { type: "number" };
  }
  
  // Handle ZodBoolean
  if (zodSchema instanceof z.ZodBoolean) {
    return { type: "boolean" };
  }
  
  // Handle ZodEnum
  if (zodSchema instanceof z.ZodEnum) {
    return {
      type: "string",
      enum: zodSchema.options
    };
  }
  
  // Handle ZodOptional
  if (zodSchema instanceof z.ZodOptional) {
    return zodToMcpSchema(zodSchema.unwrap());
  }
  
  // Handle ZodDefault
  if (zodSchema instanceof z.ZodDefault) {
    const schema = zodToMcpSchema(zodSchema.removeDefault());
    schema.default = zodSchema._def.defaultValue();
    return schema;
  }
  
  // Fallback for unknown types
  return {
    type: "object",
    additionalProperties: true
  };
}

/**
 * Generic tool: Discover available APIs
 */
export const DiscoverApisToolSchema = z.object({
  country_filter: z.string().optional().describe('Filter APIs by country name'),
  language_filter: z.string().optional().describe('Filter APIs by supported language'),
});

export const discoverApisTool: Tool = {
  name: 'px_discover_apis',
  description: 'Discover available PX-Web statistical APIs and their capabilities. Use this first to find which Nordic statistical agencies (Sweden, Finland, Iceland, Faroe Islands, Greenland) have data available. Returns API IDs needed for other tools.',
  inputSchema: zodToMcpSchema(DiscoverApisToolSchema),
};

export async function executeDiscoverApis(params: z.infer<typeof DiscoverApisToolSchema>) {
  const { country_filter, language_filter } = params;
  
  let apis = getAvailableApis().map(id => {
    const config = getApiConfig(id);
    return config ? {
      id: config.id,
      name: config.name,
      country: config.country,
      languages: config.languages,
      description: config.description,
      baseUrl: config.baseUrl,
      rateLimit: config.rateLimit,
    } : null;
  }).filter(Boolean);

  // Apply filters
  if (country_filter) {
    apis = apis.filter(api => 
      api!.country?.toLowerCase().includes(country_filter.toLowerCase())
    );
  }

  if (language_filter) {
    apis = apis.filter(api =>
      api!.languages.includes(language_filter.toLowerCase())
    );
  }

  return {
    available_apis: apis,
    total_count: apis.length,
    usage_note: 'Use any of these API IDs in the api_source parameter of other tools',
  };
}

/**
 * Generic tool: Get root navigation
 */
export const GetRootNavigationToolSchema = ApiSourceSchema;

export const getRootNavigationTool: Tool = {
  name: 'px_get_root_navigation',
  description: 'Get the root navigation structure showing available databases and topic categories (e.g., Population, Economy, Education) from a PX-Web API. Use this to browse the main statistical subject areas available in an API. Required parameter: api_source (scb, statfi, statice, hagstova, greenland).',
  inputSchema: zodToMcpSchema(GetRootNavigationToolSchema),
};

export async function executeGetRootNavigation(params: z.infer<typeof GetRootNavigationToolSchema>) {
  const client = createClientFromParams(params);
  
  try {
    const response = await client.getDatabases(params.language);
    return response;
  } catch (error) {
    if (error instanceof PxWebError) {
      throw error;
    }
    throw new PxWebError(
      'NAVIGATION_ERROR',
      `Failed to get root navigation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      params.api_source,
      error
    );
  }
}

/**
 * Generic tool: Get navigation by path
 */
export const GetNavigationByPathToolSchema = ApiSourceSchema.extend({
  path: z.string().describe('Database/folder path to navigate to (e.g., "BE" for Population, "NR" for National Accounts). Use paths from previous navigation results.'),
});

export const getNavigationByPathTool: Tool = {
  name: 'px_get_navigation_by_path',
  description: 'Navigate deeper into statistical topic areas to find specific data tables. Use the path from previous navigation results to drill down (e.g., "BE" for Population, "NR" for National Accounts). Returns subfolders and actual data tables with their IDs.',
  inputSchema: zodToMcpSchema(GetNavigationByPathToolSchema),
};

export async function executeGetNavigationByPath(params: z.infer<typeof GetNavigationByPathToolSchema>) {
  const client = createClientFromParams(params);
  
  try {
    const response = await client.getDatabaseContents(params.path, params.language);
    return response;
  } catch (error) {
    if (error instanceof PxWebError) {
      throw error;
    }
    throw new PxWebError(
      'NAVIGATION_ERROR',
      `Failed to navigate to path "${params.path}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      params.api_source,
      error
    );
  }
}

/**
 * Generic tool: Search tables
 */
export const SearchTablesToolSchema = ApiSourceSchema.extend({
  search_query: z.string().describe('Search term to find relevant tables'),
  past_days: z.number().optional().describe('Only include tables updated in the last N days'),
  include_discontinued: z.boolean().default(false).describe('Include discontinued tables in results'),
  page_size: z.number().default(20).describe('Number of results per page'),
  page_number: z.number().default(1).describe('Page number for pagination'),
});

export const searchTablesTool: Tool = {
  name: 'px_search_tables',
  description: 'NOTE: Most PX-Web APIs do not support search functionality. Use navigation tools (px_get_root_navigation and px_get_navigation_by_path) instead to browse categories and find tables. This tool will return a helpful error message explaining how to find data.',
  inputSchema: zodToMcpSchema(SearchTablesToolSchema),
};

export async function executeSearchTables(params: z.infer<typeof SearchTablesToolSchema>) {
  const client = createClientFromParams(params);
  
  try {
    // PX-Web APIs don't have a generic search endpoint
    // Search functionality is typically done by navigating the hierarchy
    // This is a limitation of the PX-Web API standard
    const response = {
      error: 'SEARCH_NOT_SUPPORTED',
      message: 'PX-Web APIs do not support generic table search. Use navigation tools to browse categories and find tables.',
      suggestion: 'Use px_get_root_navigation and px_get_navigation_by_path to explore available data.',
      search_query: params.search_query
    };
    
    return {
      data: response,
      source: {
        apiId: client.getConfig().id,
        apiName: client.getConfig().name,
        url: 'N/A - Search not supported'
      },
      metadata: {
        language: params.language || 'en',
        format: 'json',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    if (error instanceof PxWebError) {
      throw error;
    }
    throw new PxWebError(
      'SEARCH_ERROR',
      `Failed to search tables: ${error instanceof Error ? error.message : 'Unknown error'}`,
      params.api_source,
      error
    );
  }
}

/**
 * Generic tool: Get table metadata
 */
export const GetTableMetadataToolSchema = ApiSourceSchema.extend({
  table_id: z.string().describe('Unique identifier of the table (obtained from navigation results). Examples: "BE0101N1", "NR0103ENS2010T02A"'),
  include_default_selection: z.boolean().default(false).describe('Include default variable selections in metadata'),
});

export const getTableMetadataTool: Tool = {
  name: 'px_get_table_metadata',
  description: 'Get detailed metadata about a statistical table including all available variables (dimensions like Age, Time, Region) and their possible values. Essential for understanding table structure before querying data. Use table_id from navigation results.',
  inputSchema: zodToMcpSchema(GetTableMetadataToolSchema),
};

export async function executeGetTableMetadata(params: z.infer<typeof GetTableMetadataToolSchema>) {
  const client = createClientFromParams(params);
  
  try {
    // Use the existing getTableMetadata method that uses correct PX-Web API pattern
    const response = await client.getTableMetadata(params.table_id, params.language);
    return response;
  } catch (error) {
    if (error instanceof PxWebError) {
      throw error;
    }
    throw new PxWebError(
      'METADATA_ERROR',
      `Failed to get table metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
      params.api_source,
      error
    );
  }
}

/**
 * Generic tool: Query table data
 */
export const QueryTableDataToolSchema = ApiSourceSchema.extend({
  table_id: z.string().describe('Unique identifier of the table (same as used in metadata call)'),
  format: z.enum(['json-stat2', 'csv', 'xlsx', 'px', 'json-px', 'json']).default('json')
    .describe('Output format for the data. "json" is recommended for Claude processing'),
  variable_selections: z.array(z.object({
    variable_code: z.string().describe('Variable code from table metadata (e.g., "Alder" for age, "Tid" for time, "Region" for geography)'),
    value_codes: z.array(z.string()).describe('Selected value codes for this variable from metadata (e.g., ["tot"] for total, ["2024"] for year 2024, ["00"] for whole country)'),
    filter_type: z.enum(['item', 'all', 'top', 'agg']).default('item').describe('Selection filter type: "item" for specific values, "all" for all values, "top" for top N values')
  })).optional().describe('REQUIRED: Specific variable and value selections. Must include selections for all variables or those you want to filter. Get variable codes from table metadata first.'),
});

export const queryTableDataTool: Tool = {
  name: 'px_query_table_data',
  description: 'Retrieve actual statistical data from a table. IMPORTANT: Always get table metadata first to understand available variables and values. Requires variable_selections with specific variable codes and value codes from the metadata. Example: [{"variable_code": "Alder", "value_codes": ["tot"]}, {"variable_code": "Tid", "value_codes": ["2024"]}]',
  inputSchema: zodToMcpSchema(QueryTableDataToolSchema),
};

export async function executeQueryTableData(params: z.infer<typeof QueryTableDataToolSchema>) {
  const client = createClientFromParams(params);
  
  try {
    if (params.variable_selections && params.variable_selections.length > 0) {
      // Use the WORKING POST format from our curl test
      const queryBody = {
        query: params.variable_selections.map(sel => ({
          code: sel.variable_code,
          selection: {
            filter: sel.filter_type || 'item',
            values: sel.value_codes
          }
        })),
        response: {
          format: params.format
        }
      };

      const response = await client.queryDataWithWorkingFormat(
        params.table_id,
        queryBody,
        params.language
      );
      return response;
    } else {
      // For simple queries without selections, return metadata with note
      const response = await client.getTableMetadata(params.table_id, params.language);
      return {
        ...response,
        note: 'No variable selections provided. Returned table metadata. To get actual data, specify variable_selections with variable codes and value codes.',
        example_usage: 'variable_selections: [{"variable_code": "Alder", "value_codes": ["tot"]}, {"variable_code": "Tid", "value_codes": ["2024"]}]'
      };
    }
  } catch (error) {
    if (error instanceof PxWebError) {
      throw error;
    }
    throw new PxWebError(
      'QUERY_ERROR',
      `Failed to query table data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      params.api_source,
      error
    );
  }
}

/**
 * Generic tool: Get API configuration
 */
export const GetApiConfigToolSchema = ApiSourceSchema.pick({ api_source: true, custom_endpoint: true, language: true });

export const getApiConfigTool: Tool = {
  name: 'px_get_api_config',
  description: 'Get API configuration details including rate limits, supported languages (en, sv, fi, is, da, etc.), country coverage, and organization info. Useful for understanding API capabilities and constraints.',
  inputSchema: zodToMcpSchema(GetApiConfigToolSchema),
};

export async function executeGetApiConfig(params: z.infer<typeof GetApiConfigToolSchema>) {
  const client = createClientFromParams(params);
  
  try {
    // Return the configuration from our registry rather than trying to fetch from API
    // Most PX-Web APIs don't have a /config endpoint
    const config = client.getConfig();
    
    return {
      data: {
        id: config.id,
        name: config.name,
        baseUrl: config.baseUrl,
        languages: config.languages,
        rateLimit: config.rateLimit,
        description: config.description,
        country: config.country,
        organization: config.organization,
        metadata: config.metadata
      },
      source: {
        apiId: config.id,
        apiName: config.name,
        url: 'Registry configuration'
      },
      metadata: {
        language: params.language || 'en',
        format: 'json',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    if (error instanceof PxWebError) {
      throw error;
    }
    throw new PxWebError(
      'CONFIG_ERROR',
      `Failed to get API configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
      params.api_source,
      error
    );
  }
}

/**
 * Export all tools for easy registration
 */
export const ALL_TOOLS = [
  discoverApisTool,
  getRootNavigationTool,
  getNavigationByPathTool,
  searchTablesTool,
  getTableMetadataTool,
  queryTableDataTool,
  getApiConfigTool,
];

/**
 * Export all executors for easy registration
 */
export const TOOL_EXECUTORS = {
  'px_discover_apis': executeDiscoverApis,
  'px_get_root_navigation': executeGetRootNavigation,
  'px_get_navigation_by_path': executeGetNavigationByPath,
  'px_search_tables': executeSearchTables,
  'px_get_table_metadata': executeGetTableMetadata,
  'px_query_table_data': executeQueryTableData,
  'px_get_api_config': executeGetApiConfig,
};
