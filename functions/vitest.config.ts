import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/tiss/**/*.ts'],
      exclude: [
        'src/tiss/index.ts',
        'src/tiss/types.ts',
        'src/**/*.test.ts',
        // Trigger/scheduler files require integration tests
        'src/tiss/glosa-triggers.ts',
        'src/tiss/response-handler.ts',
        'src/tiss/recurso.ts',
      ],
      thresholds: {
        lines: 90,
        functions: 100,
        branches: 80,
        statements: 90,
      },
    },
  },
});
