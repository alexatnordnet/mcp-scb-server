# MCP SCB Server

A generic Model Context Protocol (MCP) server for PX-Web statistical APIs, starting with Statistics Sweden (SCB) and expandable to other statistical agencies.

## Features

- **Generic tools** that work across multiple PX-Web APIs
- **Multi-API support**: Statistics Sweden, Statistics Finland, Iceland, Faroe Islands, Greenland
- **Auto-generated client and tools** from OpenAPI specifications using Kubb
- **Rate limiting compliance** for different APIs
- **Multi-language support** (English, Swedish, Finnish, etc.)
- **Custom endpoint support** for any PX-Web compatible API

## Supported APIs

- **SCB (Statistics Sweden)**: `api.scb.se/OV0104/v1/doris/`
- **Statistics Finland**: `statfin.stat.fi/PXWeb/api/v1/`
- **Statistics Iceland**: `px.hagstofa.is/px/api/v1/`
- **Statistics Faroe Islands**: `statbank.hagstova.fo/PXWeb/api/v1/`
- **Statbank Greenland**: `bank.stat.gl/api/v1/`
- **Custom endpoints**: Support for any PX-Web compatible API

## Installation

```bash
npm install
npm run generate  # Generate code from OpenAPI specs
npm run build
```

## Development

```bash
# Test the API registry system
npm run demo

# Verify TypeScript compilation
npm run verify

# Development mode
npm run dev

# Generate code from OpenAPI specs
npm run generate
```

## Usage

The server provides 7 generic tools that work across all supported APIs:

### Core Tools

- **`px_discover_apis`** - Find available statistical APIs and their capabilities
- **`px_get_root_navigation`** - Browse the root database structure
- **`px_get_navigation_by_path`** - Navigate to specific database paths
- **`px_search_tables`** - Search for statistical tables with filtering
- **`px_get_table_metadata`** - Get detailed table structure and variables
- **`px_query_table_data`** - Retrieve actual statistical data
- **`px_get_api_config`** - Get API configuration and limits

### Generic API Access

All tools accept an `api_source` parameter to target different APIs:

```typescript
// Query Sweden's statistics
{
  "api_source": "scb",
  "language": "en"
}

// Query Finland's statistics  
{
  "api_source": "statfi",
  "language": "en"
}

// Use a custom PX-Web API
{
  "api_source": "custom",
  "custom_endpoint": "https://your-api.com/PXWeb/api/v1",
  "language": "en"
}
```

## MCP Server Setup

### 1. Start the Server

```bash
# Development mode
npm run mcp:dev

# Production mode
npm run mcp:start
```

### 2. Configure Claude Desktop

See [claude-desktop-config.md](./claude-desktop-config.md) for detailed setup instructions.

### 3. Test the Server

```bash
# Test the API registry system
npm run demo
```

## Example Queries

Once connected to Claude Desktop, you can ask:

- *"What statistical APIs are available?"*
- *"Show me population data from Sweden"*
- *"Find economic indicators in Statistics Finland"*
- *"Get unemployment rates from multiple Nordic countries"*
- *"Compare demographic data between Sweden and Finland"*

## Project Structure

- `src/` - Source code
- `src/generated/` - Auto-generated code from OpenAPI specs  
- `src/tools/` - MCP tool implementations
- `specs/` - OpenAPI specifications
- `scripts/` - Build and maintenance scripts

## Troubleshooting

### TypeScript Compilation Errors

If you encounter TypeScript errors:

1. **Import extension errors**: Run `npm run generate` to regenerate code with fixed imports
2. **Type conflicts**: Clear generated files with `rm -rf src/generated` then `npm run generate`
3. **Build cache issues**: Delete `dist/` folder and run `npm run build`

### MCP Server Issues

1. **Server won't start**: 
   - Check that all dependencies are installed: `npm install`
   - Verify TypeScript compilation: `npm run verify`

2. **Tools not working**:
   - Test individual components: `npm run demo`
   - Check Claude Desktop configuration

3. **API rate limits**:
   - Each statistical agency has different rate limits
   - The server respects these automatically
   - Wait if you encounter rate limit errors

### Manual Testing

You can test individual components:

```bash
# Test the API registry system
npm run demo

# Verify TypeScript compilation 
npm run verify

# Test the build process
npm run build
```
