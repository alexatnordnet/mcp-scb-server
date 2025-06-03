/**
 * Demo script to test the PX-Web API Registry System
 * Run with: npx tsx src/demo.ts
 */

import { PxWeb } from './index.js';

async function demo() {
  console.log('🚀 PX-Web API Registry System Demo\n');

  // 1. List all available APIs
  console.log('📋 Available APIs:');
  const apis = PxWeb.listApis();
  apis.forEach(api => {
    console.log(`  • ${api.name} (${api.id}) - ${api.country}`);
    console.log(`    Languages: ${api.languages.join(', ')}`);
    console.log(`    ${api.description}\n`);
  });

  // 2. Search APIs
  console.log('🔍 Search results for "sweden":');
  const swedenApis = PxWeb.searchApis('sweden');
  swedenApis.forEach(api => {
    console.log(`  • ${api.name} - ${api.baseUrl}`);
  });
  console.log();

  // 3. Get APIs by language
  console.log('🗣️  APIs supporting English:');
  const englishApis = PxWeb.getApisByLanguage('en');
  englishApis.forEach(api => {
    console.log(`  • ${api.name} (${api.country})`);
  });
  console.log();

  // 4. Get detailed info about SCB
  console.log('ℹ️  Detailed info about SCB:');
  const scbInfo = PxWeb.getApiInfo('scb');
  if (scbInfo) {
    console.log(`  Name: ${scbInfo.name}`);
    console.log(`  URL: ${scbInfo.baseUrl}`);
    console.log(`  Rate limit: ${scbInfo.rateLimit.calls} calls per ${scbInfo.rateLimit.period/1000}s`);
    console.log(`  Max values: ${scbInfo.metadata?.maxValues}`);
    console.log(`  Example: ${scbInfo.exampleUsage}`);
  }
  console.log();

  // 5. Test client creation (without making actual requests)
  console.log('🔧 Testing client creation:');
  try {
    const scbClient = PxWeb.createClient('scb');
    console.log(`  ✅ SCB client created successfully`);
    console.log(`     API: ${scbClient.getConfig().name}`);
    console.log(`     Base URL: ${scbClient.getConfig().baseUrl}`);

    const customClient = PxWeb.createCustomClient('https://example.com/api', {
      name: 'Test API',
      languages: ['en', 'de']
    });
    console.log(`  ✅ Custom client created successfully`);
    console.log(`     API: ${customClient.getConfig().name}`);
  } catch (error) {
    console.log(`  ❌ Client creation failed: ${error}`);
  }

  console.log('\n✨ API Registry System is working correctly!');
  console.log('\nNext step: Generate MCP tools using Kubb');
}

// Run the demo
demo().catch(console.error);
