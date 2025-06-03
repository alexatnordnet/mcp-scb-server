import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginZod } from '@kubb/plugin-zod';
import { pluginMcp } from '@kubb/plugin-mcp';

export default defineConfig({
  root: '.',
  input: {
    path: './specs/px-web-api.yml',
  },
  output: {
    path: './src/generated',
    clean: true,
  },
  plugins: [
    // Core OpenAPI plugin - parses the spec
    pluginOas({
      generators: [], // We don't need the default generators
      validate: true,
    }),

    // Generate TypeScript types
    pluginTs({
      output: {
        path: './types',
        exportType: 'barrel',
      },
      group: {
        type: 'tag',
        output: './types/{{tag}}Types',
      },
      enumType: 'asConst',
      dateType: 'date',
      unknownType: 'unknown',
      optionalType: 'questionToken',
    }),

    // Generate Zod schemas for validation
    pluginZod({
      output: {
        path: './schemas',
        exportType: 'barrel',
      },
      group: {
        type: 'tag', 
        output: './schemas/{{tag}}Schemas',
      },
      typed: true,
      dateType: 'stringOffset',
      unknownType: 'unknown',
      importPath: 'zod',
    }),

    // Generate MCP tools
    pluginMcp({
      output: {
        path: './mcp',
        exportType: 'barrel',
      },
      group: {
        type: 'tag',
        output: './mcp/{{tag}}Tools',
      },
      // Customize tool generation
      transformers: {
        // Transform operation names to be more AI-friendly
        name: (name, type) => {
          if (type === 'function') {
            // Convert operation IDs to snake_case for better MCP tool names
            return name
              .replace(/([A-Z])/g, '_$1')
              .toLowerCase()
              .replace(/^_/, '')
              .replace('get_', 'px_get_')
              .replace('list_', 'px_list_');
          }
          return name;
        },
      },
      // Include/exclude specific operations
      include: [
        {
          type: 'tag',
          pattern: 'Navigation',
        },
        {
          type: 'tag', 
          pattern: 'Table',
        },
        {
          type: 'tag',
          pattern: 'Configuration',
        },
      ],
      // Override specific operations for better AI descriptions
      override: [
        {
          type: 'operationId',
          pattern: 'GetNavigationRoot',
          options: {
            description: 'Get the root navigation structure of available databases and folders from a PX-Web API',
          },
        },
        {
          type: 'operationId',
          pattern: 'GetNavigationById',
          options: {
            description: 'Navigate to a specific folder or get information about databases and tables',
          },
        },
        {
          type: 'operationId',
          pattern: 'ListAllTables',
          options: {
            description: 'Search and list all available statistical tables with filtering options',
          },
        },
        {
          type: 'operationId',
          pattern: 'GetTableById',
          options: {
            description: 'Get basic information about a specific statistical table',
          },
        },
        {
          type: 'operationId',
          pattern: 'GetMetadataById',
          options: {
            description: 'Get detailed metadata about a table including variables, values, and data structure',
          },
        },
        {
          type: 'operationId',
          pattern: 'GetTableData',
          options: {
            description: 'Retrieve statistical data from a table with optional filtering and format selection',
          },
        },
        {
          type: 'operationId',
          pattern: 'GetTableDataByPost',
          options: {
            description: 'Query statistical data with complex filters and variable selections',
          },
        },
        {
          type: 'operationId',
          pattern: 'GetApiConfiguration',
          options: {
            description: 'Get API configuration including rate limits, supported languages, and data formats',
          },
        },
      ],
    }),
  ],
  hooks: {
    done: ['npm run build:types'],
  },
});
