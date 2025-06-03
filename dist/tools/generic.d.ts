/**
 * Generic MCP tools wrapper that integrates generated tools with our API registry
 * This file bridges the gap between Kubb-generated tools and our multi-API approach
 */
import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
/**
 * Schema for API source selection (used by all tools)
 */
export declare const ApiSourceSchema: z.ZodObject<{
    api_source: z.ZodEnum<["scb", "statfi", "statice", "hagstova", "greenland", "custom"]>;
    custom_endpoint: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    language: string;
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    custom_endpoint?: string | undefined;
}, {
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    language?: string | undefined;
    custom_endpoint?: string | undefined;
}>;
/**
 * Generic tool: Discover available APIs
 */
export declare const DiscoverApisToolSchema: z.ZodObject<{
    country_filter: z.ZodOptional<z.ZodString>;
    language_filter: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    country_filter?: string | undefined;
    language_filter?: string | undefined;
}, {
    country_filter?: string | undefined;
    language_filter?: string | undefined;
}>;
export declare const discoverApisTool: Tool;
export declare function executeDiscoverApis(params: z.infer<typeof DiscoverApisToolSchema>): Promise<{
    available_apis: ({
        id: string;
        name: string;
        country: string | undefined;
        languages: string[];
        description: string;
        baseUrl: string;
        rateLimit: {
            calls: number;
            period: number;
        };
    } | null)[];
    total_count: number;
    usage_note: string;
}>;
/**
 * Generic tool: Get root navigation
 */
export declare const GetRootNavigationToolSchema: z.ZodObject<{
    api_source: z.ZodEnum<["scb", "statfi", "statice", "hagstova", "greenland", "custom"]>;
    custom_endpoint: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    language: string;
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    custom_endpoint?: string | undefined;
}, {
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    language?: string | undefined;
    custom_endpoint?: string | undefined;
}>;
export declare const getRootNavigationTool: Tool;
export declare function executeGetRootNavigation(params: z.infer<typeof GetRootNavigationToolSchema>): Promise<import("../types.js").PxWebResponse<any>>;
/**
 * Generic tool: Get navigation by path
 */
export declare const GetNavigationByPathToolSchema: z.ZodObject<{
    api_source: z.ZodEnum<["scb", "statfi", "statice", "hagstova", "greenland", "custom"]>;
    custom_endpoint: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
} & {
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    language: string;
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    path: string;
    custom_endpoint?: string | undefined;
}, {
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    path: string;
    language?: string | undefined;
    custom_endpoint?: string | undefined;
}>;
export declare const getNavigationByPathTool: Tool;
export declare function executeGetNavigationByPath(params: z.infer<typeof GetNavigationByPathToolSchema>): Promise<import("../types.js").PxWebResponse<any>>;
/**
 * Generic tool: Search tables
 */
export declare const SearchTablesToolSchema: z.ZodObject<{
    api_source: z.ZodEnum<["scb", "statfi", "statice", "hagstova", "greenland", "custom"]>;
    custom_endpoint: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
} & {
    search_query: z.ZodString;
    past_days: z.ZodOptional<z.ZodNumber>;
    include_discontinued: z.ZodDefault<z.ZodBoolean>;
    page_size: z.ZodDefault<z.ZodNumber>;
    page_number: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    language: string;
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    search_query: string;
    include_discontinued: boolean;
    page_size: number;
    page_number: number;
    custom_endpoint?: string | undefined;
    past_days?: number | undefined;
}, {
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    search_query: string;
    language?: string | undefined;
    custom_endpoint?: string | undefined;
    past_days?: number | undefined;
    include_discontinued?: boolean | undefined;
    page_size?: number | undefined;
    page_number?: number | undefined;
}>;
export declare const searchTablesTool: Tool;
export declare function executeSearchTables(params: z.infer<typeof SearchTablesToolSchema>): Promise<import("../types.js").PxWebResponse<any>>;
/**
 * Generic tool: Get table metadata
 */
export declare const GetTableMetadataToolSchema: z.ZodObject<{
    api_source: z.ZodEnum<["scb", "statfi", "statice", "hagstova", "greenland", "custom"]>;
    custom_endpoint: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
} & {
    table_id: z.ZodString;
    include_default_selection: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    language: string;
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    table_id: string;
    include_default_selection: boolean;
    custom_endpoint?: string | undefined;
}, {
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    table_id: string;
    language?: string | undefined;
    custom_endpoint?: string | undefined;
    include_default_selection?: boolean | undefined;
}>;
export declare const getTableMetadataTool: Tool;
export declare function executeGetTableMetadata(params: z.infer<typeof GetTableMetadataToolSchema>): Promise<import("../types.js").PxWebResponse<any>>;
/**
 * Generic tool: Query table data
 */
export declare const QueryTableDataToolSchema: z.ZodObject<{
    api_source: z.ZodEnum<["scb", "statfi", "statice", "hagstova", "greenland", "custom"]>;
    custom_endpoint: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
} & {
    table_id: z.ZodString;
    format: z.ZodDefault<z.ZodEnum<["json-stat2", "csv", "xlsx", "px", "json-px"]>>;
    variable_selections: z.ZodOptional<z.ZodArray<z.ZodObject<{
        variable_code: z.ZodString;
        value_codes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        variable_code: string;
        value_codes: string[];
    }, {
        variable_code: string;
        value_codes: string[];
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    format: "json-stat2" | "csv" | "px" | "xlsx" | "json-px";
    language: string;
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    table_id: string;
    custom_endpoint?: string | undefined;
    variable_selections?: {
        variable_code: string;
        value_codes: string[];
    }[] | undefined;
}, {
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    table_id: string;
    format?: "json-stat2" | "csv" | "px" | "xlsx" | "json-px" | undefined;
    language?: string | undefined;
    custom_endpoint?: string | undefined;
    variable_selections?: {
        variable_code: string;
        value_codes: string[];
    }[] | undefined;
}>;
export declare const queryTableDataTool: Tool;
export declare function executeQueryTableData(params: z.infer<typeof QueryTableDataToolSchema>): Promise<import("../types.js").PxWebResponse<any>>;
/**
 * Generic tool: Get API configuration
 */
export declare const GetApiConfigToolSchema: z.ZodObject<Pick<{
    api_source: z.ZodEnum<["scb", "statfi", "statice", "hagstova", "greenland", "custom"]>;
    custom_endpoint: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
}, "api_source" | "custom_endpoint">, "strip", z.ZodTypeAny, {
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    custom_endpoint?: string | undefined;
}, {
    api_source: "scb" | "statfi" | "statice" | "hagstova" | "greenland" | "custom";
    custom_endpoint?: string | undefined;
}>;
export declare const getApiConfigTool: Tool;
export declare function executeGetApiConfig(params: z.infer<typeof GetApiConfigToolSchema>): Promise<import("../types.js").PxWebResponse<any>>;
/**
 * Export all tools for easy registration
 */
export declare const ALL_TOOLS: z.objectOutputType<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    inputSchema: z.ZodObject<{
        type: z.ZodLiteral<"object">;
        properties: z.ZodOptional<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodLiteral<"object">;
        properties: z.ZodOptional<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodLiteral<"object">;
        properties: z.ZodOptional<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>>;
    }, z.ZodTypeAny, "passthrough">>;
}, z.ZodTypeAny, "passthrough">[];
/**
 * Export all executors for easy registration
 */
export declare const TOOL_EXECUTORS: {
    px_discover_apis: typeof executeDiscoverApis;
    px_get_root_navigation: typeof executeGetRootNavigation;
    px_get_navigation_by_path: typeof executeGetNavigationByPath;
    px_search_tables: typeof executeSearchTables;
    px_get_table_metadata: typeof executeGetTableMetadata;
    px_query_table_data: typeof executeQueryTableData;
    px_get_api_config: typeof executeGetApiConfig;
};
