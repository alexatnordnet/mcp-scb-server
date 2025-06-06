# Claude Desktop Configuration Example

To use this MCP server with Claude Desktop, add the following configuration to your Claude Desktop settings.

## Configuration File Location

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

## Configuration Content

```json
{
  "mcpServers": {
    "px-web-statistics": {
      "command": "node",
      "args": ["/path/to/your/mcp-scb-server/dist/main.js"],
      "env": {}
    }
  }
}
```

## Development Configuration

For development (using tsx directly):

```json
{
  "mcpServers": {
    "px-web-statistics": {
      "command": "npx",
      "args": ["tsx", "/path/to/your/mcp-scb-server/src/main.ts"],
      "env": {}
    }
  }
}
```

## Setup Steps

1. **Build the server**:
   ```bash
   cd /path/to/your/mcp-scb-server
   npm run build
   ```

2. **Update the configuration**:
   - Replace `/path/to/your/mcp-scb-server` with the actual path to your project
   - Save the configuration file

3. **Restart Claude Desktop**:
   - Close Claude Desktop completely
   - Reopen Claude Desktop
   - The MCP server should be loaded automatically

4. **Verify connection**:
   - Start a new conversation in Claude Desktop
   - Try asking: "What statistical APIs are available?"
   - Claude should be able to use the `px_discover_apis` tool

## Available Tools

Once connected, Claude will have access to these tools:

- **px_discover_apis** - Find available statistical APIs
- **px_get_root_navigation** - Browse database structure
- **px_get_navigation_by_path** - Navigate to specific paths
- **px_search_tables** - Search for statistical tables
- **px_get_table_metadata** - Get table structure and variables
- **px_query_table_data** - Retrieve actual statistical data
- **px_get_api_config** - Get API configuration

## Example Usage

Try asking Claude:

- "What statistical data is available from Sweden?"
- "Show me population tables from Statistics Finland"
- "Get the latest economic indicators from SCB"
- "Compare unemployment data between Sweden and Finland"

## Troubleshooting

1. **Server not starting**:
   - Check that Node.js is installed and accessible
   - Verify the path in the configuration is correct
   - Run `npm run test-mcp` to test the server locally

2. **Tools not available**:
   - Check Claude Desktop console for error messages
   - Verify the server is running: `npm run mcp:dev`
   - Ensure all dependencies are installed: `npm install`

3. **API rate limits**:
   - Each statistical agency has different rate limits
   - The server respects these limits automatically
   - Wait if you encounter rate limit errors

## Advanced Configuration

You can also run multiple instances for different purposes:

```json
{
  "mcpServers": {
    "px-web-sweden": {
      "command": "node",
      "args": ["/path/to/mcp-scb-server/dist/main.js"],
      "env": {
        "DEFAULT_API": "scb",
        "DEFAULT_LANGUAGE": "en"
      }
    },
    "px-web-finland": {
      "command": "node", 
      "args": ["/path/to/mcp-scb-server/dist/main.js"],
      "env": {
        "DEFAULT_API": "statfi",
        "DEFAULT_LANGUAGE": "en"
      }
    }
  }
}
```
