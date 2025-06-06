/**
 * Main MCP Server implementation for PX-Web statistical APIs
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Import our generic tools
import {
  ALL_TOOLS,
  TOOL_EXECUTORS,
  executeDiscoverApis,
  executeGetRootNavigation,
  executeGetNavigationByPath,
  executeSearchTables,
  executeGetTableMetadata,
  executeQueryTableData,
  executeGetApiConfig,
} from './tools/generic.js';

import { PxWebError } from './client.js';

/**
 * PX-Web MCP Server class
 */
export class PxWebMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'px-web-mcp-server',
        version: '1.0.0',
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * Set up tool handlers
   */
  private setupToolHandlers() {
    // Register tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: ALL_TOOLS,
      };
    });

    // Register tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Find and execute the appropriate tool
        switch (name) {
          case 'px_discover_apis':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await executeDiscoverApis(args as any || {}), null, 2),
                },
              ],
            };

          case 'px_get_root_navigation':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await executeGetRootNavigation(args as any || {}), null, 2),
                },
              ],
            };

          case 'px_get_navigation_by_path':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await executeGetNavigationByPath(args as any || {}), null, 2),
                },
              ],
            };

          case 'px_search_tables':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await executeSearchTables(args as any || {}), null, 2),
                },
              ],
            };

          case 'px_get_table_metadata':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await executeGetTableMetadata(args as any || {}), null, 2),
                },
              ],
            };

          case 'px_query_table_data':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await executeQueryTableData(args as any || {}), null, 2),
                },
              ],
            };

          case 'px_get_api_config':
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(await executeGetApiConfig(args as any || {}), null, 2),
                },
              ],
            };

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        // Handle PX-Web specific errors
        if (error instanceof PxWebError) {
          throw new McpError(
            ErrorCode.InternalError,
            `PX-Web API Error [${error.code}]: ${error.message}`,
            {
              apiId: error.apiId,
              details: error.details,
            }
          );
        }

        // Handle validation errors
        if (error instanceof z.ZodError) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid parameters: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
            error.errors
          );
        }

        // Handle other errors
        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error
        );
      }
    });
  }

  /**
   * Set up error handling
   */
  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('PX-Web MCP Server started');
    console.error(`Registered ${ALL_TOOLS.length} tools:`);
    ALL_TOOLS.forEach(tool => {
      console.error(`  • ${tool.name}: ${tool.description}`);
    });
  }

  /**
   * Get the server instance
   */
  getServer(): Server {
    return this.server;
  }
}

/**
 * Create and start the MCP server
 */
export async function createAndStartServer(): Promise<PxWebMcpServer> {
  const server = new PxWebMcpServer();
  await server.start();
  return server;
}
