import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginZod } from '@kubb/plugin-zod';

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
  ],
  hooks: {
    done: ['node scripts/fix-imports.js', 'npm run build:types'],
  },
});
