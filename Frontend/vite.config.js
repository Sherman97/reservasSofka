import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    reporters: [
      'default',
      ['junit', { outputFile: './reports/junit-report.xml' }],
      ['json', { outputFile: './reports/test-results.json' }],
      ['html', { outputDirectory: './reports/html' }],
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'json-summary', 'lcov'],
      reportsDirectory: './reports/coverage',
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.test.*',
        'src/**/*.d.ts',
        'src/main.jsx',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        statements: 40,
        branches: 40,
        functions: 40,
        lines: 40,
      },
    },
  },
})
