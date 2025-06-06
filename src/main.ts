#!/usr/bin/env node

/**
 * Main entry point for the PX-Web MCP Server
 * This file starts the MCP server and handles graceful shutdown
 */

import { createAndStartServer } from './server.js';

async function main() {
  try {
    console.error('🚀 Starting PX-Web MCP Server...');
    
    // Create and start the server
    const server = await createAndStartServer();
    
    console.error('✅ Server started successfully');
    console.error('📡 Listening for MCP protocol messages...');
    
    // Keep the process alive
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
