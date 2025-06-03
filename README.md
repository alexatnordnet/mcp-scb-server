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

# Generate and test Kubb code generation
npm run test-generation

# Development mode
npm run dev
```

## Usage

The server provides generic tools like:
- `px_get_database_list` - List databases from any API
- `px_get_table_metadata` - Get table information
- `px_query_data` - Query statistical data
- `px_search_tables` - Search across APIs

## Project Structure

- `src/` - Source code
- `src/generated/` - Auto-generated code from OpenAPI specs
- `src/tools/` - MCP tool implementations
- `specs/` - OpenAPI specifications
