/**
 * Test script for Kubb configuration and tool generation
 * Run with: npm run generate && npx tsx src/test-generation.ts
 */

import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import path from 'path';

async function testGeneration() {
  console.log('🧪 Testing Kubb Code Generation\n');

  const generatedDir = './src/generated';

  // Check if generated directory exists
  if (!existsSync(generatedDir)) {
    console.log('❌ Generated directory does not exist');
    console.log('   Run: npm run generate');
    return;
  }

  try {
    // List generated files
    console.log('📁 Generated files:');
    const files = await readdir(generatedDir, { recursive: true });
    
    if (files.length === 0) {
      console.log('   (no files generated)');
    } else {
      files.forEach(file => {
        console.log(`   • ${file}`);
      });
    }

    console.log();

    // Check expected directories
    const expectedDirs = ['types', 'schemas', 'mcp'];
    for (const dir of expectedDirs) {
      const dirPath = path.join(generatedDir, dir);
      if (existsSync(dirPath)) {
        console.log(`✅ ${dir}/ directory exists`);
        const dirFiles = await readdir(dirPath);
        console.log(`   Contains ${dirFiles.length} files`);
      } else {
        console.log(`❌ ${dir}/ directory missing`);
      }
    }

    console.log();

    // Test our generic tools
    console.log('🔧 Testing generic tools:');
    try {
      const { ALL_TOOLS, TOOL_EXECUTORS } = await import('./tools/generic.js');
      console.log(`✅ Generic tools loaded successfully`);
      console.log(`   ${ALL_TOOLS.length} tools available:`);
      ALL_TOOLS.forEach(tool => {
        console.log(`   • ${tool.name}: ${tool.description}`);
      });

      console.log(`\n   ${Object.keys(TOOL_EXECUTORS).length} executors available`);
    } catch (error) {
      console.log(`❌ Failed to load generic tools: ${error}`);
    }

    console.log();

    // Test API registry integration
    console.log('🗂️  Testing API registry integration:');
    try {
      const { PxWeb } = await import('./index.js');
      const apis = PxWeb.listApis();
      console.log(`✅ API registry loaded: ${apis.length} APIs available`);
      
      // Test client creation
      const scbClient = PxWeb.createClient('scb');
      console.log(`✅ SCB client created: ${scbClient.getConfig().name}`);
    } catch (error) {
      console.log(`❌ API registry error: ${error}`);
    }

    console.log('\n✨ Generation test complete!');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Run the test
testGeneration().catch(console.error);
