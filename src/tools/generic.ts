/**
 * Generic MCP tools wrapper that integrates generated tools with our API registry
 * This file bridges the gap between Kubb-generated tools and our multi-API approach
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
    .describe('Which PX-Web API to query'),
  custom_endpoint: z.string().optional()
    .describe('Custom API endpoint URL (required if api_source is "custom")'),
  language: z.string().default('en')
    .describe('Language code for the response (en, sv, fi, etc.)'),
});

/**
 * Base interface for all our generic tools
 */
interface GenericToolParams {
  api_source: string;
  custom_endpoint?: string;
  language?: string;
}

/**
 * Create a client from tool parameters
 */
function createClientFromParams(params: GenericToolParams): PxWebClient {
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
 * Generic tool: Discover available APIs
 */
export const DiscoverApisToolSchema = z.object({
  country_filter: z.string().optional().describe('Filter APIs by country name'),
  language_filter: z.string().optional().describe('Filter APIs by supported language'),
});

export const discoverApisTool: Tool = {
  name: 'px_discover_apis',
  description: 'Discover available PX-Web statistical APIs and their capabilities',
  inputSchema: DiscoverApisToolSchema,
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
  description: 'Get the root navigation structure showing available databases and folders from a PX-Web API',
  inputSchema: GetRootNavigationToolSchema,
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
  path: z.string().describe('Database/folder path to navigate to'),
});

export const getNavigationByPathTool: Tool = {
  name: 'px_get_navigation_by_path',
  description: 'Navigate to a specific path in the database hierarchy to see available folders and tables',
  inputSchema: GetNavigationByPathToolSchema,
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
  description: 'Search for statistical tables across a PX-Web API with filtering options',
  inputSchema: SearchTablesToolSchema,
};

export async function executeSearchTables(params: z.infer<typeof SearchTablesToolSchema>) {
  const client = createClientFromParams(params);
  
  try {
    // Build the endpoint with query parameters
    const queryParams = new URLSearchParams();
    if (params.language) queryParams.append('lang', params.language);
    if (params.search_query) queryParams.append('query', params.search_query);
    if (params.past_days) queryParams.append('pastDays', params.past_days.toString());
    queryParams.append('includeDiscontinued', params.include_discontinued.toString());
    queryParams.append('pageSize', params.page_size.toString());
    queryParams.append('pageNumber', params.page_number.toString());

    const response = await client.request(`/tables?${queryParams.toString()}`);
    return response;
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
  table_id: z.string().describe('Unique identifier of the table'),
  include_default_selection: z.boolean().default(false).describe('Include default variable selections'),
});

export const getTableMetadataTool: Tool = {
  name: 'px_get_table_metadata',
  description: 'Get detailed metadata about a statistical table including variables, values, and structure',
  inputSchema: GetTableMetadataToolSchema,
};

export async function executeGetTableMetadata(params: z.infer<typeof GetTableMetadataToolSchema>) {
  const client = createClientFromParams(params);
  
  try {
    const queryParams = new URLSearchParams();
    if (params.language) queryParams.append('lang', params.language);
    if (params.include_default_selection) queryParams.append('defaultSelection', 'true');

    const response = await client.request(`/tables/${params.table_id}/metadata?${queryParams.toString()}`);
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
  table_id: z.string().describe('Unique identifier of the table'),
  format: z.enum(['json-stat2', 'csv', 'xlsx', 'px', 'json-px']).default('json-stat2')
    .describe('Output format for the data'),
  variable_selections: z.array(z.object({
    variable_code: z.string().describe('Variable code'),
    value_codes: z.array(z.string()).describe('Selected value codes for this variable'),
  })).optional().describe('Specific variable and value selections'),
});

export const queryTableDataTool: Tool = {
  name: 'px_query_table_data',
  description: 'Retrieve statistical data from a table with optional filtering and format selection',
  inputSchema: QueryTableDataToolSchema,
};

export async function executeQueryTableData(params: z.infer<typeof QueryTableDataToolSchema>) {
  const client = createClientFromParams(params);
  
  try {
    if (params.variable_selections && params.variable_selections.length > 0) {
      // Use POST for complex queries
      const queryBody = {
        selection: params.variable_selections.map(sel => ({
          variableCode: sel.variable_code,
          valueCodes: sel.value_codes,
        })),
      };

      const response = await client.queryData(
        params.table_id,
        queryBody,
        params.format,
        params.language
      );
      return response;
    } else {
      // Use GET for simple queries
      const queryParams = new URLSearchParams();
      if (params.language) queryParams.append('lang', params.language);
      queryParams.append('outputFormat', params.format);

      const response = await client.request(`/tables/${params.table_id}/data?${queryParams.toString()}`);
      return response;
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
export const GetApiConfigToolSchema = ApiSourceSchema.pick({ api_source: true, custom_endpoint: true });

export const getApiConfigTool: Tool = {
  name: 'px_get_api_config',
  description: 'Get API configuration including rate limits, supported languages, and available data formats',
  inputSchema: GetApiConfigToolSchema,
};

export async function executeGetApiConfig(params: z.infer<typeof GetApiConfigToolSchema>) {
  const client = createClientFromParams(params);
  
  try {
    const response = await client.request('/config');
    return response;
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
