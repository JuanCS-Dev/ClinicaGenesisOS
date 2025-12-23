import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'functions'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/vitest.setup.ts',
        // Type-only files (no executable code)
        'src/types/tiss/base.ts',
        'src/types/tiss/enums.ts',
        'src/types/tiss/glosas.ts',
        'src/types/tiss/guias.ts',
        'src/types/tiss/lotes.ts',
        'src/types/tiss/operadoras.ts',
        'src/types/tiss/reports.ts',
        'src/types/tiss/service.ts',
        'src/types/prescription.ts',
        // Re-export index files
        'src/design-system/components/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
